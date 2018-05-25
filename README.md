# strong-globalize

This repository contains StrongLoop Globalize CLI and Runtime modules.

<a href="https://badge.fury.io/js/strong-globalize">
<img src="https://badge.fury.io/js/strong-globalize.svg" alt="npm version" height="18">
</a>
<a href='https://travis-ci.org/strongloop/strong-globalize'>
<img src='https://travis-ci.org/strongloop/strong-globalize.svg?branch=master' alt='Build Status'/>
</a>
<a href='https://coveralls.io/github/strongloop/strong-globalize?branch=master'>
<img src='https://coveralls.io/repos/github/strongloop/strong-globalize/badge.svg?branch=master' alt='Test Coverage'/>
</a>

# What's new in 4.0.0

Starting from 4.0.0, it becomes a monorepo managed by [lerna](https://lernajs.io/)
with the following packages:

- [strong-globalize-cli](packages/cli): CLI for translate, lint, and extract
- [strong-globalize](packages/runtime): APIs and implementation for globalization
- [strong-globalize-util](packages/util): Utility to generate CLDR json data file (private module, not published to npm)

Most of the code has been rewritten in TypeScript.

For documentation, check out:

- [CLI tooling](packages/cli/README.md)
- [Runtime library](packages/runtime/README.md)
