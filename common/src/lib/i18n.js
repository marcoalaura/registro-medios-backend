/* global Intl */

let supportedLocales = ['en', 'es'];
let _ = require('lodash');
let fs = require('fs');
let chalk = require('chalk');
let MessageFormat = require('intl-messageformat');

// TODO: fetch this dynamically based on overall blog settings (`key = "defaultLang"` in the `settings` table
let currentLocale = 'en';
let blos;

let I18n = {

  /**
  * Helper method to find and compile the given data context with a proper string resource.
  *
  * @param {string} path Path with in the JSON language file to desired string (ie: "errors.init.jsNotBuilt")
  * @param {object} [bindings]
  * @returns {string}
  */
  t: function t (path, bindings) {
    var string = I18n.findString(path);
    var msg;

    // If the path returns an array (as in the case with anything that has multiple paragraphs such as emails), then
    // loop through them and return an array of translated/formatted strings. Otherwise, just return the normal
    // translated/formatted string.
    if (_.isArray(string)) {
      msg = [];
      string.forEach(function (s) {
        var m = new MessageFormat(s, currentLocale);

        msg.push(m.format(bindings));
      });
    } else if (!string) {
      msg = null;
    } else {
      msg = new MessageFormat(string, currentLocale);
      msg = msg.format(bindings);
    }

    return msg;
  },

  /**
  * Parse JSON file for matching locale, returns string giving path.
  *
  * @param {string} msgPath Path with in the JSON language file to desired string (ie: "errors.init.jsNotBuilt")
  * @returns {string}
  */
  findString: function findString (msgPath) {
    var matchingString, path;
    // no path? no string
    if (_.isEmpty(msgPath) || !_.isString(msgPath)) {
      chalk.yellow('i18n:t() - received an empty path.');
      return '';
    }

    if (blos === undefined) {
      I18n.init();
    }

    matchingString = blos;

    path = msgPath.split('.');
    for (let i in path) {
      let key = path[i];
      if (matchingString[key]) {
        matchingString = matchingString[key];
      } else {
        return null;
        // return `Path not found: ${msgPath}`;
      }
    }

    if (_.isNull(matchingString)) {
      console.error('Unable to find matching path [' + msgPath + '] in locale file.\n');
      matchingString = 'i18n error: path "' + msgPath + '" was not found.';
    }

    return matchingString;
  },

  /**
  * Setup i18n support:
  *  - Load proper language file in to memory
  *  - Polyfill node.js if it does not have Intl support or support for a particular locale
  */
  init: function init (path = '/lang/', lang = 'es') {
    this.setLang(lang);
    // read file for current locale and keep its content in memory
    if (path[path.length - 1] !== '/') {
      path = path + '/';
    }
    blos = fs.readFileSync(path + currentLocale + '.json');

    // if translation file is not valid, you will see an error
    try {
      blos = JSON.parse(blos);
    } catch (err) {
      blos = undefined;
      throw err;
    }

    if (global.Intl) {
      // Determine if the built-in `Intl` has the locale data we need.
      var hasBuiltInLocaleData, IntlPolyfill;

      hasBuiltInLocaleData = supportedLocales.every(function (locale) {
        return Intl.NumberFormat.supportedLocalesOf(locale)[0] === locale &&
          Intl.DateTimeFormat.supportedLocalesOf(locale)[0] === locale;
      });

      if (!hasBuiltInLocaleData) {
        // `Intl` exists, but it doesn't have the data we need, so load the
        // polyfill and replace the constructors with need with the polyfill's.
        IntlPolyfill = require('intl');
        Intl.NumberFormat = IntlPolyfill.NumberFormat;
        Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
      }
    } else {
      // No `Intl`, so use and load the polyfill.
      global.Intl = require('intl');
    }
  },
  setLang: function (lang = 'es') {
    currentLocale = lang;
  }
};

module.exports = I18n;
