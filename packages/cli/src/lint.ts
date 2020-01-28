// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: strong-globalize-cli
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

import assert = require('assert');
const {helper} = require('strong-globalize');
const wc = require('word-count');

const MAX_KEY_LENGTH = 256;
// max number of alphanumeric characters
const MAX_VALUE_LENGTH = 8192;
// max number of characters in an English message
const CHECK_NAME_HEAD = false;
const PLACEHOLDER_NAMES_ALLOWED = ['ph'];
// recommended placeholder name headers

export type Trait = {
  bundleName: string;
  nFiles: number;
  malformed: boolean;
  msgs: {[key: string]: Message};
  dupKeys: string[];
  phLeftOrphans: Trait[];
  phRightOrphans: Trait[];
};

export type Message = {
  length?: number;
  cDoubleLeftBraces?: number;
  cDoubleRightBraces?: number;
  hardCoded?: string[] | null;
  cHardCoded?: number;
  phKeys?: string[];
  phLeftOrphans?: string[] | null;
  phRightOrphans?: string[] | null;
};

/**
 * lintMessageFiles
 *
 * @param {Function} function(err)
 *
 * For all languages (including EN), check the followings:
 *   Directory structure (equivalent of initIntlDirs)
 *   File-level requirements for StrongLoop globalization, such as
 *     Number of message JSON files under language subdirectory
 *     File names
 *     Number of messages in each message JSON does not exceed GPS's limitation
 *     Length of key names does not exceed GPS's limitation
 *     Length of values does not exceed GPS's limitation
 *     Curly braces pair
 *     Place holder naming convention
 * For non-English languages
 *  Compatibility with EN messages on # of messages, key names, curly braces
 *  place holders, etc.
 *
 */
export function lintMessageFiles(enOnly: boolean): boolean {
  const packageName = helper.getPackageName();
  const traitEnglish = verifyLanguage(helper.ENGLISH);
  if (traitEnglish.malformed) {
    console.error(
      '*** English file is malformed. Other languages not checked.'
    );
    return traitEnglish.malformed;
  }
  console.log('--- linted', packageName + ' en');
  if (enOnly) {
    return traitEnglish.malformed;
  }
  let malformed = false;
  helper.enumerateLanguageSync((lang: string) => {
    if (lang === helper.ENGLISH) return false;
    const trait = verifyLanguage(lang);
    console.log('--- linted', packageName + ' ' + lang);
    if (trait.malformed) {
      malformed = true;
      return false; // Continue to check for more failures
    } else {
      return false; // Continue to check
    }
  });
  return malformed;

  function isCompatibleWithEnglish(lang: string, trait: Trait) {
    let verified = true;
    if (traitEnglish.malformed) return false;
    if (trait.nFiles !== traitEnglish.nFiles) {
      console.error(
        '***',
        trait.bundleName,
        'incompatible w/En : message file count.'
      );
      verified = false;
    }
    const keys = Object.keys(trait.msgs);
    keys.forEach(function(key) {
      const enMsg = traitEnglish.msgs[key];
      if (!enMsg) {
        console.error(
          '***',
          trait.bundleName,
          '****** incompatible w/En no such key:',
          key
        );
        verified = false;
        return;
      }
      const msg = trait.msgs[key];
      if (msg.length === 0) {
        console.error(
          '***',
          trait.bundleName,
          '****** empty translation:',
          key
        );
        verified = false;
      }
      if (msg.cHardCoded !== enMsg.cHardCoded) {
        console.error(
          '***',
          trait.bundleName,
          'incompatible w/En double curly braces:',
          key
        );
        verified = false;
      }
      if (msg.phKeys!.length !== enMsg.phKeys!.length) {
        console.error(
          '***',
          trait.bundleName,
          'incompatible w/En placeholders:',
          key
        );
        verified = false;
      } else {
        enMsg.phKeys!.forEach(phKey => {
          if (msg.phKeys!.indexOf(phKey) < 0) {
            console.error(
              '***',
              trait.bundleName,
              'incompatible w/En placeholder:',
              phKey,
              'is missing.'
            );
            verified = false;
          }
        });
      }
    });
    return verified;
  }

  function verifyLanguage(lang: string) {
    assert(helper.isSupportedLanguage(lang));
    console.log('--- linting ' + packageName + ' ' + lang);
    const trait = extractTrait(lang);
    let verified = checkTrait(trait);
    if (lang !== helper.ENGLISH) {
      verified = verified && isCompatibleWithEnglish(lang, trait);
    }
    trait.malformed = trait.malformed || !verified;
    // console.log('*****************', JSON.stringify(trait, null, 4));
    return trait;
  }

  function extractTrait(lang: string) {
    const trait: Trait = {
      bundleName: packageName + ' ' + lang,
      nFiles: 0,
      malformed: false,
      msgs: {},
      dupKeys: [],
      phLeftOrphans: [],
      phRightOrphans: [],
    };
    let msgCount = 0;
    let wordCount = 0;
    let characterCount = 0;
    const rootDir = helper.getRootDir();
    helper.enumerateMsgSync(rootDir, lang, false, function(
      // tslint:disable-next-line:no-any
      jsonObj: {[key: string]: any},
      msgFilePath: string
    ) {
      const jsonObjKeys = Object.keys(jsonObj);
      trait.nFiles++;
      jsonObjKeys.forEach(key => {
        if (key in trait.msgs) {
          trait.dupKeys.push(key);
          return;
        }
        trait.msgs[key] = {};
        const trt = trait.msgs[key];
        const msg = jsonObj[key];
        trt.length = undefined;
        if (typeof msg === 'string') {
          if (lang === helper.ENGLISH) {
            msgCount++;
            wordCount += wc(msg);
            characterCount += msg.length;
          }
          trt.length = msg.length;
          trt.cDoubleLeftBraces = (msg.match(/{{/g) || []).length;
          trt.cDoubleRightBraces = (msg.match(/}}/g) || []).length;
          trt.hardCoded = msg.match(/{{.+?}}/g);
          trt.cHardCoded = trt.hardCoded ? trt.hardCoded.length : 0;
          trt.phKeys = [];
          let trimedMsg = msg
            .trim()
            .replace(/{{/g, '')
            .replace(/}}/g, '');
          const phs = trimedMsg.match(/{[0-9a-zA-Z]+?}/g);
          if (phs)
            phs.forEach(function(ph) {
              const phKey = ph.slice(1, -1);
              trimedMsg = trimedMsg.replace(ph, phKey);
              trt.phKeys!.push(phKey);
            });
          trt.phLeftOrphans = trimedMsg.match(/{[0-9a-zA-Z]+?[^0-9a-zA-Z}]/g);
          trt.phRightOrphans = trimedMsg.match(/[^{0-9a-zA-Z][0-9a-zA-Z]+?}/g);
        }
      });
    });
    if (lang === helper.ENGLISH)
      console.log(
        '--- linted',
        msgCount,
        'messages,',
        wordCount,
        'words,',
        characterCount,
        'characters'
      );
    return trait;
  }
}

function isNameAllowed(name: string, namesAllowed: string[]) {
  if (!name) return false;
  if (!/^[a-z][0-9a-zA-Z]*$/.test(name) && !/^[0-9]+$/.test(name)) return false;
  if (!CHECK_NAME_HEAD) return true;
  return helper.headerIncluded(name, namesAllowed);
}

function checkTrait(trait: Trait) {
  let verified = true;
  let plural = false;
  if (trait.nFiles === 0) {
    console.error('***', trait.bundleName, 'has no message files.');
    return false;
  }
  if (trait.dupKeys.length > 0) {
    plural = trait.dupKeys.length > 1;
    console.error(
      '***',
      trait.bundleName,
      'has' +
        (plural ? ' ' : ' an ') +
        'duplicate message key' +
        (plural ? 's:' : ':')
    );
    trait.dupKeys.forEach(dupKey => {
      console.error('***   ' + dupKey);
    });
    verified = false;
  }
  const keys = Object.keys(trait.msgs);
  keys.forEach((key, ix) => {
    const msg = trait.msgs[key];
    if (key.length > MAX_KEY_LENGTH) {
      console.error(
        '***',
        trait.bundleName + ':' + key,
        'name is longer than',
        MAX_KEY_LENGTH
      );
      verified = false;
    }
    if (msg.length! > MAX_VALUE_LENGTH) {
      console.error(
        '***',
        trait.bundleName + ':' + key,
        'message is longer than',
        MAX_VALUE_LENGTH
      );
      verified = false;
    }
    if (
      msg.cDoubleLeftBraces !== msg.cDoubleRightBraces ||
      msg.cDoubleLeftBraces !== msg.cHardCoded
    ) {
      console.error(
        '***',
        trait.bundleName + ':' + key,
        'has malformed double curly braces.'
      );
      verified = false;
    }
    if (msg.phKeys!.length > 0) {
      msg.phKeys!.forEach(phKey => {
        if (!isNameAllowed(phKey, PLACEHOLDER_NAMES_ALLOWED)) {
          console.error(
            '***',
            trait.bundleName + ':' + key,
            'has an odd placeholder key: ' + phKey
          );
          verified = false;
        }
      });
    }
    if (msg.phLeftOrphans && msg.phLeftOrphans.length > 0) {
      plural = msg.phLeftOrphans.length > 1;
      console.error(
        '***',
        trait.bundleName + ':' + key,
        'seems to have ' +
          (plural ? '' : 'a ') +
          'left orphan placeholder' +
          (plural ? 's:' : ':')
      );
      msg.phLeftOrphans.forEach(function(phKey) {
        console.error('***   ' + phKey);
      });
      verified = false;
    }
    if (msg.phRightOrphans && msg.phRightOrphans.length > 0) {
      plural = msg.phRightOrphans.length > 1;
      console.error(
        '***',
        trait.bundleName + ':' + key,
        'seems to have ' +
          (plural ? '' : 'a ') +
          'right orphan placeholder' +
          (plural ? 's:' : ':')
      );
      msg.phRightOrphans.forEach(function(phKey) {
        console.error('***   ' + phKey);
      });
      verified = false;
    }
  });
  trait.malformed = !verified;
  return verified;
}
