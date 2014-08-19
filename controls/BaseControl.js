/*globals define*/

define( [
    'jquery', 'lodash', 'backbone', //'require',
    'src/views/BaseView',
    // 'src/utils/models/Field',   // avoid recursive dependency
    'src/utils/html',
    'text!./control-container.html'
  ], function(
    $, _, Backbone, //require,
    BaseView,
    // Field,
    html,
    controlContainerTemplate
  ){

'use strict';

var BaseControl = BaseView.extend({

  supportedTypes: [],

  $input: undefined,

  previousVal: undefined,

  initialize: function(options) {

    options = options || {};

    // _.defaults(this, options);
    _.extend(this, options);

    _.bindAll(this, 'renderErrors');

    BaseView.prototype.initialize.call(this, options);

    if (!this.type) throw new Error('control.type type not specified!');
    this.type = this.type.toLowerCase();

    this.setField(this.field);
    if (!this.field) throw new Error('control.field not specified!');

    this.editable = this.field.editable;
    if (!_.isBoolean(this.editable)) throw new Error('control.editable should be a boolen!');

    this.help = this.help || '';

    this.label = this.label === undefined ? this.field.label : this.label;

    var supportedTypes = BaseControl.prototype.supportedTypes;
    if (!_.contains(supportedTypes, this.type)) {
      throw new Error('control.type "' + this.type + '" not supported, supported types: ' + supportedTypes);
    }

    this.span = this.span || this.field.span || '';

    // by default, no container
    this.containerTemplate = this.containerTemplate || controlContainerTemplate;
    if (!this.containerTemplate) this.containerTemplate = '%control%';

    if (!this.controlTemplate && !this.template) throw new Error('No control.controlTemplate nor control.template defined!');

    if (this.template)  this.template = this.compileTemplate(this.template);
    else                this.compileControlTemplate();

  },

  events: {
    'keyup    :input' : 'onKeyUp',
    'focus    :input' : 'onFocusControl',
    'blur     :input' : 'onUpdateControl',
    'change   :input' : 'onUpdateControl'
  },

  setField: function(field) {
    if (this.field) this.stopListening(this.field);

    if (field) {
      if (!_.isObject(field)) throw new Error('field should be an instance of Field');

      this.field = field;
      this.listenTo(this.field, 'validate', this.renderErrors);
    }
    return this;
  },

  onFocusControl: function(e) {
    this.previousVal = this.val();
    // console.log('onFocusControl!, this.previousVal: ' + this.previousVal);
    if (this.onFocus) return this.onFocus(e);
    return this;
  },

  /**
   * Handler to be called whenever the control receives focus
   *
   * Should be overwritten.
   *
   * @param  {Event} e    Onfocus event
   * @return {Boolean}    [description]
   */
  onFocus: function(e) {
    return true;
  },

  onBlur: function(e) {
    return true;
  },

  onChange: function(e) {
    return true;
  },

  afterChange: function(e) {
    return true;
  },

  onKeyUp: function(e) {
    return true;
  },

  /**
   * Process the blur and change event of the control.
   *
   * It updates the value of the underlaying field and triggers field
   * validation.
   *
   * If it's a new record, only process it on blur. If we are editing an exiting
   * record only process it on change. (The idea es that when creating a new
   * record, errors will only be displayed if the user leaves the field without
   * entering a valid value).
   *
   * You can override this behaviour using the forceUpdate argument. If
   * forceUpdate is true, the field will be updated without cheking the status
   * of the record or the triggering event.
   *
   * @param  {Event} e             The event fired by the control
   * @param  {Boolean} forceUpdate Update the field no matter the event that
   *                               triggered the update.
   * @return {Boolean}   [description]
   */
  onUpdateControl: function(e, forceUpdate) {

    var field   = this.field,
        isNew   = this.field.model.isNew(),
        id      = '#' + field.fullName,
        control;

    // process onChange event and cancel edition if it returns false
    if (e.type === 'change' && this.onChange && this.onChange(e) === false) return false;

    // process onBlur event and cancel edition if it returns false
    if (e.type === 'focusout' && this.onBlur && this.onBlur(e) === false) return false;

    forceUpdate = (forceUpdate === undefined ? false : forceUpdate);

    if (!forceUpdate) {
      // new record -> only process blur (lost focus) event
      if (isNew && e.type !== 'focusout') return false;

      // existing record -> only process change event
      if (!isNew && e.type !== 'change') return false;
    }

    control = this.$byId(id);
    if (control.length === 0) throw new Error('could not find control with id "' + id + '".');

    // this will automatically trigger the validation
    field.formattedVal(control.val(), {validate: true});
    // and now, update the control, just in case the value of the field changed
    control.val(field.formattedVal());

    // check if we have an afterChanged handler
    this.previousVal = this.currentVal;
    this.currentVal = control.val();
    if (this.afterChange && this.previousVal !== this.currentVal) {
      this.afterChange(this.currentVal, this.previousVal);
    }

    // this.previousVal = currentVal;
    return true;
  },

  render: function() {
    if (!this.el) throw new Error('can not render control. el not specified');

    this.$el = $(this.el);
    if (this.$el.length === 0) throw new Error('can not render control, could not find placeholder for control');

    this.onRender();

    // add data for rendering
    this.spanClass = this.span ? 'span' + this.field.span : '';
    this.disabled = this.editable ? '' : 'disabled';
    this.value = this.field.formattedVal();

    // var $control = $(this.template(this.model.attributes));
    var $control = $(this.template(this));

    this.$el.replaceWith($control);

    // call view.setElement to re-delegateEvents to view.$el
    this.setElement($control);

    this.$input = this.$byId('#' + this.field.fullName);

    // initially, currentVal and previousVal are equal
    this.previousVal = this.val();
    this.currentVal = this.previousVal;

    this.renderErrors();

    this.afterRender();

    return this;
  },

  renderErrors: function() {
    var $container = this.$el,
        $error = $container.find('ul.errors-container');

    if (this.$input.length === 0) {
      throw new Error('control with id "' + this.field.fullName + '" not found.');
    }
    this.renderHtmlErrors(this.field, $container, this.$input, $error);
    return this;
  },

  renderHtmlErrors: function(field, $container, $input, $error) {
    if (field.isValid()) {
      $input.removeAttr('error');
      $container.removeClass('error');
      $error.html('');
    } else {
      $container.addClass('error');
      $input.attr('error', 'true');
      $error.html('');
      // for each error for this particular field
      _.each(field.errors, function(error) {
        $error.append('<li>' + error.message + '</li>');
      }, this);
      this.showGroup($container);
    }
    return this;
  },

  /**
   * Makes sure that the group containing the control is visible.
   *
   * Used when a field has an error, so that the user can see the field and
   * the corresponding error message.
   *
   * A field with error has the following structure:
   *
   * <div class="accordion-group">
   *   <div class="whead accordion-heading">
   *   [...]
   *   </div>
   *   <div id="collapse1" class="accordion-body collapse in">
   *     <div class="accordion-inner">
   *       <div class="span3 error">
   *         <label class="control-label" for="Code">Code</label>
   *         <input type="text" class="span3" id="Code" value="" error="true">
   *         <ul>
   *           <li>The field "Code" cannot be empty.</li>
   *         </ul>
   *       </div>
   *     </div>
   *   </div>
   * </div>
   *
   * In this example container is the div with the span3 class. This method
   * checks that the parent has an accordion-inner attribute and that it's
   * parent has a accordion-body class.
   * If the accordion-body is missing a 'in' attribute it means it's not
   * visible, in which case it expands it.
   *
   * @param  {dom element} templateData Aditional data to pass to the template.
   *
   * It will render the template and then call this.renderControls to attach
   * and render each control.
   *
   * @chainable
   */
  showGroup: function($container) {
    var $accordionInner = $($container).parent(),
        $accordionBody  = $accordionInner.parent();

    // check if the control is inside a group
    // and the group is not visible
    if ($accordionInner.hasClass('accordion-inner') &&
        $accordionBody.hasClass('accordion-body') &&
        !$accordionBody.hasClass('in') ) {

        $accordionBody.collapse('show');
    }
    return this;
  },

  focus: function() {
    var $input = this.$input;
    if ($input.length > 0) {
      $input = $input[0];
      if ($input.focus) {
        $input.focus();
        if ($input.select) $input.select();
      }
    }
    return this;
  },

  compileControlTemplate: function() {
    // the meta template with the container and the control
    this.templateSrc = this.containerTemplate.replace(
      '%control%', this.controlTemplate
    );
    this.template = this.compileTemplate(this.templateSrc);
  },

  addSupportedType: function(type) {
    if (_.contains(BaseControl.prototype.supportedTypes, type)) return this;
    BaseControl.prototype.supportedTypes.push(type.toLowerCase());
  },

  // put any needed initialization code here
  // return a reference to this for method chaining
  init: function() {
    return this;
  },

  // put any needed cleanup code here
  // return a reference to this for method chaining
  // Don't forget to call super.destroy to clean up everything
  destroy: function() {
    return BaseView.prototype.destroy.apply(this, arguments);
  },

  disable: function() {
    if (this.$input.length > 0) {
      html.disable(this.$input);
      this.editable = false;
    }
    return this;
  },

  enable: function(value) {
    if (value === false) return this.disable();
    if (this.$input.length > 0 && this.field.editable) {
      html.enable(this.$input);
      this.editable = true;
    }
    return this;
  },

  /**
   * The value of the html input control associated with this control.
   *
   * Control.value holds the value of the underlying field, and it's set when
   * the control is rendered.
   *
   * On the contrary, the val() method retrieves the current value of the html
   * control.
   *
   * This method is a shorthand for this.$input.val().
   *
   * @param  {String} value               New value to set.
   * @return {String|Number|Array}        The current value of the html input.
   *
   * See
   *
   * - (Jquery.val)[api.jquery.com/val]
   *
   */
  val: function(value) {
    if (!this.$input) throw new Error('No html control is associated with this control');
    if (value === undefined) return this.$input.val();
    return this.$input.val(value);
  }

});

// give the object the ability to bind and trigger custom named events.
_.extend(BaseControl.prototype, Backbone.Events);

  return BaseControl;
});
