class TransactionFilters {
  constructor() {
    /**
     * @type {String}
     */
    this.transaction_id = undefined;
    /**
     * @type {String}
     */
    this.reference_id = undefined;
    /**
     * @type {Boolean}
     */
    this.show_timelines = undefined;
    /**
     * @type {Boolean}
     */
    this.sort_ascending = undefined;
    /**
     * @type {Number}
     */
    this.max_sila_amount = undefined;
    /**
     * @type {Number}
     */
    this.min_sila_amount = undefined;
    /**
     * @type {Array<String>}
     */
    this.statuses = undefined;
    /**
     * @type {Number}
     */
    this.start_epoch = undefined;
    /**
     * @type {Number}
     */
    this.end_epoch = undefined;
    /**
     * @type {Number}
     */
    this.page = undefined;
    /**
     * @type {Number}
     */
    this.per_page = undefined;
    /**
     * @type {Array<String>}
     */
    this.transaction_types = undefined;
    /**
     * @type {String}
     */
     this.blockchain_address = undefined;
  }
}

export default TransactionFilters;
