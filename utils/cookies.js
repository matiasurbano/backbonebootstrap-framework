/*globals define, document*/

define( [
  ], function(
  ) {

'use strict';

var cookies = {};

/**
 * Loads the configuration from an environemnt.
 *
 *
 */
cookies.set = function(name, value, path, secondsToExpire) {

  var cookie = '';

  if (!name) return false;

  cookie = name +'=' + (value === null || value === undefined ? '' : value);

  cookie += '; path=' + (path || '/');

  // clear the cookie, set it to expire a day before
  if (value === null) {
    cookie += '; expires=' + (new Date(1970, 0, 1)).toGMTString();
  } else if (secondsToExpire) {
    cookie += '; expires=' + cookies.dateFromNow(secondsToExpire).toGMTString();
  }

  document.cookie = cookie;

  return true;
};

cookies.clear = function(name, path) {
  return cookies.set(name, null, path);
};

cookies.get = function(name) {
  return cookies.getAll()[name];
};

cookies.getAll = function() {

  var dict = {},
      pairs = document.cookie.split('; '),
      pair, name, value;

  for (var i=0; i<pairs.length; i++) {
    pair = pairs[i].split('=');

    name = pair[0];
    value = (pair.length > 1) ? pair[1] : '';

    dict[name] = value;
  }

  return dict;
};

/*
 * Returns a new date seconds away from baseDate
 *
 */
cookies.dateFromNow = function(seconds, baseDate) {

  // current date by default
  if (!baseDate) baseDate = new Date();

  // zero seconds by default
  if (!seconds) seconds = 0;

  return new Date(baseDate.getTime() + (seconds * 1000));
};

  return cookies;
});
