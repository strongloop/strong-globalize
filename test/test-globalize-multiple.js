// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';

var SG = require('../index');
var test = require('tap').test;

test('SetDefaultLanguage', function(t) {
  SG.SetRootDir(__dirname);
  SG.SetDefaultLanguage('en');
  systemLocale = global.STRONGLOOP_GLB.locale();
  t.assert(systemLocale && systemLocale.attributes &&
    systemLocale.attributes.bundle &&
    systemLocale.attributes.bundle === 'en',
  'System language is set to en.');
  SG.SetDefaultLanguage();
  var systemLocale = global.STRONGLOOP_GLB.locale();
  t.assert(systemLocale && systemLocale.attributes &&
    systemLocale.attributes.bundle &&
    systemLocale.attributes.bundle === 'en',
  'System language is set to en by default.');
  t.end();
});

test('formatMessage', function(t) {
  SG.SetRootDir(__dirname);
  SG.SetDefaultLanguage();
  var g = new SG();
  var params = {
    url: 'http:any.com',
    port: '12345',
  };
  var key = 'Error: {url} or {port} is invalid.';
  var message = g.t(key, params);
  t.comment(message);
  var targetMsg = 'Error: ' + params.url + ' or ' +
    params.port + ' is invalid.';
  t.equal(message, targetMsg, 'New instantiation works.');

  g.setLanguage({language: 'xx'});
  message = g.t(key, params);
  t.comment(message);
  targetMsg = 'Error: ' + params.url + ' or ' +
    params.port + ' is invalid.';
  t.equal(message, targetMsg,
    'setLanguage to invalid language defaults to English.');

  var gEn = SG({language: 'en'});
  message = gEn.t(key, params);
  t.comment(message);
  targetMsg = 'Error: ' + params.url + ' or ' +
    params.port + ' is invalid.';
  t.equal(message, targetMsg, 'Second g instance works.');

  g.setLanguage('ja');
  message = g.t(key, params);
  t.comment(message);
  targetMsg = 'Error:' + params.url + 'あるいは' +
    params.port + '無効です。';
  t.equal(message, targetMsg, 'setLanguage works.');

  var lang = g.getLanguage();
  t.equal(lang, 'ja', 'getLanauge works.');

  t.end();
});

test('formatNumber', function(t) {
  SG.SetRootDir(__dirname);
  SG.SetDefaultLanguage();
  var g = new SG();
  var value = 123456.789;
  var message = g.n(value);
  t.comment(message);
  var targetMsg = '123,456.789';
  t.equal(message, targetMsg,
    'New instantiation to default works.');

  var gE = SG({language: 'en'});
  message = gE.n(value);
  t.comment(message);
  targetMsg = '123,456.789';
  t.equal(message, targetMsg,
    'English instalce works.');

  g.setLanguage('de');
  message = g.n(value);
  t.comment(message);
  targetMsg = '123.456,789';
  t.equal(message, targetMsg,
    'Setting number format to German works.');

  t.end();
});

test('formatDate', function(t) {
  SG.SetRootDir(__dirname);
  SG.SetDefaultLanguage();
  var g = new SG();
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
  t.equal(message, targetMsg,
    'New instantiation to default works.');

  var gE = SG({language: 'en'});
  message = gE.d(date);
  t.comment(message);
  targetMsg = 'Dec 29, 2015, 7:40:50 PM';
  t.assert(message === targetMsg,
    'English instalce works.');

  g.setLanguage('de');
  message = g.d(date);
  t.comment(message);
  targetMsg = '29.12.2015, 19:40:50';
  t.assert(message === targetMsg,
    'Setting date format to German works.');

  t.end();
});

test('formatCurency', function(t) {
  SG.SetRootDir(__dirname);
  SG.SetDefaultLanguage();
  var g = new SG();
  var symbol = 'USD';
  var value = 123456.789;
  var message = g.c(value, symbol);
  t.comment(message);
  var targetMsg = '123,456.79 US dollars';
  t.equal(message, targetMsg,
    'New instantiation to default works.');

  var gE = SG({language: 'en'});
  message = gE.c(value, symbol);
  t.comment(message);
  targetMsg = '123,456.79 US dollars';
  t.equal(message, targetMsg,
    'English instalce works.');

  g.setLanguage('de');
  message = g.c(value, symbol);
  t.comment(message);
  targetMsg = '123.456,79 US-Dollar';
  t.equal(message, targetMsg,
    'Setting currency format to German works.');

  t.end();
});

test('throw Error', function(t) {
  SG.SetRootDir(__dirname);
  SG.SetDefaultLanguage();
  var gJa = new SG({language: 'ja'});
  var params = {
    url: 'http:any.com',
    port: '12345',
  };
  var key = 'Error: {url} or {port} is invalid.';
  try {
    throw gJa.Error(key, params);
  } catch (e) {
    var targetMsg = 'Error: Error:' + params.url + 'あるいは' +
      params.port + '無効です。';
    t.comment(e.toString());
    t.equal(e.toString(), targetMsg,
      'Error is correctly thrown and caught.');
  };
  t.end();
});
