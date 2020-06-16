const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Provides a help message.',
    /**
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message  
     */
    async execute(bot, message) {
        if (!(message.guild === null)) {
            message.channel.bulkDelete(1);
        }

        message.author.send(helpMessage);
    }
}

const helpMessage = `
\`\`\`
For any extra help message (CombustibleLemon#6917).
Report bugs/request features: https://github.com/Combustiblemon/Discord-Event-Bot/issues.
The time of the event should be in YYYY-MM-DD hh:mm format (e.g. 2020-05-17 17:00).
List of current commands:
    ($help)               Displays this help message.
    ($channel add|remove) Adds or removes the channel to/from the whitelist.
    ($role add|remove)    Adds or removes the minimum role required to use the bot on a server
    Events:
    ($event delete)       Delete event.
    ($event PS2OP)        Sets up a PS2 Op type event.
    ($event Training)     Sets up a Training type event.
    ($event OW)           Sets up an OW type event.
\`\`\`
`