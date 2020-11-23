const Discord = require('discord.js');

module.exports = {
    name: 'EventInterface',
    description: 'a test for the command interface',
    /**
     * 
     */
    execute(bot, message, eventList){
        message.author.send(createEmbed(eventList));
    },  
};


function createEmbed(eventList){
    let embed = new Discord.MessageEmbed()
        .setTitle('List of Events.')
        .setDescription('Use \`$event (event code)\` in the desired channel to create an event.\nUse \`$event delete\` in the same channel to delete created events.')
        .setColor(0xF1C40F);

        for (let i = 0; i < eventList.length; i++){
            let text = '';
            for (let j = 0; j < eventList[i][1].length; j++){
                text += `${eventList[i][1][j]}\n`
            }
            embed.addField(`${eventList[i][0]} events:`, text); 
        }
    
    return embed;
}
