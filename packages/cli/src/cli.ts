#!/usr/bin/env node
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: strong-globalize-cli
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

import * as optimist from 'optimist';
import * as extract from './extract';
import * as lint from './lint';
import * as translate from './translate';
import SG = require('strong-globalize');
const {helper} = SG;

async function main(args: string[]) {
  const options = optimist
    .options('h', {
      alias: 'help',
      describe: 'Print this message and exit',
      type: 'boolean',
    })
    .options('v', {
      alias: 'version',
      describe: 'Print version and exit',
      type: 'boolean',
    })
    .options('l', {
      alias: 'lint',
      describe: 'Check validity of string resource',
      type: 'boolean',
    })
    .options('t', {alias: 'translate', describe: 'Translate string resource'})
    .options('d', {
      alias: 'deepextract',
      describe: 'Deep-extract resource strings',
    })
    .options('e', {
      alias: 'extract',
      describe:
        'Extract resource strings to en/messages.json except for directories' +
        ' on [black list] separated by a space.',
    })
    .boolean(['h', 'v', 'l', 't', 'd', 'e'])
    .parse(args);

  if (options.v) {
    const cliVersion = require('../package.json').version;
    const runtimeVersion = require('strong-globalize/package.json').version;
    console.log('Versions: CLI=%s, Runtime=%s', cliVersion, runtimeVersion);
  }

  if (args.length === 0) {
    options.h = true;
  }

  if (options.h) {
    console.log(optimist.help());
  }

  if (options.h || options.v) return;

  const blackList: string[] = [];
  if (options.d || options.e) {
    blackList.push(...options._);
  }

  helper.initGlobForSltGlobalize();

  if (options.t) {
    return await translate.translateResource();
  }

  if (options.l) {
    return lint.lintMessageFiles(false);
  }

  if (options.e) {
    return extract.extractMessages(blackList, false, false);
  }

  if (options.d) {
    return extract.extractMessages(blackList, true, false);
  }
}

// node node lib/cli.js ...
main(process.argv.slice(2)).catch((e) => {
  console.error(e);
  process.exit(1);
});
