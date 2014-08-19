/*globals define*/

define( [
    'jquery', 'lodash', 'src/views/BaseView',
    'text!./filter.html'
  ], function(
    $, _, BaseView,
    filterTemplate
  ) {

'use strict';

var FilterView = BaseView.extend({

  initialize: function(options) {
    options = options || {};

    _.defaults(this, options);

    BaseView.prototype.initialize.call(this, options);

    this.template = this.compileTemplate(this.template || filterTemplate);

    this.listenTo(this.collection, 'reset change', this.update);
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  },

  events: {
    'keyup .filter_text' : 'filterDebounced',
    'click div.filter'   : 'filter'
  },

  filter: function() {
    this.controller.filter(this.$('.filter_text').val());
  },

  filterDebounced: _.debounce(function() {
    this.filter();
  }, 500),

  update: function() {
    this.$('.filter_text').val(this.controller.queryParams.filter || '');
  }

});

  return FilterView;
});
