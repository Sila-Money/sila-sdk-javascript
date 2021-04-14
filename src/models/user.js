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
     * @deprecated This property has been deprecated in favor of addressAlias
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
    /**
     * @type {String}
     */
    this.entity_name = undefined;
    /**
     * @type {String}
     */
    this.business_type = undefined;
    /**
     * @type {String}
     */
    this.business_website = undefined;
    /**
     * @type {String}
     */
    this.doing_business_as = undefined;
    /**
     * @type {String}
     */
    this.naics_code = undefined;
    /**
     * @type {String}
     */
    this.ein = undefined;
    /**
     * @type {String}
     */
    this.country = undefined;
    /**
     * @type {String}
     */
    this.businessTypeUuid = undefined;
    /**
     * @type {String}
     */
    this.type = undefined;
    /**
     * @type {String}
     */
    this.address2 = undefined;
    /**
     * @type {String}
     */
    this.addressAlias = undefined;
    /**
     * @type {String}
     */
    this.deviceFingerprint = undefined;
    /**
     * @type {Boolean}
     */
    this.smsOptIn = undefined;
  }
}

export default User;
