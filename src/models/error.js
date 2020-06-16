
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

  module.exports = nullEmbedID;