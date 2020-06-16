const Discord = require('discord.js');
const EventDetails = require('../models/EventDetails');

const messageTimeout = 600_000;

class EventDetailsService {

    /**
     * 
     * @param {string} eventType The type of event, will be added to questions for flair
     * @param {Discord.User} author The user that authored the event
     * @param {boolean=} hasBastion If the event has the posibility for a bastion pilot signup
     * @param {boolean=} hasColossus If the event has the possibility for a colossus driver signup
     */
    constructor (eventType, author, hasBastion = false, hasColossus = false) {
        this.eventType = eventType;
        this.author = author;
        this.hasBastion = hasBastion;
        this.hasColossus = hasColossus;
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
        if(this.hasColossus) var colossus = await this.requestEventColossus();
        console.log(bastion +"  "+ colossus);
        return new EventDetails(name, description, date, bastion, colossus);
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

        while(typeof bastion != "boolean"){
            let answer = await this.requestSingleDetail(question);
            //remove whitespace and convert to uppercase
            answer.trim().toUpperCase();
            if (answer == 'Y'){
                bastion = true;
            }else if (answer == 'N'){
                bastion = false;
            }
        }


        return bastion;
    }

    /**
     * @returns {Promise<boolean>} If the event will need a colossus driver as answered by author
     */
    async requestEventColossus(){
        let question = `Will the ${this.eventType} need a Colossus driver signup?\n \`Y/N\``;

        let colossus;

        while(typeof colossus != "boolean"){
            let answer = await this.requestSingleDetail(question);
            //remove whitespace and convert to uppercase
            answer.trim().toUpperCase();
            if (answer === 'Y'){
                colossus = true;
            }else if (answer === 'N'){
                colossus = false;
            }
        }


        return colossus;
    }

    /**
     * 
     * @param {string} question The question to ask
     * @param {Discord.Message=} message 
     * @returns {Promise<string>} The answer to the question
     */
    async requestSingleDetail(question, message = null) {
        let questionMessage;
        let messageFilter;
        if (message === null){
            questionMessage = await this.author.send(question);

            messageFilter = m => m.author.id === this.author.id;
        }else{
            questionMessage = await message.author.send(question);

            messageFilter = m => m.author.id === message.author.id;
        }
        
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
