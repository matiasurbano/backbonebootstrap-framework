/*globals define, app, window*/

define([
    'jquery', 'lodash',
    'src/controllers/BaseController'
], function (
    $, _,
    BaseController) {

    'use strict';

    var ApplicationController = BaseController.extend({

        baseUrl: '',

        started: false,

        initialize: function (options) {

            options = options || {};
            this.previousHash = window.location.hash;

            _.extend(this, options);

            // super.initialize
            BaseController.prototype.initialize.call(this, options);

            // don't want default Backbone el
            if (this.el.outerHTML === '<div></div>') this.el = undefined;

            this.el = options.el || this.el || '#controller-container';
            if (!this.el) throw new Error('el variable not specified!');

            if ($(this.el).length === 0) throw new Error('could not find dom element for el');

        },

        // override destroy method
        // we don't want to remove the dom element
        // just clean it
        destroy: function (options) {
            options = options || {};
            options.remove = false;
            this.clear();
            return BaseController.prototype.destroy.call(this, options);
        },

        start: function () {
            this.started = true;
            return this;
        },

        success: function (message) {
            return app.layoutController.success(message);
        },
        info: function (message) {
            return app.layoutController.info(message);
        },
        error: function (message) {
            return app.layoutController.error(message);
        },
        warning: function (message) {
            return app.layoutController.warning(message);
        },

        modalMessage: function (message, callback) {
            app.layoutController.modalMessage(message, callback);
        },
        modalError: function (message, callback) {
            app.layoutController.modalError(message, callback);
        },
        modalConfirm: function (message, callback) {
            app.layoutController.modalConfirm(message, callback);
        },
        modalConfirmDelete: function (message, callback) {
            app.layoutController.modalConfirmDelete(message, callback);
        }

    });

    return ApplicationController;
});