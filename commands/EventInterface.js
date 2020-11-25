const Discord = require('discord.js');
const EventList = require('../src/models/EventList')

module.exports = {
    name: 'EventInterface',
    description: 'a test for the command interface',
    /**
     * 
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message 
     */
    execute(bot, message){
        message.author.send(createEmbed(EventList.getEvents()));
    },  
};


function createEmbed(events){
    let embed = new Discord.MessageEmbed()
        .setTitle('List of Events.')
        .setDescription('Use \`$event (event code)\` in the desired channel to create an event.\nClick 🗑 to delete a specific event or use \`$event delete\` to delete created events.')
        .setColor(0xF1C40F);

        for (let i = 0; i < events.length; i++){
            let text = '';
            for (let j = 0; j < events[i][1].length; j++){
                text += `${events[i][1][j]}\n`
            }
            embed.addField(`${events[i][0]} events:`, text);
        }
    
    return embed;
}
