const Discord = require('discord.js');
const Event = require('../src/models/Event');
const SignupOption = require('../src/models/SignupOption');
const EventService = require('../src/services/EventService');
const EventDetailsService = require('../src/services/EventDetailsService');

module.exports = {
    name: 'PS2Training',
    description: 'Sets up a PS2 training.',
    /**
     * 
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message  
     */
    async execute(bot, message) {

        let textChannel = message.channel;

        // Delete the command message
        textChannel.bulkDelete(1).catch(console.error);

        let eventDetailsService = new EventDetailsService('Training', textChannel, message.author.id);
        let eventDetails = await eventDetailsService.requestEventDetails();

        let event = createEvent(eventDetails, ['Name']);

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
            new SignupOption('✅', 'Signup', false, true, [])
        ])
}
