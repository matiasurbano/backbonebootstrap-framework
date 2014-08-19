/*globals define,app*/

define( [
    'jquery', 'lodash',
    'src/views/BaseView',
    'text!src/views/crud/table.html',
    'src/views/crud/PageLenView', 'src/views/crud/PagesView', 'src/views/crud/FilterView',
    'src/utils/crud', 'src/utils/html'
  ], function(
    $, _,
    BaseView,
    tableTemplate,
    PageLenView, PagesView, FilterView,
    crud, html
  ) {

'use strict';

var TableView = BaseView.extend({

  titlesHtml: undefined,      // it's not a template, it's the textual html of the titles

  title: '',
  name: 'TableView',
  resource: undefined,

  initialize: function(options) {
    options = options || {};

    _.defaults(this, options);

    BaseView.prototype.initialize.call(this, options);

    this.tableSchema = this.tableSchema || this.collection.tableSchema;

    // initialize titlesHtml
    this.titlesHtml = this.titlesHtml ||
      crud.generateTableTitlesHtml(this.tableSchema);

    this.title = options.title || this.title || undefined;
    this.addBtnHidden = options.addBtnHidden || undefined;

    this.resource = this.resource || this.controller.resource || undefined;
    if (this.resource) this.resource = this.resource.toLowerCase();

    this.title = this.title || this.controller.collection.label ||
    this.controller.collection.name || '';

    this.queryForm = this.queryForm || undefined;

    this.listenTo(this.controller,'mode:change', this.onControllerModeChange);
  },

  onControllerModeChange: function(mode, prevMode){
    this.show(mode==='list');
  },

  setPermissions: function() {
    if (this.resource !== undefined) {
      html.enable(this.$('.btn.create'), app.user.can(this.resource, 'alta'));
    }
  },

  render: function() {

    this.template = _.template(tableTemplate);

    this.$el.html(this.template({ _title: this.title , _addBtnHidden : this.addBtnHidden }));

    this.$('#headers-view table thead tr').html(this.titlesHtml);

    this.pageLenView = new PageLenView({
       el: this.$('#page-len-view'), collection: this.collection, controller: this.controller
    }).render();

    this.pagesView = new PagesView({
      el: this.$('#pages-view'), collection: this.collection, controller: this.controller
    }).render();

    this.filterView = new FilterView({
      el: this.$('#filter-view'), collection: this.collection, controller: this.controller
    }).render();

     // enable/disable elements according to the user's permission
    this.setPermissions();

    // Se visualiza el panel abierto o no.
    if (this.queryForm !== undefined){
      this.showQueryForm(true);
    }


    return this;
  },

  events: {
    'click .btn.create'   : 'create',
    'click th[order]'     : 'order',
    'click .tOptions'     : 'showQueryForm'
  },

  order: function(e) {
    var th = $(e.currentTarget),
        direction = th.hasClass('order-asc') ? 'desc' : 'asc',
        order = this.setDirection(th.attr('order'), direction);

    this.$('th[order]').each(function() {
      $(this).removeClass('order-asc');
      $(this).removeClass('order-desc');
    });

    th.addClass('order-' + direction);
    this.controller.list( { order: order } );
  },

  setDirection: function(order, direction) {
    return _.map(order.split(','), function(field) {
      return field + ' ' + direction;
    }).join(',');
  },

  create: function() {
    this.controller.create();
  },

  showQueryForm: function(value) {
    var $queryView = this.$('.tablePars.advance');
    
    if (value===true){
       $queryView.show(200);
       return true;
    }

    $queryView.slideToggle(200);
    if ($queryView.is(':visible')) this.controller.queryView.focusFirst();
  },

  enableQuery: function(enable) {
    var button = this.$('.showQuery');
    if (enable) button.show();
    else        button.hide();
    return this;
  }

});

  return TableView;
});
