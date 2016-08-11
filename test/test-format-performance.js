var f = require('util').format;
var g = require('../lib/globalize');
var test = require('tap').test;

// The data was gathered by running (some) unit-tests of LoopBack
var data = require('./fixtures/loopback-sample-messages.json');

test('"g.f()" is at most 5x slower than "util.format()"', function(t) {
  var size = data.length;
  var baseline = measure(function format(args) { f.apply(this, args); });
  t.comment(f('%s calls of "util.format()" took %s milliseconds', size, baseline));

  var duration = measure(function localize(args) { g.f.apply(g, args); });
  t.comment(f('%s calls of "g.f()" took %s milliseconds', size, duration));

  var msg = f(
    'Expected %s calls of "g.f()" to finish under %sms, ' +
      'they took %sms instead.',
    size, 5*baseline, duration);
  t.ok(duration < 5*baseline, msg);
  t.end();
});

function measure(fn) {
  var start = process.hrtime();
  data.forEach(function(args) {
    fn(args);
  });
  var delta = process.hrtime(start);
  return delta[0]*1e3 + delta[1]/1e6;
}
