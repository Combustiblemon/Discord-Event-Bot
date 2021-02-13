var SignupOption = require('../models/SignupOption');
var EventDetails = require('../models/EventDetails');


class EventFunctions {
    /**
     * @param {BotEvent} event
     * @returns {int}
     */
    getTotalSignups(event) {
        return event.signupOptions
            .filter(s => !s.isAdditionalRole)
            .map(s => s.getNumberOfSignups())
            .reduce((total, current) => total + current);
    }

    /**
     * @param {string} emoji
     * @param {BotEvent} event
     * @returns {SignupOption}
     */
    getSingupOptionForEmoji(emoji, event) {
        if(emoji.name == '📋'){
            return event.signupOptions.emoji = '📋';
        }
        if(emoji.name == '🗑'){
            return event.signupOptions.emoji = '🗑';
        }
        return event.signupOptions.findIndex(s => s.emoji === emoji.name || s.emoji === emoji.id || s.emoji === emoji.identifier);
    }

    /**
     * @param {BotEvent} event
     * @returns {Header[]}
     */
    getHeader(event){
        return event.header;
    }
}

module.exports = new EventFunctions();