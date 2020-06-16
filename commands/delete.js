const Discord = require('discord.js');
const FileSystem = require('../src/services/FileSystem');
const nullEmbedID = require('../src/models/error');
const EventDetailsService = require('../src/services/EventDetailsService');
const fs = require('fs');

const messageTimeout = 600_000;

module.exports = {
    name: 'delete',
    description: 'Deletes an event.',
    /**
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message  
     */
    async execute(bot, message){
        let originalChannel = message.channel;

        // Delete the command message
        originalChannel.bulkDelete(1).catch(console.error);

        //Get the embed names that exist in file
        let tempArray = FileSystem.getEmbedNames();
        
        if(!Array.isArray(tempArray) || !tempArray.length){
            message.author.send('No events to delete.');
            return; 
        }
        
        tempArray.forEach(function(item, index) {
            tempArray[index] = item.replace(/_/gi, " ");
        });
        
        let question = '```Which of the following events would you like to delete?\n     ' + tempArray.join("\n     ") + '```';

        

        //let answer = await requestDetail(question, message);
        let answer = await EventDetailsService.prototype.requestSingleDetail(question, message);
        if (answer === ''){
            return;
        }
        answer = answer.replace(/ /gi, '_');
        console.log(`answer: ${answer}`);
        if(FileSystem.embedNameExists(answer)){
            deleteEmbed(answer.replace(/ /gi, '_'), originalChannel);
            message.author.send(`Event \`${answer}\` deleted.`);
        }else{
            message.author.send('Invalid name.');
        }
    },   
}

/**
 * 
 * @param {string} answer
 * @param {TextChannel} channel 
 */
function deleteEmbed(answer, channel){
    let msgID = FileSystem.getEmbedID(answer);
    if (msgID === null){
        console.error(new nullEmbedID('Embed does not exist in memory'));
        return;
    }

    console.log(msgID);
    channel.messages.fetch(msgID).then(msg =>{ msg.delete()}).catch(error => {console.log(error)});
    
    FileSystem.removeEmbedID(FileSystem.getEmbedID(answer));
    FileSystem.removeEmbedName(answer.replace(/_/gi, ' '));

    fs.unlink('./embeds/' + answer + '.json', (err) => {
        if (err) throw err;
        console.log(`embeds/${answer}.json was deleted.`);
    });

    fs.unlink('./events/' + answer + '.json', (err) => {
        if (err) throw err;
        console.log(`events/${answer}.json was deleted.`);
    });


    
    
}