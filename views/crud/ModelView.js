/*globals define, document*/

define( [
    'lodash', 'jquery', 'bootstrap',
    'src/views/BaseView', 'src/controls/BaseControl',
    'text!./group.html', 'text!./groups.html',
    'src/utils/models/FieldCollection',
    'src/utils/array'
  ], function(
    _, $, bootstrap,
    BaseView, BaseControl,
    groupTemplateSource, groupsTemplateSource,
    FieldCollection,
    array
  ) {

'use strict';

/**
 * ModelView renders a list of controls bound to a model's field list.
 *
 * By default, ModelView will get the fields list from model.fields, and the
 * controls list from the controls associated with each field. You can
 * overwrite these values passing fields or controls to the constructor or
 * calling setFields or setControls.
 *
 * @class ModelView
 * @extends BaseView
 */
var ModelView = BaseView.extend({

  /**
   * @property {BaseModel} model The model to use as source for the controls.
   */
  model    : undefined,

  /**
   * @property {FieldCollection} fields The fields to use as source for
   *                                    the controls.
   */
  fields   : undefined,

  /**
   * @property {Array<BaseControl>} controls The collection of controls to
   *                                         render.
   */
  controls : undefined,

  /**
   * @property {Boolean} groupControls True id controls should be grouped
   *                                   together according to field.group
   *                                   property
   */
  groupControls : undefined,

  /**
   * @property {string\function(object)} template Template with placeholders for
   *                                              the controls.
   *
   * The template should have placeholders for each control. Each placeholder
   * will then be replaced by the result of rendering the control. The
   * placeholder should have as id the fullName of the field, like this example:
   *
   *   <h3>Invoice information</h3>
   *   <div id='invoiceId' />
   *   <div id='date' />
   *   <div id='amount' />
   *
   *   <h3>Select a customer</h3>
   *   <div id='customer.customerId' />
   *
   * If no template is specified, a default one will be created with a
   * placeholder for each control.
   */
  template : undefined,

  /**
   * @property {string\function(object)} containerTemplate Template wrapper
   * around to display information around the controls template.
   *
   * The container template is just a wrapper around the template. It should
   * contain a '%controls' like this example:
   *
   * <h2>Edit invoice information</h2>
   * %controls%
   *
   * <div class='tip'>Click on save or cancel to finish edition</div>
   *
   * If no template is specified, a default one will be created with just a
   * '%controls%' placeholder.
   */
  containerTemplate: undefined,

  initialize: function(options) {
    options = options || {};

    _.defaults(this, options);

    BaseView.prototype.initialize.call(this, options);

    this.template = options.template || undefined;

    this.controls = this.controls || [];

    if (this.model) this.setModel(this.model);

    this.setFields(this.fields);

    // by default, in QueryView we won't group controls
    this.groupControls = this.groupControls === undefined ? true : this.groupControls;

    this.title = options.title || this.title || undefined;

    if (this.template) this.template = this.compileTemplate(this.template);

    if (!this.containerTemplate) this.containerTemplate = '%controls%';
  },

  /**
   * Set the model to use for this view.
   *
   * By default, it will take the fields collection from the model to use for
   * the view.
   *
   * It will call call setFields and setControls to bind everything to the
   * model.
   *
   * @param {src.BaseModel} model Model instance to use for rendering the view.
   *
   * @chainable
   */
  setModel: function(model) {
    this.model = model;
    if (this.model) {

      // use the fields from model.fields if not specified
      //if (!this.fields || this.fields.length === 0) this.fields = this.model.fields;
      // TODO: check: Puedo no querer filtrar campos
      if (!this.fields) this.fields = this.model.fields;

      // bind model to the fields, it will also bind the fields to the model
      if (this.fields) this.setFields(this.fields);
    }
    return this;
  },

  clearModel: function() {
    this.setModel(undefined);
    this.setFields(undefined);
    this.setControls(undefined);
    return this;
  },

  resetModel: function(model) {
    return this.clearModel().setModel(model);
  },

  /**
   * Set the fields collection to use for this view.
   *
   * It will bind each field to the current model.
   *
   * By default, it will take the controls from the field collection to use for
   * the view.
   *
   * It will call setControls bind everything to the model.
   *
   * @param {Array<src.Field>\Array<Object>|FieldCollection} fields
   *              Fields to use for this view.
   *
   * @chainable
   */
  setFields: function(fields) {
    if (!fields) {
      this.fields = undefined;
      return this;
    }

    if (!this.fields instanceof FieldCollection) {
      this.fields = new FieldCollection(fields);
    }

    // bind model to the fields, it will also bind each field to the model
    if (this.model) this.model.setFields(this.fields);

    // by default, assign controls from fields
    var controls = this.controls.length === 0 ?
      this.fields.controls() : this.controls;

    this.setControls(controls);

    return this;
  },

  /**
   * Set the controls collection to use for this view.
   *
   * It will bind each control to the corresponding field.
   *
   * Each control can be either an instance of BaseControl or a string with the
   * name of a field. In this case, it will be used the control associated with
   * that field.
   *
   * Finally it will add each control as a subview of this view.
   *
   * @param {Array<src.BaseControl|string>} controls
   *              Controls to use for this view.
   *
   * @chainable
   */
  setControls: function(controls) {

    // clone controls, we don't want to overwrite this.controls when rebinding it
    controls = _.clone(controls);

    // first remove every control
    var controlNames = _.map(this.controls, function(control) {
      return control.field.name;
    });
    _.each(controlNames, function(controlName) {
      this.removeControl(controlName);
    }, this);

    this.controls = [];     // just make sure we start clean
    if (!controls || controls.length === 0) return this;

    _.each(controls, function(control) {
      this.addControl(control);
    }, this);

    return this;
  },

  /**
   * Adds a control to use for this view.
   *
   * It will add the control to this.controls and will also bind each it to the
   * corresponding field.
   *
   * Control can be either an instance of BaseControl or a string with the
   * name of a field. In this case, it will be used the control associated with
   * that field.
   *
   * Finally it will add each control as a subview of this view and also as a
   * property of this.controls to access it by field name.
   *
   * @param {src.BaseControl|string} control Control to add to this view.
   *
   * @chainable
   */
  addControl: function(control) {

    if (!control instanceof BaseControl && !_.isString(control)) {
      throw new Error('control should be an instance of BaseControl or a string with the field name');
    }

    // try to find a field with the name of the control
    if (_.isString(control)) {
      var field = this.fields.findByName(control);
      if (!field) throw new Error('could not find a field with name "' + control + '".');
      control = field.control;
    }

    var fieldName = control.field.name;

    // remove any previous control with the same field name  #### TEST IT!!
    if (this.controls[fieldName]) this.removeControl(fieldName);

    // rebind control to corresponding field
    // control.field = _.findWhere(this.fields, { name: control.field.name });
    control.setField(this.fields.findByName(fieldName));
    if (!control.field) throw new Error('could not bind control to field "' + fieldName + '".');

    this.controls.push(control);
    // add property access like shortcut to the control
    this.controls[fieldName] = control;
    // add the control as a sub view
    this.addView(control);

    return this;
  },

  /**
   * Removes the specified controls from this.controls collection
   * and destroys the control
   *
   * @param  {Control|String} control The control reference or the name of the control
   * @return {ModelView}         returns a reference to this for chaining calls
   *
   * @chainable
   */
  removeControl: function(control) {
    var controlName = _.isObject(control) ? control.field.name : control;

    var currentControl = this.controls[controlName];

    if (!currentControl) throw new Error('could not find control with name "' + controlName + '".');

    // clean up the control view
    // currentControl.destroy();

    array.delByValue(this.controls, currentControl);
    delete this.controls[controlName];

    return this;
  },

  // add helper method to locate a control by it's field name
  controlByFieldName: function(name) {
    if (!this.controls) return null;
    return _.find(this.controls, function(control) {
      return control.field.name === name;
    });
  },

  /**
   * It ensures that we have a valid template before rendering.
   *
   * If a template is specified, it should create placeholders for each control.
   *
   * Otherwise, a default template will be dinamycally created using
   * containerTemplate and the array of controls.
   *
   * @chainable
   */
  loadTemplate: function() {

    // template has been specified
    // make sure that it's a function
    if (this.template) {
      this.template = this.compileTemplate(this.template);
      return this;
    }

    // template not specified,
    // dynamically generate a default template to allocate every control
    var controlsTemplateSrc = '',
        templateSrc;

    controlsTemplateSrc = this.buildTemplate(this.controls);

    templateSrc = this.containerTemplate.replace('%controls%', controlsTemplateSrc);

    this.template = this.compileTemplate(templateSrc);

    return this;
  },

  /**
   * Renders a placeholder div for each control
   * @param  {Array<BaseControl>} controls Array of controls to build the
   *                                       template.
   * @return {String}                      The generated template.
   */
  controlsTemplate: function(controls) {
    return _.reduce(controls, function(memo, control) {
      return memo + '<div id="' + control.field.fullName + '" />\n';
    }, '', this);
  },

  /**
   * Renders a placeholder div for each control.
   *
   * The controls are grouped inside a div with divClass class depending on the span value.
   *
   * This is used to create a 'row' div to force the controls to be rendered on the same row
   * and to prevent error messages from braking the form layout.
   *
   * @param  {Array<BaseControl>} controls Array of controls to build the
   *                                       template.
   *
   * @param  {String} divClass    Class to apply to the div. 'row' by default.
   *
   * @param  {Number} maxSpan     When the acumulated spans surpases maxSpan it will create a new row.
   *                              By default we will take the value 10.
   *
   * @return {String}             The generated template.
   */
  controlsTemplateByRow: function(controls, divClass, maxSpan) {

    var rows = [],
        acumSpan = 0,
        html = '';

    divClass = divClass || 'row';
    maxSpan = maxSpan || 10;

    // group by rows
    _.each(controls, function(control) {
      if (acumSpan + control.span > maxSpan) {
        rows.push(html);
        html = '';
        acumSpan = 0;
      }
      html += '<div id="' + control.field.fullName + '" />\n';
      acumSpan += control.span;
    });       

    rows.push(html);

    // process each row
    return _.reduce(rows, function(memo, row) {
      return memo + 
        '<div class="' + divClass + '">\n' + row + '</div>\n';
    }, '', this);

  },

  /**
   * Process controls and render them according to groups
   * @param  {[type]} controls [description]
   * @return {[type]}          [description]
   */
  buildTemplate: function(controls) {
    var grouped, ungrouped,
        ungroupedControls = [],
        groups,
        groupTemplate, groupsTemplate,
        parent = 'accordionForm',
        index, collapsed,
        templateData;

    if (!this.groupControls) return this.controlsTemplate(controls);

    // get an array of ungrouped controls
    // and an array of grouped controls
    groups = {};
    _.each(controls, function(control) {
      var groupName = control.field.group || '';
      if (groupName) {
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(control);
      } else {
        ungroupedControls.push(control);
      }
    });

    // generate the template for ungrouped controls
    // ungrouped = this.controlsTemplate(ungroupedControls);
    ungrouped = this.controlsTemplateByRow(ungroupedControls, 'row');

    // generate the template for grouped controls
    index = 1;
    grouped = '';
    groupTemplate = this.compileTemplate(groupTemplateSource);
    collapsed = false;   // by default, only first item uncollapsed
    // render each group
    _.each(groups, function(controls, groupName) {
      var data = {
        parent    : parent,
        title     : groupName,
        groupId   : 'collapse' + index++,
        content   : this.controlsTemplateByRow(controls, 'row'),
        collapsed : collapsed
      };
      if (!collapsed) collapsed = true;
      grouped += groupTemplate(data);
    }, this);

    // render the groups container
    groupsTemplate = this.compileTemplate(groupsTemplateSource);
    templateData = {
      ungrouped : ungrouped,
      grouped   : grouped,
      parent    : parent
    };

    return groupsTemplate(templateData);
  },

  /*
  // TODO: #bug - this is not working
  events: {
    'show .accordion': 'collapsePanelGroup',
    'hide .accordion': 'collapsePanelGroup'
  },
  */

  /**
   * Renders the ModelView template. The template will receive the model
   * attributes as data. It accepts an optional templateData parameter with
   * in order to supply aditional data to pass to the template.
   *
   * @param  {Object} templateData Aditional data to pass to the template.
   *
   * It will render the template and then call this.renderControls to attach
   * and render each control.
   *
   * @chainable
   */
  render: function(templateData) {

    // allow to overwrite and pass aditional data for rendering
    var data = _.extend(this.model.toJSON(), templateData || {});

    // make sure we have a template ready
    this.loadTemplate();

    // render template
    this.$el.html(this.template(data));

    // attach to dom and render controls
    this.renderControls();

    // TODO: find a better way to do it
    // this.$('.accordion').on('show hide', this.collapsePanelGroup);
    // check: https://github.com/documentcloud/backbone/issues/2349#issuecomment-14624219
    this.delegateEvents(_.extend(this.events, {
      'show .accordion': 'collapsePanelGroup',
      'hide .accordion': 'collapsePanelGroup'
    }));

    this._popoverInit();

    return this;
  },

  /**
   * Toggles the group chevron-icon indicator according to the group visibility.
   *
   * @param  {Event} e The click event on the accordion element.
   */
  collapsePanelGroup: function(e) {
    // console.log($(e.target).siblings('.accordion-heading'));
    $(e.target)
      .siblings('.accordion-heading')
      .find('.accordion-toggle i')
      .toggleClass('icon-chevron-down icon-chevron-up', 200);
  },

  /**
   * Destroy each control and calls super.DestroyViews.
   *
   * @override
   * @chainable
   */
  destroyViews: function() {
    _.each(this.controls, function(control) {
      control.destroy();
    }, this);
    return BaseView.prototype.destroyViews.call(this);
  },

  /**
   * Shows the current view and sets focus to the first visible control.
   *
   * @override
   * @chainable
   */
  show: function() {
    BaseView.prototype.show.apply(this, arguments);
    this.focusFirst();
    return this;
  },

  /**
   * Sets focus to the first editable control in controls collection.
   *
   * @chainable
   */
  focusFirst: function() {
    var firstEditable = _.findWhere(this.controls, { editable: true });
    if (firstEditable) firstEditable.focus();
    return this;
  },

  /**
   * Attaches and renders every control in the controls array, calling
   * this.renderControl for each control.
   *
   * @return {this}   returns a reference to this to chain actions
   *
   * @chainable
   */
  renderControls: function() {
    _.each(this.controls, function(control) {
      this.renderControl(control);
    }, this);
    return this;
  },

  /**
   * Attaches and renders a control to the current view.
   *
   * First it attempts to attach the control to a placeholder in the dom.
   * The fully qualified name of the control should be the id of each
   * placeholder.
   *
   * If no dom element is found it raises an error.
   *
   * Then it initializes the control and renders it.
   *
   * @return {this}   returns a reference to this to chain actions.
   *
   * @chainable
   */
  renderControl: function(control) {
    var name = control.field.fullName,
        $el = this.$byId('#' + name);
    if ($el.length === 0) throw new Error('could not render control. Placeholder with id "' + name + '" not found.');

    control.el = $el;
    control.controller = this.controller;
    control.view = this;
    control.init();
    control.render();
    return this;
  },

  _popoverInit: function() {
    var isPopoverVisible = false,
        clickedOnPopover = false,
        onPopoverClick,
        onDocumentClick;

    // show popover
    // set flags: popover is visible, last click was on popover
    onPopoverClick = function(e) {
      $(this).popover('show');
      isPopoverVisible = clickedOnPopover = true;
      //e.preventDefault();
    };

    onDocumentClick = function(e) {
      // hide popover if it's visible and user clicked outside of a popover
      if (isPopoverVisible && !clickedOnPopover) {
        $('[rel=popover]').each(function() {
          $(this).popover('hide');
        });
        isPopoverVisible = clickedOnPopover = false;
      } else {
        clickedOnPopover = false;
      }
    };

     this.$('[rel=popover]').each(function() {
        $(this).popover({
            html    : true,
            trigger : 'manual',
            placement : 'left'
        }).click(onPopoverClick);
    });

    $(document).click(onDocumentClick);

  }

});

  return ModelView;
});
