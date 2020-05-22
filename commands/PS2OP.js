const Discord = require('discord.js');
const Event = require('../src/models/Event');
const SignupOption = require('../src/models/SignupOption');
const EventService = require('../src/services/EventService');
const EventDetailsService = require('../src/services/EventDetailsService');

module.exports = {
    name: 'PS2OP',
    description: 'Sets up a PS2 op',
    /**
     * 
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message 
     */
    async execute(bot, message) {

        let textChannel = message.channel;

        // Delete the command message
        textChannel.bulkDelete(1).catch(console.error);

        let eventDetailsService = new EventDetailsService('OP', textChannel, message.author.id);
        let eventDetails = await eventDetailsService.requestEventDetails();

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
    return new Event(
        eventDetails,
        header, 
        [
            new SignupOption('707719532721995883', 'Infantry', false, []),
            new SignupOption('707719532617269280', 'Armour', false, []),
            new SignupOption('707719532785172581', 'Air', false, []),
            new SignupOption('⭐', 'Squad Leaders', true, [])
        ])
}
