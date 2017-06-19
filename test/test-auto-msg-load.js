// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';

var async = require('async');
var extract = require('../lib/extract');
var fs = require('fs');
var helper = require('../lib/helper');
var loadMsgHelper = require('./load-msg-helper');
var mktmpdir = require('mktmpdir');
var path = require('path');
var shell = require('shelljs');
var stdout = require('intercept-stdout');
var test = require('tap').test;
var translate = require('../lib/translate');

var translateMaybeSkip = (!process.env.SG_VERBOSE ||
  !process.env.BLUEMIX_URL ||
  !process.env.BLUEMIX_USER || !process.env.BLUEMIX_PASSWORD ||
  !process.env.BLUEMIX_INSTANCE) ?
  {skip: 'Incomplete Bluemix environment'} : false;

var VERBOSE = process.env.SG_VERBOSE;

function stdoutCb(txt) {
  return VERBOSE ? null : '';
}
function stderrCb(txt) {
  return VERBOSE ? null : '';
}

var wellKnownLangs = loadMsgHelper.wellKnownLangs;
var secondaryMgr = loadMsgHelper.secondaryMgr;
var POSITIVE_TEST = true;
var NEGATIVE_TEST = false;

test('deep extraction and autonomous msg loading NOT forking', function(t) {
  mktmpdir(function(err, destDir, done) {
    if (err) t.fail('mktmpdir failed.');
    shell.cd(__dirname);
    shell.cp('-R', [
      path.join(__dirname, 'intl/'),
      path.join(__dirname, 'package.json'),
      path.join(__dirname, 'node_modules/')], destDir);
    shell.cd(destDir);
    global.STRONGLOOP_GLB = null;
    helper.initGlobForSltGlobalize();
    helper.setRootDir(destDir);

    async.series([
      function(cb) {
        // before deep extraction: AML_NONE fails.
        async.forEachOfSeries(wellKnownLangs, function(lang, ix, callback) {
          secondaryMgr(destDir, lang, t, helper.AML_NONE, NEGATIVE_TEST,
            function() {
              t.pass('secondaryMgr succeeds for ' + lang);
              callback();
            });
        }, function(err) {
          if (err) t.fail('language iteration 1 failed.');
          else t.pass('language iteration 1 succeeds.');
          cb();
        });
      },
      function(cb) {
        helper.setRootDir(destDir);
        var savedMaxDepth = process.env.STRONGLOOP_GLOBALIZE_MAX_DEPTH;
        process.env.STRONGLOOP_GLOBALIZE_MAX_DEPTH = null;
        var unhook_intercept = stdout(stdoutCb, stderrCb);
        extract.extractMessages(null, true, true, function(err, result) {
          unhook_intercept();
          if (err) t.fail('extractMessages failed.');
          else t.pass('extractMessages succeeds.');
          process.env.STRONGLOOP_GLOBALIZE_MAX_DEPTH = savedMaxDepth;
          cb();
        });
      },
      function(cb) {
        var targetMsgJson = {
          '2b98ad6283669674d93a859cfac60ce8': 'third - primary depth message',
          '3625530735ca7c9c82a92e175567b983': 'second - primary depth message',
          'bcce77306579f3003521bdf464b93365': 'fourth - second depth message',
          'efc671b7d450e2536f4ba0eebd4d04e1': 'fifth - primary depth message',
        };
        try {
          var enMsges = fs.readFileSync(
            path.join(destDir, 'intl', 'en', 'messages.json'), 'utf8');
          t.pass('extracted En msg json exists.');
        } catch (e) {
          t.fail('extracted En msg json read failure.');
        }
        try {
          var extractedMsgJson = JSON.parse(enMsges);
          t.pass('extracted En msg json parsed.');
        } catch (e) {
          t.fail('extracted En msg json parse failure.');
        }
        t.equal(JSON.stringify(extractedMsgJson),
          JSON.stringify(targetMsgJson),
          'En msg json successfully extracted.');
        cb();
      },
      function(cb) {
        if (translateMaybeSkip) {
          cb();
          return;
        }
        global.STRONGLOOP_GLB = undefined;
        helper.setRootDir(destDir);
        var unhook_intercept = stdout(stdoutCb, stderrCb);
        translate.translateResource(function(err) {
          unhook_intercept();
          if (err) {
            t.comment('*** translate is unavailable; skipping.');
            translateMaybeSkip = true;
          } else {
            t.pass('translate succeeds.');
          }
          cb();
        });
      },
      function(cb) {
        // after deep extraction: only aml_none with EN.
        async.forEachOfSeries(wellKnownLangs, function(lang, ix, callback) {
          if (translateMaybeSkip && lang !== helper.ENGLISH) {
            callback();
            return;
          }
          secondaryMgr(destDir, lang, t, helper.AML_NONE, POSITIVE_TEST,
            function() {
              t.pass('secondaryMgr succeeds for ' + lang);
              callback();
            });
        }, function(err) {
          if (err) t.fail('language iteration 2 failed.');
          else t.pass('language iteration 2 succeeds.');
          cb();
        });
      },
      function(cb) {
        // after deep extraction: aml overriding with all non-EN succeed.
        async.forEachOfSeries(wellKnownLangs, function(lang, ix, callback) {
          secondaryMgr(destDir, lang, t,
            ['secondary', 'third', 'fourth', 'fifth'], POSITIVE_TEST,
            function() {
              callback();
            });
        }, function(err) {
          if (err) t.fail('language iteration 3 failed.');
          cb();
        });
      },
      function(cb) {
        // after deep extraction: aml_all with all non-EN succeed.
        async.forEachOfSeries(wellKnownLangs, function(lang, ix, callback) {
          secondaryMgr(destDir, lang, t, helper.AML_ALL, POSITIVE_TEST,
            function() {
              callback();
            });
        }, function(err) {
          if (err) t.fail('language iteration 4 failed.');
          cb();
        });
      },
    ], done);
  }, function(err, dir) {
    if (process.platform !== 'win32') {
      if (err) t.fail('mktmpdir cleanup failed.');
    }
    t.end();
  });
});
