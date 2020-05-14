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
     * @param {any} args
     * @param {string} token 
     */
    async execute(bot, message, args, token) {

        let textChannel = message.channel;

        // Delete the command message
        textChannel.bulkDelete(1).catch(console.error);

        let eventDetailsService = new EventDetailsService('TestOp', textChannel, message.author.id);
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
            new SignupOption('707719532721995883', 'Infantry', false, []),
            new SignupOption('707719532617269280', 'Armour', false, []),
            new SignupOption('707719532785172581', 'Air', false, []),
            new SignupOption('⭐', 'Squad Leaders', true, [])
        ]
    )
}
