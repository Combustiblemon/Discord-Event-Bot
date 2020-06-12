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
            new SignupOption('707719532721995883', '<:infantry:706621296812884088> Infantry', false, false, []),
            new SignupOption('707719532617269280', '<:armour:706621296745906219> Armour', false, false, []),
            new SignupOption('707719532785172581', '<:air:706620854934700102> Air', false, false, []),
            new SignupOption('⭐', '⭐ Squad Leaders', true, true, []),
            new SignupOption('🛹', 'Bastion Pilot', true, true, [])
        ])
}
