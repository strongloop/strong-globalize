// Copyright IBM Corp. 2015,2018. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

import * as _ from 'lodash';
import * as assert from 'assert';
import * as dbg from 'debug';
const debug = dbg('strong-globalize-cli');
import * as esprima from 'esprima';
import * as est from 'estraverse';
import * as fs from 'fs';
import SG = require('strong-globalize');
const {helper, STRONGLOOP_GLB} = SG;
import * as htmlparser from 'htmlparser2';
import * as md5 from 'md5';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
const wc = require('word-count');
import {load} from 'yamljs';
import {Node, Expression, Super, CallExpression, NewExpression} from 'estree';
import {AnyObject} from 'strong-globalize/lib/config';

const extractionFilter = /^([0-9\s\n,\.\'\"]*|.)$/;
const applyExtractionFilter = true;

const options = {
  // esprima parse options
  loc: true, // Nodes have line and column-based location info
  range: false, // Nodes have an index-based location range (array)
  raw: false, // We don't need raw.  Value is enough.
  tokens: false, // An extra array containing all found tokens
  comment: false, // An extra array containing all line and block comments
  tolerant: false, // An extra array containing all errors found,
  // attempts to continue parsing when an error is encountered
};

const GLB_FN = [
  'formatMessage',
  't',
  'm',
  'format',
  'f',
  'Error',
  // RFC 5424 syslog levels and misc logging levels
  'ewrite',
  'owrite',
  'write',
  // RFC 5424 Syslog Message Severities
  'emergency',
  'alert',
  'critical',
  'error',
  'warning',
  'notice',
  'informational',
  'debug',
  // Node.js console
  'warn',
  'info',
  'log',
  // Misc Logging Levels
  'help',
  'data',
  'prompt',
  'verbose',
  'input',
  'silly',
];

GLB_FN.forEach(fn => {
  assert(fn in SG.prototype, '"' + fn + '" is exported by strong-globalize.');
});

let HTML_REGEX: RegExp;
let HTML_REGEX_HEAD: RegExp;
let HTML_REGEX_TAIL: RegExp;

/**
 * Customize regex to extract string out of HTML text
 *
 * @param {RegExp} regex to extract the whole string out of the HTML text
 * @param {RegExp} regexHead to trim the head portion from
 *    the extracted string
 * @param {RegExp} regexTail to trim the tail portion from
 *    the extracted string
 */
export function setHtmlRegex(
  regex: RegExp,
  regexHead: RegExp,
  regexTail: RegExp
) {
  assert(regex);
  try {
    regex.test('');
    HTML_REGEX = regex;
  } catch (e) {
    throw new Error("*** setHtmlRegex: 'regex' is illegal.");
  }
  if (regexHead) {
    try {
      regexHead.test('');
      HTML_REGEX_HEAD = regexHead;
    } catch (e) {
      throw new Error("*** setHtmlRegex: 'regexHead' is illegal.");
    }
  }
  if (regexTail) {
    try {
      regexTail.test('');
      HTML_REGEX_TAIL = regexTail;
    } catch (e) {
      throw new Error("*** setHtmlRegex: 'regexTail' is illegal.");
    }
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
let scannedJsCount;
let skippedJsCount;
let scannedHtmlCount: number;
let skippedHtmlCount: number;

export function extractMessages(
  blackList: string[],
  deep: boolean,
  suppressOutput: boolean,
  callback?: () => void
) {
  let msgs: AnyObject | null = null;
  let msgsLoc: AnyObject | null = null;
  let msgCount = 0;
  let wordCount = 0;
  let characterCount = 0;
  let clonedTxtCount = 0;

  function extractFromJsonOrYamlFile(
    literalArg: AnyObject,
    fileType: string,
    parentFileName: string
  ) {
    // tslint:disable-next-line:no-any
    let contents: any;
    const jsonPath = path.join(helper.getRootDir(), literalArg.msg);
    if (fileType === 'json') {
      try {
        contents = require(jsonPath);
      } catch (e) {
        console.error(
          '*** json read failure: ',
          jsonPath,
          '*** defined in: ',
          parentFileName
        );
        return;
      }
    }
    if (fileType === 'yml' || fileType === 'yaml') {
      try {
        contents = load(jsonPath);
      } catch (e) {
        console.error(
          '*** ' + fileType + ' read failure: ',
          jsonPath,
          '*** defined in: ',
          parentFileName
        );
        return;
      }
    }
    let cleanStr;
    let keysArray;
    try {
      // secondArg can be null: json = g.t('data/data.json'); // missing field array
      // e: Cannot read property 'replace' of null
      cleanStr = literalArg.secondArg.replace(/[ ]+/g, ' ').trim();
      keysArray = JSON.parse(cleanStr);
    } catch (e) {
      console.error(
        '*** key array parse failure: ',
        cleanStr,
        '*** defined in: ',
        parentFileName
      );
      return;
    }
    const messages = helper.scanJson(keysArray, contents) as string[];
    const msgArray: AnyObject[] = [];
    if (messages && messages.length > 0) {
      // tslint:disable-next-line:no-any
      messages.forEach(function(msg: any) {
        msgArray.push({
          msg: msg,
          callee: literalArg.callee,
          loc: literalArg.loc,
        });
      });
    }
    return msgArray;
  }

  function addToMsgs(msgArray: AnyObject[], parentFileName: string) {
    if (!msgArray) return;
    let additionalMsges: AnyObject[] = [];
    const removeIx: number[] = [];
    msgArray.forEach(function(m, ix) {
      if (m.msg.indexOf(helper.PSEUDO_TAG) > -1) return;
      // skip if it came from non-GLB_FN argument
      const fileType = helper.getTrailerAfterDot(m.msg);
      if (fileType === 'json' || fileType === 'yml' || fileType === 'yaml') {
        const msgArrayFromJson = extractFromJsonOrYamlFile(
          m,
          fileType,
          parentFileName
        );
        if (msgArrayFromJson)
          additionalMsges = additionalMsges.concat(msgArrayFromJson);
        removeIx.push(ix);
      }
    });
    removeIx.forEach(function(ix) {
      delete msgArray[ix];
    });
    msgArray = _.compact(msgArray);
    msgArray = msgArray.concat(additionalMsges);
    msgArray.forEach(function(m) {
      m.hashedMsg = helper.hashKeys(m.msg) ? md5(m.msg) : m.msg;
    });
    msgArray = _.orderBy(msgArray, ['hashedMsg'], 'asc');
    msgArray.forEach(function(m) {
      const key = m.hashedMsg.replace(helper.PSEUDO_TAG, '');
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
  const verboseMode = !deep && helper.isRootPackage();
  if (deep) {
    const defaultBlackList = ['strong-globalize'];
    blackList = blackList
      ? _.concat(blackList, defaultBlackList)
      : defaultBlackList;
    clonedTxtCount += helper.cloneEnglishTxtSyncDeep();
  }

  const files: AnyObject = {};
  helper.enumerateFilesSync(
    helper.getRootDir(),
    blackList,
    'js',
    false,
    deep,
    function(content, fileName) {
      // We need to call require.resolve in order to resolve any simlinks
      const resolvedFileName = require.resolve(fileName);
      files[resolvedFileName] = {
        fileName: fileName,
        content: content,
        scanned: false,
        skipped: false,
        exportsGlb: undefined,
      };
    }
  );

  _(files)
    .keys()
    .forEach(function(resolvedFileName) {
      processSourceFile(resolvedFileName, files, verboseMode);
    });

  scannedJsCount = _(files)
    .map(_.property('scanned'))
    .map(Number)
    .sum();
  skippedJsCount = _(files)
    .map(_.property('skipped'))
    .map(Number)
    .sum();
  _(files)
    .omitBy(_.property('skipped'))
    .forEach(function(entry) {
      addToMsgs(entry.messages, entry.fileName);
    });

  scannedHtmlCount = 0;
  skippedHtmlCount = 0;
  if (!deep)
    helper.enumerateFilesSync(
      helper.getRootDir(),
      blackList,
      ['html', 'htm'],
      false,
      deep,
      function(content, fileName) {
        scannedHtmlCount++;
        const messages = scanHtml(content, fileName, verboseMode);
        if (messages === null || messages === undefined) {
          skippedHtmlCount++;
          return;
        }
        addToMsgs(messages, fileName);
      }
    );
  const enLangDirPath = helper.intlDir(helper.ENGLISH);
  const pseudoLangDirPath = helper.intlDir(helper.PSEUDO_LANG);
  let msgFiles: string[] | null = null;
  let messagesJsonExists = false;
  try {
    msgFiles = fs.readdirSync(enLangDirPath);
  } catch (e) {}
  if (msgFiles)
    msgFiles.forEach(function(msgFile) {
      let keys;
      if (msgFile.indexOf('.') === 0) return;
      const fileType = helper.getTrailerAfterDot(msgFile);
      if (fileType !== 'json') return;
      const isMessagesJson = msgFile === 'messages.json';
      messagesJsonExists = messagesJsonExists || isMessagesJson;
      const msgFilePath = path.join(enLangDirPath, msgFile);
      let jsonObj: AnyObject;
      try {
        jsonObj = JSON.parse(
          helper.stripBom(fs.readFileSync(msgFilePath, 'utf-8'))
        );
        keys = Object.keys(jsonObj);
        keys.forEach(function(key) {
          if (helper.hashKeys(key)) delete jsonObj[key];
        });
      } catch (e) {
        debug('*** JSON read or parse failure:', msgFile, e);
        return;
      }

      let msgLocFilePath = path.join(pseudoLangDirPath, msgFile);
      let jsonLocObj: AnyObject | null = null;
      try {
        jsonLocObj = JSON.parse(
          helper.stripBom(fs.readFileSync(msgLocFilePath, 'utf-8'))
        );
      } catch (e) {}
      if (jsonLocObj) {
        keys = Object.keys(jsonLocObj);
        keys.forEach(function(key) {
          delete jsonLocObj![key];
        });
      }
      if (isMessagesJson) {
        for (const key in msgs!) jsonObj[key] = msgs![key];
      }
      mkdirp.sync(enLangDirPath);
      fs.writeFileSync(
        msgFilePath,
        JSON.stringify(helper.sortMsges(jsonObj), null, 2) + '\n'
      );
      if (msgsLoc) {
        if (jsonLocObj) {
          if (isMessagesJson) {
            for (const key in msgsLoc) jsonLocObj[key] = msgsLoc[key];
          }
        } else {
          jsonLocObj = msgsLoc;
        }
      }
      if (jsonLocObj) {
        mkdirp.sync(pseudoLangDirPath);
        fs.writeFileSync(
          msgLocFilePath,
          JSON.stringify(jsonLocObj, null, 2) + '\n'
        );
        jsonLocObj = invertLocObj(jsonLocObj);
        msgLocFilePath =
          msgLocFilePath.substring(0, msgLocFilePath.length - '.json'.length) +
          '_inverted.json';
        fs.writeFileSync(
          msgLocFilePath,
          JSON.stringify(jsonLocObj, null, 2) + '\n'
        );
      }
    });
  if (!messagesJsonExists) {
    if (msgs) {
      mkdirp.sync(enLangDirPath);
      const msgFilePath = path.join(enLangDirPath, 'messages.json');
      fs.writeFileSync(
        msgFilePath,
        JSON.stringify(helper.sortMsges(msgs), null, 2) + '\n'
      );
    }
    if (msgsLoc) {
      mkdirp.sync(pseudoLangDirPath);
      let msgLocFilePath = path.join(pseudoLangDirPath, 'messages.json');
      fs.writeFileSync(msgLocFilePath, JSON.stringify(msgsLoc, null, 2) + '\n');
      msgsLoc = invertLocObj(msgsLoc);
      msgLocFilePath =
        msgLocFilePath.substring(0, msgLocFilePath.length - '.json'.length) +
        '_inverted.json';
      fs.writeFileSync(msgLocFilePath, JSON.stringify(msgsLoc, null, 2) + '\n');
    }
  }
  if (!suppressOutput)
    console.log(
      '\n--- root: ' +
        STRONGLOOP_GLB.MASTER_ROOT_DIR +
        '\n--- max depth: ' +
        (deep
          ? helper.maxDirectoryDepth() === helper.BIG_NUM
            ? 'unlimited'
            : helper.maxDirectoryDepth().toString()
          : 'N/A') +
        '\n--- cloned: ' +
        (deep ? clonedTxtCount.toString() + ' txt' : 'N/A') +
        '\n--- scanned:',
      scannedJsCount,
      'js,',
      scannedHtmlCount,
      'html',
      '\n--- skipped:',
      skippedJsCount,
      'js,',
      skippedHtmlCount,
      'html',
      '\n--- extracted:',
      msgCount,
      'msges,',
      wordCount,
      'words,',
      characterCount,
      'characters'
    );
  if (callback) callback();
}

function invertLocObj(locObj: AnyObject) {
  const inv: AnyObject = {};
  _.forEach(locObj, function(v1, k) {
    if (typeof v1 === 'string') v1 = [v1];
    v1.forEach(function(v2: string) {
      let colonPos = v2.lastIndexOf(':');
      if (colonPos === -1) return;
      let fileName = v2.substring(0, colonPos);
      const lineNumber = v2.substring(colonPos + 1);
      colonPos = fileName.lastIndexOf(':');
      const callee = fileName.substring(0, colonPos);
      fileName = fileName.substring(colonPos + 1);
      if (!(fileName in inv)) inv[fileName] = {};
      if (!(lineNumber in inv[fileName])) inv[fileName][lineNumber] = [];
      inv[fileName][lineNumber].push(
        callee + "('" + k + (k.indexOf('%') >= 0 ? "', ... )" : "')")
      );
    });
  });
  return inv;
}

function processSourceFile(
  resolvedFileName: string,
  files: AnyObject,
  verboseMode: boolean
) {
  const entry = files[resolvedFileName];
  if (entry.scanned) return entry;
  entry.scanned = true;
  const msgs = scanAst(entry.content, entry.fileName, verboseMode, files);
  if (msgs === null || msgs === undefined) {
    entry.skipped = true;
    return entry;
  }
  entry.messages = msgs;
  return entry;
}

export function scanHtml(
  content: string,
  fileName: string,
  verboseMode: boolean
) {
  let msgs: AnyObject[] | null = [];
  const tn: string[] = [];
  const tc: string[] = [];
  const parser = new htmlparser.Parser(
    {
      onopentag: function(name, attribs) {
        tn.push(name);
        tc.push(attribs.class); // could be null
      },
      ontext: function(text) {
        text = text.trim().replace(/\s+/g, ' ');
        debug(text);
        if (tc.length > 0 && tc[tc.length - 1] === 'strong-globalize') {
          if (text) msgs!.push({msg: text});
          return;
        } else {
          const result = HTML_REGEX.exec(text);
          if (!result || result.length === 0) {
            if (text) debug('    --skipped: %s', text);
            return;
          }
          if (HTML_REGEX_HEAD)
            result[0] = result[0].replace(HTML_REGEX_HEAD, '');
          if (HTML_REGEX_TAIL)
            result[0] = result[0].replace(HTML_REGEX_TAIL, '');
          text = result[0].trim().replace(/\s+/g, ' ');
        }
        if (text) msgs!.push({msg: text});
      },
      onclosetag: function(tagname) {
        tn.pop();
        tc.pop();
      },
      onerror: function(err) {
        if (err) {
          const errMsg =
            '\n**********************************************************' +
            '\n** Please fix the HTML or blacklist the directory.' +
            '\n** ' +
            fileName +
            '\n** ' +
            JSON.stringify(err) +
            '\n**********************************************************\n';
          if (verboseMode) console.error(errMsg);
          msgs = null;
        }
      },
    },
    {decodeEntities: true, recognizeCDATA: true, recognizeSelfClosing: true}
  );
  parser.write(content);
  parser.end();
  return msgs;
}

export function scanAst(
  content: string,
  fileName: string,
  verboseMode: boolean,
  fileEntries: AnyObject
) {
  const shebangExpr = /^\s*#\!.*?(\r\n|\r|\n)/m;
  if (shebangExpr.test(content)) {
    // hide it.
    content = content.replace(/#\!/, '//');
  }
  let ast: Node;
  try {
    ast = esprima.parseScript(content, options);
  } catch (e) {
    const errMsg =
      '\n**********************************************************' +
      '\n** Please fix the JS code or blacklist the directory.' +
      '\n** ' +
      fileName +
      '\n** ' +
      JSON.stringify(e) +
      '\n**********************************************************\n';
    if (verboseMode) console.error(errMsg);
    return null;
  }
  let rootDir = helper.getRootDir();
  if (rootDir[rootDir.length - 1] !== path.sep) rootDir += path.sep;
  const baseName = fileName.replace(rootDir, '');
  let sg: string[] = [];
  let glbs: string[] = [];
  est.traverse(ast, {
    enter: function enterNode(node, parent) {
      if (
        node.type === 'VariableDeclaration' &&
        node.declarations &&
        node.declarations.length > 0
      ) {
        const decls = node.declarations;
        decls.forEach(function(d) {
          if (
            d.type === 'VariableDeclarator' &&
            d.init &&
            d.init.type === 'CallExpression' &&
            d.init.callee
          ) {
            let argsParent = d.init;
            let callee = d.init.callee;
            if (callee.type === 'CallExpression') {
              argsParent = callee;
              callee = callee.callee;
            }
            if (callee.type === 'Identifier' && callee.name === 'require') {
              argsParent.arguments.forEach(function(arg, ix) {
                if (arg.type !== 'Literal') return;
                if (!(d.id && d.id.type && d.id.type === 'Identifier')) return;

                if (arg.value === 'strong-globalize') {
                  // require('strong-globalize')
                  sg.push(d.id.name);
                  return;
                }

                const argValue: string = String(arg.value);
                if (/^\.\/|\.\./.test(argValue) && fileEntries) {
                  // require('./local-file')
                  const currentDir = path.dirname(fileName);
                  let localFile = path.resolve(currentDir, argValue);
                  try {
                    // resolve e.g. "lib/globalize" to "lib/globalize.js"
                    // also resolve any symlinks in the path
                    localFile = require.resolve(localFile);
                  } catch (err) {
                    return;
                  }
                  if (!(localFile in fileEntries)) return;
                  const entry = processSourceFile(
                    localFile,
                    fileEntries,
                    verboseMode
                  );
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
  let moduleExportsGlb = false;
  est.traverse(ast, {
    enter: function enterNode(node, parent) {
      if (
        node.type === 'VariableDeclaration' &&
        (node.kind === 'var' || node.kind === 'let' || node.kind === 'const')
      ) {
        const decls = node.declarations;
        decls.forEach(function(d) {
          if (
            d.type === 'VariableDeclarator' &&
            d.init &&
            (d.init.type === 'CallExpression' ||
              d.init.type === 'NewExpression') &&
            d.init.callee &&
            d.init.callee.type === 'Identifier' &&
            sg.indexOf(d.init.callee.name) >= 0
          ) {
            if (d.id && d.id.type === 'Identifier') {
              glbs.push(d.id.name);
            }
          }
        });
      } else if (node.type === 'ExpressionStatement') {
        // tslint:disable-next-line:no-any
        const exp = node.expression as any;
        const operator = exp.operator;
        const left = exp.left;
        const right = exp.right;
        if (
          operator === '=' &&
          left.type === 'MemberExpression' &&
          left.object.type === 'Identifier' &&
          left.object.name === 'module' &&
          left.property.type === 'Identifier' &&
          left.property.name === 'exports'
        ) {
          const callOrNew =
            right.type === 'CallExpression' || right.type === 'NewExpression';
          moduleExportsGlb =
            callOrNew &&
            right.callee &&
            right.callee.type === 'Identifier' &&
            sg.indexOf(right.callee.name) >= 0;
        }
      }
    },
  });

  if (fileEntries) {
    fileEntries[require.resolve(fileName)].exportsGlb = moduleExportsGlb;
  }

  glbs = sg.concat(glbs);
  const msgs: AnyObject[] = [];

  function recordLiteralPosition(
    nd: Node,
    callee: Expression | Super | string
  ) {
    if (!nd || !nd.type) return;
    if (nd.type === 'Literal' && nd.value && typeof nd.value === 'string') {
      if (!nd.loc) return;
      if (applyExtractionFilter && nd.value.match(extractionFilter)) return;
      const msgLoc = {
        callee: callee,
        msg: helper.PSEUDO_TAG + nd.value,
        loc: nd.loc ? baseName + ':' + nd.loc.start.line.toString() : '',
      };
      msgs.push(msgLoc);
    } else if (nd.type === 'BinaryExpression' && nd.operator === '+') {
      recordLiteralPosition(nd.left, callee);
      recordLiteralPosition(nd.right, callee);
    }
  }

  function composeName(objName: string, propName: string) {
    if (!objName) return propName;
    return objName + '.' + propName;
  }

  // identify expression in style: g.http.f
  function nodeIsFnCall(node: Node): node is CallExpression {
    return (
      node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.object &&
      node.callee.object.type === 'CallExpression' &&
      node.callee.object.callee &&
      node.callee.object.callee.type === 'MemberExpression' &&
      node.callee.object.callee.object &&
      node.callee.object.callee.object.type === 'Identifier' &&
      node.callee.object.callee.property &&
      node.callee.object.callee.property.type === 'Identifier'
    );
  }

  // identify expression in style g.f
  function nodeIsObjCall(node: Node): node is CallExpression {
    return (
      node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.object &&
      (node.callee.object.type === 'Identifier' ||
        node.callee.object.type === 'MemberExpression')
    );
  }

  function nodeIsCallOrNew(node: Node): node is CallExpression | NewExpression {
    return (
      (node.type === 'CallExpression' || node.type === 'NewExpression') &&
      node.callee.type === 'Identifier' &&
      node.callee.name !== 'require'
    );
  }

  function handleSGCall(
    node: CallExpression,
    objName: string,
    propName: string,
    args: Node[]
  ) {
    const ix = glbs.indexOf(objName);

    if (ix >= 0) {
      if (GLB_FN.indexOf(propName) >= 0) {
        const msg = binExpOrLit(args[0]);
        if (!msg) {
          console.log(
            '*** Skipped non-literal argument of "%s" at %s',
            glbs[ix] + '.' + propName,
            fileName +
              (node.callee.loc
                ? ':' + node.callee.loc.start.line.toString()
                : '')
          );
          return;
        }

        let secondArgValue = null;
        if (args[1]) secondArgValue = binExpOrLit(args[1]);
        const literalArg = {
          callee: composeName(objName, propName),
          msg: msg,
          secondArg: secondArgValue,
          loc: node.loc ? baseName + ':' + node.loc.start.line.toString() : '',
        };
        msgs.push(literalArg);
      }
    } else {
      recordLiteralPosition(args[0], composeName(objName, propName));
    }
  }

  est.traverse(ast, {
    enter: function enterNode(node, parent) {
      if (nodeIsObjCall(node)) {
        // tslint:disable-next-line:no-any
        const callee = node.callee as any;
        handleSGCall(
          node,
          callee.object.name,
          callee.property.name,
          node.arguments
        );
      } else if (nodeIsFnCall(node)) {
        // tslint:disable-next-line:no-any
        const callee = node.callee as any;
        handleSGCall(
          node,
          callee.object.callee.object.name,
          callee.property.name,
          node.arguments
        );
      } else if (nodeIsCallOrNew(node)) {
        // tslint:disable-next-line:no-any
        const callee = node.callee as any;
        recordLiteralPosition(node.arguments[0], callee.name);
      }
    },
  });
  return msgs;
}

function binExpOrLit(
  nd: Node
): string | boolean | number | null | RegExp | undefined {
  if (nd.type === 'Literal') return nd.value;
  if (nd.type === 'BinaryExpression' && nd.operator === '+') {
    const left = binExpOrLit(nd.left);
    const right = binExpOrLit(nd.right);
    if (left && right) return `${left}${right}`;
    if (left) return left;
    if (right) return right;
    return null;
  }
  return null;
}
