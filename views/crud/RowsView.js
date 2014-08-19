/*globals define*/

define( [
    'lodash',
    'src/views/BaseView', 'src/views/crud/RowView', 'src/utils/crud'
  ], function(
    _,
    BaseView, RowView, crud
  ) {

'use strict';

var RowsView = BaseView.extend({

  name: 'RowsView',
  rowView: undefined,

  rowTemplate: undefined,

  initialize: function(options) {
    options = options || {};

    _.extend(this, options);

    BaseView.prototype.initialize.call(this, options);

    if (!this.collection) throw new Error('collection not specified!');

    this.listenTo(this.collection, 'reset', this.render);

    // #TODO: verificar que no rompemos nada con este cambio
    // this.listenTo(this.collection, 'change', this.render);

    this.tableSchema = this.tableSchema || this.collection.tableSchema;

    this.initRowView(options);
  },

  // allow to define another view or template for rendering the rows
  // dynamically generate default template from model's tableFields definition
  // if no template is specified
  initRowView: function(options) {

    this.RowView = options.rowView || this.RowView || RowView;

    var rowTemplate = options.rowTemplate ||
      crud.generateTableRowTemplate(this.tableSchema);

    this.rowTemplate = this.compileTemplate(rowTemplate);
  },

  render: function() {
    this.$el.empty();
    this.destroyViews();

    _.each(this.collection.models, function (model) {
      var view = new this.RowView({
        model      : model,
        collection : this.collection,
        controller : this.controller,
        template   : this.rowTemplate
      });
      this.$el.append(view.render().el);
      this.views.push(view);
    }, this);

    if (this.collection.filter) {
      crud.highlightItems(this.$('td'), this.collection.filter);
    }

    if (this.collection.length === 0) {
      if (this.collection.filter) {
        this.controller.warning('No se encontraron registros coincidentes con los criterios de búsqueda.');
      } else {
        this.controller.warning('No se encontraron registros.');
      }
    }

    return this;
  }

});

  return RowsView;
});


