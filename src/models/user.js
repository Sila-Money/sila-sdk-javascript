class User {
  constructor() {
    /**
     * @type {String}
     */
    this.handle = undefined;
    /**
     * @type {String}
     */
    this.city = undefined;
    /**
     * @type {String}
     */
    this.zip = undefined;
    /**
     * @type {String}
     */
    this.state = undefined;
    /**
     * @type {String}
     */
    this.address = undefined;
    /**
     * @type {String}
     */
    this.addresAlias = '';
    /**
     * @type {String}
     */
    this.phone = undefined;
    /**
     * @type {String}
     */
    this.email = undefined;
    /**
     * @type {String}
     */
    this.contactAlias = '';
    /**
     * The blockchain address
     * @type {String}
     */
    this.cryptoAddress = undefined;
    /**
     * @type {String}
     */
    this.cryptoAlias = '';
    /**
     * @type {String}
     */
    this.dateOfBirth = undefined;
    /**
     * @type {String}
     */
    this.firstName = undefined;
    /**
     * @type {String}
     */
    this.lastName = undefined;
    /**
     * @type {String}
     */
    this.ssn = undefined;
  }
}

export default User;
