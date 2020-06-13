const Discord = require('discord.js');
const FileSystem = require('../src/services/FileSystem');
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

        let tempArray = FileSystem.getEmbedNames();

        if(!Array.isArray(tempArray) || !tempArray.length){
            message.author.send('No events to delete.');
            return; 
        }
        
        tempArray.forEach(function(item, index) {
            tempArray[index] = item.replace(/_/gi, " ");
        });
        
        let question = '```Which of the following events would you like to delete?\n     ' + tempArray.join("\n     ") + '```';

        

        let answer = await requestDetail(question, message);
        if (answer === ''){
            return;
        }
        
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
async function deleteEmbed(answer, channel){
    let msgID = await FileSystem.getEmbedID(answer);
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

/**
     * 
     * @param {string} question 
     * @param {Discord.Message} message 
     * @returns {Promise<string>}
     */
    async function requestDetail(question, message) {
        const msg = await message.author.send(question);

        const filter = collected => collected.author.id === message.author.id;
        const collected = await msg.channel.awaitMessages(filter, {
            max: 1,
            time: 600000,
            errors: ['time']
        }).catch(error => {
            console.error(error);
            message.author.send("No answer was given.");
        });
        
        
        let answer = '';
        answer = collected.first().content.trim();
        

        return answer;
    }