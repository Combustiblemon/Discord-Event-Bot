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
     * @param {any} args
     * @param {string} token 
     */
    async execute(bot, message, args, token) {

        let textChannel = message.channel;

        // Delete the command message
        textChannel.bulkDelete(1).catch(console.error);

        let eventDetailsService = new EventDetailsService('Training', textChannel, message.author.id);
        let eventDetails = await eventDetailsService.requestEventDetails();

        let event = createEvent(
            eventDetails.name, 
            eventDetails.description, 
            eventDetails.time, 
            '', 
            'Name'
        );

        EventService.newEvent(bot, textChannel, event);
    }
}

/**
 * @returns {Event}
 */
function createEvent(name, description, time, header1, header2) {
    return new Event(
        name, 
        time, 
        description,
        header1,
        header2, 
        [
            new SignupOption('✅', 'Signups', false, []),
            
        ])
}
