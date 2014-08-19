/*globals define*/

define( [
    'lodash',
    'src/utils/string'
  ], function(
    _,
    string
  ) {

'use strict';

var modelHelper = {};

/**
 * Helper functions to load the fields information.
 *
 */

/*
 * Get the default value from each field as defined in the schema and
 * generates the defaults object as expected by Backbone
 *
 * @param     {Model}  a BaseModel constructor function
 *
 * @return    It modifies Model.prototype.defaults
 *
 * Example:
 *
 * var schmema = {
 *  code: {
 *    'type':'String',
 *     default: 'new code'
 *   },
 *   name: {
 *     'type':'String',
 *     default: 'new name'
 *   },
 *   'description: {
 *     'type':'String'
 *   }
 * }
 *
 * modelHelper.defaults(fields) ->
 *
 * defaults: {
 *   code: 'new code',
 *   name: 'new name'
 * }
 *
 */
modelHelper.completeModelDefaults = function(Model) {
  var schema    = Model.prototype.schema || [],
      defaults  = Model.prototype.defaults || {},
      defaultsFromSchema = {};

  _.each(schema, function(field) {
    if (_.has(field, 'defaults')) {
      defaultsFromSchema[field.name] = field.defaults;
    }
  });

  Model.prototype.defaults = _.extend(defaultsFromSchema, defaults);
};

/*
 * Read the information from the schema properties
 * and uses it to extend the rest of the schema properties:
 *
 * It will search in the prototype's model for every property suffixed with
 * 'Schema', and it will extend it with the information from schema.
 *
 * These are the basic schemas:
 *
 * formSchema:    schema to use for update forms
 * querySchema:   schema to use for query form
 * headerSchema:  schema to use for Parent header panel
 * tableSchema:   schema to use to display the grid
 *
 * @param     {Object} Model  The contructor of the model to enhance
 *
 * @return    {Object} Model  The model with the extended schemas
 */
modelHelper.extendSchemas = function(Model) {
  var proto   = Model.prototype,
      schema  = proto.schema || [];

  _.each(proto, function(value, key) {
    if (string.endsWith(key, 'Schema')) {
      proto[key] = modelHelper.extendSchema(proto[key], schema);
    }
  });

};

/**
 * Extend a schema definition with the information from a base schema.
 *
 * A schema is an array ob objects with values to be used to instantiate
 * fields.
 *
 * @param  {Array<fieldDefinition>} schema Schema to define
 * @param  {Array<fieldDefinition>} base   Base schema to complete the schema
 *                                         definition.
 * @return {Array<fieldDefinition>}        A new schema with the information
 *                                         from 'schema' completed with the
 *                                         information from 'base'
 *
 * Every Model should have a schema array describing the fields of the model.
 *
 * For example. the following schema object defines three fields:
 *
 *  schema: [
 *    { name:       'ProvinciaId',
 *      type:       'number',
 *      label:      'Nro Provincia',
 *      defaults:   '(nuevo)',
 *      readOnly:   true,
 *      order:      'ProvinciaId'
 *    },
 *    { name:       'Codigo',
 *      type:       'string',
 *      label:      'Código',
 *      max:        50,
 *      order:      'Codigo'
 *    },
 *    { name:       'Descripcion',
 *      type:       'string',
 *      label:      'Descripción',
 *      max:        500,
 *      order:      'Descripcion'
 *    }
 *  }
 *
 * A model can also define a set of schemas to use for other purposes, which
 * will be used to populate the corresponding FieldCollection
 * like the following:
 *
 * formSchema:    schema to be used to populate the formFields FieldCollection.
 * querySchema:   schema to be used to populate the queryFields FieldCollection.
 * headerSchema:  schema to be used to populate the headerFields FieldCollection.
 * tableSchema:   schema to be used to populate the tableFields FieldCollection.
 *
 * When defining these schemas, you can pass an array to override the
 * original schema definition, effectively using the schema property as defaults
 *
 * For example:
 *
 *  // When editing use a textarea instead of an input for the Descripcion
 *  formSchema: [ 'ProvinciaId', 'ZonaId', 'Codigo',
 *    { field: 'Descripcion', control: 'textarea', rows: 4 }
 *  ],
 *
 *  // Do not show ProvinciaId field in the parent header
 *  headerSchema: [
 *    { name: 'Codigo',      span: 4 },
 *    { name: 'Descripcion', span: 7 }
 *  ],
 *
 *  // When filtering ProvinciaId is editable and defaults to ''
 *  querySchema: [
 *    { name: 'ProvinciaId', defaults: '', readOnly: false },
 *    'Codigo', 'Descripcion'
 *  ],
 *
 *  // Nothing new, just show the three fields in table View
 *  tableSchema: ['ProvinciaId', 'Codigo', 'Descripcion']
 *
 * It is worth noting that schemas belong to the protype, while FieldCollections
 * (fields, tableFields, queryFields, formFields) should be instantiated for
 * every model instance.
 */
modelHelper.extendSchema = function(schema, base) {
  schema  = _.clone(schema, true);
  // base    = _.clone(base, true);  // attention lodash cloneDeep bug!!!

  _.each(schema, function(field, index) {
    if (_.isString(field)) field = { name: field };
    if (!field.name) throw new TypeError('field.name not specified in schema');

    //look for the fieldDefinition in the base schema
    var baseField = _.findWhere(base, { name: field.name });
    if (!baseField) throw new TypeError('field "' + field.name + '" not found in base schema');

    if (baseField) field = _.extend({}, baseField, field);
    schema[index] = field;
  });

  return schema;
};

  return modelHelper;
});
