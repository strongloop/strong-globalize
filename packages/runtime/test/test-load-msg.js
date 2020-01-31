// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var SG = require('../lib/index');
var helper = SG.helper;
var path = require('path');
var test = require('tap').test;

SG.SetRootDir(__dirname);
SG.SetDefaultLanguage();
SG.SetAppLanguages(['en', 'zh-Hans', 'zh-Hant']);

var g = new SG();

test('register resource tag', function(t) {
  var rootDir = path.resolve(__dirname);
  var lang = helper.ENGLISH;
  var txtFile = 'test-help.txt';
  var hash = helper.msgFileIdHash(txtFile, rootDir);
  var tagType = 'test_tag';
  t.notOk(
    helper.resTagExists(hash, txtFile, lang, tagType),
    'Res tag should not exist.'
  );
  t.ok(
    helper.registerResTag(hash, txtFile, lang, tagType),
    'Res tag should be successfully registered.'
  );
  t.ok(
    helper.resTagExists(hash, txtFile, lang, tagType),
    'Res tag should exist.'
  );
  t.end();
});

test('load message', function(t) {
  var template = 'Error: {url} or {port} is invalid.';
  var message = g.t(template, {url: 'localhost', port: 8123});
  var targetMsg = 'Error: localhost or 8123 is invalid.';
  t.equal(
    message,
    targetMsg,
    'Passing no variables returns the template as-is.'
  );
  t.end();
});

test('remove double curly braces', function(t) {
  var source = {msgError: 'Error: {{HTTP}} err.'};
  var targetMsg = 'Error: HTTP err.';
  helper.removeDoubleCurlyBraces(source);
  t.equal(source.msgError, targetMsg, 'Remove double curly braces.');
  t.end();
});
test('no accept-language header', function(t) {
  var req = {
    headers: {
      accept: 'application/json',
    },
  };
  var message = g.http(req).f('Test message');
  t.equal(message, 'Test message');
  t.end();
});
test('empty accept-language header', function(t) {
  var req = {
    headers: {
      'accept-language': '',
    },
  };
  var message = g.http(req).f('Test message');
  t.equal(message, 'Test message');
  t.end();
});
test('accept-language header - *', function(t) {
  var req = {
    headers: {
      'accept-language': '*',
    },
  };
  var message = g.http(req).f('Test message');
  t.equal(message, 'Test message');
  t.end();
});
test('accept-language header - en', function(t) {
  var req = {
    headers: {
      'accept-language': 'en',
    },
  };
  var message = g.http(req).f('Test message');
  t.equal(message, 'Test message');
  t.end();
});

test('accept-language header - alias', function(t) {
  var req = {
    headers: {
      // alias to 'zh-Hans'
      'accept-language': 'zh-cn',
    },
  };

  // create a SG instance for language 'zh-Hans' and register it
  var sg_hans = new SG({language: 'zh-Hans'});
  SG.sgCache.set('zh-Hans', sg_hans);

  var cachedSg = g.http(req);
  t.equal(cachedSg.getLanguage(), 'zh-Hans');
  t.end();
});

test('multiple, weighted, accept-language header with alias', function(t) {
  var req = {
    headers: {
      'accept-language':
        'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7 zh-cn;q=0.7, zh-tw;q=0.9 *;q=0.5',
    },
  };
  // create a SG instance for language 'zh-Hans' and register it
  var sg_hant = new SG({language: 'zh-Hant'});
  SG.sgCache.set('zh-Hant', sg_hant);

  var cachedSg = g.http(req);
  t.equal(cachedSg.getLanguage(), 'zh-Hant');

  var message = g.http(req).f('log');
  t.equal(message, '原木');
  t.end();
});
