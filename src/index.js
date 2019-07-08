import Web3 from 'web3';

const uuid4 = require('uuid4');
const request = require('request');
const crypto = require('eth-crypto');

let appKey = null;
let appHandle = null;
let sandbox = true;
let env = 'PROD';
let baseUrl = 'https://sandbox.silamoney.com/0.2/';
let logging = false;

const web3 = new Web3('http://52.13.246.239:8080/');

const url = path => baseUrl + path;
const getBalanceURL = () => {
  let balanceURL = '';
  switch (env) {
    case 'PROD':
      balanceURL = (sandbox) ? 'https://sandbox.silatokenapi.silamoney.com/silaBalance'
        : 'https://silatokenapi.silamoney.com/silaBalance';
      break;
    default:
      balanceURL = 'https://test.silatokenapi.silamoney.com/silaBalance';
  }
  return balanceURL;
};

const sign = (string, key) => {
  if (!appKey || !key) {
    throw new Error('Unable to sign request: keys not set');
  }
  const hash = crypto.hash.keccak256(string);
  const signature = crypto.sign(key, hash);

  if (logging && env !== 'PROD') {
    console.log('*** MESSAGE STRING ***');
    console.log(string);
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

const signOpts = (opts, key) => {
  const options = opts;
  options.headers = {};
  options.headers.authsignature = sign(JSON.stringify(options.body), appKey);
  options.headers.usersignature = sign(JSON.stringify(options.body), key);
  return options;
};

const setHeaders = (msg, handle) => {
  const message = msg;
  message.header.user_handle = handle;
  message.header.auth_handle = appHandle;
  message.header.reference = uuid4();
  message.header.created = Math.round(new Date() / 1000);
  return message;
};

const template = (name) => {
  const options = {
    url: url('getschema?schema=MessageFactory'),
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Max-Age': 3600,
    },
  };
  return new Promise((res, rej) => {
    request.get(options, (err, response, body) => {
      if (response === undefined || response.statusCode !== 200) {
        rej(new Error('Unable to get templates'));
        return false;
      }
      if (err) {
        rej(err);
      }
      const templates = JSON.parse(body);
      let tmp = false;
      for (let i = 0; i < templates.length; i += 1) {
        if (name === templates[i].data.message) {
          tmp = templates[i].data;
          break;
        }
      }
      if (!tmp) {
        rej(new Error(`Unable to find "${name}" in the MessageFactory`));
      } else {
        res(tmp);
      }
      return null;
    });
  });
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
      res(body);
    });
  });
  return promise;
};

const getFullHandle = (handle) => {
  let fullHandle = String(handle);
  if (!fullHandle.endsWith('.silamoney.eth')) {
    fullHandle += '.silamoney.eth';
  }
  return fullHandle;
};

exports.checkHandle = handle => new Promise((resolve, reject) => {
  template('header_msg')
    .then((temp) => {
      const message = temp;
      const fullHandle = getFullHandle(handle);
      message.header.user_handle = fullHandle;
      message.header.auth_handle = appHandle;
      message.header.reference = uuid4();
      message.header.created = Math.round(new Date() / 1000);

      const opts = {
        uri: url('check_handle'),
        json: true,
        body: message,
        headers: {
          authsignature: sign(JSON.stringify(message), appKey),
        },
      };

      post(opts)
        .then(res => resolve(res))
        .catch(err => reject(err));
    })
    .catch((err) => {
      reject(err);
    });
});

exports.register = (data) => {
  const user = data;

  const promise = new Promise((resolve, reject) => {
    template('entity_msg')
      .then((temp) => {
        const message = temp;
        const handle = getFullHandle(user.handle);

        message.header.user_handle = handle;
        message.header.auth_handle = appHandle;

        message.address.city = user.city;
        message.address.postal_code = user.zip;
        message.address.state = user.state;
        message.address.street_address_1 = user.address;

        message.contact.phone = user.phone;
        message.contact.email = user.email;

        message.crypto_entry.crypto_address = user.crypto;

        message.entity.birthdate = user.dob;
        message.entity.first_name = user.first_name;
        message.entity.last_name = user.last_name;
        message.entity.entity_name = `${user.first_name} ${user.last_name}`;
        message.entity.relationship = 'user';

        message.identity.identity_value = user.ssn;

        const opts = {
          uri: url('register'),
          json: true,
          body: message,
          headers: {
            authsignature: sign(JSON.stringify(message), appKey),
          },
        };

        post(opts)
          .then(res2 => resolve(res2))
          .catch(err => reject(err));
      })
      .catch((err) => {
        reject(err);
      });
  });
  return promise;
};


exports.requestKYC = (data, key) => {
  const user = data;

  const promise = new Promise((resolve, reject) => {
    template('header_msg')
      .then((temp) => {
        const message = temp;
        const handle = getFullHandle(user.handle);

        message.header.user_handle = handle;
        message.header.auth_handle = appHandle;

        const opts = {
          uri: url('request_kyc'),
          json: true,
          body: message,
          headers: {
            authsignature: sign(JSON.stringify(message), appKey),
            usersignature: sign(JSON.stringify(message), key),
          },
        };

        post(opts)
          .then(res2 => resolve(res2))
          .catch(err => reject(err));
      })
      .catch((err) => {
        reject(err);
      });
  });
  return promise;
};

exports.checkKYC = (handle, key) => {
  const promise = new Promise((resolve, reject) => {
    template('header_msg')
      .then((temp) => {
        const fullHandle = getFullHandle(handle);
        const message = setHeaders(temp, fullHandle);

        const opts = signOpts({
          uri: url('check_kyc'),
          json: true,
          body: message,
        }, key);

        post(opts)
          .then(res => resolve(res))
          .catch(err => reject(err));
      })
      .catch((err) => {
        reject(err);
      });
  });
  return promise;
};

exports.linkAccount = (handle, key, publicToken) => {
  const promise = new Promise((resolve, reject) => {
    template('link_account_msg')
      .then((temp) => {
        const fullHandle = getFullHandle(handle);
        const message = setHeaders(temp, fullHandle);
        message.public_token = publicToken;

        const opts = signOpts({
          uri: url('link_account'),
          json: true,
          body: message,
        }, key);

        post(opts)
          .then(res => resolve(res))
          .catch(err => reject(err));
      })
      .catch((err) => {
        reject(err);
      });
  });
  return promise;
};

exports.issueSila = (amount, handle, key) => {
  const promise = new Promise((resolve, reject) => {
    template('issue_msg')
      .then((temp) => {
        const fullHandle = getFullHandle(handle);
        const message = setHeaders(temp, fullHandle);
        message.amount = amount;

        const opts = signOpts({
          uri: url('issue_sila'),
          json: true,
          body: message,
        }, key);

        post(opts)
          .then(res => resolve(res))
          .catch(err => reject(err));
      })
      .catch((err) => {
        reject(err);
      });
  });
  return promise;
};

exports.redeemSila = (amount, handle, key) => {
  const promise = new Promise((resolve, reject) => {
    template('redeem_msg')
      .then((temp) => {
        const fullHandle = getFullHandle(handle);
        const message = setHeaders(temp, fullHandle);
        message.amount = amount;

        const opts = signOpts({
          uri: url('redeem_sila'),
          json: true,
          body: message,
        }, key);

        post(opts)
          .then(res => resolve(res))
          .catch(err => reject(err));
      })
      .catch((err) => {
        reject(err);
      });
  });
  return promise;
};

exports.transferSila = (amount, handle, key, destination) => {
  const promise = new Promise((resolve, reject) => {
    template('transfer_msg')
      .then((temp) => {
        const fullHandle = getFullHandle(handle);
        const fullDestination = getFullHandle(destination);
        const message = setHeaders(temp, fullHandle);
        message.amount = amount;
        message.destination = fullDestination;

        const opts = signOpts({
          uri: url('transfer_sila'),
          json: true,
          body: message,
        }, key);

        post(opts)
          .then(res => resolve(res))
          .catch(err => reject(err));
      })
      .catch((err) => {
        reject(err);
      });
  });
  return promise;
};

exports.getAccounts = (handle, key) => {
  const promise = new Promise((resolve, reject) => {
    template('get_accounts_msg')
      .then((temp) => {
        const fullHandle = getFullHandle(handle);
        const message = setHeaders(temp, fullHandle);

        const opts = signOpts({
          uri: url('get_accounts'),
          json: true,
          body: message,
        }, key);

        post(opts)
          .then(res => resolve(res))
          .catch(err => reject(err));
      })
      .catch((err) => {
        reject(err);
      });
  });
  return promise;
};

exports.getTransactions = (handle, key, filters = {}) => {
  const promise = new Promise((resolve, reject) => {
    template('header_msg')
      .then((temp) => {
        const fullHandle = getFullHandle(handle);

        const message = setHeaders(temp, fullHandle);
        message.message = 'get_transactions_msg';

        message.search_filters = filters;

        const opts = signOpts({
          uri: url('get_transactions'),
          json: true,
          body: message,
        }, key);

        post(opts)
          .then(res => resolve(res))
          .catch(err => reject(err));
      })
      .catch((err) => {
        reject(err);
      });
  });
  return promise;
};

exports.getBalance = (address) => {
  const promise = new Promise((resolve, reject) => {
    const message = { address };

    const opts = {
      uri: getBalanceURL(),
      json: true,
      body: message,
    };

    post(opts)
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
  return promise;
};

exports.addCrypto = (handle, key, address, alias) => {
  const promise = new Promise((resolve, reject) => {
    template('crypto_msg')
      .then((temp) => {
        const fullHandle = getFullHandle(handle);
        const message = setHeaders(temp, fullHandle);
        message.crypto_entry.crypto_alias = alias;
        message.crypto_entry.crypto_address = address;

        const opts = signOpts({
          uri: url('add_crypto'),
          json: true,
          body: message,
        }, key);

        post(opts)
          .then(res => resolve(res))
          .catch(err => reject(err));
      })
      .catch((err) => {
        reject(err);
      });
  });
  return promise;
};

exports.checkTransaction = id => id;
exports.configure = (params) => { appKey = params.key; appHandle = params.handle; };
exports.setEnvironment = (envString) => { env = envString.toUpperCase(); configureUrl(); console.log(`Setting environment to ${envString.toUpperCase()}: ${baseUrl}`); };
exports.enableSandbox = () => { sandbox = true; configureUrl(); };
exports.disableSandbox = () => { sandbox = false; configureUrl(); };
exports.generateWallet = () => web3.eth.accounts.create();
exports.setLogging = (log) => { logging = !!(log); };
