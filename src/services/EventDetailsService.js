const Discord = require('discord.js');
const EventDetails = require('../models/EventDetails');

const messageTimeout = 600_000;
const pattern = ['<','>',':','\"','/','\\','|','?','*'];

class EventDetailsService {
    
    /**
     * 
     * @param {string} eventType The type of event, will be added to questions for flair
     * @param {Discord.User} author The user that authored the event
     * @param {object} options The extra options available
     * @param {boolean} options.bastion If the event has the posibility for a Bastion pilot signup
     * @param {boolean} options.colossus If the event has the posibility for a Colossus driver signup
     * @param {boolean} options.construction If the event has the posibility for a Construction signup  
     */
    constructor (eventType, author, options={}) {
        this.eventType = eventType;
        this.author = author;
        this.hasBastion = options.bastion || false;
        this.hasColossus = options.colossus || false;
        this.hasConstruction = options.construction || false;
    }

    /**
     * 
     * @returns {Promise<EventDetails>} The event details as answered by author
     */
    async requestEventDetails() {
        let name = await this.requestEventName();
        if(!name) return;
        let description = await this.requestEventDescription();
        if(!description) return null;
        let date = await this.requestEventDate();
        if(!date) return null;
        if(this.hasBastion) {
            var bastion = await this.requestExtraEvent('Bastion pilot');
            if(!bastion) return null;
        }
        if(this.hasColossus) {
            var colossus = await this.requestExtraEvent('Colossus driver');
            if(!colossus) return null;
        }
        if(this.hasConstruction) {
            var construction = await this.requestExtraEvent('Construction');
            if(!construction) return null;
        }

        let options = {
            bastion: bastion,
            colossus: colossus, 
            construction: construction
        }
        return new EventDetails(name, description, date, options);
    }

    /**
     * 
     * @returns {Promise<string>} The name for the event as answered by author
     */
    async requestEventName() {
        let question = `What is the name of the ${this.eventType}?`;

        
        let answer = await this.requestSingleDetail(question);
        
        if(!answer) return null;

        while(this.containsIllegalCharacters(answer)){
            this.author.send(`\`\`\`You have entered an illegal character.\n please avoid using the following characters:\n ${pattern}\`\`\``);
            answer = await this.requestSingleDetail(question);
            if(!answer) return null;
        }

        return answer;
    }

    /**
     * 
     * @returns {Promise<string>} The description for the event as answered by author
     */
    async requestEventDescription() {
        let question = `Write a short description of the ${this.eventType}.`;

        let answer = await this.requestSingleDetail(question);

        if(!answer) return null;

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
            if(!answer) return null;
            answer = answer.trim();
            answer = `${answer.substring(0,10)}T${answer.substring(11,16)}Z`;
            date = new Date(answer);
        }

        return date;
    }
    
    /**
     * @param {string} description What is the specific required
     * @returns {Promise<boolean>} If the event will need the specific, as answered by author
     */
    async requestExtraEvent(description){
        let question = `Will the ${this.eventType} need ${description} signup?\n \`Y/N\``;

        let event;

        while(typeof event !== "boolean"){
            let answer = await this.requestSingleDetail(question);
            if(!answer) return null;
            //remove whitespace and convert to uppercase
            answer.trim().toUpperCase();
            if (answer == 'Y'){
                event = true;
            }else if (answer == 'N'){
                event = false;
            }
        }


        return event;
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
        if (!message){
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
        ).catch(() =>{
            console.error('Message timeout. No message after question.');
            questionMessage.channel.send('No answer was given. Please use the command again.');
        });

        if(!messages.first().content) return null;
        let answer = messages.first().content;

        return answer.trim();
    }

    /**
     * 
     * @param {string} text
     * @returns {boolean} 
     */
    containsIllegalCharacters(text){
        
        var value = 0;
        pattern.forEach(function(word){
            value = value + text.includes(word);
        });;

        if (value > 0){
            return true;
        }else{
            return false;
        }
    }

}

module.exports = EventDetailsService;
