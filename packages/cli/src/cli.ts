#!/usr/bin/env node
// Copyright IBM Corp. 2015,2018. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

import * as optimist from 'optimist';
import * as extract from './extract';
import * as lint from './lint';
import * as translate from './translate';
import SG = require('strong-globalize');
const {helper} = SG;

async function main(argv: string[]) {
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
    .parse(argv);

  if (options.v) {
    console.log(require('../package.json').version);
    return;
  }

  if (options.h) {
    optimist.help();
    return;
  }

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

main(process.argv).catch(e => {
  console.error(e);
  process.exit(1);
});
