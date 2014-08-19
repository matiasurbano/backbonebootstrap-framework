/*globals define*/

define( [
    'lodash'
  ], function(
    _
  ) {

'use strict';

var mixin = {};

mixin.selectableController = function(Controller) {

  // already mixedin
  if (Controller.__selectable) return;
  Controller.__selectable = true;

  var proto = Controller.prototype;

  // create empty array of selected items on initialize
  var initialize = proto.initialize;

  proto.initialize = function(options) {

    initialize.call(this, options);
    this.selectedItems = [];

    // this.tableView.render();    // render tableView again
    mixin._addCheckFieldToSchema(this.tableView);
    this.collection.fetch();
    mixin._addCheckFieldToSchema(this.rowsView);
  };

  return Controller;
};

mixin._addCheckFieldToSchema = function(view) {

  // it already has a check column
  if (view.tableSchema[0].type === 'check') return;

  var checkField = mixin._checkField(),
      schema = _.clone(view.collection.tableSchema, true);

  // insert the chckField column at the beginning of the schema
  schema.unshift(checkField);

  // modify the schema of the table
  view.collection.tableSchema = schema;

};

mixin._checkField = function() {

  var display = function(value, attributes, field) {
    return '' +
      '<div class="checker" id="uniform-titleCheck2">' +
        '<span class="' + field.selected ? 'checked' : '' + '">'+
          '<input type="checkbox"  name="checkRow">' +
        '</span>' +
      '</div>';
  };

  var checkField = {
    name     : 'select_check',
    type     : 'check',
    label    : ' ',
    defaults : false,
    editable : false,
    display  : display,
    span     : 1
  };

  return checkField;

};

  return mixin;
});
