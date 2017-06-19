// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';

var async = require('async');
var helper = require('../lib/helper');
var loadMsgHelper = require('./load-msg-helper');
var test = require('tap').test;

var wellKnownLangs = loadMsgHelper.wellKnownLangs;
var secondaryMgr = loadMsgHelper.secondaryMgr;

test('secondary test NOT forking', function(t) {
  async.forEachOfSeries(wellKnownLangs, function(lang, ix, callback) {
    secondaryMgr(__dirname, lang, t, helper.AML_ALL, true,
      function() {
        t.pass('secondaryMgr succeeds for ' + lang);
        callback();
      });
  }, function(err) {
    if (err) t.fail('language iteration failed.');
    else t.pass('language iteration succeeds.');
    t.end();
  });
});
