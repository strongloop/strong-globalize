// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var gpb = require('g11n-pipeline');
var helper = require('../lib/helper');
var sltTH = require('./slt-test-helper');
var translate = require('../lib/translate');

exports.fakeGpbTest = fakeGpbTest;
Object.defineProperty(exports, 'FAKE_supportedTranslations', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'FAKE_supportedTranslations',
});
Object.defineProperty(exports, 'FAKE_bundle_create', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'FAKE_bundle_create',
});
Object.defineProperty(exports, 'FAKE_bundle_uploadStrings', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'FAKE_bundle_uploadStrings',
});
Object.defineProperty(exports, 'FAKE_bundle_getStrings_1', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'FAKE_bundle_getStrings_1',
});
Object.defineProperty(exports, 'FAKE_bundle_getStrings_2', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'FAKE_bundle_getStrings_2',
});
Object.defineProperty(exports, 'FAKE_bundle_getEntryInfo_1', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'FAKE_bundle_getEntryInfo_1',
});
Object.defineProperty(exports, 'FAKE_bundle_getEntryInfo_2', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'FAKE_bundle_getEntryInfo_2',
});
Object.defineProperty(exports, 'FAKE_testIds', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: [
    exports.FAKE_supportedTranslations,
    exports.FAKE_bundle_create,
    exports.FAKE_bundle_uploadStrings,
    exports.FAKE_bundle_getStrings_1,
    exports.FAKE_bundle_getStrings_2,
    exports.FAKE_bundle_getEntryInfo_1,
    exports.FAKE_bundle_getEntryInfo_2,
  ],
});

var targets = {
  FAKE_supportedTranslations: {
    translate000: {
      out: [],
      err: [helper.MSG_GPB_UNAVAILABLE + '\n'],
    },
  },
  FAKE_bundle_create: {
    translate000: {
      out: [
        '--- linting gpbtestmain en\n',
        /--- linted 2 messages, 25 words, 13[36]{1} characters\n/,
        '--- linted gpbtestmain en\n',
        '--- translating gpbtestmain_messages.json\n',
        '*** translation failed: messages.json\n',
        '--- translating gpbtestmain_plain.txt\n',
        '*** translation failed: plain.txt\n',
        '--- translated 0 messages, 0 words, 0 characters\n',
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
        '*** GPB.create error: {"obj":{"message":"FAKE_bundle_create"}}\n',
        '*** GPB.create error: {"obj":{"message":"FAKE_bundle_create"}}\n',
        '*** gpbtestmain de has no message files.\n',
        '*** gpbtestmain es has no message files.\n',
        '*** gpbtestmain fr has no message files.\n',
        '*** gpbtestmain it has no message files.\n',
        '*** gpbtestmain pt has no message files.\n',
        '*** gpbtestmain ru has no message files.\n',
        '*** gpbtestmain ja has no message files.\n',
        '*** gpbtestmain ko has no message files.\n',
        '*** gpbtestmain zh-Hans has no message files.\n',
        '*** gpbtestmain zh-Hant has no message files.\n',
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
  },
  FAKE_bundle_uploadStrings: {
    translate000: {
      out: [
        '--- linting gpbtestmain en\n',
        /--- linted 2 messages, 25 words, 13[36]{1} characters\n/,
        '--- linted gpbtestmain en\n',
        '--- translating gpbtestmain_messages.json\n',
        '*** translation failed: messages.json\n',
        '--- translating gpbtestmain_plain.txt\n',
        '*** translation failed: plain.txt\n',
        '--- translated 0 messages, 0 words, 0 characters\n',
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
        '*** GPB.uploadStrings error: "FAKE_bundle_uploadStrings"\n',
        '*** GPB.uploadStrings error: "FAKE_bundle_uploadStrings"\n',
        '*** gpbtestmain de has no message files.\n',
        '*** gpbtestmain es has no message files.\n',
        '*** gpbtestmain fr has no message files.\n',
        '*** gpbtestmain it has no message files.\n',
        '*** gpbtestmain pt has no message files.\n',
        '*** gpbtestmain ru has no message files.\n',
        '*** gpbtestmain ja has no message files.\n',
        '*** gpbtestmain ko has no message files.\n',
        '*** gpbtestmain zh-Hans has no message files.\n',
        '*** gpbtestmain zh-Hant has no message files.\n',
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
  },
  FAKE_bundle_getStrings_1: {
    translate000: {
      out: [
        '--- linting gpbtestmain en\n',
        /--- linted 2 messages, 25 words, 13[36]{1} characters\n/,
        '--- linted gpbtestmain en\n',
        '--- translating gpbtestmain_messages.json\n',
        '--- translating gpbtestmain_plain.txt\n',
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
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** gpbtestmain de has no message files.\n',
        '*** gpbtestmain es has no message files.\n',
        '*** gpbtestmain fr has no message files.\n',
        '*** gpbtestmain it has no message files.\n',
        '*** gpbtestmain pt has no message files.\n',
        '*** gpbtestmain ru has no message files.\n',
        '*** gpbtestmain ja has no message files.\n',
        '*** gpbtestmain ko has no message files.\n',
        '*** gpbtestmain zh-Hans has no message files.\n',
        '*** gpbtestmain zh-Hant has no message files.\n',
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
  },
  FAKE_bundle_getStrings_2: {
    translate000: {
      out: [
        '--- linting gpbtestmain en\n',
        /--- linted 2 messages, 25 words, 13[36]{1} characters\n/,
        '--- linted gpbtestmain en\n',
        '--- translating gpbtestmain_messages.json\n',
        '--- translating gpbtestmain_plain.txt\n',
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
        '*** translation to de failed and skipped.\n',
        '*** translation to es failed and skipped.\n',
        '*** translation to fr failed and skipped.\n',
        '*** translation to it failed and skipped.\n',
        '*** translation to pt-BR failed and skipped.\n',
        '*** translation to ja failed and skipped.\n',
        '*** translation to ko failed and skipped.\n',
        '*** translation to zh-Hans failed and skipped.\n',
        '*** translation to zh-Hant failed and skipped.\n',
        '*** translation to de failed and skipped.\n',
        '*** translation to es failed and skipped.\n',
        '*** translation to fr failed and skipped.\n',
        '*** translation to it failed and skipped.\n',
        '*** translation to pt-BR failed and skipped.\n',
        '*** translation to ja failed and skipped.\n',
        '*** translation to ko failed and skipped.\n',
        '*** translation to zh-Hans failed and skipped.\n',
        '*** translation to zh-Hant failed and skipped.\n',
        '*** gpbtestmain de has no message files.\n',
        '*** gpbtestmain es has no message files.\n',
        '*** gpbtestmain fr has no message files.\n',
        '*** gpbtestmain it has no message files.\n',
        '*** gpbtestmain pt has no message files.\n',
        '*** gpbtestmain ru has no message files.\n',
        '*** gpbtestmain ja has no message files.\n',
        '*** gpbtestmain ko has no message files.\n',
        '*** gpbtestmain zh-Hans has no message files.\n',
        '*** gpbtestmain zh-Hant has no message files.\n',
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
  },
  FAKE_bundle_getEntryInfo_1: {
    translate000: {
      out: [
        '--- linting gpbtestmain en\n',
        /--- linted 2 messages, 25 words, 13[36]{1} characters\n/,
        '--- linted gpbtestmain en\n',
        '--- translating gpbtestmain_messages.json\n',
        '--- translating gpbtestmain_plain.txt\n',
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
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** gpbtestmain de has no message files.\n',
        '*** gpbtestmain es has no message files.\n',
        '*** gpbtestmain fr has no message files.\n',
        '*** gpbtestmain it has no message files.\n',
        '*** gpbtestmain pt has no message files.\n',
        '*** gpbtestmain ru has no message files.\n',
        '*** gpbtestmain ja has no message files.\n',
        '*** gpbtestmain ko has no message files.\n',
        '*** gpbtestmain zh-Hans has no message files.\n',
        '*** gpbtestmain zh-Hant has no message files.\n',
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
  },
  FAKE_bundle_getEntryInfo_2: {
    translate000: {
      out: [
        '--- linting gpbtestmain en\n',
        /--- linted 2 messages, 25 words, 13[36]{1} characters\n/,
        '--- linted gpbtestmain en\n',
        '--- translating gpbtestmain_messages.json\n',
        '--- translating gpbtestmain_plain.txt\n',
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
        '*** translation to de was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_messages.json from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to es was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_messages.json from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to fr was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_messages.json from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to it was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_messages.json from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to pt-BR was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_messages.json from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to ja was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_messages.json from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to ko was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_messages.json from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to zh-Hans was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_messages.json from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to zh-Hant was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_messages.json from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to de was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_plain.txt from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to es was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_plain.txt from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to fr was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_plain.txt from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to it was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_plain.txt from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to pt-BR was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_plain.txt from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to ja was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_plain.txt from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to ko was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_plain.txt from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to zh-Hans was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_plain.txt from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** translation to zh-Hant was incomplete.\nTry to delete the bundle' +
          ' gpbtestmain_plain.txt from the GPB dashboard and' +
          ' "slt-translate -t" again.\n',
        '*** gpbtestmain de has no message files.\n',
        '*** gpbtestmain es has no message files.\n',
        '*** gpbtestmain fr has no message files.\n',
        '*** gpbtestmain it has no message files.\n',
        '*** gpbtestmain pt has no message files.\n',
        '*** gpbtestmain ru has no message files.\n',
        '*** gpbtestmain ja has no message files.\n',
        '*** gpbtestmain ko has no message files.\n',
        '*** gpbtestmain zh-Hans has no message files.\n',
        '*** gpbtestmain zh-Hant has no message files.\n',
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
  },
};

var translateMaybeSkip =
  !!process.env.BLUEMIX_URL &&
  !!process.env.BLUEMIX_USER &&
  !!process.env.BLUEMIX_PASSWORD &&
  !!process.env.BLUEMIX_INSTANCE
    ? false
    : {skip: 'Incomplete Bluemix environment'};

function loginToGpb(callback) {
  var credentials = {
    credentials: {
      url: process.env.BLUEMIX_URL,
      userId: process.env.BLUEMIX_USER,
      password: process.env.BLUEMIX_PASSWORD,
      instanceId: process.env.BLUEMIX_INSTANCE,
    },
  };
  var gpClient = gpb.getClient(credentials);
  gpClient.ping(null, callback);
}

function fakeGpbTest(t, testId, callback) {
  if (translateMaybeSkip) return callback();
  if (exports.FAKE_testIds.indexOf(testId) < 0) return callback();
  loginToGpb(function(err) {
    if (err) return callback();
    fakeGpbTestPriv(t, testId, callback);
  });
}

function fakeGpbTestPriv(t, testId, callback) {
  var options = {};
  options[testId] = true;
  interceptGpb(options);
  sltTH.testHarness(
    t,
    targets[testId],
    false,
    function(name, unhook_intercept, cb) {
      translate.translateResource(function(_err) {
        unhook_intercept();
        cb();
      });
    },
    function() {
      return callback();
    }
  );
}

function interceptGpb(options) {
  var gpbGetClient = gpb.getClient;
  gpb.getClient = function(credentials) {
    var ret = gpbGetClient(credentials);
    var gpbSupportedTranslations = ret.supportedTranslations;
    ret.supportedTranslations = options.FAKE_supportedTranslations
      ? function(p1, callback) {
          return callback('FAKE_supportedTranslations', null);
        }
      : gpbSupportedTranslations;
    var gpbBundle = ret.bundle;
    ret.bundle = function() {
      var bundle = gpbBundle.apply(ret, arguments);
      bundle.create = options.FAKE_bundle_create
        ? function(options, callback) {
            return callback({obj: {message: 'FAKE_bundle_create'}});
          }
        : bundle.create;
      bundle.uploadStrings = options.FAKE_bundle_uploadStrings
        ? function(options, callback) {
            return callback('FAKE_bundle_uploadStrings');
          }
        : bundle.uploadStrings;
      bundle.getStrings = options.FAKE_bundle_getStrings_1
        ? function(options, callback) {
            return callback({obj: {message: 'Language ABC does not exist.'}});
          }
        : bundle.getStrings;
      bundle.getStrings = options.FAKE_bundle_getStrings_2
        ? function(options, callback) {
            return callback({obj: {message: 'FAKE_bundle_getStrings'}});
          }
        : bundle.getStrings;
      if (
        options.FAKE_bundle_getEntryInfo_1 ||
        options.FAKE_bundle_getEntryInfo_2
      ) {
        bundle.getStrings = function(options, callback) {
          return callback(null, {resourceStrings: []});
        };
      }
      bundle.getEntryInfo = options.FAKE_bundle_getEntryInfo_1
        ? function(options, callback) {
            return callback('FAKE_bundle_getEntryInfo');
          }
        : bundle.getEntryInfo;
      bundle.getEntryInfo = options.FAKE_bundle_getEntryInfo_2
        ? function(options, callback) {
            return callback(null, {
              resourceEntry: {translationStatus: 'FAILED'},
            });
          }
        : bundle.getEntryInfo;
      return bundle;
    };
    return ret;
  };
}
