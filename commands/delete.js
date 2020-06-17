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
        
        //find only the messages in the current channel
        tempArray = await messagesInChannel(originalChannel, tempArray);

        if(!Array.isArray(tempArray) || !tempArray.length){
            message.author.send('No events to delete.');
            return; 
        }
        
        
        //Replace the '_' in the name with ' '
        tempArray.forEach(function(item, index) {
            tempArray[index] = item.replace(/_/gi, " ");
        });
        
        let question = '```Which of the following events would you like to delete?\n     ' + tempArray.join("\n     ") + '```';

        let answer = await EventDetailsService.prototype.requestSingleDetail(question, message);
        if (!answer) return;
        
        
        //replace the ' ' in the answer with '_' so it matches the file naming structure 
        answer = answer.replace(/ /gi, '_');
        //check if the the name exists
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
    //convert the embed name into ID
    let msgID = FileSystem.getEmbedID(answer);
    if (msgID === null){
        console.error(new nullEmbedID('Embed does not exist in memory'));
        return;
    }

    //delete the message
    channel.messages.fetch(msgID).then(msg =>{ msg.delete()}).catch(error => {console.log(error)});
    
    //remove references to embed
    FileSystem.removeEmbedID(FileSystem.getEmbedID(answer));
    FileSystem.removeEmbedName(answer.replace(/_/gi, ' '));

    //remove the files
    fs.unlink('./embeds/' + answer + '.json', (err) => {
        if (err) throw err;
        console.log(`embeds/${answer}.json was deleted.`);
    });

    fs.unlink('./events/' + answer + '.json', (err) => {
        if (err) throw err;
        console.log(`events/${answer}.json was deleted.`);
    });


    
    
}

/**
 * 
 * @param {Discord.Channel} channel 
 * @param {Array} embedNames 
 * @returns {Array}
 */
function messagesInChannel(channel, embedNames){
    let temp = [];
    embedNames.forEach(function (item, index) {
        //if the channel of the embed is different from the channel delete was used in it removes it.
        if (FileSystem.getEmbedChannel(item) === channel.id) {
            temp.push(item); 
        }
    })
    
    return Array.from(temp);
}