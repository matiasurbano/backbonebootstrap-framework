/*globals define*/

define( [
    'jquery', 'lodash',
    'src/controllers/CrudController',
    'src/views/crud/BulkTableView',
    'src/views/crud/BulkRowsView'
  ], function(
    $, _,
    CrudController,
    BulkTableView,
    BulkRowsView
  ){

'use strict';

var BulkCrudController = CrudController.extend({

  initialize: function(options) {

    options = options || {};

    this.selectedItems = [];

    // override with options
    _.extend(this, options);

    //_.defaults(options, this, this.defaults);
    // _.extend(options, this, this.defaults);

    this.TableView = BulkTableView;
    this.RowsView = BulkRowsView;

    // super.initialize
    CrudController.prototype.initialize.call(this, options);
  }

});

  return BulkCrudController;
});
