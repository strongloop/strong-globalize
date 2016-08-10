// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var gpbHelper = require('./gpb-translate-helper');
var test = require('tap').test;

test('test translate error ' + gpbHelper.FAKE_bundle_getEntryInfo_2,
  function(t) {
    gpbHelper.fakeGpbTest(t, gpbHelper.FAKE_bundle_getEntryInfo_2,
      function() { t.pass(); t.end(); });
  }
);
