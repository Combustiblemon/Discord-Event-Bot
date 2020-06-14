const Discord = require('discord.js');
const Event = require('../src/models/Event');
const SignupOption = require('../src/models/SignupOption');
const EventService = require('../src/services/EventService');
const EventDetailsService = require('../src/services/EventDetailsService');

module.exports = {
    name: 'TestOp',
    description: 'Sets up a test op',
    /**
     * 
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message 
     */
    async execute(bot, message) {

        let textChannel = message.channel;

        // Delete the command message
        textChannel.bulkDelete(1).catch(console.error);

        let eventDetailsService = new EventDetailsService('TestOp', message.author);
        let eventDetails = await eventDetailsService.requestEventDetails();

        let event = createEvent(eventDetails, ['Aspect Test', 'Name Test']);

        EventService.newEvent(bot, textChannel, event);
    }
}

/**
 * @param {EventDetails} eventDetails
 * @param {Array} header
 * @returns {Event}
 */
function createEvent(eventDetails, header) {
    return new Event(
        eventDetails,
        header,
        [
            new SignupOption('🔫', 'Infantry', false, false, []),
            new SignupOption('🚌', 'Armour', false, false, []),
            new SignupOption('✈️', 'Air', false, false, []),
            new SignupOption('⭐', 'Squad Leaders', true, true, [])
        ]
    )
}
