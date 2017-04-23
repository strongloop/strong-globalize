// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var lint = require('../lib/lint');
var sltTH = require('./slt-test-helper');
var test = require('tap').test;

var targets = {
  lint000: {
    out: [
      '--- linting null en\n',
      '--- linted 1 messages, 6 words, 36 characters\n',
    ],
    err: [
      '*** null en:msg000MalformedDoubleCurly has malformed double' +
      ' curly braces.\n',
      '*** English file is malformed. Other languages not checked.\n',
    ]},
  lint001: {
    out: [
      '--- linting null en\n',
      '--- linted 1 messages, 6 words, 36 characters\n',
    ],
    err: [
      '*** null en:msg001MalformedDoubleCurlyRight has malformed' +
        ' double curly braces.\n',
      '*** English file is malformed. Other languages not checked.\n',
    ],
  },
  lint002: {
    out: [
      '--- linting null en\n',
      '--- linted 1 messages, 6 words, 37 characters\n',
    ],
    err: [
      '*** null en:msg002RightPrphanPlaceholderUrl seems to' +
        ' have a right orphan placeholder:\n',
      '***    url}\n',
      '*** English file is malformed. Other languages not checked.\n',
    ],
  },
  lint003: {
    out: [
      '--- linting null en\n',
      '--- linted 1 messages, 6 words, 37 characters\n',
    ],
    err: [
      '*** null en:msg003LeftPrphanPlaceholderPort seems to' +
        ' have a left orphan placeholder:\n',
      '***   {port \n',
      '*** English file is malformed. Other languages not checked.\n',
    ],
  },
  lint004: {
    out: [
      '--- linting null en\n',
      '--- linted 1 messages, 6 words, 38 characters\n',
      '--- linted null en\n',
      '--- linting null de\n',
      '--- linted null de\n',
      '--- linting null es\n',
      '--- linted null es\n',
      '--- linting null fr\n',
      '--- linted null fr\n',
      '--- linting null it\n',
      '--- linted null it\n',
      '--- linting null pt\n',
      '--- linted null pt\n',
      '--- linting null ru\n',
      '--- linted null ru\n',
      '--- linting null ja\n',
      '--- linted null ja\n',
      '--- linting null ko\n',
      '--- linted null ko\n',
      '--- linting null zh-Hans\n',
      '--- linted null zh-Hans\n',
      '--- linting null zh-Hant\n',
      '--- linted null zh-Hant\n',
      '--- linting null ar\n',
      '--- linted null ar\n',
      '--- linting null bn\n',
      '--- linted null bn\n',
      '--- linting null cs\n',
      '--- linted null cs\n',
      '--- linting null el\n',
      '--- linted null el\n',
      '--- linting null fi\n',
      '--- linted null fi\n',
      '--- linting null hi\n',
      '--- linted null hi\n',
      '--- linting null id\n',
      '--- linted null id\n',
      '--- linting null lt\n',
      '--- linted null lt\n',
      '--- linting null nb\n',
      '--- linted null nb\n',
      '--- linting null nl\n',
      '--- linted null nl\n',
      '--- linting null pl\n',
      '--- linted null pl\n',
      '--- linting null ro\n',
      '--- linted null ro\n',
      '--- linting null sl\n',
      '--- linted null sl\n',
      '--- linting null sv\n',
      '--- linted null sv\n',
      '--- linting null ta\n',
      '--- linted null ta\n',
      '--- linting null te\n',
      '--- linted null te\n',
      '--- linting null th\n',
      '--- linted null th\n',
      '--- linting null tr\n',
      '--- linted null tr\n',
      '--- linting null uk\n',
      '--- linted null uk\n',
      '--- linting null vi\n',
      '--- linted null vi\n',
    ],
    err: [
      '*** null de ****** incompatible w/En no such key: msg004AAA\n',
      '*** null es ****** empty translation: msg004A\n',
      '*** null es incompatible w/En double curly braces: msg004A\n',
      '*** null es incompatible w/En placeholders: msg004A\n',
      '*** null fr:msg004A has an odd placeholder key: Error\n',
      '*** null it incompatible w/En placeholder: port is missing.\n',
      '*** null pt incompatible w/En placeholders: msg004A\n',
      '*** null ru has no message files.\n',
      '*** null zh-Hans ****** empty translation: msg004A\n',
      '*** null zh-Hans incompatible w/En double curly braces: msg004A\n',
      '*** null zh-Hans incompatible w/En placeholders: msg004A\n',
      '*** null ar has no message files.\n',
      '*** null bn has no message files.\n',
      '*** null cs has no message files.\n',
      '*** null el has no message files.\n',
      '*** null fi has no message files.\n',
      '*** null hi has no message files.\n',
      '*** null id has no message files.\n',
      '*** null lt has no message files.\n',
      '*** null nb has no message files.\n',
      '*** null nl has no message files.\n',
      '*** null pl has no message files.\n',
      '*** null ro has no message files.\n',
      '*** null sl has no message files.\n',
      '*** null sv has no message files.\n',
      '*** null ta has no message files.\n',
      '*** null te has no message files.\n',
      '*** null th has no message files.\n',
      '*** null tr has no message files.\n',
      '*** null uk has no message files.\n',
      '*** null vi has no message files.\n',
    ],
  },
  lint005: {
    out: [
      '--- linting null en\n',
      '--- linted 1 messages, 6 words, 38 characters\n',
      '--- linted null en\n',
    ],
    err: [
    ],
  },
  lint006: {
    out: [
      '--- linting null en\n',
      '--- linted 600 messages, 10606 words, 68340 characters\n',
    ],
    err: [
      '*** null en has an duplicate message key:\n',
      '***   msg006Msg0\n',
      '*** null en:msg006Msg333333333333333333333333333333333333333333333' +
        '3333333333333333333333333333333333333333333333333333333333333333' +
        '3333333333333333333333333333333333333333333333333333333333333333' +
        '3333333333333333333333333333333333333333333333333333333333333333' +
        '333333333333333333333333333333333333333333333333333333333333333' +
        ' name is longer than 256\n',
      '*** null en:msg006Msg4 message is longer than 8192\n',
      '*** English file is malformed. Other languages not checked.\n',
    ],
  },
};

test('test lint misc testing', function(t) {
  sltTH.testHarness(t, targets, false,
      function(name, unhook_intercept, callback) {
        var checkAllLangs = (name === 'lint004');
        var mustErr = (name !== 'lint004' && name !== 'lint005');
        lint.lintMessageFiles(!checkAllLangs, function(err) {
          unhook_intercept();
          if (mustErr) t.assert(err, name + ' must error.');
          else t.assert(!err, name + ' must not error.');
          callback();
        });
      }, function() {
        t.end();
      });
});
