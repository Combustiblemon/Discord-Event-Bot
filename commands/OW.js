const Discord = require('discord.js');
const Event = require('../src/models/Event');
const SignupOption = require('../src/models/SignupOption');
const EventService = require('../src/services/EventService');
const EventDetailsService = require('../src/services/EventDetailsService');

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
        new SignupOption('infantry:706621296812884088', 'Infantry', false, false, []),
        new SignupOption('armour:706621296745906219', 'Armour', false, false, []),
        new SignupOption('air:706620854934700102', 'Air', false, false, []),
        new SignupOption('💪🏻', 'Flex', false, true, [])
    ];

    if(eventDetails.construction){
        signupOptions.push(new SignupOption('⛑', 'Construction', false, true, []))
    }
    
    return new Event(
        eventDetails,
        header,
        author, 
        signupOptions)
}
