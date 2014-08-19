/*globals require, jasmine*/

require(
  [
    'jasmine-html',
    'spec/BaseObject_initOptions.spec'
    // 'spec/convert.spec'
    // 'spec/crud.spec'
  ],
function() {
  'use strict';

  jasmine.getEnv().addReporter(new jasmine.HtmlReporter());
  jasmine.getEnv().execute();
});
