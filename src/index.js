import crypto from 'eth-crypto';
import request from 'request';
import uuid4 from 'uuid4';
import Web3 from 'web3';
import fs from 'fs';
import crypt from 'crypto';

import TransactionFilters from './models/transactionFilters';
import User from './models/user';
import Wallet from './models/wallet';
import WalletFilters from './models/walletFilters';

let appKey = null;
let appHandle = null;
let sandbox = true;
let env = 'PROD';
let baseUrl = 'https://sandbox.silamoney.com/0.2/';
let logging = false;

const web3 = new Web3('http://52.13.246.239:8080/');

const url = (path) => baseUrl + path;

const getBalanceURL = () => {
  let balanceURL = '';
  switch (env) {
    case 'PROD':
      balanceURL = sandbox
        ? 'https://sandbox.silatokenapi.silamoney.com/silaBalance'
        : 'https://silatokenapi.silamoney.com/silaBalance';
      break;
    default:
      balanceURL = 'https://test.silatokenapi.silamoney.com/silaBalance';
  }
  return balanceURL;
};
/**
 *
 * @param {String} message The message to sign
 * @param {*} key The key to sign the message with
 */
const sign = (message, key) => {
  if (!appKey || !key) {
    throw new Error('Unable to sign request: keys not set');
  }
  const hash = crypto.hash.keccak256(message);
  const signature = crypto.sign(key, hash);

  if (logging && env !== 'PROD') {
    console.log('*** MESSAGE STRING ***');
    console.log(message);
    console.log('*** HASH ***');
    console.log(hash);
    console.log('*** SIGNING WITH KEY ***');
    console.log(key);
    console.log('*** SIGNATURE (remove leading 0x before sending) ***');
    console.log(signature);
  }
  return signature.substr(2);
};

const configureUrl = () => {
  const app = sandbox ? 'sandbox' : 'api';
  if (env === 'PROD') {
    baseUrl = `https://${app}.silamoney.com/0.2/`;
  } else {
    baseUrl = `https://${env.toLowerCase()}.${app}.silamoney.com/0.2/`;
  }
};

/**
 *
 * @param {*} opts
 * @param {String} key
 * @param {String} businessPrivateKey
 */
const signOpts = (opts, key, businessPrivateKey) => {
  const options = opts;
  if (opts.body.header) {
    options.headers = {};
    const bodyString = JSON.stringify(options.body);
    options.headers.authsignature = sign(bodyString, appKey);
    if (key) options.headers.usersignature = sign(bodyString, key);
    if (businessPrivateKey)
      options.headers.businesssignature = sign(bodyString, businessPrivateKey);
  }
  return options;
};

/**
 * Hashes a file
 * @param {String} filePath The full path to the file
 * @param {String} algorithm The algorithm of the hash
 */
const hashFile = (filePath, algorithm) => {
  const promise = new Promise((res, rej) => {
    const hash = crypt.createHash(algorithm);
    const file = fs.createReadStream(filePath, { autoClose: true });
    file
      .on('data', (data) => {
        hash.update(data);
      })
      .on('end', () => {
        const digest = hash.digest('hex');
        return res(digest);
      })
      .on('error', (error) => {
        rej(error);
      });
  });
  return promise;
};

/**
 *
 * @param {Object} msg The header message
 * @param {String} handle The user handle
 * @param {String} businessHandle
 */
const setHeaders = (msg, handle, businessHandle) => {
  const message = msg;
  message.header.user_handle = handle;
  message.header.business_handle = businessHandle;
  message.header.auth_handle = appHandle;
  message.header.reference = uuid4();
  message.header.created = Math.floor(Date.now() / 1000);
  message.header.crypto = 'ETH';
  message.header.version = '0.2';
  return message;
};

const post = (options) => {
  const promise = new Promise((res, rej) => {
    if (logging && env !== 'PROD') {
      console.log('*** REQUEST ***');
      console.log(options.body);
    }
    request.post(options, (err, response, body) => {
      if (err) {
        rej(err);
      }
      res({
        statusCode: response.statusCode,
        headers: response.headers,
        data: body,
      });
    });
  });
  return promise;
};

const postFile = (options, file) => {
  const promise = new Promise((res, rej) => {
    if (logging && env !== 'PROD') {
      console.log('*** REQUEST ***');
      console.log(options.body);
    }
    const fileOptions = {
      uri: options.uri,
      headers: options.headers,
      formData: {
        data: JSON.stringify(options.body),
        file: fs.createReadStream(file),
      },
    };
    request.post(fileOptions, (err, response, body) => {
      if (err) rej(err);
      res({
        statusCode: response.statusCode,
        headers: response.headers,
        data: JSON.parse(body),
      });
    });
  });
  return promise;
};

/**
 *
 * @param {String} path The path of the request
 * @param {Object} body The body of the request
 * @param {String} privateKey The user's private key
 */
const makeRequest = (
  path,
  body,
  privateKey = undefined,
  business_private_key = undefined,
) => {
  let opts = {
    uri: url(path),
    json: true,
    body,
  };
  opts = signOpts(opts, privateKey, business_private_key);
  return post(opts);
};

const makeFileRequest = (path, body, file, privateKey) => {
  let opts = {
    uri: url(path),
    body,
  };
  opts = signOpts(opts, privateKey);
  return postFile(opts, file);
};

/**
 * Returns the handle with the .silamoney.eth suffix if not present
 * @param {String} handle The handle
 */
const getFullHandle = (handle) => {
  let fullHandle = String(handle);
  if (!fullHandle.endsWith('.silamoney.eth')) {
    fullHandle += '.silamoney.eth';
  }
  return fullHandle;
};

/**
 *
 * @param {String} queryParameters The current query parameters
 * @param {String} name The name of the query parameter
 * @param {String} value The value of the query parameter
 */
const getQueryParameter = (queryParameters, name, value) => {
  let newQueryParameters = queryParameters;
  if (value !== undefined && value !== null) {
    newQueryParameters += newQueryParameters.length > 0 ? '&' : '?';
    newQueryParameters += `${name}=${value}`;
  }
  return newQueryParameters;
};

const getQueryParameters = (parameters) => {
  let queryParameters = '';
  if (parameters) {
    queryParameters = getQueryParameter(
      queryParameters,
      'page',
      parameters.page,
    );
    queryParameters = getQueryParameter(
      queryParameters,
      'per_page',
      parameters.perPage,
    );
    queryParameters = getQueryParameter(
      queryParameters,
      'order',
      parameters.order,
    );
  }
  return queryParameters;
};

/**
 * Makes a call to /check_handle endpoint.
 * @param {String} handle The user handle to check if it's available
 */
const checkHandle = (handle) => {
  const fullHandle = getFullHandle(handle);
  const message = setHeaders({ header: {} }, fullHandle);
  message.message = 'header_msg';

  return makeRequest('check_handle', message);
};

/**
 * Makes a call to /register endpoint.
 * @param {User} user
 */
const register = (user) => {
  const handle = getFullHandle(user.handle);
  const message = setHeaders({ header: {} }, handle);
  message.message = 'entity_msg';

  message.address = {};
  message.address.city = user.city;
  message.address.postal_code = user.zip;
  message.address.state = user.state;
  message.address.street_address_1 = user.address;
  message.address.address_alias = user.addresAlias;
  message.address.country = 'US';

  message.contact = {};
  message.contact.contact_alias = user.contactAlias;
  message.contact.phone = user.phone;
  message.contact.email = user.email;

  message.crypto_entry = {};
  message.crypto_entry.crypto_address = user.cryptoAddress;
  message.crypto_entry.crypto_code = 'ETH';
  message.crypto_entry.crypto_alias = user.cryptoAlias;

  message.entity = {};
  message.entity.birthdate = user.dateOfBirth;
  message.entity.first_name = user.firstName;
  message.entity.last_name = user.lastName;
  message.entity.entity_name = user.entity_name
    ? user.entity_name
    : `${user.firstName} ${user.lastName}`;
  message.entity.relationship = 'user';
  message.entity.type = user.business_type ? 'business' : 'individual';
  message.entity.business_type = user.business_type;
  message.entity.business_website = user.business_website;
  message.entity.doing_business_as = user.doing_business_as;
  message.entity.naics_code = user.naics_code;

  message.identity = {};
  message.identity.identity_value = user.ssn ? user.ssn : user.ein;
  message.identity.identity_alias = user.ssn ? 'SSN' : 'EIN';

  return makeRequest('register', message);
};

/**
 * Makes a call to /request_kyc endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {String} kycLevel The custom kyc level
 */
const requestKYC = (handle, privateKey, kycLevel = undefined) => {
  const fullHandle = getFullHandle(handle);
  const message = setHeaders({ header: {} }, fullHandle);
  message.message = 'header_msg';
  if (kycLevel) message.kyc_level = kycLevel;

  return makeRequest('request_kyc', message, privateKey);
};

/**
 * Makes a call to /check_kyc endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 */
const checkKYC = (handle, privateKey) => {
  const fullHandle = getFullHandle(handle);
  const message = setHeaders({ header: {} }, fullHandle);
  message.message = 'header_msg';

  return makeRequest('check_kyc', message, privateKey);
};

/**
 * Makes a call to /link_account endpoint.
 * This method handles the direct account link flow
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {String} accountNumber The account number
 * @param {String} routingNumber The routing number
 * @param {String} accountName The account nickname
 * @param {String} accountType The account type
 */
const linkAccountDirect = (
  handle,
  privateKey,
  accountNumber,
  routingNumber,
  accountName = undefined,
  accountType = undefined,
) => {
  const fullHandle = getFullHandle(handle);
  const message = setHeaders({ header: {} }, fullHandle);
  message.message = 'link_account_msg';
  message.account_number = accountNumber;
  message.routing_number = routingNumber;
  if (accountType) message.account_type = accountType;
  if (accountName) message.account_name = accountName;

  return makeRequest('link_account', message, privateKey);
};

/**
 * Makes a call to /link_account endpoint.
 * This method handles the plaid's token flow.
 * @param {String} handle The user hanlde
 * @param {String} privateKey The user's wallet private key
 * @param {String} publicToken Plaid's public token
 * @param {String} accountName The account nickname
 * @param {String} accountId The account id
 */
const linkAccount = (
  handle,
  privateKey,
  publicToken,
  accountName = undefined,
  accountId = undefined,
) => {
  const fullHandle = getFullHandle(handle);
  const message = setHeaders({ header: {} }, fullHandle);
  message.message = 'link_account_msg';
  message.public_token = publicToken;
  if (accountId) message.account_id = accountId;
  if (accountName) message.account_name = accountName;

  return makeRequest('link_account', message, privateKey);
};

/**
 * Makes a call to /issue_sila endpoint.
 * @param {Number} amount The amount of sila tokens to issue
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {String} accountName The nickname of the account to debit from. It defaults to 'default' (optional).
 * @param {String} descriptor Optional. Max Length 100. Note that only the first 10 characters show on the resulting bank statement.
 * @param {String} businessUuid Optional. UUID of a business with an approved ACH name. The format should be a UUID string.
 * @param {String} processingType Optional. Choice field. Examples: STANDARD_ACH or SAME_DAY_ACH
 */
const issueSila = (
  amount,
  handle,
  privateKey,
  accountName = 'default',
  descriptor = undefined,
  businessUuid = undefined,
  processingType = undefined,
) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.amount = amount;
  body.message = 'issue_msg';
  body.account_name = accountName;
  if (descriptor) body.descriptor = descriptor;
  if (businessUuid) body.business_uuid = businessUuid;
  body.processing_type = processingType;

  return makeRequest('issue_sila', body, privateKey);
};

/**
 * Makes a call to /redeem_sila endpoint.
 * @param {Number} amount The amount of sila tokens to reedem
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {String} accountName The account nickname to credit with the tokens' value.
 * @param {String} descriptor Optional. Max Length 100
 * @param {String} businessUuid Optional. UUID of a business with an approved ACH name. The format should be a UUID string.
 * @param {String} processingType Optional. Choice field. Examples: STANDARD_ACH or SAME_DAY_ACH
 */
const redeemSila = (
  amount,
  handle,
  privateKey,
  accountName = 'default',
  descriptor = undefined,
  businessUuid = undefined,
  processingType = undefined,
) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.amount = amount;
  body.message = 'redeem_msg';
  body.account_name = accountName;
  if (descriptor) body.descriptor = descriptor;
  if (businessUuid) body.business_uuid = businessUuid;
  body.processing_type = processingType;

  return makeRequest('redeem_sila', body, privateKey);
};

/**
 * Makes a call to /transfer_sila endpoint.
 * @param {String} amount The amount of sila tokens to transfer
 * @param {String} handle The origin user handle
 * @param {String} privateKey The origin user's wallet private key
 * @param {String} destinationHandle The destination user handle
 * @param {String} walletNickname The destination user's wallet nickname (optional)
 * @param {String} walletAddress The destination user's wallet address (optional)
 * @param {String} descriptor The transaction descriptor (optional)
 * @param {String} businessUuid The UUID of the business for the ACH name (optional)
 */
const transferSila = (
  amount,
  handle,
  privateKey,
  destinationHandle,
  walletNickname = undefined,
  walletAddress = undefined,
  descriptor = undefined,
  businessUuid = undefined,
) => {
  const fullHandle = getFullHandle(handle);
  const fullDestination = getFullHandle(destinationHandle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.amount = amount;
  body.destination_handle = fullDestination;
  if (walletNickname) body.destination_wallet = walletNickname;
  if (walletAddress) body.destination_address = walletAddress;
  if (descriptor) body.descriptor = descriptor;
  if (businessUuid) body.business_uuid = businessUuid;

  return makeRequest('transfer_sila', body, privateKey);
};

/**
 * Cancel a pending transaction under certain circumstances
 * @param {String} userHandle The user handle
 * @param {String} userPrivateKey The user's private key
 * @param {String} transactionId The transaction id to cancel
 */
const cancelTransaction = (userHandle, userPrivateKey, transactionId) => {
  const fullHandle = getFullHandle(userHandle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.transaction_id = transactionId;

  return makeRequest('cancel_transaction', body, userPrivateKey);
};

const deleteRegistrationData = (path, handle, privateKey, uuid) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.uuid = uuid;

  return makeRequest(`delete/${path}`, body, privateKey);
};

/**
 * Makes a call to /delete/email endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {String} email The user's new email
 */
const deleteEmail = (handle, privateKey, uuid) =>
  deleteRegistrationData('email', handle, privateKey, uuid);

/**
 * Makes a call to /delete/phone endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {String} uuid The user's new phone
 */
const deletePhone = (handle, privateKey, uuid) =>
  deleteRegistrationData('phone', handle, privateKey, uuid);

/**
 * Makes a call to /delete/address endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {String} uuid The user's new address
 */
const deleteAddress = (handle, privateKey, uuid) =>
  deleteRegistrationData('address', handle, privateKey, uuid);

/**
 * Makes a call to /delete/identity endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {String} uuid The user's new identity
 */
const deleteIdentity = (handle, privateKey, uuid) =>
  deleteRegistrationData('identity', handle, privateKey, uuid);

/**
 * Makes a call to /update/email endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {Object} email The updated email
 */
const updateEmail = (handle, privateKey, email) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.email = email.email;
  body.uuid = email.uuid;

  return makeRequest('update/email', body, privateKey);
};
/**
 * Makes a call to /update/phone endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {Object} phone The updated phone
 */
const updatePhone = (handle, privateKey, phone) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.phone = phone.phone;
  body.uuid = phone.uuid;

  return makeRequest('update/phone', body, privateKey);
};

/**
 * Makes a call to /update/address endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {Object} address The updated address
 */
const updateAddress = (handle, privateKey, address) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.address_alias = address.alias;
  body.street_address_2 = address.street_address_2;
  body.street_address_1 = address.street_address_1;
  body.city = address.city;
  body.state = address.state;
  body.postal_code = address.postal_code;
  body.country = address.country;
  body.uuid = address.uuid;

  return makeRequest('update/address', body, privateKey);
};

/**
 * Makes a call to /update/identity endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {Object} identity The updated identity
 */
const updateIdentity = (handle, privateKey, identity) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.identity_alias = identity.alias;
  body.identity_value = identity.value;
  body.uuid = identity.uuid;

  return makeRequest('update/identity', body, privateKey);
};

/**
 * Update an existing entity (name, birthdate, or business data).
 * @param {String} handle The user handle
 * @param {String} privateKey The user's private key
 * @param {Object} entity The updated entity
 */
const updateEntity = (handle, privateKey, entity) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.first_name = entity.first_name;
  body.last_name = entity.last_name;
  body.entity_name = entity.entity_name;
  body.birthdate = entity.birthdate;
  body.business_type = entity.business_type;
  body.naics_code = entity.naics_code;
  body.doing_business_as = entity.doing_business_as;
  body.business_website = entity.business_website;

  return makeRequest('update/entity', body, privateKey);
};

/**
 * Makes a call to /add/email endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {String} email The user's new email
 */
const addEmail = (handle, privateKey, email) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.email = email;

  return makeRequest('add/email', body, privateKey);
};

/**
 * Makes a call to /add/phone endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {String} phone The user's new phone
 */
const addPhone = (handle, privateKey, phone) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.phone = phone;

  return makeRequest('add/phone', body, privateKey);
};

/**
 * Makes a call to /add/identity endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {Object} identity The user's new identity alias
 *
 */
const addIdentity = (handle, privateKey, identity) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.identity_alias = identity.alias;
  body.identity_value = identity.value;

  return makeRequest('add/identity', body, privateKey);
};

/**
 * Makes a call to /add/address endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {Object} address The user's new address
 */
const addAddress = (handle, privateKey, address) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.address_alias = address.alias;
  body.street_address_2 = address.street_address_2;
  body.street_address_1 = address.street_address_1;
  body.city = address.city;
  body.state = address.state;
  body.postal_code = address.postal_code;
  body.country = address.country;

  return makeRequest('add/address', body, privateKey);
};

/**
 * Makes a call to /get_accounts endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 */
const getAccounts = (handle, privateKey) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.message = 'get_accounts_msg';

  return makeRequest('get_accounts', body, privateKey);
};

/**
 * Makes a call to /get_account_balance endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {String} accountName The account name to retrieve the balance
 */
const getAccountBalance = (handle, privateKey, accountName) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.account_name = accountName;

  return makeRequest('get_account_balance', body, privateKey);
};

/**
 * Makes a call to /plaid_sameday_auth endpoint.
 * The account used in this endpoint must be in the microdeposit_pending_manual_verification status.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {String} accountName The account nickname
 */
const plaidSamedayAuth = (handle, privateKey, accountName) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.account_name = accountName;
  return makeRequest('plaid_sameday_auth', body, privateKey);
};

/**
 * Makes a call to /register_wallet endpoint.
 * If you need a new wallet you can use the generateWallet method.
 * @param {String} handle The user handle
 * @param {String} privateKey An already registered user's wallet private key
 * @param {Wallet} wallet The new wallet
 */
const registerWallet = (handle, privateKey, wallet, nickname) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);

  body.wallet_verification_signature = sign(wallet.address, wallet.privateKey);

  body.wallet = {};
  body.wallet.blockchain_address = wallet.address;
  body.wallet.blockchain_network = 'ETH';
  if (nickname) body.wallet.nickname = nickname;

  return makeRequest('register_wallet', body, privateKey);
};

/**
 * Makes a call to /get_wallets endpoint and returns the list of wallets that match the filters
 * @param {String} handle The user handle
 * @param {String} privateKey Any of the user's registered wallet's private key
 * @param {WalletFilters} filters The filters used to narrow the search results
 */
const getWallets = (handle, privateKey, filters = undefined) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);

  if (filters) body.search_filters = filters;

  return makeRequest('get_wallets', body, privateKey);
};

/**
 * Makes a call to /update_wallet endpoint.
 * The wallet to update is the one used to sign the message.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {Object} walletProperties The properties to update on the wallet
 */
const updateWallet = (handle, privateKey, walletProperties = {}) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);

  if (walletProperties) {
    if (walletProperties.nickname) body.nickname = walletProperties.nickname;
    if (walletProperties.default) body.default = walletProperties.default;
  }

  return makeRequest('update_wallet', body, privateKey);
};

/**
 * Makes a call to /get_wallet endpoint.
 * The wallet to retrieve information is the one used to sign the message.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 */
const getWallet = (handle, privateKey) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);

  return makeRequest('get_wallet', body, privateKey);
};

/**
 * Makes a call to /delete_wallet endpoint.
 * The wallet to delete is the one used to sign the message.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 */
const deleteWallet = (handle, privateKey) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);

  return makeRequest('delete_wallet', body, privateKey);
};

/**
 * Makes a call to /get_transactions endpoint.
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {TransactionFilters} filters The filters used to narrow the search results
 */
const getTransactions = (handle, privateKey, filters = {}) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);

  body.message = 'get_transactions_msg';
  body.search_filters = filters;

  return makeRequest('get_transactions', body, privateKey);
};

/**
 * Makes a call to /get_sila_balance endpoint.
 * This method replaces getBalance.
 * @param {String} address The wallet's blockchain address
 */
const getSilaBalance = (address) => {
  const body = { address };

  return makeRequest('get_sila_balance', body);
};

/**
 * Makes a call to /silaBalance endpoint.
 * @param {String} address The wallet's blockchain address
 * @deprecated Since version 0.2.7. Use getSilaBalance instead.
 */
const getBalance = (address) => {
  const body = { address };

  const opts = {
    uri: getBalanceURL(),
    json: true,
    body,
  };

  return post(opts);
};

/**
 * Upload supporting documentation for KYC
 * @param {String} userHandle The user handle
 * @param {String} userPrivateKey The user's private key
 * @param {Object} document
 */
const uploadDocument = async (userHandle, userPrivateKey, document) => {
  const fullHandle = getFullHandle(userHandle);
  const body = setHeaders({ header: {} }, fullHandle);

  body.name = document.name;
  body.filename = document.filename;
  body.hash = await hashFile(document.filePath, 'sha256');
  body.mime_type = document.mimeType;
  body.document_type = document.documentType;
  body.identity_type = document.identityType;
  body.description = document.description;

  return makeFileRequest('documents', body, document.filePath, userPrivateKey);
};

/**
 * List previously uploaded supporting documentation for KYC
 * @param {String} userHandle The user handle
 * @param {String} userPrivateKey The user's private key
 * @param {Object} filters A set of filters to send with the request
 */
const listDocuments = (userHandle, userPrivateKey, filters) => {
  const fullHandle = getFullHandle(userHandle);
  const body = setHeaders({ header: {} }, fullHandle);
  const queryFilters = {};

  if (filters) {
    queryFilters.page = filters.page;
    queryFilters.perPage = filters.perPage;
    queryFilters.order = filters.order;
    body.start_date = filters.startDate;
    body.end_date = filters.endDate;
    body.doc_types = filters.docTypes;
    body.search = filters.search;
    body.sort_by = filters.sortBy;
  }
  const queryParameters = getQueryParameters(queryFilters);

  return makeRequest(`list_documents${queryParameters}`, body, userPrivateKey);
};

/**
 * Retrieve a previously uploaded supporting documentation for KYC
 * @param {String} userHandle The user handle
 * @param {String} userPrivateKey The user's private key
 * @param {String} documentId The document id to retrieve
 */
const getDocument = (userHandle, userPrivateKey, documentId) => {
  const fullHandle = getFullHandle(userHandle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.document_id = documentId;

  return makeRequest('get_document', body, userPrivateKey);
};

/**
 * Gets a list of valid business types that can be registered.
 */
const getBusinessTypes = () => {
  const body = setHeaders({ header: {} });

  return makeRequest('get_business_types', body);
};

/**
 * Gets a list of valid business roles that can be used to link individuals to businesses.
 */
const getBusinessRoles = () => {
  const body = setHeaders({ header: {} });

  return makeRequest('get_business_roles', body);
};

/**
 * Gets a list of valid NAICS codes sorted by category and listed with their describing subcategory.
 */
const getNaicsCategories = () => {
  const body = setHeaders({ header: {} });

  return makeRequest('get_naics_categories', body);
};

/**
 * List the document types for KYC supporting documentation
 * @param {Object} pagination This object includes the optional pagination parameters
 */
const getDocumentTypes = (pagination = undefined) => {
  const body = setHeaders({ header: {} });
  const queryParameters = getQueryParameters(pagination);
  return makeRequest(`document_types${queryParameters}`, body);
};

/**
 * @deprecated Since version 0.2.13-rc. Use getNaicsCategories instead.
 */
const getNacisCategories = () => {
  return getNaicsCategories();
};

/**
 * @param {String} entityType optional entity type filter.
 */
const getEntities = (entityType) => {
  const body = setHeaders({ header: {} });

  body.entity_type = entityType;

  return makeRequest('get_entities', body);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 */
const getEntity = (userHandle, userPrivateKey) => {
  const body = setHeaders({ header: {} }, userHandle);

  body.user_handle = userHandle;

  return makeRequest('get_entity', body, userPrivateKey);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {String} businessHandle
 * @param {String} businessPrivateKey
 * @param {String} role
 * @param {String} memberHandle
 * @param {String} details
 * @param {double} ownership_stake
 */
const linkBusinessMember = (
  userHandle,
  userPrivateKey,
  businessHandle,
  businessPrivateKey,
  role,
  memberHandle,
  details,
  ownershipStake,
) => {
  const body = setHeaders({ header: {} }, userHandle, businessHandle);

  body.role = role;
  body.member_handle = memberHandle;
  body.details = details;
  body.ownership_stake = ownershipStake;

  return makeRequest(
    'link_business_member',
    body,
    userPrivateKey,
    businessPrivateKey,
  );
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {String} businessHandle
 * @param {String} businessPrivateKey
 * @param {String} role
 */
const unlinkBusinessMember = (
  userHandle,
  userPrivateKey,
  businessHandle,
  businessPrivateKey,
  role,
) => {
  const body = setHeaders({ header: {} }, userHandle, businessHandle);

  body.role = role;

  return makeRequest(
    'unlink_business_member',
    body,
    userPrivateKey,
    businessPrivateKey,
  );
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {String} businessHandle
 * @param {String} businessPrivateKey
 * @param {String} memberHandle
 * @param {String} certificationToken
 */
const certifyBeneficialOwner = (
  userHandle,
  userPrivateKey,
  businessHandle,
  businessPrivateKey,
  memberHandle,
  certificationToken,
) => {
  const body = setHeaders({ header: {} }, userHandle, businessHandle);

  body.member_handle = memberHandle;
  body.certification_token = certificationToken;

  return makeRequest(
    'certify_beneficial_owner',
    body,
    userPrivateKey,
    businessPrivateKey,
  );
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {String} businessHandle
 * @param {String} businessPrivateKey
 */
const certifyBusiness = (
  userHandle,
  userPrivateKey,
  businessHandle,
  businessPrivateKey,
) => {
  const body = setHeaders({ header: {} }, userHandle, businessHandle);

  return makeRequest(
    'certify_business',
    body,
    userPrivateKey,
    businessPrivateKey,
  );
};

/**
 *
 * @param {*} params The configuration parameters
 */
const configure = (params) => {
  appKey = params.key;
  appHandle = params.handle;
};

const setEnvironment = (envString) => {
  env = envString.toUpperCase();
  configureUrl();
  console.log(`Setting environment to ${envString.toUpperCase()}: ${baseUrl}`);
};

const enableSandbox = () => {
  sandbox = true;
  configureUrl();
};

const disableSandbox = () => {
  sandbox = false;
  configureUrl();
};

/**
 * @returns {Wallet} A new ETH wallet
 */
const generateWallet = () => {
  const wallet = web3.eth.accounts.create();
  return new Wallet(wallet.address, wallet.privateKey);
};

const setLogging = (log) => {
  logging = !!log;
};

export default {
  cancelTransaction,
  checkHandle,
  checkKYC,
  configure,
  deleteWallet,
  disableSandbox,
  enableSandbox,
  generateWallet,
  getAccountBalance,
  getAccounts,
  getBalance,
  getDocument,
  getDocumentTypes,
  getSilaBalance,
  getTransactions,
  getWallet,
  getWallets,
  issueSila,
  linkAccount,
  linkAccountDirect,
  listDocuments,
  plaidSamedayAuth,
  redeemSila,
  register,
  registerWallet,
  requestKYC,
  setEnvironment,
  setLogging,
  TransactionFilters,
  transferSila,
  updateWallet,
  uploadDocument,
  User,
  WalletFilters,
  getBusinessTypes,
  getBusinessRoles,
  getNacisCategories,
  getNaicsCategories,
  getEntities,
  linkBusinessMember,
  unlinkBusinessMember,
  getEntity,
  certifyBeneficialOwner,
  certifyBusiness,
  addEmail,
  addPhone,
  addIdentity,
  addAddress,
  updateEmail,
  updatePhone,
  updateIdentity,
  updateAddress,
  updateEntity,
  deleteEmail,
  deletePhone,
  deleteIdentity,
  deleteAddress,
};
