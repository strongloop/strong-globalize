var SG = require('strong-globalize');
SG.SetRootDir(__dirname);
var g = SG();
var gsub = require('gsub');

console.log(gsub.getHelpText());
console.log(gsub.getHelpTextWithHashCode());
console.log(g.f('User name is %s.', gsub.getUserName()));
