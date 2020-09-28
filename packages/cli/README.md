# strong-globalize-cli

This module provides CLI tooling for globalization.

## Supported Node.js versions

Node 10.x latest version and above are supported.

## Overview

The CLI ships `slt-globalize` command to perform common tasks to globalize
JavaScript applications. Key features are:

- Extract: parse JavaScript source code to extract text messages that should be
globalized.

- Lint: validate message files to check possible issues.

- Translate: Use [IBM Globalization Pipeline](https://www.ibm.com/cloud/globalization-pipeline) to translate text messages

## Installation

To install the CLI, run `npm i -g strong-globalize-cli`. After that, you should
be able to use `slt-globalize` command.

## Basic use

### Usage: `slt-globalize [options]`

```
Options:
  -h, --help                      Print this message and exit
  -v, --version                   Print version and exit
  -l, --lint                      Check validity of string resource
  -t, --translate                 Translate string resource
  -d, --deepextract <black list>  Deep-extract resource strings
  -e, --extract <black list>      Extract resource strings to en/messages.json except for directories on [black list] separated by a space.
```

### Configure access to Globalization Pipeline on IBM Cloud

To access [Globalization Pipeline on IBM Cloud](https://console.bluemix.net/catalog/services/globalization-pipeline) for machine translation, credentials should be provided in one of the two ways:

- By `<HOME_DIRECTORY>/.strong-globalize/ibm-cloud-credentials.json`

Copy and paste your credentials look like the following from the dashboard of Globalization Pipeline on IBM Cloud into `<HOME_DIRECTORY>/.strong-globalize/ibm-cloud-credentials.json`.

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

- By environment variables

For example,

```sh
export BLUEMIX_URL="https://gp-beta-rest.ng.bluemix.net/translate/rest"
export BLUEMIX_USER=6e41ceac9f14b493faxxxxxxxxxxxxxx
export BLUEMIX_PASSWORD=vLbqlkjPhJiwJlkjwou8woO82hk2huku
export BLUEMIX_INSTANCE=6888888888888e6d2f458b1b4b5fd010
slt-globalize -t
```

Please see [Other Resources](#other-resources) for step-by-step instructions to set up the service.

## Tests

`npm run test`

## String resource extraction

`strong-globalize` CLI supports string resource auto-extraction in two modes: `regular extraction` mode and `deep extraction` mode.  The regular extraction mode is invoked with `slt-globalize -e` and typically used in package development phase.  The deep extraction mode `slt-globalzie -d` is designed to be used in globalization of enterprise-scale applications.

### Regular extraction

Suppose you have a package named `gmain` which has two JS files: `index.js` and `lib/util.js` and the two JS files contain the same `g.log('user: %s', userName)` call in line# 8 and line# 12 respectively.  Running `slt-globalize -e` under the application root directory, `/Users/user/gmain` will generate `intl/en/messages.json` and `intl/zz/messages.json` as shown in the [Pseudo Localization Support](#pseudo-localization-support) section.  Note that `slt-globalize -e` extracts all strong-globalized literal strings as well as non-globalized literal string with positional information in to `intl/zz/messages.json`.  It is useful to pin-point untranslated strings in the source code.

In the regular extraction mode, `strong-globalize` scans all JS and Html templates owned by the `gmain` package no matter how deep the directory structure goes -- for example, `gmain/lib/usa/california/sanfrancisco/util.js` is scanned.  However, it does not examine dependent files under `node_modules` or `test` directory.  All `strong-globalized` literal strings in JS and Html files of the target package will be extracted and stored in `intl/en/messages.json` along with the positional information stored in `intl/zz/messages.json`.  All non-strong-globalized literal strings in the first argument of all JS function calls are extracted and stored in `intl/zz/messages.json` along with the positional information.

In runtime, the string resource JSON files under `intl` will be loaded on to memory as needed.

**Use Case**: Self-contained CLI utility package is typically code-globalized and distributed with or without translated messages.json.  API library packages are typically code-globalized and distributed without translation.  Such library packages are then downloaded and used as part of enterprise-scale applications.

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

#### Use `@strong-globalize` comment

Sometimes it's hard for the CLI to determine if a given variable is an instance
of `StrongGlobalize` so that usage of such variables are subject to message
extraction.

To explicitly mark a variable as an instance of `StrongGlobalize`, use
`@strong-globalize` comment:

```ts
// @strong-globalize
import g from 'strong-globalize';

// Now the usage of `g.*` is enabled for message extraction
console.log(g.f('English Text'));
```

To explicitly mark an argument of a function call to be globalized, we can use
`@globalize` or `@strong-globalize` comment.

```js
const gUtil = require('your-helper-for-strong-globalize');

// @globalize
const msg = gUtil.f('abc');
// @globalize
gUtil.log('abc');
```

### Deep extraction

Enterprise-scale applications may depend on dozens of third party packages directly or indirectly.  Such applications typically download dependent packages using `npm install` and can globalize them using the `Deep Extraction` mode.

For example, suppose `gmain` package has one dependent package `gsub` which is installed under `gmain/node_modules` as shown in the directory structure diagram below.  `slt-globalize -d` traverses the `npm v3 style` dependency tree and extracts all the strong-globalized string literals into `gmain/intl/en/messages.json`.  This way, all the literal strings in your package `gmain` as well as all the dependent modules are extracted and can be translated consistently at `gmain/intl` level.  Note that the `package.json` dependency traversal is different from simple directory traversal.

Note that [string resource extraction from Html templates](#globalize-html-templates) is supported in the regular extraction mode only.

### `STRONGLOOP_GLOBALIZE_MAX_DEPTH` environment variable

As the size of your application grows, the number of dependent packages can grow exponentially.  Since non-globalized literal strings are also recorded on `gmain/intl/zz/messages.json`, `gmain/intl/zz/messages.json` may also grow exponentially and cause `slt-globalize -d` to run out of resource on your computer.

To manage such situations, you can set `STRONGLOOP_GLOBALIZE_MAX_DEPTH` environment variable.  `slt-globalize -d` stops traversing at the specified directory depth.  Note that it works as directory depth although the traversal is controlled by dependencies defined in `package.json`.

For example, invoking `STRONGLOOP_GLOBALIZE_MAX_DEPTH=3 slt-globalize -d` under `/Users/user/gmain` works as follows.  `gmain/index.js` is depth 1; thus examined.  `gmain/lib/usa/california/sanfrancisco/util.js` is depth 5, not examined although it's part of your `gmain` package.  `gmain/node_modules/gsub/index.js` is level 3, thus examined.  Likewise, all the files directly under `gmain/node_modules/express` and `gmain/node_modules/request` will also be examined and literal strings are extracted to `gmain/intl/zz/messages.json`.

### `npm v3` dependency resolution

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

### HTML Template Globalization

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

`strong-globalize` supports `{{ <string to be localized> | globalize }}` out of box.  In case you need other pattern matching rule for your template engine, you can set custom RegExp by `setHtmlRegex` API.

The string extraction works for CDATA as well.  `Text in cdata` is extracted in the following example:

```html
<![CDATA[
  {{Text in cdata | globalize }}
]]>
```

### JSON YAML File Globalization

You can directly pass the file name of JSON or YAML file and a list of fields to `g.t` or `g.formatMessage`.  The file name is a path relative to the root directory of the package.  The list of the fields is a string notation of two dimensional array being a list of the values to globalize.  In the sample code below, `data.json` is the JSON file and `index.js` shows how to globalize all fields of `data.json`.  `g.t` loads the globalized object into memory which is usually done by `require(<file name>)` or `fs.readFile` followed by `JSON.parse`.  Note that the file name and the list must be provided as string literals directly in `g.t` call.   YAML file globalization works in exactly the same way.

Note that `strong-globalize` supports [traditional message key approach](#help-txt-files-and-msg-keys) as well.  To take the message key approach in JSON file globalization, manually define a message key like `msgKey`, store the key and content value pair in `intl/en/messages.json`, then in run-time, load the JSON file as usual (`require` or `readFile & parse`) first and overwrite the value with g.t('msgKey').

[Plain text file globalization](#help-txt-files) works in the same way except that 1. the text file name is a path relative to `intl/en` of the package, and 2. since the entire text file is a message, there are no parameters equivalent to the field list.

In the above paragraphs, `g.f` can be used instead of `g.t` if you'd like.

`test/fixtures/extract007' is the YAML equivalent.  Likewise, `test/fixtures/formatyaml001` is the parallel of `test/fixtures/formatjson001`.

```js
// test/fixtures/extract006/index.js
const SG = require('strong-globalize');
SG.SetRootDir(__dirname);
const g = new SG();

const json = g.t('data/data.json',
  '[' +
  '  "title",' +
  '  ["types", 0],' +
  '  ["types", 1],' +
  '  ["types", 2],' +
  '  ["types", 3],' +
  '  ["threeWrites", "e"],' +
  '  ["threeWrites", "o"],' +
  '  ["threeWrites", "w"]' +
  ']');
console.log(JSON.stringify(json, null, 2));
```

`test/fixtures/extract006/data/data.json`
```js
{
    "title": "This is an error.",
    "types": ["error", "log", "info", "warn"],
    "threeWrites" : {
      "e": "ewrite",
      "o": "owrite",
      "w": "write"
    }
}

```
```
 test/fixtures/extract006
                        ├── data
                        │   └── data.json
                        ├── index.js
                        ├── intl
                        │   ├── de
                        │   │   └── messages.json
                        │   ├── en
                        │   │   └── messages.json
                        │   ├── es
                        │   │   └── messages.json
                        │   ├── fr
                        │   │   └── messages.json
                        │   ├── it
                        │   │   └── messages.json
                        │   ├── ja
                        │   │   └── messages.json
                        │   ├── ko
                        │   │   └── messages.json
                        │   ├── pt
                        │   │   └── messages.json
                        │   ├── ru
                        │   ├── zh-Hans
                        │   │   └── messages.json
                        │   ├── zh-Hant
                        │   │   └── messages.json
                        │   └── zz
                        │       ├── messages.json
                        │       └── messages_inverted.json
                        ├── node_modules
                        │   └── strong-globalize
                        │       ├── ...
                        │       ...
                        │
                        └── package.json
```

# Other Resources

- https://github.com/Setogit/sg-example-001-date-currency

  A complete strong-globalized application with machine-translated messages.  In addition to message formatting, date and currency formatting examples are included.  You can install and quickly see how the strong-globalized (or SG'ed in short) app works.  Just install and `node index.js`

- https://github.com/Setogit/sg-example-002-glob-pipeline

  Detailed 15-step instruction with 15 screen-shots to set up IBM Globalization Pipeline on Bluemix


## License

Artistic License 2.0

