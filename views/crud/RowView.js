/*globals define*/

define( [
    'lodash',
    'src/views/BaseView'
  ], function(
    _,
    BaseView
  ) {

'use strict';


var RowView = BaseView.extend({
  tagName: 'tr',

  // to be specified when using it, or automatically generated from collection.tableFields
  template: undefined,

  initialize: function(options) {
    options = options || {};

    BaseView.prototype.initialize.call(this, options);

    this.template = options.template || undefined;
    if (!this.template) throw new Error('no template defined.');

    this.model.bind('destroy', this.remove, this);
    this.model.bind('change', this.render, this);
  },

  render: function() {
    var attrs = this.model.displayAttrs(this.model.tableFields);
    this.$el.html(this.template(attrs));
    return this;
  },

  events: {
     'click': 'update'
  },

  update: function() {
    this.controller.update(this.model.id);
  }

});


  return RowView;
});


