/*globals define*/

define( [
    'lodash', 'src/views/crud/ModelView',
    'text!./query.html',
    'src/utils/models/FieldCollection'
  ], function(
    _, ModelView,
    queryTemplate,
    FieldCollection
  ) {

'use strict';

/**
 * QueryView renders a list of controls bound to a model's field list, in order
 * to enter filter criteria.
 *
 * When entering criteria no validations are applied, and every field is
 * treated as a text field.
 *
 * It takes a collection as parameter. By default it will instantiate a new
 * model of that collection and bind it to the view.
 *
 * When te user clicks on query, it will call the controller's list method
 * passing the attributes of the controls as parameter.
 *
 * @class QueryView
 * @extends ModelView
 */
var QueryView = ModelView.extend({

  /**
   * @property {BaseCollection} collection The collection from which to use as source for the controls.
   */
  collection: undefined,

  initialize: function(options) {
    options = options || {};

    _.defaults(this, options);

    _.bindAll(this, 'query');

    // by default, in QueryView we won't group controls
    this.groupControls = this.groupControls === undefined ? false : this.groupControls;

    if (!this.collection) throw new Error('Collection not specified!');

    // by default, use the queryFields from the collection
    // this.collection.queryFields.length == 0 => sin filtro
    if (!this.fields) {
      this.schema = this.schema || this.collection.querySchema || [];
      this.fields = new FieldCollection(this.schema);
    }

    // by default, instantiate a new model of the collection
    this.model = this.model || new this.collection.model();

    // set the template container
    this.containerTemplate = this.containerTemplate || queryTemplate;

    ModelView.prototype.initialize.call(this, options);

    // if no fields defined, disable the button to activate the query
    if (!this.fields || this.fields.length === 0) this.controller.enableQuery(false);
  },

  /**
   * Set the fields collection for this view, preparing the fields to be used
   * to enter filter criteria.
   *
   * Basically it takes every field, removing every validation and setting it's
   * type to string.
   *
   * @param {Array<src.Field>\Array<Object>|FieldCollection} fields
   *              Fields to use for this view.
   *
   * @override
   * @chainable
   */
  setFields: function(fields) {

    var attributes = {};

    // remove every validation
    // when filtering we won't apply any validation
    _.each(fields, function(field) {
      field.validations = [];

      // don't validate by field type, the user can type anything when filtering
      field.type = 'string';

      //clear defaults, so that we can start with an empty form
      field.defaults = '';

      attributes[field.name] = '';
    });

    this.model.attributes = attributes;

    // super.setFields
    ModelView.prototype.setFields.call(this, fields);

  },

  setQuery: function(params, options) {

    options = options || {};
    var disable = options.disable || false;

    _.each(params, function(value, key) {

      var control = this.controls[key];

      if (control) {
        control.field.val(value);
        if (disable) control.disable();
        control.render();
      }

    }, this);

  },

  events: {
    'click #query-button': 'query'
  },

  /**
   * Applies the filter entered by the user. It calls the controller's list
   * action passing the data entered by the user as query(q) parameter.
   *
   * @chainable
   */
  query: function() {
    this.controller.list({ q: this.modelToQuery(this.model) });
  },

  /**
   * Proccess the model edited by the query vir removing every piece of info
   * that is not needed to perform queries.
   *
   * In particular, when issuing a query for an element selected from a list
   * it only keeps the id of the element selected.
   *
   * Example:
   *
   * this.model.attributes = {
   *   code: 'code to search',
   *   provider: {
   *     providerId: 34,
   *     name: 'my provider',
   *     address: '34 megan street',
   *   },
   *   status: 'pending'
   * }
   *
   * this.modelToQuery(this.model) = {
   *   code: 'code to search',
   *   provider: {
   *     providerId: 34
   *   },
   *   status: 'pending'
   * }
   *
   * If we weren't using the function modelToQuery, we would be sending
   * provider.name and provider.address as filter parameters. In this case, the
   * id is enough to build the condition.
   *
   * @param  {Model} model  model to get the attributes from. If not specified
   *                        it will use this.model
   * @return {Object}       Object with the query conditions
   */
  modelToQuery: function(model) {
    var attrs = _.cloneDeep(model ? model.attributes : this.model.attributes);

    _.each(attrs, function(val, key) {
      var field = this.fields.findByName(key),
          id    = field.idAttribute;

      // only keep the idAttribute -> field.type === object
      if (_.isObject(val) && _.has(val, id)) {
        attrs[key] = _.pick(val, id);

      // only keep the idAttribute of each item -> field.type === arrayObject
      } else if (_.isArray(val)) {
        attrs[key] = _.map(val, function(item) {
          if (_.isObject(item) && _.has(item, id)) return _.pick(item, id);
          return item;
        });
      }

    }, this);

    return attrs;
  }

});

  return QueryView;
});
