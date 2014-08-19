/*globals define*/

define( [
    'jquery', 'lodash', 'require', 'select2', 'select2_locale',
    'src/models/BaseCollection',
    'src/utils/mixins/evaluate',
    'src/controls/InputControl',
    'src/utils/convert'
  ], function(
    $, _, require, select2, select2_locale,
    BaseCollection,
    _evaluate,
    InputControl,
    convert
  ){

'use strict';

var Select2Control = InputControl.extend({

  initialize: function(options) {

    options = options || {};

    _.defaults(this, options);

    _.bindAll(this, 'queryHandler', 'initSelectionHandler',
      'onCollectionReset', '_formatResult');

    this.type = this.type || 'select2combo';
    this.addSupportedType(this.type);

    this.inputType = 'hidden';

    if (this.collection) {
      // can be a function returning a new collection instance
      this.collection = _.result(this, 'collection');
    } else if (_.isFunction(this.Collection)) {
      this.collection = new this.Collection();
    } else {
      throw new Error('no collection instance nor Collection constructor specified');
    }
    // already used options.collection and options.Collection
    // don't want BaseControl.initialize to process them again
    options = _.omit(options, ['collection', 'Collection']);

    // query to pass to collection
    // it will be added to the query to filter by the input of the user
    this.query = options.query || undefined;

    //safety check
    if (!BaseCollection) BaseCollection = require('src/models/BaseCollection');
    if (!this.collection instanceof BaseCollection) {
      throw new Error('could not instantiate source collection');
    }

    // don't fetch total number of records from select2 controls
    this.collection.fetchTotal = false;

    // this.order
    this.order = this.order || '';

    this.multiple = this.multiple === undefined ? false : this.multiple;

    // idAttribute
    this.idAttribute = this.idAttribute || this.collection.model.prototype.idAttribute;
    if (!this.idAttribute) throw new Error('no idAttribute specified');

    if (!this.display) throw new Error('no display function or attribute specified');

    if (_.isString(this.display)) this.filterAttributes = this.display;
    if (!this.filterAttributes) {
      // throw new Error('no filterAttributes specified for field ' + this.field.name);
    }

    InputControl.prototype.initialize.call(this, options);

    this.columns = this.columns || undefined;

    this.initializeColumns();
  },

  init: function() {
    // #TODO: bug
    // this should be initialized in initialize, but
    // afterRender is called in a different context (this) than initialize
    // and onCollectionRest
    // there are controls instantiated for each field!

    this.listenTo(this.collection, 'reset', this.onCollectionReset);
  },

  afterRender: function() {
    this.$input.select2({
      multiple          : this.multiple,
      query             : this.queryHandler,
      initSelection     : this.initSelectionHandler,
      allowClear        : true,
      // width          : '500px',
      dropdownAutoWidth : true,
      formatResult      : this.formatResult
    });

    // #TODO: use select2 events - events test
    // this.$input.on('select2-focus', function() { console.log('select2-focus');} );
    // this.$input.on('select2-blur', function() { console.log('select2-blur');} );

    //super.afterRender
    InputControl.prototype.afterRender.apply(this, arguments);
    return this;
  },

  initSelectionHandler: function(element, callback) {
    var data = this.getRowData(this.field.val());
    callback(data);
  },

  onCollectionReset: function(collection) {
    var data = [];

    _.each(this.collection.models, function(model) {
      data.push(this.getRowData(model.attributes));
    }, this);

    // prepare object to pass back to select2
    var results = {
      results : data,
      more    : collection.more,
      context : this
    };

    if (this.queryCallback) this.queryCallback(results);
  },

  getRowData: function(attrs) {
    var data = {
      id   : _.evaluate(attrs, this.idAttribute),
      text : _.evaluate(attrs, this.display)
    };
    // if there are any columns defined
    // save all the attributes to be used from the
    // display function of each column
    if (this.columns) data.attrs = attrs;
    return data;
  },

  // check http://ivaynberg.github.com/select2/  (query parameter)
  queryHandler: function(options) {
    var queryParams = {
      filter   : options.term || '',
      filterBy : this.filterAttributes,
      page     : options.page || 1,
      order    : this.order,
      len      : 10,
      query    : _.isFunction(this.query) ? this.query(options) : this.query
    };

    // save the callback for calling it later
    this.queryCallback = options.callback;
    this.collection.setParams(queryParams).fetch();
  },

  renderHtmlErrors: function(field, $container, $input, $error) {
    var $select2Input = $container.find('a.select2-choice');
    // super.renderHtmlErrors
    InputControl.prototype.renderHtmlErrors.call(this,
      field, $container, $select2Input, $error
    );
  },

  // columns handling functions

  /**
   * Initializes the controls to display in the drop down combo.
   *
   * Select2Control allows you to specify an array of fields/expressions to
   * show in a drop down table.
   *
   * The array should contain an object with the display field or display
   * expresson and the width of the column.
   *
   * The display property can be a string representing the field to show, or a
   * function to calculate the expression to show in that column. The function
   * will receive the attrbutes of the model
   *
   * Example:
   *
   * columns    : [
   *   { display: 'ZonaId', width: '10' },
   *   { display: 'Codigo', width: '20' },
   *   {
   *     display: function(attrs) {
   *       return attrs.Descripcion + ' (' + attrs.Codigo + ')';
   *     },
   *     width: '50'
   *   }
   * ]
   *
   * Here we define three columns. The first two will show the fields ZonaId and
   * Codigo, and the last one will display the evaluation of a function. The
   * width of each column will be calculated proportionally to the total width
   * of all of them.
   *
   * @return {[type]} [description]
   */
  initializeColumns: function() {

    // no columns defined
    if (!this.columns || this.columns.length === 0) {
      this.columns = undefined;
      this.formatResult = undefined;
      return;
    }

    // columns defined as a string
    // format: col1:10,col2:30
    if (_.isString(this.columns)) {
      var columns = this.columns;
      this.columns = [];
      var withWidth = columns.split(',');

      _.each(withWidth, function(column) {
        var pair = column.split(':');
        this.columns.push({
          display : pair[0],
          width   : pair.length === 0 ? null : pair[1]
        });
      }, this);
    }

    // helper function to calculate the total width of the columns
    var sumWidth = function(columns) {
      return _.reduce(columns, function(memo, column) {
        return memo + parseInt(column.width || 0, 10);
      }, 0);
    };

    var totalWidth = sumWidth(this.columns);

    // handle columns with no width specified
    var colsWithNoWidth = _.filter(this.columns, function(column) {
      return !column.width;
    });

    // there's at least one column with no width
    if (colsWithNoWidth.length > 0) {
      var defWidth;
      // calculate default column, just take the average
      if (totalWidth === 0) defWidth = 10;
      else defWidth = totalWidth / this.columns.length;

      _.each(colsWithNoWidth, function(column) {
        column.width = defWidth.toString();
      });
      // recalculate total width
      totalWidth = sumWidth(this.columns);
    }

    _.each(this.columns, function(column) {
      if (!column.display) throw new Error('no display value specified for column');

      // if it's a string, it's the name of the field
      // create a function that return the attribute with that name
      if (_.isString(column.display)) {
        var field = column.display;
        column.display = function(attrs) {
          return attrs[field];
        };
      } else if (!_.isFunction(column.display)) {
        throw new Error('column.display should be a string representing a field name or a function');
      }

      // calculate width
      column.width = convert.truncate(column.width * 100 / totalWidth).toString();
    });

    // add the difference to the first column
    var diff = 100 - sumWidth(this.columns);
    if (diff > 0) {
      this.columns[0].width =
        (parseInt(this.columns[0].width, 10) + diff).toString();
    }

    this.formatResult = this._formatResult;

  },

  // helper function to highlight some text
  highlight: function(text, search, before, after) {
    if (!search || !text) return text;

    before = before || '<span class="select2-match">';
    after = after || '</span>';

    var pattern = new RegExp('(' + search + ')', 'igm');
    return text.replace(pattern, before + '$1' + after);
  },

  _formatResult: function(data, container, query) {
    var attrs = data.attrs,
        html  = '<table width="100%"><tr>';
    _.each(this.columns, function(column) {
      html += '<td width="' + column.width + '%">' +
        this.highlight(column.display(attrs).toString(), query.term) +
      '</td>';
    }, this);
    html += '</tr></table>';
    return html;
  }

});

  return Select2Control;
});
