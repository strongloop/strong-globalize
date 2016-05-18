// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var sltTH = require('./slt-test-helper')
var test = require('tap').test;
var translate = require('../lib/translate');

var targets = {
  translate000: {
    out: [
      '--- linting gmain en\n',
      '--- linted 1 messages, 5 words, 29 characters\n',
      '--- linted gmain en\n',
      '--- translating gmain_messages.json\n',
      '--- translated to de\n',
      '--- translated to es\n',
      '--- translated to fr\n',
      '--- translated to it\n',
      '--- translated to pt\n',
      '--- translated to ja\n',
      '--- translated to ko\n',
      '--- translated to zh-Hans\n',
      '--- translated to zh-Hant\n',
      '--- translated 1 messages, 5 words, 29 characters.\n',
      '--- linting gmain en\n',
      '--- linted 1 messages, 5 words, 29 characters\n',
      '--- linted gmain en\n',
      '--- linting gmain de\n',
      '--- linted gmain de\n',
      '--- linting gmain es\n',
      '--- linted gmain es\n',
      '--- linting gmain fr\n',
      '--- linted gmain fr\n',
      '--- linting gmain it\n',
      '--- linted gmain it\n',
      '--- linting gmain pt\n',
      '--- linted gmain pt\n',
      '--- linting gmain ru\n',
      '--- linted gmain ru\n',
      '--- linting gmain ja\n',
      '--- linted gmain ja\n',
      '--- linting gmain ko\n',
      '--- linted gmain ko\n',
      '--- linting gmain zh-Hans\n',
      '--- linted gmain zh-Hans\n',
      '--- linting gmain zh-Hant\n',
      '--- linted gmain zh-Hant\n',
    ],
    err: [
      '*** gmain ru has no message files.\n',
    ],
  },
  translate001: {
    out: [
    ],
    err: [
    ],
  },
  translate002: {
    out: [
    ],
    err: [
    ],
  },
};

var translateMaybeSkip = (!!process.env.BLUEMIX_URL &&
  !!process.env.BLUEMIX_USER && !!process.env.BLUEMIX_PASSWORD &&
  !!process.env.BLUEMIX_INSTANCE)
              ? false
              : {skip: 'Incomplete Bluemix environment'};

test('test translate misc testing', translateMaybeSkip, function(t) {
  sltTH.testHarness(t, targets, false,
      function(name, unhook_intercept, callback) {
    translate.translateResource(function(err) {
      var targetIfLogonFailed = '*** Login to GPB failed or' +
        ' GPB.supportedTranslations error.';
      var target = null;
      var found = err ? err.toString() : '';
      if (found === targetIfLogonFailed) {
        unhook_intercept();
        callback(true);
        return;
      }
      if (name == 'translate001') {
        target = 'Package.json not found.'
        t.assert(err, name + ' must err.');
        t.equal(found, target, target);
      }
      if (name == 'translate002') {
        target = 'English resource does not exist.'
        t.assert(err, name + ' must err.');
        t.equal(found, target, target);
      }
      unhook_intercept();
      callback();
    });
  });
});
