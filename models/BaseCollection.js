/*globals define, app, console*/

define( [
    'jquery', 'lodash', 'backbone',
    'src/models/BaseModel',
    'src/utils/mixins/flatten'
  ], function(
    $, _, Backbone,
    BaseModel,
    flatten
  ) {

'use strict';

/**
 * Backbone.Collection enhanced with the following features:
 *
 * pagination:    using params.page and params.len
 * ordering:      using params.order
 * quick-filter:  using params.filter & params.filterBy
 * query:         using params.q
 *
 * It also calculates the total of records meeting criteria
 *
 * By default, it is expected to work with a web service that accepts the
 * following paramenters:
 *
 * offset:   records to skip (mysql like)
 * page:     page number to retrieve (takes precedence over offset parameter)
 * len:      record for each page
 * order:    comma separated list of field to order by (supports asc, desc)
 * fiter:    expression to use for a quick filter
 * filterBy: comma separated list of field to use for the quick filter
 * query:    pair of field:condition expressions
 *
 * It should also support an aditional resource to retrieve the amount of
 * records matching the specified criteria
 *
 * @example:
 *
 * http://myapp/api/invoice?
 *   page=1&len=5&
 *   order=date&
 *   filter=Acme&filterBy=company.name,customer.name
 *
 * It will retrieve the first five records in which company or customer name
 * matches 'Acme'
 *
 * http://myapp/api/invoice/count?
 *   page=1&len=5&
 *   order=date&
 *   filter=Acme&filterBy=company.name,customer.name
 *
 * This will retrieve the total amount of records matching the previous criteria
 * (in this case order, page and len will be ignored)
 *
 * The q param allows to issue more complex queries, like:
 *
 * http://myapp/api/invoice/count?
 *   q=company.name:*acme*,amount:>200
 *
 * It should return the invoices in which the company name contains 'acme' and
 * the amount is greater than 200.
 *
 * (In fact, the collection will just pass the parameter to the q param, it's
 * upto the web service to decide how to deal with them)
 *
 * @class src.models.BaseCollection
 * @extends Backbone.Collection
 */

var BaseCollection = Backbone.Collection.extend({

  model: BaseModel,

  // array of columns to be rendered by RowsView view and TableView
  // it should have the form:
  // [
  //   { field: 'fieldname1', label: 'field1 label', order: 'fieldname1' }
  // ]
  // Order is the expression to order by, if not specified it assumes it to be the field
  // Specify false to prevent ordering by that column
  tableSchema: undefined,

  offset      : 0,
  page        : 1,
  len         : 10,
  order       : '',
  filter      : '',
  filterBy    : '',
  baseQuery   : '',
  query       : '',

  total       : null,         // don't now how many total records are
  more        : null,         // don't now if there are more records

  fetchTotal  : true,         // it will issue an extra http request to get
                              // the total number of records

  silent      : false,

  setPage: function(value) {
    value = parseInt(value || 1, 10);
    if (value !== undefined && value !== this.page) {
      if (value < 1) value = 1;
      this.page = value;
      this.updateOffset();
    }
    return this;
  },

  setOffset: function(value) {
    value = parseInt(value || 0, 10);
    if (value !== undefined && value !== this.offset) {
      if (value < 0) value = 0;
      this.offset = value;
    }
    return this;
  },

  setLen: function(value) {
    value = parseInt(value || 10, 10);
    if (value !== undefined && value !== this.len) {
      this.len = value;
      this.setPage(1);
      this.updateOffset();
    }
    return this;
  },

  // updates the valur of offset according to the value of page & len params
  updateOffset: function() {
    this.offset = ((this.page - 1) * this.len);
    return this;
  },

  setFilter: function(value) {
    value = value || '';
    if (value !== undefined && value !== this.filter) {
      this.filter = value;
      this.setPage(1);
    }
    return this;
  },

  setFilterBy: function(value) {
    value = value || '';
    if (value !== undefined && value !== this.filterBy) {
      // remove spaces
      value = value.replace(/\s/, '');
      this.filterBy = value;
      this.setPage(1);
    }
    return this;
  },

  setQuery: function(value) {
    value = value || '';

    // if it's an object, translate it to a query string
    if (_.isObject(value)) value = this.jsonToQuery(value);

    if (value !== undefined && value !== this.query) {
      this.query = value;
      this.setPage(1);
    }
    return this;
  },

  setBaseQuery: function(value) {
    value = value || '';

    // if it's an object, translate it to a query string
    if (_.isObject(value)) value = this.jsonToQuery(value);

    if (value !== undefined && value !== this.baseQuery) {
      this.baseQuery = value;
      this.setPage(1);
    }
    return this;
  },

  setOrder: function(value) {
    value = value || '';
    if (value !== undefined && value !== this.order) {
      this.order = value;
      this.setPage(1);
    }
    return this;
  },

  initialize: function(options) {
    options = options || {};
    Backbone.Collection.prototype.initialize.call(this, options);

    if (options.url) this.url = options.url;

    // run the setters, in case I override values when inheriting
    this.setOffset(this.offset);
    this.setPage(this.page);
    this.setLen(this.len);
    this.setOrder(this.order);
    this.setFilter(this.filter);
    this.setFilterBy(this.filterBy);
    this.setBaseQuery(this.baseQuery);
    this.setQuery(this.query);

    if (options.params) this.setParams(options.params);

    if (options.fetchTotal !== undefined) this.fetchTotal = options.fetchTotal;

    _.bindAll(this, 'fetch', '_fetchTotal');

    this.initSchema();
  },

  setModel: function(Model) {
    this.model = Model;
    this.initSchema();
    return this;
  },

  initSchema: function() {
    var proto = this.model.prototype;

    this.tableSchema = proto.tableSchema;
    this.querySchema = proto.querySchema;
  },

  setParams: function(params) {
    params = params || {};
    this.setOffset(params.offset);
    this.setPage(params.page);
    this.setLen(params.len);
    this.setOrder(params.order);
    this.setFilter(params.filter);
    this.setFilterBy(params.filterBy);
    this.setQuery(params.q || params.query);
    return this;
  },

  /**
   * Translates the params of the collection to the format expected
   * by the underlying web service.
   *
   * The resulting object will be passed as params parameter to ajax call.
   *
   * Default implementation just returns the following translation:
   * {
   *   offset   : this.offset,
   *   page     : this.page,
   *   len      : this.len
   *   order    : this.order,
   *   q        : this.query,
   *   filter   : this.filter,
   *   filterBy : this.filterBy
   * }
   *
   * If your web service expects a different set of parameters you should
   * override this method.
   *
   * @return {Object}   The params object to pass to the web service.
   */
  getParams: function() {
    var params = {};

    if (this.offset)    params.offset = this.offset;
    // don't pass page, just use the offset value
    if (this.len)       params.len    = this.len;
    if (this.order)     params.order  = this.order;

    // join baseQuery and query together
    if (this.query || this.baseQuery) {
      var queries = [];
      if (this.baseQuery) queries.push (this.baseQuery);
      if (this.query) queries.push (this.query);
      if (queries.length > 0) params.q = queries.join(',');
    }
    // if (this.query)     params.q = this.query;
    if (this.filter)    params.filter = this.filter;
    if (this.filterBy)  params.filterBy = this.filterBy;

    return params;
  },

  /**
   * Overrides Backbone.Model.fetch to execute this._fetchTotal
   * right after fetching the collection.
   *
   * If issues another query to the web service to fetch the total of records
   * matching the criteria and saves the result in this.total.
   *
   * It tells backbone not to trigger the reset event after fetching the
   * collection because it will be triggered by _fetchTotal after successfully
   * fetching the amount of records matching criteria.
   *
   * @param  {{Object}} options Options to pass to super.fetch
   * @return {[type]}         [description]
   */
  fetch: function(options) {

    // Add process to show
    this.startLoading();

    // TODO: check what happens with options variable, we are missing it
    options = options || {};

    var self = this;
    var success = options.success;

    options = {
      reset   : true,       // see http://stackoverflow.com/questions/16538330
      silent  : true,       // will manually trigger reset event after fetching the total
      success : function(collection, resp) {
        self._fetchTotal();

        // Remove process to show
        self.completeLoading();
        if (success) success(collection, resp);
      },
      error   : function(obj, error) {
        self.completeLoading();
        console.log(error);
      }
    };

    // proccess http data normally
    if (this.fetchTotal) {
      options.data = this.getParams();
    }

    // don't fetch total!
    if (!this.fetchTotal) {
      // we have to fetch another row to find out if there's mode data
      // will fetch an extra record to calculate this.more
      var prevLen = this.len;
      this.len++;
      options.data = this.getParams();
      this.len = prevLen;

      options.success = function(collection, resp) {
        // could not calculte total number of records
        self.total = null;
        self.more = false;
        // I could fetch an extra model
        // that means there is more data available
        if (collection.models.length > self.len) {
          self.more = true;
          // remove last model (I just used it to see if there's more data)
          collection.remove(_.last(collection.models));
        }
        // Remove process to show
        self.completeLoading();
        if (success) success(collection, resp);
        self.trigger('reset', self);    // manually trigger reset event after fetching total
      };
    }

    return Backbone.Collection.prototype.fetch.call(this, options);
  },

  /**
   * Issues the query specified by this.getUrl() appending '/count' and passing
   * this.getParams() as parameters.
   *
   * It's main purpose is to fetch the ammount of records matching the last query.
   *
   * @example
   *
   * After issuing a get request to
   *
   *   http://myapp/api/invoice?q=amount:>200,company.name:acme
   *
   * _fetchTotal will execute the following query:
   *
   *   http://myapp/api/invoice/count?q=amount:>200,company.name:acme
   *
   * And save te fetched value in this.total.
   *
   * Then it will trigger a 'reset' event to notify that the collection
   * has been succesfully fetched.
   */
  _fetchTotal: function() {
    var self = this;
    var options = {
      url         : this.getUrl() + '/count',
      data        : this.getParams(),
      contentType : 'application/json',
      success     : function(resp, status, xhr) {
        self.setTotal(parseInt(resp, 10));
        // self.total = parseInt(resp, 10);
        self.trigger('reset', self);    // manually trigger reset event after fetching total
        self.completeLoading();
        return true;
      },
      error       : function() {
        self.setTotal(null);
        // #TODO trigger an error event
        //self.trigger('error', self);    // manually trigger reset event after fetching total
        self.completeLoading();
      }
    };
    this.startLoading();
    return $.ajax(options);
  },

  // sets thte total amount of records
  // and updates the more flag accordingly
  setTotal: function(total) {

    if (!total && total !==0) {
      this.total = null;
      this.more = null;
      return;
    }

    this.total = total;
    this.more = (this.total > this.offset + this.len);

    return this;
  },

  getUrl: function() {
    return _.result(this, 'url');
  },

  /**
   * Translates a json object to a string ready to be passed to the q param
   *
   * @example
   *
   * var json1 = {
   *   amount: '>200',
   *   company: {
   *     name: 'acme'
   *   }
   * };
   * var json2 = { amount: '<400' };
   * var json3 = { 'company.name': '*inc*' };
   *
   * jsonToQuery(json1, json2, json3)
   * // -> "amount:>200,company.name:acme,amount:<400,company.name:*inc*"
   *
   * This is intended to be passed to a web service, like this:
   *
   * http://myapp/api/invoice?q=amount:>200,company.name:acme
   *
   * @param  {Object} json Json expression
   * @return {string}      String expression to pass to the q param
   */
  jsonToQuery: function() {

    if (!arguments || arguments.length === 0) return '';

    var q = [];

    _.each(arguments, function(json) {
      json = _.flatten(json);

      _.each(json, function(value, key) {
        if (_.isArray(value)) value = value.join('|');
        if (value && key) q.push(key + ':' + value);
      });
    });

    return q.join(',');
  },

  startLoading: function() {
    if (!this.silent && app) app.startLoading();
  },

  completeLoading: function() {
    if (!this.silent && app) app.completeLoading();
  }

});

  return BaseCollection;
});
