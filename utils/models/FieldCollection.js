/*globals define*/

define( [
    'lodash',
    'src/utils/mixins/isPlainObject',
    'src/utils/models/Field',
    'src/utils/models/ObjectField',
    'src/utils/models/ArrayObjectField',
    'src/utils/models/DateField',
    'src/utils/models/CheckField'
  ], function(
    _,
    isPlainObject,
    Field,
    ObjectField,
    ArrayObjectField,
    DateField,
    CheckField
  ){

'use strict';

var FieldCollection = function(options) {
  this.initialize(options);
};

FieldCollection.prototype = [];     // new Array();

_.extend(FieldCollection.prototype, {

  initialize: function(options) {

    options = options || {};

    // it is already a FieldCollection
    if (options instanceof FieldCollection) throw new Error('already a FieldCollection.');

    if (!_.isArray(options)) throw new Error('options should be an array of plain objects.');

    // return an empty FieldCollection
    if (!options) return this;

    var fields;

    // passed the fields as options
    // transform it to an options with fields
    if (_.isArray(options)) fields = options;
    else if (_.isArray(options.fields)) fields = options.fields;

    // return an empty FieldCollectoiin
    if (!fields) return this;

    if (!_.isArray(fields)) throw new Error('options.fields should be an array of fields or an empty value');

    _.each(fields, function(field) {
      var createdField = this.createField(field);
      this.push(createdField);
      this[createdField.name] = createdField;
    }, this);

    return this;
  },

  find: function(value, prop) {
    prop = prop || 'name';
    return _.find(this, function(field) {
      return field[prop] === value;
    });
  },

  findByName: function(value) {
    return this.find(value, 'name');
  },

  findByFullName: function(value) {
    return this.find(value, 'fullName');
  },

  setModel: function(model) {
    _.each(this, function(field) {
      field.model = model;
      field.errors = model.errorsByField(field);
    }, this);
    return this;
  },

  validate: function() {
    // run validate for each field in this FieldCollection
    _.invoke(this, 'validate');
    return this;
  },

  defaults: function() {
    var def = {};
    _.each(this, function(field) {
      if (field.defaults !== undefined) {
        def[field.name] = _.clone(field.defaults, true);
      }
    }, this);
    return def;
  },

  controls: function() {
    return _.map(this, function(field) {
      return field.initControl();
    });
  },

  createField: function(options) {
    var type,
        supportedTypes,
        FieldConstructor;

    options = options || {};

    if (!_.isPlainObject(options)) throw new Error('options should be a plain object');

    type = (options.type || 'string').toLowerCase();

    if (!_.isString(type)) throw new Error('field.type should be a string.');

    supportedTypes = Field.prototype.supportedTypes;

    if (!_.contains(supportedTypes, type)) {
      throw new Error('field type "' + type + '" not supported. ' +
        'supported types: ' + supportedTypes.join(', '));
    }

    if (type === 'object') {
      FieldConstructor = ObjectField;
    } else if (type === 'arrayobject') {
      FieldConstructor = ArrayObjectField;
    } else if (type === 'date') {
      FieldConstructor = DateField;
    } else if (type === 'check') {
      FieldConstructor = CheckField;
    } else {
      FieldConstructor = Field;
    }

    return new FieldConstructor(options);
  }

});

  return FieldCollection;
});
