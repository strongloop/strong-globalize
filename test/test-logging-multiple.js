// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
'use strict';

var SG = require('../index');
var stdout = require('intercept-stdout');
var test = require('tap').test;

var VERBOSE = process.env.SG_VERBOSE;

SG.SetRootDir(__dirname);
SG.SetDefaultLanguage();
var g = SG();

var aliases = [
  {level: 'emergency', err: true, fn: function(title) {
    g.emergency(title);
  }},
  {level: 'alert', err: true, fn: function(title) {
    g.alert(title);
  }},
  {level: 'critical', err: true, fn: function(title) {
    g.critical(title);
  }},
  {level: 'error', err: true, fn: function(title) {
    g.error(title);
  }},
  {level: 'warning', err: true, fn: function(title) {
    g.warning(title);
  }},
  {level: 'notice', err: false, fn: function(title) {
    g.notice(title);
  }},
  {level: 'informational', err: false, fn: function(title) {
    g.informational(title);
  }},
  {level: 'debug', err: false, fn: function(title) {
    g.debug(title);
  }},
  {level: 'warn', err: true, fn: function(title) {
    g.warn(title);
  }},
  {level: 'info', err: false, fn: function(title) {
    g.info(title);
  }},
  {level: 'log', err: false, fn: function(title) {
    g.log(title);
  }},
  {level: 'help', err: false, fn: function(title) {
    g.help(title);
  }},
  {level: 'data', err: false, fn: function(title) {
    g.data(title);
  }},
  {level: 'verbose', err: false, fn: function(title) {
    g.verbose(title);
  }},
  {level: 'input', err: false, fn: function(title) {
    g.input(title);
  }},
  {level: 'prompt', err: false, fn: function(title) {
    g.prompt(title);
  }},
];

aliases.forEach(function(alias) {
  var title = alias.level +
    ' (this msg is shown in the console - multiple)';
  test(title, function(t) {
    var called = false;
    function myLogCb(level, msg) {
      if (msg.message.indexOf('StrongGlobalize') === 0) return;
      var myLogCbMsg = {level: level, msg: msg};
      t.assert(!called, 'Callback is called once.');
      logTestWithConsoleEnabled(myLogCbMsg, t, alias, title);
      called = true;
    }
    SG.SetPersistentLogging(myLogCb, false);
    alias.fn(title);
  });
});

function logTestWithConsoleEnabled(myLogCbMsg, t, alias, expectedMsg) {
  var myStdoutMsg = null;
  var myStderrMsg = null;
  function stdoutCb(txt) {
    myStdoutMsg = txt;
    return VERBOSE ? null : '';
  }
  function stderrCb(txt) {
    myStderrMsg = txt;
    return VERBOSE ? null : '';
  }
  var unhook_intercept = stdout(stdoutCb, stderrCb);
  setTimeout(function() {
    var myStdMsg = alias.err ? myStderrMsg : myStdoutMsg;
    t.comment('myLogCbMsg: %j', myLogCbMsg);
    t.comment('myStdMsg: %s', myStdMsg);
    unhook_intercept();
    if (myLogCbMsg && myStdMsg) {
      t.equal(myLogCbMsg.level, alias.level,
        'Persistent logging callback returns the level:' + alias.level);
      t.equal(myLogCbMsg.msg.message, expectedMsg,
        'Persistent logging callback returns the correct message.');
      t.assert(myStdMsg.indexOf(expectedMsg) >= 0,
        (alias.err ? 'Strerr' : 'Stdout') +
        ' shows the correct message for ' + alias.level);
    } else {
      t.fail('Both persistent logging callback and stdout should return.');
    }
    t.end();
  }, 50);
}

aliases.forEach(function(alias) {
  var title = alias.level + ' (console disabled in multiple logging)';
  test(title, function(t) {
    var called = false;
    function myLogCb(level, msg) {
      if (msg.message.toString().indexOf('StrongGlobalize') === 0) return;
      var myLogCbMsg = {level: level, msg: msg};
      t.assert(!called, 'Callback is called once.');
      logTestWithConsoleDisabled(myLogCbMsg, t, alias, title);
      called = true;
    }
    SG.SetPersistentLogging(myLogCb, true);
    alias.fn(title);
  });
});

function logTestWithConsoleDisabled(myLogCbMsg, t, alias, expectedMsg) {
  var myStdoutMsg = null;
  var myStderrMsg = null;
  function stdoutCb(txt) { myStdoutMsg = txt; }
  function stderrCb(txt) { myStderrMsg = txt; }
  var unhook_intercept = stdout(stdoutCb, stderrCb);
  setTimeout(function() {
    var myStdMsg = alias.err ? myStderrMsg : myStdoutMsg;
    t.comment('myLogCbMsg: %j', myLogCbMsg);
    t.comment('myStdMsg: %s', myStdMsg);
    unhook_intercept();
    if (myLogCbMsg && !myStdMsg) {
      t.equal(myLogCbMsg.level, alias.level,
        'Persistent logging callback returns the level:' + alias.level);
      t.equal(myLogCbMsg.msg.message, expectedMsg,
        'Persistent logging callback returns the correct message.');
      t.assert(!myStdMsg, (alias.err ? 'Strerr' : 'Stdout') +
        ' should not show the message for ' + alias.level);
    } else {
      t.fail('Only persistent logging callback should return.');
    }
    t.end();
  }, 50);
}
