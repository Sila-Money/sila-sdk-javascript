class Wallet {
  constructor(address, privateKey) {
    /**
     * @type {String}
     */
    this.address = address;
    /**
     * @type {String}
     */
    this.privateKey = privateKey;
  }
}

export default Wallet;
