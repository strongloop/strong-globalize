// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var _ = require('lodash');
var assert = require('assert');
var fs = require('fs');
var md5 = require('md5');
var mkdirp = require('mkdirp');
var path = require('path');

exports.cloneEnglishTxtSyncDeep = cloneEnglishTxtSyncDeep;
exports.directoryDepth = directoryDepth;
exports.enumerateFilesSync = enumerateFilesSync;
exports.enumerateLanguageSync = enumerateLanguageSync;
exports.enumerateMsgSync = enumerateMsgSync;
exports.getPackageName = getPackageName;
exports.getPackageVersion = getPackageVersion;
exports.getRootDir = getRootDir;
exports.getSupportedLanguages = getSupportedLanguages;
exports.getTrailerAfterDot = getTrailerAfterDot;
exports.hashKeys = hashKeys;
exports.headerIncluded = headerIncluded;
exports.initIntlDirs = initIntlDirs;
exports.initGlobForSltGlobalize = initGlobForSltGlobalize;
exports.intlDir = intlDir;
exports.isLoadMessages = isLoadMessages;
exports.isRootPackage = isRootPackage;
exports.isSupportedLanguage = isSupportedLanguage;
exports.mapArgs = mapArgs;
exports.mapPercent = mapPercent;
exports.maxDirectoryDepth = maxDirectoryDepth;
exports.msgFileIdHash = msgFileIdHash;
exports.normalizeKeyArrays = normalizeKeyArrays;
exports.percent = percent;
exports.readToJson = readToJson;
exports.registerResTag = registerResTag;
exports.repackArgs = repackArgs;
exports.replaceJson = replaceJson;
exports.resTagExists = resTagExists;
exports.scanJson = scanJson;
exports.setRootDir = setRootDir;
exports.sortMsges = sortMsges;
exports.stripBom = stripBom;
exports.validateAmlValue = validateAmlValue;
Object.defineProperty(exports, 'ENGLISH', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'en',
});
Object.defineProperty(exports, 'PSEUDO_LANG', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'zz',
});
Object.defineProperty(exports, 'PSEUDO_TAG', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: '♚♛♜♝♞♟',
});
Object.defineProperty(exports, 'MSG_TAG', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'message',
});
Object.defineProperty(exports, 'HELPTXT_TAG', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'helptxt',
});
Object.defineProperty(exports, 'AML_ALL', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'all',
});
Object.defineProperty(exports, 'AML_NONE', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'none',
});
Object.defineProperty(exports, 'BIG_NUM', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 999999999999,
});
Object.defineProperty(exports, 'MSG_GPB_UNAVAILABLE', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: '*** Login to GPB failed or GPB.supportedTranslations error.',
});
exports.AML_DEFAULT = exports.AML_NONE;
var HASH_KEYS = false;
var KEY_HEADERS = ['msg'];

function hashKeys(path) {
  var trailer = null;
  return !(headerIncluded(path, KEY_HEADERS)
    || (trailer = getTrailerAfterDot(path)) === 'txt'
    || trailer === 'json'
    || trailer === 'yml'
    || trailer === 'yaml'
    || path.indexOf(exports.PSEUDO_TAG) === 0);
}
/**
 * Supported languages in CLDR notation
 */
var TARGET_LANGS = null;
var MY_ROOT = process.cwd();
var INTL_DIR = path.join(MY_ROOT, 'intl');

/**
 * @param {string} Override the root directory path
 */
function setRootDir(rootPath) {
  var validPath = true;
  try {
    var rootStats = fs.statSync(rootPath);
  } catch (e) {
    validPath = false;
  }
  assert(validPath, '*** setRootDir: Root path invalid: ' + rootPath);
  if (!rootStats.isDirectory()) validPath = false;
  assert(validPath,
    '*** setRootDir: Root path is not a directory: ' + rootPath.toString());
  var files = null;
  try {
    files = fs.readdirSync(rootPath);
  } catch (e) {
    validPath = false;
  }
  validPath = (validPath && !!files);
  if (validPath) {
    var intlDirFound = false;
    files.forEach(function(item) {
      if (intlDirFound) return;
      if (item === 'intl') intlDirFound = true;
    });
    validPath = intlDirFound;
  }
  assert(validPath,
    '*** setRootDir: Intl dir not found under: ' + rootPath.toString());
  MY_ROOT = rootPath;
  INTL_DIR = path.join(MY_ROOT, 'intl');
}

function getRootDir() {
  return MY_ROOT;
}

function isRootPackage() {
  if (!global.STRONGLOOP_GLB) return false;
  return MY_ROOT === global.STRONGLOOP_GLB.MASTER_ROOT_DIR;
}

function initGlobForSltGlobalize(rootDir) {
  if (global.STRONGLOOP_GLB) return;
  global.STRONGLOOP_GLB = {
    MASTER_ROOT_DIR: rootDir || getRootDir(),
    MSG_RES_LOADED: [],
  };
}

function isLoadMessages(rootDir) {
  if (!global.STRONGLOOP_GLB) return false;
  if (path.resolve(rootDir) ===
      path.resolve(global.STRONGLOOP_GLB.MASTER_ROOT_DIR)) return true;
  if (!global.STRONGLOOP_GLB.AUTO_MSG_LOADING) return false;
  if (global.STRONGLOOP_GLB.AUTO_MSG_LOADING === exports.AML_NONE) return false;
  if (global.STRONGLOOP_GLB.AUTO_MSG_LOADING === exports.AML_ALL) return true;
  var packagesToLoad = global.STRONGLOOP_GLB.AUTO_MSG_LOADING;
  var packageName = exports.getPackageName(rootDir);
  var load = packagesToLoad.indexOf(packageName) >= 0;
  return load;
}

function validateAmlValue(aml) {
  if (aml === exports.AML_ALL || aml === exports.AML_NONE) return aml;
  if (Array.isArray(aml)) {
    if (aml.length === 0) return false;
    aml.forEach(function(v) {
      if (typeof aml !== 'string') return false;
    });
    return aml;
  }
  return false;
}

function msgFileIdHash(fileName, rootDir) {
  assert(fileName);
  rootDir = rootDir || getRootDir();
  var packageName = getPackageName(rootDir);
  var packageVersion = getPackageVersion(rootDir);
  var msgFileId = fileName + packageName + packageVersion;
  return md5(msgFileId);
}

function registerResTag(fileIdHash, fileName, lang, tagType) {
  assert(global.STRONGLOOP_GLB);
  assert(fileIdHash);
  assert(fileName);
  assert(lang);
  assert(tagType);
  if (resTagExists(fileIdHash, fileName, lang, tagType))
    return false;
  var resTag = {
    fileIdHash: fileIdHash,
    fileName: fileName,
    lang: lang,
    tagType: tagType,
  };
  global.STRONGLOOP_GLB.MSG_RES_LOADED.push(resTag);
  return true;
}

function resTagExists(fileIdHash, fileName, lang, tagType) {
  assert(global.STRONGLOOP_GLB);
  assert(fileIdHash);
  assert(fileName);
  assert(lang);
  assert(tagType);
  var resTag = {
    fileIdHash: fileIdHash,
    lang: lang,
    tagType: tagType,
  };
  var exists =
    (_.find(global.STRONGLOOP_GLB.MSG_RES_LOADED, resTag) !== undefined);
  return exists;
}

function stripBom(str) {
  return str.charCodeAt(0) === 0xFEFF ? str.slice(1) : str;
}

/**
 * Enumerate all JS files in this application
 * @param {Function}
 *   param.content is a UTF8 string of each JS source file.
 */
var showDotCount = 500;
var showCountCount = 10000;
var enumeratedFilesCount = 0;
function enumerateFilesSync(
  rootDir, blackList, targetFileType, verbose, checkNodeModules, callback) {
  enumeratedFilesCount = 0;
  scannedFileNameHash = [];
  return enumerateFilesSyncPriv(rootDir, rootDir, blackList, targetFileType,
    verbose, checkNodeModules, callback);
}

var scannedFileNameHash = null;
function alreadyScanned(fileName) {
  var realFileName = process.browser ? fileName : fs.realpathSync(fileName);
  var fileNameHash = md5(realFileName);
  if (scannedFileNameHash.indexOf(fileNameHash) >= 0) {
    return true;
  } else {
    scannedFileNameHash.push(fileNameHash);
    return false;
  }
}

function enumerateFilesSyncPriv(
  currentPath, rootDir, blackList, targetFileType, verbose,
  checkNodeModules, callback) {
  if (!currentPath) currentPath = MY_ROOT;
  if (!rootDir) rootDir = MY_ROOT;
  currentPath = path.resolve(currentPath);
  if (alreadyScanned(currentPath)) return;
  rootDir = path.resolve(rootDir);
  blackList = Array.isArray(blackList) ? blackList : [];
  if (!Array.isArray(targetFileType)) targetFileType = [targetFileType];
  var skipDir = false;
  blackList.forEach(function(part) {
    if (typeof part !== 'string') return;
    if (currentPath.indexOf(part) >= 0) skipDir = true;
  });
  if (skipDir) {
    if (verbose) console.log('***  skipping directory:', currentPath);
    return;
  }
  var files = null;
  try {
    files = fs.readdirSync(currentPath);
  } catch (e) {
    return;
  }
  files.forEach(function(item) {
    if (item.indexOf('.') === 0) return;
    var child = path.join(currentPath, item);
    var stats = null;
    try {
      stats = fs.statSync(child);
    } catch (e) {
      return;
    }
    if (stats.isDirectory()) {
      item = item.toLowerCase();
      if (item === 'test' || item === 'node_modules' ||
        item === 'coverage') return;
      enumerateFilesSyncPriv(child, rootDir, blackList, targetFileType,
        verbose, checkNodeModules, callback);
    } else {
      var fileType = getTrailerAfterDot(item);
      if (targetFileType.indexOf(fileType) < 0) return;
      var content = stripBom(fs.readFileSync(child, 'utf8'));
      if (verbose) console.log('~~~ examining file:', child);
      if (checkNodeModules) {
        enumeratedFilesCount++;
        if (enumeratedFilesCount % showDotCount === 0) {
          process.stdout.write('.');
          if (enumeratedFilesCount % showCountCount === 0) {
            process.stdout.write(' ' + enumeratedFilesCount.toString() + '\n');
          }
        }
      }
      callback(content, child);
    };
  });
  if (checkNodeModules) {
    var depthRoot = directoryDepth(rootDir);
    var moduleRootPaths = resolveDependencies(currentPath, rootDir);
    if (moduleRootPaths) {
      moduleRootPaths.forEach(function(modulePath) {
        var depthModule = directoryDepth(modulePath);
        if ((depthModule - depthRoot) > maxDirectoryDepth()) return;
        enumerateFilesSyncPriv(modulePath, rootDir, blackList, targetFileType,
          verbose, checkNodeModules, callback);
      });
    }
  }
}

/**
 * @param {Function}
 *   If callback returns stop === true, stop enumeration.
 */
function enumerateLanguageSync(callback) {
  if (!TARGET_LANGS) TARGET_LANGS = getSupportedLanguages();
  TARGET_LANGS.forEach(function(lang) {
    var stopEnumeration = callback(lang);
    if (stopEnumeration) return;
  });
}

/**
 * @param {string} lang Supported languages in CLDR notation
 * @param {Function}
 *   If callback returns err; if err, stop enumeration.
 */
function cloneEnglishTxtSyncDeep(rootDir) {
  if (!rootDir) rootDir = MY_ROOT;
  var enDirPath = path.join(rootDir, 'intl', exports.ENGLISH);
  mkdirp.sync(enDirPath);
  return enumerateMsgSyncPriv(rootDir, rootDir, exports.ENGLISH, true,
    true, 0, function() {});
}

function enumerateMsgSync(rootDir, lang, checkNodeModules, callback) {
  return enumerateMsgSyncPriv(rootDir, rootDir, lang, checkNodeModules,
    false, 0, callback);
}

function enumerateMsgSyncPriv(currentPath, rootDir, lang, checkNodeModules,
    cloneEnglishTxt, clonedTxtCount, callback) {
  assert(currentPath);
  assert(rootDir);
  assert(typeof callback === 'function');
  var intlDir = path.join(currentPath, 'intl');
  var langDirPath = path.join(intlDir, lang);
  var msgFiles = null;
  try {
    msgFiles = fs.readdirSync(langDirPath);
  } catch (e) {
    return clonedTxtCount;
  }
  var enDirPath = path.join(rootDir, 'intl', exports.ENGLISH);
  var clonedFileNames = [];
  msgFiles.forEach(function(msgFile) {
    if (msgFile.indexOf('.') === 0) return;
    var stats = fs.lstatSync(path.join(langDirPath, msgFile));
    if (!stats.isFile()) return;
    // commented out to avoid interference with intercept-stdout in test
    // debug('enumerating...', path.join(langDirPath, msgFile));
    if (cloneEnglishTxt && (lang === exports.ENGLISH)) {
      if (currentPath === rootDir) return;
      if (getTrailerAfterDot(msgFile) !== 'txt') return;
      var sourceTxtFilePath = path.join(langDirPath, msgFile);
      var filePathHash = msgFileIdHash(msgFile, currentPath);
      if (resTagExists(filePathHash, msgFile,
        lang, exports.HELPTXT_TAG)) return;
      registerResTag(filePathHash, msgFile, lang, exports.HELPTXT_TAG);
      var targetTxtFilePath = path.join(enDirPath, msgFile);
      clonedFileNames.push(msgFile);
      fs.writeFileSync(
        targetTxtFilePath,
        fs.readFileSync(sourceTxtFilePath));
      clonedTxtCount++;
      console.log('--- cloned', sourceTxtFilePath);
    } else {
      var jsonObj = readToJson(langDirPath, msgFile, lang);
      if (jsonObj) {
        callback(jsonObj, path.join(langDirPath, msgFile));
      }
    }
  });
  if (cloneEnglishTxt && (lang === exports.ENGLISH) &&
      clonedFileNames.length > 0) {
    removeObsoleteFile(enDirPath, clonedFileNames);
  }
  if (checkNodeModules) {
    var depthRoot = directoryDepth(rootDir);
    var moduleRootPaths = resolveDependencies(currentPath, rootDir);
    if (moduleRootPaths) {
      moduleRootPaths.forEach(function(modulePath) {
        var depthModule = directoryDepth(modulePath);
        if ((depthModule - depthRoot) > maxDirectoryDepth()) return;
        clonedTxtCount = enumerateMsgSyncPriv(modulePath, rootDir, lang, false,
          cloneEnglishTxt, clonedTxtCount, callback);
      });
    }
  }
  return clonedTxtCount;
}

function removeObsoleteFile(dir, fileNames) {
  var files = fs.readdirSync(dir);
  files.forEach(function(file) {
    var matched = file.match(/^([0-9a-f]{32})_(.*\.txt)$/);
    if (!matched) return;
    if (fileNames.indexOf(matched[2]) >= 0) {
      console.log('--- removed', path.join(dir, file));
      fs.unlinkSync(path.join(dir, file));
    }
  });
}

function directoryDepth(fullPath) {
  assert(typeof fullPath === 'string');
  return _.compact(fullPath.split(path.sep)).length;
}

function maxDirectoryDepth() {
  var depth = parseInt(process.env.STRONGLOOP_GLOBALIZE_MAX_DEPTH, 10);
  if (isNaN(depth)) depth = exports.BIG_NUM;
  depth = Math.max(1, depth);
  return depth;
}

function requireResolve(depName, currentDir, rootDir) {
  // simulates npm v3 dependency resolution
  var depPath = null;
  var stats = null;
  try {
    depPath = path.join(currentDir, 'node_modules', depName);
    stats = fs.lstatSync(depPath);
  } catch (e) {
    stats = null;
    try {
      depPath = path.join(rootDir, 'node_modules', depName);
      stats = fs.lstatSync(depPath);
    } catch (e) {
      return null;
    }
  }
  if (!stats) return null;
  return unsymbolLink(depPath);
}

function unsymbolLink(path) {
  if (!path) return null;
  var stats = null;
  try {
    stats = fs.lstatSync(path);
  } catch (e) {
    return null;
  }
  if (!stats) return null;
  if (stats.isSymbolicLink()) {
    var realPath = null;
    try {
      realPath = process.browser ? path : fs.realpathSync(path);
    } catch (e) {
      return null;
    }
    return unsymbolLink(realPath);
  } else {
    return stats.isDirectory() ? path : null;
  }
}

function resolveDependencies(currentDir, rootDir, moduleRootPaths) {
  moduleRootPaths = moduleRootPaths || [];
  var packageJson = path.join(currentDir, 'package.json');
  var deps = null;
  try {
    deps = require(packageJson).dependencies;
  } catch (e) {
    return null;
  }
  if (deps === undefined || !deps) return null;
  deps = Object.keys(deps);
  if (deps.length === 0) return null;
  deps.forEach(function(dep) {
    var depPath = requireResolve(dep, currentDir, rootDir);
    if (depPath && moduleRootPaths.indexOf(depPath) < 0) {
      moduleRootPaths.push(depPath);
      resolveDependencies(depPath, rootDir, moduleRootPaths);
    }
  });
  moduleRootPaths = _.uniq(_.compact(moduleRootPaths));
  return moduleRootPaths;
}

/**
 * Read a txt or json file and convert to JSON
 */
var acceptableTrailers = ['json', 'txt'];

function readToJson(langDirPath, msgFile, lang) {
  var fileType = getTrailerAfterDot(msgFile);
  if (acceptableTrailers.indexOf(fileType) < 0) return null;
  var jsonObj = null;
  var sourceFilePath = path.join(langDirPath, msgFile);
  if (fileType === 'json') {
    jsonObj = JSON.parse(
      stripBom(fs.readFileSync(sourceFilePath, 'utf-8')));
  } else { // txt
    var origStr = stripBom(fs.readFileSync(sourceFilePath, 'utf8'));
    jsonObj = {};
    var re = /^([0-9a-f]{32})_(.*)\.txt/;
    var results = re.exec(msgFile);
    msgFile = (results && results.length === 3) ?  // deep-extracted txt file ?
      results[2] + '.txt' : msgFile;
    jsonObj[msgFile] = mapPercent(JSON.parse(JSON.stringify(origStr)));
  }
  if (fileType === 'json' && HASH_KEYS && lang === exports.ENGLISH) {
    var keys = Object.keys(jsonObj);
    keys.forEach(function(key) {
      var newKey = md5(key);
      jsonObj[newKey] = jsonObj[key];
      delete jsonObj[key];
    });
  }
  return jsonObj;
}

function normalizeKeyArrays(keyArrays) {
  // keep 0 as "0"
  if (keyArrays === null) return [];
  if (typeof keyArrays === 'string' && keyArrays.length === 0) return [];
  if (!Array.isArray(keyArrays)) return [[keyArrays.toString()]];
  var retKeyArrays = [];
  keyArrays.forEach(function(keyArray) {
    if (keyArray === null) return;
    if (typeof keyArray === 'string' && keyArray.length === 0) return;
    if (!Array.isArray(keyArray)) {
      retKeyArrays.push([keyArray.toString()]);
      return;
    }
    var retKeyArray = [];
    keyArray.forEach(function(key) {
      if (key === null) return;
      if (typeof key === 'string' && key.length === 0) return;
      assert(typeof key === 'string' || typeof key === 'number',
        'type of key must be a string or a number.');
      retKeyArray.push(key.toString());
    });
    if (retKeyArray.length > 0) retKeyArrays.push(retKeyArray);
  });
  return retKeyArrays;
}

function scanJson(keys, data, returnErrors) {
  return scanJsonPriv(keys, data, null, returnErrors);
}

function replaceJson(keys, data, newValues) {
  return scanJsonPriv(keys, data, newValues, false);
}

function scanJsonPriv(keys, data, newValues, returnErrors) {
  if (!data || typeof data !== 'object') return [];
  if (newValues) assert(keys.length === newValues.length);
  keys = normalizeKeyArrays(keys);
  var ret = [];
  keys.forEach(function(k, kix) {
    var d = null;
    var err = null;
    var prevObj = null;
    var prevKey = null;
    try {
      for (var ix = 0; ix < k.length; ix++) {
        if (ix === 0) d = this;
        if (typeof d === 'string') {
          err = '*** unexpected string value ' + JSON.stringify(k);
          if (returnErrors) ret.push(err);
          else console.log(err);
          return;
        }
        prevObj = d;
        prevKey = k[ix];
        d = d[k[ix]];
      };
      if (typeof d === 'string') {
        if (newValues) prevObj[prevKey] = newValues[kix];
        else ret.push(d);
      } else {
        err = '*** not a string value ' + JSON.stringify(k);
        if (returnErrors) ret.push(err);
        else console.log(err);
      }
    } catch (e) {
      err = '*** ' + e.toString() + ' ' + JSON.stringify(k);
      if (returnErrors) ret.push(err);
      else console.log(err);
    }
  }.bind(data));
  return (newValues ? data : ret);
}

function sortMsges(msges) {
  var keys = Object.keys(msges);
  var msgKeys = _.remove(keys, function(key) {
    return KEY_HEADERS.some(function(header) {
      return key.indexOf(header) === 0;
    });
  });
  var sorted = {};
  keys.sort().forEach(function(key) {
    sorted[key] = msges[key];
  });
  msgKeys.sort().forEach(function(key) {
    sorted[key] = msges[key];
  });
  return sorted;
}

/**
 * Initialize intl directory structure for non-En languages
 * intl/en must exist.
 * it returns false if failed.
 */
function initIntlDirs() {
  try {
    var intlEnStats = fs.statSync(path.join(INTL_DIR, exports.ENGLISH));
  } catch (e) {
    return false;
  }
  if (!intlEnStats.isDirectory()) return false;
  if (!TARGET_LANGS) TARGET_LANGS = getSupportedLanguages();
  TARGET_LANGS.forEach(function(lang) {
    mkdirp.sync(path.join(INTL_DIR, lang));
  });
  return true;
}

/**
 * @param {string} lang Supported languages in CLDR notation
 * Returns true for 'en' and supported languages
 * in CLDR notation.
 */
function isSupportedLanguage(lang) {
  if (!TARGET_LANGS) TARGET_LANGS = getSupportedLanguages();
  return (TARGET_LANGS.indexOf(lang) >= 0);
}

/**
 * Returns an array of locales supported by the local cldr data.
 */
function getSupportedLanguages() {
  var cldrDir = path.join(__dirname, '..', 'cldr');
  var langs = [];
  enumerateFilesSync(cldrDir, null, ['json'], false, false,
    function(content, filePath) {
      var cldr = null;
      try {
        cldr = JSON.parse(content);
      } catch (e) {
        throw new Error('*** CLDR read error on ' + process.platform);
      }
      var theseLangs = Object.keys(cldr.main || {});
      langs = _.concat(langs, theseLangs);
    });
  return _.uniq(langs);
}

/**
 * Returns trailer of file name.
 */
function getTrailerAfterDot(name) {
  if (typeof name !== 'string') return null;
  var parts = name.split('.');
  if (parts.length < 2) return null;
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Returns package name defined in package.json.
 */
function getPackageName(root) {
  return getPackageItem(root, 'name');
}

function getPackageVersion(root) {
  return getPackageItem(root, 'version');
}

function getPackageItem(root, itemName) {
  root = root || MY_ROOT;
  var item = null;
  try {
    item = require(path.join(root, 'package.json'))[itemName];
  } catch (e) {}
  return item;
}

/**
 * @param {string} name to be checked
 * @param {Array} headersAllowed a list of strings to check
 * Returns directory path for the language.
 */
function headerIncluded(name, headersAllowed) {
  var matched = false;
  if (Array.isArray(headersAllowed)) {
    headersAllowed.forEach(function(header) {
      if (matched) return;
      matched = (name.indexOf(header) === 0);
    });
  } else if (typeof headersAllowed === 'string') {
    matched = (name.indexOf(headersAllowed) === 0);
  }
  return matched;
}

/**
 * @param {string} lang Supported languages in CLDR notation
 * Returns directory path for the language.
 */
function intlDir(lang) {
  lang = lang || exports.ENGLISH;
  return path.join(INTL_DIR, lang);
}

/**
 * %s is included in the string
 */
function percent(msg) {
  return /\%[sdj\%]/.test(msg);
}

/**
 * %replace %s with {N} where N=0,1,2,...
 */
function mapPercent(msg) {
  var ix = 0;
  var output = msg.replace(/\%[sdj\%]/g, function(match) {
    if (match === '%%') return '';
    var str = '{' + ix.toString() + '}';
    ix++;
    return str;
  });
  return output;
}

function mapArgs(path, args) {
  var ix = 1;
  var output = [];
  path.replace(/\%[sdj\%]/g, function(match) {
    if (match === '%%') return;
    var arg = args[ix++];
    if (arg === undefined) arg = 'undefined';
    if (arg === null) arg = 'null';
    output.push((match === '%j') ?
      JSON.stringify(arg) : arg.toString());
  });
  return output;
}

function repackArgs(args, initIx) {
  var argsLength = Array.isArray(args) ?
      args.length : Object.keys(args).length;
  if (initIx >= argsLength) return [];
  var output = [];
  for (var ix = initIx; ix < argsLength; ix++) {
    output.push(args[ix]);
  }
  return output;
}

/**
 * To be deprecated
 */
exports.myIntlDir = myIntlDir;

function myIntlDir() {
  return INTL_DIR;
}
