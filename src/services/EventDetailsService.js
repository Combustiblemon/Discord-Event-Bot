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
        if(name === 'no answer') return;
        let description = await this.requestEventDescription();
        if(name === 'no answer') return null;
        let date = await this.requestEventDate();
        if(name === 'no answer') return null;
        if(this.hasBastion) {
            var bastion = await this.requestExtraEvent('Bastion pilot');
            if(name === 'no answer') return null;
        }
        if(this.hasColossus) {
            var colossus = await this.requestExtraEvent('Colossus driver');
            if(name === 'no answer') return null;
        }
        if(this.hasConstruction) {
            var construction = await this.requestExtraEvent('Construction');
            if(name === 'no answer') return null;
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
        
        if(!answer) return 'no answer';

        while(this.containsIllegalCharacters(answer)){
            this.author.send(`\`\`\`You have entered an illegal character.\n please avoid using the following characters:\n ${pattern}\`\`\``);
            answer = await this.requestSingleDetail(question);
            if(!answer) return 'no answer';
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

        if(!answer) return 'no answer';

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
            if(!answer) return 'no answer';
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
        let question = `Will the ${this.eventType} need ${description} signup?`;
        let event;
        let msgAuthor = await this.getAuthor();

        await msgAuthor.send(question).then(async embed => {
            try {
                await embed.react('✅');
                await embed.react('❌');

            } catch (error) {
                console.error(error);
            }
            const filter = (reaction, user) => {
                return (reaction.emoji.name === '✅' || reaction.emoji.name === '❌')&& user.id === msgAuthor.id;
            };

            await embed.awaitReactions(filter, { max: 1, time: 120000, errors: ['time'] })
                .then(collected => {
                    if (collected.firstKey(1) == '✅'){
                        event = true;
                    }else if (collected.firstKey(1) == '❌'){
                        event = false;
                    }
                })
                .catch(collected => {
                    console.error(collected)
                    msgAuthor.send('The event creation timed out. Please remake the event if you want to try again.');
                });
        });

        return event;
    }

    /**
     * 
     * @param {string} question The question to ask
     * @param {Discord.Message=} message The message object to pass (required if used outside of parent class)
     * @returns {Promise<string>} The answer to the question
     */
    async requestSingleDetail(question, message = null) {
        let msgAuthor = await this.getAuthor(message);
        //let questionMessage;
        //let messageFilter;
        let questionMessage = await msgAuthor.send(question);
        let messageFilter = m => m.author.id === msgAuthor.id;
        
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

    getAuthor(message = null){
        if (!message){
            return this.author;
        }else{
            return message.author;
        }
    }

}

module.exports = EventDetailsService;
