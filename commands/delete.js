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

        let question = '```Which of the following events would you like to delete?\n     ' + FileSystem.getEmbedNames().join('\n     ') + '```';

        

        let answer = await requestDetail(question, message);
        if(FileSystem.embedNameExists(answer)){
            deleteEmbed(answer, originalChannel);
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
    fs.unlink('./embeds/' + answer + '.json', (err) => {
        if (err) throw err;
        console.log(answer + '.json was deleted.');
      });
    let msgID = await FileSystem.getEmbedID(answer)
    channel.messages.fetch(msgID).then(msg =>{ msg.delete()}).catch(error => {console.log(error)});
    
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
            time: 50000,
        }).catch(() => {
            message.author.send('Timeout');
        });

        let answer = collected.first().content;
        

        return answer;
    }