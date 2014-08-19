/*globals define*/

define( [
    'jquery', 'lodash', 'require',
    'src/models/BaseCollection',
    'src/utils/mixins/evaluate',
    'src/controls/ComboControl'
  ], function(
    $, _, require,
    BaseCollection,
    _evaluate,
    ComboControl
  ){

'use strict';

var CollectionComboControl = ComboControl.extend({

  initialize: function(options) {

    options = options || {};

    _.bindAll(this, 'updateItems');

    _.defaults(this, options);

    this.addSupportedType('collectioncombo');
    this.type = this.type || 'collectioncombo';

    this.items = { '' : '--cargando opciones--' };

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

    //safety check
    if (!BaseCollection) BaseCollection = require('src/models/BaseCollection');
    if (!this.collection instanceof BaseCollection) {
      throw new Error('could not instantiate source collection');
    }

    // this.order
    this.order = this.order || '';

    this.maxItems = this.maxItems || 100;

    this.showSelectItem = (this.showSelectItem === undefined ? true : this.showSelectItem);

    ComboControl.prototype.initialize.call(this, options);

    this.fetched = false;

    if (this.collection.length > 0) {
      this.fetched = true;
      this.loadItems();
    }

  },

  loadItems: function() {
    var items       = [],
        idAttribute = this.field.idAttribute,
        display     = this.display;

    if (this.showSelectItem) {
      items.push({
        key   : '',
        value : '--seleccione un ítem--'
      });
    }

    _.each(this.collection.models, function(model) {
      var attrs  = model.attributes;
      items.push({
        key   : _.evaluate(attrs, idAttribute),
        value : _.evaluate(attrs, display)
      });
    }, this);

    this.items = items;
    return this;
  },

  // #TODO ver si esto es necesario
  // por el momento SI es necesario
  // al cambiar el valor de un ObjectField
  // field.formattedVal(x) graba un objeto que contiene SOLO el id
  // y perdemos el resto de la informacion del objeto
  selectedItem : function () {
    var condition = {};
    condition[this.field.idAttribute] = parseInt(this.currentVal);

    return this.collection.findWhere(condition);
  },

  init: function() {
    // #TODO: bug
    // this should be initialized in initialize, but
    // afterRender is called in a different context (this) than initialize
    // and onCollectionRest
    // there are controls instantiated for each field!

    this.listenTo(this.collection, 'reset', this.updateItems);
    this.listenTo(this.collection, 'change', this.updateItems);

    if (this.fetched) this.loadItems();
    else              this.fetch();
  },

  fetch: function() {
    var params = {};
    if (this.order) params.order = this.order;
    if (!this.len) params.len = this.maxItems;
    this.collection.setParams(params).fetch();
  },

  updateItems: function() {
    this.fetched = true;
    this.loadItems().render();
    return this;
  },

  render: function() {
    // ComboControl.prototype.init.call(this);
    this.init();
    return ComboControl.prototype.render.call(this);
  }

});

  return CollectionComboControl;
});
