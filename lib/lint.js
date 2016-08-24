// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var assert = require('assert');
var helper = require('./helper');
var wc = require('word-count');

exports.lintMessageFiles = lintMessageFiles;

var MAX_KEY_LENGTH = 256;
// max number of alphanumeric characters
var MAX_VALUE_LENGTH = 8192;
// max number of characters in an English message
var CHECK_NAME_HEAD = false;
var PLACEHOLDER_NAMES_ALLOWED = ['ph'];
// recommended placeholder name headers

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
function lintMessageFiles(enOnly, callback) {
  var packageName = helper.getPackageName();
  var traitEnglish = null;

  function extractTrait(lang) {
    var trait = {
      bundleName: packageName + ' ' + lang,
      nFiles: 0,
      malformed: false,
      msgs: {},
      dupKeys: [],
      phLeftOrphans: [],
      phRightOrphans: [],
    };
    var msgCount = 0;
    var wordCount = 0;
    var characterCount = 0;
    var rootDir = helper.getRootDir();
    helper.enumerateMsgSync(rootDir,
      lang, false, function(jsonObj, msgFilePath) {
        var jsonObjKeys = Object.keys(jsonObj);
        trait.nFiles++;
        jsonObjKeys.forEach(function(key) {
          if (key in trait.msgs) {
            trait.dupKeys.push(key);
            return;
          }
          trait.msgs[key] = {};
          var trt = trait.msgs[key];
          var msg = jsonObj[key];
          trt.length = null;
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
            var trimedMsg = msg.trim().replace(/{{/g, '').replace(/}}/g, '');
            var phs = trimedMsg.match(/{[0-9a-zA-Z]+?}/g);
            if (phs) phs.forEach(function(ph) {
              var phKey = ph.slice(1, -1);
              trimedMsg = trimedMsg.replace(ph, phKey);
              trt.phKeys.push(phKey);
            });
            trt.phLeftOrphans = trimedMsg.match(/{[0-9a-zA-Z]+?[^0-9a-zA-Z}]/g);
            trt.phRightOrphans = trimedMsg.match(
              /[^{0-9a-zA-Z][0-9a-zA-Z]+?}/g);
          }
        });
      });
    if (lang === helper.ENGLISH)
      console.log('--- linted', msgCount, 'messages,',
        wordCount, 'words,', characterCount, 'characters');
    return trait;
  }

  function isNameAllowed(name, namesAllowed) {
    if (!(/^[a-z][0-9a-zA-Z]*$/.test(name)) &&
      !(/^[0-9]+$/.test(name))) return false;
    if (!CHECK_NAME_HEAD) return true;
    return helper.headerIncluded(name, namesAllowed);
  }

  function checkTrait(trait) {
    var verified = true;
    var plural = false;
    if (trait.nFiles === 0) {
      console.error('***', trait.bundleName,
        'has no message files.');
      return false;
    }
    if (trait.dupKeys.length > 0) {
      plural = trait.dupKeys.length > 1;
      console.error('***', trait.bundleName,
        'has' + (plural ? ' ' : ' an ') +
        'duplicate message key' + (plural ? 's:' : ':'));
      trait.dupKeys.forEach(function(dupKey) {
        console.error('***   ' + dupKey);
      });
      verified = false;
    }
    var keys = Object.keys(trait.msgs);
    keys.forEach(function(key, ix) {
      var msg = trait.msgs[key];
      if (key.length > MAX_KEY_LENGTH) {
        console.error('***', trait.bundleName + ':' + key,
          'name is longer than', MAX_KEY_LENGTH);
        verified = false;
      }
      if (msg.length > MAX_VALUE_LENGTH) {
        console.error('***', trait.bundleName + ':' + key,
          'message is longer than', MAX_VALUE_LENGTH);
        verified = false;
      }
      if (msg.cDoubleLeftBraces !== msg.cDoubleRightBraces ||
          msg.cDoubleLeftBraces !== msg.cHardCoded) {
        console.error('***', trait.bundleName + ':' + key,
          'has malformed double curly braces.');
        verified = false;
      }
      if (msg.phKeys.length > 0) {
        msg.phKeys.forEach(function(phKey) {
          if (!isNameAllowed(phKey, PLACEHOLDER_NAMES_ALLOWED)) {
            console.error('***', trait.bundleName + ':' + key,
              'has an odd placeholder key: ' + phKey);
            verified = false;
          }
        });
      }
      if (msg.phLeftOrphans && msg.phLeftOrphans.length > 0) {
        plural = msg.phLeftOrphans.length > 1;
        console.error('***', trait.bundleName + ':' + key,
          'seems to have ' + (plural ? '' : 'an ') +
          'left orphan placeholder' + (plural ? 's:' : ':'));
        msg.phLeftOrphans.forEach(function(phKey) {
          console.error('***   ' + phKey);
        });
        verified = false;
      }
      if (msg.phRightOrphans && msg.phRightOrphans.length > 0) {
        plural = msg.phRightOrphans.length > 1;
        console.error('***', trait.bundleName + ':' + key,
          'seems to have ' + (plural ? '' : 'an ') +
          'right orphan placeholder' + (plural ? 's:' : ':'));
        msg.phRightOrphans.forEach(function(phKey) {
          console.error('***   ' + phKey);
        });
        verified = false;
      }
    });
    trait.malformed = !verified;
    return verified;
  }

  function isCompatibleWithEnglish(lang, trait) {
    assert(traitEnglish);
    var verified = true;
    if (traitEnglish.malformed) return false;
    if (trait.nFiles !== traitEnglish.nFiles) {
      console.error('***', trait.bundleName,
        'incompatible w/En : message file count.');
      verified = false;
    }
    var keys = Object.keys(trait.msgs);
    keys.forEach(function(key) {
      var enMsg = traitEnglish.msgs[key];
      if (!enMsg) {
        console.error('***', trait.bundleName,
          '****** incompatible w/En no such key:', key);
        verified = false;
        return;
      }
      var msg = trait.msgs[key];
      if (msg.length === 0) {
        console.error('***', trait.bundleName,
          '****** empty translation:', key);
        verified = false;
      }
      if (msg.cHardCoded !== enMsg.cHardCoded) {
        console.error('***', trait.bundleName,
          'incompatible w/En double curly braces:', key);
        verified = false;
      }
      if (msg.phKeys.length !== enMsg.phKeys.length) {
        console.error('***', trait.bundleName,
          'incompatible w/En placeholders:', key);
        verified = false;
      } else {
        enMsg.phKeys.forEach(function(phKey) {
          if (msg.phKeys.indexOf(phKey) < 0) {
            console.error('***', trait.bundleName,
              'incompatible w/En placeholder:', phKey, 'is missing.');
            verified = false;
          }
        });
      }
    });
    return verified;
  }

  function verifyLanguage(lang) {
    assert(helper.isSupportedLanguage(lang));
    console.log('--- linting ' + packageName + ' ' + lang);
    var trait = extractTrait(lang);
    var verified = checkTrait(trait);
    if (lang !== helper.ENGLISH) {
      verified = verified && isCompatibleWithEnglish(lang, trait);
    }
    trait.malformed = trait.malformed || !verified;
    // console.log('*****************', JSON.stringify(trait, null, 4));
    return trait;
  }

  traitEnglish = verifyLanguage(helper.ENGLISH);
  if (traitEnglish.malformed) {
    console.error('*** English file is malformed.' +
      ' Other languages not checked.');
    if (callback) callback(traitEnglish.malformed);
    return;
  };
  console.log('--- linted', packageName + ' en');
  if (enOnly) {
    if (callback) callback(traitEnglish.malformed);
    return;
  }
  var malformed = false;
  helper.enumerateLanguageSync(function(lang) {
    if (lang === helper.ENGLISH) return;
    var trait = verifyLanguage(lang);
    console.log('--- linted', packageName + ' ' + lang);
    if (trait.malformed) {
    } else {
      malformed = malformed && !trait.malformed;
    };
  });
  if (callback) callback(malformed);
}
