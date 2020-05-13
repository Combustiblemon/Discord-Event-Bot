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

        let eventDetailsService = new EventDetailsService();
        let eventDetails = await eventDetailsService
            .requestEventDetailsInChannel('TestOp', textChannel, message.author.id);

        let event = createTestEvent(
            eventDetails.name, 
            eventDetails.description, 
            eventDetails.time, 
            'Aspect Test', 
            'Name Test'
        );

        EventService.newEvent(bot, textChannel, event);
    }
}

/**
 * @returns {Event}
 */
function createTestEvent(name, description, time, header1, header2) {
    return new Event(
        name, 
        time, 
        description,
        header1,
        header2, 
        [
            new SignupOption('707719532721995883', 'Infantry', false, []),
            new SignupOption('707719532617269280', 'Armour', false, []),
            new SignupOption('707719532785172581', 'Air', false, []),
            new SignupOption('⭐', 'Squad Leaders', true, [])
        ]
    )
}
