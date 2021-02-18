const Discord = require('discord.js');
const FileSystem = require('../src/services/FileSystem');
const nullEmbedID = require('../src/models/error');
const EventDetailsService = require('../src/services/EventDetailsService');
const fs = require('fs');
const SQLiteUtilities = require('../src/utils/SQLiteUtilities');
//const EventScheduler = require('../src/services/EventScheduler');

const messageTimeout = 600_000;

module.exports = {
    name: 'delete',
    description: 'Deletes an event.',
    /**
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message  
     */
    async execute(bot, message){

        //Get all the embeds currently tracked for the server
        let embedArray = await FileSystem.getEmbedDataFromServerID(message.guild.id); //288682750792171520

        if(!embedArray){
            message.author.send('\`\`\`No events to delete.\`\`\`');
            return; 
        }

        //find only the messages in the current channel
        let tempArray = [];
        embedArray.forEach(element => {
            if(element.channelID === message.channel.id){
                tempArray.push(element);
            }
        });

        if(tempArray.length < 1){
            message.author.send('\`\`\`No events to delete.\`\`\`');
            return;
        }
        
        
        //Replace the '_' in the name with ' '
        let events = [];
        let eventList = '';
        let text;
    

        tempArray.sort(sortFunction);

        for (let i = 0; i < tempArray.length; i++) {
            text = `${tempArray[i].date.toISOString().substring(0, 10)} ${tempArray[i].name}`;
            events.push([text, tempArray[i].embedID]);
            eventList += `${text}\n     `;
        }
        eventList = eventList.substring(0, eventList.length - 6);
        const question = '```Which of the following events would you like to delete?\nCopy and paste the name below.\n     ' + eventList + '```';

        let answer = await EventDetailsService.prototype.requestSingleDetail(question, message);
        if (!answer) return;
        
        //check if the the name exists
        let eventIndex = findEventIndex(events, answer);
        if(eventIndex){
            this.deleteEmbed(events[eventIndex][1], message);
            console.log(new Date(), `User "${message.author.username}" deleted event "${events[eventIndex][0]}" in server "${message.guild.name}"`);
            message.author.send(`\`\`\`Event \`${answer}\` deleted.\`\`\``);
        }else{
            message.author.send(`\`\`\`"${answer}" not found.\`\`\``);
        }
    },

    /**
     * 
     * @param {string} msgID
     * @param {Discord.Message} message 
     */
    deleteEmbed(msgID, message){
        //delete the message
        message.channel.messages.fetch(msgID).then(msg =>{ msg.delete()}).catch(error => {console.error(new Date(), error)});
        //delete the event in database
        SQLiteUtilities.deleteData('EVENTS', {query: 'embed_id = ?', values: [msgID]});
        
        //remove references to embed
        //FileSystem.removeEmbedName(answer, message.guild.name);
        //EventScheduler.removeEventFromCheck(answer);
    }
}

/**
 * 
 * @param {Array} events The event array
 * @param {String} eventName the formated event name
 */
function findEventIndex(events, eventName){
    
    for (let index = 0; index < events.length; index++) {
        if (events[index][0] === eventName) return index;
    }

    return null;
}


function sortFunction(a, b) {
    if (a.date === b.date) {
        return 0;
    }
    else {
        if(a.date > b.date) return 1
        if(a.date < b.date) return -1
    }
}