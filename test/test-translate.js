// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var SG = require('../index');
var helper = require('../lib/helper');
var path = require('path');
var test = require('tap').test;
var translate = require('../lib/translate');


test('setTranslationUnit', function(t) {
  var LB = 1;
  var UB = translate.GPB_MAX_NUMBER_OF_KEYS;
  t.match(translate.setTranslationUnit(null), UB, 'null');
  t.match(translate.setTranslationUnit(undefined), UB, 'undefined');
  t.match(translate.setTranslationUnit('string'), UB, 'string');
  t.match(translate.setTranslationUnit(-1), LB, '-1');
  t.match(translate.setTranslationUnit(0), LB, '0');
  t.match(translate.setTranslationUnit(LB - 1), LB, 'lower bound - 1');
  t.match(translate.setTranslationUnit(UB + 1), UB, 'upper bound + 1');
  t.match(translate.setTranslationUnit(1.234), 1, '1.234');
  t.match(translate.setTranslationUnit(1.567), 2, '1.567');
  t.match(translate.setTranslationUnit('1.234'), UB, '1.234 in string');
  t.match(translate.setTranslationUnit('1.567'), UB, '1.567 in string');
  t.end();
});

test('language mapping for GPB', function(t) {
  helper.enumerateLanguageSync(function(lang) {
    t.equal(
      translate.reverseAdjustLangFromGPB(
        translate.adjustLangForGPB(lang)), lang,
      'Adjust and reversing the lang gives the original.');
  });
  t.end();
});

SG.SetRootDir(__dirname);
SG.SetDefaultLanguage();
var g = SG();

test('register resource tag', function(t) {
  var rootDir = path.resolve(__dirname);
  var lang = helper.ENGLISH;
  var txtFile = 'test-help.txt';
  var hash = helper.msgFileIdHash(txtFile, rootDir);
  var tagType = 'test_tag';
  t.notOk(helper.resTagExists(hash, txtFile, lang, tagType),
    'Res tag should not exist.');
  t.ok(helper.registerResTag(hash, txtFile, lang, tagType),
    'Res tag should be successfully registered.');
  t.ok(helper.resTagExists(hash, txtFile, lang, tagType),
    'Res tag should exist.');
  t.end();
});

test('load message', function(t) {
  var template = 'Error: {url} or {port} is invalid.';
  var message = g.t(template, {url: 'localhost', port: 8123});
  var targetMsg = 'Error: localhost or 8123 is invalid.';
  t.equal(message, targetMsg,
    'Passing no variables returns the template as-is.');
  t.end();
});

test('remove double curly braces', function(t) {
  var source = {msgError: 'Error: {{HTTP}} err.'};
  var targetMsg = 'Error: HTTP err.';
  translate.removeDoubleCurlyBraces(source);
  t.equal(source.msgError, targetMsg,
    'Remove double curly braces.');
  t.end();
});
