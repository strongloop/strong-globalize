var loadMsgHelper = require('./load-msg-helper');
var test = require('tap').test;

var wellKnownLangs = loadMsgHelper.wellKnownLangs;
var secondaryMgr = loadMsgHelper.secondaryMgr;

test('secondary test NOT forking', function(t) {
  wellKnownLangs.forEach(function(lang) {
    secondaryMgr(lang, t);
  });
  t.end();
});
