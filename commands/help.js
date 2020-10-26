const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Provides a help message.',
    /**
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message  
     */
    async execute(bot, message) {

        message.author.send(this.createEmbed());
    },

    createEmbed(){
        let embed = new Discord.MessageEmbed()
            .setTitle('Help Message.')
            .setDescription(description)
            .setColor(0xF1C40F);

            embed.addField('List of commands:', commands)
        
        return embed;
    }
}

const description = `For any extra help message CombustibleLemon#6917.
                     [Report bugs/request features](https://github.com/Combustiblemon/Discord-Event-Bot/issues).
                     The time of the event should be in YYYY-MM-DD hh:mm format (e.g. 2020-05-17 17:00).
                     After the event is over use command '$event delete' to delete your event.`

const commands =`**($help)**               Displays this help message.
                 **($channel add|remove)** Adds or removes the channel to/from the whitelist.
                 **($role add|remove)**    Adds or removes the minimum role required to use the bot on a server.
                 **($csv)**                Get a specific CSV file from a list of all events.
                 **($event)**              Opens up a list of events and their descriptions.` 

const helpMessage = `
\`\`\`
For any extra help message CombustibleLemon#6917.
Report bugs/request features: https://github.com/Combustiblemon/Discord-Event-Bot/issues.
The time of the event should be in YYYY-MM-DD hh:mm format (e.g. 2020-05-17 17:00).
After the event is over use command '$event delete' to delete your event.
List of current commands:
    ($help)               Displays this help message.
    ($channel add|remove) Adds or removes the channel to/from the whitelist.
    ($role add|remove)    Adds or removes the minimum role required to use the bot on a server
    ($csv)                Get a specific CSV file from a list of all events.
    ($event)              
\`\`\`
`