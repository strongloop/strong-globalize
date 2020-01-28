// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: strong-globalize-cli
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var gpbHelper = require('./gpb-translate-helper');
var test = require('tap').test;

test('test translate error ' + gpbHelper.FAKE_supportedTranslations, function(
  t
) {
  gpbHelper.fakeGpbTest(t, gpbHelper.FAKE_supportedTranslations, function() {
    t.pass();
    t.end();
  });
});
