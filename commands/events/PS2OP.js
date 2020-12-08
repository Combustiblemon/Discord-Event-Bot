const Discord = require('discord.js');
const Event = require('../../src/models/Event');
const SignupOption = require('../../src/models/SignupOption');
const EventService = require('../../src/services/EventService');
const EventDetailsService = require('../../src/services/EventDetailsService');
const EmojiService = require('../../src/services/EmojiService');

module.exports = {
    name: 'PS2OP',
    description: 'Sets up a PS2 op event archetype.',
    /**
     * 
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message 
     */
    async execute(bot, message) {

        let textChannel = message.channel;

        let eventDetailsService = new EventDetailsService('OP', message.author, {bastion: true, colossus: true});
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
        new SignupOption(EmojiService.getEmoji('default', 'Infantry'), 'Infantry', false, true, []),
        new SignupOption(EmojiService.getEmoji('default', 'Armour'), 'Armour', false, true, []),
        new SignupOption(EmojiService.getEmoji('default', 'Air'), 'Air', false, true, []),
        new SignupOption(EmojiService.getEmoji('default', 'Squad Leaders'), 'Squad Leaders', true, true, [])
    ];

    if (eventDetails.bastion){
        signupOptions.push(new SignupOption(EmojiService.getEmoji('default', 'Bastion Pilot'), 'Bastion Pilot', true, true, []));
    }
    
    if (eventDetails.colossus){
        signupOptions.push(new SignupOption(EmojiService.getEmoji('default', 'Colossus Driver'), 'Colossus Driver', true, true, []));
    }
    
    return new Event(
        eventDetails,
        header, 
        author,
        signupOptions,
        true
    )
}
