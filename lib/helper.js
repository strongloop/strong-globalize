'use strict';

var _ = require('lodash');
var assert = require('assert');
var debug = require('debug')('strong-globalize');
var fs = require('fs');
var md5 = require('md5');
var mkdirp = require('mkdirp');
var path = require('path');
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

exports.enumerateFilesSync = enumerateFilesSync;
exports.enumerateLanguageSync = enumerateLanguageSync;
exports.enumerateMsgSync = enumerateMsgSync;
exports.getBundleName = getBundleName;
exports.getPackageName = getPackageName;
exports.getTrailerAfterDot = getTrailerAfterDot;
exports.hashKeys = hashKeys;
exports.headerIncluded = headerIncluded;
exports.initIntlDirs = initIntlDirs;
exports.intlDir = intlDir;
exports.getSupportedLanguages = getSupportedLanguages;
exports.isSupportedLanguage = isSupportedLanguage;
exports.mapArgs = mapArgs;
exports.mapPercent = mapPercent;
exports.percent = percent;
exports.readToJson = readToJson;
exports.repackArgs = repackArgs;
exports.setRootDir = setRootDir;
Object.defineProperty(exports, 'ENGLISH', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'en',
});

var HASH_KEYS = false;
var KEY_HEADERS = ['msg'];

function hashKeys(path) {
  return !(headerIncluded(path, KEY_HEADERS)
    || getTrailerAfterDot(path) === 'txt');
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
  if (!rootStats.isDirectory()) validPath = false;
  assert(validPath, 'Root path invalid: ' + rootPath);
  MY_ROOT = rootPath;
  INTL_DIR = path.join(MY_ROOT, 'intl');
}

/**
 * Enumerate all JS files in this application
 * @param {Function}
 *   param.content is a UTF8 string of each JS source file.
 */
function enumerateFilesSync(
  dir, blackList, targetFileType, verbose, callback) {
  if (dir === null) dir = MY_ROOT;
  dir = path.resolve(dir);
  blackList = Array.isArray(blackList) ? blackList : [];
  if (!Array.isArray(targetFileType)) targetFileType = [targetFileType];
  var skipDir = false;
  blackList.forEach(function(part) {
    if (typeof part !== 'string') return;
    if (dir.indexOf(part) >= 0) skipDir = true;
  });
  if (skipDir) {
    if (verbose) console.log('***  skipping directory:', dir);
    return;
  }
  var files = null;
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    return;
  }
  files.forEach(function(item) {
    if (item.indexOf('.') === 0) return;
    var child = path.join(dir, item);
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
      enumerateFilesSync(child, blackList, targetFileType, verbose, callback);
    } else {
      var fileType = getTrailerAfterDot(item);
      if (targetFileType.indexOf(fileType) < 0) return;
      var encoding = (fileType === 'gz') ? null : 'utf8';
      var content = fs.readFileSync(path.resolve(child), encoding);
      if (verbose) console.log('~~~ examining file:', child);
      callback(content, child);
    };
  });
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
function enumerateMsgSync(lang, checkNodeModules, callback) {
  enumerateMsgSyncPriv(MY_ROOT, lang, checkNodeModules, callback);
}

function enumerateMsgSyncPriv(rootDir, lang, checkNodeModules, callback) {
  var intlDir = path.join(rootDir, 'intl');
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
    var jsonObj = readToJson(langDirPath, msgFile, lang);
    if (jsonObj) callback(jsonObj);
  });
  if (checkNodeModules) {
    var packageJson = path.join(rootDir, 'package.json');
    if (!packageJson) return;
    var deps = require(packageJson).dependencies;
    if (!deps) return;
    deps = Object.keys(deps);
    var moduleRootPaths = [];
    deps.forEach(function(dep) {
      moduleRootPaths.push(path.join(rootDir, 'node_modules', dep));
    });
    moduleRootPaths.forEach(function(moduleRootPath) {
      try {
        var stats = fs.lstatSync(moduleRootPath);
      } catch (e) {
        return; // ignore if lstat failed.
      }
      if (stats.isSymbolicLink()) {
        moduleRootPath = fs.realpathSync(moduleRootPath);
      } else if (!stats.isDirectory()) return;
      enumerateMsgSyncPriv(moduleRootPath, lang, checkNodeModules, callback);
    });
  }
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
  } else {
    var origStr = fs.readFileSync(sourceFilePath, 'utf8');
    jsonObj = {};
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
  enumerateFilesSync(cldrDir, null, ['gz'], false, function(gzippedContent) {
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
  root = root || MY_ROOT;
  var name = null;
  try {
    name = require(path.join(root, 'package.json')).name;
  } catch (e) {}
  return name;
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
