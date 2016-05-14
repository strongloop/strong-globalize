// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var SG = require('../index');
var lint = require('../lib/lint');
var sltTH = require('./slt-test-helper')
var test = require('tap').test;

SG.SetRootDir(__dirname);

test('lint message', function(t) {
  lint.lintMessageFiles(false, function(err) {
    t.assert(!err, 'No lint errors.');
  });
  t.end();
});

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
      '*** null en:msg001MalformedDoubleCurlyRight seems to' +
        ' have an left orphan placeholder:\n',
      '***   {Error:\n',
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
        ' have an right orphan placeholder:\n',
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
        ' have an left orphan placeholder:\n',
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
      '--- linting null es\n',
      '--- linting null fr\n',
      '--- linting null it\n',
      '--- linting null pt\n',
      '--- linting null ru\n',
      '--- linted null ru\n',
      '--- linting null ja\n',
      '--- linted null ja\n',
      '--- linting null ko\n',
      '--- linted null ko\n',
      '--- linting null zh-Hans\n',
      '--- linted null zh-Hans\n',
      '--- linting null zh-Hant\n',
      '--- linted null zh-Hant\n'
    ],
    err: [
      '*** null de ****** incompatible w/En no such key: msg004AAA\n',
      '*** null es ****** empty translation: msg004A\n',
      '*** null es incompatible w/En double curly braces: msg004A\n',
      '*** null es incompatible w/En placeholders: msg004A\n',
      '*** null fr:msg004A has an odd placeholder key: Error\n',
      '*** null it incompatible w/En placeholder: port is missing.\n',
      '*** null pt incompatible w/En placeholders: msg004A\n',
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
};

test('test lint misc testing', function(t) {
  sltTH.testHarness(t, targets, false,
      function(name, unhook_intercept, callback) {
    var checkAllLangs = (name === 'lint004');
    var mustErr = (name !== 'lint004' && name !== 'lint005')
    lint.lintMessageFiles(!checkAllLangs, function(err) {
      unhook_intercept();
      if (mustErr) t.assert(err, name + ' must error.');
      else t.assert(!err, name + ' must not error.');
      callback();
    });
  });
});
