// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var sltTH = require('./slt-test-helper');
var test = require('tap').test;
var translate = require('../lib/translate');

var targets = {
  translate000: {
    out: [
      '--- linting gpbtestmain en\n',
      '--- linted 1 messages, 5 words, 29 characters\n',
      '--- linted gpbtestmain en\n',
      '--- translating gpbtestmain_messages.json\n',
      new RegExp('[\.]*--- translated to de\n'),
      new RegExp('[\.]*--- translated to es\n'),
      new RegExp('[\.]*--- translated to fr\n'),
      new RegExp('[\.]*--- translated to it\n'),
      new RegExp('[\.]*--- translated to pt\n'),
      new RegExp('[\.]*--- translated to ja\n'),
      new RegExp('[\.]*--- translated to ko\n'),
      new RegExp('[\.]*--- translated to zh-Hans\n'),
      new RegExp('[\.]*--- translated to zh-Hant\n'),
      '--- translated 1 messages, 5 words, 29 characters.\n',
      '--- linting gpbtestmain en\n',
      '--- linted 1 messages, 5 words, 29 characters\n',
      '--- linted gpbtestmain en\n',
      '--- linting gpbtestmain de\n',
      '--- linted gpbtestmain de\n',
      '--- linting gpbtestmain es\n',
      '--- linted gpbtestmain es\n',
      '--- linting gpbtestmain fr\n',
      '--- linted gpbtestmain fr\n',
      '--- linting gpbtestmain it\n',
      '--- linted gpbtestmain it\n',
      '--- linting gpbtestmain pt\n',
      '--- linted gpbtestmain pt\n',
      '--- linting gpbtestmain ru\n',
      '--- linted gpbtestmain ru\n',
      '--- linting gpbtestmain ja\n',
      '--- linted gpbtestmain ja\n',
      '--- linting gpbtestmain ko\n',
      '--- linted gpbtestmain ko\n',
      '--- linting gpbtestmain zh-Hans\n',
      '--- linted gpbtestmain zh-Hans\n',
      '--- linting gpbtestmain zh-Hant\n',
      '--- linted gpbtestmain zh-Hant\n',
    ],
    err: [
      '*** gpbtestmain ru has no message files.\n',
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
  }, function() {
    t.end();
  });
});
