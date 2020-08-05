# Sila SDK for Node Apps

## Installation

> npm i sila-sdk

## Import the package

### Common JS syntax

```javascript
const Sila = require('sila-sdk').default;
```

### ES6 module syntax

```javascript
import Sila from 'sila-sdk';
```

## Initialize the application

```javascript
const config = {
  handle: 'app.silamoney.eth',
  key: "Your app handle's private key",
};

Sila.configure(config);
```

## User Methods

### Check Handle

Checks if a specific handle is already taken.

```javascript
const userHandle = 'user.silamoney.eth';

const res = await Sila.checkHandle(userHandle);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.reference); // Random reference number
console.log(res.data.status); // SUCCESS
console.log(res.data.message); // User is available!
```

#### Failure Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.reference); // Random reference number
console.log(res.data.status); // FAILURE
console.log(res.data.message); // User is already taken
```

### Register

Attaches KYC data and specified blockchain address to an assigned handle.

```javascript
// Individual user
const user = new Sila.User();
user.handle = 'user.silamoney.eth';
user.firstName = 'First';
user.lastName = 'Last';
user.address = '123 Main St';
user.city = 'Anytown';
user.state = 'NY';
user.zip = '12345';
user.phone = '1234567890';
user.email = 'test_1@silamoney.com';
user.dateOfBirth = '1990-01-01';
user.ssn = '123456222';
user.cryptoAddress = 'The wallet blockchain address';

// Business user
const user = new Sila.User();
user.handle = 'user.silamoney.eth';
user.entity_name = 'test business';
user.address = '123 Main St';
user.city = 'Anytown';
user.state = 'NY';
user.zip = '12345';
user.phone = '1234567890';
user.ein = '320567252';
user.email = 'test_4@silamoney.com';
user.cryptoAddress = 'The wallet blockchain address';
user.business_type = 'corporation';
user.business_website = 'https://www.yourbusinesscustomer.com';
user.doing_business_as = 'doing business co';
user.naics_code = 721;

const res = await Sila.register(user);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.reference); // Random reference number
console.log(res.data.status); // SUCCESS
console.log(res.data.message); // User was successfully registered
```

### Request KYC

Starts KYC verification process on a registered user handle.

#### Normal flow

```javascript
const res = await Sila.requestKYC(userHandle, walletPrivateKey);
```

#### Custom flow

```javascript
const res = await Sila.requestKYC(userHandle, walletPrivateKey, 'flow_name');
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.reference); // Random reference number
console.log(res.data.status); // SUCCESS
console.log(res.data.message); // User submitted for KYC review
```

### Check KYC

Returns whether the entity attached to the user handle is verified, not valid, or still pending.

```javascript
const res = await Sila.checkKYC(userHandle, walletPrivateKey);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.reference); // Random reference number
console.log(res.data.status); // SUCCESS
console.log(res.data.message); // User has passed ID verification
```

### Link Account

Uses a provided Plaid public token to link a bank account to a verified entity.

#### Plaid verification flow (recomended)

```javascript
const res = await Sila.linkAccount(
  userHandle,
  walletPrivateKey,
  token,
  accountName,
  accountId,
); // Account Name and Account Id parameters are not required
```

Public token received in the /link/item/create plaid endpoint.

#### Direct account-linking flow (restricted by use-case, contact Sila for approval)

```javascript
const res = await Sila.linkAccountDirect(
  userHandle,
  walletPrivateKey,
  accountNumber,
  routingNumber,
  accountName,
  accountType,
); // Account Type and Account Name parameters are not required
```

The only permitted account type is "CHECKING"

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.reference); // Random reference number
console.log(res.data.status); // SUCCESS
console.log(res.data.message); // Bank account successfully linked
```

### Get Accounts

Gets basic bank account names linked to a wallet of the user handle.

```javascript
const res = await Sila.getAccounts(userHandle, walletPrivateKey);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data[0].account_name); // Account name
console.log(res.data[0].account_number); // Account number
console.log(res.data[0].account_status); // Account status
console.log(res.data[0].account_type); // Account type
```

### Get Account Balance

Gets bank account balance for a bank account linked with Plaid

```javascript
const res = await Sila.getAccountBalance(
  userHandle,
  walletPrivateKey,
  accountName,
);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.available_balance); // Available balance
console.log(res.data.current_balance); // Current balance
console.log(res.data.masked_account_number); // Masked account number
console.log(res.data.routing_number); // Routing number
console.log(res.data.account_name); // Account name
```

### Issue Sila

Debits a specified account and issues tokens to the wallet belonging to the requested handle's.

```javascript
const res = await Sila.issueSila(
  amount,
  userHandle,
  walletPrivateKey,
  accountName,
  descriptor,
  businessUuid,
);
/*
Account Name is optional but defaults to 'default'.
Descriptor is optional and sets the transaction description
BusinessUuid is optional and sets the ACH Name of the transaction
*/
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.reference); // Random reference number
console.log(res.data.status); // SUCCESS
console.log(res.data.message); // Transaction submitted to processing queue
console.log(res.data.descriptor); // The transaction description set by you or blank if not set
console.log(res.data.transaction_id); // The transaction id
```

### Transfer Sila

Starts a transfer of the requested amount of SILA to the requested destination handle.

```javascript
const res = await Sila.transferSila(
  amount,
  userHandle,
  walletPrivateKey,
  destinationHanle,
  walletNickname,
  walletAddress,
  descriptor,
  businessUuid,
);
/*
Wallet Nickname and Wallet Address are not required. Both must be owned by the Destination Handle.
Descriptor is optional and sets the transaction description
BusinessUuid is optional and sets the ACH Name of the transaction
*/
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.reference); // Random reference number
console.log(res.data.status); // SUCCESS
console.log(res.data.message); // Transaction submitted to processing queue
console.log(res.data.destination_address); // The destination wallet address
console.log(res.data.descriptor); // The transaction description set by you or blank if not set
console.log(res.data.transaction_id); // The transaction id
```

### Redeem Sila

Burns the given amount of SILA at the handle's wallet address, and credits their named bank account in the equivalent monetary amount.

```javascript
const res = await Sila.redeemSila(
  amount,
  userHandle,
  walletPrivateKey,
  accountName,
  descriptor,
  businessUuid,
);
/*
Account Name is optional but defaults to 'default'.
Descriptor is optional and sets the transaction description
BusinessUuid is optional and sets the ACH Name of the transaction
*/
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.reference); // Random reference number
console.log(res.data.status); // SUCCESS
console.log(res.data.message); // Transaction submitted to processing queue
console.log(res.data.descriptor); // The transaction description set by you or blank if not set
console.log(res.data.transaction_id); // The transaction id
```

### Get Transactions

Gets the array of the user handle's wallet transactions with detailed status information.

```javascript
const res = await Sila.getTransactions(userHandle, walletPrivateKey, filters); // Filters are optional. Use Sila.TransactionFilters for a complete list of possible filters
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.page); // The number of page
console.log(res.data.transactions); // Transactions array
```

### Get Sila Balance

Gets Sila balance for a given blockchain address. This endpoint replaces [Sila Balance](#Sila-Balance)

```javascript
const res = await Sila.getSilaBalance(walletAddress);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.address); // Wallet address
console.log(res.data.sila_balance); // Amount of Sila tokens in the wallet
```

### Plaid Sameday Auth

Gest a public token to complete the second phase of Plaid's Sameday Microdeposit authorization

```javascript
const res = await Sila.plaidSamedayAuth(
  userHandle,
  walletPrivateKey,
  accountName,
);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.status); // SUCCESS
console.log(res.data.message); // Message with details
console.log(res.data.public_token); // The public token
```

### Get Wallets

Gets a list of the user handle's wallets with nickname and default details

```javascript
const res = await Sila.getWallets(userHandle, walletPrivateKey, filters);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.page); // The # of page
console.log(res.data.total_page_count); // Total # of pages
console.log(res.data.returned_count); // # of wallets returned
console.log(res.data.total_count); // Total # of wallets
console.log(res.data.wallets); // Wallets array
```

### Get Wallet

Gets user handle's wallet details: whitelist status, sila balance

```javascript
const res = await Sila.getWallet(userHandle, walletPrivateKey);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.is_whitelisted); // Indicates if the wallet is able to perform transactions
console.log(res.data.sila_balance); // Amout of Sila tokens
console.log(res.data.wallet); // Wallet's details (nickname, default...)
```

### Generate Wallet

Generates a new ETH wallet. This is not an endpoint.

```javascript
const wallet = Sila.generateWallet(userHandle, walletPrivateKey);
console.log(wallet.address); // The blockchain address
console.log(wallet.privateKey); // The wallet's private key
```

### Register Wallet

#### If you don't have a wallet

```javascript
const newWallet = Sila.generateWallet(userHandle, walletPrivateKey);
const res = await Sila.registerWallet(
  userHandle,
  walletPrivateKey,
  newWallet,
  nickname,
);
```

### If you already have generated a wallet by other means

```javascript
const newWallet = {
  address: "The wallet's address",
  privateKey: "The wallet's private key",
};
const res = await Sila.registerWallet(
  userHandle,
  walletPrivateKey,
  newWallet,
  nickname,
);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.reference); // Random number reference
console.log(res.data.message); // Wallet registered
console.log(res.data.wallet_nickname); // The wallet's nickname associated
```

### Update Wallet

Updates the wallet's nickname and can set it as the default wallet for /transfer_sila

```javascript
const walletProperties = { nickname: 'new_nickname', default: true };
const res = await Sila.updateWallet(
  userHandle,
  walletPrivateKey,
  walletProperties,
); // Nickname and Default are not required but you must include at least one of them.
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.message); // Wallet updated
console.log(res.data.wallet); // Wallet's detail (nickname, default...)
console.log(res.data.changes); // An array of the changes made to the wallet
```

### Delete Wallet

Removes the wallet from the provided user handle. Any deleted wallets can't be readded.

#### IMPORTANT NOTE:

You **must** sign this request with the Private Key associated with the wallet
that you want to delete. This is how you specify _which_ wallet to remove.

```javascript
const res = await Sila.deleteWallet(userHandle, walletPrivateKey);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.message); // Wallet deleted
```

### Sila Balance

#### Deprecated - Replaced by [Get Sila Balance](#Get-Sila-Balance)

Gets Sila balance for a given blockchain address.

```javascript
const res = await Sila.getBalance(walletAddress);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.silaBalance); // Amount of Sila tokens in the wallet
```

### Get Business Types

Gets a list of valid business types that can be registered.

```javascript
const res = await sila.getBusinessTypes();
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.business_types); // Business types list
```

### Get Business Roles

Retrieves the list of pre-defined business roles.

```javascript
const res = await sila.getBusinessRoles();
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.business_roles); // Business roles list
```

### Get Naics Categories

```javascript
const res = await sila.getNacisCategories();
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.naics_categories); // Categories list
```

### Get Entities

```javascript
const res = await sila.getEntities(entity_type); // Entity type is optional, it can be 'individual' or 'business'
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.entities.individuals); // Individual entities list
console.log(res.data.entities.businesses); // Business entities list
```

### Get Entity

```javascript
const res = await sila.getEntity(user_handle, private_key);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data); // Data contains many information such as entity type, entity information, contact information, etc.
```

### Link Business Member

```javascript
const res = await sila.linkBusinessMember(user_handle, user_private_key, business_handle, business_private_key, role, member_handle, details, ownership_stake);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.message); // Response message
```

### Unlink Business Member

```javascript
const res = await sila.unlinkBusinessMember(user_handle, user_private_key, business_handle, business_private_key, role);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.message); // Response message
```

### Certify Beneficial Owner

```javascript
const res = await sila.certifyBeneficialOwner(user_handle, user_private_key, business_handle, business_private_key, member_handle, certification_token);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.message); // Response message
```

### Certify Business

```javascript
const res = await sila.certifyBusiness(user_handle, user_private_key, business_handle, business_private_key);
```

#### Success Response Object

```javascript
console.log(res.statusCode); // 200
console.log(res.data.success); // TRUE
console.log(res.data.message); // Response message
```

## Development

### Setup

> npm install

That's it. You're ready to go!

See the full documentation at [https://guide.silamoney.com/api/quick-start/node-sdk/documentation](https://guide.silamoney.com/api/quick-start/node-sdk/documentation)

### Testing

Run unit tests and code coverage summary

> npm run test

To see a detail of code coverage, view your lcov report:

> http-server ./coverage/lcov-report/

Then browse to the address displayed in your terminal.

NOTE: If you do not have http-server installed, you can install it with the following command:

> npm i -g http-server
