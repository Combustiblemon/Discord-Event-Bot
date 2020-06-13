const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Provides a help message',
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
Please use the date when naming an event (e.g. Thursday Night Ops 14/5).
The time of the event should be in YYYY-MM-DD hh:mm format (e.g. 2020-05-17 17:00).
List of current commands:
    ($help)              Displays this help message.
    ($addChannel)        Adds the channel to the whitelist.
    ($removeChannel)     Removes the channel from the whitelist.
    ($role add|remove)   Adds or removes the minimum role required to use the bot on a server
    Events:
    ($event delete)      Delete event.
    ($event PS2OP)       Sets up a PS2 Op.'
    ($event Training)    Sets up a PS2 Training.
\`\`\`
`