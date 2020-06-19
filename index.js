// Configure environment
require('dotenv').config();

const fs = require('fs');
const Discord = require('discord.js');
const FileSystem = require('./src/services/FileSystem');
const EventService = require('./src/services/EventService');
const EventDetails = require('./src/models/EventDetails');
const SignupOption = require('./src/models/SignupOption');
const glob = require('glob');
const bot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const Event = require('./src/models/Event');
const token = process.env.DISCORD_BOT_TOKEN;
const PREFIX = '$';


bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
const embedFiles = fs.readdirSync('./embeds/').filter(file => file.endsWith('.json'));

//read the files from disk, if they don't exist write them
let allowedChannels = FileSystem.ensureFileExistance('channels.json', '../../').then(function(result){
    allowedChannels = result;
});
let roles = FileSystem.ensureFileExistance('roles.json', '../../').then(function(result){
    roles = result;
});
 
const csvFiles = glob.sync('csv_files' + '/**/*.csv');
csvFiles.forEach(element =>{
    FileSystem.addCSVFile(element);
})


for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
 
    bot.commands.set(command.name, command);
}

for (const file of embedFiles) {
    const embed = require(`./embeds/${file}`);
    const event = require(`./events/${file}`);
    
    FileSystem.addEmbedID(embed.id);
    FileSystem.addEmbedName(file.replace(/.json/gi, '').trim());

    let tempSignupOption = [];
    for (let position of event.signupOptions) {
        tempSignupOption.push(new SignupOption(position.emoji, position.name, position.isAdditionalRole, position.isInline, position.signups));
    }
    let tempDate = `${event.date.substring(0,10)}T${event.date.substring(11,16)}Z`;
    let tempEvent = new Event(new EventDetails(event.name, event.description, new Date(tempDate)), event.header, event.author, tempSignupOption);
    EventService.saveEventForMessageId(tempEvent, embed.id);
}

bot.on("ready", () => {
    //sets up the status message
    bot.user.setActivity('$help', { type: 'LISTENING' })
               .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
               .catch(console.error);
    //sets up the reaction listeners
    EventService.setupListeners(bot);
    console.log('This bot is online.');
});

bot.on('message', message => {

    //if the message doesn't start with PREFIX return
    if(!message.content.startsWith(PREFIX)) return;
    if(!(message.guild === null)) {
        //find the server position in memory
        var serverIndex = roles.findIndex(x=>x.includes(message.guild.name));
        //delete the command message
        message.channel.bulkDelete(1).catch(console.error);
    }
    
    let filter = m => m.author.id === message.author.id;

    // args is what a person types after the prefix
    let args = message.content.substring(PREFIX.length).split(' ');
    
    // args[0] is the first word($ping)
    let command = args[0];
    let subCommand = args[1];

    if(allowedChannels.includes(message.channel.id) || message.channel.type == "dm"){
        if (serverIndex === -1){
            message.author.send(`Please use \`$role add\` before using \`$${command} ${subCommand}\`.`);
            return;
        }

        switch(command) {
            case 'event':
                if (message.guild) {
                    if(!subCommand) {
                            message.author.send('You need to enter a second argument. For a list of commands write $help.');
                        
                    }
                    else if(subCommand === 'PS2OP') {
                            bot.commands.get('PS2OP').execute(bot, message);
                    }
                    else if(subCommand === 'training') {
                            bot.commands.get('PS2Training').execute(bot, message);
                    }
                    else if(subCommand === 'TestOp') {
                            bot.commands.get('TestOp').execute(bot, message); 
                    }else if(subCommand === 'OW'){
                        bot.commands.get('OW').execute(bot, message); 
                    }
                    else if(subCommand === 'delete'){
                        message.guild.roles.fetch(roles[serverIndex][1]).then(role=>{
                            if (message.member.roles.highest.comparePositionTo(role) >= 0) {
                                bot.commands.get('delete').execute(bot, message);
                            }else {
                                message.author.send('You are lacking the required permissions.');
                            }
                        });
                    }
                    else {
                        message.author.send(`No command \"$${command} ${subCommand}\". For a list of commands write $help.`)
                    }

                }
                else {
                    message.author.send('Please use the command in a server channel.');
                }
                
            break;
            
        }
    } 

        switch (command) {

            case 'help':
                bot.commands
                    .get('help')
                    .execute(bot, message);
                break;

            case 'channel':
                bot.commands
                    .get('channel')
                    .execute(bot, message, subCommand, allowedChannels, roles, serverIndex);
                break;

            case 'role':
                bot.commands
                    .get('role')
                    .execute(bot, message, roles, subCommand);
                
                break;
            case 'csv':
                bot.commands
                    .get('csv')
                    .execute(bot, message);
            break;
        }
           
    
});

bot.login(token);
