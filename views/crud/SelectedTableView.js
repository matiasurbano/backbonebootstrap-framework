/*globals define*/

define( [
    'jquery', 'lodash',
    'src/views/crud/TableView',
    'src/views/crud/selectedViewHelper'
  ], function(
    $, _,
    TableView,
    selectedViewHelper
  ) {

'use strict';

var SelectedTableView = TableView.extend({

  titlesHtml: undefined,      // it's not a template, it's the textual html of the titles

  title: '',

  resource: undefined,

  name: 'SelectedTableView',

  initialize: function(options) {
    options = options || {};

    _.defaults(this, options);

    selectedViewHelper.selectableCollection(options.collection);

    TableView.prototype.initialize.call(this, options);

    this.tableSchema = this.tableSchema || this.collection.tableSchema;
  }

});

  return SelectedTableView;
});
