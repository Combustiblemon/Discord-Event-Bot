const SignupOption = require('./SignupOption');

module.exports = class Event {

    /**
     * 
     * @param {string} name 
     * @param {string} time 
     * @param {string} description
     * @param {string} header1
     * @param {string} header2 
     * @param {SignupOption[]} signupOptions
     */
    constructor(name, time, description, header1, header2, signupOptions) {
        this.name = name;
        this.time = time;
        this.description = description;
        this.header1 = header1;
        this.header2 = header2;
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

    /**
     * @returns {Header[]}
     */
    getHeader(){
        let header = [this.header1, this.header2]; 

        return header;
    }
}
