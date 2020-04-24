class WalletFilters {
  constructor() {
    /**
     * @type {Number}
     */
    this.page = undefined;

    /**
     * @type {Number}
     */
    this.per_page = undefined;

    /**
     * @type {Boolean}
     */
    this.sort_ascending = undefined;

    /**
     * @type {String}
     */
    this.blockchain_network = undefined;

    /**
     * @type {String}
     */
    this.blockchain_address = undefined;

    /**
     * @type {String}
     */
    this.nickname = undefined;
  }
}

export default WalletFilters;
