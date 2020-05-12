const SignupOption = require('./SignupOption');

module.exports = class Event {

    /**
     * 
     * @param {string} name 
     * @param {string} time 
     * @param {string} description 
     * @param {SignupOption[]} signupOptions 
     */
    constructor(name, time, description, signupOptions) {
        this.name = name;
        this.time = time;
        this.description = description;
        this.signupOptions = signupOptions;
    }

    /**
     * @returns {int}
     */
    getTotalSignups() {
        return this.signupOptions
            .filter(s => !s.isAdditionalRole)
            .map(s => s.getNumberOfSignups())
            .reduce((total, current) => total + current);
    }

    /**
     * @param {string} emoji
     * @returns {SignupOption}
     */
    getSingupOptionForEmoji(emoji) {
        return this.signupOptions.find(s => s.emoji == emoji.name || s.emoji == emoji.id);
    }
}
