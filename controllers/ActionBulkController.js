/*globals define, app, alert, console*/

define( [
    'jquery', 'lodash',
    'src/controllers/CrudController',
    'src/views/crud/SelectedTableView', 'src/views/crud/SelectedRowsView',
    'src/views/crud/ActionView'
  ], function(
    $, _,
    CrudController,
    TableView, RowsView,
    ActionView
  ){

'use strict';

/**
 * ActionBulkController allow users to do bulk action on collection of
 * selected models, using a datatable with checkboxes.
 *
 * Note: The Entity Id must be excluded from tableSchema
 *
 * @class ActionBulkController
 * @extends CrudController
 */
var ActionBulkController = CrudController.extend({

  checkGridDefaults: {
    TableView : TableView,
    RowsView  : RowsView
  },

  selected: [],

  initialize: function(options) {

    options = options || {};

    var defaults = {
      tableType : 'Grid'
    };

    this.initOptions(options, defaults);

    this.tableType = this.tableType.toLowerCase();

    // take defaults if CheckGrid is the type.
    if(this.tableType === 'checkgrid') {
      _.defaults(this, this.checkGridDefaults);
    }

    // super.initialize
    CrudController.prototype.initialize.call(this, options);

    this.selected = [];
    this.trigger('selected:change', this.selected, 'initialize');
  },

  setSelected: function(model, value) {

    if (value === undefined) value = true;

    var id = model.id;

    var isSelected = (_.findWhere(this.selected, { id: model.id }) !== undefined);

    // selecting an already selected item, just exit
    if (isSelected && value === true) return this;
    // unselecting an item that wasn't selected, just exit
    if (!isSelected && value === false) return this;

    // removing an item
    if (isSelected && value === false) {
      this.selected = _.reject(this.selected, function(m) { return m.id === id; });
      this.trigger('selected:change', this.selected, 'removed', model);
      return this;
    }
    // adding an item
    if (!isSelected && value === true) {
      this.selected.push(model);
      this.trigger('selected:change', this.selected, 'added', model);
      return this;
    }

  }

});

  return ActionBulkController;
});
