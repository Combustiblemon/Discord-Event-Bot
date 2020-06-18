const SignupOption = require('./SignupOption');
const EventDetails = require('./EventDetails');

module.exports = class Event {

    /**
     * 
     * @param {EventDetails} eventDetails
     * @param {Array} header
     * @param {string} author
     * @param {SignupOption[]} signupOptions
     */
    constructor(eventDetails, header, author, signupOptions) {
        this.name = eventDetails.name;
        this.description = eventDetails.description;
        this.date = eventDetails.date;
        this.bastion = eventDetails.bastion;
        this.header = header;
        this.signupOptions = signupOptions;
        this.author = author;
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
        if(emoji.name == '📋'){
            return this.signupOptions.emoji = '📋';
        }
        return this.signupOptions.find(s => s.emoji === emoji.name || s.emoji === emoji.id || s.emoji === emoji.identifier);
    }

    /**
     * @returns {Header[]}
     */
    getHeader(){
        return this.header;
    }

    /**
     * @returns {Boolean}
     */
    getBastion(){
        return this.bastion;
    }
}
