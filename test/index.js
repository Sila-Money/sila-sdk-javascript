/* eslint-disable func-names */
import { assert } from 'chai';
import regeneratorRuntime from 'regenerator-runtime'; // eslint-disable-line no-unused-vars
import request from 'request';
import uuid4 from 'uuid4';
import sila from '../src/index';

const sleep = (ms, description) => {
  console.log(`${description} waiting for ${ms / 1000} seconds`);
  return new Promise((resolve) => setTimeout(resolve, ms));
};

sila.configure({
  key: process.env.SILA_PRIVATE_KEY, // Add your private key here. USE ENV VARIABLE
  handle: 'digital_geko_e2e.silamoney.eth', // Add your app handle here
});

const invalidWallet = sila.generateWallet();
invalidWallet.privateKey = process.env.SILA_PRIVATE_KEY;

const wallets = [
  sila.generateWallet(),
  sila.generateWallet(),
  sila.generateWallet(),
  sila.generateWallet(),
  sila.generateWallet(),
];

console.log(wallets);

const handles = [
  `nodeSDK-${uuid4()}`,
  `nodeSDK-${uuid4()}`,
  `nodeSDK-${uuid4()}`,
  `nodeSDK-${uuid4()}`,
];

const firstUser = new sila.User();
firstUser.firstName = 'First';
firstUser.lastName = 'Last';
firstUser.address = '123 Main St';
firstUser.city = 'Anytown';
firstUser.state = 'NY';
firstUser.zip = '12345';
firstUser.phone = '1234567890';
firstUser.email = 'test_1@silamoney.com';
firstUser.dateOfBirth = '1990-01-01';
firstUser.ssn = '123456222';
firstUser.cryptoAddress = wallets[0].address;

const secondUser = Object.assign({}, firstUser);
secondUser.firstName = 'Second';
secondUser.email = 'test_2@silamoney.com';
secondUser.cryptoAddress = wallets[1].address;

const thirdUser = Object.assign({}, firstUser);
thirdUser.firstName = 'Fail';
thirdUser.email = 'fail@silamoney.com';
thirdUser.cryptoAddress = wallets[2].address;

const fourthUser = Object.assign({}, firstUser);
fourthUser.firstName = 'Fourth';
fourthUser.email = 'test_3@silamoney.com';
fourthUser.cryptoAddress = wallets[4].address;

[
  firstUser.handle,
  secondUser.handle,
  thirdUser.handle,
  fourthUser.handle,
] = handles;

const plaidToken = () => {
  const promise = new Promise((resolve) => {
    const requestBody = {
      public_key: 'fa9dd19eb40982275785b09760ab79',
      initial_products: ['transactions'],
      institution_id: 'ins_109508',
      credentials: {
        username: 'user_good',
        password: 'pass_good',
      },
    };

    const options = {
      uri: 'https://sandbox.plaid.com/link/item/create',
      json: true,
      body: requestBody,
    };

    request.post(options, (err, response, body) => {
      if (err) {
        resolve({});
      }
      const token = body.public_token;
      const accountId = body.accounts[0].account_id;

      resolve({ token, accountId });
    });
  });
  return promise;
};

const checkHandleTests = [
  {
    input: handles[0],
    expectedResult: 'SUCCESS',
    statusCode: 200,
    description: `"${handles[0]}.silamoney.eth" should be available.`,
  },
  {
    input: handles[1],
    expectedResult: 'SUCCESS',
    statusCode: 200,
    description: `"${handles[1]}.silamoney.eth" should be available.`,
  },
  {
    input: handles[2],
    expectedResult: 'SUCCESS',
    statusCode: 200,
    description: `"${handles[2]}.silamoney.eth" should be available.`,
  },
  {
    input: handles[3],
    expectedResult: 'SUCCESS',
    statusCode: 200,
    description: `"${handles[3]}.silamoney.eth" should be available.`,
  },
];

const createEntityTests = [
  {
    input: firstUser,
    expectedResult: 'SUCCESS',
    statusCode: 200,
    description: `Valid registration test for ${handles[0]}.silamoney.eth`,
  },
  {
    input: secondUser,
    expectedResult: 'SUCCESS',
    statusCode: 200,
    description: `Valid registration test for ${handles[1]}.silamoney.eth`,
  },
  {
    input: thirdUser,
    expectedResult: 'SUCCESS',
    statusCode: 200,
    description: `Valid registration test for ${handles[2]}.silamoney.eth`,
  },
  {
    input: firstUser,
    expectedResult: 'FAILURE',
    statusCode: 400,
    description: `Invalid registration test for ${handles[0]}.silamoney.eth`,
  },
  {
    input: fourthUser,
    expectedResult: 'SUCCESS',
    statusCode: 200,
    description: `Valid registration test for ${handles[3]}.silamoney.eth`,
  },
];

const checkHandleTakenTests = [
  {
    input: handles[0],
    expectedResult: 'FAILURE',
    statusCode: 200,
    description: `"${handles[0]}.silamoney.eth" should be taken.`,
  },
  {
    input: handles[1],
    expectedResult: 'FAILURE',
    statusCode: 200,
    description: `"${handles[1]}.silamoney.eth" should be taken.`,
  },
  {
    input: handles[2],
    expectedResult: 'FAILURE',
    statusCode: 200,
    description: `"${handles[2]}.silamoney.eth" should be taken.`,
  },
  {
    input: handles[3],
    expectedResult: 'FAILURE',
    statusCode: 200,
    description: `"${handles[3]}.silamoney.eth" should be taken.`,
  },
];

const requestKYCTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    expectedResult: 'SUCCESS',
    statusCode: 200,
    description: `"${handles[0]}.silamoney.eth" should be sent for KYC check.`,
  },
  {
    handle: handles[1],
    key: wallets[1].privateKey,
    expectedResult: 'SUCCESS',
    statusCode: 200,
    description: `"${handles[1]}.silamoney.eth" should be sent for KYC check.`,
  },
  {
    handle: handles[2],
    key: wallets[2].privateKey,
    expectedResult: 'SUCCESS',
    statusCode: 200,
    description: `"${handles[2]}.silamoney.eth" should be sent for KYC check.`,
  },
  {
    handle: handles[3],
    key: wallets[4].privateKey,
    expectedResult: 'SUCCESS',
    statusCode: 200,
    description: `"${handles[3]}.silamoney.eth" should be sent for KYC check.`,
  },
];

const checkKYCTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    statusCode: 200,
    expectedResult: 'SUCCESS',
    messageRegex: /\bpassed\b/,
    description: `"${handles[0]}.silamoney.eth" should pass KYC check.`,
  },
  {
    handle: handles[1],
    key: wallets[1].privateKey,
    statusCode: 200,
    expectedResult: 'SUCCESS',
    messageRegex: /\bpassed\b/,
    description: `"${handles[1]}.silamoney.eth" should pass KYC check.`,
  },
  {
    handle: handles[2],
    key: wallets[2].privateKey,
    statusCode: 200,
    expectedResult: 'FAILURE',
    messageRegex: /\bfailed\b/,
    description: `"${handles[2]}.silamoney.eth" should fail KYC check.`,
  },
  {
    handle: handles[3],
    key: wallets[4].privateKey,
    statusCode: 200,
    expectedResult: 'SUCCESS',
    messageRegex: /\bpassed\b/,
    description: `"${handles[3]}.silamoney.eth" should pass KYC check.`,
  },
];

const requestKYCLevelTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    expectedResult: 'FAILURE',
    kyc_level: uuid4(),
    statusCode: 403,
    messageRegex: /\bKYC flow/,
    description: 'Random kyc_level should fail requestKYC',
  },
];

const linkAccountDirectTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    accountNumber: '123456789012',
    routingNumber: '123456789',
    accountName: 'sync_direct',
    expectedResult: 'SUCCESS',
    messageRegex: /manually linked/,
    statusCode: 200,
    description: 'Direct bank account link should be successful',
  },
];

const linkAccountTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    expectedResult: 'SUCCESS',
    statusCode: 200,
    messageRegex: /successfully linked/,
    description: `"${handles[0]}" should link account through plaid token`,
    withAccountId: false,
  },
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    token: `public-sandbox-${uuid4()}`,
    expectedResult: 'FAILURE',
    statusCode: 400,
    messageRegex: /public token is in an invalid format/,
    description: 'Random plaid token should fail link account',
    withAccountId: false,
  },
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    accountName: 'sync_by_id',
    expectedResult: 'SUCCESS',
    statusCode: 200,
    messageRegex: /successfully linked/,
    description: `"${handles[0]}" should link account with plaid token and account id`,
    withAccountId: true,
  },
  {
    handle: handles[1],
    key: wallets[1].privateKey,
    expectedResult: 'SUCCESS',
    statusCode: 200,
    messageRegex: /successfully linked/,
    description: `"${handles[1]}" should link account through plaid token`,
    withAccountId: false,
  },
  {
    handle: handles[3],
    key: wallets[4].privateKey,
    expectedResult: 'SUCCESS',
    statusCode: 200,
    messageRegex: /successfully linked/,
    description: `"${handles[3]}" should link account through plaid token`,
    withAccountId: false,
  },
];

const getAccountsTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    statusCode: 200,
    accounts: 3,
    description: `"${handles[0]}" should retrieve all accounts`,
  },
];

const getAccountBalanceTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    accountName: 'default',
    statusCode: 200,
    expectedResult: true,
    description: `${handles[0]} should retrieve default account balance`,
  },
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    accountName: 'sync_direct',
    statusCode: 400,
    expectedResult: false,
    description: `${handles[0]} should fail retrieve direct link account balance`,
  },
];

const registerWalletTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    wallet: wallets[3],
    nickname: 'new_wallet',
    statusCode: 200,
    expectedResult: true,
    messageRegex: /registered/,
    description: `${handles[0]} should register new wallet`,
  },
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    wallet: invalidWallet,
    nickname: 'fail_wallet',
    statusCode: 403,
    expectedResult: false,
    messageRegex: /wallet signature/,
    description: `${handles[0]} should fail register new wallet with invalid signature`,
  },
];

const secondWalletFilters = new sila.WalletFilters();
secondWalletFilters.blockchain_address = wallets[3].address;

const getWalletsTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    statusCode: 200,
    expectedResult: true,
    wallets: 2,
    description: `${handles[0]} should retrieve all wallets`,
  },
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    filters: secondWalletFilters,
    statusCode: 200,
    expectedResult: true,
    wallets: 1,
    description: `${handles[0]} should retrieve all wallets`,
  },
];

const updateWalletTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    walletProperties: {
      nickname: 'default',
      default: true,
    },
    statusCode: 200,
    expectedResult: true,
    changes: 2,
    messageRegex: /Wallet updated/,
    description: `${handles[0]} should update wallet successfully`,
    blockchainAddress: wallets[0].address,
  },
  {
    handle: handles[1],
    key: wallets[1].privateKey,
    walletProperties: {
      nickname: 'default',
      default: true,
    },
    statusCode: 200,
    expectedResult: true,
    changes: 2,
    messageRegex: /Wallet updated/,
    description: `${handles[1]} should update wallet successfully`,
    blockchainAddress: wallets[1].address,
  },
];

const getWalletTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    description: `${handles[0]} should retrieve wallet (${wallets[0].address})`,
    statusCode: 200,
    expectedResult: true,
    default: true,
    nickname: 'default',
    blockchainAddress: wallets[0].address,
  },
  {
    handle: handles[0],
    key: wallets[3].privateKey,
    description: `${handles[0]} should retrieve wallet (${wallets[3].address})`,
    statusCode: 200,
    expectedResult: true,
    default: false,
    nickname: 'new_wallet',
    blockchainAddress: wallets[3].address,
  },
];

const deleteWalletTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    statusCode: 403,
    expectedResult: false,
    messageRegex: /Cannot delete a user's default wallet/,
    description: `${handles[0]} shouldn't delete default wallet`,
  },
  {
    handle: handles[0],
    key: wallets[3].privateKey,
    statusCode: 200,
    expectedResult: true,
    messageRegex: /deleted/,
    description: `${handles[0]} should delete wallet`,
  },
];

const issueReferences = [];

const issueSilaTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    amount: 1000,
    statusCode: 200,
    expectedResult: 'SUCCESS',
    description: `${handles[0]} should issue sila tokens successfully`,
    messageRegex: /submitted to processing queue/,
  },
  {
    handle: handles[2],
    key: wallets[2].privateKey,
    amount: 1000,
    statusCode: 401,
    expectedResult: 'FAILURE',
    description: `${handles[2]} should fail issue sila tokens`,
    messageRegex: /not ID verified/,
  },
];

/**
 * Gets and specific index position out of an array
 * @param {Number} index The index position in the array
 * @param {Array<String>} referencesArray The array of references
 */
const transactionFiltersByRef = (index, referencesArray) => {
  const filters = new sila.TransactionFilters();
  filters.reference_id = referencesArray[index];
  return filters;
};

/**
 * Makes a recursive poll to /get_transactions until the transactions finishes.
 * Validates the results with the one's expected by the test
 * @param {*} test The test object information
 * @param {Array<String>} referencesArray The array of references
 */
const pollGetTransactionsTest = async (test, referencesArray) => {
  try {
    const filters = transactionFiltersByRef(test.filterIndex, referencesArray);
    let res = await sila.getTransactions(test.handle, test.key, filters);
    let { statusCode } = res;
    let { success } = res.data;
    let { status } = res.data.transactions[0];
    while (
      statusCode === 200 &&
      success &&
      (status === 'pending' || status === 'queued')
    ) {
      /* eslint-disable no-await-in-loop */
      await sleep(30000, test.description);
      res = await sila.getTransactions(test.handle, test.key, filters);
      /* eslint-enable no-await-in-loop */
      ({ statusCode } = res);
      ({ success } = res.data);
      [{ status }] = res.data.transactions;
    }
    assert.equal(statusCode, test.statusCode);
    assert.equal(success, test.expectedResult);
    assert.equal(status, test.status);
  } catch (e) {
    assert.fail(e);
  }
};

const pollIssueTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    filterIndex: 0,
    statusCode: 200,
    expectedResult: true,
    status: 'success',
    description: `${handles[0]} should issue sila tokens`,
  },
];

const transferReferences = [];

const transferSilaTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    destinationHanle: handles[1],
    amount: 100,
    description: `${handles[0]} should transfer to ${handles[1]}`,
    statusCode: 200,
    expectedResult: 'SUCCESS',
    messageRegex: /Transaction submitted to processing queue/,
  },
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    destinationHanle: 'digital_geko_e2e.silamoney.eth',
    amount: 100,
    description: `${handles[0]} should fail transfer to app handle`,
    statusCode: 401,
    expectedResult: 'FAILURE',
    messageRegex: /digital_geko_e2e is blocked or does not exist/,
  },
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    destinationHanle: handles[1],
    amount: 100,
    walletNickname: 'default',
    description: `${handles[0]} should transfer to ${handles[1]} with wallet nickname`,
    statusCode: 200,
    expectedResult: 'SUCCESS',
    messageRegex: /Transaction submitted to processing queue/,
  },
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    destinationHanle: handles[1],
    amount: 100,
    walletNickname: uuid4(),
    description: `${handles[0]} should fail transfer to ${handles[1]} with random wallet nickname`,
    statusCode: 403,
    expectedResult: 'FAILURE',
    messageRegex: /Blockchain address to be used in transaction is frozen or does not exist/,
  },
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    destinationHanle: handles[1],
    amount: 100,
    walletAddress: wallets[1].address,
    description: `${handles[0]} should transfer to ${handles[1]} with wallet address`,
    statusCode: 200,
    expectedResult: 'SUCCESS',
    messageRegex: /Transaction submitted to processing queue/,
  },
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    destinationHanle: handles[0],
    amount: 100,
    walletAddress: wallets[0].address,
    description: `${handles[0]} should fail transfer to ${handles[0]} with the origin wallet address`,
    statusCode: 403,
    expectedResult: 'FAILURE',
    messageRegex: /Transferring to the same address as sender is prohibited/,
  },
  {
    handle: handles[3],
    key: wallets[4].privateKey,
    destinationHanle: handles[0],
    amount: 100,
    description: `${handles[3]} should init transfer to ${handles[0]}`,
    statusCode: 200,
    expectedResult: 'SUCCESS',
    messageRegex: /Transaction submitted to processing queue/,
  },
];

const pollTransferTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    filterIndex: 2,
    statusCode: 200,
    expectedResult: true,
    status: 'success',
    description: `${handles[0]} should transfer sila tokens`,
  },
  {
    handle: handles[3],
    key: wallets[4].privateKey,
    filterIndex: 6,
    statusCode: 200,
    expectedResult: true,
    status: 'failed',
    description: `${handles[3]} should fail transfer sila tokens`,
  },
];

const silaBalanceTests = [
  {
    address: wallets[1].address,
    description: `${wallets[1].address} should have at least 100 tokens in sila balance`,
    statusCode: 200,
    balance: 100,
  },
];

const getSilaBalanceTests = [
  {
    address: wallets[1].address,
    description: `${wallets[1].address} should have at least 100 tokens in balance`,
    statusCode: 200,
    expectedResult: true,
    balance: 100,
  },
];

const redeemReferences = [];

const redeemSilaTests = [
  {
    handle: handles[1],
    key: wallets[1].privateKey,
    amount: 100,
    description: `${handles[1]} should redeem sila`,
    statusCode: 200,
    expectedResult: 'SUCCESS',
    messageRegex: /Transaction submitted to processing queue/,
  },
  {
    handle: handles[3],
    key: wallets[4].privateKey,
    amount: 100,
    description: `${handles[3]} should init redeem sila`,
    statusCode: 200,
    expectedResult: 'SUCCESS',
    messageRegex: /Transaction submitted to processing queue/,
  },
];

const pollRedeemTests = [
  {
    handle: handles[1],
    key: wallets[1].privateKey,
    filterIndex: 0,
    statusCode: 200,
    expectedResult: true,
    status: 'success',
    description: `${handles[1]} should redeem sila tokens`,
  },
  {
    handle: handles[3],
    key: wallets[4].privateKey,
    filterIndex: 1,
    statusCode: 200,
    expectedResult: true,
    status: 'failed',
    description: `${handles[3]} should fail redeem sila tokens`,
  },
];

const plaidSamedayAuthTests = [
  {
    handle: handles[0],
    key: wallets[0].privateKey,
    accountName: 'default',
    description: `${handles[0]} default account should fail plaid sameday auth`,
    statusCode: 400,
    expectedResult: 'FAILURE',
    messageRegex: /not in status "microdeposit_pending_manual_verification"/,
  },
];

describe('Check Handle', function () {
  this.timeout(300000);
  checkHandleTests.forEach((sample) => {
    it(sample.description, async () => {
      try {
        const res = await sila.checkHandle(sample.input);

        assert.equal(res.statusCode, sample.statusCode);
        assert.equal(res.data.status, sample.expectedResult);
      } catch (err) {
        assert.fail(err);
      }
    });
  });
});

describe('Register', function () {
  this.timeout(300000);
  createEntityTests.forEach((sample) => {
    it(sample.description, async () => {
      try {
        const res = await sila.register(sample.input);
        assert.equal(res.statusCode, sample.statusCode);
        assert.equal(res.data.status, sample.expectedResult);
      } catch (err) {
        assert.fail(err);
      }
    });
  });
});

describe('Check Handle taken', function () {
  this.timeout(300000);
  checkHandleTakenTests.forEach((sample) => {
    it(sample.description, async () => {
      try {
        const res = await sila.checkHandle(sample.input);
        assert.equal(res.statusCode, sample.statusCode);
        assert.equal(res.data.status, sample.expectedResult);
      } catch (err) {
        assert.fail(err);
      }
    });
  });
});

describe('Request KYC', function () {
  this.timeout(300000);
  requestKYCTests.forEach((test) => {
    it(test.description, async () => {
      try {
        const res = await sila.requestKYC(test.handle, test.key);
        assert.equal(res.statusCode, test.statusCode);
        assert.equal(res.data.status, test.expectedResult);
      } catch (err) {
        assert.fail(err);
      }
    });
  });
});

describe('Request KYC - KYC Level', function () {
  this.timeout(300000);
  requestKYCLevelTests.forEach((test) => {
    it(test.description, async () => {
      try {
        const res = await sila.requestKYC(
          test.handle,
          test.key,
          test.kyc_level,
        );
        assert.equal(res.statusCode, test.statusCode);
        assert.equal(res.data.status, test.expectedResult);
        assert.match(res.data.message, test.messageRegex);
      } catch (err) {
        assert.fail(err);
      }
    });
  });
});

describe('Successful Check KYC', function () {
  this.timeout(300000);
  checkKYCTests.forEach((test) => {
    it(test.description, async () => {
      try {
        let res = await sila.checkKYC(test.handle, test.key);
        let { statusCode } = res;
        let { status, message } = res.data;
        while (
          statusCode === 200 &&
          status === 'FAILURE' &&
          message.includes('pending')
        ) {
          await sleep(30000, test.description); // eslint-disable-line no-await-in-loop
          res = await sila.checkKYC(test.handle, test.key); // eslint-disable-line no-await-in-loop
          ({ statusCode } = res);
          ({ status, message } = res.data);
        }
        assert.equal(statusCode, test.statusCode);
        assert.equal(status, test.expectedResult);
        assert.match(message, test.messageRegex);
      } catch (e) {
        assert.fail(e);
      }
    });
  });
});

describe('Link Account - Direct', function () {
  this.timeout(300000);
  linkAccountDirectTests.forEach((test) => {
    it(test.description, async () => {
      try {
        const res = await sila.linkAccountDirect(
          test.handle,
          test.key,
          test.accountNumber,
          test.routingNumber,
          test.accountName,
        );
        assert.equal(res.statusCode, test.statusCode);
        assert.equal(res.data.status, test.expectedResult);
        assert.match(res.data.message, test.messageRegex);
      } catch (e) {
        assert.fail(e);
      }
    });
  });
});

describe('Link Account - Token tests', function () {
  this.timeout(300000);
  linkAccountTests.forEach((test) => {
    it(test.description, async () => {
      let accountId;
      let token;

      if (test.token) {
        ({ token } = test);
      } else {
        const res = await plaidToken();
        ({ token } = res);
        if (test.withAccountId) ({ accountId } = res);
      }

      try {
        const res = await sila.linkAccount(
          test.handle,
          test.key,
          token,
          test.accountName,
          accountId,
        );
        assert.equal(res.statusCode, test.statusCode);
        assert.equal(res.data.status, test.expectedResult);
        assert.match(res.data.message, test.messageRegex);
      } catch (e) {
        assert.fail(e);
      }
    });
  });
});

describe('Get Accounts', function () {
  this.timeout(300000);
  getAccountsTests.forEach((test) => {
    it(test.description, async () => {
      try {
        const res = await sila.getAccounts(test.handle, test.key);
        assert.equal(res.statusCode, test.statusCode);
        assert.equal(res.data.length, test.accounts);
      } catch (err) {
        assert.fail(err);
      }
    });
  });
});

describe('Get Account Balance', function () {
  this.timeout(300000);
  getAccountBalanceTests.forEach((test) => {
    it(test.description, async () => {
      try {
        const res = await sila.getAccountBalance(
          test.handle,
          test.key,
          test.accountName,
        );
        assert.equal(res.statusCode, test.statusCode);
        assert.equal(res.data.success, test.expectedResult);
      } catch (err) {
        assert.fail(err);
      }
    });
  });
});

describe('Register Wallet', function () {
  this.timeout(300000);
  registerWalletTests.forEach((test) => {
    it(test.description, async () => {
      try {
        const res = await sila.registerWallet(
          test.handle,
          test.key,
          test.wallet,
          test.nickname,
        );
        assert.equal(res.statusCode, test.statusCode);
        assert.equal(res.data.success, test.expectedResult);
        assert.match(res.data.message, test.messageRegex);
      } catch (err) {
        assert.fail(err);
      }
    });
  });
});

describe('Get Wallets', function () {
  this.timeout(300000);
  getWalletsTests.forEach((test) => {
    it(test.description, async () => {
      try {
        const res = await sila.getWallets(test.handle, test.key, test.filters);
        assert.equal(res.statusCode, test.statusCode);
        assert.equal(res.data.success, test.expectedResult);
        assert.equal(res.data.wallets.length, test.wallets);
        assert.equal(res.data.total_count, test.wallets);
      } catch (err) {
        assert.fail(err);
      }
    });
  });
});

describe('Update Wallet', function () {
  this.timeout(300000);
  updateWalletTests.forEach((scenario) => {
    it(scenario.description, async () => {
      try {
        const res = await sila.updateWallet(
          scenario.handle,
          scenario.key,
          scenario.walletProperties,
        );
        assert.equal(res.statusCode, scenario.statusCode);
        assert.equal(res.data.success, scenario.expectedResult);
        assert.equal(res.data.changes.length, scenario.changes);
        assert.match(res.data.message, scenario.messageRegex);
        assert.equal(
          res.data.wallet.nickname,
          scenario.walletProperties.nickname,
        );
        assert.equal(
          res.data.wallet.default,
          scenario.walletProperties.default,
        );
        assert.equal(
          res.data.wallet.blockchain_address,
          scenario.blockchainAddress,
        );
      } catch (err) {
        assert.fail(err);
      }
    });
  });
});

describe('Get Wallet', function () {
  this.timeout(300000);
  getWalletTests.forEach((test) => {
    it(test.description, async () => {
      try {
        const res = await sila.getWallet(test.handle, test.key);
        assert.equal(res.statusCode, test.statusCode);
        assert.equal(res.data.success, test.expectedResult);
        assert.equal(res.data.wallet.nickname, test.nickname);
        assert.equal(res.data.wallet.default, test.default);
        assert.equal(
          res.data.wallet.blockchain_address,
          test.blockchainAddress,
        );
      } catch (err) {
        assert.fail(err);
      }
    });
  });
});

describe('Delete Wallet', function () {
  this.timeout(300000);
  deleteWalletTests.forEach((test) => {
    it(test.description, async () => {
      try {
        const res = await sila.deleteWallet(test.handle, test.key);
        assert.equal(res.statusCode, test.statusCode);
        assert.equal(res.data.success, test.expectedResult);
        assert.match(res.data.message, test.messageRegex);
      } catch (err) {
        assert.fail(err);
      }
    });
  });
});

describe('Issue Sila', function () {
  this.timeout(300000);
  issueSilaTests.forEach((test) => {
    it(test.description, async () => {
      try {
        const res = await sila.issueSila(test.amount, test.handle, test.key);
        issueReferences.push(res.data.reference);
        assert.equal(res.statusCode, test.statusCode);
        assert.equal(res.data.status, test.expectedResult);
        assert.match(res.data.message, test.messageRegex);
      } catch (err) {
        assert.fail(err);
      }
    });
  });
});

describe('Poll Issue Sila', function () {
  this.timeout(300000);
  pollIssueTests.forEach((test) => {
    it(test.description, async () => {
      await pollGetTransactionsTest(test, issueReferences);
    });
  });
});

describe('Transfer Sila', function () {
  this.timeout(300000);
  transferSilaTests.forEach((test) => {
    it(test.description, async () => {
      try {
        const res = await sila.transferSila(
          test.amount,
          test.handle,
          test.key,
          test.destinationHanle,
          test.walletNickname,
          test.walletAddress,
        );
        transferReferences.push(res.data.reference);
        assert.equal(res.statusCode, test.statusCode);
        assert.equal(res.data.status, test.expectedResult);
        assert.match(res.data.message, test.messageRegex);
      } catch (e) {
        assert.fail(e);
      }
    });
  });
});

describe('Poll Transfer Sila', function () {
  this.timeout(300000);
  pollTransferTests.forEach((test) => {
    it(test.description, async () => {
      await pollGetTransactionsTest(test, transferReferences);
    });
  });
});

describe('Sila Balance', function () {
  this.timeout(300000);
  silaBalanceTests.forEach((test) => {
    it(test.description, async () => {
      try {
        const res = await sila.getBalance(test.address);
        assert.equal(res.statusCode, test.statusCode);
        assert.isAtLeast(res.data.silaBalance, test.balance);
      } catch (e) {
        assert.fail(e);
      }
    });
  });
});

describe('Get Sila Balance', function () {
  this.timeout(300000);
  getSilaBalanceTests.forEach((test) => {
    it(test.description, async () => {
      try {
        const res = await sila.getSilaBalance(test.address);
        assert.equal(res.statusCode, test.statusCode);
        assert.equal(res.data.success, test.expectedResult);
        assert.equal(res.data.address, test.address);
        assert.isAtLeast(res.data.sila_balance, test.balance);
      } catch (e) {
        assert.fail(e);
      }
    });
  });
});

describe('Redeem Sila', function () {
  this.timeout(300000);
  redeemSilaTests.forEach((test) => {
    it(test.description, async () => {
      try {
        const res = await sila.redeemSila(test.amount, test.handle, test.key);
        redeemReferences.push(res.data.reference);
        assert.equal(res.statusCode, test.statusCode);
        assert.equal(res.data.status, test.expectedResult);
        assert.match(res.data.message, test.messageRegex);
      } catch (e) {
        assert.fail(e);
      }
    });
  });
});

describe('Poll Redeem Sila', function () {
  this.timeout(300000);
  pollRedeemTests.forEach((test) => {
    it(test.description, async () => {
      await pollGetTransactionsTest(test, redeemReferences);
    });
  });
});

describe('Plaid Sameday Auth', function () {
  this.timeout(300000);
  plaidSamedayAuthTests.forEach((test) => {
    it(test.description, async () => {
      try {
        const res = await sila.plaidSamedayAuth(
          test.handle,
          test.key,
          test.accountName,
        );
        assert.equal(res.statusCode, test.statusCode);
        assert.equal(res.data.status, test.expectedResult);
        assert.match(res.data.message, test.messageRegex);
      } catch (e) {
        assert.fail(e);
      }
    });
  });
});
