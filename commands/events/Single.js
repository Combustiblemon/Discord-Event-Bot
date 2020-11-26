const Discord = require('discord.js');
const Event = require('../../src/models/Event');
const SignupOption = require('../../src/models/SignupOption');
const EventService = require('../../src/services/EventService');
const EventDetailsService = require('../../src/services/EventDetailsService');
const EmojiService = require('../../src/services/EmojiService');

module.exports = {
    name: 'Single',
    description: 'Sets up an event with a single signup.',
    /**
     * 
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message  
     */
    async execute(bot, message) {

        let textChannel = message.channel;



        let eventDetailsService = new EventDetailsService('Training', message.author);
        let eventDetails = await eventDetailsService.requestEventDetails();
        if(!eventDetails) return;

        let event = createEvent(eventDetails, ['','Name'], message.member.displayName);

        EventService.newEvent(bot, textChannel, event);
    }
}

/**
 * @param {EventDetails} eventDetails
 * @param {Array} header
 * @returns {Event}
 */
function createEvent(eventDetails, header, author) {
    return new Event(
        eventDetails,
        header,
        author,
        false,
        [
            new SignupOption(EmojiService.getEmoji('default', 'Signups'), 'Signups', false, true, [])
        ])
}