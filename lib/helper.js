'use strict';

var _ = require('lodash');
var assert = require('assert');
var debug = require('debug')('strong-globalize');
var fs = require('fs');
var fsSync = require('fs-sync');
var md5 = require('md5');
var mkdirp = require('mkdirp');
var path = require('path');
// var translate = require('./translate');
var zlib = require('zlib');
try {
  var nodeVersion = process.version.replace(
    /(^v[0-9]+\.[0-9]+)\.[0-9]+$/, '$1');
  if (nodeVersion === 'v0.10') {
    zlib = require('node-zlib-backport');
    debug('Zlib backported on %s', process.version);
  }
} catch (e) {
  debug('Zlib backport failed on %s', process.version);
}

exports.cloneEnglishTxtSyncDeep = cloneEnglishTxtSyncDeep;
exports.directoryDepth = directoryDepth;
exports.enumerateFilesSync = enumerateFilesSync;
exports.enumerateLanguageSync = enumerateLanguageSync;
exports.enumerateMsgSync = enumerateMsgSync;
exports.getBundleName = getBundleName;
exports.getPackageName = getPackageName;
exports.getPackageVersion = getPackageVersion;
exports.getTrailerAfterDot = getTrailerAfterDot;
exports.hashKeys = hashKeys;
exports.headerIncluded = headerIncluded;
exports.initIntlDirs = initIntlDirs;
exports.initGlobForSltGlobalize = initGlobForSltGlobalize;
exports.intlDir = intlDir;
exports.getSupportedLanguages = getSupportedLanguages;
exports.isSupportedLanguage = isSupportedLanguage;
exports.mapArgs = mapArgs;
exports.mapPercent = mapPercent;
exports.percent = percent;
exports.readToJson = readToJson;
exports.repackArgs = repackArgs;
exports.setRootDir = setRootDir;
exports.getRootDir = getRootDir;
exports.registerResTag = registerResTag;
exports.resTagExists = resTagExists;
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

var HASH_KEYS = false;
var KEY_HEADERS = ['msg'];

function hashKeys(path) {
  return !(headerIncluded(path, KEY_HEADERS)
    || getTrailerAfterDot(path) === 'txt'
    || path.indexOf(exports.PSEUDO_TAG) === 0);
}

/**
 * Supported languages in CLDR notation
 */
var TARGET_LANGS = getSupportedLanguages();
debug('Supported Langs: %s', TARGET_LANGS);
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
    '*** setRootDir: Root path invalid: ' + rootPath.toString());
  MY_ROOT = rootPath;
  INTL_DIR = path.join(MY_ROOT, 'intl');
}

function getRootDir() {
  return MY_ROOT;
}

function initGlobForSltGlobalize() {
  if (global.STRONGLOOP_GLB) return;
  global.STRONGLOOP_GLB = {
    ROOT_DIR: getRootDir(),
    MSG_RES_LOADED: [],
    MAX_DEPTH: maxDirectoryDepth(),
  };
}

function registerResTag(filePathHash, fileName, appName,
    appVersion, lang, tagType) {
  assert(global.STRONGLOOP_GLB);
  assert(filePathHash);
  assert(fileName);
  assert(lang);
  assert(tagType);
  assert((appName && appVersion) || (!appName && !appVersion));
  if (resTagExists(filePathHash, fileName, appName, appVersion, lang, tagType))
    return false;
  var resTag = {
    filePathHash: filePathHash,
    fileName: fileName,
    lang: lang,
    tagType: tagType,
  };
  if (appName && appVersion) {
    resTag.appName = appName;
    resTag.appVersion = appVersion;
  }
  global.STRONGLOOP_GLB.MSG_RES_LOADED.push(resTag);
  return true;
}

function resTagExists(filePathHash, fileName, appName,
    appVersion, lang, tagType) {
  assert(global.STRONGLOOP_GLB);
  assert(filePathHash);
  assert(fileName);
  assert(lang);
  assert(tagType);
  assert((appName && appVersion) || (!appName && !appVersion));
  var resTag = {
    filePathHash: filePathHash,
    fileName: fileName,
    lang: lang,
    tagType: tagType,
  };
  var exists =
    (_.find(global.STRONGLOOP_GLB.MSG_RES_LOADED, resTag) !== undefined);
  // console.log('_______________________________________________________ 1\n',
  //   // JSON.stringify(global.STRONGLOOP_GLB.MSG_RES_LOADED, null, 2), '\n',
  //   resTag, exists);
  if (exists) return true;
  if (!appName || !appVersion) return false;
  delete resTag.filePathHash;
  resTag.appName = appName;
  resTag.appVersion = appVersion;
  exists =
    _.find(global.STRONGLOOP_GLB.MSG_RES_LOADED, resTag) !== undefined;
  // console.log('_______________________________________________________ 2\n',
  //   // JSON.stringify(global.STRONGLOOP_GLB.MSG_RES_LOADED, null, 2), '\n',
  //   resTag, exists);
  return exists;
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
  var fileNameHash = md5(fileName);
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
      var encoding = (fileType === 'gz') ? null : 'utf8';
      var content = fs.readFileSync(child, encoding);
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
var clonedTxtCount = 0;
function cloneEnglishTxtSyncDeep(rootDir) {
  if (!rootDir) rootDir = MY_ROOT;
  clonedTxtCount = 0;
  enumerateMsgSyncPriv(
    rootDir, rootDir, exports.ENGLISH, true, true, function() {});
  return clonedTxtCount;
}

function enumerateMsgSync(rootDir, lang, checkNodeModules, callback) {
  return enumerateMsgSyncPriv(
    rootDir, rootDir, lang, checkNodeModules, false, callback);
}

function enumerateMsgSyncPriv(
    currentPath, rootDir, lang, checkNodeModules, cloneEnglishTxt, callback) {
  assert(currentPath);
  assert(rootDir);
  assert(typeof callback === 'function');
  var intlDir = path.join(currentPath, 'intl');
  var langDirPath = path.join(intlDir, lang);
  var msgFiles = null;
  try {
    msgFiles = fs.readdirSync(langDirPath);
  } catch (e) {
    return;
  }
  msgFiles.forEach(function(msgFile) {
    if (msgFile.indexOf('.') === 0) return;
    var stats = fs.lstatSync(path.join(langDirPath, msgFile));
    if (!stats.isFile()) return;
    debug('enumerating...', path.join(langDirPath, msgFile));
    if (cloneEnglishTxt) {
      if (currentPath === rootDir) return;
      if (getTrailerAfterDot(msgFile) !== 'txt') return;
      var sourceTxtFilePath = path.join(langDirPath, msgFile);
      var filePathHash = md5(sourceTxtFilePath);
      var appName = getPackageName(currentPath);
      var appVersion = getPackageVersion(currentPath);
      if (resTagExists(filePathHash, msgFile, appName, appVersion,
        lang, exports.HELPTXT_TAG)) return;
      registerResTag(filePathHash, msgFile, appName, appVersion,
        lang, exports.HELPTXT_TAG);
      var targetTxtFilePath = path.join(rootDir, 'intl', exports.ENGLISH,
        md5(sourceTxtFilePath) + '_' + msgFile);
      fsSync.copy(sourceTxtFilePath, targetTxtFilePath, {force: true});
      clonedTxtCount++;
      console.log('--- cloned', sourceTxtFilePath);
    } else {
      var jsonObj = readToJson(langDirPath, msgFile, lang);
      if (jsonObj) {
        callback(jsonObj, path.join(langDirPath, msgFile));
      }
    }
  });
  if (checkNodeModules) {
    var depthRoot = directoryDepth(rootDir);
    var moduleRootPaths = resolveDependencies(currentPath, rootDir);
    if (moduleRootPaths) {
      moduleRootPaths.forEach(function(modulePath) {
        var depthModule = directoryDepth(modulePath);
        if ((depthModule - depthRoot) > maxDirectoryDepth()) return;
        enumerateMsgSyncPriv(modulePath, rootDir, lang, false,
          cloneEnglishTxt, callback);
      });
    }
  }
}

function directoryDepth(fullPath) {
  assert(typeof fullPath === 'string');
  return _.compact(fullPath.split(path.sep)).length;
}

function maxDirectoryDepth() {
  var depth = parseInt(process.env.STRONGLOOP_GLOBALIZE_MAX_DEPTH);
  if (isNaN(depth)) depth = Number.MAX_SAFE_INTEGER;
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
  if (stats.isSymbolicLink()) {
    depPath = fs.realpathSync(depPath);
    try {
      stats = fs.lstatSync(depPath);
    } catch (e) {
      return null;
    }
  }
  if (!stats.isDirectory()) return null;
  return depPath;
}

function resolveDependencies(currentDir, rootDir) {
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
  var moduleRootPaths = [];
  deps.forEach(function(dep) {
    var depPath = requireResolve(dep, currentDir, rootDir);
    if (depPath && moduleRootPaths.indexOf(depPath) < 0) {
      moduleRootPaths.push(depPath);
      moduleRootPaths = _.concat(moduleRootPaths,
        resolveDependencies(depPath, rootDir));
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
    jsonObj = JSON.parse(fs.readFileSync(sourceFilePath));
  } else { // txt
    var origStr = fs.readFileSync(sourceFilePath, 'utf8');
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
  enumerateFilesSync(cldrDir, null, ['gz'], false, false,
    function(gzippedContent) {
    var cldr = null;
    try {
      cldr = JSON.parse(zlib.gunzipSync(gzippedContent));
    } catch (e) {}
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
 * @param {string} lang Supported languages in CLDR notation
 * Returns Globalization Pipeline bundle name.
 */
function getBundleName(lang) {
  if (!lang) return getPackageName();
  lang = isSupportedLanguage(lang) ? lang : exports.ENGLISH;
  return getPackageName() + '_' + lang;
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
  } else if (typeof headersAllowed !== 'string') {
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
    if (arg) output.push((match === '%j')
        ? JSON.stringify(arg) : arg.toString());
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
