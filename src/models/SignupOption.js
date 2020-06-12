
module.exports = class SignupOption {

    /**
     * 
     * @param {string} emoji 
     * @param {string} name
     * @param {boolean} isAdditionalRole
     * @param {boolean} isInline
     * @param {string[]} signups
     */
    constructor(emoji, name, isAdditionalRole, isInline, signups) {
        this.emoji = emoji;
        this.name = name;
        this.isAdditionalRole = isAdditionalRole;
        this.isInline = isInline;
        this.signups = signups;
    }

    /**
     * 
     * @param {string} name 
     */
    addSignup(name) {
        this.signups.push(name);
    }

    /**
     * 
     * @param {string} name 
     */
    removeSignup(name) {
        const isName = (element) => element === name;
        this.signups.splice(this.signups.findIndex(isName), 1);
    }

    /**
     * @returns {int}
     */
    getNumberOfSignups() {
        return this.signups.length;
    }
}
