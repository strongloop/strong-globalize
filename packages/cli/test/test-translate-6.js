// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: strong-globalize-cli
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var gpbHelper = require('./gpb-translate-helper');
var test = require('tap').test;

var skipTranslate =
  !process.env.SG_VERBOSE ||
  !process.env.BLUEMIX_URL ||
  !process.env.BLUEMIX_USER ||
  !process.env.BLUEMIX_PASSWORD ||
  !process.env.BLUEMIX_INSTANCE;

if (skipTranslate) {
  test('skip translate error ' + gpbHelper.FAKE_bundle_getStrings_1, function (
    t
  ) {
    t.pass();
    t.end();
  });
} else {
  test('test translate error ' + gpbHelper.FAKE_bundle_getStrings_1, function (
    t
  ) {
    gpbHelper.fakeGpbTest(t, gpbHelper.FAKE_bundle_getStrings_1, function () {
      t.pass();
      t.end();
    });
  });
}
