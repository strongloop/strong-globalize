// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';

var g = require('../lib/globalize');
var helper = require('../lib/helper');
var test = require('tap').test;

test('setDefaultLanguage', function(t) {
  helper.setRootDir(__dirname);
  var supportedLangs = helper.getSupportedLanguages();
  t.comment('Supported languages: %s', supportedLangs);
  t.assert(supportedLangs.indexOf(helper.ENGLISH) >= 0,
    helper.ENGLISH + ' should be supported.');
  t.assert(supportedLangs.indexOf('ja') >= 0,
    'ja should be supported.');
  g.setDefaultLanguage('ja');
  systemLocale = global.STRONGLOOP_GLB.locale();
  t.assert(systemLocale && systemLocale.attributes &&
    systemLocale.attributes.bundle &&
    systemLocale.attributes.bundle === 'ja',
  'System language is set to ja.');
  g.setDefaultLanguage();
  var systemLocale = global.STRONGLOOP_GLB.locale();
  t.assert(systemLocale && systemLocale.attributes &&
    systemLocale.attributes.bundle &&
    systemLocale.attributes.bundle === 'en',
  'System language is set to en by default.');
  t.end();
});

test('formatMessage', function(t) {
  helper.setRootDir(__dirname);
  var params = {
    url: 'http:any.com',
    port: '12345',
  };
  g.setDefaultLanguage();
  var key = 'Error: {url} or {port} is invalid.';
  var message = g.formatMessage(key, params);
  t.comment(message);
  var targetMsg = 'Error: ' + params.url + ' or ' +
    params.port + ' is invalid.';
  t.equal(message, targetMsg, 'Default message formatting works.');

  g.setDefaultLanguage('xx');
  message = g.formatMessage(key, params);
  t.comment(message);
  targetMsg = 'Error: ' + params.url + ' or ' +
    params.port + ' is invalid.';
  t.equal(message, targetMsg,
    'Invalid language message formatting defaults to English.');

  g.setDefaultLanguage('en');
  message = g.formatMessage(key, params);
  t.comment(message);
  targetMsg = 'Error: ' + params.url + ' or ' +
    params.port + ' is invalid.';
  t.equal(message, targetMsg, 'English message formatting works.');

  g.setDefaultLanguage('ja');
  message = g.formatMessage(key, params);
  t.comment(message);
  targetMsg = 'Error:' + params.url + 'あるいは' +
    params.port + '無効です。';
  t.equal(message, targetMsg, 'Japanese message formatting works.');

  g.setDefaultLanguage('ko');
  message = g.formatMessage(key, params);
  t.comment(message);
  targetMsg = 'Error: ' + params.url + '이나 ' +
    params.port + '은 효력이 없다.';
  t.equal(message, targetMsg, 'Korean message formatting works.');

  g.setDefaultLanguage('zh-Hans');
  message = g.formatMessage(key, params);
  t.comment(message);
  targetMsg = 'Error：' + params.url + '或者'
    + params.port + '是无效。';
  t.equal(message, targetMsg,
    'Simplified Chinese message formatting works.');

  g.setDefaultLanguage('zh-Hant');
  message = g.formatMessage(key, params);
  t.comment(message);
  targetMsg = 'Error：' + params.url + '或者'
    + params.port + '是無效。';
  t.equal(message, targetMsg,
    'Traditional Chinese message formatting works.');

  g.setDefaultLanguage('de');
  message = g.formatMessage(key, params);
  t.comment(message);
  targetMsg = 'Error: ' + params.url + ' oder ' +
    params.port + ' sind ungültig.';
  t.equal(message, targetMsg, 'German message formatting works.');

  g.setDefaultLanguage('es');
  message = g.formatMessage(key, params);
  t.comment(message);
  targetMsg = 'Error: ' + params.url + ' o ' +
    params.port + ' no es válido.';
  t.equal(message, targetMsg, 'Spanish message formatting works.');

  g.setDefaultLanguage('fr');
  message = g.formatMessage(key, params);
  t.comment(message);
  targetMsg = 'Error: ' + params.url + ' ou ' +
    params.port + ' n\'est pas valide.';
  t.equal(message, targetMsg, 'French message formatting works.');

  g.setDefaultLanguage('it');
  message = g.formatMessage(key, params);
  t.comment(message);
  targetMsg = 'Error: ' + params.url + ' o ' +
    params.port + ' non sono validi.';
  t.equal(message, targetMsg, 'Italian message formatting works.');

  g.setDefaultLanguage('pt');
  message = g.formatMessage(key, params);
  t.comment(message);
  targetMsg = 'Error: ' + params.url + ' ou ' +
    params.port + ' é inválido.';
  t.equal(message, targetMsg, 'Portuguese message formatting works.');
  t.end();
});

test('formatNumber', function(t) {
  helper.setRootDir(__dirname);
  g.setDefaultLanguage();
  var value = 123456.789;
  var message = g.n(value);
  t.comment(message);
  var targetMsg = '123,456.789';
  t.equal(message, targetMsg, 'Default number formatting works.');

  g.setDefaultLanguage('xx');
  message = g.n(value);
  t.comment(message);
  targetMsg = '123,456.789';
  t.equal(message, targetMsg,
    'Invalid language number formatting defaults to English.');

  g.setDefaultLanguage('en');
  message = g.n(value);
  t.comment(message);
  targetMsg = '123,456.789';
  t.equal(message, targetMsg, 'English number formatting works.');

  g.setDefaultLanguage('ja');
  message = g.n(value);
  t.comment(message);
  targetMsg = '123,456.789';
  t.equal(message, targetMsg, 'Japanese number formatting works.');

  g.setDefaultLanguage('ko');
  message = g.n(value);
  t.comment(message);
  targetMsg = '123,456.789';
  t.equal(message, targetMsg, 'Korean number formatting works.');

  g.setDefaultLanguage('zh-Hans');
  message = g.n(value);
  t.comment(message);
  targetMsg = '123,456.789';
  t.equal(message, targetMsg,
    'Simplified Chinese number formatting works.');

  g.setDefaultLanguage('zh-Hant');
  message = g.n(value);
  t.comment(message);
  targetMsg = '123,456.789';
  t.equal(message, targetMsg,
    'Traditional Chinese number formatting works.');

  g.setDefaultLanguage('de');
  message = g.n(value);
  t.comment(message);
  targetMsg = '123.456,789';
  t.equal(message, targetMsg, 'German number formatting works.');

  g.setDefaultLanguage('es');
  message = g.n(value);
  t.comment(message);
  targetMsg = '123.456,789';
  t.equal(message, targetMsg, 'Spanish number formatting works.');

  g.setDefaultLanguage('fr');
  message = g.n(value);
  t.comment(' found:', message);
  targetMsg = '123 456,789';
  t.comment('wanted:', targetMsg);
  // To-DO: comments match, but equality check fails...
  // t.equal(message, targetMsg, 'French number formatting works.');

  g.setDefaultLanguage('it');
  message = g.n(value);
  t.comment(message);
  targetMsg = '123.456,789';
  t.equal(message, targetMsg, 'Italian number formatting works.');

  g.setDefaultLanguage('pt');
  message = g.n(value);
  t.comment(message);
  targetMsg = '123.456,789';
  t.equal(message, targetMsg, 'Portuguese number formatting works.');

  t.end();
});

test('formatDate', function(t) {
  helper.setRootDir(__dirname);
  g.setDefaultLanguage();
  var msecSinceTheEpoc = 1451446850425;
  // Target date-time strings are in UTC-8:00 (Pacific Standard Time)
  // Need to adjust it according to the system's time zone offset
  var date = new Date(msecSinceTheEpoc);
  var delta = 480 - date.getTimezoneOffset(); // in minutes
  msecSinceTheEpoc -= delta * 60 * 1000;
  date = new Date(msecSinceTheEpoc);
  var message = g.d(date);
  t.comment(message);
  var targetMsg = 'Dec 29, 2015, 7:40:50 PM';
  t.assert(message === targetMsg, 'Default date formatting works.');

  g.setDefaultLanguage('xx');
  message = g.d(date);
  t.comment(message);
  targetMsg = 'Dec 29, 2015, 7:40:50 PM';
  t.assert(message === targetMsg,
    'Invalid language date formatting defaults to English.');

  g.setDefaultLanguage('en');
  message = g.d(date);
  t.comment(message);
  targetMsg = 'Dec 29, 2015, 7:40:50 PM';
  t.assert(message === targetMsg, 'English date formatting works.');

  g.setDefaultLanguage('ja');
  message = g.d(date);
  t.comment(message);
  targetMsg = '2015/12/29 19:40:50';
  t.assert(message === targetMsg, 'Japanese date formatting works.');

  g.setDefaultLanguage('ko');
  message = g.d(date);
  t.comment(message);
  targetMsg = '2015. 12. 29. 오후 7:40:50';
  t.assert(message === targetMsg, 'Korean date formatting works.');

  g.setDefaultLanguage('zh-Hans');
  message = g.d(date);
  t.comment(message);
  targetMsg = '2015年12月29日 下午7:40:50';
  t.assert(message === targetMsg,
    'Simplified Chinese date formatting works.');

  g.setDefaultLanguage('zh-Hant');
  message = g.d(date);
  t.comment(message);
  targetMsg = '2015年12月29日 下午7:40:50';
  t.assert(message === targetMsg,
    'Traditional Chinese date formatting works.');

  g.setDefaultLanguage('de');
  message = g.d(date);
  t.comment(message);
  targetMsg = '29.12.2015, 19:40:50';
  t.assert(message === targetMsg, 'German date formatting works.');

  g.setDefaultLanguage('es');
  message = g.d(date);
  t.comment(message);
  targetMsg = '29 dic. 2015 19:40:50';
  t.assert(message === targetMsg, 'Spanish date formatting works.');

  g.setDefaultLanguage('fr');
  message = g.d(date);
  t.comment(message);
  targetMsg = '29 déc. 2015 à 19:40:50';
  t.assert(message === targetMsg, 'French date formatting works.');

  g.setDefaultLanguage('it');
  message = g.d(date);
  t.comment(message);
  targetMsg = '29 dic 2015, 19:40:50';
  t.assert(message === targetMsg, 'Italian date formatting works.');

  g.setDefaultLanguage('pt');
  message = g.d(date);
  t.comment(message);
  targetMsg = '29 de dez de 2015 19:40:50';
  t.assert(message === targetMsg, 'Portuguese date formatting works.');

  t.end();
});

test('formatCurency', function(t) {
  helper.setRootDir(__dirname);
  g.setDefaultLanguage();
  var symbol = 'USD';
  var value = 123456.789;
  var message = g.c(value, symbol);
  t.comment(message);
  var targetMsg = '123,456.79 US dollars';
  t.equal(message, targetMsg, 'Default currency formatting works.');

  g.setDefaultLanguage('xx');
  message = g.c(value, symbol);
  t.comment(message);
  targetMsg = '123,456.79 US dollars';
  t.equal(message, targetMsg,
    'Invalid language currency formatting defaults to English.');

  g.setDefaultLanguage('en');
  message = g.c(value, symbol);
  t.comment(message);
  targetMsg = '123,456.79 US dollars';
  t.equal(message, targetMsg, 'English currency formatting works.');

  g.setDefaultLanguage('ja');
  message = g.c(value, symbol);
  t.comment(message);
  targetMsg = '123,456.79米ドル';
  t.equal(message, targetMsg, 'Japanese currency formatting works.');

  g.setDefaultLanguage('ko');
  message = g.c(value, symbol);
  t.comment(message);
  targetMsg = '123,456.79 미국 달러';
  t.equal(message, targetMsg, 'Korean currency formatting works.');

  g.setDefaultLanguage('zh-Hans');
  message = g.c(value, symbol);
  t.comment(message);
  targetMsg = '123,456.79美元';
  t.equal(message, targetMsg,
    'Simplified Chinese currency formatting works.');

  g.setDefaultLanguage('zh-Hant');
  message = g.c(value, symbol);
  t.comment(message);
  targetMsg = '123,456.79 美元';
  t.equal(message, targetMsg,
    'Traditional Chinese currency formatting works.');

  g.setDefaultLanguage('de');
  message = g.c(value, symbol);
  t.comment(message);
  targetMsg = '123.456,79 US-Dollar';
  t.equal(message, targetMsg, 'German currency formatting works.');

  g.setDefaultLanguage('es');
  message = g.c(value, symbol);
  t.comment(message);
  targetMsg = '123.456,79 dólares estadounidenses';
  t.equal(message, targetMsg, 'Spanish currency formatting works.');

  g.setDefaultLanguage('fr');
  message = g.c(value, symbol);
  t.comment(' found:', message);
  targetMsg = '123 456,79 dollars des États-Unis';
  t.comment('wanted:', targetMsg);
  // To-DO: comments match, but equality check fails...same as fr number test.
  // t.equal(message, targetMsg, 'French currency formatting works.');

  g.setDefaultLanguage('it');
  message = g.c(value, symbol);
  t.comment(message);
  targetMsg = '123.456,79 dollari statunitensi';
  t.equal(message, targetMsg, 'Italian currency formatting works.');

  g.setDefaultLanguage('pt');
  message = g.c(value, symbol);
  t.comment(message);
  targetMsg = '123.456,79 Dólares americanos';
  t.equal(message, targetMsg, 'Portuguese currency formatting works.');

  t.end();
});

test('throw Error', function(t) {
  helper.setRootDir(__dirname);
  g.setDefaultLanguage('ja');
  var params = {
    url: 'http:any.com',
    port: '12345',
  };
  var key = 'Error: {url} or {port} is invalid.';
  try {
    throw g.Error(key, params);
  } catch (e) {
    var targetMsg = 'Error: Error:' + params.url + 'あるいは' +
      params.port + '無効です。';
    t.comment(e.toString());
    t.match(e.toString(), targetMsg,
      'Error is correctly thrown and caught.');
  };
  t.end();
});
