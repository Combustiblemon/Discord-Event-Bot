const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Provides a help message.',
    /**
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message  
     */
    async execute(bot, message, subcommand) {

        if(subcommand == 'initialize'){
            message.author.send(this.createInitializeEmbed());
            return;
        }

        message.author.send(this.createHelpEmbed());
    },

    createHelpEmbed(){
        let embed = new Discord.MessageEmbed()
            .setTitle('Help Message.')
            .setDescription(description)
            .setColor(0xF1C40F);

            embed.addField('List of commands:', commands)
        
        return embed;
    },

    createInitializeEmbed(){
        let embed = new Discord.MessageEmbed()
        .setTitle('Initialization instructions.')
        .setDescription(initializeSteps)
        .setColor(0xF1C40F);
    return embed; 
    }
}

const description = `For any extra help or bug reports message CombustibleLemon#6917.
                     The time of the event should be in YYYY-MM-DD hh:mm format (e.g. 2020-05-17 17:00).
                     After the event is over use command '$event delete' to delete your event.
                     [You can help with the hosting costs.](https://www.paypal.com/donate/?hosted_button_id=3AW5RFTZVUY3E)`

const commands =`**($help)**               Displays this help message.
                 **($help initialzie)**    Displays instructions for first time setup.
                 **($event)**              Opens up a list of events and their descriptions.
                 **($channel add|remove)** Adds or removes the channel to/from the whitelist.
                 **($role add|remove)**    Adds or removes the minimum role required to use the bot on a server.
                 **($csv)**                Get a specific CSV file from a list of all events.
                 `

const initializeSteps =`For any extra help message CombustibleLemon#6917.
                        **Step 1:** Create a new channel for the bot.
                        **Step 2:** Run the \`$role add\` command.
                        **Step 3:** After you successfully add a minimum role run the \`$channel add\` command in the channel you created.
                        **Step 4:** Congratulations! now you can run the \`$event\` command and start making events!
                        `