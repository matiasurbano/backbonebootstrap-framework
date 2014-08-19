/*globals define, app, console*/

define([
    'jquery', 'lodash',
    'src/controllers/ApplicationController',
    'text!src/views/crud/crud.html',
    'src/views/crud/TableView', 'src/views/crud/RowsView', 'src/views/crud/SelectedRowsView',
    'src/views/crud/FormView', 'src/views/crud/QueryView'
], function (
    $, _,
    ApplicationController,
    crudTemplate,
    TableView, RowsView, SelectedRowsView,
    FormView, QueryView) {

    'use strict';

    var CrudController = ApplicationController.extend({

        initialize: function (options) {
            var defaults = {
                el: undefined,
                $el: undefined,
                $crudEl: undefined,

                readOnly: false,
                name: undefined,
                label: undefined,
                fullName: undefined,

                mode: undefined, // list, show, create, update, delete
                model: undefined,

                addBtnHidden: false,

                queryParams: {},

                TableView: TableView,
                RowsView: RowsView,
                FormView: FormView,
                QueryView: QueryView,

                formTemplate: undefined,
                queryTemplate: undefined, // initally we are in browse mode, no current model

                ActionsViews: []

            };

            options = options || {};

            // take defaults
            _.defaults(this, defaults);
            // override with options
            _.extend(this, options);

            // super.initialize
            ApplicationController.prototype.initialize.call(this, options);

            _.bindAll(this, 'list', 'filter', 'edit', 'save', 'saveSuccess', 'del');

            if (!this.Collection) throw new Error('Collection not specified!');

            this.Model = this.Model || this.Collection.prototype.model || undefined;
            if (!this.Model) throw new Error('Model not specified!');

            // try get the resource from the collection
            if (this.resource === undefined) {
                this.resource = this.Collection.prototype.resource || undefined;
            }

            if (this.resource !== undefined) {
                this.readOnly = this.readOnly || app.user.canReadOnly(this.resource);
            }

            if (this.fetchOnStart === undefined) {
                this.fetchOnStart = this.fetchOnStart || true; // will fetch by default
            }

            if (this.fetchOnEdit === undefined) {
                this.fetchOnEdit = this.fetchOnEdit || false; 
            }

            

            //#TODO - send user back to home controller
            if (this.resource && !app.user.can(this.resource, '*')) {
                console.error('error permission denied, resource: %s', this.resource);
                this.modalError('No tiene permisos para consultar esta información');
            }

            // try to get the name from the collection
            this.name = this.name || this.Collection.prototype.name || undefined;
            if (!this.name) throw new Error('Name not specified!');
            this.label = this.label || this.Collection.prototype.label || this.name;

            this.fullName = this.fullName || this.name;

            this.tableTitle = options.tableTitle || undefined;
            this.formTitle = options.formTitle || undefined;
            // this.addBtnHidden = this.addBtnHidden || options.addBtnHidden || undefined;

            // instantiate collection
            this.collection = new this.Collection();

            this.crudTemplate = this.crudTemplate || crudTemplate || undefined;
            if (!this.crudTemplate) throw new Error('Crud template not specified!');

            // create the div that will contain all the child forms
            // and initialized this.$el and this.$crudEl
            this.createContainer();

            this.TableView = this.TableView || TableView;

            this.filterBy = this.filterBy || undefined;

            if (!this.tableView) {
                // table view is initially rendered
                // no need to wait for the collection to be fetched
                this.tableView = new this.TableView({
                    title: this.tableTitle,
                    controller: this,
                    el: this.$crudEl.find('.table-view'),
                    collection: this.collection,
                    addBtnHidden: this.addBtnHidden,
                    queryForm: this.queryForm //how the advaced search will render.
                }).render();
            }

            if (!this.queryView) {
                // initially rendered
                // no need to wait for the collection to be fetched
                this.queryView = new this.QueryView({
                    controller: this,
                    el: this.$crudEl.find('.tablePars.advance'),
                    template: this.queryTemplate,
                    collection: this.collection
                }).render();
            }

            if (this.query === false) this.enableQuery(false);

            if (!this.rowsView) {
                // will render on collection reset (when it's finally fetched)
                this.rowsView = new this.RowsView({
                    controller: this,
                    el: this.$crudEl.find('.table-view tbody'),
                    collection: this.collection
                });
            }

            if (!this.formView) {
                // will render on create, edit, del
                this.formView = new this.FormView({
                    title: this.formTitle,
                    controller: this,
                    el: this.$crudEl.find('.form-view'),
                    template: this.formTemplate,
                    collection: this.collection,
                    addBtnHidden: this.addBtnHidden,
                    customActions: this.customActions
                });
            }

            this.addViews([this.tableView, this.queryView, this.rowsView, this.formView]);

            this.createActionsViews()
        },

        createActionsViews: function () {
            _.each(this.ActionsViews, function (actionView) {

                var options = actionView.options || {};

                var $actionEl = this.$crudEl.find('.action-view#' + actionView.name);
                if ($actionEl.length === 0)
                    throw new Error('could not find el for view "' + actionView.name + '"');

                options.controller = this;
                options.el = $actionEl;

                // Evito que renderice ni bien agrega la vista al controller.
                // TODO: Hacerlo opcional con option?
                // this.ActionsViews[actionView.name] = new actionView.entity(options).render();
                this.ActionsViews[actionView.name] = new actionView.entity(options);

            }, this);
        },

        /**
         * Generates the html container of the crud forms and assign this.$el and
         * this.$crudEl.
         *
         * @chainable
         *
         * Generates the container for an html like the following
         *
         * <div id="controller-container" class="container">
         *   <div id="Invoice-crud">
         *     <div class="header-view"></div>
         *     <div class="table-view" style=""></div>
         *     <div class="form-view" style="display: none;"></div>
         *   </div>
         * </div>
         *
         */
        createContainer: function () {
            var crudId = this.fullName + '-crud';

            this.$el = $(this.el);

            var crudHtml = _.template(this.crudTemplate, {
                crudId: crudId
            });

            this.$el.append(crudHtml);

            this.$crudEl = this.$el.find('#' + crudId);

            this.createPanelsContainer();

            return this;
        },

        createPanelsContainer: function () {

            // no actionViews, nothing to do
            if (this.ActionsViews.length === 0) return this;

            // look for a div with id panels-view to insert panels
            var $panelsEl = this.$crudEl.find('.panels-view');
            if ($panelsEl.length === 0) throw new Error('no #panels-view element found in template');

            var html = _.map(this.ActionsViews, function (actionView) {
                return '<div class="action-view" id="' + actionView.name + '"></div>';
            }).join('\n');

            $panelsEl.replaceWith(html);

            return this;
        },

        hide: function () {
            this.$crudEl.hide();
        },

        show: function () {
            this.$crudEl.show();
        },

        enableQuery: function (enable) {
            this.tableView.enableQuery(enable);
        },

        // to be overwritten by CrudParentController class
        isParent: function () {
            return false;
        },

        // to be overwritten by CrudChildController class
        isChild: function () {
            return false;
        },

        /**
         * Initially starts in list mode.
         *
         * This fires the fetching of the collection, which will itself fire
         * the rendering of rowsView.
         *
         * @param  {Object} options Options to pass to super.start
         *
         * @chainable
         */
        start: function (options) {
            // already started, just exit
            if (this.started) return this;
            ApplicationController.prototype.start.call(this, options);

            // will fetch the list
            if (this.fetchOnStart) {
                this.list();
            }

            return this;
        },

        filter: function (filterCondition) {
            this.list({
                filter: filterCondition,
                filterBy: this._filterBy()
            });
            return this;
        },

        /**
         * Helper function to calculate the filterBy string
         *
         * The filterBy string is built based on the field show in the table view
         *
         * It also saves the calculated filterBy value in this.filterBy
         * @return {[type]} [description]
         */
        _filterBy: function () {
            if (this.filterBy) return this.filterBy;

            var tempModel = new this.collection.model(),
                filterBy = _.map(tempModel.tableFields, function (field) {
                    return _.result(field, 'filterBy');
                }).join(',');

            this.filterBy = filterBy;
            return filterBy;
        },

        list: function (queryParams) {
            this.model = undefined;
            this.setMode('list');

            _.extend(this.queryParams, queryParams);

            this.collection.setParams(this.queryParams).fetch();

        },

        update: function (id) {
            this.edit(id);
        },

        create: function () {
            this.edit();
        },

        setMode: function (mode) {
            var prevMode = this.mode;
            this.mode = mode;
            this.trigger('mode:change', mode, prevMode);
        },

        edit: function (id) {
            var self = this;

            if (id) { // update
                this.model = this.collection.get(id);
                this.setMode(this.readOnly ? 'show' : 'update');
            } else { // create
                this.model = new this.Model();
                this.setMode('create');
            }

            if (this.fetchOnEdit){
                this.model.fetch({success : function(data){
                    self.formView.resetModel(data).render().show();    
                }}); 
                
            }else{
                this.formView.resetModel(this.model).render().show();
            }
            
        },

        save: function () {
            if (this.model.isNew()) {
                this.collection.create(this.model, {
                    success: this.saveSuccess
                });
            } else {
                this.model.save(null, {
                    success: this.saveSuccess
                });
            }
        },

        saveSuccess: function (model, resp) {
            var msg = 'La operación ha sido exitosa.';

            switch (this.mode) {
            case 'delete':
                msg = 'El registro ha sido eliminado con éxito.';
                break;
            case 'update':
                msg = 'El registro ha sido modificado con éxito.';
                break;
            case 'create':
                msg = 'El registro ha sido creado con éxito.';
                break;
            }

            this.list();
            this.success(msg);
        },

        del: function (id) {
            var self = this,
                prevMode = this.mode;

            this.setMode('delete');

            this.model = this.collection.get(id);
            if (!this.model) {
                this.list();
                this.error('El registro especificado no se ha encontrado');
                return this;
            }

            this.modalConfirmDelete(function () {
                self.model.destroy({
                    wait: true,
                    success: function () {
                        self.list();
                        self.info('El registro se ha eliminado con éxito');
                    },
                    error: function () {
                        // self.mode = prevMode;
                        self.setMode(prevMode);
                        self.error('No se ha podido eliminar el registro');
                    }
                });
            });

            return this;
        }

    });

    return CrudController;
});