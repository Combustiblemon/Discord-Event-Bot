
class nullEmbedID extends Error {
    constructor(message) {
      super(message)
      this.name = this.constructor.name
      Error.captureStackTrace(this, nullEmbedID);
    }

    statusCode() {
        return this.status
      }
  }

  class illegalCharactersInFilename extends Error {
    constructor(message) {
      super(message)
      this.name = this.constructor.name
      Error.captureStackTrace(this, illegalCharactersInFilename);
    }

    statusCode() {
        return this.status
      }
  }

  module.exports = {
    nullEmbedID: nullEmbedID,
    illegalCharactersInFilename: illegalCharactersInFilename
  };