import crypto from 'eth-crypto';
import uuid4 from 'uuid4';
import fs from 'fs';
import crypt from 'crypto';
import lodash, { method } from 'lodash';
import regeneratorRuntime from 'regenerator-runtime'; // eslint-disable-line no-unused-vars

import axios from 'axios';
import FormData from 'form-data';

import TransactionFilters from './models/transactionFilters';
import User from './models/user';
import Wallet from './models/wallet';
import WalletFilters from './models/walletFilters';

let appKey = null;
let appHandle = null;
let sandbox = true;
let env = 'SANDBOX';
let baseUrl = 'https://sandbox.silamoney.com/0.2/';
let logging = false;

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
  switch (env) {
    case 'TEST':
      baseUrl = 'https://test4api.silamoney.com/0.2/';
      break;
    case 'PROD':
      baseUrl = 'https://api.silamoney.com/0.2/';
      break;
    case 'STAGE':
      baseUrl = 'https://stageapi.silamoney.com/0.2/';
      break;
    default:
      baseUrl = 'https://sandbox.silamoney.com/0.2/';
      break;
  }
};

/**
 *
 * @param {*} opts
 * @param {String} key
 * @param {String} businessPrivateKey
 */
const signOpts = (opts, key, businessPrivateKey) => {
  const options = lodash.cloneDeep(opts);
  if (opts.body.header) {
    options.headers = {};
    options.headers['User-Agent'] = 'SilaSDK-node/0.2.51';
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
 * Hashes a fileBuffer
 * @param {Unit-8 Array} fileBuffer of the file
 * @param {String} algorithm The algorithm of the hash
 */
var hashFileObject = function hashFileObject(fileBuffer, algorithm) {
  var promise = new Promise(function (res, rej) {
    var digest = crypt.createHash(algorithm).update(fileBuffer).digest('hex');
    return res(digest);
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
  message.header.app_handle = appHandle;
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

    var config = {
      method: options.method,
      url: options.uri,
      headers: options.headers,
      data : options.body
    };

    axios(config)
    .then(function (response) {
      res({
        statusCode: (response.status)?response.status:response.statusCode,
        headers: response.headers,
        data: response.data
      });
    })
    .catch(function (error) {

      if (error.response == undefined) {
        if (logging && env !== 'PROD') {
          console.log('*** RESPONSE ***');
          console.log(error);
        }
        rej(error);
      }
      if (logging && env !== 'PROD') {
        console.log('*** RESPONSE ***');
        console.log(body);
      }
      res({
        statusCode: (error.response.status)?error.response.status:error.response.statusCode,
        headers: error.response.headers,
        data: error.response.data
      });
    
    });
  });
  return promise;
};

const postFile = (options, filePath, fileObject) => {
  const promise = new Promise((res, rej) => {
    if (logging && env !== 'PROD') {
      console.log('*** REQUEST ***');
      console.log(options.body);
    }
    
    if (fileObject && Object.keys(fileObject).length != 0) {
      var data = new FormData();
      data.append('data', JSON.stringify(options.body));
      for (let key in fileObject) {
        data.append(key, fileObject[key]);
      }
      var config = {
        method: 'post',
        url: options.uri,
        headers: options.headers,
        data : data
      };

      axios(config)
      .then(function (response) {
        res({
          statusCode: (response.status)?response.status:response.statusCode,
          headers: response.headers,
          data: response.data
        });
      })
      .catch(function (error) {
        res({
          statusCode: (error.response.status)?error.response.status:error.response.statusCode,
          headers: error.response.headers,
          data: error.response.data
        });
      });

    } else {
      
      const fileOptions = {
        uri: options.uri,
        headers: options.headers,
        formData: {
          data: JSON.stringify(options.body),
        },
      };

      for (let key in filePath) {
        fileOptions.formData[key] = filePath[key]
      }

      axios.post(fileOptions.uri, {params: fileOptions.formData, headers: fileOptions.headers}, (err, response, body) => {
        if (err) rej(err);
        res({
          statusCode: (response.status)?response.status:response.statusCode,
          headers: response.headers,
          data: JSON.parse(body),
        });
      });      
    }
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
  requestMethod = 'post',
) => {
  let opts = {
    method: requestMethod,
    uri: url(path),
    json: true,
    body,
  };
  if (path == 'get_document') {
    opts['encoding'] = 'binary';
  }
  opts = signOpts(opts, privateKey, business_private_key);
  return post(opts);
};

const makeFileRequest = (path, body, filePath, fileObject, privateKey) => {
  let opts = {
    uri: url(path),
    body,
  }; 
  opts = signOpts(opts, privateKey);
  return postFile(opts, filePath, fileObject);
};

/**
 * Returns the handle with the .silamoney.eth suffix if not present
 * @param {String} handle The handle
 */
const getFullHandle = (handle) => {
  let fullHandle = String(handle);
  if (fullHandle && !fullHandle.endsWith('.silamoney.eth')) {
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
    queryParameters = getQueryParameter(
      queryParameters,
      'sort_ascending',
      parameters.sortAscending,
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

  if (
    user.city ||
    user.zip ||
    user.state ||
    user.address ||
    user.addressAlias ||
    user.addresAlias ||
    user.address2 ||
    user.country
  ) {
    message.address = {};
    message.address.city = user.city;
    message.address.postal_code = user.zip;
    message.address.state = user.state;
    message.address.street_address_1 = user.address;
    message.address.street_address_2 = user.address2;
    message.address.address_alias = user.addressAlias
      ? user.addressAlias
      : user.addresAlias;
    message.address.country = user.country ? user.country : 'US';
  }

  if (user.contactAlias || user.phone || user.email || user.smsOptIn) {
    message.contact = {};
    message.contact.contact_alias = user.contactAlias;
    message.contact.phone = user.phone;
    message.contact.email = user.email;
    message.contact.sms_opt_in = user.smsOptIn;
  }

  if (user.cryptoAddress || user.cryptoAlias) {
    message.crypto_entry = {};
    message.crypto_entry.crypto_address = user.cryptoAddress;
    message.crypto_entry.crypto_code = 'ETH';
    message.crypto_entry.crypto_alias = user.cryptoAlias;
  }

  if (
    user.firstName ||
    user.lastName ||
    user.entity_name ||
    user.business_type ||
    user.businessTypeUuid ||
    user.business_website ||
    user.doing_business_as ||
    user.naics_code
  ) {
    message.entity = {};
    message.entity.birthdate = user.dateOfBirth;
    message.entity.first_name = user.firstName;
    message.entity.last_name = user.lastName;
    message.entity.entity_name = user.entity_name
      ? user.entity_name
      : '';
    message.entity.relationship = 'user';
    if (user.type) message.entity.type = user.type;
    else
      message.entity.type =
        user.business_type || user.businessTypeUuid ? 'business' : 'individual';
    message.entity.business_type = user.business_type;
    message.entity.business_website = user.business_website;
    message.entity.doing_business_as = user.doing_business_as;
    message.entity.naics_code = user.naics_code;
    message.entity.business_type_uuid = user.businessTypeUuid;
    message.entity.registration_state = user.registration_state;
  }

  if (user.ssn || user.ein) {
    message.identity = {};
    message.identity.identity_value = user.ssn ? user.ssn : user.ein;
    message.identity.identity_alias = user.ssn ? 'SSN' : 'EIN';
  }

  if (user.deviceFingerprint) {
    message.device = {};
    message.device.device_fingerprint = user.deviceFingerprint;
    if (user.sessionIdentifier){
      message.device.session_identifier = user.sessionIdentifier;
    }
  }

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
 * @param {String} kycLevel The custom kyc level
 */
const checkKYC = (handle, privateKey, kycLevel = undefined) => {
  const fullHandle = getFullHandle(handle);
  const message = setHeaders({ header: {} }, fullHandle);
  message.message = 'header_msg';
  if (kycLevel) message.kyc_level = kycLevel;

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
 * This method handles the MX account link flow
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {String} providerTokenType The token type
 * @param {String} providerToken The token itself
 * @param {String} accountName The account nickname
 * @param {String} accountId The account id
 */
const linkAccountMX = (
  handle,
  privateKey,
  providerTokenType,
  providerToken,
  accountName = undefined,
  accountId = undefined,
) => {
  const fullHandle = getFullHandle(handle);
  const message = setHeaders({ header: {} }, fullHandle);
  message.message = 'link_account_msg';
  message.provider = 'mx';
  message.provider_token_type = providerTokenType;
  message.provider_token = providerToken;
  if (accountName) message.account_name = accountName;
  if (accountId) message.selected_account_id = accountId;

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
 *
 */
const linkAccount = (
  handle,
  privateKey,
  plaidToken,
  accountName = undefined,
  accountId = undefined,
  plaidTokenType = undefined,
) => {
  const fullHandle = getFullHandle(handle);
  const message = setHeaders({ header: {} }, fullHandle);
  message.message = 'link_account_msg';
  message.plaid_token = plaidToken;
  message.plaid_token_type = plaidTokenType;
  if (accountId) message.selected_account_id = accountId;
  if (accountName) message.account_name = accountName;

  return makeRequest('link_account', message, privateKey);
};

/**
 * Makes a call to /issue_sila endpoint.
 * @param {Number} amount The amount of sila tokens to issue
 * @param {String} handle The user handle
 * @param {String} privateKey The user's wallet private key
 * @param {String} accountName The nickname of the account to debit from. It defaults to 'default' // Optional, OR "card_name": "default", never both.
 * @param {String} descriptor Optional. Max Length 100. Note that only the first 10 characters show on the resulting bank statement.
 * @param {String} businessUuid Optional. UUID of a business with an approved ACH name. The format should be a UUID string.
 * @param {String} processingType Optional. Choice field. Examples: STANDARD_ACH, SAME_DAY_ACH or INSTANT_ACH
 * @param {String} cardName  The nickname of the card to debit from. It defaults to 'default' // Optional, OR "account_name": "default", never both.
 * @param {String} sourceId source account id to debit from (optional)
 * @param {String} destinationId destination account id for credit (optional)
 * @param {String} transactionIdempotencyId Optional. UUID to uniquely identify the transaction to make it idempotent.
 */
const issueSila = (
  amount,
  handle,
  privateKey,
  accountName = undefined,
  descriptor = undefined,
  businessUuid = undefined,
  processingType = undefined,
  cardName = undefined,
  sourceId = undefined,
  destinationId = undefined,
  transactionIdempotencyId = undefined
) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.amount = amount;
  body.message = 'issue_msg';
  if (cardName == undefined && accountName == undefined && sourceId == undefined) {
    accountName = 'default';
  }
  body.account_name = accountName;
  if (cardName !== undefined) {
    body.card_name = cardName;  
  }
  if (sourceId !== undefined) {
    body.source_id = sourceId;
  }
  if (destinationId !== undefined) {
    body.destination_id = destinationId;
  }

  if (descriptor) body.descriptor = descriptor;
  if (businessUuid) body.business_uuid = businessUuid;
  if (processingType) body.processing_type = processingType;
  if (transactionIdempotencyId) body.transaction_idempotency_id = transactionIdempotencyId;

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
 * @param {String} processingType Optional. Choice field. Examples: STANDARD_ACH or SAME_DAY_ACH or CARD
 * @param {String} cardName  The nickname of the card to debit from. Optional, OR "account_name": "default", never both.
 * @param {String} sourceId source account id to debit from (optional)
 * @param {String} destinationId destination account id for credit (optional)
 * @param {String} mockWireAccountName Optional with value of "mock_account_success" or "mock_account_fail"
 * @param {String} transactionIdempotencyId Optional. UUID to uniquely identify the transaction to make it idempotent.
 */
const redeemSila = (
  amount,
  handle,
  privateKey,
  accountName = undefined,
  descriptor = undefined,
  businessUuid = undefined,
  processingType = undefined,
  cardName = undefined,
  sourceId = undefined,
  destinationId = undefined,
  mockWireAccountName = undefined,
  transactionIdempotencyId = undefined,
) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.amount = amount;
  body.message = 'redeem_msg';
  
  if (cardName == undefined && accountName == undefined && sourceId == undefined) {
    accountName = 'default';
  }
  body.account_name = accountName;
  if (cardName !== undefined) {
    body.card_name = cardName;  
  }
  if (sourceId !== undefined) {
    body.source_id = sourceId;
  }
  if (destinationId !== undefined) {
    body.destination_id = destinationId;
  }

  if (descriptor) body.descriptor = descriptor;
  if (businessUuid) body.business_uuid = businessUuid;
  body.processing_type = processingType;

  if (mockWireAccountName) body.mock_wire_account_name = mockWireAccountName;
  if (transactionIdempotencyId) body.transaction_idempotency_id = transactionIdempotencyId;

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
 * @param {String} sourceId source account id to debit from (optional)
 * @param {String} destinationId destination account id for credit (optional)
 * @param {String} transactionIdempotencyId Optional. UUID to uniquely identify the transaction to make it idempotent.
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
  sourceId = undefined,
  destinationId = undefined,
  transactionIdempotencyId = undefined,
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
  if (sourceId) body.source_id = sourceId;
  if (destinationId) body.destination_id = destinationId;
  if (transactionIdempotencyId) body.transaction_idempotency_id = transactionIdempotencyId;

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
 * @param {Object} optional The updated phone
 * @param {String} optional.phone
 * @param {String} optional.uuid
 * @param {Boolean} optional.smsOptIn
 */
const updatePhone = (
  handle,
  privateKey,
  { phone = undefined, uuid = undefined, smsOptIn = undefined } = {},
) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.phone = phone;
  body.uuid = uuid;
  body.sms_opt_in = smsOptIn;

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
  body.registration_state = entity.registration_state;

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
 * @param {Object} optional
 * @param {Boolean} optional.smsOptIn
 */
const addPhone = (handle, privateKey, phone, { smsOptIn = undefined } = {}) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.phone = phone;
  body.sms_opt_in = smsOptIn;

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
 *
 * @param {string} handle The user handle
 * @param {string} privateKey The user's private key
 * @param {Object} device Options for device registration
 * @param {string} device.deviceFingerprint Required key containing the Iovation device token to be used in verification
 */
const addDevice = (
  handle,
  privateKey,
  { deviceFingerprint = undefined, sessionIdentifier = undefined } = {},
) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);
  body.device_fingerprint = deviceFingerprint;
  body.session_identifier = sessionIdentifier;

  return makeRequest('add/device', body, privateKey);
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
const registerWallet = (handle, privateKey, wallet, nickname, defaultVal, statementsEnabled) => {
  const fullHandle = getFullHandle(handle);
  const body = setHeaders({ header: {} }, fullHandle);

  body.wallet_verification_signature = sign(wallet.address, wallet.privateKey);

  body.wallet = {};
  body.wallet.blockchain_address = wallet.address;
  body.wallet.blockchain_network = 'ETH';
  if (statementsEnabled) body.wallet.statements_enabled = statementsEnabled;
  if (nickname) body.wallet.nickname = nickname;
  if (defaultVal) body.wallet.default = defaultVal;

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
  if (filters && filters.uuid) {
    filters.wallet_id = filters.uuid;
  }
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
const getTransactions = (handle = undefined, privateKey = undefined, filters = {}) => {
  let fullHandle = null;
  if (handle != undefined && handle != null) {
    fullHandle = getFullHandle(handle);
  }
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
 * 
 */
const uploadDocument = async (userHandle, userPrivateKey, document) => {
  const fullHandle = getFullHandle(userHandle);
  const body = setHeaders({ header: {} }, fullHandle);

    body.name = document.name;
    body.filename = document.filename;
    
    var tmpFileObj = {};
    var tmpFilePathObj = {};

    if(document.fileBuffer) {
      body.hash = await hashFileObject(document.fileBuffer, 'sha256');
      tmpFileObj = {'file':document.fileObject}
    } else {
      body.hash = await hashFile(document.filePath, 'sha256');
      tmpFilePathObj = {'file':fs.createReadStream(document.filePath)}
    }  
    body.mime_type = document.mimeType;
    body.document_type = document.documentType;
    body.description = document.description;

    return makeFileRequest('documents', body, tmpFilePathObj, tmpFileObj, userPrivateKey);
};

/**
 * Upload supporting documentation for KYC
 * @param {String} userHandle The user handle
 * @param {String} userPrivateKey The user's private key
 * @param {Array} documents
 * 
 */
 const uploadDocuments = async (userHandle, userPrivateKey, documents) => {
  const fullHandle = getFullHandle(userHandle);
  const body = setHeaders({ header: {} }, fullHandle);

    body.file_metadata = {};
    var filePaths = {};
    let fileObjects = {};

    for (let i=0;i<documents.length;i++) {
      let docBodyObj = {};
      let docObj = documents[i];
      let index = i+1;
      docBodyObj.name = docObj.name;
      docBodyObj.filename = docObj.filename;
      
      if(docObj.fileBuffer) {
        docBodyObj.hash = await hashFileObject(docObj.fileBuffer, 'sha256');
        fileObjects['file_'+index] = docObj.fileObject;

      } else {
        docBodyObj.hash = await hashFile(docObj.filePath, 'sha256');
        filePaths['file_'+index] = fs.createReadStream(docObj.filePath);
      }  
      docBodyObj.mime_type = docObj.mimeType;
      docBodyObj.document_type = docObj.documentType;
      docBodyObj.description = docObj.description;

      body.file_metadata['file_'+index] = docBodyObj;      
    }
    return makeFileRequest('documents', body, filePaths, fileObjects, userPrivateKey);
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
 * @param {String|undefined} entityType optional entity type filter.
 * @param {object|undefined} pagination optional pagination control variables
 */
const getEntities = (
  entityType = undefined,
  { page = undefined, perPage = undefined } = {},
) => {
  const body = setHeaders({ header: {} });
  const queryFilters = {};
  if (page) queryFilters.page = page;
  if (perPage) queryFilters.perPage = perPage;
  if (entityType) body.entity_type = entityType;
  const queryParameters = getQueryParameters(queryFilters);
  return makeRequest(`get_entities${queryParameters}`, body);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {Object} options Optional properties to send in the request
 * @param {Boolean} options.prettyDates
 */
const getEntity = (
  userHandle,
  userPrivateKey,
  { prettyDates = undefined } = {},
) => {
  const body = setHeaders({ header: {} }, userHandle);
  const queryParameters = getQueryParameter('', 'pretty_dates', prettyDates);
  body.user_handle = userHandle;

  return makeRequest(`get_entity${queryParameters}`, body, userPrivateKey);
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
 * @param {String} userHandle
 * @param {String} userPrivateKey
 */
const plaidLinkToken = (user_handle, user_private_key, link_token_type=undefined, android_package_name=undefined) => {
  const body = setHeaders({ header: {} }, user_handle);
  body.link_token_type = link_token_type;
  body.android_package_name = android_package_name;
  return makeRequest('plaid_link_token', body, user_private_key);
};

/**
 *
 * @param {String} user_handle
 * @param {String} account_name
 * @param {String} user_private_key
 */
const deleteAccount = (user_handle, account_name, user_private_key) => {
  const body = setHeaders({ header: {} }, user_handle);
  body.account_name = account_name;

  return makeRequest('delete_account', body, user_private_key);
};

/**
 *
 * @param {*} payload
 * @returns
 */
const checkPartnerKyc = ({ query_app_handle, query_user_handle }) => {
  const body = setHeaders({ header: {} });
  body.query_app_handle = query_app_handle;
  body.query_user_handle = query_user_handle;

  return makeRequest('check_partner_kyc', body);
};

/**
 *
 * @param {*} payload
 * @param {*} user_handle
 * @param {*} user_private_key
 * @returns
 */
const updateAccount = (
  { account_name, new_account_name, active=undefined},
  user_handle,
  user_private_key,
) => {
  const body = setHeaders({ header: {} }, user_handle);
  body.account_name = account_name;
  body.new_account_name = new_account_name;
  body.active = active;

  return makeRequest('update_account', body, user_private_key);
};
/**
 *
 * @param {*} payload
 * @param {String} user_handle
 * @returns
 */
const plaidUpdateLinkToken = ({ account_name }, user_handle) => {
  const body = setHeaders({ header: {} }, user_handle);
  body.account_name = account_name;

  return makeRequest('plaid_update_link_token', body);
};

/**
 *
 * @param {*} payload
 * @param {String} user_handle
 * @param {String} user_private_key
 * @returns
 */
const checkInstantAch = ({ account_name, kyc_level }, user_handle, user_private_key) => {
  const body = setHeaders({ header: {} }, user_handle);
  body.account_name = account_name;
  if (kyc_level) body.kyc_level = kyc_level;
  
  return makeRequest('check_instant_ach', body, user_private_key);
};

/**
 *
 * @param {*} payload
 * @param {*} user_private_key
 * @returns
 */
const getInstitutions = (
  payload = {
    institution_name: undefined,
    routing_number: undefined,
    page: undefined,
    per_page: undefined,
  }
) => {
  const body = setHeaders({ header: {} });
  body.message = 'header_msg';
  body.search_filters = payload;

  return makeRequest('get_institutions', body);
};


/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {Object} cardObject properties to send in the request
 * @returns
 */
 const linkCard = (userHandle, userPrivateKey, cardObject) => {
  const body = setHeaders({
    header: {}
  }, userHandle);
  body.message   = 'header_msg';
  body.card_name = cardObject['card_name'];
  body.account_postal_code = cardObject['account_postal_code'];
  body.token = cardObject['token'];
  return makeRequest('link_card', body, userPrivateKey);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @returns
 */
const getCards = (userHandle, userPrivateKey) => {
  const body = setHeaders({
    header: {}
  }, userHandle);
  return makeRequest('get_cards', body, userPrivateKey);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {String} cardName
 * @returns
 */
const deleteCard = (userHandle, userPrivateKey, cardName, provider) => {
  const body = setHeaders({
    header: {}
  }, userHandle);
  body.card_name = cardName;
  body.provider = provider;
  return makeRequest('delete_card', body, userPrivateKey);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {String} transactionId
 * @returns
 */
 const reverseTransaction = (userHandle, userPrivateKey, transactionId) => {
  const body = setHeaders({
    header: {}
  }, userHandle);
  body.transaction_id = transactionId;
  return makeRequest('reverse_transaction', body, userPrivateKey);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {Object} searchFilters properties to send in the request
 * @returns
 */
const getWebhooks = (userHandle, userPrivateKey, searchFilters) => {
  const body = setHeaders({
    header: {}
  }, userHandle);
  body.message   = 'header_msg';

  var payload = {};

  if (!searchFilters) {
    payload = {
      uuid: undefined,
      delivered: undefined,
      sort_ascending: undefined,
      event_type: undefined,
      endpoint_name: undefined,
      user_handle: undefined,
      start_epoch: undefined,
      end_epoch: undefined,
      page: undefined,
      per_page: undefined
    };  
  } else {
    payload = searchFilters;
  }
  
  body.search_filters = payload;
  return makeRequest('get_webhooks', body, userPrivateKey);
};


/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @returns
 */
const getPaymentMethods = (userHandle, userPrivateKey, filters={}) => {
  const body = setHeaders({
    header: {}
  }, userHandle);
  body.search_filters = filters;
  return makeRequest('get_payment_methods', body, userPrivateKey);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {Object} payload
 * @returns
 */
const openVirtualAccount = (userHandle, userPrivateKey, payload={}) => {
  const body = setHeaders({
    header: {}
  }, userHandle);
  if (payload.virtual_account_name !== undefined) {
    body.virtual_account_name = payload.virtual_account_name;
  }
  if (payload.ach_credit_enabled !== undefined) {
    body.ach_credit_enabled = payload.ach_credit_enabled;
  }
  if (payload.ach_debit_enabled !== undefined) {
    body.ach_debit_enabled = payload.ach_debit_enabled;
  }
  if (payload.statementsEnabled !== undefined) {
    body.statements_enabled = payload.statementsEnabled;
  }
  return makeRequest('open_virtual_account', body, userPrivateKey);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {Object} payload
 * @returns
 */
const updateVirtualAccount = (userHandle, userPrivateKey, payload={}) => {
  const body = setHeaders({
    header: {}
  }, userHandle);
  if (payload.active !== undefined) {
    body.active = payload.active;
  }
  if (payload.virtual_account_id !== undefined) {
    body.virtual_account_id = payload.virtual_account_id;
  }
  if (payload.virtual_account_name !== undefined) {
    body.virtual_account_name = payload.virtual_account_name;
  }
  if (payload.ach_credit_enabled !== undefined) {
    body.ach_credit_enabled = payload.ach_credit_enabled;
  }
  if (payload.ach_debit_enabled !== undefined) {
    body.ach_debit_enabled = payload.ach_debit_enabled;
  }
  if (payload.statementsEnabled !== undefined) {
    body.statements_enabled = payload.statementsEnabled;
  }
  return makeRequest('update_virtual_account', body, userPrivateKey);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {String} virtualAccountId
 * @returns
 */
const getVirtualAccount = (userHandle, userPrivateKey, virtualAccountId) => {
  const body = setHeaders({
    header: {}
  }, userHandle);
  body.virtual_account_id = virtualAccountId;
  
  return makeRequest('get_virtual_account', body, userPrivateKey);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @returns
 */
const getVirtualAccounts = (userHandle, userPrivateKey, filters={}) => {
  const body = setHeaders({
    header: {}
  }, userHandle);

  const queryFilters = {};
  if (filters) {
    queryFilters.page = filters.page;
    queryFilters.perPage = filters.perPage;
  }
  const queryParameters = getQueryParameters(queryFilters);
  return makeRequest(`get_virtual_accounts${queryParameters}`, body, userPrivateKey);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {String} eventUuid A valid Webhook Event ID,The format should be a UUID string
 * @returns
 */
const retryWebhook = (userHandle, userPrivateKey, eventUuid) => {
  var body = setHeaders({
    header: {}
  }, userHandle);
  body.event_uuid = eventUuid;
  return makeRequest("retry_webhook", body, userPrivateKey);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {String} virtualAccountId
 * @param {String} accountNumber
 * @returns
 */
const closeVirtualAccount = (userHandle, userPrivateKey, virtualAccountId, accountNumber) => {
  var body = setHeaders({
    header: {}
  }, userHandle);
  body.virtual_account_id = virtualAccountId;
  body.account_number = accountNumber;
  return makeRequest("close_virtual_account", body, userPrivateKey);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {Object} payload
 * @returns
 */
const createTestVirtualAccountAchTransaction = (userHandle, userPrivateKey, payload={}) => {
  var body = setHeaders({
    header: {}
  }, userHandle);
  if (payload.amount) {
    body.amount = payload.amount;
  }
  if (payload.entity_name) {
    body.entity_name = payload.entity_name;
  }
  if (payload.tran_code) {
    body.tran_code = payload.tran_code;
  }
  if (payload.virtual_account_number) {
    body.virtual_account_number = payload.virtual_account_number;
  }
  if (payload.ced) {
    body.ced = payload.ced;
  }
  if (payload.effective_date) {
    body.effective_date = payload.effective_date;
  }
  if (payload.ach_name) {
    body.ach_name = payload.ach_name;
  }
  
  return makeRequest("create_test_virtual_account_ach_transaction", body, userPrivateKey);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {Object} payload
 * @returns
 */
const approveWire = (userHandle, userPrivateKey, payload) => {
  var body = setHeaders({
    header: {}
  }, userHandle);
  body.transaction_id = payload.transaction_id;
  body.approve        = payload.approve;
  body.notes          = payload.notes;
  body.mock_wire_account_name = payload.mock_wire_account_name;
  return makeRequest("approve_wire", body, userPrivateKey);
};

/**
 * @param {String} userHandle
 * @param {String} userPrivateKey
 * @param {Object} payload
 * @returns
 */
const mockWireOutFile = (userHandle, userPrivateKey, payload) => {
  var body = setHeaders({
    header: {}
  }, userHandle);
  body.transaction_id = payload.transaction_id;
  body.wire_status    = payload.wire_status;
  return makeRequest("mock_wire_out_file", body, userPrivateKey);
};

/**
 *
 * @param {Object} params The configuration parameters
 * @param {String} params.key
 * @param {String} params.handle
 */
const configure = ({
  key = undefined,
  handle = undefined,
  environment = undefined,
} = {}) => {
  appKey = key;
  appHandle = handle;
  if (environment) {
    env = environment.toUpperCase();
    configureUrl();
    console.log(
      `Setting environment to ${environment.toUpperCase()}: ${baseUrl}`,
    );
  }
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
  const wallet = crypto.createIdentity();
  return new Wallet(wallet.address, wallet.privateKey);
};

const setLogging = (log) => {
  logging = !!log;
};

const getWalletStatementData = (
  handle,
  privateKey, 
  walletId,
  searchFilters,
) => {
    const fullHandle = getFullHandle(handle);
    const message = setHeaders({ header: {} }, fullHandle);
    message.message = 'get_statement_data_msg';
    message.wallet_id = walletId;

    var payload = {};
  
    if (!searchFilters) {
      payload = {};
    }
    else {
      payload = {
        "start_month": searchFilters.startMonth,
        "end_month": searchFilters.endMonth,
        "page": searchFilters.page,
        "per_page": searchFilters.perPage,
        
    }
  }
  
    message.search_filters = payload;
    return makeRequest('get_wallet_statement_data', message, privateKey);
  };

 const getStatementsData = (
  handle, 
  searchFilters,
) => {
    const fullHandle = getFullHandle(handle);
    const message = setHeaders({ header: {} }, fullHandle);
    message.message = 'get_statements_data_msg';
  
    var payload = {};
  
    if (!searchFilters) {
      payload = {};
    }
    else {
      payload = searchFilters
    }
  
    message.search_filters = payload;
    return makeRequest('get_statements_data', message);
  };

  const statements = (
    handle,
    searchFilters,
  ) => {
    const fullHandle = getFullHandle(handle);
    const message = setHeaders({ header: {} }, fullHandle);
    message.message = 'header_msg';
  
      var payload = {};
    
      if (!searchFilters) {
        payload = {};
      }
      else {
        payload = {
          "start_date": searchFilters.startDate,
          "end_date": searchFilters.endDate,
          "page": searchFilters.page,
          "per_page": searchFilters.perPage,
          "user_name": searchFilters.userName,
          "user_handle": searchFilters.userHandle,
          "account_type": searchFilters.accountType,
          "email": searchFilters.email,          
      }
    }
      message.search_filters = payload;

      return makeRequest('statements', message, undefined, undefined, 'get');
    };

const resendStatements = (
  handle,
  email,
  statementUuid,
) => {
  const fullHandle = getFullHandle(handle);
  const message = setHeaders({ header: {} }, fullHandle);
  message.message = 'header_msg';
  
  message.email = email;
  return makeRequest('statements/' + statementUuid, message, undefined, undefined, 'put');
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
  linkAccountMX,
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
  addDevice,
  updateEmail,
  updatePhone,
  updateIdentity,
  updateAddress,
  updateEntity,
  deleteEmail,
  deletePhone,
  deleteIdentity,
  deleteAddress,
  plaidLinkToken,
  deleteAccount,
  checkPartnerKyc,
  updateAccount,
  plaidUpdateLinkToken,
  checkInstantAch,
  getInstitutions,
  linkCard,
  getCards,
  deleteCard,
  reverseTransaction,
  getWebhooks,
  getPaymentMethods,
  openVirtualAccount,
  updateVirtualAccount,
  getVirtualAccount,
  getVirtualAccounts,
  retryWebhook,
  closeVirtualAccount,
  createTestVirtualAccountAchTransaction,
  approveWire,
  mockWireOutFile,
  uploadDocuments,
  getStatementsData,
  getWalletStatementData,
  statements,
  resendStatements,
};
