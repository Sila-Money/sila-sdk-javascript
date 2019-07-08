/* eslint-disable func-names */
import * as assert from 'assert';
import Web3 from 'web3';
// import { createSecureServer } from 'http2';
import sila from '../src/index';

// const awsParamStore = require('aws-param-store');

// const params = awsParamStore.getParameter('PROD-PlaidQuery');

// console.log(params);

// const plaid = require('plaid');
// const plaidClient = new plaid.Client('Plaid Walkthrough Demo', )

const web3 = new Web3('TESTNET ADDRESS GOES HERE');

sila.configure({
  key: 'REPLACE WITH A VALID KEY', // Add your private key here. USE ENV VARIABLE
  handle: 'REPLACE WITH A VALID HANDLE', // Add your app handle here
});

const checkHandleTests = [
  { input: 'abc', expectedResult: 'SUCCESS', description: '"abc.silamoney.eth" should be available.' },
  { input: 'root', expectedResult: 'FAILURE', description: '"root.silamoney.eth" is a reserved handle.' },
];

const wallets = [
  web3.eth.accounts.create(),
  web3.eth.accounts.create(),
];

console.log(wallets);

const salt = Math.random().toString(36).substring(7);

const createEntityTests = [
  // Add your tests here ...
  {
    input: {
      first_name: 'First', last_name: 'Last', handle: `${salt}_test_1`, address: '123 Main St', city: 'Anytown', state: 'NY', zip: '12345', phone: '1234567890', email: 'test_1@silamoney.com', dob: '1990-01-01', ssn: '1234562222', crypto: wallets[0].address, private_key: wallets[0].privateKey,
    },
    expectedResult: 'SUCCESS',
    description: 'Valid registration test for test_1.silamoney.eth',
  },
];

const checkKYCTests = [
  {
    handle: 'root',
    expectedResult: 'FAILURE',
    description: 'Root should not be KYCd',
  },
  {
    handle: `${salt}_test_1`,
    expectedResult: 'FAILURE',
    description: `${salt}_test_1 should not be done with KYC yet`,
  },
  // @todo: add tests for failing KYC
];

describe('Check Handle', function () {
  this.timeout(15000);
  checkHandleTests.forEach((sample) => {
    it(sample.description, () => {
      return sila.checkHandle(sample.input)
        .then((res) => {
          assert.equal(res.status, sample.expectedResult);
        }).catch((err) => {
          assert.fail(err);
        });
    });
  });
});

describe('Register', function () {
  this.timeout(30000);
  createEntityTests.forEach((sample) => {
    it(sample.description, () => {
      return sila.register(sample.input)
        .then((res) => {
          assert.equal(res.status, sample.expectedResult);
        }).catch((err) => {
          assert.fail(err);
        });
    });
  });
});

describe('Check KYC', function () {
  this.timeout(15000);
  checkKYCTests.forEach((test) => {
    it(test.description, () => {
      return sila.register(test.handle)
        .then((res) => {
          assert.equal(res.status, test.expectedResult);
        }).catch((err) => {
          assert.fail(err);
        });
    });
  });
});
