// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var _ = require('lodash');
var assert = require('assert');
var debug = require('debug')('strong-globalize');
var esprima = require('esprima');
var est = require('estraverse');
var fs = require('fs');
var helper = require('./helper');
var htmlparser = require('htmlparser2');
var md5 = require('md5');
var mkdirp = require('mkdirp');
var path = require('path');
var wc = require('word-count');
var YAML = require('yamljs');

exports.extractMessages = extractMessages;
exports.scanAst = scanAst;
exports.scanHtml = scanHtml;
exports.setHtmlRegex = setHtmlRegex;

var extractionFilter = /^([0-9\s\n,\.\'\"]*|.)$/;
var applyExtractionFilter = true;

var options = { // esprima parse options
  loc: true, // Nodes have line and column-based location info
  range: false, // Nodes have an index-based location range (array)
  raw: false, // We don't need raw.  Value is enough.
  tokens: false, // An extra array containing all found tokens
  comment: false, // An extra array containing all line and block comments
  tolerant: false, // An extra array containing all errors found,
  // attempts to continue parsing when an error is encountered
};

var GLB_FN = [
  'formatMessage', 't', 'm', 'format', 'f', 'Error',
  // RFC 5424 syslog levels and misc logging levels
  'ewrite', 'owrite', 'write',
  // RFC 5424 Syslog Message Severities
  'emergency', 'alert', 'critical', 'error', 'warning',
  'notice', 'informational', 'debug',
  // Node.js console
  'warn', 'info', 'log',
  // Misc Logging Levels
  'help', 'data', 'prompt', 'verbose', 'input', 'silly',
];
var SG = require('../index');
GLB_FN.forEach(function(fn) {
  assert(SG.prototype[fn], '"' + fn + '" is exported by strong-globalize.');
});

var HTML_REGEX = null;
var HTML_REGEX_HEAD = null;
var HTML_REGEX_TAIL = null;

/**
 * Customize regex to extract string out of HTML text
 *
 * @param {RegExp} regex to extract the whole string out of the HTML text
 * @param {RegExp} regexHead to trim the head portion from
 *    the extracted string
 * @param {RegExp} regexTail to trim the tail portion from
 *    the extracted string
 */
function setHtmlRegex(regex, regexHead, regexTail) {
  assert(regex);
  try {
    regex.test('');
    HTML_REGEX = regex;
  } catch (e) {
    throw new Error('*** setHtmlRegex: \'regex\' is illegal.');
  }
  if (regexHead)
    try {
      regexHead.test('');
      HTML_REGEX_HEAD = regexHead;
    } catch (e) {
      throw new Error('*** setHtmlRegex: \'regexHead\' is illegal.');
    }
  if (regexTail)
    try {
      regexTail.test('');
      HTML_REGEX_TAIL = regexTail;
    } catch (e) {
      throw new Error('*** setHtmlRegex: \'regexTail\' is illegal.');
    }
}

setHtmlRegex(
  /^([^{]|{(?!{))*{{(.|\s)+\s*\|\s*globalize\s*}}(.|\s)*$/,
  /^([^{]|{(?!{))*{{\s*[:]{0,2}('|\\"|"|)/,
  /('|\\"|"|)\s*\|\s*globalize\s*}}(.|\s)*$/
);

/**
 * Extract resource strings and returns an array of strings.
 *
 * @param {string} content The source code as a string
 */
var scannedJsCount;
var skippedJsCount;
var scannedHtmlCount;
var skippedHtmlCount;

function extractMessages(blackList, deep, suppressOutput, callback) {
  var msgs = null;
  var msgsLoc = null;
  var msgCount = 0;
  var wordCount = 0;
  var characterCount = 0;
  var clonedTxtCount = 0;

  function extractFromJsonOrYamlFile(literalArg, fileType, parentFileName) {
    var contents;
    var jsonPath = path.join(helper.getRootDir(), literalArg.msg);
    if (fileType === 'json') {
      try {
        contents = require(jsonPath);
      } catch (e) {
        console.error('*** json read failure: ', jsonPath,
          '*** defined in: ', parentFileName);
        return;
      }
    }
    if (fileType === 'yml' || fileType === 'yaml') {
      try {
        contents = YAML.load(jsonPath);
      } catch (e) {
        console.error('*** ' + fileType + ' read failure: ', jsonPath,
          '*** defined in: ', parentFileName);
        return;
      }
    }
    try {
      var cleanStr = literalArg.secondArg.replace(/[ ]+/g, ' ').trim();
      var keysArray = JSON.parse(cleanStr);
    } catch (e) {
      console.error('*** key array parse failure: ', cleanStr,
        '*** defined in: ', parentFileName);
      return;
    }
    var msges = helper.scanJson(keysArray, contents);
    var msgArray = [];
    if (msges && msges.length > 0) {
      msges.forEach(function(msg) {
        msgArray.push({
          msg: msg,
          callee: literalArg.callee,
          loc: literalArg.loc,
        });
      });
    }
    return msgArray;
  }

  function addToMsgs(msgArray, parentFileName) {
    if (!msgArray) return;
    var additionalMsges = [];
    var removeIx = [];
    msgArray.forEach(function(m, ix) {
      if (m.msg.indexOf(helper.PSEUDO_TAG) > -1) return;
      // skip if it came from non-GLB_FN argument
      var fileType = helper.getTrailerAfterDot(m.msg);
      if (fileType === 'json' || fileType === 'yml' || fileType === 'yaml') {
        var msgArrayFromJson = extractFromJsonOrYamlFile(m, fileType,
          parentFileName);
        if (msgArrayFromJson)
          additionalMsges = additionalMsges.concat(msgArrayFromJson);
        removeIx.push(ix);
      }
    });
    removeIx.forEach(function(ix) {
      msgArray[ix] = null;
    });
    msgArray = _.compact(msgArray);
    msgArray = msgArray.concat(additionalMsges);
    msgArray.forEach(function(m) {
      m.hashedMsg = (helper.hashKeys(m.msg)) ? md5(m.msg) : m.msg;
    });
    msgArray = _.orderBy(msgArray, ['hashedMsg'], 'asc');
    msgArray.forEach(function(m) {
      var key = m.hashedMsg.replace(helper.PSEUDO_TAG, '');
      if (m.loc) {
        if (!msgsLoc) msgsLoc = {};
        if (msgsLoc.hasOwnProperty(key)) {
          Array.prototype.push.call(msgsLoc[key], m.callee + ':' + m.loc);
        } else {
          msgsLoc[key] = new Array(m.callee + ':' + m.loc);
        }
      }
      if (m.hashedMsg === m.msg) return; // not hashed
      if (msgs && key in msgs) {
        debug('*** Key %s exists:', key, '=', m.msg);
        return;
      }
      console.log('    extracted: %s', m.msg);
      debug('\n        from', parentFileName);
      if (helper.percent(m.msg)) m.msg = helper.mapPercent(m.msg);
      if (!msgs) msgs = {};
      msgs[key] = m.msg;
      msgCount++;
      wordCount += wc(m.msg);
      characterCount += m.msg.length;
    });
  }
  var verboseMode = (!deep && helper.isRootPackage());
  if (deep) {
    var defaultBlackList = ['strong-globalize'];
    blackList = blackList ?
      _.concat(blackList, defaultBlackList) : defaultBlackList;
    clonedTxtCount += helper.cloneEnglishTxtSyncDeep();
  }

  var files = {};
  helper.enumerateFilesSync(helper.getRootDir(), blackList,
    'js', false, deep, function(content, fileName) {
      // We need to call require.resolve in order to resolve any simlinks
      var resolvedFileName = require.resolve(fileName);
      files[resolvedFileName] = {
        fileName: fileName,
        content: content,
        scanned: false,
        skipped: false,
        exportsGlb: undefined,
      };
    });

  _(files).keys().forEach(function(resolvedFileName) {
    processSourceFile(resolvedFileName, files, verboseMode);
  });

  scannedJsCount = _(files).map(_.property('scanned')).map(Number).sum();
  skippedJsCount = _(files).map(_.property('skipped')).map(Number).sum();
  _(files).omitBy(_.property('skipped')).forEach(function(entry) {
    addToMsgs(entry.messages, entry.fileName);
  });

  scannedHtmlCount = 0;
  skippedHtmlCount = 0;
  if (!deep) helper.enumerateFilesSync(helper.getRootDir(), blackList,
    ['html', 'htm'], false, deep, function(content, fileName) {
      scannedHtmlCount++;
      var msgs = scanHtml(content, fileName, verboseMode);
      if (msgs === null || msgs === undefined) {
        skippedHtmlCount++;
        return;
      }
      addToMsgs(msgs, fileName);
    });
  var enLangDirPath = helper.intlDir(helper.ENGLISH);
  var pseudoLangDirPath = helper.intlDir(helper.PSEUDO_LANG);
  var msgFiles = null;
  var messagesJsonExists = false;
  try {
    msgFiles = fs.readdirSync(enLangDirPath);
  } catch (e) {
  }
  if (msgFiles) msgFiles.forEach(function(msgFile) {
    var keys;
    if (msgFile.indexOf('.') === 0) return;
    var fileType = helper.getTrailerAfterDot(msgFile);
    if (fileType !== 'json') return;
    var isMessagesJson = (msgFile === 'messages.json');
    messagesJsonExists = messagesJsonExists || isMessagesJson;
    var msgFilePath = path.join(enLangDirPath, msgFile);
    try {
      var jsonObj = JSON.parse(
        helper.stripBom(fs.readFileSync(msgFilePath, 'utf-8')));
      keys = Object.keys(jsonObj);
    } catch (e) {
      debug('*** JSON read or parse failure:', msgFile, e);
      return;
    }
    keys.forEach(function(key) {
      if (helper.hashKeys(key)) delete jsonObj[key];
    });
    var msgLocFilePath = path.join(pseudoLangDirPath, msgFile);
    var jsonLocObj = null;
    try {
      jsonLocObj = JSON.parse(
        helper.stringBom(fs.readFileSync(msgLocFilePath, 'utf-8')));
    } catch (e) {}
    if (jsonLocObj) {
      keys = Object.keys(jsonLocObj);
      keys.forEach(function(key) {
        delete jsonLocObj[key];
      });
    }
    if (isMessagesJson) {
      for (var key in msgs) jsonObj[key] = msgs[key];
    }
    mkdirp.sync(enLangDirPath);
    fs.writeFileSync(msgFilePath,
      JSON.stringify(helper.sortMsges(jsonObj), null, 2) + '\n');
    if (msgsLoc) {
      if (jsonLocObj) {
        if (isMessagesJson) {
          for (key in msgsLoc) jsonLocObj[key] = msgsLoc[key];
        }
      } else {
        jsonLocObj = msgsLoc;
      }
    }
    if (jsonLocObj) {
      mkdirp.sync(pseudoLangDirPath);
      fs.writeFileSync(msgLocFilePath,
        JSON.stringify(jsonLocObj, null, 2) + '\n');
      jsonLocObj = invertLocObj(jsonLocObj);
      msgLocFilePath = msgLocFilePath.substring(
        0, msgLocFilePath.length - '.json'.length) + '_inverted.json';
      fs.writeFileSync(msgLocFilePath,
        JSON.stringify(jsonLocObj, null, 2) + '\n');
    }
  });
  if (!messagesJsonExists) {
    if (msgs) {
      mkdirp.sync(enLangDirPath);
      var msgFilePath = path.join(enLangDirPath, 'messages.json');
      fs.writeFileSync(msgFilePath,
        JSON.stringify(helper.sortMsges(msgs), null, 2) + '\n');
    }
    if (msgsLoc) {
      mkdirp.sync(pseudoLangDirPath);
      var msgLocFilePath = path.join(pseudoLangDirPath, 'messages.json');
      fs.writeFileSync(msgLocFilePath, JSON.stringify(msgsLoc, null, 2) + '\n');
      msgsLoc = invertLocObj(msgsLoc);
      msgLocFilePath = msgLocFilePath.substring(
        0, msgLocFilePath.length - '.json'.length) + '_inverted.json';
      fs.writeFileSync(msgLocFilePath, JSON.stringify(msgsLoc, null, 2) + '\n');
    }
  }
  if (!suppressOutput) console.log(
    '\n--- root: ' + global.STRONGLOOP_GLB.MASTER_ROOT_DIR +
    '\n--- max depth: ' +
      (deep ? (helper.maxDirectoryDepth() === helper.BIG_NUM ?
        'unlimited' : helper.maxDirectoryDepth().toString()) : 'N/A') +
    '\n--- cloned: ' + (deep ? clonedTxtCount.toString() + ' txt' : 'N/A') +
    '\n--- scanned:', scannedJsCount, 'js,', scannedHtmlCount, 'html',
    '\n--- skipped:', skippedJsCount, 'js,', skippedHtmlCount, 'html',
    '\n--- extracted:', msgCount, 'msges,', wordCount, 'words,',
      characterCount, 'characters');
  if (callback) callback();
}

function invertLocObj(locObj) {
  var inv = {};
  _.forEach(locObj, function(v1, k) {
    if (typeof v1 === 'string') v1 = [v1];
    v1.forEach(function(v2) {
      var colonPos = v2.lastIndexOf(':');
      if (colonPos === -1) return;
      var fileName = v2.substring(0, colonPos);
      var lineNumber = v2.substring(colonPos + 1);
      colonPos = fileName.lastIndexOf(':');
      var callee = fileName.substring(0, colonPos);
      fileName = fileName.substring(colonPos + 1);
      if (!(fileName in inv)) inv[fileName] = {};
      if (!(lineNumber in inv[fileName])) inv[fileName][lineNumber] = [];
      inv[fileName][lineNumber].push(callee + '(\'' + k +
        (k.indexOf('%') >= 0 ? '\', ... )' : '\')'));
    });
  });
  return inv;
}

function processSourceFile(resolvedFileName, files, verboseMode) {
  var entry = files[resolvedFileName];
  if (entry.scanned) return entry;
  entry.scanned = true;
  var msgs = scanAst(entry.content, entry.fileName, verboseMode, files);
  if (msgs === null || msgs === undefined) {
    entry.skipped = true;
    return entry;
  }
  entry.messages = msgs;
  return entry;
}

function scanHtml(content, fileName, verboseMode) {
  var msgs = [];
  var tn = [];
  var tc = [];
  var parser = new htmlparser.Parser({
    onopentag: function(name, attribs) {
      tn.push(name);
      tc.push(attribs.class); // could be null
    },
    ontext: function(text) {
      text = text.trim().replace(/\s+/g, ' ');
      debug(text);
      if (tc.length > 0 && tc[tc.length - 1] === 'strong-globalize') {
        if (text) msgs.push({msg: text});
        return;
      } else {
        var result = HTML_REGEX.exec(text);
        if (!result || result.length === 0) {
          if (text) debug('    --skipped: %s', text);
          return;
        }
        if (HTML_REGEX_HEAD) result[0] = result[0].replace(HTML_REGEX_HEAD, '');
        if (HTML_REGEX_TAIL) result[0] = result[0].replace(HTML_REGEX_TAIL, '');
        text = result[0].trim().replace(/\s+/g, ' ');
      }
      if (text) msgs.push({msg: text});
    },
    onclosetag: function(tagname) {
      tn.pop();
      tc.pop();
    },
    onerror: function(err) {
      if (err) {
        var errMsg =
          '\n**********************************************************' +
          '\n** Please fix the HTML or blacklist the directory.' +
          '\n** ' + fileName + '\n** ' + JSON.stringify(err) +
          '\n**********************************************************\n';
        if (verboseMode) console.error(errMsg);
        msgs = null;
      }
    },
  }, {decodeEntities: true, recognizeCDATA: true, recognizeSelfClosing: true});
  parser.write(content);
  parser.end();
  return msgs;
}

function scanAst(content, fileName, verboseMode, fileEntries) {
  var shebangExpr = /^\s*#\!.*?(\r\n|\r|\n)/m;
  if (shebangExpr.test(content)) { // hide it.
    content = content.replace(/#\!/, '//');
  }
  try {
    var ast = esprima.parse(content, options);
  } catch (e) {
    var errMsg =
      '\n**********************************************************' +
      '\n** Please fix the JS code or blacklist the directory.' +
      '\n** ' + fileName + '\n** ' + JSON.stringify(e) +
      '\n**********************************************************\n';
    if (verboseMode) console.error(errMsg);
    return null;
  }
  var rootDir = helper.getRootDir();
  if (rootDir[rootDir.length - 1] !== path.sep) rootDir += path.sep;
  var baseName = fileName.replace(rootDir, '');
  var sg = [];
  var glbs = [];
  est.traverse(ast, {
    enter: function enterNode(node, parent) {
      if (node.type === 'VariableDeclaration'
        && node.declarations
        && node.declarations.length > 0) {
        var decls = node.declarations;
        decls.forEach(function(d) {
          if (d.type === 'VariableDeclarator'
            && d.init
            && d.init.type === 'CallExpression'
            && d.init.callee) {
            var argsParent = d.init;
            var callee = d.init.callee;
            if (callee.type === 'CallExpression') {
              argsParent = callee;
              callee = callee.callee;
            }
            if (callee.type === 'Identifier'
              && callee.name === 'require') {
              argsParent.arguments.forEach(function(arg, ix) {
                if (arg.type !== 'Literal') return;
                if (!(d.id && d.id.type && d.id.type === 'Identifier')) return;

                if (arg.value === 'strong-globalize') {
                  // require('strong-globalize')
                  sg.push(d.id.name);
                  return;
                }

                if (/^\.\/|\.\./.test(arg.value) && fileEntries) {
                  // require('./local-file')
                  var currentDir = path.dirname(fileName);
                  var localFile = path.resolve(currentDir, arg.value);
                  try {
                    // resolve e.g. "lib/globalize" to "lib/globalize.js"
                    // also resolve any symlinks in the path
                    localFile = require.resolve(localFile);
                  } catch (err) {
                    return;
                  }
                  if (!(localFile in fileEntries)) return;
                  var entry = processSourceFile(localFile, fileEntries,
                                verboseMode);
                  if (entry.exportsGlb) {
                    glbs.push(d.id.name);
                  }
                }
              });
            }
          }
        });
      }
    },
  });
  sg = _.uniq(_.compact(sg));
  var moduleExportsGlb = false;
  est.traverse(ast, {
    enter: function enterNode(node, parent) {
      if (node.type === 'VariableDeclaration' && node.kind === 'var') {
        var decls = node.declarations;
        decls.forEach(function(d) {
          if (d.type === 'VariableDeclarator'
            && d.init
            && (d.init.type === 'CallExpression' ||
              d.init.type === 'NewExpression')
            && d.init.callee
            && d.init.callee.type === 'Identifier'
            && sg.indexOf(d.init.callee.name) >= 0) {
            if (d.id && d.id.type === 'Identifier') {
              glbs.push(d.id.name);
            }
          }
        });
      } else if (node.type === 'ExpressionStatement') {
        var operator = node.expression.operator;
        var left = node.expression.left;
        var right = node.expression.right;
        if (operator === '=' &&
            left.type === 'MemberExpression' &&
            left.object.type === 'Identifier' &&
            left.object.name === 'module' &&
            left.property.type === 'Identifier' &&
            left.property.name === 'exports') {
          var callOrNew = right.type === 'CallExpression' ||
            right.type === 'NewExpression';
          moduleExportsGlb = callOrNew &&
            right.callee && right.callee.type === 'Identifier' &&
            sg.indexOf(right.callee.name) >= 0;
        }
      }
    },
  });

  if (fileEntries) {
    fileEntries[require.resolve(fileName)].exportsGlb = moduleExportsGlb;
  }

  glbs = sg.concat(glbs);
  var msgs = [];

  function recordLiteralPosition(nd, callee) {
    if (!nd || !nd.type) return;
    if (nd.type === 'Literal' && nd.value && typeof nd.value === 'string') {
      if (!nd.loc) return;
      if (applyExtractionFilter && nd.value.match(extractionFilter)) return;
      var msgLoc = {
        callee: callee,
        msg: helper.PSEUDO_TAG + nd.value,
        loc: nd.loc ?
                baseName + ':' + nd.loc.start.line.toString() : '',
      };
      msgs.push(msgLoc);
    } else if (nd.type === 'BinaryExpression' && nd.operator === '+') {
      recordLiteralPosition(nd.left, callee);
      recordLiteralPosition(nd.right, callee);
    }
  }

  function composeName(objName, propName) {
    if (!objName) return propName;
    return objName + '.' + propName;
  }

  est.traverse(ast, {
    enter: function enterNode(node, parent) {
      if (node.type === 'CallExpression'
        && node.callee.type === 'MemberExpression'
        && node.callee.object
        && (node.callee.object.type === 'Identifier' ||
          node.callee.object.type === 'MemberExpression')) {
        var ix = glbs.indexOf(node.callee.object.name);
        if (ix >= 0) {
          if (GLB_FN.indexOf(node.callee.property.name) >= 0) {
            var msg = binExpOrLit(node.arguments[0]);
            if (!msg) {
              console.log('*** Skipped non-literal argument of "%s" at %s',
                glbs[ix] + '.' + node.callee.property.name,
                fileName + (node.callee.loc ?
                  (':' + node.callee.loc.start.line.toString()) : ''));
              return;
            }
            var secondArgValue = null;
            if (node.arguments[1])
              secondArgValue = binExpOrLit(node.arguments[1]);
            var literalArg = {
              callee: composeName(node.callee.object.name,
                node.callee.property.name),
              msg: msg,
              secondArg: secondArgValue,
              loc: node.loc ?
                baseName + ':' + node.loc.start.line.toString() : '',
            };
            msgs.push(literalArg);
          }
        } else {
          recordLiteralPosition(node.arguments[0],
            composeName(node.callee.object.name, node.callee.property.name));
        }
      } else if (
          (node.type === 'CallExpression' || node.type === 'NewExpression')
          && node.callee.type === 'Identifier'
          && node.callee.name !== 'require') {
        recordLiteralPosition(node.arguments[0], node.callee.name);
      }
    },
  });
  return msgs;
}

function binExpOrLit(nd) {
  if (nd.type === 'Literal') return nd.value;
  if (nd.type === 'BinaryExpression' && nd.operator === '+') {
    var left = binExpOrLit(nd.left);
    var right = binExpOrLit(nd.right);
    if (left && right) return (left + right);
    if (left) return left;
    if (right) return right;
    return null;
  }
  return null;
}
