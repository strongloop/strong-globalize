var SG = require('strong-globalize');
SG.SetRootDir(__dirname);
var g = SG();

function fn(name) {
  return name;
}
var fileName = fn('data/data.yaml');

var json = g.t('data/dataNonExistent.yaml',
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
json = g.t('data/data.yaml'); // missing field array
json = g.t('data/data.yaml', // broken field array
  '[[][');
json = g.t('data/data.yaml',
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
