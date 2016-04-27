var async = require('async');
var loadMsgHelper = require('./load-msg-helper');
var test = require('tap').test;

var wellKnownLangs = loadMsgHelper.wellKnownLangs;
var secondaryMgr = loadMsgHelper.secondaryMgr;

test('secondary test NOT forking', function(t) {
  async.forEachOfSeries(wellKnownLangs, function(lang, ix, callback) {
    secondaryMgr(lang, t, callback);
  }, function(err) {
    if (err) t.fail('language iteration failed.');
    t.end();
  });
});
