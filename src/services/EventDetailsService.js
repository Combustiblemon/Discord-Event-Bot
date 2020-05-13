const Discord = require('discord.js');
const EventDetails = require('../models/EventDetails');

const messageTimeout = 600_000;

class EventDetailsService {

    /**
     * 
     * @param {string} eventType The type of event, will be added to questions for flair
     * @param {Discord.TextChannel} textChannel The text channel in which to ask for event details
     * @param {string} requesterId The id of the user that started the chain
     * 
     */
    async requestEventDetailsInChannel(eventType, textChannel, authorId) {
        let name = await this.requestEventName(eventType, textChannel, authorId);
        let description = await this.requestEventDescription(eventType, textChannel, authorId);
        let time = await this.requestEventTime(eventType, textChannel, authorId);

        return new EventDetails(name, description, time);
    }

    /**
     * 
     * @param {string} eventType The type of event, will be added to questions for flair
     * @param {Discord.Message} textChannel The text channel in which to ask for event details
     * @param {string} requesterId The id of the user that started the chain
     * @returns {Promise<string>} The name for the event as answered by author
     */
    async requestEventName(eventType, textChannel, authorId) {
        let question = `What is the name of the ${eventType}?`;

        let answer = await this.requestSingleDetail(question, textChannel, authorId);

        return answer;
    }

    /**
     * 
     * @param {string} eventType The type of event, will be added to questions for flair
     * @param {Discord.TextChannel} textChannel The text channel in which to ask for event details
     * @param {string} requesterId The id of the user that started the chain
     * @returns {Promise<string>} The description for the event as answered by author
     */
    async requestEventDescription(eventType, textChannel, authorId) {
        let question = `Write a short description of the ${eventType}.`;

        let answer = await this.requestSingleDetail(question, textChannel, authorId);

        return answer;
    }

    /**
     * 
     * @param {string} eventType The type of event, will be added to questions for flair
     * @param {Discord.TextChannel} textChannel The text channel in which to ask for event details
     * @param {string} requesterId The id of the user that started the chain
     * @returns {Promise<string>} The time for the event as answered by author
     */
    async requestEventTime(eventType, textChannel, authorId) {
        let question = `What time is the ${eventType}?`;

        let answer = await this.requestSingleDetail(question, textChannel, authorId);

        return answer;
    }

    /**
     * 
     * @param {string} question The question to ask
     * @param {Discord.TextChannel} textChannel The text channel in which to ask for event details
     * @param {string} requesterId The id of the user that started the chain
     * @returns {Promise<string>} The answer to the question
     */
    async requestSingleDetail(question, textChannel, authorId) {
        await textChannel.send(question);

        let messageFilter = m => m.author.id === authorId;
        
        let messages = await textChannel.awaitMessages(
            messageFilter, 
            {
                max: 1, 
                time: messageTimeout,
                errors: ['time'] 
            }
        ).catch(error =>{
            console.error(error);
            textChannel.send('No answer was given.');
            textChannel.bulkDelete(1).catch(console.error);
        });

        let answer = messages.first().content;

        textChannel.bulkDelete(2).catch(console.error);

        return answer;
    }
}

module.exports = EventDetailsService;
