// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var async = require('async');
var helper = require('../lib/helper');
var loadMsgHelper = require('./load-msg-helper');

var wellKnownLangs = loadMsgHelper.wellKnownLangs;
var secondaryMgr = loadMsgHelper.secondaryMgr;

var cluster = require('cluster');

if (cluster.isMaster && !process.argv[2]) {
  cluster.setupMaster({
    exec: __filename,
    args: ['second_invoke'],
    silent: false,
  });
  cluster.fork();
  cluster.on('online', function(worker) {
    // worker has started.
  });
  cluster.on('exit', function(worker) {
    // worker has completed.
  });
} else if (cluster.isWorker) {
  var test = require('tap').test;
  test('secondary test on forking', function(t) {
    t.match(process.argv[2], 'second_invoke',
      'worker in the second invoke');
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
      // process should now exit cleanly
      process.disconnect();
    });
  });
}
