// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';

var sltTH = require('./slt-test-helper');
var test = require('tap').test;
var translate = require('../lib/translate');

var targets = {
  translate000: {
    out: [
      '--- linting gpbtestmain en\n',
      /--- linted 2 messages, 25 words, 13[36]{1} characters\n/,
      '--- linted gpbtestmain en\n',
      '--- translating gpbtestmain_messages.json\n',
      /[\.]*--- translated to de\n/,
      /[\.]*--- translated to es\n/,
      /[\.]*--- translated to fr\n/,
      /[\.]*--- translated to it\n/,
      /[\.]*--- translated to pt\n/,
      /[\.]*--- translated to ja\n/,
      /[\.]*--- translated to ko\n/,
      /[\.]*--- translated to zh-Hans\n/,
      /[\.]*--- translated to zh-Hant\n/,
      '--- translating gpbtestmain_plain.txt\n',
      /[\.]*--- translated to de\n/,
      /[\.]*--- translated to es\n/,
      /[\.]*--- translated to fr\n/,
      /[\.]*--- translated to it\n/,
      /[\.]*--- translated to pt\n/,
      /[\.]*--- translated to ja\n/,
      /[\.]*--- translated to ko\n/,
      /[\.]*--- translated to zh-Hans\n/,
      /[\.]*--- translated to zh-Hant\n/,
      /--- translated 2 messages, 25 words, 13[36]{1} characters\n/,
      '--- linting gpbtestmain en\n',
      /--- linted 2 messages, 25 words, 13[36]{1} characters\n/,
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
      '--- linting gpbtestmain ar\n',
      '--- linted gpbtestmain ar\n',
      '--- linting gpbtestmain bn\n',
      '--- linted gpbtestmain bn\n',
      '--- linting gpbtestmain cs\n',
      '--- linted gpbtestmain cs\n',
      '--- linting gpbtestmain el\n',
      '--- linted gpbtestmain el\n',
      '--- linting gpbtestmain fi\n',
      '--- linted gpbtestmain fi\n',
      '--- linting gpbtestmain hi\n',
      '--- linted gpbtestmain hi\n',
      '--- linting gpbtestmain id\n',
      '--- linted gpbtestmain id\n',
      '--- linting gpbtestmain lt\n',
      '--- linted gpbtestmain lt\n',
      '--- linting gpbtestmain nb\n',
      '--- linted gpbtestmain nb\n',
      '--- linting gpbtestmain nl\n',
      '--- linted gpbtestmain nl\n',
      '--- linting gpbtestmain pl\n',
      '--- linted gpbtestmain pl\n',
      '--- linting gpbtestmain ro\n',
      '--- linted gpbtestmain ro\n',
      '--- linting gpbtestmain sl\n',
      '--- linted gpbtestmain sl\n',
      '--- linting gpbtestmain sv\n',
      '--- linted gpbtestmain sv\n',
      '--- linting gpbtestmain ta\n',
      '--- linted gpbtestmain ta\n',
      '--- linting gpbtestmain te\n',
      '--- linted gpbtestmain te\n',
      '--- linting gpbtestmain th\n',
      '--- linted gpbtestmain th\n',
      '--- linting gpbtestmain tr\n',
      '--- linted gpbtestmain tr\n',
      '--- linting gpbtestmain uk\n',
      '--- linted gpbtestmain uk\n',
      '--- linting gpbtestmain vi\n',
      '--- linted gpbtestmain vi\n',
    ],
    err: [
      '*** gpbtestmain ru has no message files.\n',
      '*** gpbtestmain ar has no message files.\n',
      '*** gpbtestmain bn has no message files.\n',
      '*** gpbtestmain cs has no message files.\n',
      '*** gpbtestmain el has no message files.\n',
      '*** gpbtestmain fi has no message files.\n',
      '*** gpbtestmain hi has no message files.\n',
      '*** gpbtestmain id has no message files.\n',
      '*** gpbtestmain lt has no message files.\n',
      '*** gpbtestmain nb has no message files.\n',
      '*** gpbtestmain nl has no message files.\n',
      '*** gpbtestmain pl has no message files.\n',
      '*** gpbtestmain ro has no message files.\n',
      '*** gpbtestmain sl has no message files.\n',
      '*** gpbtestmain sv has no message files.\n',
      '*** gpbtestmain ta has no message files.\n',
      '*** gpbtestmain te has no message files.\n',
      '*** gpbtestmain th has no message files.\n',
      '*** gpbtestmain tr has no message files.\n',
      '*** gpbtestmain uk has no message files.\n',
      '*** gpbtestmain vi has no message files.\n',
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
  translate003: {
    out: [
      '--- linting gpbtestmain en\n',
      '--- linted 4 messages, 4 words, 14 characters\n',
      '--- linted gpbtestmain en\n',
      '--- translating gpbtestmain_messages_rightleft_000000.json\n',
      /[\.]*--- translated to de\n/,
      /[\.]*--- translated to es\n/,
      /[\.]*--- translated to fr\n/,
      /[\.]*--- translated to it\n/,
      /[\.]*--- translated to pt\n/,
      /[\.]*--- translated to ja\n/,
      /[\.]*--- translated to ko\n/,
      /[\.]*--- translated to zh-Hans\n/,
      /[\.]*--- translated to zh-Hant\n/,
      '--- translating gpbtestmain_messages_rightleft_000001.json\n',
      /[\.]*--- translated to de\n/,
      /[\.]*--- translated to es\n/,
      /[\.]*--- translated to fr\n/,
      /[\.]*--- translated to it\n/,
      /[\.]*--- translated to pt\n/,
      /[\.]*--- translated to ja\n/,
      /[\.]*--- translated to ko\n/,
      /[\.]*--- translated to zh-Hans\n/,
      /[\.]*--- translated to zh-Hant\n/,
      '--- translating gpbtestmain_messages_yesnot_000000.json\n',
      /[\.]*--- translated to de\n/,
      /[\.]*--- translated to es\n/,
      /[\.]*--- translated to fr\n/,
      /[\.]*--- translated to it\n/,
      /[\.]*--- translated to pt\n/,
      /[\.]*--- translated to ja\n/,
      /[\.]*--- translated to ko\n/,
      /[\.]*--- translated to zh-Hans\n/,
      /[\.]*--- translated to zh-Hant\n/,
      '--- translating gpbtestmain_messages_yesnot_000001.json\n',
      /[\.]*--- translated to de\n/,
      /[\.]*--- translated to es\n/,
      /[\.]*--- translated to fr\n/,
      /[\.]*--- translated to it\n/,
      /[\.]*--- translated to pt\n/,
      /[\.]*--- translated to ja\n/,
      /[\.]*--- translated to ko\n/,
      /[\.]*--- translated to zh-Hans\n/,
      /[\.]*--- translated to zh-Hant\n/,
      '--- translated 4 messages, 4 words, 14 characters\n',
      '--- linting gpbtestmain en\n',
      '--- linted 4 messages, 4 words, 14 characters\n',
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
      '--- linting gpbtestmain ar\n',
      '--- linted gpbtestmain ar\n',
      '--- linting gpbtestmain bn\n',
      '--- linted gpbtestmain bn\n',
      '--- linting gpbtestmain cs\n',
      '--- linted gpbtestmain cs\n',
      '--- linting gpbtestmain el\n',
      '--- linted gpbtestmain el\n',
      '--- linting gpbtestmain fi\n',
      '--- linted gpbtestmain fi\n',
      '--- linting gpbtestmain hi\n',
      '--- linted gpbtestmain hi\n',
      '--- linting gpbtestmain id\n',
      '--- linted gpbtestmain id\n',
      '--- linting gpbtestmain lt\n',
      '--- linted gpbtestmain lt\n',
      '--- linting gpbtestmain nb\n',
      '--- linted gpbtestmain nb\n',
      '--- linting gpbtestmain nl\n',
      '--- linted gpbtestmain nl\n',
      '--- linting gpbtestmain pl\n',
      '--- linted gpbtestmain pl\n',
      '--- linting gpbtestmain ro\n',
      '--- linted gpbtestmain ro\n',
      '--- linting gpbtestmain sl\n',
      '--- linted gpbtestmain sl\n',
      '--- linting gpbtestmain sv\n',
      '--- linted gpbtestmain sv\n',
      '--- linting gpbtestmain ta\n',
      '--- linted gpbtestmain ta\n',
      '--- linting gpbtestmain te\n',
      '--- linted gpbtestmain te\n',
      '--- linting gpbtestmain th\n',
      '--- linted gpbtestmain th\n',
      '--- linting gpbtestmain tr\n',
      '--- linted gpbtestmain tr\n',
      '--- linting gpbtestmain uk\n',
      '--- linted gpbtestmain uk\n',
      '--- linting gpbtestmain vi\n',
      '--- linted gpbtestmain vi\n',
    ],
    err: [
      '*** gpbtestmain ru has no message files.\n',
      '*** gpbtestmain ar has no message files.\n',
      '*** gpbtestmain bn has no message files.\n',
      '*** gpbtestmain cs has no message files.\n',
      '*** gpbtestmain el has no message files.\n',
      '*** gpbtestmain fi has no message files.\n',
      '*** gpbtestmain hi has no message files.\n',
      '*** gpbtestmain id has no message files.\n',
      '*** gpbtestmain lt has no message files.\n',
      '*** gpbtestmain nb has no message files.\n',
      '*** gpbtestmain nl has no message files.\n',
      '*** gpbtestmain pl has no message files.\n',
      '*** gpbtestmain ro has no message files.\n',
      '*** gpbtestmain sl has no message files.\n',
      '*** gpbtestmain sv has no message files.\n',
      '*** gpbtestmain ta has no message files.\n',
      '*** gpbtestmain te has no message files.\n',
      '*** gpbtestmain th has no message files.\n',
      '*** gpbtestmain tr has no message files.\n',
      '*** gpbtestmain uk has no message files.\n',
      '*** gpbtestmain vi has no message files.\n',
    ],
  },
};

var skipTranslate = (!process.env.SG_VERBOSE ||
  !process.env.BLUEMIX_URL ||
  !process.env.BLUEMIX_USER || !process.env.BLUEMIX_PASSWORD ||
  !process.env.BLUEMIX_INSTANCE);

if (skipTranslate) {
  test('skip translate misc testing', function(t) {
    t.pass();
    t.end();
  });
} else {
  test('test translate misc testing', function(t) {
    sltTH.testHarness(t, targets, false,
      function(name, unhook_intercept, callback) {
        if (name === 'translate003') {
          translate.setTranslationUnit(1);
        }
        translate.translateResource(function(err) {
          var targetIfLogonFailed = '*** Login to GPB failed or' +
            ' GPB.supportedTranslations error.';
          var target = null;
          var found = err ? err.toString() : '';
          unhook_intercept();
          if (found === targetIfLogonFailed) {
            callback(true);
            return;
          }
          if (name === 'translate001') {
            target = 'Package.json not found.';
            t.assert(err, name + ' must err.');
            t.equal(found, target, target);
          }
          if (name === 'translate002') {
            target = 'English resource does not exist.';
            t.assert(err, name + ' must err.');
            t.equal(found, target, target);
          }
          if (name === 'translate003') {
            translate.setTranslationUnit(-1);
          }
          callback();
        });
      }, function() {
        t.end();
      });
  });
}
