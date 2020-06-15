const Discord = require('discord.js');
const EventDetails = require('../models/EventDetails');

const messageTimeout = 600_000;

class EventDetailsService {

    /**
     * 
     * @param {string} eventType The type of event, will be added to questions for flair
     * @param {Discord.User} author The user that authored the event
     * @param {boolean=} hasBastion If the event has the posibility for a bastion pilot signup
     */
    constructor (eventType, author, hasBastion = false) {
        this.eventType = eventType;
        this.author = author;
        this.hasBastion = hasBastion;
    }

    /**
     * 
     * @returns {Promise<EventDetails>} The event details as answered by author
     */
    async requestEventDetails() {
        let name = await this.requestEventName();
        let description = await this.requestEventDescription();
        let date = await this.requestEventDate();
        if(this.hasBastion) var bastion = await this.requestEventBastion();

        return new EventDetails(name, description, date, bastion);
    }

    /**
     * 
     * @returns {Promise<string>} The name for the event as answered by author
     */
    async requestEventName() {
        let question = `What is the name of the ${this.eventType}?`;

        let answer = await this.requestSingleDetail(question);

        return answer;
    }

    /**
     * 
     * @returns {Promise<string>} The description for the event as answered by author
     */
    async requestEventDescription() {
        let question = `Write a short description of the ${this.eventType}.`;

        let answer = await this.requestSingleDetail(question);

        return answer;
    }

    /**
     * 
     * @returns {Promise<Date>} The date for the event as answered by author
     */
    async requestEventDate() {
        let question = `When (in UTC and YYYY-MM-DD hh:mm format) is the ${this.eventType}?`;

        let date;

        // Ask for date while no valid date has been given
        while (!date || isNaN(date.getTime())) {
            let answer = await this.requestSingleDetail(question);
            answer = answer.trim();
            answer = `${answer.substring(0,10)}T${answer.substring(11,16)}Z`;
            date = new Date(answer);
        }

        return date;
    }
    
    /**
     * @returns {Promise<boolean>} If the event will need a bastion pilot as answered by author
     */
    async requestEventBastion(){
        let question = `Will the ${this.eventType} need a Bastion pilot signup?\n \`Y/N\``;

        let bastion;

        while(!bastion){
            let answer = await this.requestSingleDetail(question);
            //remove whitespace and convert to uppercase
            answer.trim().toUpperCase();
            if (answer = 'Y'){
                bastion = true;
            }else if (answer = 'N'){
                bastion = false;
            }
        }


        return bastion;
    }

    /**
     * 
     * @param {string} question The question to ask
     * @returns {Promise<string>} The answer to the question
     */
    async requestSingleDetail(question) {
        let questionMessage = await this.author.send(question);

        let messageFilter = m => m.author.id === this.author.id;
        
        let messages = await questionMessage.channel.awaitMessages(
            messageFilter, 
            {
                max: 1, 
                time: messageTimeout,
                errors: ['time'] 
            }
        ).catch(error =>{
            console.error(error);
            this.author.send('No answer was given.');
        });

        let answer = messages.first().content;

        return answer;
    }

}

module.exports = EventDetailsService;
