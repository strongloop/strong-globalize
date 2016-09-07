exports.SG1 = function(SG) {
  return SG;
}

exports.SG2 = function(SG) {
  return SG();
}

exports = module.exports = exports.SG1;
