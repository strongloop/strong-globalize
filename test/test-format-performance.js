var f = require('util').format;
var g = require('../lib/globalize');
var test = require('tap').test;

// The data was gathered by running (some) unit-tests of LoopBack
var data = require('./fixtures/loopback-sample-messages.json');

test('"g.f()" is at most 90x slower than "util.format()"', function(t) {
  var size = data.length;
  var baseline = measure(function format(args) { f.apply(this, args); });
  t.comment(f(
    '%s calls of "util.format()" took %s milliseconds', size, baseline));

  var duration = measure(function localize(args) { g.f.apply(g, args); });
  t.comment(f(
    '%s calls of "g.f()" took %s milliseconds', size, duration));

  var expected = 80 * baseline;
  var msg = f(
    'Expected %s calls of "g.f()" to finish under %sms, ' +
      'they took %sms instead.',
    size, expected, duration);
  t.ok(duration <= expected, msg);
  t.end();
});

function measure(fn) {
  var start = process.hrtime();
  for (var run = 0; run < 5; run++) {
    data.forEach(function(args) {
      fn(args);
    });
  }
  var delta = process.hrtime(start);
  return delta[0] * 1e3 + delta[1] / 1e6;
}
