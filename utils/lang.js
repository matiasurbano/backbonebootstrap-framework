/*globals define*/

define([
  ], function(
  ) {

'use strict';

var lang = {};


/**
 * Returns the plural form of a word
 *
 * @param  {String}     singular The word in it's singular form
 * @param  {language}   languages supported so far: es (spanish)
 * @return {String}     The word in it's plural form
 *
 * @example
 *
 * lang.toPlural('yo')        -> "yoes"
 * lang.toPlural('canción')   -> "canciones"
 * lang.toPlural('plural')    -> "plurales"
 * lang.toPlural('coraza')    -> "corazas"
 */
lang.plural = function(singular, language) {
  var rules, reg, key;

  language = language || 'es';

  // http://conpropositodeenmienda.blogspot.com.ar/2011/12/normas-para-la-formacion-del-plural.html
  if (language === 'es') {

    rules = {
      '^(yo|no)$'                  : '$1es',        // excepciones, yo, no
      '(.*)(ón)$'                  : '$1ones',      // terminadas en ón
      '(.*)(án)$'                  : '$1anes',      // terminadas en án
      '(.*)(i|u|í|í|l|r|n|d|z|j)$' : '$1$2es',      // terminadas en
      '(.*)$'                      : '$1s'          // el resto
    };

    for (key in rules) {
      reg = new RegExp(key);
      if (singular.match(reg)) return singular.replace(reg, rules[key]);
    }
    return singular;
  }
};

/**
 * Returns the singular form of a plural word
 *
 * @param  {String}     plural The word in it's plural form
 * @param  {language}   languages supported so far: es (spanish)
 * @return {String}     The word in it's singular form
 *
 * @example
 *
 * lang.toSingular('yoes')        -> "yo"
 * lang.toSingular('canciones')   -> "canción"
 * lang.toSingular('plurales')    -> "plural"
 * lang.toSingular('corazas')    -> "coraza"
 */
lang.singular = function(plural, language) {
  var rules, reg, key;

  language = language || 'es';

  // http://conpropositodeenmienda.blogspot.com.ar/2011/12/normas-para-la-formacion-del-plural.html
  if (language === 'es') {

    rules = {
      '^(yo|no)es$'                   : '$1',           // excepciones, yo, no
      '(.*)(ones)$'                   : '$1ón',         // terminadas en ón
      '(.*)(anes)$'                   : '$1án',         // terminadas en án
      '(.*)(i|u|í|í|l|r|n|d|z|j)es$'  : '$1$2',         // terminadas en
      '(.*)s$'                        : '$1'            // el resto
    };

    for (key in rules) {
      reg = new RegExp(key);
      if (plural.match(reg)) return plural.replace(reg, rules[key]);
    }
    return plural;
  }
};

  return lang;
});
