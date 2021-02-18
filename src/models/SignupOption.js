
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
    addSignup(name, signupOption=this) {
        signupOption.signups.push(name);
    }

    /**
     * 
     * @param {string} name 
     */
    removeSignup(name, signupOption=this) {
        const isName = (element) => element === name;
        signupOption.signups.splice(signupOption.signups.findIndex(isName), 1);
    }

    /**
     * @returns {int}
     */
    getNumberOfSignups(signupOption=this) {
        return signupOption.signups.length;
    }
}
