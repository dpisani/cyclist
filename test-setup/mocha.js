const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

before(() => {
  chai.use(chaiAsPromised);
});
