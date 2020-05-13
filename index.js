// Configure environment
require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();
const token = process.env.DISCORD_BOT_TOKEN;
const PREFIX = '$';

const fs = require('fs');
bot.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
 
    bot.commands.set(command.name, command);
}

bot.on("ready", () => {
    console.log('This bot is online.');
});

bot.on('message', message => {
    
    let args = message.content.substring(PREFIX.length).split(' ');
    
    //args is what a person types after the prefix. args[0] is the first word($ping)
    switch(args[0]){
        case 'event':
            if(!args[1]) {
                message.channel.bulkDelete(1);
                message.author.send('```List of current events: \n PS2 Ops ($event PS2OP)```' );
            }
            else if(args[1] === 'PS2OP') {
                bot.commands.get('PS2OP').execute(bot, message, args, token);
            }
            else if(args[1] === 'PS2Training') {
                bot.commands.get('PS2Training').execute(bot, message, args, token);
            }
            else if(args[1] === 'TestOp') {
                bot.commands.get('TestOp').execute(bot, message, args, token);
            }
            
        break;
    }
});

bot.login(token);
