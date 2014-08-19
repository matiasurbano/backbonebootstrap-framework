/*globals require*/
'use strict';

// Set the require.js configuration file for your application
require.config({

  baseUrl: '.',

  deps: ['main'],

  paths: {
    'src': '..',
    'jasmine':      'lib/jasmine-1.3.1/jasmine.min',
    'jasmine-html': 'lib/jasmine-1.3.1/jasmine-html.min',
    'lib':          '../../lib',

    jquery       : '../../lib/jquery-1.9.1.min',
    jqueryui     : '../../lib/jquery-ui-1.8.21.custom.min',

    moment       : '../../lib/moment-2.0.0.min',
    datepicker   : '../../lib/bootstrap-datepicker-1.0.1.min',

    select2         : '../../lib/select2-3.3.2.min',
    select2_locale  : '../../lib/select2_locale_es-3.3.2.min',
    jqueryuiwidget  : '../../lib/jquery.ui.widget',
    gritter      : '../../lib/jquery.gritter-1.7.4',
    // custom built with `lodash underscore plus="clone,cloneDeep"`
    lodash       : '../../lib/lodash.custom-1.2.1.min',
    backbone     :'../../lib/backbone-1.0.0.min',
    bootstrap    : '../../lib/bootstrap-2.3.1.min',
    // requirejs plugin
    text         : '../../lib/text-2.0.6.min',
    //Fileuploader plugins
    fileuploadjs : '../../lib/jquery.fileupload',
    tmpl         : '../../lib/tmpl.min',
    jqueryiframetransport : '../../lib/jquery.iframe-transport',
    jqueryfileuploadui    : '../../lib/jquery.fileupload-ui',
    loadimage             : '../../lib/load-image.min',
    jqueryfileuploadfp    : '../../lib/jquery.fileupload-fp',
    canvastoblob          : '../../lib/canvas-to-blob.min'
  },

  shim: {
    jasmine: {
      deps: ['jquery'],
      exports: 'jasmine'
    },
    'jasmine-html': {
      deps: ['jasmine'],
      exports: 'jasmine-html'
    },
    lodash: {
      exports: '_'
    },
    backbone: {
      deps    : ['lodash', 'jquery'],
      exports : 'Backbone'
    },
    bootstrap: {
      deps: ['jquery']
    },
    jqueryui: {
      deps: ['jquery']
    },
    jqueryuiwidget:{
      deps: ['jquery', 'jqueryui']
    },
    select2: {
      deps: ['jquery']
    },
    select2_locale: {
      deps: ['select2']
    },
    datepicker: {
      deps: ['jqueryuiwidget']
    },
    fileuploadjs: {
      deps: ['jquery', 'jqueryui', 'jqueryuiwidget']
    }
  }
});
