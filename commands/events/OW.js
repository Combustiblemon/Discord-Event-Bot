const Discord = require('discord.js');
const Event = require('../../src/models/Event');
const SignupOption = require('../../src/models/SignupOption');
const EventService = require('../../src/services/EventService');
const EventDetailsService = require('../../src/services/EventDetailsService');

module.exports = {
    name: 'OW',
    description: 'Sets up an OW event archetype.',
    /**
     * 
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message 
     */
    async execute(bot, message) {

        let textChannel = message.channel;


        let eventDetailsService = new EventDetailsService('OW event', message.author, {construction: true});
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
        new SignupOption(EmojiService.getEmoji('default', 'Infantry'), 'Infantry', false, false, []),
        new SignupOption(EmojiService.getEmoji('default', 'Armour'), 'Armour', false, false, []),
        new SignupOption(EmojiService.getEmoji('default', 'Air'), 'Air', false, false, []),
        new SignupOption(EmojiService.getEmoji('default', 'Flex'), 'Flex', false, false, [])
    ];

    if(eventDetails.construction){
        signupOptions.push(new SignupOption(EmojiService.getEmoji('default', 'Construction'), 'Construction', false, false, []))
    }
    
    return new Event(
        eventDetails,
        header,
        author,
        true, 
        signupOptions)
}
