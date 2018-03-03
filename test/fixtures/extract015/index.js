var SG = require('strong-globalize');
SG.SetRootDir(__dirname);
var g = SG();
var gsub = require('gsub');

console.log(gsub.getHelpText());
console.log(gsub.getHelpTextWithHashCode());
var req = {
  headers: {
    'accept-language': 'en'
  }
};

console.log(g.http(req).f('User name is %s.', gsub.getUserName()));
