const Discord = require('discord.js');
const Event = require('../../src/models/Event');
const SignupOption = require('../../src/models/SignupOption');
const EventService = require('../../src/services/EventService');
const EventDetailsService = require('../../src/services/EventDetailsService');
const EmojiService = require('../../src/services/EmojiService');

module.exports = {
    name: 'FoxOp',
    description: 'Sets up a Foxhole op event archetype.',
    /**
     * 
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message 
     */
    async execute(bot, message) {

        let textChannel = message.channel;

        let eventDetailsService = new EventDetailsService('OP', message.author);
        let eventDetails = await eventDetailsService.requestEventDetails();
        if(!eventDetails) return;

        let event = createEvent(eventDetails, ['Position', 'Name'], message.member.displayName);

        EventService.newEvent(bot, textChannel, event);
    }
}

/**
 * @param {EventDetails} eventDetails
 * @param {Array} header
 * @returns {Event}
 */
function createEvent(eventDetails, header, author) {
    let signupOptions = [
        new SignupOption(EmojiService.getEmoji('Foxhole', 'Infantry'), 'Infantry', false, true, []),
        new SignupOption(EmojiService.getEmoji('Foxhole', 'Armour'), 'Armour', false, true, []),
        new SignupOption(EmojiService.getEmoji('Foxhole', 'Logi'), 'Logi', false, true, []),
    ];
    
    return new Event(
        eventDetails,
        header, 
        author,
        true,
        signupOptions
    )
}