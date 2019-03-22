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

const web3 = new Web3('http://52.13.246.239:8080/');

sila.configure({
  key: '1AEE6A73F758ABAC123459F0F051C1629EFC9FFE9F0C1382FC035BE52891956AF16AC7DE08ABB49F41F0E2D94719940AD34DF4487940987A95AD154B54D60D8A',
  handle: 'shamir.silamoney.eth',
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
  {
    input: {
      first_name: 'SDK', last_name: 'Test_1', handle: `${salt}_test_1`, address: '34258 Iris Cir', city: 'Philomath', state: 'OR', zip: '97370', phone: '1234567890', email: 'test_1@silamoney.com', dob: '1983-09-28', ssn: '1234567890', crypto: wallets[0].address, private_key: wallets[0].privateKey,
    },
    expectedResult: 'SUCCESS',
    description: 'Valid registration test for test_1.silamoney.eth',
  },
  // {
  //   input: {
  //     first_name: 'SDK', last_name: 'Test_2', handle: `${salt}_test_2`, address: '34258 Iris Cir', city: 'Philomath', state: 'OR', zip: '97370', phone: '1234567890', email: 'test_2@silamoney.com', dob: '1983-09-28', ssn: '1234567890', crypto: wallets[0].address, private_key: wallets[0].privateKey,
  //   },
  //   expectedResult: 'FAILURE',
  //   description: 'Attempted duplicate registration for test_2 with same Crypto Key as test_1',
  // },
  {
    input: {
      first_name: 'SDK', last_name: 'Test_2', handle: `${salt}_test_2`, address: '34258 Iris Cir', city: 'Philomath', state: 'Oregon', zip: '97370', phone: '1234567890', email: 'test_1@silamoney.com', dob: '1983-09-28', ssn: '1234567890', crypto: wallets[1].address, private_key: wallets[1].privateKey,
    },
    expectedResult: 'FAILURE',
    description: 'Attempted to register with invalid State format',
  },
  {
    input: {
      first_name: 'SDK', last_name: 'Test_2', handle: `${salt}_test_2`, address: '34258 Iris Cir', city: 'Philomath', state: 'Oregon', zip: '97370', phone: '1234567890', ssn: '1234567890', email: 'test_1@silamoney.com', crypto: wallets[1].address, private_key: wallets[1].privateKey,
    },
    expectedResult: 'FAILURE',
    description: 'Attempted to register without DOB',
  },
  {
    input: {
      first_name: 'SDK', last_name: 'Test_2', handle: `${salt}_test_2`, address: '34258 Iris Cir', city: 'Philomath', state: 'OR', zip: '97370', phone: '1234567890', email: 'test_1@silamoney.com', dob: '1983-09-28', ssn: '1234567890', crypto: wallets[1].address, private_key: wallets[1].privateKey,
    },
    expectedResult: 'SUCCESS',
    description: 'Another valid registration for test_2',
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
