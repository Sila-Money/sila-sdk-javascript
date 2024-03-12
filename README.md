# Sila SDK for Node Apps

## Using the SDK
### Installation and use
A guide to the installation and configuration of this SDK can be found here: [https://docs.silamoney.com/docs/nodejavascript-sdk](https://docs.silamoney.com/docs/nodejavascript-sdk)

### Endpoint Methods
Example code for each SDK endpoint method is found in the associated endpoint's section in our docs, which can be found here: [https://docs.silamoney.com/docs/get-started](https://docs.silamoney.com/docs/get-started)

## Development

### Setup

> npm install

That's it. You're ready to go!

### Testing

Run unit tests and code coverage summary

> npm run test

To see a detail of code coverage, view your lcov report:

> http-server ./coverage/lcov-report/

Then browse to the address displayed in your terminal.

NOTE: If you do not have http-server installed, you can install it with the following command:

> npm i -g http-server

### Note on Package Name Change

The SDK package name has changed from `@silamoney/sdk` to `sila-sdk` starting with version 1.0.2. Please update your dependencies to `sila-sdk` for future updates.
