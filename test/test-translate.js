var SG = require('../index');
var helper = require('../lib/helper');
var path = require('path');
var test = require('tap').test;
var translate = require('../lib/translate');

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
  var tagType = 'test_tag';
  t.notOk(helper.resTagExists(rootDir, lang, tagType),
    'Res tag should not exist.');
  t.ok(helper.registerResTag(rootDir, lang, tagType),
    'Res tag should be successfully registered.');
  t.ok(helper.resTagExists(rootDir, lang, tagType),
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
