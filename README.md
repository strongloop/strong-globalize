# strong-globalize

StrongLoop Globalize CLI and API

[![npm version](https://badge.fury.io/js/strong-globalize.svg)](https://badge.fury.io/js/strong-globalize)

* [Architecture](#architecture)
* [Language Config Customization](#language-config-customization)
* [Runtime Language Switching](#runtime-localization-switching)
* [Upgrade from v1.x to v2.0](#upgrade-from-v1x-to-v20)
* [Pseudo Localization Support](#pseudo-localization-support)
* [Deep String Resource Extraction](#deep-string-resource-extraction)
* [Autonomous Message Loading](#autonomous-message-loading)
* [CLI - extract, lint, and translate](#cli---extract-lint-and-translate)
* [API - Set system defaults](#api---set-system-defaults)
	* [SG.SetDefaultLanguage](#sgsetdefaultlanguagelang)
	* [SG.SetRootDir](#sgsetrootdirrootpath)
	* [SG.SetHtmlRegex](#sgsethtmlregexregex-regexhead-regextail)
	* [SG.SetPersistentLogging](#sgsetpersistentlogginglogcallback-disableconsole)
* [API - Formatters](#api---formatters)
	* [g.formatMessage](#gformatmessagepath-variables)
	* [g.t](#gtpath-variables)
	* [g.m](#gmpath-variables)
	* [g.formatCurrency](#gformatcurrencyvalue-currencysymbol-options)
	* [g.c](#gcvalue-currencysymbol-options)
	* [g.formatDate](#gformatdatevalue-options)
	* [g.d](#gdvalue-options)
	* [g.formatNumber](#gformatnumbervalue-options)
	* [g.n](#gnvalue-options)
* [API - Wrappers](#api---wrappers)
	* [g.Error](#gerrorpath-capital-error)
	* [g.format](#gformatpath-)
	* [g.f](#gfpath-)
	* [g.ewrite](#gewritepath-)
	* [g.owrite](#gowritepath-)
	* [g.write](#gwritepath-)
* [API - RFC 5424 Syslog Message Severities](#wrappers-for-rfc-5424-syslog-message-severities)
	* [g.emergency](#gemergencypath-)
	* [g.alert](#galertpath-)
	* [g.critical](#gcriticalpath-)
	* [g.error](#gerrorpath-small-error)
	* [g.warning](#gwarningpath-)
	* [g.notice](#gnoticepath-)
	* [g.informational](#ginformationalpath-)
	* [g.debug](#gdebugpath-)
* [API - Node.js Console](#wrappers-for-nodejs-console)
	* [g.warn](#ghelppath-)
	* [g.info](#gdebugpath-)
	* [g.log](#gdatapath-)
* [API - Misc Logging Levels](#wrappers-for-misc-logging-levels)
	* [g.help](#ghelppath-)
	* [g.debug](#gdebugpath-)
	* [g.data](#gdatapath-)
	* [g.prompt](#gpromptpath-)
	* [g.verbose](#gverbosepath-)
	* [g.input](#ginputpath-)
	* [g.silly](#gsillypath-)
* [Usage Examples](#usage-examples)
	* [use g.f for util.format](#use-gf-for-utilformat)
	* [use g.write for process.stdout.write](#use-gwrite-for-processstdoutwrite)
	* [place holders](#place-holders)
	* [double curly braces not to translate](#double-curly-braces-not-to-translate)
	* [help txt files](#help-txt-files)
	* [help txt files and msg keys](#help-txt-files-and-msg-keys)
	* [manually add message strings](#manually-add-message-strings)
* [Demo](#demo)
* [Demo - Pseudo Localization](#pseudo-localization-demo)
* [Globalize HTML Templates](#globalize-html-templates)
* [Persistent Logging](#persistent-logging)

# Architecture

`strong-globalize` is built on top of two foundation layers: Unicode CLDR and jquery/globalize.  The Unicode CLDR provides key building blocks for software to support the world's languages, with the largest and most extensive standard repository of locale data available.  jquery/globalize is a JavaScript library for internationalization and localization that leverages the Unicode CLDR JSON data. The library works both for the browser and as a Node.js module. 

`strong-globalize` is a JavaScript library for internationalization and localization (globalization in one word) of a Node.js package.  `strong-globalize` provides these features:
- [shorthands and wrappers](#api---formatters) for the format functions supported by Node.js console, jquery/globalize, and util.format,
- [automatic extraction](#cli---extract-lint-and-translate) of the strings from JS code and [HTML templates](#globalize-html-templates) and auto-creation of resource JSON,
- [machine translation](#cli---extract-lint-and-translate) of the resource JSON using [IBM Globalization Pipeline on Bluemix](#liblocal-credentialsjson),
- in [Node.js runtime](#api---set-system-defaults), loads not only the CLDR data sets but the localized string resources of your module as well as all the statically and dynamically dependent modules.
- [function hook for logging](#persistent-logging) localized user messages so that the client can log what is shown to the end user along with the original English message.

As shown in the [Demo section](#demo), the code written with `strong-globalize` is simpler, better structured, and easier to read than the original code written as an English-only product; and more importantly, you get all the features at no extra effort.

With `strong-globalize`, there will be no more 'English product first and worry about localization later'; there will be only one globalized codebase from day one.  If you choose, you can still ship it with a few language resources (or English only) initially and incrementally add, remove, or update the resources and ship anytime as you go.

- supported Node.js versions: 0.10, 0.12, 4.0, 5.0
- supported cldr version: 28.0.3
- out-of-box supported languages: de, en, es, fr, it, ja, ko, pt, ru, zh-Hans, and zh-Hant.

You can customize (add/remove) any languages supported by the Unicode CLDR in your `strong-globalize` installation.

## About Test

The line test coverage with and without core part of translation tests are currently `87%` and `79%` respectively.

With the out-of-box setting, `npm test` runs all tests but the core translation tests because it requires connection to the machine translation service.  To enable the machine translation, please set the environment variables described in [this section](#liblocal-credentialsjson).

With custom setting such as customized language configuration, some tests may fail.  You can edit target messages in the failing test modules to suit your custom setting.  To do so, set DEBUG global variable of test/slt-test-helper.js and run the test, identify the actual error messages, then copy and paste the actual error messages to the failing test modules.

# Language Config Customization

Out of box, one CLDR `gz` file is inculuded in `strong-globalize/cldr` directory.  CLDR stands for Common Locale Data Repository.  The `gz` file contains CLDR data for the languages: de, en, es, fr, it, ja, ko, pt, ru, zh-Hans, and zh-Hant.  In the installation of `strong-globalize` in your package for your production deployment, you can replace the out-of-box `gz` file entirely, or add extra CLDR data to the `cldr` directory.  There are approximtely 450 locales (language/culture variations) defined in the Unicode CLDR v28.  Among them, there are 40+ variations of French and 100+ variations of English.

`strong-globalize` provides a utility tool under util directory.  The tool assembles and compresses only the languages you need to support in your `strong-globalize` installation.  For example, the out-of-box gz file for the 11 languages is 134KB.  See README of the utility under util directory.

In runtime, `string-globalize` dynamically loads to memory just the CLDR data required for the specific language by `setLanguage()`.  First, it examines all the `gz` files under cldr directory in alphabetical order, then searches for the language.  If the language is defined in two or more `gz` files, duplicate objects will be overwritten in the examination order.

## Message String Resource

English string resource files must exist under `intl/en` directory.  Translated string resource files are stored on each language sub-directory under `intl`  If a message is not found in the translated resource files, the corresponding English message is displayed.

CLDR data has no dependencies on string resources.  For example, you can load 100 language CLDR data and no translated string resources but the English string resource.  However, if there is a translated non-English string resource exists for language xx under `intl/xx` the CLDR data for `xx` must be loaded.

# Runtime Language Switching

There are two primary types of Node.js packages `strong-globalize` is targeting:
- Command line interface utility (short life; static language setting) such as [`slt-globalize` itself](#cli---extract-lint-and-translate),
- Web applications such as LoopBack apps (long life; dynamic language switching to respect browser language set in HTTP `Accept-Language` header)

## Common part
```js
var SG = require('strong-globalize');
SG.SetRootDir(__dirname);
SG.SetDefaultLanguage(); // uses the OS language, or falls back to English
var g = SG(); // use the default
```
## Static language setting in CLI utility
```js
// the common part comes here.

// then, use formatters and wrappers API always in the same language
g.log('Welcome!');
```
## Dynamic language switching in Web application

Setting language to `strong-globalize` instance is pretty cheap.  CLDR data set and translated messages are preloaded at the initial use.
```js
// the common part comes here.

// set language first, then, use formatters and wrappers API
g.setLauguage(getAcceptLanguage()); // once per session

g.log('Welcome!');
```
# Upgrade from v1.x to v2.0

Changes to be made to the client source code are minimal.

v1.x:

```js
var g = require('strong-globalize');
g.setRootDir(__dirname);
g.setDefaultLanuage();

// use formatters and wrappers API

g.log('Welcome!');
```
v2.0:

```js
var SG = require('strong-globalize');
SG.SetRootDir(__dirname);
SG.SetDefaultLanuage();
var g = SG({language: 'en'});

// use formatters and wrappers API

g.log('Welcome!');
```

# Pseudo Localization Support

`strong-globalize` has a feature similar to traditional `pseudo localization.`

First, Machine Translation with `slt-globalize -t` can be used like the traditional `pseudo localization.`  See [the CLI - extract, lint, and translate section](#cli---extract-lint-and-translate) for details of `slt-globalize -t` command.

Second, in runtime, set the environment variable `STRONG_GLOBALIZE_PSEUDO_LOC_PREAMBLE` and `strong-globalize` adds the string in front of every message processed by the message formatter.  If you already have translated message files (by machine or human) and set the language, the string is added to every message in that language.

Third, `string-globalize` reserves the language code `zz` as pseudo-language.  `slt-globalize -e` generates `intl/zz/messages.json` and `intl/zz/messages_inverted.json`which show the location of each message extracted from JS files.  If the message is used in multiple locations in the JS source, `slt-globalize -e` generates:
`intl/en/messages.json`:

```
{
  "21610b057179c7177036c1719f8922cc": "user: {0}"
}
```
`intl/zz/messages.json`:
```
{
  "21610b057179c7177036c1719f8922cc": [
    "index.js:8",
    "lib/util.js:12"
  ]
}
```
and, `intl/zz/messages_inverted.json`:
```
{
  "index.js": {
    "8": [
      "21610b057179c7177036c1719f8922cc"
    ]
  },
  "lib/util.js": {
    "12": [
      "21610b057179c7177036c1719f8922cc"
    ]
  }
}
```
See an additional example in the [`pseudo localization demo`](#pseudo-localization-demo) section.

# Deep String Resource Extraction

`strong-globalize` CLI supports string resource auto-extraction in two modes: `regular extraction` mode and `deep extraction` mode.  The regular extraction mode is invoked with `slt-globalize -e` and typically used in package development phase.  The deep extraction mode `slt-globalzie -d` is designed to be used in globalization of enterprise-scale applications.

## Regular Extraction

Suppose you have a package named `gmain` which has two JS files: `index.js` and `lib/util.js` and the two JS files contain the same `g.log('user: %s', userName)` call in line# 8 and line# 12 respectively.  Running `slt-globalize -e` under the application root directory, `/Users/user/gmain` will generate `intl/en/messages.json` and `intl/zz/messages.json` as shown in the [Pseudo Localization Support](#pseudo-localization-support) section.  Note that `slt-globalize -e` extracts all strong-globalized literal strings as well as non-globalized literal string with positional information in to `intl/zz/messages.json`.  It is useful to pin-point untranslated strings in the source code.

In the regular extraction mode, `strong-globalize` scans all JS and Html templates owned by the `gmain` package no mater how deep the directory structure goes -- for example, `gmain/lib/usa/california/sanfrancisco/util.js` is scanned.  However, it does not examine dependent files under `node_modules` or `test` directory.  All `strong-globalized` literal strings in JS and Html files of the target package will be extracted and stored in `intl/en/messages.json` along with the positional information stored in `intl/zz/messages.json`.  All non-strong-globalized literal strings in the first argument of all JS function calls are extracted and stored in `intl/zz/messages.json` along with the positional information.

In runtime, the string resource JSON files under `intl` will be loaded on to memory as needed.

**Use Case**: Self contained CLI utility package is typically code-globalized and distributed with or without translated messages.json.  API library packages are typically code-globalized and distributed without translation.  Such library packages are then downloaded and used as part of enterprise-scale applications.

```
/Users/user
          └── gmain
              ├── index.js
              ├── intl
              │   ├── de
              │   ├── en
              │   ├── es
              │   ├── fr
              │   ├── it
              │   ├── ja
              │   ├── ko
              │   ├── pt
              │   ├── ru
              │   ├── zh-Hans
              │   ├── zh-Hant
              │   └── zz
              ├── lib
              │   └── usa
              │       └── california
              │           └── sanfrancisco
              │               └── util.js
              ├── node_modules
              │   ├── express
              │   ├── request
              │   └── strong-globalize -> /usr/local/lib/node_modules/strong-globalize
              └── package.json
```

## Deep Extraction

Enterprise-scale applications may depend on hundreds of third party packages directly or indirectly.  Such applications typically download dependent packages using `npm install` and can globalize them using the `Deep Extraction` mode.

For example, suppose `gmain` package has one dependent package `gsub` which is installed under `gmain/node_modules` as shown in the directory structure diagram below.  `slt-globalize -d` traverses the `npm v3 style` dependency tree and extracts all the strong-globalized string literals in to `gmain/intl/en/messages.json`.  This way, all the literal strings in your package `gmain` as well as all the dependent modules are extracted and translated consistently at `gmain/intl` level.  Note that the `package.json` dependency traversal is different from simple directory traversal.

In runtime, set `topMsgLoadingOnly` parameter in `SetRootDir` call in the top-level module.  See [topMsgLoadingOnly in runtime](#topmsgloadingonly-in-rutime) for details.

Note that [string resource extraction from Html templates](#globalize-html-templates) is supported in the regular extraction mode only.

## `STRONGLOOP_GLOBALIZE_MAX_DEPTH` environment variable

As the size of your application grows, the number of dependent packages can grow exponentially.  Since non-globalized literal strings are also recorded on `gmain/intl/zz/messages.json`, `gmain/intl/zz/messages.json` may also grow exponentially and cause `slt-globalize -d` to run out of resource of your computer.

To manage such situations, you can set `STRONGLOOP_GLOBALIZE_MAX_DEPTH` environment variable.  `slt-globalize -d` stops traversing at the specified directory depth.  Note that it works as directory depth although the traversal is controlled by `package.json` (production) dependency.

For example, invoking `STRONGLOOP_GLOBALIZE_MAX_DEPTH=3 slt-globalize -d` under `/Users/user/gmain` works as follows.  `gmain/index.js` is depth 1 thus examined.  `gmain/lib/usa/california/sanfrancisco/util.js` is depth 5, not examined although it's part of your `gmain` package.  `gmain/node_modules/gsub/index.js` is level 3, thus examined.  Likewise, all the files directly under `gmain/node_modules/express` and `gmain/node_modules/request` will also be examined and literal strings are extracted in to `gmain/intl/zz/messages.json`.


## `npm v3` dependency resolution

`npm v3` tries to install all dependent packages in the root `node_modules` directory, i.e., `gmain/node_modules` in the above example, which means that most dependent package directories are at depth level 2.  Therefore, `STRONGLOOP_GLOBALIZE_MAX_DEPTH` does not help in `npm v3` installed applications.  `slt-globalize -d [black list]` option can help to reduce the number of packages to scan. 

```
/Users/user
          └── gmain
              ├── index.js
              ├── intl
              │   ├── de
              │   ├── en
              │   ├── es
              │   ├── fr
              │   ├── it
              │   ├── ja
              │   ├── ko
              │   ├── pt
              │   ├── ru
              │   ├── zh-Hans
              │   ├── zh-Hant
              │   └── zz
              ├── lib
              │   └── usa
              │       └── california
              │           └── sanfrancisco
              │               └── util.js
              ├── node_modules
              │   ├── express
              │   ├── gsub
              │   │   ├── index.js
              │   │   ├── node_modules
              │   │   │   └── strong-globalize -> /usr/local/lib/node_modules/strong-globalize
              │   │   └── package.json
              │   ├── request
              │   └── strong-globalize -> /usr/local/lib/node_modules/strong-globalize
              └── package.json
```

# Autonomous Message Loading

All packages are created equal.  `Autonomous Message Loading` is the core concept of `strong-globalize` designed for globalization of modular and highly distributed Nodejs applications.  Two key terminologies are `root directory` and `master root directory`:

`root directory` or simply `rootDir`: the package's current working directory where `intl` directory resides.

`master root directory`: the root directory of the package that called `SG.SetRootDir` first.  Any package in the application can be the `master root directory`.  It's determined solely by the loading order and once the master is chosen, it does not change in the application's life.  Usually, the `master root directory` is the `root directory` of the package at the root of the application's dependency tree.  `slt-globalize -d` must run under the `master root directory` so that all the string resources are stored under the `master root directory's intl/en`. 

Once all the string resource files are deep-extracted and translated at the top level package, the original string resources in the dependencies should not be loaded.  To disable loading the dependencies, set `autonomousMsgLoading` to `none` in the `SetRootDir` call of the top level package.  Since 'none' is the default, simply `SG.SetRootDir(rootDir)` does it.  With regular extraction mode, `{autonomousMsgLoading: 'all'}` must be set instead so that all string resources are loaded from all the dependent packages or set specific package names of which the string resources get loaded.

```js
var SG = require('strong-globalize');
SG.SetRootDir(__dirname, {autonomousMsgLoading: 'none'});
SG.SetDefaultLanuage();
var g = SG({language: 'en'});

// use formatters and wrappers API

g.log('Welcome!');
```

For example, the following does not work as intended because the package sub calls `SG.SetRootDir` first:

```js
// main/index.js -- my root package
// all string resources are deep extracted and translated under intl of this package
var MY_SUB = require('sub');
var SG = require('strong-globalize');

SG.SetRootDir(__dirname);
SG.SetDefaultLanuage();
var g = SG();

...
```
```
// sub/index.js -- my sub package
var request = require('request');
var SG = require('strong-globalize');

SG.SetRootDir(__dirname);
var g = SG();

...

```

The 'MUST' coding practice is to call `SG.SetRootDir` in the very first line of the main module:

```js
// main/index.js -- my root package
// all string resources are deep extracted and translated under intl of this package
var SG = require('strong-globalize');
SG.SetRootDir(__dirname);
var MY_SUB = require('sub');

SG.SetDefaultLanuage();
var g = SG();

...
```
```
// sub/index.js -- my sub package
var SG = require('strong-globalize');
SG.SetRootDir(__dirname);
var request = require('request');

var g = SG();

...

```




# CLI - extract, lint, and translate

## `npm install -g strong-globalize`

You can safely ignore these warnings because `strong-globalize` statically bundles cldr-data for production use.
```js
npm WARN EPEERINVALID globalize@1.1.1 requires a peer of cldr-data@>=25 but none was installed.
npm WARN EPEERINVALID cldrjs@0.4.4 requires a peer of cldr-data@>=25 but none was installed.
```
You can safely ignore this warning on Node.js 0.12, 4.0 or 5.0.
```js
npm WARN engine node-zlib-backport@0.11.15: wanted: {"node":">=0.10 <0.11"} ...
```

### usage: `slt-globalize [options]`

Options:
-  `-d,--deepextract [black list]`  Deep-extract resource strings.
-  `-e,--extract [black list]`      Extract resource strings to en/messages.json except for directories on [black list] separated by a space.
-  `-h,--help`         Print this message and exit.
-  `-l,--lint`         Check validity of string resource.
-  `-t,--translate`    Translate string resource.
-  `-v,--version`      Print version and exit.

## lib/local-credentials.json

To access Globalization Pipeline on Bluemix service for machine translation, credentials should be provided in one of the two ways:

(1) By lib/local-credentials.json

Copy from the service dashboard and paste something like the following into lib/local-credentials.json.

```js
{
  "credentials": {
    "url": "https://gp-beta-rest.ng.bluemix.net/translate/rest",
    "userId": "6e41ceac9f14b493faxxxxxxxxxxxxxx",
    "password": "vLbqlkjPhJiwJlkjwou8woO82hk2huku",
    "instanceId": "6888888888888e6d2f458b1b4b5fd010"
  }
}
```

(2) By environment variables

For example,

```js
BLUEMIX_URL="https://gp-beta-rest.ng.bluemix.net/translate/rest"
BLUEMIX_USER=6e41ceac9f14b493faxxxxxxxxxxxxxx
BLUEMIX_PASSWORD=vLbqlkjPhJiwJlkjwou8woO82hk2huku
BLUEMIX_INSTANCE=6888888888888e6d2f458b1b4b5fd010
slt-globalize -t
```


# API - Set system defaults

### `var SG = require('strong-globalize);`

## `SG.SetRootDir(rootPath, options)`
- `rootPath` : {`string`} App's root directory full path.  Every client must set its root directory where `package.json` and `intl` directory exist.  All resources under this directory including dependent modules are loaded in runtime.  `SetRootDir` must be called once and only once.
- `options` : {autonomousMsgLoading: ['`none`' | '`all`' | <an array of `strings`]} (optional)
'`none`' (default) -- load string resources at the master rootDir, but not load from dependency packages
'`all`' -- load string resources from all packages
<an array of `strings`> -- load string resources at the master rootDir and the specified packages if the master package depends on them.

## `SG.SetDefaultLanguage(lang)`
- `lang` : {`string`} (optional) Language ID such as de, en, es, fr, it, ja, ko, pt, ru, zh-Hans, and zh-Hant.  If omitted, `strong-globalize` tries to use the OS language, then falls back to 'en'  It must be called at least once.  Can be called multiple times.

`strong-globalize` uses the language code in a form of a combination of ISO 639-1 language code and ISO 15924 script code such as `zh-Hans` for Chinese - Han (Simplified variant).

## `SG.SetHtmlRegex(regex, regexHead, regexTail)`
- `regex` : {`RegExp`} to extract the whole string out of the HTML text
- `regexHead` : {`RegExp`} to trim the head portion from the extracted string
- `regexTail` : {`RegExp`} to trim the tail portion from the extracted string

Most clients do not need to setHtmlRegex.  See [the Globalize HTML Templates section](#globalize-html-templates) for details.


# API - Formatters

### `var g = SG({language: 'en'});`

## `g.formatMessage(path, variables)`
- `path {string}` The message key
- `variables {object}` (optional, default: null) List of placeholder key and content value pair

## `g.t(path, variables)`
alias of `formatMessage`

## `g.m(path, variables)`
alias of `formatMessage`

## `g.formatCurrency(value, currencySymbol, options)`
- `value {number}` integer or float
- `currencySymbol {string}` ISO 4217 three-letter currency code such as `'USD'` for US Dollars 
- `options {object}` (optional) Strongly recommended to set NO options and let `strong-globalize` use the StrongLoop default for consistency across StrongLoop products.

## `g.c(value, currencySymbol, options)`
alias of `formatCurrency`

## `g.formatDate(value, options)`
- `value {Date object}` Date
- `options {object}` (optional) Strongly recommended to set NO options and let `strong-globalize` use the StrongLoop default for consistency across StrongLoop products.

## `g.d(value, options)`
alias of `formatDate`

## `g.formatNumber(value, options)`
- `value {number}` integer or float
- `options {object}` (optional) Strongly recommended to set NO options and let `strong-globalize` use the StrongLoop default for consistency across StrongLoop products.

## `g.n(value, options)`
alias of `formatNumber`

# API - Wrappers

%s place folders are supported.  Intended to directly globalize strings embedded in the first parameter of Error, console.error, console.log, etc. and util.format by simply replacing console or util with require('strong-globalize').

## `g.Error(path, ...)`(capital Error)
returns Error with a formatted message.

## `g.format(path, ...)`
returns the result message from `formatMessage`.  intended to replace util.format.

## `g.f(path, ...)`
alias of `format`

## `g.ewrite(path, ...)`
passes the result message from `formatMessage` to `process.stderr.write`, and log to file with `error` level if persistent logging is set.

## `g.owrite(path, ...)`
passes the result message from `formatMessage` to `process.stdout.write`, and log to file with `info` level if persistent logging is set.

## `g.write(path, ...)`
alias of `owrite`

### Wrappers for RFC 5424 Syslog Message Severities

## `g.emergency(path, ...)`
passes the result message from `formatMessage` to `console.error`, and log to file with `emergency` level if persistent logging is set.

## `g.alert(path, ...)`
passes the result message from `formatMessage` to `console.error`, and log to file with `alert` level if persistent logging is set.

## `g.critical(path, ...)`
passes the result message from `formatMessage` to `console.error`, and log to file with `critical` level if persistent logging is set.

## `g.error(path, ...)`(small error)
passes the result message from `formatMessage` to `console.error`, and log to file with `error` level if persistent logging is set.

## `g.warning(path, ...)`
passes the result message from `formatMessage` to `console.error`, and log to file with `warning` level if persistent logging is set.

## `g.notice(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `notice` level if persistent logging is set.

## `g.informational(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `informational` level if persistent logging is set.

## `g.debug(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `debug` level if persistent logging is set.

### Wrappers for Node.js Console

## `g.warn(path, ...)`
passes the result message from `formatMessage` to `console.error`, and log to file with `warn` level if persistent logging is set.

## `g.info(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `info` level if persistent logging is set.

## `g.log(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `log` level if persistent logging is set.

### Wrappers for Misc Logging Levels

## `g.help(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `help` level if persistent logging is set.

## `g.data(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `data` level if persistent logging is set.

## `g.prompt(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `prompt` level if persistent logging is set.

## `g.verbose(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `verbose` level if persistent logging is set.

## `g.input(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `input` level if persistent logging is set.

## `g.silly(path, ...)`
passes the result message from `formatMessage` to `console.log`, and log to file with `silly` level if persistent logging is set.

# Usage Examples

Rule of thumb for auto-extraction with `slt-globalize -e`:
- String literal defined as the first argument (`path`) of the APIs is extracted.
- String literals concatenated with '+' in the first argument are extracted as a single message.

## use g.f for util.format

before:
```js
Error(util.format('Directory %s does not exist', workingDir));
```
after:
```js
Error(g.f('Directory %s does not exist', workingDir));
```
or
```js
g.Error('Directory %s does not exist', workingDir);
```

## use g.write for process.stdout.write

before:
```js
// don't concatenate string. word order varies from language to language.
process.stdout.write('Directory ' + workingDir + ' does not exist...');
```
wrong: (don't concatenate words;  word order varies from language to language)
```js
process.stdout.write(g.t('Directory ') + workingDir + g.t(' does not exist...'));
```
correct:
```js
g.write('Directory %s does not exist...', workingDir);
```

## place holders
You can use place holders and parameters in one of these four ways if you'd like:

before:
```js
util.format('Deploy %s to %s failed: %s', what, url, err);
```
after
```js
// 1 (recommended; simply replace `util` with `g`)
g.f('Deploy %s to %s failed: %s', what, url, err);
// 2
g.f('Deploy {0} to {1} failed: {2}', [what, url, err]);
// 3
g.f('Deploy {0} to {1} failed: {2}', {0: what, 1: url, 2: err});
// 4
g.f('Deploy {what} to {url} failed: {err}', {what: what, url: url, err: err});
```
When you put placeholders in help txt and msg messages, named or ordered placeholders should be used.  Named placeholder is something like `{userName}`.  Ordered placeholder is `{0}`, `{1}`, `{2}`, etc. which should be zero-base.

## double curly braces not to translate
Use double curly braces {{ }} as "don't translate" indicator.

before:
```js
console.error('Invalid usage (near option \'%s\'), try `%s --help`.', option, cmd);
```
after:
```js
g.error('Invalid usage (near option \'%s\'), try {{`%s --help`}}.', option, cmd);
```

## help txt files

before:
```js
var help = fs.readFileSync(require.resolve('./help.txt'), 'utf-8');
````
after:
```js
var help = g.t('help.txt');
```
and store help.txt file under intl/en.

## help txt files and msg keys

They must be uniquely named because they are used as-is in runtime message database where the messages come from other modules will be merged.  In case there are duplicate *.txt or msg*, it could be overwritten by other module(s) with the same name whichever is loaded later.  Best practice is to use your package name as part of the name.  For example, `msgMyPackage_ErrorMessage`.

The rule of thumb is `strong-globalize` extracts messages from JS and HTML template files and creates the `messages.json` file (or appends extracted messages to the `messages.json` if it exists), but does not edit the help txt files, msg messages, or JS/HTML files provided by the client.

Note that `strong-globalize` supports multiple txt and multiple json files under `intl/--/` directory.

## manually add message strings
`slt-globalize -e` command extracts message strings from your source JS files and HTML templates.  In case translation is needed for strings which are not in the source files, you can manually add them to the resource JSON files.  To manually add message strings to the resource file, use a key that begins with `msg` such as msgPortNumber.  Those keys are kept intact in auto-extraction and the value text will be properly translated.

# Demo

To quickly switch the locale, change the OS's system locale or set `STRONGLOOP_GLOBALIZE_APP_LANGUAGE` environment variable to one of the supported languages such as `ja` for Japanese or `de` for German.

For example, on OSX:

```js
cd gmain
LANG=ja node index.js
```

## `gsub/index.js`

before:

```js
var fs = require('fs');
var util = require('util');

exports.getHelpText = getHelpText;
exports.getUserName = getUserName;

function getUserName() {
  var userName = util.format('user: %s', process.env.USER);
  return userName;
}

function getHelpText() {
  var helpText = fs.readFileSync(require.resolve('./gsub.txt'), 'utf-8');
  return helpText;
}
```
after:
- `var SG = require('strong-globalize');`
- `SG.SetRoonDir( ... );`
- `var g = SG();`
- replace `util` with `g`
- replace `readFile *.txt` with simply `g.t` and move `./gsub.txt` to `./intl/en/gsub.txt`
- then, run `slt-globalize -e` to extract and `slt-globalize -t` to machine translate the string resource.

```js
var SG = require('strong-globalize');
SG.SetRootDir(__dirname);
var g = SG();

exports.getHelpText = getHelpText;
exports.getUserName = getUserName;

function getUserName() {
  var userName = g.f('user: %s', process.env.USER);
  return userName;
}

function getHelpText() {
  return g.t('gsub.txt');
}
```

## `gmain/index.js`

before:

```js
var express = require('express');
var request = require('request');
var app = express();
var util = require('util');
var gsub = require('gsub');

app.get('/', function(req, res) {
  var helloMessage = util.format('%s Hello World', new Date());
  res.end(helloMessage);
});

var port = process.env.PORT || 8123;
app.listen(port, function() {
  console.log('Listening on %s by %s.', port, gsub.getUserName());
});

setInterval(function(){
	process.stdout.write('Sending request to ' + port + '...');
	request('http://localhost:' + port,
		function(error, response, body) {console.log(body);});
},1000);

console.log(gsub.getHelpText());
```
after:
- `var SG = require('strong-globalize');`
- `SG.SetRoonDir( ... );`
- `SG.SetDefaultLanguage( ... );`
- `var g = SG();`
- replace `util` with `g`
- replace `console` with `g`
- replace `process.stdout` with `g`
- wrap `new Date()` with `g.d()`
- then, run `slt-globalize -e` to extract and `slt-globalize -t` to machine translate the string resource.

```js
var express = require('express');
var request = require('request');
var app = express();
var SG = require('strong-globalize');
SG.SetRootDir(__dirname);
SG.SetDefaultLanguage();
var gsub = require('gsub');

var g = SG();

app.get('/', function(req, res) {
  var helloMessage = g.f('%s Hello World', g.d(new Date()));
  res.end(helloMessage);
});

var port = process.env.PORT || 8123;
app.listen(port, function() {
  g.log('Listening on %s by %s.', port, gsub.getUserName());
});

setInterval(function(){
	g.owrite('Sending request to %s ...', port);
	request('http://localhost:' + port,
		function(error, response, body) {console.log(body);});
},1000);

console.log(gsub.getHelpText());
```

## pseudo localization demo

Running `slt-globalize -e` over the above `gmain/index.js` will generate these two messages.json.  Please note that every literal string appears as the first argument of a function call is extracted with its positional information into intl/zz/messages.json.  In the example here, '/' and 'http://localhost' are included in intl/zz/messages.json, but not in intl/en/messages.json because `strong-globalize` text formatter function is not used with the two literals since they should not be translated.

Also note that all the translatable message keys are hashed, but the ones not to be translated show up as readable text and are appended to intl/zz/messages.json.  It can help detect a globalization bug typically in Pseudo Localization Testing.  See the [`Pseudo Localization Support`](#pseudo-localization-support) section for more details.

`intl/en/messages.json`:
```
{
  "6ffc5986cc983ff9c0dc2019e0f57686": "{0} Hello World",
  "9f50ab5d3c2a6a071918321ec156ac04": "Listening on {0} by {1}.",
  "fc20d00d156310f57cfd31d283210b22": "Sending request to {0} ..."
}
```

`intl/zz/messages.json`:
```
{
  "6ffc5986cc983ff9c0dc2019e0f57686": [
    "index.js:12"
  ],
  "9f50ab5d3c2a6a071918321ec156ac04": [
    "index.js:18"
  ],
  "fc20d00d156310f57cfd31d283210b22": [
    "index.js:22"
  ],
  "/": [
    "index.js:11"
  ],
  "http://localhost:": [
    "index.js:23"
  ]
}
```

and, `intl/zz/messages_inverted.json`
```
{
  "index.js": {
    "11": [
      "/"
    ],
    "12": [
      "6ffc5986cc983ff9c0dc2019e0f57686"
    ],
    "18": [
      "9f50ab5d3c2a6a071918321ec156ac04"
    ],
    "22": [
      "fc20d00d156310f57cfd31d283210b22"
    ],
    "23": [
      "http://localhost:"
    ]
  }
}
```

# Globalize HTML Templates

Many UI strings are included in HTML templates.  `slt-globalize -e` supports string extraction from the HTML templates as well as JS files.  Once extracted, `slt-globalize -t` can be used to translate the resource JSON.

In the following example, the two strings `{{StrongLoop}} History Board` and `History board shows the access history to the e-commerce web site.` are extracted to JSON.

```html
<div class="board-header section-header">
	<h2>{{{{StrongLoop}} History Board | globalize}}</h2>
</div>
<div role="help-note">
	<p>
		{{ History board shows the access history to the e-commerce web site. | globalize }}
	</p>
</div>
```

`strong-globalize` supports `{{ <string to be localized> | globalize }}` out of  box.  In case you need other pattern matching rule for your template engine, you can set custom RegExp by `setHtmlRegex` API.

The string extraction works for CDATA as well.  `Text in cdata` is extracted in the following example:

```html
<![CDATA[
	{{Text in cdata | globalize }}
]]>
```

# Persistent Logging

`strong-globalize` provides 'persistent logging' by passing all the localized messages as well as the original English messages to client-supplied callback function.  

## `SG.SetPersistentLogging(logCallback, disableConsole)`
`logCallback` is called when a user message is sent to `stdout` or `stderr` to show to the user.  Two arguments passed to `logCallback` are: `level (string)` and `msg (object)` which has three properties: `message (UTF8 string)` which is the localized message shown to the user, `orig (UTF8 string)` the corresponding original English message with placeholder(s), and `vars (an array of argument(s) for the placeholder(s))`.

```js
{
	language: 'ja',
	message: 'ホスト:localhostのポート:8123へ送っています。',
	orig: 'Sending to host: %s, port: %d ...',
	vars: ['localhost', 8123],
}
```

`disableConsole` (default: `false`) is a boolean to specify whether to send the messsage to `stdout` or `stderr`.  `disableConsole` should be set to `true` in case the client controls the user communication.  For example, if the client uses `winston` file transport for logging, the client code would look like this:

Client:
```js
var SG = require('strong-globalize');
SG.SetRootDir(__dirname);
SG.SetDefaultLanguage();
var g = SG(); // strong-globalize handle
var w = require('winston'); // winston handle
initWinston(w);
// let strong-globalize to show it to the user
var disableConsole = false;
SG.SetPersistentLogging(w.log, disableConsole);

function initWinston(w) {
  var options = {
    filename: __dirname + '/system.log',
    maxsize: 1000000,
    maxFiles: 10,
    zippedArchive: true,
  };
  w.add(w.transports.File, options);
  // let strong-globalize to show it to the user
  w.remove(w.transports.Console);
}
```

## Persistent Logging Demo `gmain/index.js`

```js
var express = require('express');
var request = require('request');
var app = express();
var SG = require('strong-globalize'); 
SG.SetRootDir(__dirname);
SG.SetDefaultLanguage();
var gsub = require('gsub');
var w = require('winston'); // winston handle

var g = SG(); // strong-globalize handle
initWinston(w); // see the Client initialization
var disableConsole = false;
SG.SetPersistentLogging(w.log, disableConsole);

app.get('/', function(req, res) {
  var helloMessage = g.f('%s Hello World', g.d(new Date()));
  w.info(helloMessage); // write only to the log file with 'info' level
  res.end(helloMessage);
});

var port = process.env.PORT || 8123;
app.listen(port, function() {
  g.log('Listening on %s by %s.', port, gsub.getUserName());
});

setInterval(function(){
	g.owrite('Sending request to %s ...', port);
	request('http://localhost:' + port,
		function(error, response, body) {console.log(body);});
},1000);

g.info(gsub.getHelpText()); // write to both console and the log file with 'info' level
```

Note:
`w.info(helloMessage)` directly calls the winston API `info` and write `helpMessage` to the log file.
`g.info(gsub.getHelpText())` writes the localized help text to both console and the log file with `info` level.  The other `strong-globalize` API calls, i.e., `g.log` and `g.owrite` also write the localized message to both console and the log file with `info` level.
