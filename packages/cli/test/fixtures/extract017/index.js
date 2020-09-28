// @strong-globalize
const g = require('a-npm-module');

// Assign to a variable
const msg = g.f('abc');

// Use `g.f()` for an argument
console.log(g.f('abc1'));

// Use `g.http(req).f()` for an argument
console.log(g.http({}).f('abc2'));

// Simulate transpiled TypeScript code for `import {g} from './globalize'`
console.log(g.default.f('abc3'));

const x = require('./globalize');

function test() {
  // @strong-globalize
  x.http({}).f('xyz');

  // @globalize
  x.log('xyz1');

  // @globalize
  x.abc.log('xyz2');
}

function test2() {
  // @strong-globalize
  const localG = require('a-npm-module');
  // Use `g.f()` for an argument
  console.log(localG.f('xyz3'));
}

class MyClass {
  constructor() {
    this.g = require('a-npm-module');
  }

  hello() {
    // @strong-globalize
    this.g.f('xyz4');
    console.log(
      // @strong-globalize
      this.g.f('xyz5')
    );
  }
}

console.log(msg);
test();
