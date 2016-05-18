// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var SG = require('../index');
var async = require('async');
var helper = require('../lib/helper');
var mktmpdir = require('mktmpdir');
var path = require('path');
var shell = require('shelljs');
var stdout = require('intercept-stdout');

exports.testHarness = testHarness;

var DEBUG = false;

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
function testHarness(t, targets, noFixtures, testCallback) {
  var savedMaxDepth = process.env.STRONGLOOP_GLOBALIZE_MAX_DEPTH;
  process.env.STRONGLOOP_GLOBALIZE_MAX_DEPTH = null;
  mktmpdir(function(err, destDir, done) {

    function stripRootDirInfo(msgs, dir) {
      var ret = [];
      var rootDir = path.join(destDir, dir);
      msgs.forEach(function(msg) {
        if (typeof msg !== 'string') return;
        msg = msg.replace(rootDir, '');
        if (process.platform === 'win32')
          msg = msg.replace(/\\/g, '/');
        ret.push(msg);
      });
      return ret;
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
        outMsg.forEach(function(out, ix) {
          t.equal(out, targets[key].out[ix],
            key + ': out msg matches.')
        });
        errMsg.forEach(function(err, ix) {
          t.equal(err, targets[key].err[ix],
            key + ': err msg matches.')
        });
        t.equal(outMsg.length, targets[key].out.length,
          'out msg count matched: ' + key);
        t.equal(errMsg.length, targets[key].err.length,
          'err msg count matched: ' + key);
      }
    }

    function initRootDir(dir) {
      var rootDir = path.join(destDir, dir);
      shell.cd(rootDir);
      global.STRONGLOOP_GLB = undefined;
      // In case noFixtures, test goes more like real scenario which
      // requires real setRootDir.  Otherwise, setRootDir skips
      // the heavy weight global.STRONGLOOP_GLB initialization.
      if (!noFixtures) helper.initGlobForSltGlobalize(rootDir);
      helper.setRootDir(rootDir);
    }

    var keys = Object.keys(targets);
    if (err) t.fail('mktmpdir failed.');
    keys.forEach(function(key) {
      if (noFixtures) {
        var dir = path.join(destDir, key);
        shell.mkdir('-p', dir);
      } else {
        var dir = path.join(__dirname, 'fixtures', key);
        var copyDirs = [];
        copyDirs.push(dir);
        shell.cp('-R', copyDirs, destDir);
      }
    });
    var asyncTasks = [];
    keys.forEach(function(key) {
      asyncTasks.push(function(cb) {
        var myStdoutMsg = [];
        var myStderrMsg = [];
        function stdoutCb(txt) { myStdoutMsg.push(txt); }
        function stderrCb(txt) { myStderrMsg.push(txt); }
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
      done();
    });
  }, function(err, dir) {
    if (process.platform !== 'win32') {
      if (err) t.fail('mktmpdir cleanup failed.');
    }
    process.env.STRONGLOOP_GLOBALIZE_MAX_DEPTH = savedMaxDepth;
    t.end();
  });
}
