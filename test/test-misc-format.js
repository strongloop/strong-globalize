// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var SG = require('../index');
var helper = require('../lib/helper');
var sltTH = require('./slt-test-helper');
var test = require('tap').test;

var targets = {
  miscformat: {
    out: [
      'notice\n',
      'informational\n',
      'debug\n',
      'info\n',
      'log\n',
      'help\n',
      'data\n',
      'prompt\n',
      'verbose\n',
      'input\n',
      'silly\n',
      'write',
      'owrite',
      'f\n',
    ],
    err: [
      'emergency\n',
      'alert\n',
      'critical\n',
      'error\n',
      'warning\n',
      'warn\n',
      'ewrite',
    ],
  },
};
test('misc format test', function(t) {
  sltTH.testHarness(t, targets, false,
    function(name, unhook_intercept, callback) {
      switch (name) {
        case 'miscformat': {
          try {
            var rootDir = helper.getRootDir();
            global.STRONGLOOP_GLB = null;
            SG.SetRootDir(rootDir, {autonomousMsgLoading: 'invalidAML'});
            var g = SG();
            g.emergency('emergency');
            g.alert('alert');
            g.critical('critical');
            g.error('error');
            g.warning('warning');
            g.notice('notice');
            g.informational('informational');
            g.debug('debug');
            g.warn('warn');
            g.info('info');
            g.log('log');
            g.help('help');
            g.data('data');
            g.prompt('prompt');
            g.verbose('verbose');
            g.input('input');
            g.silly('silly');
            g.write('write');
            g.owrite('owrite');
            g.ewrite('ewrite');
            console.log(g.f('f'));
          } catch (e) {
            console.error(e.message);
          }
          unhook_intercept();
          callback();
          break;
        }
        default: {
          unhook_intercept();
          callback();
          break;
        }
      }
    }, function() {
      t.end();
    });
});
