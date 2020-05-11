class User {
  constructor() {
    /**
     * @type {String}
     */
    this.handle;
    /**
     * @type {String}
     */
    this.city;
    /**
     * @type {String}
     */
    this.zip;
    /**
     * @type {String}
     */
    this.state;
    /**
     * @type {String}
     */
    this.address;
    /**
     * @type {String}
     */
    this.addresAlias = '';
    /**
     * @type {String}
     */
    this.phone;
    /**
     * @type {String}
     */
    this.email;
    /**
     * @type {String}
     */
    this.contactAlias = '';
    /**
     * The blockchain address
     * @type {String}
     */
    this.cryptoAddress;
    /**
     * @type {String}
     */
    this.cryptoAlias = '';
    /**
     * @type {String}
     */
    this.dateOfBirth;
    /**
     * @type {String}
     */
    this.firstName;
    /**
     * @type {String}
     */
    this.lastName;
    /**
     * @type {String}
     */
    this.ssn;
  }
}

export default User;
