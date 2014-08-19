/*globals define*/

define( [
    'lodash', 'backbone',
    'src/utils/object'
  ], function(
    _, Backbone,
    object
  ) {

'use strict';

var BaseView = Backbone.View.extend({

  initialize: function(options) {

    options = options || {};

    var defaults = {
      template   : undefined,         // template to use to display this view
      controller : undefined          // controller in charge of this view
    };

    this.name = this.name || this.cid;

    this.initOptions(options, defaults);

    this.views = [];

    Backbone.View.prototype.initialize.call(this, options);

    // #TODO - see how to keep this validation
    // if (!this.controller) throw new Error('View.controller not specified!');

  },

  destroy: function(options) {
    options = options || {};
    options.remove = options.remove === undefined ? true : options.remove;

    this.destroyViews();
    this.undelegateEvents();
    this.stopListening();
    if (options.remove) this.remove();
    this.off();      // formerly known as unbind
    return this;
  },

  destroyViews: function() {
    //- call destroy method for each view
    _.invoke(this.views, 'destroy');
    delete this.views; // or this.views = null
    this.views = [];
    return this;
  },

  addView: function(view) {
    this.views.push(view);
    return this;
  },

  addViews: function(views) {
    if (!_.isArray(views)) views = [views];
    _.each(views, function(view){
      this.addView(view);
    }, this);
    return this;
  },

  show: function(visible) {
    visible = (visible===undefined) ? true : visible;
    if (!this.$el) return this;

    if (visible) this.$el.show();
    else this.$el.hide();

    return this;
  },

  hide: function() {
    return this.show(false);
  },

  clear: function() {
    this.$el.html('');
    return this;
  },

  /**
   * Compiles the specified template.
   *
   * @param  {function():String|String} template template source or template function
   * @return {function():String}          A template function.
   */
  compileTemplate: function(template) {

    // a string has been passed as a template, compile it
    if (_.isString(template)) {
      return _.template(template);

    // a function has been passed as a template, no need to compile it
    } else if (_.isFunction(template)) {
      return template;
    } else {
      throw new Error('Invalid template specified. Should be a function or a string.');
    }
  },

  $byId: function(selector) {
    if (selector.substr(0,1) !== '#') selector = '#' + selector;
    return this.$el.find(selector.replace('.', '\\.'));
  },

  render: function() {
    // cancel rendering if onRender returns false
    if (this.onRender() === false) return this;

    var ret = this.renderTemplate();

    this.afterRender();

    return ret;
  },

  renderTemplate: function() {
    if (!this.template) throw new Error('template not defined!');

    var compiledTemplate = this.compileTemplate(this.template),
        data = (this.model && this.model.toJSON) ? this.model.toJSON() : undefined;

    this.$el.html(compiledTemplate(data));
    return this;
  },

  onRender: function() {
    return this;
  },

  afterRender: function() {
    return this;
  },

  // initOptions helper method
  initOptions: object.initOptions

});

  return BaseView;
});
