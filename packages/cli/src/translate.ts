// Copyright IBM Corp. 2015,2018. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

import _ = require('lodash');
import assert = require('assert');
import dbg = require('debug');
const debug = dbg('strong-globalize-cli');
import fs = require('fs');
const gpb = require('g11n-pipeline');
import {promisify} from './promisify';
import SG = require('strong-globalize');
const {helper} = SG;
import {AnyObject} from 'strong-globalize/lib/config';
import * as lint from './lint';
import os = require('os');
import path = require('path');
import mkdirp = require('mkdirp');
const mktmpdir = require('mktmpdir') as Function;
const wc = require('word-count');

const createTmpDir = promisify(mktmpdir);

let INTL_DIR = helper.myIntlDir();
// GPB service limits
export const GPB_MAX_NUMBER_OF_KEYS = 500; // per messages.json
let MY_TRANSLATION_UNIT = GPB_MAX_NUMBER_OF_KEYS;

function bound(n: number, lowerBound: number, upperBound: number) {
  n = typeof n === 'number' ? Math.round(n) : upperBound;
  n = Math.max(n, lowerBound);
  n = Math.min(n, upperBound);
  return n;
}

export function setTranslationUnit(unit: number) {
  MY_TRANSLATION_UNIT = bound(unit, 1, GPB_MAX_NUMBER_OF_KEYS);
  return MY_TRANSLATION_UNIT;
}

export function adjustLangForGPB(lang: string) {
  if (lang === 'pt') return 'pt-BR';
  return lang;
}

export function reverseAdjustLangFromGPB(lang: string) {
  if (lang === 'pt-BR') return 'pt';
  return lang;
}

const msgStore: AnyObject = {};

function storeMsg() {
  fs.writeFileSync(
    path.join(INTL_DIR, 'MSG.json'),
    JSON.stringify(helper.sortMsges(msgStore), null, 2) + '\n'
  );
}

function writeToMsg(lang: string, key: string, value: string) {
  assert(
    typeof value === 'string',
    'Message value type is not <string>: ' + typeof value
  );
  if (!msgStore[lang]) msgStore[lang] = {};
  msgStore[lang][key] = value;
}

function writeAllToMsg(lang: string, json: AnyObject) {
  assert(helper.isSupportedLanguage(lang), 'Unsupported language key: ' + lang);
  Object.keys(json)
    .sort()
    .forEach(function(key) {
      writeToMsg(lang, key, json[key]);
    });
}

export function getCredentials() {
  let LC;
  try {
    LC = require(path.join(
      os.homedir(),
      '.strong-globalize/ibm-cloud-credentials.json'
    ));
  } catch (e) {
    // Ignore error
  }
  const BLUEMIX_URL = process.env.BLUEMIX_URL || 'url';
  const BLUEMIX_USER = process.env.BLUEMIX_USER || 'user';
  const BLUEMIX_PASSWORD = process.env.BLUEMIX_PASSWORD || 'password';
  const BLUEMIX_INSTANCE = process.env.BLUEMIX_INSTANCE || 'instanceid';
  if (!LC || !LC.credentials)
    LC = {
      credentials: {},
    };
  LC.credentials.url = LC.credentials.url || BLUEMIX_URL;
  LC.credentials.userId = LC.credentials.userId || BLUEMIX_USER;
  LC.credentials.password = LC.credentials.password || BLUEMIX_PASSWORD;
  LC.credentials.instanceId = LC.credentials.instanceId || BLUEMIX_INSTANCE;
  return LC;
}

/**
 * translateResource
 *
 * @param {Function} Optional callback function. If not provided, a promise
 * will be returned.
 */
// tslint:disable-next-line:no-any
export function translateResource(cb?: (err?: any) => void): Promise<void> {
  if (!cb) {
    return _translateResource();
  } else {
    _translateResourceWithCallback(cb);
    return Promise.resolve();
  }
}

/**
 * translateResource
 *
 * @param {Function} function(err)
 */
async function _translateResource() {
  INTL_DIR = path.join(helper.getRootDir(), 'intl');
  const myTargetLangs: string[] = [];
  helper.enumerateLanguageSync((lang: string) => {
    if (lang === helper.ENGLISH) return false;
    myTargetLangs.push(adjustLangForGPB(lang));
    return false;
  });
  const credentials = getCredentials();
  const gpClient = gpb.getClient(credentials);
  let supportedLangs: AnyObject | undefined;
  let err;
  try {
    const supportedTranslations = promisify(gpClient.supportedTranslations.bind(
      gpClient
    ) as Function);
    supportedLangs = await supportedTranslations({});
  } catch (e) {
    err = e;
  }
  if (err || !(supportedLangs && supportedLangs.en)) {
    const e = helper.MSG_GPB_UNAVAILABLE;
    console.error(e);
    throw e;
  }
  const langs: string[] = [];
  myTargetLangs.forEach(function(targetLang) {
    if (supportedLangs!.en.indexOf(targetLang) >= 0) langs.push(targetLang);
  });
  const tempDir = await createTmpDir();
  return await translateResourcePriv(gpClient, langs, tempDir);
}

// tslint:disable-next-line:no-any
function _translateResourceWithCallback(cb: (err?: any) => void) {
  const promise = _translateResource();
  promise
    .then(() => {
      cb();
    })
    .catch(err => {
      cb(err);
    });
}

function reduceMsgFiles(intlDir: string, tempDir: string) {
  const langDirs = fs.readdirSync(tempDir);
  if (!langDirs) return;
  // console.log('======= langDirs:', langDirs);
  langDirs.forEach(function(lang) {
    if (!helper.isSupportedLanguage(lang)) return;
    const tempLangDir = path.join(tempDir, lang);
    const tempMsgFiles = fs.readdirSync(tempLangDir);
    const jsonData: AnyObject = {};
    tempMsgFiles.forEach(function(tempMsgFile) {
      if (helper.getTrailerAfterDot(tempMsgFile) !== 'json') return;
      const matched = tempMsgFile.match(/^(.+)_[0-9]*\.json$/);
      if (!matched) return;
      const base = matched[1];
      if (!(base in jsonData)) jsonData[base] = {};
      _.merge(jsonData[base], require(path.join(tempLangDir, tempMsgFile)));
    });
    const bases = Object.keys(jsonData);
    bases.forEach(function(base) {
      fs.writeFileSync(
        path.join(intlDir, lang, base) + '.json',
        JSON.stringify(helper.sortMsges(jsonData[base]), null, 2)
      );
    });
  });
}

async function translateResourcePriv(
  gpClient: AnyObject,
  langs: string[],
  tempDir: string
) {
  const packageName = helper.getPackageName();
  if (!packageName) throw new Error('Package.json not found.');
  if (!helper.initIntlDirs())
    throw new Error('English resource does not exist.');
  const malformed = lint.lintMessageFiles(true);
  if (malformed) {
    throw new Error('English resource is malformed.');
  }
  const enDirPath = helper.intlDir('en');
  const msgFiles = fs.readdirSync(enDirPath);
  let msgCount = 0;
  let wordCount = 0;
  let characterCount = 0;
  for (const msgFile of msgFiles) {
    const trailer = helper.getTrailerAfterDot(msgFile);
    if (trailer !== 'json' && trailer !== 'txt') {
      continue;
    }
    const source = helper.readToJson(enDirPath, msgFile, 'en');
    if (source) {
      const srcKeys = Object.keys(source);
      const unit = MY_TRANSLATION_UNIT;
      const useTempDir = srcKeys.length > unit;
      let unitIx = 0;
      const outputDir = useTempDir ? tempDir : INTL_DIR;
      while (unit * unitIx < srcKeys.length) {
        let unitStr = unitIx.toString();
        while (unitStr.length < 6) {
          unitStr = '0' + unitStr;
        }
        const msgFileX = useTempDir
          ? msgFile.replace('.json', '_' + unitStr + '.json')
          : msgFile;
        const sourceX: AnyObject = {};
        const startIx = unit * unitIx;
        const endIx = Math.min(startIx + unit, srcKeys.length);
        for (let ix = startIx; ix < endIx; ix++) {
          const key = srcKeys[ix];
          sourceX[key] = source[key];
        }
        try {
          await translate(
            gpClient,
            sourceX,
            INTL_DIR,
            outputDir,
            langs,
            msgFileX
          );
          for (const key in sourceX) {
            msgCount++;
            wordCount += wc(sourceX[key]);
            characterCount += sourceX[key].length;
          }
        } catch (err) {
          console.log('*** translation failed: %s', msgFileX);
          langs.forEach(function(lang) {
            lang = reverseAdjustLangFromGPB(lang);
            const msgFilePath = path.join(tempDir, lang, msgFileX);
            try {
              fs.unlinkSync(msgFilePath);
              console.log(
                '*** removed the residual file: %s%s%s',
                lang,
                path.sep,
                msgFileX
              );
            } catch (e) {}
          });
        }
        unitIx++;
      }
    }
  }

  console.log(
    '--- translated',
    msgCount,
    'messages,',
    wordCount,
    'words,',
    characterCount,
    'characters'
  );
  storeMsg();

  reduceMsgFiles(INTL_DIR, tempDir);
  lint.lintMessageFiles(false);
}

async function translate(
  gpClient: AnyObject,
  source: object,
  intlDir: string,
  outputDir: string,
  targetLangs: string[],
  msgFile: string
) {
  const sourceCount = Object.keys(source).length;
  const bundleName = helper.getPackageName() + '_' + msgFile;
  const myBundle = gpClient.bundle(bundleName);
  console.log('--- translating %s', bundleName);
  debug('*** 1 *** GPB.create');
  try {
    const create = promisify(myBundle.create.bind(myBundle) as Function);
    await create({
      sourceLanguage: 'en',
      targetLanguages: targetLangs,
    });
  } catch (err) {
    if (
      err.obj &&
      err.obj.message &&
      err.obj.message.indexOf('DuplicatedResourceException') >= 0
    ) {
      err = null;
      // If it exists, ignore error and use it.
    } else {
      console.error('*** GPB.create error: %j', err);
    }
    if (err) throw err;
  }

  debug('*** 2 *** GPB.uploadStrings');
  writeAllToMsg('en', source);
  try {
    await myBundle.uploadStrings({
      languageId: 'en',
      strings: source,
    });
  } catch (err) {
    if (err) console.error('*** GPB.uploadStrings error: %j', err);
    throw err;
  }

  debug('*** 3 *** GPB.getStrings');

  function writeToTxt(jsonObj: AnyObject, targetLang: string) {
    const keys = Object.keys(jsonObj);
    keys.forEach(function(key) {
      if (helper.getTrailerAfterDot(key) === 'txt') {
        let content = JSON.stringify(jsonObj[key]).slice(1, -1);
        delete jsonObj[key];
        content = content.replace(/\\.?/g, function(esc) {
          if (esc === '\\n') return os.EOL;
          if (esc === '\\t') return '\x09';
          if (esc === '\\"') return '"';
          if (esc === "\\'") return "'";
          return esc;
        });
        // fs.writeFileSync(path.join(intlDir, targetLang, key), content);
        fs.writeFileSync(path.join(intlDir, targetLang, msgFile), content);
      }
    });
  }

  function storeTranslatedStrings(targetLang: string, result: AnyObject) {
    const translatedJson = result;
    targetLang = reverseAdjustLangFromGPB(targetLang);
    // writeAllToMsg(targetLang, translatedJson);
    writeToTxt(translatedJson, targetLang);
    if (Object.keys(translatedJson).length > 0) {
      const targetLandPath = path.join(outputDir, targetLang);
      mkdirp.sync(targetLandPath);
      fs.writeFileSync(
        path.join(targetLandPath, msgFile),
        JSON.stringify(helper.sortMsges(translatedJson), null, 2) + '\n'
      );
    }
    console.log('--- translated to %s', targetLang);
  }

  async function sleep(ms: number) {
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), ms);
    });
  }

  for (const lang of targetLangs) {
    const intervalMsec = 500;
    const maxTry = 10;
    let tryCount = 0;
    const opts = {
      languageId: lang,
      resourceKey: Object.keys(source)[0], // used for getEntryInfo
    };

    let data;
    let retry = true;
    while (retry) {
      try {
        data = await myBundle.getStrings(opts);
      } catch (err) {
        if (
          err.obj &&
          err.obj.message &&
          /Language [^ ]+ does not exist./.test(err.obj.message)
        ) {
          console.error('*** GPB.getStrings error: %j', err.obj.message);
          retry = false;
        } else {
          if (++tryCount >= maxTry) {
            console.error('*** translation to %s failed and skipped.', lang);
            retry = false;
          } else {
            process.stdout.write('.');
            await sleep(intervalMsec);
            // retry
          }
        }
        continue;
      }

      const resultCount = Object.keys(data.resourceStrings).length;
      if (resultCount === sourceCount) {
        storeTranslatedStrings(lang, data.resourceStrings);
        break;
      }
      try {
        data = await myBundle.getEntryInfo(opts);
        if (data && data.resourceEntry.translationStatus === 'FAILED') {
          // ['SOURCE_LANGUAGE', 'TRALSLATED', 'IN_PROGRESS', 'FAILED']
          console.error(
            '*** translation to %s was incomplete.\n' +
              'Try to delete the bundle %s from the GPB dashboard and ' +
              '"slt-translate -t" again.',
            lang,
            bundleName
          );
        }
      } catch (err) {
        if (++tryCount >= maxTry) {
          console.error('*** GPB.getEntryInfo error: %j', err);
          retry = false;
        } else {
          process.stdout.write('.');
          await sleep(intervalMsec);
        }
        continue;
      }
    }
  }
}
