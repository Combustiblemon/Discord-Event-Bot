const Discord = require('discord.js');
const FileSystem = require('../src/services/FileSystem');
const nullEmbedID = require('../src/models/error');
const EventDetailsService = require('../src/services/EventDetailsService');
const fs = require('fs');
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
        let originalChannel = message.channel;


        //Get the embed names that exist in file
        let tempArray = FileSystem.getEmbedNames(message.guild.name);
        
        //find only the messages in the current channel
        tempArray = await this.messagesInChannel(message, tempArray);

        if(!Array.isArray(tempArray) || !tempArray.length){
            message.author.send('No events to delete.');
            return; 
        }
        
        
        //Replace the '_' in the name with ' '
        tempArray.forEach(function(item, index) {
            tempArray[index] = item.replace(/_/gi, " ");
        });
        
        const question = '```Which of the following events would you like to delete?\nCopy and paste the name below.\n     ' + tempArray.join("\n     ") + '```';

        let answer = await EventDetailsService.prototype.requestSingleDetail(question, message);
        if (!answer) return;
        
        //replace the ' ' in the answer with '_' so it matches the file naming structure 
        answer = answer.replace(/ /gi, '_');
        //check if the the name exists
        if(FileSystem.embedNameExists(answer, message.guild.name)){
            this.deleteEmbed(answer.replace(/ /gi, '_'), message);
            message.author.send(`Event \`${answer}\` deleted.`);
        }else{
            message.author.send('Invalid name.');
        }
    },

    /**
     * 
     * @param {string} answer
     * @param {Discord.Message} message 
     */
    deleteEmbed(answer, message){
        //convert the embed name into ID
        let msgID = FileSystem.getEmbedID(answer, message.guild.id);
        if (!msgID){
            console.error(new nullEmbedID('Embed does not exist in memory'));
            return;
        }

        //delete the message
        message.channel.messages.fetch(msgID).then(msg =>{ msg.delete()}).catch(error => {console.error(error)});
        
        //remove references to embed
        FileSystem.removeEmbedID(FileSystem.getEmbedID(answer, message.guild.id));
        FileSystem.removeEmbedName(answer, message.guild.name);
        //EventScheduler.removeEventFromCheck(answer);

        this.removeFiles(answer, message.guild.id);
    },

    /**
     * 
     * @param {Discord.Message} message 
     * @param {Array} embedNames 
     * @returns {Array}
     */
    messagesInChannel(message, embedNames){
        let temp = [];
        embedNames.forEach(function (item, index) {
            //if the channel of the embed is different from the channel delete was used in it removes it.
            if (FileSystem.getEmbedChannel(item, message.guild.name) === message.channel.id) {
                temp.push(item); 
            }
        })
        
        return Array.from(temp);
    },

    removeFiles(filename, server){

        //remove the files
        fs.unlink(`./embeds/${server}/` + filename + '.json', (err) => {
            if (err) throw err;
            console.log(`embeds/${server}/${filename}.json was deleted.`);
        });

        fs.unlink(`./events/${server}/` + filename + '.json', (err) => {
            if (err) throw err;
            console.log(`events/${server}/${filename}.json was deleted.`);
        });
    }
}

