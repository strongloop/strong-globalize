var SG = require('strong-globalize');
SG.SetRootDir(__dirname);
var g = new SG();

const data1 = {firstName: 'John', lastName: 'Doe'};
const data2 = {
  ...data1,
  city: 'Montreal',
  province: 'Quebec',
  country: 'Canada',
};
console.log(
  g.f(
    '%s %s lives in %s, %s, %s',
    data2.firstName,
    data2.lastName,
    data2.city,
    data2.province,
    data2.country
  )
);
