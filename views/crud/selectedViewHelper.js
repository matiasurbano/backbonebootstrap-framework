/*globals define*/

define( [
    'lodash'
  ], function(
    _
  ) {

 'use strict';

var selectedViewHelper ={};

selectedViewHelper.selectableCollection = function(collection) {
  // if a classed is passed, I'll work on the prototype
  if (_.isFunction(collection)) collection = collection.prototype;

  // overrides collection.model with a new model with a checkField
  var SelectableModel = selectedViewHelper.selectableModel(collection.model);
  collection.setModel(SelectableModel);

  return collection;
};

selectedViewHelper.selectableModel = function(Model) {

  if (!_.isFunction(Model)) throw new Error('Model should be a model class');

  var tableSchema = Model.prototype.tableSchema;

  if (!tableSchema || tableSchema.length === 0) {
    throw new Error('model has no tableSchema defined');
  }

  // it's already a selectable model
  if (tableSchema[0].type === 'check') return Model;

  // we have to create a new Model

  // create the field for the check
  var checkFieldDisplay = function(value, attributes, field) {
    var checked = field.selected ? 'checked' : '';

    return '<div class="checker" id="uniform-titleCheck2">' +
      '<span class="' + checked + '">'+
      '<input type="checkbox"  name="checkRow">' +
      '</span>' +
      '</div>';
  };

  var checkField = {
    name     : 'selected',
    type     : 'check',
    label    : ' ',
    defaults : false,
    editable : false,
    order    : false,
    display  : checkFieldDisplay,
    span     : 1
  };

  // don't want to mess with the original Model's schemas
  var enhancedSchema      = _.cloneDeep(Model.prototype.schema);
  var enhancedTableSchema = _.cloneDeep(tableSchema);

  // add a check field at the begining of the schema and the tableSchema
  enhancedSchema.unshift(checkField);
  enhancedTableSchema.unshift(checkField.name);

  // create a new Model, inheriting from Model
  // with a checkField
  var EnhancedModel = Model.extend({
    schema      : enhancedSchema,
    tableSchema : enhancedTableSchema
  });

  return EnhancedModel;
};

  return selectedViewHelper;
});
