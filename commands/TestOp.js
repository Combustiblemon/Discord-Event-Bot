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



        //let eventDetailsService = new EventDetailsService('TestOp', message.author);
        let eventDetails = {name: 'test', description: 'test', date: date = new Date('2040-11-11 11:11')};
        eventDetails.name =  await EventDetailsService.prototype.requestSingleDetail('name:', message);

        let event = createEvent(eventDetails, ['Aspect Test', 'Name Test'], message.member.displayName);

        EventService.newEvent(bot, textChannel, event);
    }
}

/**
 * @param {EventDetails} eventDetails
 * @param {Array} header
 * @param {string} author
 * @returns {Event}
 */
function createEvent(eventDetails, header, author) {
    return new Event(
        eventDetails,
        header,
        author,
        [
            new SignupOption('🔫', 'Infantry', false, false, []),
            new SignupOption('🚌', 'Armour', false, false, []),
            new SignupOption('✈️', 'Air', false, false, []),
            new SignupOption('⭐', 'Squad Leaders', true, true, [])
        ]
    )
}
