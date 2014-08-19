/*globals define*/

define( [
    'lodash',
    'src/utils/models/Field',
    'src/utils/convert',
    'src/utils/lang'
  ], function(
    _,
    Field,
    convert,
    lang
  ){

'use strict';

/**
 * A field represeting and array ob objects.
 *
 * @class ObjectField
 * @extend Field
 * @constructor
 */
var ArrayObjectField = Field.extend({

  initialize: function(options) {

    options = options || {};

    _.defaults(this, options);

    this._addSupportedType('arrayObject');

    this.type = this.type || 'arrayObject';

    // idField of each nested object
    // by default, we asume that the name of the field is in plural form
    // so each object should have an id of the singular form followed by Id
    //
    // example: field.name: 'customers', field.idAttribute: 'customerId'
    //
    // myObject.customers = [
    //   { customerId: 1, name: 'custom1' },
    //   { customerId: 2, name: 'custom2' }
    // ]
    if (!this.idAttribute) {
      this.idAttribute = lang.singular(this.name) + 'Id';
    }

    // field to display to the user
    // if not specified just take the idAttribute
    // example: field.name: 'customers', field.idAttribute: 'name' (the name of the customer)
    if (!this.displayAttribute) this.displayAttribute = this.idAttribute;

    // fully qualified name of the array field
    // example: customers
    this.fullName = this.fullName || this.name;

    // fully qualified expression to display to the user
    // example: customers
    // #TODO: see what can we do with this!!!
    // we should issue some kind of join... but it wouldn't be a template anymore
    this.displayTemplate = this.displayTemplate || this.name;

    // if order is not specified, order by the display expression
    // by default, you can't order by an array object field
    if (this.order === undefined) this.order = false;

    Field.prototype.initialize.call(this, options);

  },

  /**
   * Adds the default value ([]) for array object
   *
   * @param {string} type   Should be equal to arrayObject,
   *                        otherwise it will be handled by super._setDefaults
   *
   * @override
   *
   */
  _setDefaults: function(type) {

    if (type.toLowerCase() === 'arrayObject') return [];

    // super.setDefaults
    return Field.prototype.setDefaults.call(this, type);
  },

  /**
   * Cleans the value of the array object by leaving just the idAttribute
   *
   * Example:
   *
   * myField = new ArrayObjectField();
   * myField.idAttribute = 'id';
   * myField.val( [
   *   { id: 1, name: 'n1'},
   *   { id: 2, name: 'n2'}
   * ]);
   *
   * myField.val() -> [{ id: 1, name: 'n1'},{ id: 2, name: 'n2'}];
   * myField.onlyId() -> [{ id: 1 },{ id: 2 }];
   *
   * @return {Object} The an array of objects value of the field, with just the id.
   */
  onlyId: function() {
    return _.map(this.val(), function(fullItem) {
      return _.pick(fullItem, this.idAttribute);
    }, this);
  },

  /**
   * Overrides Field._fromRaw to handle array object values.
   *
   * In it's raw format the field holds an array of objects and _fromRaw returns
   *  a string with a comma separated list of the id of the objects.
   *
   * @param  {Array[Object]}   rawValue  Field's nested object
   * @return {Array[String]}   An Array of the ids of the objects as a string
   *
   * @override
   *
   * @example
   * var rawValue = {
   *   invoiceId: 4,
   *   customers: [
   *     { customerId: 56, name: 'John Palmer' },
   *     { customerId: 57, name: 'Paul Jonas' }
   *   ]
   *   amount: 15.5
   * }
   * field.idAttribute = 'customerId';
   * this._fromRaw(rawValue) // -> '56,57'
   *
   * In this case the customers field is an array of customer objects.
   *
   * It is represented by an instance of ArrayObjectField of type 'arrayObject'
   *
   */
  _fromRaw: function(rawValues) {
    if (rawValues === undefined || rawValues === null) return '';

    var formatted = _(rawValues).pluck(this.idAttribute).join(',');

    return formatted;
  },

  /**
   * Overrides Field._toRaw to handle array object values
   *
   * It receives a comma separated list of objects ids
   * and returns an array of objects with that id,
   * using field.idAttribute to hold the id value.
   *
   * @param  {Array[String]}  formattedValue  The array of ids
   * @return {Array[Object]}
   *
   * @override
   *
   * @example
   * var rawValue = {
   *   invoiceId: 4,
   *   customers: [
   *     { customerId: 56, name: 'John Palmer' },
   *     { customerId: 57, name: 'Paul Jonas' }
   *   ]
   *   amount: 15.5
   * }
   *
   * field.idAttribute = 'customerId';
   * this._fromRaw(rawValue) // -> '56,57'
   *
   * In this case the customers field is an array of customer objects.
   *
   * It is represented by an instance of ArrayObjectField of type 'arrayObject'
   *
   */
  _toRaw: function(formattedValue) {

    // formattedValue should be a list of numbers separated by commas
    if (! formattedValue.match(/^\d*(?:,\d+)*$/)) {
      throw new Error('formatted value should be comma separated list of numeric ids');
    }

    var raw = _.map(formattedValue.split(','), function(formattedItem) {
      var rawItem = {};
      rawItem[this.idAttribute] = convert.toNumber(formattedItem);
      return rawItem;
    }, this);

    return raw;
  }

});

  return ArrayObjectField;
});
