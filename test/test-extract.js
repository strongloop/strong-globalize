// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var g = require('../lib/globalize');
var helper = require('../lib/helper');
var extract = require('../lib/extract');
var test = require('tap').test;

var testFileName = 'test-extract.js';

var content_singleton_head = '// line 1\n//line 2\n//line 3\n' +
  'var g = require("strong-globalize");\n';
var content_multiple_head = '// line 1\n//line 2\n//line 3\n' +
  'var g = require("strong-globalize")();\n';
var content_singleton_body = 'function test() {\n' +
  '  return g.Error(\'This is an error.\');\n' +
  '}\n' +
  'var msg = g.t(\'left half of t\' + \' and right half of t\');\n' +
  'msg = g.formatMessage(\'formatMessage\');\n' +
  'g.error    (\'error\');\n' +
  'g.log  (\'log\');\n' +
  'g.info    (\'info\');\n' +
  'g.warn   (\'warn\');\n' +
  'g.ewrite(\'ewrite\');\n' +
  'g.owrite       (\'owrite\');\n' +
  'g.write(\'write\');\n' +
  'g.help(\'write1\');\n' +
  'g.silly(\'write2\');\n' +
  'msg = g.format(\'format of %s and %s\', \'zero\', \'one\');\n' +
  'msg = g.format(\'format of {0} and {1}\', \'zero\', \'one\');\n' +
  'msg = g.f(\'format of {zero} and {one}\', \n' +
  '  {zero: \'zero\', one: \'one\'});\n';

test('extract from JS and fill-in with singleton head',
  subTest.bind(content_singleton_head + content_singleton_body,
  'singleton_head + singleton_body'));
test('extract from JS and fill-in with multiple head',
  subTest.bind(content_multiple_head + content_singleton_body,
  'multiple_head + singleton_body'));

var content_multiple = 'var SG = require("strong-globalize");\n' +
  'var Q = require("strong-globalize")();\n' +
  'var g = SG();\n' +
  'var N = new SG();\n' +
  'function test() {\n' +
  '  return g.Error(\'This is an error.\');\n' +
  '}\n' +
  'var msg = Q.t(\'left half of t\' + \' and right half of t\');\n' +
  'msg = N.formatMessage(\'formatMessage\');\n' +
  'g.error    (\'error\');\n' +
  'Q.log  (\'log\');\n' +
  'N.info    (\'info\');\n' +
  'g.warn   (\'warn\');\n' +
  'Q.ewrite(\'ewrite\');\n' +
  'N.owrite       (\'owrite\');\n' +
  'g.write(\'write\');\n' +
  'Q.prompt(\'write1\');\n' +
  'N.verbose(\'write2\');\n' +
  'msg = Q.data  (\'format of %s and %s\', \'zero\', \'one\');\n' +
  'msg = N.format(\'format of {0} and {1}\', \'zero\', \'one\');\n' +
  'msg = g.f(\'format of {zero} and {one}\', \n' +
  '  {zero: \'zero\', one: \'one\'});\n';

test('extract from JS and fill-in with multiple',
  subTest.bind(content_multiple, 'content_multiple'));

var content_multiple_new = '// line 1\n//line 2\n' +
  'var SG = require("strong-globalize");\n' +
  'var g = new SG();\n' +
  'function test() {\n' +
  '  return g.input(\'This is an error.\');\n' +
  '}\n' +
  'var msg = g.m(\'left half of t\' + \' and right half of t\');\n' +
  'msg = g.informational(\'formatMessage\');\n' +
  'g.emergency(\'error\');\n' +
  'g.alert(\'log\');\n' +
  'g.critical(\'info\');\n' +
  'g.warning(\'warn\');\n' +
  'g.notice(\'ewrite\');\n' +
  'g.informational(\'owrite\');\n' +
  'g.data(\'write\');\n' +
  'g.data(\'write1\');\n' +
  'g.data(\'write2\');\n' +
  'msg = g.help  (\'format of %s and %s\', \'zero\', \'one\');\n' +
  'msg = g.notice(\'format of {0} and {1}\', \'zero\', \'one\');\n' +
  'msg = g.prompt(\'format of {zero} and {one}\', \n' +
  '  {zero: \'zero\', one: \'one\'});\n';

test('extract from JS and fill-in with multiple new',
  subTest.bind(content_multiple_new, 'content_multiple_new'));

function subTest(mode, t) {
  helper.setRootDir(__dirname);
  g.setDefaultLanguage();
  var content = this;
  var targetMsgs = [
    'This is an error.',
    'left half of t and right half of t',
    'formatMessage',
    'error',
    'log',
    'info',
    'warn',
    'ewrite',
    'owrite',
    'write',
    'write1',
    'write2',
    'format of %s and %s',
    'format of {0} and {1}',
    'format of {zero} and {one}',
  ];
  var extractedMsgs = [];
  var extractedLocs = [];
  var targetLocs = require('./test-extract.json');
  extract.scanAst(content, testFileName).forEach(function(m) {
    extractedMsgs.push(m.msg);
    extractedLocs.push(m.loc);
  });
  t.equal(extractedMsgs.join(''), targetMsgs.join(''),
    mode + ': all literals extracted from JS.');
  t.equal(JSON.stringify(extractedLocs), JSON.stringify(targetLocs),
    mode + ': all locs extracted from JS.');
  var enBundlePre = global.STRONGLOOP_GLB.bundles[helper.ENGLISH];
  t.comment(JSON.stringify(enBundlePre, null, 2));
  g.setDefaultLanguage(helper.ENGLISH);

  var baseIndex = 11; // of format test cases

  targetMsgs.forEach(function(tgtMsg, ix) {
    if (ix > baseIndex) return;
    t.equal(g.formatMessage(tgtMsg), tgtMsg,
      'read t right on \'' + tgtMsg + '\'');
  });

  targetMsgs.forEach(function(tgtMsg, ix) {
    if (ix > baseIndex) return;
    t.equal(g.formatMessage(tgtMsg), tgtMsg,
      'read format right on \'' + tgtMsg + '\'');
  });

  var util = require('util');
  var targetMsg = util.format(targetMsgs[baseIndex + 1], 'zero', 'one');
  var resultMsg = null;
  resultMsg = g.formatMessage(targetMsgs[baseIndex + 2], ['zero', 'one']);
  t.comment(resultMsg);
  t.equal(resultMsg, targetMsg,
    'filled t in array \'' + targetMsg + '\'');
  resultMsg = g.formatMessage(targetMsgs[baseIndex + 2], {0: 'zero', 1: 'one'});
  t.comment(resultMsg);
  t.equal(resultMsg, targetMsg,
    'filled t in object 0, 1 \'' + targetMsg + '\'');
  resultMsg = g.formatMessage(targetMsgs[baseIndex + 3],
    {zero: 'zero', one: 'one'});
  t.comment(resultMsg);
  t.equal(resultMsg, targetMsg,
    'filled t in object zero, one \'' + targetMsg + '\'');
  resultMsg = g.formatMessage(targetMsgs[baseIndex + 2], ['zero', 'one']);
  t.comment(resultMsg);
  t.equal(resultMsg, targetMsg,
    'filled format in array \'' + targetMsg + '\'');
  resultMsg = g.formatMessage(targetMsgs[baseIndex + 2], {0: 'zero', 1: 'one'});
  t.comment(resultMsg);
  t.equal(resultMsg, targetMsg,
    'filled format in object 0, 1 \'' + targetMsg + '\'');
  resultMsg = g.formatMessage(targetMsgs[baseIndex + 3],
    {zero: 'zero', one: 'one'});
  t.comment(resultMsg);
  t.equal(resultMsg, targetMsg,
    'filled format in object zero, one \'' + targetMsg + '\'');

  t.end();
}

test('extract from HTML', function(t) {
  helper.setRootDir(__dirname);
  g.setDefaultLanguage();
  var content = '<div class="board" id="IdA">\n' +
  '  <div class="board-header section-header">\n' +
  '    <h2>{}' +
  '      {{{{StrongLoop}} History Board | globalize}}</h2>\n' +
  '  </div>\n' +
  '  <div role="help-note">\n' +
  '    <p>\n' +
  '      {{ History board shows the access history to the e-commerce' +
  ' web site. | globalize }}\n' +
  '    </p>\n' +
  '  </div>' +
  '  <div class="hidden" role="warning-note">\n' +
  '    <p>\n' +
  '      Label: warning means an unusual event.\n' +
  '    </p>\n' +
  '    <a href="https://www.abc.org">{{ABC Web Site | globalize}}</a>' +
  '    <form>' +
  '      {{First name | globalize}}:<br>' +
  '      <input type="text" name="firstname"><br>' +
  '      {{Last name | globalize}}:<br>' +
  '      <input type="text" name="lastname">' +
  '      <ul>' +
  '        <li>{{Coffee | globalize}}</li>' +
  '        <li>{{Tea | globalize}}</li>' +
  '        <li>{{Milk | globalize}}</li>' +
  '      </ul>' +
  '    </form>' +
  '    <table style="width:100%">' +
  '      <tr>' +
  '        <th>{{Given name | globalize}}</th>' +
  '        <th>{{Sir name | globalize}}</th>' +
  '      </tr>' +
  '      <tr>' +
  '        <td>John</td>' +
  '        <td>Doe</td>' +
  '      </tr>' +
  '      <tr>' +
  '        <td>Eve</td>' +
  '        <td>Jackson</td>' +
  '      </tr>' +
  '    </table>' +
  '  </div>' +
  '  <p>' +
  '     {{This sentence is extracted from an HTML template.\n' +
  '     Some template engine uses double curly braces as a place holder\n' +
  '     such as {{userSettings.timeout}}ms which will be\n' +
  '     rendered as something like 400ms. | globalize }}' +
  '  </p>\n' +
  '  <p>\n' +
  '                Line 1\n' +
  '                Line 2\n' +
  '                Line 3\n' +
  '  </p>'
  ;
  var targetMsgs = [
    '{{StrongLoop}} History Board',
    'History board shows the access history to the e-commerce web site.',
    'ABC Web Site',
    'First name',
    'Last name',
    'Coffee',
    'Tea',
    'Milk',
    'Given name',
    'Sir name',
    'This sentence is extracted from an HTML template. ' +
    'Some template engine uses double curly braces as a place holder ' +
    'such as {{userSettings.timeout}}ms which will be ' +
    'rendered as something like 400ms.',
  ];
  var extractedMsgs = [];
  extract.scanHtml(content, testFileName).forEach(function(m) {
    extractedMsgs.push(m.msg);
  });
  t.comment('Extracted: ' + extractedMsgs.toString());
  t.comment('   Target: ' + targetMsgs);
  t.equal(targetMsgs.join(''), extractedMsgs.join(''),
    'all literals extracted from HTML.');

  t.end();
});

test('extract from CDATA', function(t) {
  helper.setRootDir(__dirname);
  g.setDefaultLanguage();
  var content = '<![CDATA[\n' +
  '      {{Text in cdata | globalize }}\n' +
  '    ]]>\n';
  var targetMsgs = [
    'Text in cdata',
  ];
  var extractedMsgs = [];
  extract.scanHtml(content, testFileName).forEach(function(m) {
    extractedMsgs.push(m.msg);
  });
  t.comment('Extracted: ' + extractedMsgs.toString());
  t.comment('   Target: ' + targetMsgs);
  t.assert(targetMsgs.join('') === extractedMsgs.join(''),
    'all literals extracted from CDATA.');

  t.end();
});

test('custom extraction regex', function(t) {
  helper.setRootDir(__dirname);
  g.setDefaultLanguage();
  var content = '<![CDATA[\n' +
  '      {{LOCALIZE:Text in cdata}}\n' +
  '    ]]>\n';
  var targetMsgs = [
    'Text in cdata',
  ];
  extract.setHtmlRegex(
      /{{LOCALIZE:.+}}/m,
      /{{LOCALIZE:/m,
      /}}/m
  );
  var extractedMsgs = [];
  extract.scanHtml(content, testFileName).forEach(function(m) {
    extractedMsgs.push(m.msg);
  });
  t.comment('Extracted: ' + extractedMsgs.toString());
  t.comment('   Target: ' + targetMsgs);
  t.equal(targetMsgs.join(''), extractedMsgs.join(''),
    'literal correctly extracted using custom html regex.');

  t.end();
});

test('pseudo loc extraction', function(t) {
  helper.setRootDir(__dirname);
  g.setDefaultLanguage();
  var content = 'process.stdout.write(\'ps_arg1\' + \'ps_arg2\')\n' +
    'console.log(\'cs_arg\')';
  var extractedMsgs = [];
  var extractedLocs = [];
  var targetMsgs = [
    helper.PSEUDO_TAG + 'ps_arg1',
    helper.PSEUDO_TAG + 'ps_arg2',
    helper.PSEUDO_TAG + 'cs_arg',
  ];
  var targetLocs = [
    'test-extract.js:1',
    'test-extract.js:1',
    'test-extract.js:2',
  ];
  extract.scanAst(content, testFileName).forEach(function(m) {
    extractedMsgs.push(m.msg);
    extractedLocs.push(m.loc);
  });
  t.equal(extractedMsgs.join(''), targetMsgs.join(''),
    'pseudo msgs: all literals extracted from JS.');
  t.equal(JSON.stringify(extractedLocs), JSON.stringify(targetLocs),
    'pseudo locs: all locs extracted from JS.');

  t.end();
});
