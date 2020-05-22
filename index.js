// Configure environment
require('dotenv').config();

const fs = require('fs');
const Discord = require('discord.js');
const FileSystem = require('./src/services/FileSystem');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const bot = new Discord.Client();
const token = process.env.DISCORD_BOT_TOKEN;
const PREFIX = '$';


bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
const embedFiles = fs.readdirSync('./embeds/').filter(file => file.endsWith('.json'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
 
    bot.commands.set(command.name, command);
}

//console.log(embedFiles);
//console.log(commandFiles);
for (const file of embedFiles) {
    const embed = require(`./embeds/${file}`);
    //console.log(embed.embeds[0].title);

    FileSystem.addEmbedID(embed.id);
    FileSystem.addEmbedName(embed.embeds[0].title);
}

bot.on("ready", () => {
    console.log('This bot is online.');
});

bot.on('message', message => {
    
    let args = message.content.substring(PREFIX.length).split(' ');
    
    //args is what a person types after the prefix. args[0] is the first word($ping)
    switch(args[0]) {
        case 'event':
            if (!(message.guild === null)) {
                if(!args[1]) {
                        message.channel.bulkDelete(1);
                        message.author.send('You need to enter a second argument. For a list of commands write $help.');
                    
                }
                else if(args[1] === 'PS2OP') {
                        bot.commands.get('PS2OP').execute(bot, message);
                }
                else if(args[1] === 'PS2Training') {
                        bot.commands.get('PS2Training').execute(bot, message);
                }
                else if(args[1] === 'TestOp') {
                        bot.commands.get('TestOp').execute(bot, message); 
                        bot.commands.get('TestOp').execute(bot, message, args, token); 
                }
                else {
                    message.channel.bulkDelete(1);
                    message.author.send('No command with name \"' + args[1] + '\". For a list of commands write $help.')
                }

            }
            else {
                message.author.send('Please use the command in a server channel.');
            }
            
        break;

        case 'help':
            if (!(message.guild === null)) {
                message.channel.bulkDelete(1);
            }
            message.author.send('```Please use the date when naming an event (e.g. Thursday Night Ops 14/5).\n' 
                                            + 'The time of the event should be in YYYY-MM-DD hh:mm format (e.g. 2020-05-17 17:00). \n\n'
                                            + 'List of current events: \n' 
                                            + '     PS2 Op ($event PS2OP)\n'
                                            + '     PS2 Training ($event PS2Training)```' );
        break;        
    }
});

bot.login(token);
