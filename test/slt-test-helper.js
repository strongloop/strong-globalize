// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var async = require('async');
var helper = require('../lib/helper');
var mktmpdir = require('mktmpdir');
var path = require('path');
var shell = require('shelljs');
var stdout = require('intercept-stdout');

exports.testHarness = testHarness;

var DEBUG = false;
var VERBOSE = process.env.SG_VERBOSE;

// testHarness(t, targets, testCallback)
//     targets = {
//       key000: {
//         out: [
//           ...
//         ],
//         err: [
//           ...
//         ],
//       },
//       key001: {
//         out: [
//           ...
//         ],
//         err: [
//           ...
//         ],
//       },
// }
//
// testCallback(unhook_intercept, outErrCallback);
//    must call outErrCallback(outMsg, errMsg)
//
function testHarness(t, targets, noFixtures, testCallback, testAllDone) {
  var savedMaxDepth = process.env.STRONGLOOP_GLOBALIZE_MAX_DEPTH;
  process.env.STRONGLOOP_GLOBALIZE_MAX_DEPTH = null;
  mktmpdir(function(err, destDir, done) {

    function stripRootDirInfo(msgs, dir) {
      var ret = [];
      var rootDir = path.join(destDir, dir);
      msgs.forEach(function(msg) {
        if (typeof msg !== 'string') return;
        if (process.platform === 'win32') {
          rootDir = rootDir.replace(/\\/g, '/');
          msg = msg.replace(/\\/g, '/');
        }
        msg = msg.replace(new RegExp(rootDir, 'g'), '');
        ret.push(msg);
      });
      return ret;
    }

    function passTemporaryFailure(found, target) {
      var failureMsg = helper.MSG_GPB_UNAVAILABLE;
      found = found.trim();
      var isTempFailure = (found !== target) && (found === failureMsg);
      return isTempFailure;
    }

    function checkErrMsg(outMsg, errMsg, key, targets, t) {
      outMsg = stripRootDirInfo(outMsg, key);
      errMsg = stripRootDirInfo(errMsg, key);
      if (DEBUG) console.log(
        '\n<<< BEGIN', key,
        '\nout ________________\n',
        outMsg,
        '\nerr ________________\n',
        errMsg,
        '\n________________',
        '\nEND', key, '>>>\n'
      );
      if (!DEBUG) {
        var temporaryFailure = false;
        outMsg.forEach(function(out, ix) {
          temporaryFailure = temporaryFailure ||
            passTemporaryFailure(out, targets[key].out[ix]);
          if (temporaryFailure) return;
          t.match(out, targets[key].out[ix],
            key + ': out msg matches.');
        });
        if (temporaryFailure) return;
        errMsg.forEach(function(err, ix) {
          temporaryFailure = temporaryFailure ||
            passTemporaryFailure(err, targets[key].err[ix]);
          if (temporaryFailure) return;
          t.match(err, targets[key].err[ix],
            key + ': err msg matches.');
        });
        if (temporaryFailure) return;
        t.equal(outMsg.length, targets[key].out.length,
          'out msg count matched: ' + key);
        t.equal(errMsg.length, targets[key].err.length,
          'err msg count matched: ' + key);
      }
    }

    function initRootDir(dir) {
      var rootDir = path.join(destDir, dir);
      shell.cd(rootDir);
      shell.mkdir('-p', path.join(rootDir, 'intl'));
      global.STRONGLOOP_GLB = undefined;
      // In case noFixtures, test goes more like real scenario which
      // requires real setRootDir.  Otherwise, setRootDir skips
      // the heavy weight global.STRONGLOOP_GLB initialization.
      if (!noFixtures) helper.initGlobForSltGlobalize(rootDir);
      helper.setRootDir(rootDir);
    }

    var keys = Object.keys(targets);
    if (err) t.fail('mktmpdir failed.');
    var copyDirs = [];
    keys.forEach(function(key) {
      var dir;
      if (noFixtures) {
        dir = path.join(destDir, key);
        t.comment('--- making dir: %s', dir);
        shell.mkdir('-p', dir);
        t.comment('----- made dir: %s', dir);
      } else {
        dir = path.join(__dirname, 'fixtures', key);
        copyDirs.push(dir);
      }
    });
    if (!noFixtures) {
      t.comment('--- copying %d: %s to %s',
        copyDirs.length, JSON.stringify(copyDirs, null, 2), destDir);
      shell.cp('-r', copyDirs, destDir);
      t.comment('---- copied %d: %s to %s',
        copyDirs.length, JSON.stringify(copyDirs, null, 2), destDir);
    }
    var asyncTasks = [];
    keys.forEach(function(key) {
      asyncTasks.push(function(cb) {
        var myStdoutMsg = [];
        var myStderrMsg = [];
        function stdoutCb(txt) {
          // ignore the heart beat dots
          if (txt !== '.') myStdoutMsg.push(txt);
          return VERBOSE ? null : '';
        }
        function stderrCb(txt) {
          myStderrMsg.push(txt);
          return VERBOSE ? null : '';
        }
        var unhook_intercept = stdout(stdoutCb, stderrCb);
        var name = this.toString();
        initRootDir(name);
        testCallback(name, unhook_intercept, function(proceed) {
          if (!proceed) {
            checkErrMsg(myStdoutMsg, myStderrMsg, name, targets, t);
          };
          cb();
        });
      }.bind(key));
    });
    async.series(asyncTasks, function(err, result) {
      done(err); // of mktmpdir
    });
  }, function(err, dir) {
    if (process.platform !== 'win32') {
      if (err) t.fail('mktmpdir cleanup failed.');
    }
    process.env.STRONGLOOP_GLOBALIZE_MAX_DEPTH = savedMaxDepth;
    if (testAllDone) testAllDone();
  });
}
