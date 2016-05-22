// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var gpb = require('g11n-pipeline');
var sltTH = require('./slt-test-helper');
var translate = require('../lib/translate');

var translateMaybeSkip = (!!process.env.BLUEMIX_URL &&
  !!process.env.BLUEMIX_USER && !!process.env.BLUEMIX_PASSWORD &&
  !!process.env.BLUEMIX_INSTANCE)
              ? false
              : {skip: 'Incomplete Bluemix environment'};

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
  value: [exports.FAKE_supportedTranslations, exports.FAKE_bundle_create,
    exports.FAKE_bundle_uploadStrings, exports.FAKE_bundle_getStrings_1,
    exports.FAKE_bundle_getStrings_2, exports.FAKE_bundle_getEntryInfo_1,
    exports.FAKE_bundle_getEntryInfo_2,
  ],
});

var targets = {
  FAKE_supportedTranslations : {
    translate000: {
      out: [
      ],
      err: [
        '*** Login to GPB failed or GPB.supportedTranslations error.\n',
      ],
    },
  },
  FAKE_bundle_create : {
    translate000: {
      out: [
      '--- linting gmain en\n',
      '--- linted 1 messages, 5 words, 29 characters\n',
      '--- linted gmain en\n',
      '--- translating gmain_messages.json\n',
      '*** translation failed: messages.json\n',
      '--- translated 0 messages, 0 words, 0 characters.\n',
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
        '*** GPB.create error: {"obj":{"message":"FAKE_bundle_create"}}\n',
        '*** gmain de has no message files.\n',
        '*** gmain es has no message files.\n',
        '*** gmain fr has no message files.\n',
        '*** gmain it has no message files.\n',
        '*** gmain pt has no message files.\n',
        '*** gmain ru has no message files.\n',
        '*** gmain ja has no message files.\n',
        '*** gmain ko has no message files.\n',
        '*** gmain zh-Hans has no message files.\n',
        '*** gmain zh-Hant has no message files.\n',
      ],
    },
  },
  FAKE_bundle_uploadStrings : {
    translate000: {
      out: [
        '--- linting gmain en\n',
        '--- linted 1 messages, 5 words, 29 characters\n',
        '--- linted gmain en\n',
        '--- translating gmain_messages.json\n',
        '*** translation failed: messages.json\n',
        '--- translated 0 messages, 0 words, 0 characters.\n',
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
        '*** GPB.uploadStrings error: "FAKE_bundle_uploadStrings"\n',
        '*** gmain de has no message files.\n',
        '*** gmain es has no message files.\n',
        '*** gmain fr has no message files.\n',
        '*** gmain it has no message files.\n',
        '*** gmain pt has no message files.\n',
        '*** gmain ru has no message files.\n',
        '*** gmain ja has no message files.\n',
        '*** gmain ko has no message files.\n',
        '*** gmain zh-Hans has no message files.\n',
        '*** gmain zh-Hant has no message files.\n',
      ],
    },
  },
  FAKE_bundle_getStrings_1 : {
    translate000: {
      out: [
        '--- linting gmain en\n',
        '--- linted 1 messages, 5 words, 29 characters\n',
        '--- linted gmain en\n',
        '--- translating gmain_messages.json\n',
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
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** GPB.getStrings error: "Language ABC does not exist."\n',
        '*** gmain de has no message files.\n',
        '*** gmain es has no message files.\n',
        '*** gmain fr has no message files.\n',
        '*** gmain it has no message files.\n',
        '*** gmain pt has no message files.\n',
        '*** gmain ru has no message files.\n',
        '*** gmain ja has no message files.\n',
        '*** gmain ko has no message files.\n',
        '*** gmain zh-Hans has no message files.\n',
        '*** gmain zh-Hant has no message files.\n',
      ],
    },
  },
  FAKE_bundle_getStrings_2 : {
    translate000: {
      out: [
        '--- linting gmain en\n',
        '--- linted 1 messages, 5 words, 29 characters\n',
        '--- linted gmain en\n',
        '--- translating gmain_messages.json\n',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
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
        '*** translation to de failed and skipped.\n',
        '*** translation to es failed and skipped.\n',
        '*** translation to fr failed and skipped.\n',
        '*** translation to it failed and skipped.\n',
        '*** translation to pt-BR failed and skipped.\n',
        '*** translation to ja failed and skipped.\n',
        '*** translation to ko failed and skipped.\n',
        '*** translation to zh-Hans failed and skipped.\n',
        '*** translation to zh-Hant failed and skipped.\n',
        '*** gmain de has no message files.\n',
        '*** gmain es has no message files.\n',
        '*** gmain fr has no message files.\n',
        '*** gmain it has no message files.\n',
        '*** gmain pt has no message files.\n',
        '*** gmain ru has no message files.\n',
        '*** gmain ja has no message files.\n',
        '*** gmain ko has no message files.\n',
        '*** gmain zh-Hans has no message files.\n',
        '*** gmain zh-Hant has no message files.\n',
      ],
    },
  },
  FAKE_bundle_getEntryInfo_1 : {
    translate000: {
      out: [
        '--- linting gmain en\n',
        '--- linted 1 messages, 5 words, 29 characters\n',
        '--- linted gmain en\n',
        '--- translating gmain_messages.json\n',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
        '.',
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
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** GPB.getEntryInfo error: "FAKE_bundle_getEntryInfo"\n',
        '*** gmain de has no message files.\n',
        '*** gmain es has no message files.\n',
        '*** gmain fr has no message files.\n',
        '*** gmain it has no message files.\n',
        '*** gmain pt has no message files.\n',
        '*** gmain ru has no message files.\n',
        '*** gmain ja has no message files.\n',
        '*** gmain ko has no message files.\n',
        '*** gmain zh-Hans has no message files.\n',
        '*** gmain zh-Hant has no message files.\n',
      ],
    },
  },
  FAKE_bundle_getEntryInfo_2 : {
    translate000: {
      out: [
        '--- linting gmain en\n',
        '--- linted 1 messages, 5 words, 29 characters\n',
        '--- linted gmain en\n',
        '--- translating gmain_messages.json\n',
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
        '*** translation to de was incomplete.\nTry to delete the bundle' +
          ' gmain_messages.json from the GPB dashboard and "slt-translate -t"' +
          ' again.\n',
        '*** translation to es was incomplete.\nTry to delete the bundle' +
          ' gmain_messages.json from the GPB dashboard and "slt-translate -t"' +
          ' again.\n',
        '*** translation to fr was incomplete.\nTry to delete the bundle' +
          ' gmain_messages.json from the GPB dashboard and "slt-translate -t"' +
          ' again.\n',
        '*** translation to it was incomplete.\nTry to delete the bundle' +
          ' gmain_messages.json from the GPB dashboard and "slt-translate -t"' +
          ' again.\n',
        '*** translation to pt-BR was incomplete.\nTry to delete the bundle' +
          ' gmain_messages.json from the GPB dashboard and "slt-translate -t"' +
          ' again.\n',
        '*** translation to ja was incomplete.\nTry to delete the bundle' +
          ' gmain_messages.json from the GPB dashboard and "slt-translate -t"' +
          ' again.\n',
        '*** translation to ko was incomplete.\nTry to delete the bundle' +
          ' gmain_messages.json from the GPB dashboard and "slt-translate -t"' +
          ' again.\n',
        '*** translation to zh-Hans was incomplete.\nTry to delete the bundle' +
          ' gmain_messages.json from the GPB dashboard and "slt-translate -t"' +
          ' again.\n',
        '*** translation to zh-Hant was incomplete.\nTry to delete the bundle' +
          ' gmain_messages.json from the GPB dashboard and "slt-translate -t"' +
          ' again.\n',
        '*** gmain de has no message files.\n',
        '*** gmain es has no message files.\n',
        '*** gmain fr has no message files.\n',
        '*** gmain it has no message files.\n',
        '*** gmain pt has no message files.\n',
        '*** gmain ru has no message files.\n',
        '*** gmain ja has no message files.\n',
        '*** gmain ko has no message files.\n',
        '*** gmain zh-Hans has no message files.\n',
        '*** gmain zh-Hant has no message files.\n',
      ],
    },
  },
}

// subTest('FAKE_supportedTranslations');
// subTest('FAKE_bundle_create');
// subTest('FAKE_bundle_uploadStrings');
// subTest('FAKE_bundle_getStrings_1');
// subTest('FAKE_bundle_getStrings_2');
// subTest('FAKE_bundle_getEntryInfo_1');
// subTest('FAKE_bundle_getEntryInfo_2');

function fakeGpbTest(t, testId, callback) {
  if (translateMaybeSkip) return callback();
  if (exports.FAKE_testIds.indexOf(testId) < 0) return callback();
  var options = {};
  options[testId] = true;
  // pre-process here
  interceptGpb(options);
  sltTH.testHarness(t, targets[testId], false,
      function(name, unhook_intercept, cb) {
    translate.translateResource(function(err) {
      unhook_intercept();
      // post-process here.
      cb();
    });
  }, function() {
    return callback();
  });
}

function interceptGpb(options) {
  var gpbGetClient = gpb.getClient; // var credentials = getCredentials();
  gpb.getClient = function(credentials) {
    var ret = gpbGetClient(credentials);
    var gpbSupportedTranslations = ret.supportedTranslations;
    ret.supportedTranslations = options.FAKE_supportedTranslations ?
      function(p1, callback) { // callbak(err, supportedLangs);
        return callback('FAKE_supportedTranslations', null);
      } : gpbSupportedTranslations;
    var gpbBundle = ret.bundle;
    ret.bundle = function() {
      var bundle = gpbBundle.apply(ret, arguments);
      bundle.create = options.FAKE_bundle_create ?
        function(options, callback) {
          // options.sourceLanguage
          // options.targetLanguages
          // callback(err)
          return callback({obj:{message: 'FAKE_bundle_create'}});
        } : bundle.create;
      bundle.uploadStrings = options.FAKE_bundle_uploadStrings ?
        function(options, callback) {
          // options.languageId
          // options.strings
          // callback(err)
          return callback('FAKE_bundle_uploadStrings');
        } : bundle.uploadStrings;
      bundle.getStrings = options.FAKE_bundle_getStrings_1 ?
        function(options, callback) {
          // options
          // callback(err, data)
          // return callback('FAKE_bundle_getStrings');
          return callback({obj:{message: 'Language ABC does not exist.'}});
        } : bundle.getStrings;
      bundle.getStrings = options.FAKE_bundle_getStrings_2 ?
        function(options, callback) {
          // options
          // callback(err, data)
          // return callback('FAKE_bundle_getStrings');
          return callback({obj:{message: 'FAKE_bundle_getStrings'}});
        } : bundle.getStrings;
      if (options.FAKE_bundle_getEntryInfo_1 ||
          options.FAKE_bundle_getEntryInfo_2) {
        bundle.getStrings = function(options, callback) {
          // options
          // callback(err, data)
          // return callback('FAKE_bundle_getStrings');
          return callback(null, {resourceStrings: []});
        };
      }
      bundle.getEntryInfo = options.FAKE_bundle_getEntryInfo_1 ?
        function(options, callback) {
          // options
          // callback(err, data)
          return callback('FAKE_bundle_getEntryInfo');
        } : bundle.getEntryInfo;
      bundle.getEntryInfo = options.FAKE_bundle_getEntryInfo_2 ?
        function(options, callback) {
          // options
          // callback(err, data)
          return callback(null, {resourceEntry: {translationStatus: 'FAILED'}});
        } : bundle.getEntryInfo;
      // console.log(helper.INTERCEPT_GPB + '%j', ret);
      return bundle;
    };
    return ret;
  };
}
