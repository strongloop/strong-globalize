var SG = require('strong-globalize');
SG.SetRootDir(__dirname);
var g = new SG();
var gsub = require('gsub');

async function test() {
  g.log(gsub.getHelpText());
  g.log(g.f('User name is %s.', gsub.getUserName()));
  await Promise.resolve(true);
}
