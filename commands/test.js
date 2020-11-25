const Discord = require('discord.js');
const EventDetailsService = require('../src/services/EventDetailsService.js');
const EventScheduler = require('../src/services/EventScheduler.js');
var CronJob = require('cron').CronJob;

module.exports = {
    name: 'test',
    description: 'a test for the command interface',
    /**
     * 
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message 
     * @param {Array} activeJobs 
     */
    async execute(bot, message, activeJobs){
        //EventScheduler.displayRepeatingEvents(message);
        
        let eventList = new Object();
        eventList.games = new Object();
        eventList.games['PS2'] = ['**(Training)** Single signup option', '**(PS2OP)** PS2 OP multiple signup options', '**(OW)** Similar to PS2OP, but set up for Outfit Wars']
        eventList.games['Foxhole'] = ['Test']
        
        let embed = new Discord.MessageEmbed()
        .setTitle('List of Events.')
        .setDescription('Use \`$event (event code)\` in the desired channel to create an event.\nClick 🗑 to delete a specific event or use \`$event delete\` to delete created events.')
        .setColor(0xF1C40F);
        //let eventList = [['PS2', ['**(Training)** Single signup option', '**(PS2OP)** PS2 OP multiple signup options', '**(OW)** Similar to PS2OP, but set up for Outfit Wars']]]
        var result = []
        let index = 0
        for (var i in eventList.games) {
            
            result.push([i])
            // obj.hasOwnProperty() is used to filter out properties from the object's prototype chain
            if (eventList.games.hasOwnProperty(i)) {
                result[index].push([eventList.games[i]]);
                let text = '';
                for(var item in eventList.games[i]){
                    text += `${eventList.games[i][item]}\n`
                }
                embed.addField(`${i} events:`, text);
            }
            index+=1
          }
        //console.log(result[0][1]);
        //console.log(eventList.games['PS2'][0])
        
        message.author.send(embed)
        return
        for (var game in eventList.games){
            let text = '';
            for (let j = 0; j < eventList[i][1].length; j++){
                text += `${eventList[i][1][j]}\n`
            }
            embed.addField(`${eventList[i][0]} events:`, text); 
        }

    }
}

function createEmbed(){
    let embed = new Discord.MessageEmbed()
        .setTitle('List of Events.')
        .setDescription('Use \`$event (event code)\` in the desired channel to create an event.\nUse \`$event delete\` in the same channel to delete created events.')
        .setColor(0xF1C40F);
    
    //embed.addField('PS2 events:', '    Event 1.\n    Event 2.\n    Event 3.\n event 4.');
    
    return embed;
}