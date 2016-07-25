#!/usr/bin/env node
// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var fs = require('fs');
var helper = require('../lib/helper');
var path = require('path');

var nodeVersion = process.version.replace(
  /(^v[0-9]+\.[0-9]+)\.[0-9]+$/, '$1');
var fileTypesToRemove = (nodeVersion === 'v0.10') ? 'gz' : 'json';
var cldrPath = path.join(__dirname, '..', 'cldr');

helper.removeRedundantCldrFiles(cldrPath, fileTypesToRemove);
