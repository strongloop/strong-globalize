var SG = require('strong-globalize');
SG.SetRootDir(__dirname);
var g = SG();

function fn(name) {
  return name;
}
var fileName = fn('data/data.yml');

var json = g.t('data/dataNonExistent.yml',
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
json = g.t('data/data.yml'); // missing field array
json = g.t('data/data.yml', // broken field array
  '[[][');
json = g.t('data/data.yml',
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
