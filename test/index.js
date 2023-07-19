/* eslint-disable func-names */
import { assert } from 'chai';
import regeneratorRuntime, { async } from 'regenerator-runtime'; // eslint-disable-line no-unused-vars
import uuid4 from 'uuid4';
import moment from 'moment';
import sila from '../src/index';
import axios from 'axios';

const sleep = (ms, description) => {
    console.log(`${description} waiting for ${ms / 1000} seconds`);
    return new Promise((resolve) => setTimeout(resolve, ms));
};

sila.configure({
    key: '9c17e7b767b8f4a63863caf1619ef3e9967a34b287ce58542f3eb19b5a72f076', // Add your private key here. USE ENV VARIABLE
    handle: 'arc_sandbox_test_app01', // Add your app handle here
});
sila.setEnvironment('sandbox');

const invalidWallet = sila.generateWallet();
invalidWallet.privateKey = 'e60a5c57130f4e82782cbdb498943f31fe8f92ab96daac2cc13cbbbf9c0b4d9d';

const wallets = [
    sila.generateWallet(),
    sila.generateWallet(),
    sila.generateWallet(),
    sila.generateWallet(),
    sila.generateWallet(),
    sila.generateWallet(),
    sila.generateWallet(),
    sila.generateWallet(),
    sila.generateWallet(),
];

const handles = [
    `nodeSDK-${uuid4()}`,
    `nodeSDK-${uuid4()}`,
    `nodeSDK-${uuid4()}`,
    `nodeSDK-${uuid4()}`,
    `nodeSDK-${uuid4()}`,
    `nodeSDK-${uuid4()}`,
    `nodeSDK-${uuid4()}`,
    `nodeSDK-${uuid4()}`,
];

const [
    firstHandle,
    secondHandle,
    thirdHandle,
    fourthHandle,
    businessHandle,
    basicHandle,
    instantHandle,
    sardineHandle,
] = handles;

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
firstUser.ssn = '319103848';
firstUser.cryptoAddress = wallets[0].address;
firstUser.handle = firstHandle;


const secondUser = Object.assign({}, firstUser);
secondUser.firstName = 'Second';
secondUser.email = 'test_2@silamoney.com';
secondUser.cryptoAddress = wallets[1].address;
secondUser.handle = secondHandle;

const thirdUser = Object.assign({}, firstUser);
thirdUser.firstName = 'Fail';
thirdUser.email = 'fail@silamoney.com';
thirdUser.cryptoAddress = wallets[2].address;
thirdUser.handle = thirdHandle;

const fourthUser = Object.assign({}, firstUser);
fourthUser.firstName = 'Fourth';
fourthUser.email = 'test_3@silamoney.com';
fourthUser.cryptoAddress = wallets[4].address;
fourthUser.handle = fourthHandle;

const businessUser = Object.assign({}, firstUser);
businessUser.entity_name = 'test business';
businessUser.ssn = undefined;
businessUser.ein = '320567252';
businessUser.email = 'test_4@silamoney.com';
businessUser.cryptoAddress = wallets[5].address;
businessUser.business_type = 'corporation';
businessUser.business_website = 'https://www.yourbusinesscustomer.com';
businessUser.doing_business_as = 'doing business co';
businessUser.naics_code = 721;
businessUser.registration_state = 'AL';
businessUser.handle = businessHandle;

const basicUser = new sila.User();
basicUser.firstName = 'Basic';
basicUser.lastName = 'User';
basicUser.cryptoAddress = wallets[6].address;
basicUser.handle = basicHandle;

const instantUser = new sila.User();
instantUser.firstName = 'Intant';
instantUser.lastName = 'User';
instantUser.cryptoAddress = wallets[7].address;
instantUser.handle = instantHandle;
instantUser.phone = '1234567890';
instantUser.smsOptIn = true;
instantUser.deviceFingerprint = uuid4();
instantUser.address = '123 Main St';
instantUser.city = 'Anytown';
instantUser.state = 'NY';
instantUser.zip = '12345';
instantUser.email = 'instant@silamoney.com';
instantUser.dateOfBirth = '1990-01-01';
instantUser.ssn = '319103848';


const sardineUser = new sila.User();
sardineUser.firstName = 'Sardine';
sardineUser.lastName = 'User';
sardineUser.cryptoAddress = wallets[8].address;
sardineUser.handle = sardineHandle;
sardineUser.phone = '1234567890';
sardineUser.smsOptIn = true;
sardineUser.deviceFingerprint = uuid4();
sardineUser.address = '123 Main St';
sardineUser.city = 'Anytown';
sardineUser.state = 'NY';
sardineUser.zip = '12345';
sardineUser.email = 'instant@silamoney.com';
sardineUser.dateOfBirth = '1990-01-01';
sardineUser.ssn = '319103848';
sardineUser.sessionIdentifier = "ppppp-aaaa-dddd-99ce-c45944174e0c";

var mockWireTransactionId_1 = '';

const plaidToken = () => {
  const promise = new Promise((resolve, reject) => {
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

    axios
      .post(options.uri, options.body)
      .then((response) => {
        const body = response.data;
        const token = body.public_token;
        const accountId = body.accounts[0].account_id;

        resolve({ token, accountId });
      })
      .catch((error) => {
        console.error('Error making Plaid API request:', error);
        resolve({}); // Resolve with empty object if there's an error
      });
  });

  return promise;
};


const MxProcessorToken = () => {
    const promise = new Promise((resolve) => {
        var data = JSON.stringify({
            "payment_processor_authorization_code":
            {
              user_guid: "USR-78912abf-a65b-4661-806b-bdcf4e062e16",
              member_guid: "MBR-1e0d03f3-d42e-46e7-86fb-ae07b79c557a",
              account_guid: "ACT-cc129199-606c-41a3-aeec-ee32980362d4"
            }
          });

          var config = {
            method: 'post',
            url: 'https://int-api.mx.com/payment_processor_authorization_code',
            headers: {
              'Authorization': 'Basic OWNlOTFhZWQtMDA4Zi00YjFmLThlMzktNGU3YTU5NjZlOTVhOmYyZThkYzE4MmY2MzQ5OTk5NjMzMDJlYTE3OGU3NTBkZWU2NDQ3ODM=',
              'Accept': 'application/vnd.mx.api.v1+json',
              'Content-Type': 'application/json'
            },
            data : data
          };

          axios(config)
          .then(function (response) {
            const token = response.data.payment_processor_authorization_code.authorization_code;

            resolve({ token });
          })
          .catch(function (error) {
            resolve({});
        });
    });
    return promise;
};

const linkCardToken = () => {
    const promise = new Promise((resolve) => {
        const bodyParams = "cBm0RU8eASGfSxLYJjsG73Q\tn9010111999999992\te202205\ts2545";
        const headersObj = {'Content-Type': 'application/tabapay-compact'}
        headersObj['Referer'] = 'https://sso.sandbox.tabapay.com:8443/SSOEvolveISO.html';

        const options = {
            url: 'https://sso.sandbox.tabapay.com:8443/v2/SSOEncrypt',
            method: 'post',
            headers: headersObj,
            data: bodyParams,
        };
        axios(options)
            .then(function (response) {
                const token = response.data.slice(3);
                resolve(token);
            })
            .catch(function (error) {
                console.error(error)
                return;
            });

    });
    return promise;
};

//SANDBOX
const validBusinessUuid = '9f280665-629f-45bf-a694-133c86bffd5e';
const wireBusinessUuid = '25e77968-1ca3-4a4b-8e72-506dcac20dc7';

const invalidBusinessUuid = '6d933c10-fa89-41ab-b443-2e78a7cc8cac';
const issueTransactionDescriptor = 'Issue Trans';
const transferDescriptor = 'Transfer Trans';
const redeemDescriptor = 'Redeem Trans';
const achRegexString = `${invalidBusinessUuid} could not be found`;
const achRegex = new RegExp(achRegexString);

let eventUuid = '';

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
    {
        input: businessUser,
        expectedResult: 'SUCCESS',
        statusCode: 200,
        description: `Valid registration test for ${handles[4]}.silamoney.eth`,
    },
    {
        input: basicUser,
        expectedResult: 'SUCCESS',
        statusCode: 200,
        description: `Valid registration test for ${basicUser.handle}.silamoney.eth`,
    },
    {
        input: instantUser,
        expectedResult: 'SUCCESS',
        statusCode: 200,
        description: `Valid registration test for ${instantUser.handle}.silamoney.eth`,
    },
    {
        input: sardineUser,
        expectedResult: 'SUCCESS',
        statusCode: 200,
        description: `Valid registration test for ${sardineUser.handle}.silamoney.eth`,
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
        handle: handles[3],
        key: wallets[4].privateKey,
        expectedResult: 'SUCCESS',
        statusCode: 200,
        description: `"${handles[3]}.silamoney.eth" should be sent for KYC check.`,
    },
    {
        handle: handles[4],
        key: wallets[5].privateKey,
        expectedResult: 'SUCCESS',
        statusCode: 200,
        description: `"${handles[4]}.silamoney.eth" should be sent for KYC check.`,
    },
];

const requestKYCLevelTests = [
    {
        handle: instantUser.handle,
        key: wallets[7].privateKey,
        kyc_level: 'INSTANT-ACH',
        expectedResult: 'SUCCESS',
        statusCode: 200,
        description: `${instantUser.handle} should be sent for KYC check`,
        messageRegex: /submitted for KYC review/,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        expectedResult: 'FAILURE',
        kyc_level: uuid4(),
        statusCode: 403,
        messageRegex: /\bKYC flow/,
        description: 'Random kyc_level should fail requestKYC',
    },
    {
        handle: sardineUser.handle,
        key: wallets[8].privateKey,
        kyc_level: 'INSTANT-ACHV2',
        expectedResult: 'SUCCESS',
        statusCode: 200,
        description: `${sardineUser.handle} should be sent for INSTANT-ACHV2 KYC check`,
        messageRegex: /submitted for KYC review/,
    },
];

const checkKYCTests = [
    {
        handle: sardineHandle,
        key: wallets[8].privateKey,
        statusCode: 200,
        kycLevel: 'INSTANT-ACHV2',
        expectedResult: 'SUCCESS',
        messageRegex: /\bpassed\b/,
        description: `"${sardineHandle}.silamoney.eth" should pass KYC check.`,
    },
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
        handle: handles[3],
        key: wallets[4].privateKey,
        statusCode: 200,
        expectedResult: 'SUCCESS',
        messageRegex: /\bpassed\b/,
        description: `"${handles[3]}.silamoney.eth" should pass KYC check.`,
    },
    {
        handle: handles[4],
        key: wallets[5].privateKey,
        statusCode: 200,
        expectedResult: 'FAILURE',
        messageRegex: /\bpassed\b/,
        description: `"${handles[4]}.silamoney.eth" should pass KYC check.`,
    },
    {
        handle: instantHandle,
        key: wallets[7].privateKey,
        statusCode: 200,
        expectedResult: 'SUCCESS',
        messageRegex: /\bpassed\b/,
        description: `"${instantHandle}.silamoney.eth" should pass KYC check.`,
    },
];

const checkPartnerKYCTests = [
    {
        query_app_handle: 'digital_geko_e2e_new',
        query_user_handle: 'cross_app_check_partner',
        statusCode: 200,
        expectedResult: 'SUCCESS',
        description: `Checking cross app check handle`,
    },
];

const linkAccountDirectTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        accountNumber: '123456789012',
        routingNumber: '123456780',
        accountName: 'sync_direct',
        expectedResult: 'SUCCESS',
        statusCode: 200,
        description: 'Direct bank account link should be successful',
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        accountNumber: '123456789013',
        routingNumber: '123456780',
        accountName: 'delete',
        expectedResult: 'SUCCESS',
        statusCode: 200,
        description: 'Direct bank account link should be successful',
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        accountNumber: '123456789013',
        routingNumber: '123456780',
        accountName: 'forupdate',
        expectedResult: 'SUCCESS',
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
        accountName: 'defaultpt',
        expectedResult: 'SUCCESS',
        statusCode: 200,
        messageRegex: /successfully linked/,
        description: `"${handles[0]}" should link account through plaid token`,
        withAccountId: false,
        plaidTokenType: 'legacy'
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
    {
        handle: instantHandle,
        key: wallets[7].privateKey,
        accountName: 'instantValidation',
        token: 'sandbox',
        expectedResult: 'SUCCESS',
        statusCode: 200,
        messageRegex: /successfully linked/,
        description: `"${instantHandle}" should link account through plaid token`,
    },
    {
        handle: sardineHandle,
        key: wallets[8].privateKey,
        accountName: 'instantValidation',
        token: 'sandbox',
        expectedResult: 'SUCCESS',
        statusCode: 200,
        messageRegex: /successfully linked/,
        description: `"${sardineHandle}" should link account through plaid token`,
    },
];

const linkAccountMXTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        accountName: 'defaultMx',
        expectedResult: 'SUCCESS',
        statusCode: 200,
        providerTokenType:'processor',
        description: `"${handles[0]}" should link account through MX processor token`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        accountName: 'defaultMxx',
        token: 'incorrect-token',
        expectedResult: 'FAILURE',
        statusCode: 400,
        providerTokenType:'processor',
        description: `"${handles[0]}" should link account through valid MX processor token`,
    },
];

const checkInstantAchTests = [
    {
        handle: instantHandle,
        key: wallets[7].privateKey,
        accountName: 'instantValidation',
        description: `"${instantHandle}" should check instant ach.`,
    },
    {
        handle: sardineHandle,
        key: wallets[8].privateKey,
        accountName: 'instantValidation',
        kycLevel: 'INSTANT-ACHV2',
        description: `"${handles[0]}" should check instant ach v2.`,
    },
];

const getAccountsTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        accounts: 6,
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
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        accountName: 'defaultMx',
        statusCode: 200,
        expectedResult: true,
        description: `${handles[0]} should retrieve default MX account balance`,
    },
];

const registerWalletTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        wallet: wallets[3],
        nickname: 'new_wallet',
        default: true,
        statusCode: 200,
        expectedResult: true,
        description: `${handles[0]} should register new wallet`,
        statementsEnabled: true,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        wallet: invalidWallet,
        nickname: 'fail_wallet',
        default: false,
        statusCode: 403,
        expectedResult: false,
        description: `${handles[0]} should fail register new wallet with invalid signature`,
        statementsEnabled: true,
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
        statementsEnabled: true,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        filters: secondWalletFilters,
        statusCode: 200,
        expectedResult: true,
        wallets: 1,
        description: `${handles[0]} should retrieve all wallets`,
        statementsEnabled: true,
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
        description: `${handles[0]} should update wallet successfully`,
        blockchainAddress: wallets[0].address,
        statementsEnabled: true,
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
        description: `${handles[1]} should update wallet successfully`,
        blockchainAddress: wallets[1].address,
        statementsEnabled: true,
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
        statementsEnabled: true,
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
        statementsEnabled: true,
    },
];

const deleteWalletTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 403,
        expectedResult: false,
        description: `${handles[0]} shouldn't delete default wallet`,
    },
    {
        handle: handles[0],
        key: wallets[3].privateKey,
        statusCode: 200,
        expectedResult: true,
        description: `${handles[0]} should delete wallet`,
    },
];

const cancelTransactionTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        generateIssueTransaction: true,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should cancel transaction`,
    },
];

const reverseIssueSilaTransactionTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        actionType: 'issueSila',
        accountName:undefined,
        descriptor:undefined,
        businessUuid:undefined,
        processingType:undefined,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should issue sila tokens successfully with card`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        actionType: 'getTransactions',
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should get card transactions`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        actionType: 'reverseTransaction',
        statusCode: 202,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should issue sila transaction reverse successfully`,
    },
];

const issueReferences = [];

const issueSilaTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        amount: 50000,
        statusCode: 200,
        expectedResult: 'SUCCESS',
        description: `${handles[0]} should issue sila tokens successfully`,
        messageRegex: /submitted to processing queue/,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        amount: 50000,
        statusCode: 200,
        descriptor: issueTransactionDescriptor,
        businessUuid: validBusinessUuid,
        expectedResult: 'SUCCESS',
        description: `${handles[0]} should issue sila tokens successfully with business uuid and descriptor`,
        messageRegex: /submitted to processing queue/,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        amount: 100,
        statusCode: 400,
        descriptor: issueTransactionDescriptor,
        businessUuid: invalidBusinessUuid,
        expectedResult: 'FAILURE',
        description: `${handles[0]} should fail issue sila tokens with invalid business uuid and descriptor`,
        messageRegex: achRegex,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        amount: 100,
        statusCode: 200,
        processingType: 'SAME_DAY_ACH',
        expectedResult: 'SUCCESS',
        description: `${handles[0]} should issue sila tokens successfully with processing type`,
        messageRegex: /submitted to processing queue/,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        amount: 420,
        statusCode: 200,
        expectedResult: 'SUCCESS',
        description: `${handles[0]} should not issue sila tokens`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        amount: 100,
        cardName: 'visa',
        statusCode: 200,
        expectedResult: 'SUCCESS',
        description: `${handles[0]} should issue sila tokens successfully with card name`,
    },
    {
        handle: instantHandle,
        key: wallets[7].privateKey,
        amount: 5000,
        accountName: 'instantValidation',
        processingType:'INSTANT_ACH',
        businessUuid: validBusinessUuid,
        statusCode: 403,
        expectedResult: 'FAILURE',
        description: `${instantHandle} should not issue sila tokens, error_code:INSTANT_ACH_MAX_AMOUNT`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        amount: 200,
        accountName: 'defaultMx',
        statusCode: 200,
        expectedResult: 'SUCCESS',
        description: `${instantHandle} should issue sila tokens successfully with defaultMx`,
    },
];

const getTransactionsTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should retrieve transactions with user private key signature`,
    },
    {
        handle: handles[0],
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should retrieve transactions without user private key signature`,
    },
    {
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `Should retrieve transactions without user handle and private key signature`,
    },
];

var issueTransactionIdempotencyId = uuid4();
var transferTransactionIdempotencyId = uuid4();
var redeemTransactionIdempotencyId = uuid4();

const idempotencyIssueReferences = [];

const idempotencySilaTransactionTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        amount: 500,
        statusCode: 200,
        expectedResult: 'SUCCESS',
        description: `${handles[0]} should issue sila tokens successfully for Idempotency test`,
        messageRegex: /submitted to processing queue/,
        transaction_idempotency_id:issueTransactionIdempotencyId,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        amount: 500,
        statusCode: 200,
        expectedResult: 'SUCCESS',
        description: `${handles[0]} should issue sila tokens successfully for Idempotency test`,
        messageRegex: /submitted to processing queue/,
        transaction_idempotency_id:issueTransactionIdempotencyId,
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
        let {
            status,
            error_msg,
            error_code,
            return_code,
            return_desc
        } = res.data.transactions[0];
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
            [{ status, error_msg, error_code, return_code, return_desc }] = res.data.transactions;
        }
        assert.equal(statusCode, test.statusCode);
        assert.equal(success, test.expectedResult);
        assert.equal(status, test.status);
        if (test.expects_return_code) {
            assert.isDefined(error_msg)
            assert.isDefined(error_code)
            assert.isDefined(return_code)
            assert.isDefined(return_desc)
        }
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
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        destinationHanle: 'digital_geko_e2e.silamoney.eth',
        amount: 100,
        description: `${handles[0]} should fail transfer to app handle`,
        statusCode: 401,
        expectedResult: 'FAILURE',
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
    },
    {
        handle: handles[3],
        key: wallets[4].privateKey,
        destinationHanle: handles[0],
        amount: 100,
        description: `${handles[3]} should fail to init transfer to ${handles[0]}`,
        statusCode: 400,
        expectedResult: 'FAILURE',
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        destinationHanle: handles[1],
        amount: 100,
        descriptor: transferDescriptor,
        businessUuid: validBusinessUuid,
        description: `${handles[0]} should transfer to ${handles[1]} with business uuid and descriptor`,
        statusCode: 200,
        expectedResult: 'SUCCESS',
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        destinationHanle: handles[1],
        amount: 100,
        descriptor: transferDescriptor,
        businessUuid: invalidBusinessUuid,
        description: `${handles[0]} should fail transfer to ${handles[1]} with invalid business uuid and descriptor`,
        statusCode: 400,
        expectedResult: 'FAILURE',
    },
];

const idempotencyTransferReferences = [];

const transferSilaIdempotencyTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        destinationHanle: handles[1],
        amount: 100,
        description: `${handles[0]} should transfer to ${handles[1]} for Idempotency test`,
        statusCode: 200,
        expectedResult: 'SUCCESS',
        transaction_idempotency_id:transferTransactionIdempotencyId,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        destinationHanle: handles[1],
        amount: 100,
        description: `${handles[0]} should transfer to ${handles[1]} for Idempotency test`,
        statusCode: 200,
        expectedResult: 'SUCCESS',
        transaction_idempotency_id:transferTransactionIdempotencyId,
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

const openVirtualAccountTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        virtual_account_name: 'testVarAccount-1',
        statusCode: 200,
        expectedResult: 'SUCCESS',
        status: 'success',
        virtual_account_id:'',
        description: `${handles[0]} should open first virtual account successfully`,
        statementsEnabled: false,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        virtual_account_name: 'testVarAccount-2',
        statusCode: 200,
        expectedResult: 'SUCCESS',
        status: 'success',
        virtual_account_id:'',
        description: `${handles[0]} should open second virtual account successfully`,
        statementsEnabled: false,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        virtual_account_name: 'testVarAccount-3',
        statusCode: 200,
        expectedResult: 'SUCCESS',
        status: 'success',
        virtual_account_id:'',
        description: `${handles[0]} should open third virtual account successfully`,
        statementsEnabled: true,
    },
];

const paymentMethodsIds = {
    'bank_account_id':'',
    'card_id':'',
    'virtual_account_id_1':'',
    'virtual_account_number_1':'',
    'virtual_account_id_2':'',
    'virtual_account_number_2':'',
    'blockchain_address_id':''
}

const redeemReferences = [];

const redeemSilaTests = [
    {
        handle: handles[1],
        key: wallets[1].privateKey,
        amount: 100,
        description: `${handles[1]} should redeem sila`,
        statusCode: 200,
        expectedResult: 'SUCCESS',
    },
    {
        handle: handles[3],
        key: wallets[4].privateKey,
        amount: 100,
        description: `${handles[3]} should fail to init redeem sila`,
        statusCode: 400,
        expectedResult: 'FAILURE',
    },
    {
        handle: handles[1],
        key: wallets[1].privateKey,
        amount: 100,
        descriptor: redeemDescriptor,
        businessUuid: validBusinessUuid,
        description: `${handles[1]} should redeem sila with business uuid and descriptor`,
        statusCode: 200,
        expectedResult: 'SUCCESS',
    },
    {
        handle: handles[1],
        key: wallets[1].privateKey,
        amount: 100,
        descriptor: redeemDescriptor,
        businessUuid: invalidBusinessUuid,
        description: `${handles[1]} should fail redeem sila with invalid business uuid and descriptors`,
        statusCode: 400,
        expectedResult: 'FAILURE',
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        amount: 100,
        processingType: 'SAME_DAY_ACH',
        description: `${handles[1]} should redeem sila with processing type`,
        statusCode: 200,
        expectedResult: 'SUCCESS',
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        amount: 100,
        cardName: 'visa',
        processingType: 'CARD',
        description: `${handles[0]} should redeem sila with card name`,
        statusCode: 200,
        expectedResult: 'SUCCESS',
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        amount: 11000,
        processingType: 'WIRE',
        businessUuid: wireBusinessUuid,
        description: `${handles[0]} should redeem sila with WIRE processingType`,
        statusCode: 200,
        expectedResult: 'SUCCESS',
        mockWireAccountName:'mock_account_success',
    },
];

const redeemSilaIdempotencyTests = [
    {
        handle: handles[1],
        key: wallets[1].privateKey,
        amount: 100,
        description: `${handles[1]} should redeem sila for Idempotency test`,
        statusCode: 200,
        expectedResult: 'SUCCESS',
        transaction_idempotency_id:redeemTransactionIdempotencyId,
    },
    {
        handle: handles[1],
        key: wallets[1].privateKey,
        amount: 100,
        description: `${handles[1]} should redeem sila for Idempotency test`,
        statusCode: 200,
        expectedResult: 'SUCCESS',
        transaction_idempotency_id:redeemTransactionIdempotencyId,
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
];

const plaidSamedayAuthTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        accountName: 'default',
        description: `${handles[0]} default account should fail plaid sameday auth`,
        statusCode: 400,
        expectedResult: 'FAILURE',
    },
];

const registrationData = [];

const addEmailTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        email: 'erickjeronimo1@gmail.com',
        description: `${handles[1]} should add email`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 400,
        expectedResult: false,
        status: 'FAILURE',
        email: '',
        description: `${handles[1]} should fail to add email`,
    },
];

const addPhoneTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        phone: '1234567890',
        description: `${handles[1]} should add phone`,
        messageRegex: /Successfully added phone/,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 400,
        expectedResult: false,
        status: 'FAILURE',
        phone: '',
        description: `${handles[1]} should fail to add phone`,
        messageRegex: /Bad request/,
    },
    {
        handle: instantUser.handle,
        key: wallets[7].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        phone: '1234567891',
        smsOptIn: true,
        description: `${instantUser.handle} should add phone`,
        messageRegex: /Successfully added phone/,
    },
];

const addIdentityTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        identity: {
            alias: 'SSN',
            value: '543212222',
        },
        description: `${handles[1]} should add identity`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 400,
        expectedResult: false,
        status: 'FAILURE',
        identity: {
            alias: '',
            value: '',
        },
        description: `${handles[1]} should fail to add identity`,
    },
];

const addAddressTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        address: {
            alias: 'Home Number Two',
            street_address_1: '324 Songbird Avenue',
            street_address_2: 'Apt. 132',
            city: 'Portland',
            state: 'VA',
            postal_code: '12345',
            country: 'US',
        },
        description: `${handles[1]} should add address`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 400,
        expectedResult: false,
        status: 'FAILURE',
        address: {
            street_address_2: undefined,
        },
        description: `${handles[1]} should fail to add address`,
    },
];

const addDeviceTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        device: {
            deviceFingerprint: uuid4(),
        },
        description: `${handles[0]} should add device`,
        messageRegex: /Device successfully registered/,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 400,
        expectedResult: false,
        status: 'FAILURE',
        description: `${handles[0]} should fail add device without fingerprint`,
        messageRegex: /Bad request/,
    },
    {
        handle: sardineHandle,
        key: wallets[8].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        device: {
            deviceFingerprint: uuid4(),
            sessionIdentifier:"ppppp-aaaa-dddd-99ce-c45944174e0c",
        },
        description: `${sardineHandle} should add device session_identifier`,
        messageRegex: /Device successfully registered/,
    },
];

const updateEmailTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        email: {
            email: 'erickjeronimo1@gmail.com',
            uuid: 4,
        },
        description: `${handles[1]} should update email`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 400,
        expectedResult: false,
        status: 'FAILURE',
        email: {
            email: '',
            uuid: undefined,
        },
        description: `${handles[1]} should fail to update email`,
    },
];

const updatePhoneTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        phone: {
            phone: '1234567890',
            uuid: 5,
        },
        description: `${handles[1]} should update phone`,
        messageRegex: /Successfully updated phone/,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 400,
        expectedResult: false,
        status: 'FAILURE',
        phone: {
            phone: '',
            uuid: undefined,
        },
        description: `${handles[1]} should fail to update phone`,
        messageRegex: /Bad request/,
    },
];

const updateIdentityTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        identity: {
            alias: 'SSN',
            value: '123455898',
            uuid: 7,
        },
        description: `${handles[1]} should update identity`,
        messageRegex: /Successfully updated identity/,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 400,
        expectedResult: false,
        status: 'FAILURE',
        identity: {
            alias: '',
            value: '',
            uuid: undefined,
        },
        description: `${handles[1]} should fail to update identity`,
        messageRegex: /Bad request/,
    },
];

const updateAddressTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        address: {
            alias: 'Home Number Two',
            street_address_1: '324 Songbird Avenue',
            street_address_2: 'Apt. 132',
            city: 'Portland',
            state: 'VA',
            postal_code: '12345',
            country: 'US',
            uuid: 8,
        },
        description: `${handles[1]} should update address`,
        messageRegex: /Successfully updated address/,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 400,
        expectedResult: false,
        status: 'FAILURE',
        address: {
            alias: '',
            street_address_1: '',
            street_address_2: '',
            city: '',
            state: '',
            postal_code: '',
            country: '',
            uuid: undefined,
        },
        description: `${handles[1]} should fail to update address`,
        messageRegex: /Bad request/,
    },
];

const updateEntityTests = [
    {
        handle: handles[0],
        privateKey: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should update entity`,
        entity: {
            first_name: 'NewFirst',
            last_name: 'NewLast',
            entity_name: 'NewFirst NewLast',
            birthdate: '1994-01-08',
        },
    },
    {
        handle: handles[4],
        privateKey: wallets[5].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[4]} should update entity`,
        entity: {
            entity_name: 'New Company',
            business_type: 'corporation',
            naics_code: 721,
            doing_business_as: 'NC Ltc.',
            business_website: 'https://newdomain.go',
            registration_state:'OR',
        },
    },
];

const deleteEmailTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        uuid: 0,
        description: `${handles[1]} should delete email`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 400,
        expectedResult: false,
        status: 'FAILURE',
        uuid: undefined,
        description: `${handles[1]} should fail to delete email`,
    },
];

const deletePhoneTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        uuid: 1,
        description: `${handles[1]} should delete phone`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 400,
        expectedResult: false,
        status: 'FAILURE',
        uuid: undefined,
        description: `${handles[1]} should fail to delete phone`,
    },
];

const deleteIdentityTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        uuid: 2,
        description: `${handles[1]} should delete identity`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 400,
        expectedResult: false,
        status: 'FAILURE',
        uuid: undefined,
        description: `${handles[1]} should fail to delete identity`,
    },
];

const deleteAddressTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        uuid: 3,
        description: `${handles[1]} should delete address`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 400,
        expectedResult: false,
        status: 'FAILURE',
        uuid: undefined,
        description: `${handles[1]} should fail to delete address`,
    },
];

const linkBusinessMemberTests = [
    {
        user_handle: handles[0],
        user_private_key: wallets[0].privateKey,
        business_handle: handles[4],
        business_private_key: wallets[5].privateKey,
        role: 'administrator',
        details: 'first admin',
    },
    {
        user_handle: handles[0],
        user_private_key: wallets[0].privateKey,
        business_handle: handles[4],
        business_private_key: wallets[5].privateKey,
        role: 'controlling_officer',
        details: 'first controlling officer',
    },
    {
        user_handle: handles[0],
        user_private_key: wallets[0].privateKey,
        business_handle: handles[4],
        business_private_key: wallets[5].privateKey,
        member_handle: handles[1],
        role: 'administrator',
        details: 'second admin',
    },
    {
        user_handle: handles[0],
        user_private_key: wallets[0].privateKey,
        business_handle: handles[4],
        business_private_key: wallets[5].privateKey,
        member_handle: handles[3],
        role: 'beneficial_owner',
        details: 'first beneficial owner',
        ownership_stake: 0.6,
    },
];

const getEntityTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        saveReference: true,
        description: `${handles[0]} should retrieve entity`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        options: { prettyDates: true },
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should retrieve entity with pretty dates`,
    },
    {
        handle: handles[4],
        key: wallets[5].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        registration_state: 'AL',
        description: `${handles[5]} should retrieve entity with registration_state`,
    },
];

const getDocumentTypesTests = [
    {
        returnedCount: 20,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: 'should retrieve document types without pagination',
    },
    {
        pagination: {
            page: 1,
            perPage: 100,
        },
        returnedCount: 21,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: 'should retrieve document types with pagination',
    },
];

const getEntitiesTests = [
    {
        entityType: 'individual',
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        individualAmount: 1,
        businessAmount: 0,
        description: 'get_entities with entity_type equals "individual"',
    },
    {
        entityType: 'business',
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        individualAmount: 0,
        businessAmount: 1,
        description: 'get_entities with entity_type equals "business"',
    },
    {
        options: {
            perPage: 1,
            page: 1,
        },
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        individualAmount: 0,
        businessAmount: 0,
        description: 'get_entities with pagination',
    },
];

const documentReferences = [];

const uploadDocumentTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        document: {
            filePath: `${__dirname}/images/logo-geko.png`,
            filename: 'logo-geko',
            mimeType: 'image/png',
            documentType: 'doc_green_card',
            name: 'some random name',
            description: 'some random description',
        },
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        multiple:false,
        description: `${handles[0]} should upload file succesfully`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        document: [
            {
                filePath: `${__dirname}/images/logo-geko.png`,
                filename: 'logo-geko',
                mimeType: 'image/png',
                documentType: 'doc_green_card',
                name: 'some random name',
                description: 'some random description',
            },
            {
                filePath: `${__dirname}/images/dummy.pdf`,
                filename: 'dummy',
                mimeType: 'application/pdf',
                documentType: 'bank_statement',
                name: 'some random name',
                description: 'some random description',
            }
        ],
        multiple:true,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should upload multiple file succesfully`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        document: {
            filePath: `${__dirname}/images/logo-geko.png`,
        },
        multiple:false,
        statusCode: 400,
        expectedResult: false,
        status: 'FAILURE',
        description: `${handles[0]} should fail to upload file`,
    },
];

const listDocumentsTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        documentsLength: 3,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should retrieve uploaded files successfully`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        filters: {
            page: 1,
            perPage: 1,
            order: 'asc',
            startDate: moment().format('YYYY-MM-DD'),
            endDate: moment().add(1, 'd').format('YYYY-MM-DD'),
            docTypes: ['doc_green_card'],
            search: 'logo',
            sortBy: 'name',
        },
        documentsLength: 1,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should retrieve uploaded files successfully with all filters`,
    },
];

const getDocumentTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        documentIndex: 0,
        statusCode: 200,
        contentType: 'image/png',
        description: `${handles[0]} should retrieve uploaded file successfully`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 400,
        expectedResult: false,
        status: 'FAILURE',
        description: `${handles[0]} should fail to retrieve uploaded file`,
    },
];

const getWebhooksTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        filters: {},
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should retrieve webhooks successfully with no filters`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        filters: {
            uuid: undefined,
            delivered: undefined,
            sort_ascending: undefined,
            event_type: 'account_status',
            endpoint_name: undefined,
            user_handle: undefined,
            start_epoch: undefined,
            end_epoch: undefined,
            page: 1,
            per_page: undefined
        },
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should retrieve webhooks successfully with event_type:account_status filters`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        filters: {
            uuid: undefined,
            delivered: undefined,
            sort_ascending: undefined,
            event_type: undefined,
            endpoint_name: 'account status',
            user_handle: undefined,
            start_epoch: undefined,
            end_epoch: undefined,
            page: 1,
            per_page: undefined
        },
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should retrieve webhooks successfully with endpoint_name:account status filters`,
    },
];

const getWalletStatementDataTests = [
        {
            handle: handles[0],
            key: wallets[0].privateKey,
            walletId: wallets[0],
            filters: {
                startMonth: "11-2022",
                endMonth: "12-2022",
                page: 1,
                perPage: 100,
            },
            statusCode: 200,
            expectedResult: true,
            status: 'SUCCESS',
            description: `${handles[0]} should get wallet statement data successfully with all filters`,
        },
];

const getStatementsDataTests = [
    {
        handle: handles[0],
        filters: {
            month: "11-2022",
            page: 1,
            perPage: 100,
        },
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should get statements data successfully with all filters`,
    },
];

const statementsTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        searchFilters: {
            startDate: "2023-06-17",
            endDate: "2023-06-17",
            page: 1,
            perPage: 100,
            userName: "Postman User",
            userHandle: "user_handle1_1686776339cudgjmzwckh4ohh",
            accountType: "VIRTUAL_ACCOUNT",
            email: "sunilarc14@silamoney.com",
        },
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should get statements successfully with all filters`,
    },
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should get statements successfully`,
    },
];

const resendStatementsTests = [
    {
        handle: handles[0],
        key: wallets[0].privateKey,
        email: "sunilarc14@silamoney.com",
        statementUuid: "59a4feba-0fcd-40ac-bd9a-59e47da0b640",
        statusCode: 200,
        expectedResult: true,
        status: 'SUCCESS',
        description: `${handles[0]} should get resend statements successfully`,
    },
];

describe('Get Insitutions', function () {
    this.timeout(300000);
    it('Successfully retrieve institutions', async () => {
        try {
            const res = await sila.getInstitutions({
                institution_name: '1st advantage bank'
            });
            assert.equal(res.statusCode, 200);
            assert.equal(res.data.success, true);
            assert(res.data.institutions);
            assert(
                res.data.institutions[0].name,
            );
        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Get Business Types', function () {
    this.timeout(300000);
    it('Successfully retrieve business types', async () => {
        try {
            const res = await sila.getBusinessTypes();

            assert.equal(res.statusCode, 200);
            assert.equal(res.data.success, true);
            assert(res.data.business_types.length > 0);
        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Get Business Roles', function () {
    this.timeout(300000);
    it('Successfully retrieve business roles', async () => {
        try {
            const res = await sila.getBusinessRoles();

            assert.equal(res.statusCode, 200);
            assert.equal(res.data.success, true);
            assert(res.data.business_roles.length > 0);
        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Get Naics Categories', function () {
    this.timeout(300000);
    it('Successfully retrieve naics categories', async () => {
        try {
            const res = await sila.getNaicsCategories();

            assert.equal(res.statusCode, 200);
            assert.equal(res.data.success, true);
            assert(res.data.naics_categories['Accommodation and Food Services']);
            assert(
                res.data.naics_categories['Accommodation and Food Services'][0].code,
            );
        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Get Document Types', function () {
    this.timeout(300000);
    getDocumentTypesTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.getDocumentTypes(test.pagination);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
                if (res.statusCode === 200) {
                    assert.isAtLeast(res.data.document_types.length, test.returnedCount);
                    assert.isObject(res.data.pagination);
                }
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Get Entities', function () {
    this.timeout(300000);
    getEntitiesTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.getEntities(test.entityType, test.options);

                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.isAtLeast(
                    res.data.entities.individuals.length,
                    test.individualAmount,
                );
                assert.isAtLeast(
                    res.data.entities.businesses.length,
                    test.businessAmount,
                );
                if (test.options) {
                    assert.equal(res.data.pagination.current_page, test.options.page);
                    assert.equal(
                        res.data.pagination.returned_count,
                        test.options.perPage,
                    );
                }
            } catch (err) {
                assert.fail(err);
            }
        });
    });
});

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

describe('Get Transactions', function () {
    this.timeout(300000);
    getTransactionsTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.getTransactions(test.handle, test.key);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Link business member', function () {
    this.timeout(300000);
    linkBusinessMemberTests.forEach((member) => {
        it(`${member.user_handle} should be linked`, async () => {
            try {
                const res = await sila.linkBusinessMember(
                    member.user_handle,
                    member.user_private_key,
                    member.business_handle,
                    member.business_private_key,
                    member.role,
                    member.member_handle,
                    member.details,
                    member.ownership_stake,
                );

                assert.equal(res.statusCode, 200);
                assert(res.data.success);
            } catch (err) {
                assert.fail(err);
            }
        });
    });
});

describe('Unlink business member', function () {
    this.timeout(300000);
    it(`second admin should be unlinked`, async () => {
        try {
            const res = await sila.unlinkBusinessMember(
                handles[1],
                wallets[1].privateKey,
                handles[4],
                wallets[5].privateKey,
                'administrator',
            );

            assert.equal(res.statusCode, 200);
            assert(res.data.success);
        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Get Entity', function () {
    this.timeout(300000);
    getEntityTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.getEntity(test.handle, test.key, test.options);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
                assert.equal(
                    res.data.user_handle.toLowerCase(),
                    test.handle.toLowerCase(),
                );
                if (test.registration_state) {
                    assert.equal(res.data.entity.registration_state, test.registration_state);
                }
                if (
                    test.options &&
                    test.options.prettyDates &&
                    test.statusCode === 200
                ) {
                    assert.isString(res.data.entity.created);
                    assert.isString(res.data.emails[0].added);
                    assert.isString(res.data.emails[0].modified);
                    assert.isString(res.data.phones[0].added);
                    assert.isString(res.data.phones[0].modified);
                    assert.isString(res.data.identities[0].added);
                    assert.isString(res.data.identities[0].modified);
                    assert.isString(res.data.addresses[0].added);
                    assert.isString(res.data.addresses[0].modified);
                }
                if (test.saveReference) {
                    registrationData.push(res.data.emails[0].uuid);
                    registrationData.push(res.data.phones[0].uuid);
                    registrationData.push(res.data.identities[0].uuid);
                    registrationData.push(res.data.addresses[0].uuid);
                }
            } catch (err) {
                assert.fail(err);
            }
        });
    });
});

describe('Delete Email', function () {
    this.timeout(300000);
    deleteEmailTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const uuid =
                    test.uuid !== undefined ? registrationData[test.uuid] : test.uuid;
                const res = await sila.deleteEmail(test.handle, test.key, uuid);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.status, test.status);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Delete Phone', function () {
    this.timeout(300000);
    deletePhoneTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const uuid = test.uuid ? registrationData[test.uuid] : test.uuid;
                const res = await sila.deletePhone(test.handle, test.key, uuid);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.status, test.status);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Delete Identity', function () {
    this.timeout(300000);
    deleteIdentityTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const uuid = test.uuid ? registrationData[test.uuid] : test.uuid;
                const res = await sila.deleteIdentity(test.handle, test.key, uuid);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.status, test.status);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Delete Address', function () {
    this.timeout(300000);
    deleteAddressTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const uuid = test.uuid ? registrationData[test.uuid] : test.uuid;
                const res = await sila.deleteAddress(test.handle, test.key, uuid);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.status, test.status);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Add Email', function () {
    this.timeout(300000);
    addEmailTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.addEmail(test.handle, test.key, test.email);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
                if (res.statusCode === 200) registrationData.push(res.data.email.uuid);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Add Phone', function () {
    this.timeout(300000);
    addPhoneTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.addPhone(test.handle, test.key, test.phone, {
                    smsOptIn: test.smsOptIn,
                });
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
                assert.match(res.data.message, test.messageRegex);
                if (res.statusCode === 200) {
                    registrationData.push(res.data.phone.uuid);
                    assert.equal(res.data.phone.phone, test.phone);
                    assert.equal(
                        res.data.phone.sms_confirmation_requested,
                        test.smsOptIn ? test.smsOptIn : false,
                    );
                }
            } catch (e) {
                assert.fail(e);
            }
        });
    })
});

describe('Add Identity', function () {
    this.timeout(300000);
    addIdentityTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.addIdentity(
                    test.handle,
                    test.key,
                    test.identity,
                );
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
                if (res.statusCode === 200)
                    registrationData.push(res.data.identity.uuid);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Add Address', function () {
    this.timeout(300000);
    addAddressTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.addAddress(test.handle, test.key, test.address);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
                if (res.statusCode === 200)
                    registrationData.push(res.data.address.uuid);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Add Device', function () {
    this.timeout(300000);
    addDeviceTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.addDevice(test.handle, test.key, test.device);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
                assert.match(res.data.message, test.messageRegex);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Update Email', function () {
    this.timeout(300000);
    updateEmailTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const email = Object.assign({}, test.email);
                email.uuid = test.email.uuid
                    ? registrationData[test.email.uuid]
                    : test.email.uuid;
                const res = await sila.updateEmail(test.handle, test.key, email);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Update Phone', function () {
    this.timeout(300000);
    updatePhoneTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const phone = Object.assign({}, test.phone);
                phone.uuid = test.phone.uuid
                    ? registrationData[test.phone.uuid]
                    : test.phone.uuid;
                const res = await sila.updatePhone(test.handle, test.key, phone);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
                assert.match(res.data.message, test.messageRegex);
                if (res.statusCode === 200) {
                    assert.equal(res.data.phone.phone, test.phone.phone);
                }
            } catch (e) {
                assert.fail(e);
            }
        });
    })
});

describe('Update Identity', function () {
    this.timeout(300000);
    updateIdentityTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const identity = Object.assign({}, test.identity);
                identity.uuid = test.identity.uuid
                    ? registrationData[test.identity.uuid]
                    : test.identity.uuid;
                const res = await sila.updateIdentity(test.handle, test.key, identity);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Update Address', function () {
    this.timeout(300000);
    updateAddressTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const address = Object.assign({}, test.address);
                address.uuid = test.address.uuid
                    ? registrationData[test.address.uuid]
                    : test.address.uuid;
                const res = await sila.updateAddress(test.handle, test.key, address);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Update Entity', function () {
    this.timeout(300000);
    updateEntityTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.updateEntity(
                    test.handle,
                    test.privateKey,
                    test.entity,
                );
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
                assert.isTrue(res.data.user_handle.includes(test.handle.toLowerCase()));
                assert.isNumber(res.data.entity.created_epoch);
                assert.equal(res.data.entity.entity_name, test.entity.entity_name);
                if (res.data.entity_type === 'individual') {
                    assert.equal(res.data.entity.birthdate, test.entity.birthdate);
                    assert.equal(res.data.entity.first_name, test.entity.first_name);
                    assert.equal(res.data.entity.last_name, test.entity.last_name);
                } else if (res.data.entity_type === 'business') {
                    assert.equal(
                        res.data.entity.business_type,
                        test.entity.business_type,
                    );
                    assert.equal(res.data.entity.naics_code, test.entity.naics_code);
                    assert.equal(
                        res.data.entity.doing_business_as,
                        test.entity.doing_business_as,
                    );
                    assert.equal(
                        res.data.entity.business_website,
                        test.entity.business_website,
                    );
                    assert.equal(
                        res.data.entity.registration_state,
                        test.entity.registration_state,
                    );
                }
            } catch (e) {
                assert.fail(e);
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
                let res = await sila.checkKYC(test.handle, test.key, test.kycLevel);
                let { statusCode } = res;
                let { status, message } = res.data;

                while (
                    statusCode === 200 &&
                    status === 'FAILURE' &&
                    message.includes('pending') &&
                    !message.includes('passed')
                ) {
                    await sleep(30000, test.description); // eslint-disable-line no-await-in-loop
                    res = await sila.checkKYC(test.handle, test.key, test.kycLevel); // eslint-disable-line no-await-in-loop

                    ({ statusCode } = res);
                    ({ status, message } = res.data);
                }
                assert.equal(statusCode, test.statusCode);
                assert.equal(status, test.expectedResult);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Successful Check Partner KYC', function () {
    this.timeout(300000);
    checkPartnerKYCTests.forEach((test) => {
        it(test.description, async () => {
            try {
                let res = await sila.checkPartnerKyc({
                    query_app_handle: test.query_app_handle,
                    query_user_handle: test.query_user_handle
                });
                assert.isNotNull(res.data.success);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Upload Document', function () {
    this.timeout(300000);
    uploadDocumentTests.forEach((test) => {
        it(test.description, async () => {
            try {
                if (!test.multiple) {
                    const res = await sila.uploadDocument(
                        test.handle,
                        test.key,
                        test.document,
                    );
                    assert.equal(res.statusCode, test.statusCode);
                    assert.equal(res.data.success, test.expectedResult);
                    assert.equal(res.data.status, test.status);
                    if (res.statusCode === 200) {
                        assert.isString(res.data.reference_id);
                        documentReferences.push(res.data.document_id);
                        assert.isString(res.data.document_id);
                    }
                } else {
                    const res = await sila.uploadDocuments(
                        test.handle,
                        test.key,
                        test.document,
                    );
                    assert.equal(res.statusCode, test.statusCode);
                    assert.equal(res.data.success, test.expectedResult);
                    assert.equal(res.data.status, test.status);
                    if (res.statusCode === 200) {
                        assert.isString(res.data.reference_id);
                        assert.isArray(res.data.document_id);
                        for (let i=0;i<res.data.document_id.length;i++)
                            documentReferences.push(res.data.document_id[i]);
                    }
                }

            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('List Documents', function () {
    this.timeout(300000);
    listDocumentsTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.listDocuments(
                    test.handle,
                    test.key,
                    test.filters,
                );
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
                if (res.data.statusCode === 200) {
                    assert.isArray(res.data.documents);
                    assert.isAtLeast(res.data.documents.length, test.documentsLength);
                    assert.isObject(res.data.pagination);
                }
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Get Document', function () {
    this.timeout(300000);
    getDocumentTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const documentId =
                    test.documentIndex !== undefined && test.documentIndex !== null
                        ? documentReferences[test.documentIndex]
                        : undefined;
                const res = await sila.getDocument(test.handle, test.key, documentId);
                assert.equal(res.statusCode, test.statusCode);
                if (res.statusCode === 200) {
                    assert.isString(res.data);
                    assert.equal(res.headers['content-type'], test.contentType);
                } else if (res.statusCode === 400) {
                    assert.equal(res.data.success, test.expectedResult);
                    assert.equal(res.data.status, test.status);
                }
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Certify Beneficial Owner', function () {
    this.timeout(300000);
    it(`Successfully certify beneficial owner`, async () => {
        try {
            const res = await sila.certifyBeneficialOwner(
                handles[0],
                wallets[0].privateKey,
                handles[4],
                wallets[5].privateKey,
                handles[3],
                (await sila.getEntity(handles[3], wallets[4].privateKey)).data
                    .memberships[0].certification_token,
            );
            assert.equal(res.statusCode, 200);
            assert(res.data.success);
        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Certify Business', function () {
    this.timeout(300000);
    it(`Successfully certify business`, async () => {
        try {
            const res = await sila.certifyBusiness(
                handles[0],
                wallets[0].privateKey,
                handles[4],
                wallets[5].privateKey,
            );

            assert.equal(res.statusCode, 200);
            assert(res.data.success);
        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Plaid Link Token', function () {
    this.timeout(300000);
    it("Successfully generate plaid token.", async () => {
        try {
            const res = await sila.plaidLinkToken(handles[0], wallets[0].privateKey);

            assert.isTrue(res.data.success);
            assert.isDefined(res.data.link_token);
        } catch (error) {
            assert.fail(error);
        }
    })
})

describe('MX Processor Token', function () {
    this.timeout(300000);
    it("Successfully generate MX Processor token.", async () => {
        try {
            const res = await MxProcessorToken();
            assert.isDefined(res.token);
        } catch (error) {
            assert.fail(error);
        }
    })
})

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
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Delete Account', function () {
    this.timeout(300000);
    it('Successfully delete account', async () => {
        try {
            const res = await sila.deleteAccount(handles[0], "delete", wallets[0].privateKey);

            assert.equal(res.data.account_name, "delete")
        } catch (error) {
            assert.fail(error);
        }
    });
})

describe('Update Account', function () {
    this.timeout(300000);
    it('Successfully update account', async () => {
        try {
            const res = await sila.updateAccount({
                account_name: 'forupdate',
                new_account_name: 'updated',
            },handles[0], wallets[0].privateKey);

            assert.isTrue(res.data.success);
            assert.equal(res.data.account.account_name, "updated");
            assert.isNotNull(res.data.account.web_debit_verified);

        } catch (error) {
            assert.fail(error);
        }
    });
})

describe('Update Account:Freeze Account', function () {
    this.timeout(300000);
    it('Successfully update account', async () => {
        try {
            const res = await sila.updateAccount({
                account_name: 'updated',
                active: false,
            },handles[0], wallets[0].privateKey);

            assert.isTrue(res.data.success);
            assert.equal(res.data.account.account_name, "updated");
            assert.equal(res.data.account.active, false);

        } catch (error) {
            assert.fail(error);
        }
    });
})

describe('Update Account: Unfreeze the freeze account', function () {
    this.timeout(300000);
    it('Successfully update account', async () => {
        try {
            const res = await sila.updateAccount({
                account_name: 'updated',
                active: true,
            },handles[0], wallets[0].privateKey);

            assert.isTrue(res.data.success);
            assert.equal(res.data.account.account_name, "updated");
            assert.equal(res.data.account.active, true);

        } catch (error) {
            assert.fail(error);
        }
    });
})

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
                    test.plaidTokenType
                );
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.status, test.expectedResult);
                assert.isNotNull(res.data.web_debit_verified);

            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Link Account - MX Token tests', function () {
    this.timeout(300000);
    linkAccountMXTests.forEach((test) => {
        it(test.description, async () => {
            let token;

            if (test.token) {
                ({ token } = test);
            } else {
                const res = await MxProcessorToken();
                ({ token } = res);
            }
            try {
                const res = await sila.linkAccountMX(
                    test.handle,
                    test.key,
                    test.providerTokenType,
                    token,
                    test.accountName,
                );
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.status, test.expectedResult);

            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Check Instant ACH', function () {
    this.timeout(300000);
    checkInstantAchTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.checkInstantAch(
                    { account_name: test.accountName, kyc_level: test.kycLevel },
                    test.handle,
                    test.key
                );
                assert.isNotNull(res.statusCode);
                assert.isNotNull(res.data.status);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Plaid Update Link Token', function () {
    this.timeout(300000);
    it("Successfully update plaid token.", async () => {
        try {
            const res = await sila.plaidUpdateLinkToken({account_name: 'defaultpt' }, handles[0]);

            assert.isDefined(res.data.status);
            assert.isDefined(res.data.message);
        } catch (error) {
            assert.fail(error);
        }
    })
})

describe('Get Accounts', function () {
    this.timeout(300000);
    getAccountsTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.getAccounts(test.handle, test.key);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.length, test.accounts);
                assert.isNotNull(res.data[0].web_debit_verified);

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
                    test.default,
                    test.statementsEnabled,
                );
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                if (test.expectedResult == true){
                assert.equal(res.data.statements_enabled, test.statementsEnabled);
            }
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
                const res = await sila.getWallets(test.handle, test.key, test.filters, test.statementsEnabled);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.wallets.length, test.wallets);
                assert.equal(res.data.wallets[0].statements_enabled, test.statementsEnabled);
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
                    scenario.statementsEnabled,
                );
                assert.equal(res.statusCode, scenario.statusCode);
                assert.equal(res.data.success, scenario.expectedResult);
                assert.equal(res.data.wallet.statements_enabled, scenario.statementsEnabled);
                assert.equal(res.data.changes.length, scenario.changes);
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
                assert.equal(res.data.wallet.statements_enabled, test.statementsEnabled);
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
            } catch (err) {
                assert.fail(err);
            }
        });
    });
});

describe('Cancel Transaction', function () {
    this.timeout(300000);
    cancelTransactionTests.forEach((test) => {
        it(test.description, async () => {
            try {
                let transactionid;
                if (test.generateIssueTransaction) {
                    const issueRes = await sila.issueSila(100, test.handle, test.key);
                    assert.equal(issueRes.statusCode, 200);
                    transactionid = issueRes.data.transaction_id;
                    await sleep(3000, test.description);
                }
                const res = await sila.cancelTransaction(
                    test.handle,
                    test.key,
                    transactionid,
                );
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Link Card', function () {
    this.timeout(300000);
    it("Successfully linked the Card.", async () => {
        try {
            const resToken = await linkCardToken();
            const cardObj = {
                "card_name":"visa",
                "account_postal_code":"12345",
                "token":resToken
            }
            const res = await sila.linkCard(
                handles[0],
                wallets[0].privateKey,
                cardObj,
            );
            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');

        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Get Cards', function () {
    this.timeout(300000);
    it("Successfully Get Card List.", async () => {
        try {
            const res = await sila.getCards(handles[0], wallets[0].privateKey);
            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');
            assert(res.data.cards.length > 0);

        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Reverse Transaction', function () {
    this.timeout(300000);
    let transactionid;
    reverseIssueSilaTransactionTests.forEach((test) => {
        it(test.description, async () => {
            try {
                if (test.actionType == "issueSila") {

                    let res = await sila.issueSila(100, test.handle, test.key, test.accountName, test.descriptor,test.businessUuid,test.processingType,'visa');
                    assert.equal(res.statusCode, 200);
                    transactionid = res.data.transaction_id;

                    assert.equal(res.data.success, test.expectedResult);
                    assert.equal(res.data.status, test.status);

                } else if (test.actionType == "getTransactions") {

                    let filters = {'transaction_id': transactionid};
                    let res = await sila.getTransactions(test.handle, test.key, filters);
                    let { statusCode } = res;
                    let { success } = res.data;

                    let {
                        status
                    } = res.data.transactions[0];

                    while (
                        statusCode === 200 &&
                        success &&
                        (status === 'pending' || status === 'queued')
                    ) {
                        await sleep(30000, test.description);
                        res = await sila.getTransactions(test.handle, test.key, filters);
                        ({ statusCode } = res);
                        ({ success } = res.data);
                        [{ status}] = res.data.transactions;
                    }

                } else if (test.actionType == "reverseTransaction") {
                    let res = await sila.reverseTransaction(
                        test.handle,
                        test.key,
                        transactionid,
                    );
                    assert.equal(res.data.success, test.expectedResult);
                    assert.equal(res.data.status, test.status);
                }

            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Issue Sila', function () {
    this.timeout(300000);
    issueSilaTests.forEach((test) => {
        it(test.description, async () => {
            try {
                let accountName = undefined;
                let cardName = undefined;
                if(test.accountName) {
                    accountName = test.accountName;
                }
                if(test.cardName) {
                    cardName = test.cardName;
                }
                const res = await sila.issueSila(
                    test.amount,
                    test.handle,
                    test.key,
                    accountName,
                    test.descriptor,
                    test.businessUuid,
                    test.processingType,
                    cardName,
                );
                if (res.statusCode === 200) issueReferences.push(res.data.reference);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.status, test.expectedResult);
                if (res.data.status === 'SUCCESS')
                    assert.isString(res.data.transaction_id);
                if (res.statusCode === 403)
                    assert.equal(res.data.error_code, 'INSTANT_ACH_MAX_AMOUNT');
                if (test.descriptor && res.data.descriptor)
                    assert.equal(res.data.descriptor, test.descriptor);
            } catch (err) {
                assert.fail(err);
            }
        });
    });
});

describe('Poll Issue Sila', function () {
    this.timeout(400000);
    pollIssueTests.forEach((test) => {
        it(test.description, async () => {
            await pollGetTransactionsTest(test, issueReferences);
        });
    });
});

describe('Issue Sila Transaction Idempotency Test ', function () {
    this.timeout(300000);
    let localTransIds = [];
    idempotencySilaTransactionTests.forEach((test) => {
        it(test.description, async () => {
            try {
                let accountName = undefined;
                let cardName = undefined;
                if(test.accountName) {
                    accountName = test.accountName;
                }
                if(test.cardName) {
                    cardName = test.cardName;
                }
                const res = await sila.issueSila(
                    test.amount,
                    test.handle,
                    test.key,
                    accountName,
                    test.descriptor,
                    test.businessUuid,
                    test.processingType,
                    cardName,
                    test.source_id,
                    test.destination_id,
                    test.transaction_idempotency_id,
                );

                if (res.statusCode === 200) idempotencyIssueReferences.push(res.data.reference);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.status, test.expectedResult);
                if (res.data.status === 'SUCCESS'){
                    assert.isString(res.data.transaction_id);
                    if (!localTransIds.includes(res.data.transaction_id)) {
                        localTransIds.push(res.data.transaction_id);
                    }
                    assert.equal(localTransIds.length, 1);

                }
                if (res.statusCode === 403)
                    assert.equal(res.data.error_code, 'INSTANT_ACH_MAX_AMOUNT');
                if (test.descriptor && res.data.descriptor)
                    assert.equal(res.data.descriptor, test.descriptor);
            } catch (err) {
                assert.fail(err);
            }
        });
    });
});

describe('Poll Idempotency Issue Sila', function () {
    this.timeout(400000);
    pollIssueTests.forEach((test) => {
        it(test.description, async () => {
            await pollGetTransactionsTest(test, idempotencyIssueReferences);
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
                    test.descriptor,
                    test.businessUuid,
                );
                if (res.statusCode === 200) transferReferences.push(res.data.reference);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.status, test.expectedResult);
                if (res.data.status === 'SUCCESS') {
                    assert.isString(res.data.transaction_id);
                    assert.isString(res.data.destination_address);
                }
                if (test.descriptor && res.data.descriptor)
                    assert.equal(res.data.descriptor, test.descriptor);
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

describe('Transfer Sila Idempotency Test', function () {
    this.timeout(300000);
    let localTransIds = [];
    transferSilaIdempotencyTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.transferSila(
                    test.amount,
                    test.handle,
                    test.key,
                    test.destinationHanle,
                    test.walletNickname,
                    test.walletAddress,
                    test.descriptor,
                    test.businessUuid,
                    test.source_id,
                    test.destination_id,
                    test.transaction_idempotency_id,
                );
                if (res.statusCode === 200) idempotencyTransferReferences.push(res.data.reference);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.status, test.expectedResult);
                if (res.data.status === 'SUCCESS') {
                    if (!localTransIds.includes(res.data.transaction_id)) {
                        localTransIds.push(res.data.transaction_id)
                    }
                    assert.equal(localTransIds.length, 1);
                    assert.isString(res.data.transaction_id);
                    assert.isString(res.data.destination_address);
                }
                if (test.descriptor && res.data.descriptor)
                    assert.equal(res.data.descriptor, test.descriptor);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Poll Transfer Sila Idempotency', function () {
    this.timeout(300000);
    pollTransferTests.forEach((test) => {
        it(test.description, async () => {
            await pollGetTransactionsTest(test, idempotencyTransferReferences);
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
                let accountName = undefined;
                let cardName = undefined;
                if(test.accountName) {
                    accountName = test.accountName;
                }
                if(test.cardName) {
                    cardName = test.cardName;
                }
                const res = await sila.redeemSila(
                    test.amount,
                    test.handle,
                    test.key,
                    accountName,
                    test.descriptor,
                    test.businessUuid,
                    test.processingType,
                    cardName,
                    test.source_id,
                    test.destination_id,
                    test.mockWireAccountName
                );
                if (test.processingType == 'WIRE' && !mockWireTransactionId_1) {
                    mockWireTransactionId_1 = res.data.transaction_id;
                }

                if (res.statusCode === 200) redeemReferences.push(res.data.reference);
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.status, test.expectedResult);
                if (res.data.status === 'SUCCESS')
                    assert.isString(res.data.transaction_id);
                if (test.descriptor && res.data.descriptor)
                    assert.equal(res.data.descriptor, test.descriptor);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Redeem Sila Idempotency Test', function () {
    this.timeout(300000);
    let localTransIds = [];
    redeemSilaIdempotencyTests.forEach((test) => {
        it(test.description, async () => {
            try {
                let accountName = undefined;
                let cardName = undefined;
                if(test.accountName) {
                    accountName = test.accountName;
                }
                if(test.cardName) {
                    cardName = test.cardName;
                }
                const res = await sila.redeemSila(
                    test.amount,
                    test.handle,
                    test.key,
                    accountName,
                    test.descriptor,
                    test.businessUuid,
                    test.processingType,
                    cardName,
                    test.source_id,
                    test.destination_id,
                    test.mockWireAccountName,
                    test.transaction_idempotency_id,
                );

                if (res.statusCode === 200)
                    assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.status, test.expectedResult);
                if (res.data.status === 'SUCCESS') {
                    assert.isString(res.data.transaction_id);
                    if (!localTransIds.includes(res.data.transaction_id)) {
                        localTransIds.push(res.data.transaction_id)
                    }
                    assert.equal(localTransIds.length, 1);
                }

                if (test.descriptor && res.data.descriptor)
                    assert.equal(res.data.descriptor, test.descriptor);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Approve Wire:Approve', function () {
    this.timeout(300000);
    it('Successfully approve Wire', async () => {
        try {
            var loop_payload = {
                "handle": handles[0],
                "search_filters": {
                    'transaction_id': mockWireTransactionId_1,
                }
            };

            let transactionRes = await sila.getTransactions(loop_payload.handle, wallets[0].privateKey,loop_payload.search_filters);
            let { statusCode } = transactionRes;
            let { success } = transactionRes.data;

            let { provider_status } = transactionRes.data.transactions[0];

            while (
                statusCode === 200 &&
                success &&
                (provider_status !== 'pending_approval')
            ) {
                await sleep(3000, 'Get Transction..');
                transactionRes = await sila.getTransactions(loop_payload.handle, wallets[0].privateKey,loop_payload.search_filters);
                ({ statusCode } = transactionRes);
                ({ success } = transactionRes.data);
                ({ provider_status} = transactionRes.data.transactions[0]);
            }

            let payload = {
                "approve":true,
                "transaction_id":mockWireTransactionId_1,
                "notes":null,
                "mock_wire_account_name":"mock_account_success"
            }
            const res = await sila.approveWire(handles[0], wallets[0].privateKey, payload);
            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');

        } catch (e) {
            assert.fail(e);
        }
    });
});

describe('Mock Wire Out File', function () {
    this.timeout(300000);
    it('Successfully update status mock wire out file', async () => {
        try {
            await sleep(30000, 'Mock Wire Out File');
            let payload = {
                "wire_status":"PR",
                "transaction_id":mockWireTransactionId_1
            }
            const res = await sila.mockWireOutFile(handles[0], wallets[0].privateKey, payload);
            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');

        } catch (e) {
            assert.fail(e);
        }
    });
});

describe('Open Virtual Account', function () {
    this.timeout(300000);
    openVirtualAccountTests.forEach((test) => {
        it(test.description, async () => {
            try {
                var payload = {
                    "ach_debit_enabled":true,
                    "ach_credit_enabled":false,
                    "virtual_account_name":test.virtual_account_name,
                    "statements_enabled": true,
                }
                const res = await sila.openVirtualAccount(test.handle, test.key, payload);
                if (!paymentMethodsIds['virtual_account_number_1']) {
                    paymentMethodsIds['virtual_account_number_1'] = res.data.virtual_account.account_number;
                    paymentMethodsIds['virtual_account_id_1'] = res.data.virtual_account.virtual_account_id;
                } else if (!paymentMethodsIds['virtual_account_number_2']) {
                    paymentMethodsIds['virtual_account_number_2'] = res.data.virtual_account.account_number;
                    paymentMethodsIds['virtual_account_id_2'] = res.data.virtual_account.virtual_account_id;
                }

                assert.equal(res.statusCode, test.statusCode);
                assert.isTrue(res.data.success);
                assert.equal(res.data.status, test.expectedResult);
                assert.equal(res.data.virtual_account.virtual_account_name, test.virtual_account_name);
                assert.equal(res.data.virtual_account.ach_debit_enabled, true);
                assert.equal(res.data.virtual_account.ach_credit_enabled, false);
                assert.equal(res.data.virtual_account.statements_enabled, true);
                test.virtual_account_id = res.data.virtual_account.virtual_account_id;
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Update Virtual Account', function () {
    this.timeout(300000);
    it('Successfully update virtual account', async () => {
        try {
            let payload = {
                "ach_debit_enabled":true,
                "ach_credit_enabled":false,
                "virtual_account_name":openVirtualAccountTests[0]['virtual_account_name'],
                "virtual_account_id":paymentMethodsIds['virtual_account_id_1'],
                "statements_enabled":true,
            }
            const res = await sila.updateVirtualAccount(handles[0], wallets[0].privateKey, payload);
            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');
            assert.equal(res.data.virtual_account.ach_debit_enabled, true);
            assert.equal(res.data.virtual_account.ach_credit_enabled, false);
            assert.equal(res.data.virtual_account.statements_enabled, true);
        } catch (e) {
            assert.fail(e);
        }
    });
});

describe('Get Virtual Account', function () {
    this.timeout(300000);
    it('Successfully get virtual account', async () => {
        try {
            const res = await sila.getVirtualAccount(handles[0], wallets[0].privateKey, openVirtualAccountTests[0].virtual_account_id);
            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');
            assert.isNotNull(res.data.virtual_account.virtual_account_name);
            assert.equal(res.data.virtual_account.ach_debit_enabled, true);
            assert.equal(res.data.virtual_account.ach_credit_enabled, false);

        } catch (e) {
            assert.fail(e);
        }
    });
});

describe('Get Virtual Accounts', function () {
    this.timeout(300000);
    it('Successfully get all virtual accounts', async () => {
        try {
            const res = await sila.getVirtualAccounts(handles[0], wallets[0].privateKey);
            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');
            assert(res.data.virtual_accounts.length > 0);
            assert.equal(res.data.virtual_accounts[0].ach_debit_enabled, true);
            assert.equal(res.data.virtual_accounts[0].ach_credit_enabled, false);

        } catch (e) {
            assert.fail(e);
        }
    });
});

describe('Get Payment Methods', function () {
    this.timeout(300000);
    it('Successfully get all payment methods', async () => {
        try {
            const res = await sila.getPaymentMethods(handles[0], wallets[0].privateKey);
            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');
            assert(res.data.payment_methods.length > 0);

            for (let index = 0; index < res.data.payment_methods.length; index++) {
                if (res.data.payment_methods[index]['payment_method_type'] == "bank_account" && res.data.payment_methods[index]['account_type'] == "CHECKING"){
                    paymentMethodsIds['bank_account_id'] = res.data.payment_methods[index]['bank_account_id'];
                } else if (res.data.payment_methods[index]['payment_method_type'] == "virtual_account" && !paymentMethodsIds['virtual_account_id_1']){
                    paymentMethodsIds['virtual_account_id_1'] = res.data.payment_methods[index]['virtual_account_id'];
                    assert.isNotNull(res.data.payment_methods[index]['ach_credit_enabled']);
                    assert.isNotNull(res.data.payment_methods[index]['ach_debit_enabled']);

                } else if (res.data.payment_methods[index]['payment_method_type'] == "virtual_account" && !paymentMethodsIds['virtual_account_id_2']){
                    paymentMethodsIds['virtual_account_id_2'] = res.data.payment_methods[index]['virtual_account_id'];
                    assert.isNotNull(res.data.payment_methods[index]['ach_credit_enabled']);
                    assert.isNotNull(res.data.payment_methods[index]['ach_debit_enabled']);

                } else if (res.data.payment_methods[index]['payment_method_type'] == "card"){
                    paymentMethodsIds['card_id'] = res.data.payment_methods[index]['card_id'];
                } else if (res.data.payment_methods[index]['payment_method_type'] == "blockchain_address"){
                    paymentMethodsIds['blockchain_address_id'] = res.data.payment_methods[index]['blockchain_address_id'];
                }
            }

        } catch (e) {
            assert.fail(e);
        }
    });
});

describe('Issue Sila From Bank To Virtual Account And Verify Transaction', function () {
    this.timeout(300000);
    it('Successfully issueSila to virtual account-1', async () => {
        try {
            var payload = {
                "amount": 200,
                "source_id": paymentMethodsIds['bank_account_id'],
                "destination_id": paymentMethodsIds['virtual_account_id_1']
            };
            const res = await sila.issueSila(payload.amount, handles[0], wallets[0].privateKey,payload.account_name,payload.descriptor,'',payload.processing_type,payload.card_name,payload.source_id, payload.destination_id);

            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');

        } catch (e) {
            assert.fail(e);
        }
    });

    it('Successfully issueSila to virtual account-2', async () => {
        try {
            var payload = {
                "amount": 200,
                "source_id": paymentMethodsIds['bank_account_id'],
                "destination_id": paymentMethodsIds['virtual_account_id_2']
            };
            const res = await sila.issueSila(payload.amount, handles[0], wallets[0].privateKey,payload.account_name,payload.descriptor,'',payload.processing_type,payload.card_name,payload.source_id, payload.destination_id);

            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');

        } catch (e) {
            assert.fail(e);
        }
    });

    this.timeout(300000);
    it('Get IssueSila Transaction to Validate source and destination id', async () => {
        try {
            var filters = {
                "transaction_types": ["issue"],
                "source_id":paymentMethodsIds['bank_account_id'],
            };

            let res = await sila.getTransactions(handles[0], wallets[0].privateKey, filters);
            let { statusCode } = res;
            let { success } = res.data;

            let {
                status
            } = res.data.transactions[0];

            while (
                statusCode === 200 &&
                success &&
                (status === 'pending' || status === 'queued')
            ) {
                await sleep(30000, 'Get IssueSila Transaction to Validate source and destination id');
                res = await sila.getTransactions(handles[0], wallets[0].privateKey, filters);
                ({ statusCode } = res);
                ({ success } = res.data);
                ({ status} = res.data.transactions[0]);
            }
            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');
            assert.isNotNull(res.data.transactions[0]['source_id']);
            assert.isNotNull(res.data.transactions[0]['destination_id']);
            assert.isNotNull(res.data.transactions[0]['sila_ledger_type']);
            assert.hasAnyKeys(res.data.transactions[0], ['sec_code'])


        } catch (e) {
            assert.fail(e);
        }
    });
});

describe('Redeem Sila From Virtual Account to card And Verify Transaction', function () {
    this.timeout(300000);

    it('Successfully redeemSila to card', async () => {
        try {
            var payload = {
                "amount": 50,
                "source_id": paymentMethodsIds['virtual_account_id_1'],
                "destination_id": paymentMethodsIds['card_id']
            };
            const res = await sila.redeemSila(payload.amount, handles[0], wallets[0].privateKey,payload.account_name,payload.descriptor,'',payload.processing_type,payload.card_name,payload.source_id, payload.destination_id);

            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');

        } catch (e) {
            assert.fail(e);
        }
    });

    this.timeout(300000);
    it('Successfully redeemSila to virtual account-2', async () => {
        try {
            var payload = {
                "amount": 50,
                "source_id": paymentMethodsIds['virtual_account_id_2'],
                "destination_id": paymentMethodsIds['bank_account_id']
            };
            await sleep(30000, '');
            const res = await sila.redeemSila(payload.amount, handles[0], wallets[0].privateKey,payload.account_name,payload.descriptor,'',payload.processing_type,payload.card_name,payload.source_id, payload.destination_id);

            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');

        } catch (e) {
            assert.fail(e);
        }
    });

    this.timeout(300000);
    it('Get redeemSila Transaction to Validate source and destination id-1', async () => {
        try {
            var filters = {
                "source_id":paymentMethodsIds['virtual_account_id_1'],
                "destination_id": paymentMethodsIds['card_id'],
                "transaction_types": ["redeem"],
            };
            await sleep(30000, '');
            const res = await sila.getTransactions(handles[0], wallets[0].privateKey, filters);

            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');
            assert.isNotNull(res.data.transactions[0]['source_id']);
            assert.isNotNull(res.data.transactions[0]['destination_id']);
            assert.isNotNull(res.data.transactions[0]['sila_ledger_type']);

        } catch (e) {
            assert.fail(e);
        }
    });

    this.timeout(300000);
    it('Get redeemSila Transaction to Validate source and destination id-2', async () => {
        try {
            var filters = {
                "source_id":paymentMethodsIds['virtual_account_id_2'],
                "destination_id": paymentMethodsIds['bank_account_id'],
                "transaction_types": ["redeem"],
            };

            const res = await sila.getTransactions(handles[0], wallets[0].privateKey, filters);

            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');
            assert.isNotNull(res.data.transactions[0]['source_id']);
            assert.isNotNull(res.data.transactions[0]['destination_id']);
            assert.isNotNull(res.data.transactions[0]['sila_ledger_type']);

        } catch (e) {
            assert.fail(e);
        }
    });

});

describe('Transfer Sila Using Source And Destination ID', function () {
    this.timeout(300000);
    it('Transfer Sila from virtual to wallet', async () => {
        try {
            const res = await sila.transferSila(
                50,
                handles[0],
                wallets[0].privateKey,
                handles[0],
                '',
                '',
                '',
                '',
                paymentMethodsIds['virtual_account_id_1'],
                paymentMethodsIds['blockchain_address_id']
            );

            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');
            assert.isNotNull(res.data.source_id);
            assert.isNotNull(res.data.destination_id);

        } catch (e) {
            assert.fail(e);
        }
    });

    this.timeout(300000);
    it('Transfer Sila from virtual to virtual account', async () => {
        try {
            const res = await sila.transferSila(
                50,
                handles[0],
                wallets[0].privateKey,
                handles[0],
                '',
                '',
                '',
                '',
                paymentMethodsIds['virtual_account_id_1'],
                paymentMethodsIds['virtual_account_id_2']
            );

            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');
            assert.isNotNull(res.data.source_id);
            assert.isNotNull(res.data.destination_id);

        } catch (e) {
            assert.fail(e);
        }
    });

    this.timeout(300000);
    it('Get transferSila Transaction to Validate source and destination', async () => {
        try {
            var filters = {
                "source_id":paymentMethodsIds['virtual_account_id_1'],
                "transaction_types": ["transfer"],
            };

            await sleep(60000, '');


            let res = await sila.getTransactions(handles[0], wallets[0].privateKey, filters);

            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');
            assert.isNotNull(res.data.transactions[0]['source_id']);
            assert.isNotNull(res.data.transactions[0]['destination_id']);
            assert.isNotNull(res.data.transactions[0]['sila_ledger_type']);
            assert.isNotNull(res.data.transactions[0]['destination_sila_ledger_type']);


        } catch (e) {
            assert.fail(e);
        }
    });
});

describe('Delete Card', function () {
    this.timeout(300000);
    it("Successfully Deleted the Card.", async () => {
        try {
            let cardName = 'visa';
            let provider = 'evolve';
            const res = await sila.deleteCard(
                handles[0],
                wallets[0].privateKey,
                cardName,
                provider
            );

            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');

        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Get Webhooks', function () {
    this.timeout(300000);
    getWebhooksTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.getWebhooks(test.handle, test.key, test.filters);
                if (res.data.webhooks[0]) {
                    eventUuid = res.data.webhooks[0]['uuid']
                }
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
            } catch (err) {
                assert.fail(err);
            }
        });
    });
});

describe('Retry Webhooks', function () {
    this.timeout(300000);
    it("Successfully Retry Webhooks.", async () => {
        try {
            if (eventUuid) {
                const res = await sila.retryWebhook(
                    handles[0],
                    wallets[0].privateKey,
                    eventUuid,
                );

                assert.equal(res.statusCode, 200);
                assert.isTrue(res.data.success);
                assert.equal(res.data.status, 'SUCCESS');
            } else {
                console.log("Retry Webhooks: Not found any event-uuid in getWebhooks.")
            }
        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Issue Sila For Support INSTANT_SETTLEMENT Product', function () {
    this.timeout(300000);
    it("Successfully Issue Sila For Support INSTANT_SETTLEMENT.", async () => {
        try {
            const res = await sila.issueSila(
                100,
                handles[0],
                wallets[0].privateKey,
                'default',
                '',
                '',
                'INSTANT_SETTLEMENT'
            );

            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');

        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('TransferSila For Support INSTANT_SETTLEMENT Product', function () {
    this.timeout(300000);
    it("Successfully TransferSila For Support INSTANT_SETTLEMENT.", async () => {
        try {
            const res = await sila.transferSila(
                100,
                handles[0],
                wallets[0].privateKey,
                handles[1],
                '',
                '',
                ''
            );

            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');

        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('RedeemSila For Support INSTANT_SETTLEMENT Product', function () {
    this.timeout(300000);
    it("Successfully RedeemSila For Support INSTANT_SETTLEMENT.", async () => {
        try {
            const res = await sila.redeemSila(
                100,
                handles[0],
                wallets[0].privateKey,
                'default',
                '',
                ''
            );
            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');

        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Get Transactions Using Search Filter INSTANT_SETTLEMENT', function () {
    this.timeout(300000);
    it("Successfully Get Transactions INSTANT_SETTLEMENT.", async () => {
        try {
            let search_filters = {
                "processing_type":"INSTANT_SETTLEMENT"
            };

            const res = await sila.getTransactions(
                handles[0],
                wallets[0].privateKey,
                search_filters
            );

            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');
            assert.isArray(res.data.transactions[0]['child_transactions']);
            assert.equal(res.data.transactions[0]['processing_type'], 'INSTANT_SETTLEMENT');

        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Get Transactions Using Search Filter payment_method_id (single virtual account)', function () {
    this.timeout(300000);
    it("Successfully Get Transactions single virtual account.", async () => {
        try {
            let search_filters = {
                "payment_method_id":paymentMethodsIds['virtual_account_id_1']
            };

            const res = await sila.getTransactions(
                handles[0],
                wallets[0].privateKey,
                search_filters
            );

            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');
            assert.isArray(res.data.transactions);

        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Test Virtual Account Ach Transaction', function () {
    this.timeout(300000);
    it("Successfully Test Virtual Account Ach Transaction.", async () => {
        try {
            let payload = {
                "entity_name": "Sally Smith",
                "amount": '4.00',
                "tran_code": 22,
                "virtual_account_number": paymentMethodsIds['virtual_account_number_1'],
                "ced": "PAYROLL",
                "ach_name": "SILA INC"
            }
            const res = await sila.createTestVirtualAccountAchTransaction(
                handles[0],
                wallets[0].privateKey,
                payload
            );
            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');

        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Close Virtual Account', function () {
    this.timeout(300000);
    it("Successfully Close Virtual Account.", async () => {
        try {
            const res = await sila.closeVirtualAccount(
                handles[0],
                wallets[0].privateKey,
                paymentMethodsIds['virtual_account_id_1'],
                paymentMethodsIds['virtual_account_number_1']
            );

            assert.equal(res.statusCode, 200);
            assert.isTrue(res.data.success);
            assert.equal(res.data.status, 'SUCCESS');
            assert.equal(res.data.virtual_account.account_number, paymentMethodsIds['virtual_account_number_1']);
            assert.equal(res.data.virtual_account.statements_enabled, true);
        } catch (err) {
            assert.fail(err);
        }
    });
});

describe('Poll Redeem Sila', function () {
    this.timeout(480000);
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
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Get Wallet Statement Data', function () {
    this.timeout(300000);
    getWalletStatementDataTests.forEach((test) => {
        it(test.description, async () => {
            const wallet_res = await sila.getWallet(test.handle, test.key)
            try {
                const res = await sila.getWalletStatementData(
                    test.handle,
                    test.key,
                    wallet_res.data.wallet.wallet_id,
                    test.filters,
                    );
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Get Statements Data', function () {
    this.timeout(300000);
    getStatementsDataTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.getStatementsData(
                    test.handle,
                    test.filters,
                    );
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});

describe('Statements', function () {
    this.timeout(300000);
    statementsTests.forEach((test) => {
      it(test.description, async () => {
        try {
          const res = await sila.statements(
            test.handle,
            test.searchFilters,
          );
          assert.equal(res.statusCode, test.statusCode);
          assert.equal(res.data.success, test.expectedResult);
          assert.equal(res.data.status, test.status);
        } catch (e) {
          assert.fail(e);
        }
      });
    });
  });


describe('Resend Statements', function () {
    this.timeout(300000);
    resendStatementsTests.forEach((test) => {
        it(test.description, async () => {
            try {
                const res = await sila.resendStatements(
                    test.handle,
                    test.email,
                    test.statementUuid
                    );
                assert.equal(res.statusCode, test.statusCode);
                assert.equal(res.data.success, test.expectedResult);
                assert.equal(res.data.status, test.status);
            } catch (e) {
                assert.fail(e);
            }
        });
    });
});
