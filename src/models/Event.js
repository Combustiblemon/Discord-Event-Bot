const SignupOption = require('./SignupOption');
const EventDetails = require('./EventDetails');

module.exports = class Event {

    /**
     * 
     * @param {EventDetails} eventDetails
     * @param {string} header1
     * @param {string} header2 
     * @param {SignupOption[]} signupOptions
     */
    constructor(eventDetails, header1, header2, signupOptions) {
        this.name = eventDetails.name;
        this.description = eventDetails.description;
        this.date = eventDetails.date;
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
        if(emoji.name == '📋'){
            return this.signupOptions.emoji = '📋';
        }
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
