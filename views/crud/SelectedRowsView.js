/*globals define*/

define( [
    'lodash',
    'src/views/crud/RowsView','src/views/crud/RowView', 'src/utils/crud',
    'src/views/crud/selectedViewHelper'
  ], function(
    _,
    RowsView, RowView, crud,
    selectedViewHelper
  ) {

'use strict';


var SelectedRowsView = RowsView.extend({

  name: 'SelectedRowsView',
  selectedItems: [],

  initialize: function(options) {

    options = options || {};

    _.extend(this, options);

    this.RowView = options.rowView || this.RowView || SelectedRowView;

    selectedViewHelper.selectableCollection(options.collection);

    RowsView.prototype.initialize.call(this, options);

  },

  getSelected: function() {
    return _(this.views)
      .filter(function(view)  { return view.selected; })
      .map(function(view)     { return view.model; });
  }

});

var SelectedRowView = RowView.extend({
  tagName: 'tr',

  // to be specified when using it, or automatically generated from collection.tableFields
  template: undefined,
  selected: false,

  initialize: function(options) {
    RowView.prototype.initialize.call(this, options);

    this.bind('rowChange', this.render, this);
  },

  render: function() {

    if (this.model.tableFields[0].type === 'check'){
      this.model.tableFields[0].selected = this.selected;
    }

    var attrs = this.model.displayAttrs(this.model.tableFields, false);
    this.$el.html(this.template(attrs));
    return this;
  },

  events: {
    'click input[type="checkbox"]': 'toogle',
    'click td:not(:first)': 'update'
  },

  update: function() {
    this.controller.update(this.model.id);
  },

  toogle: function(){
    this.selected = !this.selected;
    this.controller.setSelected(this.model, this.selected);
    this.trigger('rowChange',this);
  }

});

  return SelectedRowsView;
});
