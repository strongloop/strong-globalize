// Copyright IBM Corp. 2016. All Rights Reserved.
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
SG.SetAppLanguages();

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

test('accept-language header', function(t) {
  var req = {
    headers: {
      'accept-language': 'en',
    },
  };
  var message = g.http(req).f('Test message');
  t.equal(message, 'Test message');
  t.end();
});
