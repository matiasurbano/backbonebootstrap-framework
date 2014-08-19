/*globals define*/

define( [
    'jquery', 'lodash', 'src/views/BaseView'
  ], function(
    $, _, BaseView
  ) {

'use strict';

var PageLenView = BaseView.extend({

  initialize: function(options) {
    options = options || {};
    BaseView.prototype.initialize.call(this, options);

    this.listenTo(this.collection, 'reset change', this.update);
  },

  render: function() {
    this.$el.html(this.template({len: this.collection.len}));
    return this;
  },

  events: {
    'change #page_len': 'page_len'
  },

  update: function() {
    this.$('#page_len').val(this.collection.len);
  },

  page_len: function(e) {
    e.preventDefault();
    var select = e.target;
    var len = select.options[select.selectedIndex].value;
    this.controller.list({len: len});
  },

  template: _.template(' \
    <label> \
    <select class="span1" id="page_len"> \
      <option value="5">5</option> \
      <option value="10">10</option> \
      <option value="25">25</option> \
      <option value="50">50</option>  \
      <option value="100">100</option> \
    </select> registros por página</label> \
  ')

});

  return PageLenView;
});
