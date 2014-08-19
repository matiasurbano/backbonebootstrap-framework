/*globals define*/

define( [
    'jquery', 'lodash', 'src/views/BaseView',
    'text!src/views/crud/actionView.html'
  ], function(
    $, _, BaseView,
    actionTemplate
  ) {

'use strict';

var ActionView = BaseView.extend({

  resource: undefined,

  title: '',

  defaults: {
    url : undefined
  },

  initialize: function(options) {
    options = options || {};

    _.defaults(this, options, this.defaults);
    _.extend(this, options);

    this.template = options.template || actionTemplate;

    BaseView.prototype.initialize.call(this, options);

    this.template = this.compileTemplate(this.template);

    this.listenTo(this.controller, 'mode:change', this.onControllerModeChange);
  },

  onControllerModeChange: function(mode, prevMode) {
    this.show(mode === 'list');
    return this;
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  },

  getSelectedItems: function(){
    return this.controller.rowsView.getSelected();
  }

});

  return ActionView;
});
