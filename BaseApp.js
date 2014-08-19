/*globals define, app, require, console, window*/

define([
    'lodash', 'backbone', // 'src/BaseObject', // requireJS strange issue, DO NOT DELETE!!!


    'src/models/BaseModel',
    'src/controllers/LayoutController',
    'src/utils/loader/DynamicModuleLoader' // by default, dynamic loading


], function (
    _, Backbone,
    BaseObject,
// BaseModel, // requireJS strange issue, DO NOT DELETE!!!
LayoutController,
    ModuleLoader) {

    'use strict';

    var BaseApp = BaseObject.extend({

        initialize: function (options) {

            options = options || {};

            _.extend(this, options);

            this.started = false;

            if (!this.mode) throw new Error('app.mode not specified');
            if (!this.name) throw new Error('app.name not specified');
            if (!this.version) throw new Error('app.version not specified');
            if (!_.isString(this.rootUrl)) throw new Error('app.rootUrl not specified');
            if (!this.endpoint) throw new Error('app.endpoint not specified');

            if (!_.isBoolean(this.reloadController))
                throw new Error('app.reloadController not specified');

            this.user = undefined;

            this.meta = {
                application: undefined,
                endpoint: undefined
            };

            _.extend(this.meta, options.meta || {});

            if (!this.meta.permissionsEndpoint) throw new Error('app.meta.permissionsEndpoint not specified');
            if (!this.meta.usersEndpoint) throw new Error('app.meta.usersEndpoint not specified');

            if (!this.meta.application) throw new Error('app.meta.application not specified');

            if (!this.User) throw new Error('User class not specified');

            this.controller = this.controller || undefined;
            this.controllerModule = this.controllerModule || undefined;

            this.el = this.el || 'body';

            if (!this.menu.module || this.menu.module === 'none') {
                this.menu = this.menuView = false;
            } else {
                this.menu.module = this.menu.module || 'src/models/MenuCollection';
            }

            //this.menuModule = false;

            this.moduleLoader = this.moduleLoader || options.moduleLoader || new ModuleLoader();

            _.bindAll(this, 'onhashchange');

            this.reloadCounter = 0;

            // manually force a reload on hash change
            // to prevent memory leaks

            // use router!
            // window.onhashchange = this.onhashchange;

        },

        onhashchange: function () {
            var self = this,
                forceReload = false;

            if (this.reloadController) {
                forceReload = true;
            } else if (this.reloadThreshold !== -1 &&
                this.reloadCounter >= this.reloadThreshold) {
                console.log('reload threshold reached, forcing redirect');
                forceReload = true;
            }

            if (forceReload) {
                this.stopController();
                window.location.reload(true);
            } else {
                this.reloadCounter++;
                this.loadController(function (controller) {
                    // controller.start();
                    self.startController(controller);
                });
            }
        },

        stopController: function () {
            if (this.controller) {
                this.controller.destroy();
                this.controller = null;
            }
        },

        startController: function (Controller) {
            var controller;
            this.stopController();

            // if it's a class, intantiate it
            // otherwise it's an already instiated controller
            controller = (_.isFunction(Controller) ? new Controller() : Controller);

            this.controller = controller;
            this.started = true;
            this.controller.start();
        },

        // loads the user permission
        // the layoutController (read MenuCollection)
        // and instantiates the controller according to the url
        start: function (callback) {
            var self = this;

            this.started = false;

            if (!this.meta.mock) {
                // load permissions
                this.loadUser(function (user) {
                    self.user = user;
                });
            }

            self.loadLayoutController(function () {

                Backbone.history.start();
                // finally, load controller from the url
                // self.loadController(callback);
            });
        },

        loadLayoutController: function (callback) {
            // init layout dependencies values
            this.menuCollection = null;

            this.listenTo(this, 'layoutDependenciesLoaded', this.onLayoutDependenciesLoaded);

            if (this.menu && !this.menu.mock) {
                var self = this;
                require([this.menu.module], function (MenuCollection) {
                    self.menuCollection = new MenuCollection();
                    self.trigger('layoutDependenciesLoaded', callback);
                });
            } else {
                this.trigger('layoutDependenciesLoaded', callback);
            }
        },

        onLayoutDependenciesLoaded: function (callback) {
            this.LayoutController = this.LayoutController || LayoutController;

            // initialize layoutController
            this.layoutController = this.layoutController || new this.LayoutController({
                el: this.el,
                menuCollection: this.menuCollection,
                menuView: this.menuView
            });
            this.layoutController.start();
            callback();
        },

        loadController: function (callback) {
            var self = this;
            // unload the previously loaded controller
            if (this.controller) {
                this.controller.destroy();
                this.controller = null;
            }
            // got to load the controller form the url
            this.moduleLoader.loadFromUrl(
            // success handler

            function (Controller) {
                self.controller = new Controller();
                self.started = true;
                callback(self.controller);
            },
            // error

            function (err) {
                // modal error message, controller not found
                console.log(err);
                console.log('about to go to ' + app.rootUrl);
                // window.location.href = app.rootUrl;
                throw err;
            });
        },

        loadUser: function (callback) {
            var user = new this.User({
                config: this.meta,
                success: function (user) {
                    callback(user);
                }
            });
            return user;
        },

        startLoading: function (message) {
            this.layoutController.startLoading(message);
        },

        completeLoading: function (message) {
            this.layoutController.completeLoading(message);
        }

    });

    return BaseApp;
});