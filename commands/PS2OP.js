const Discord = require('discord.js');
const Event = require('../src/models/Event');
const SignupOption = require('../src/models/SignupOption');
const EventService = require('../src/services/EventService');
const EventDetailsService = require('../src/services/EventDetailsService');

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

        let event = createEvent(eventDetails, ['Position', 'Name']);

        EventService.newEvent(bot, textChannel, event);
    }
}

/**
 * @param {EventDetails} eventDetails
 * @param {Array} header
 * @returns {Event}
 */
function createEvent(eventDetails, header) {
    let signupOptions = [
        new SignupOption('infantry:706621296812884088', 'Infantry', false, false, []),
        new SignupOption('armour:706621296745906219', 'Armour', false, false, []),
        new SignupOption('air:706620854934700102', 'Air', false, false, []),
        new SignupOption('⭐', 'Squad Leaders', true, true, [])
    ];

    if (eventDetails.bastion){
        signupOptions.push(new SignupOption('🛹', 'Bastion Pilot', true, true, []));
    }
    
    if (eventDetails.colossus){
        signupOptions.push(new SignupOption('tank:722512189067362324', 'Colossus Driver', true, true, []));
    }
    
    return new Event(
        eventDetails,
        header, 
        signupOptions)
}
