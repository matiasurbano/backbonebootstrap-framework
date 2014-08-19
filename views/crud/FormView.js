/*globals define, app*/

define( [
    'jquery', 'lodash',
    'src/views/crud/ModelView',
    'text!./form.html',
    'src/utils/html'
  ], function(
    $, _,
    ModelView,
    formTemplate,
    html
  ) {

'use strict';

/**
 * FormView renders a list of controls bound to a model's field list, in order
 * to create or update the model.
 *
 * When entering criteria no validations are applied, and every field is
 * treated as a text field.
 *
 * It takes a collection as parameter. By default it will instantiate a new
 * model of that collection and bind it to the view.
 *
 * When the user clicks on query, it will call the controller's list method
 * passing the attributes of the controls as parameter.
 *
 * @class QueryView
 * @extends ModelView
 */
var FormView = ModelView.extend({

  resource: undefined,

  title: '',

  initialize: function(options) {
    options = options || {};

    _.defaults(this, options);

    _.bindAll(this, 'save', 'cancel', 'del');

    ModelView.prototype.initialize.call(this, options);

    this.setCustomActions(options.customActions);

    // set the template container
    this.containerTemplate = this.template || formTemplate;

    this.resource = this.resource || this.controller.resource || undefined;
    if (this.resource) this.resource = this.resource.toLowerCase();

    this.addBtnHidden = options.addBtnHidden || undefined;

    this.listenTo(this.controller,'mode:change', this.onControllerModeChange);
  },

  /**
   * Configures additional custom actions
   *
   * The formview allows to specify a set of aditional custom actions that will
   * be available when editing the record.
   *
   * These actions will appear in a drop-down button with the label
   * 'more actions' on it.
   *
   * To specify custom actions you have to pass an array with the following
   * structure to the view contructor:
   *
   * var MyFormView = FormView.extend({
   *   customActions: 
[   *     { label: 'My custom action', icon: 'globe', callback: my_function }
   *   ]
   * });
   *
   * You can also specify it on a CrudController constructor, it will be passed
   * along to the FormView view.
   *
   * For each custom action defined, a new item will appear in the drop-dowm
   * button, and an event will be added to te events object of the view.
   *
   * @param  {Array<Object?}  actions Array of additional custom actions
   * @return {FormView}       for method chaining
   */
  setCustomActions: function(actions) {

    actions = actions || [];
    this.customActions = [];

    _.each(actions, function(action) {
      var label = action.label || '';
      action = {
        label:     label,
        // get rid of characters in the label that might cause troubles
        id:        label.replace(/[^a-zA-Z]/g, '_'),
        icon:      action.icon || '',
        callback:  action.callback || undefined
      };

      if (!action.label) throw new Error('label for custom action not specified');
      if (!action.callback) throw new Error('callback for custom action not specified');

      this.customActions.push(action);

      // bind an event to each custom action
      var eventKey      = 'click div.customActions a.' + action.id,
          eventCallback = action.callback;

      this.events[eventKey] = eventCallback;
    }, this);

    return this;
  },

  onControllerModeChange: function(mode, prevMode){
    this.show( _.contains('create,delete,update'.split(','),mode));
  },
  /**
   * Enable or disable action buttons and input textboxes according to the
   * user's permission.
   *
   * @chainable
   */
  setPermissions: function() {
    var canEdit       = true,
        canDel        = true,
        isNew         = (this.controller.mode === 'create'),
        editOperation = (isNew ? 'alta' : 'modificacion'),
        delOperation  = 'baja';

    // canEdit
    if (this.resource) {
      canEdit = app.user.can(this.resource, editOperation);
      html.enable(this.$('.btn.save'), canEdit);
      // if (!canEdit) _.invoke(this.controls, 'disable');
    }

    // Form could be disable by resources or through the controller.
    if (!canEdit || this.controller.readOnly) {
      
      var controls = this.controls;
      _.invoke(this.controls, 'disable');
      _.each(this.controller.editableFields,function(field){
        controls[field]['enable']();
      });
    }

    // canDel
    if (isNew) {
      canDel = false;
    } else if (this.resource) {
      canDel = app.user.can(this.resource, delOperation);
    }
    html.enable(this.$('.btn.delete'), canDel);

    return this;
  },

  /**
   * Bind the specified model to the fields and controls collection.
   *
   * It also listens to any validate event from the model to display errors not
   * related with any field (unbound errors).
   *
   * @param {BaseModel} model Model to set as the datasource for controls.
   *
   * @override
   * @chainable
   */
  setModel: function(model) {

    // unbind validate event
    if (this.model) this.stopListening(this.model);

    // use the fields from model.formFields if not specified
    if (model && !this.fields) this.fields = model.formFields;

    // super.setModel
    ModelView.prototype.setModel.call(this, model);

    if (this.model) {
      // bind to validate model event for showing errors not related with a field
      this.listenTo(this.model, 'validate', this.renderUnboundErrors);
      this.title = this.title || this.model.label;
    }

    return this;
  },

  /**
   * Renders the form view. It also calls this.setPermission to enable and
   * disable the form controls according to the user's permission.
   *
   * @override
   * @chainable
   */
  render: function() {

    var templateData = {
      _title        : this.title,
      _addBtnHidden : this.addBtnHidden,
      customActions : this.customActions
    };

    //super.render,
    // passing the title and customActions as aditional data
    ModelView.prototype.render.call(this, templateData);

     // enable/disable elements according to the user's permission
    this.setPermissions();

    // trigger render event
    this.trigger('FormView:render');
    return this;
  },

  /**
   * Renders errors not related with any control in the controls array.
   *
   * Every field triggers validate events on each field modification. Each
   * control is listening in order to display that error in line, right next
   * to the control.
   *
   * Nevertheless there are some errors (unbound errors) that are not associated
   * with any field or that are associated with fields that are not present in
   * the form.
   *
   * This method makes sure that every error is displayed, even if there's no
   * field related with it.
   *
   * It just looks for the model.errors collection, and for every error for
   * which no related field is found in this.fields, an error message is
   * displayed.
   *
   * @chainable
   */
  renderUnboundErrors: function() {

    // render every error for which there's no control associated
    _.each(this.model.errors, function(error) {

      // look for a control associated with that field
      var control = _.find(this.controls, function(control) {
        return control.field.name === error.field;
      }, this);

      if (!control) {
        // if there's a field specified, add it to the error description
        if (error.field) error.message = error.message + ' (campo "' + error.field + '")';
        this.controller.error(error.message);
      }

    }, this);
    return this;
  },

  events: {
    'click button.save'   : 'save',
    'click button.cancel' : 'cancel',
    'click button.delete' : 'del'
  },

  /**
   * Enables or disables the action buttons of the form.
   *
   * @param  {Boolean} value Indicates if controls should be enabled or disabled
   *
   * @chainable
   */
  enable: function(value) {
    html.enable(this.$('.btn.save'), value);
    html.enable(this.$('.btn.cancel'), value);
    html.enable(this.$('.btn.delete'), value);
    html.enable(this.$('.btn.dropdown-toggle'), value);
    return this;
  },

  /**
   * Disables the action buttons of the form.
   *
   * @chainable
   */
  disable: function() {
    this.enable(false);
    return this;
  },


  /**
   * Call controller's save action
   *
   * @chainable
   */
  save: function() {
    this.controller.save();
    return this;
  },

  /**
   * Cancel the edition and call the controller's list action.
   *
   * @chainable
   */
  cancel: function() {
    this.controller.list();
    return this;
  },

  /**
   * Call controller's del action passing the id of the current model as
   * parameter
   *
   * @chainable
   */
  del: function() {
    this.controller.del(this.model.id);
    return this;
  }

});

  return FormView;
});
