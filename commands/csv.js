const Discord = require('discord.js');
const FileSystem = require('../src/services/FileSystem');
const EventDetailsService = require('../src/services/EventDetailsService');

module.exports = {
    name:'csv',
    description:'Gets all the CSV files.',
    /**
     * 
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message 
     * @param {Array} csvFiles 
     */
    async execute(bot, message){
        if(!message.guild){
            message.author.send('Please use the command in a server channel.');
            return;
        }
        
        let csvFiles = FileSystem.getCSVFilesNames();
        let user = message.author;
        let guildName = message.guild.name.replace(/[<>:"/\\|?*]/gi, '');
        let GuildCSVs = [];
        let tempArray = [];
        csvFiles.forEach(element => {
            if(element.includes(guildName)){
                GuildCSVs.push(element);
            }
        });

        if(!GuildCSVs.length){
            user.send(`No CSV files found.`);
            return;
        }
        GuildCSVs.forEach(function(item, index) {
            GuildCSVs[index] = item.substring(11+guildName.length, item.length - 4).replace(/_/gi, " ");
        });
        

        const question = '```Which of the following events would you the CSV for?\n     ' + GuildCSVs.join("\n     ") + '```';
        let answer = await EventDetailsService.prototype.requestSingleDetail(question, message);
        if(!GuildCSVs.includes(answer)){ 
            user.send('Invalid Name.');
            return;
        }
        

        user.send('CSV file for ' + answer +'.\n', {files: [
            (`./csv_files/${guildName}/${answer.replace(/ /gi, "_")}.csv`)
        ]});
    }

}