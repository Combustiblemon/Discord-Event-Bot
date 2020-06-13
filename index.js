// Configure environment
require('dotenv').config();

const fs = require('fs');
const Discord = require('discord.js');
const FileSystem = require('./src/services/FileSystem');
const EventService = require('./src/services/EventService');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const EventDetails = require('./src/models/EventDetails');
const SignupOption = require('./src/models/SignupOption');
const bot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const Event = require('./src/models/Event');
const token = process.env.DISCORD_BOT_TOKEN;
const PREFIX = '$';


bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
const embedFiles = fs.readdirSync('./embeds/').filter(file => file.endsWith('.json'));
//const eventFiles = fs.readdirSync('./events/').filter(file => file.endsWith('.json'));

let allowedChannels = [];
let roles = require('./roles.json');

allowedChannels = FileSystem.readJSON('channels', '');

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
 
    bot.commands.set(command.name, command);
}


for (const file of embedFiles) {
    const embed = require(`./embeds/${file}`);
    const event = require(`./events/${file}`);
    
    
    FileSystem.addEmbedID(embed.id);
    FileSystem.addEmbedName(event.name);
    let tempSignupOption = [];
    for (let position of event.signupOptions) {
        tempSignupOption.push(new SignupOption(position.emoji, position.name, position.isAdditionalRole, position.isInline, position.signups));
    }
    let tempDate = event.date.substring(0,10) + 'T' + event.date.substring(11,16) + 'Z';
    let tempEvent = new Event(new EventDetails(event.name, event.description, new Date(tempDate)), event.header, tempSignupOption);
    EventService.saveEventForMessageId(tempEvent, embed.id);
}

bot.on("ready", () => {
    EventService.setupListeners(bot);
    console.log('This bot is online.');
});

bot.on('message', message => {

    if(!message.content.startsWith(PREFIX)) return;
    
    let filter = m => m.author.id === message.author.id;
    let args = message.content.substring(PREFIX.length).split(' ');
    if(allowedChannels.includes(message.channel.id) || message.channel.type == "dm"){
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
                    else if(args[1] === 'Training') {
                            bot.commands.get('PS2Training').execute(bot, message);
                    }
                    else if(args[1] === 'TestOp') {
                            bot.commands.get('TestOp').execute(bot, message); 
                    }
                    else if(args[1] === 'delete'){
                        var serverIndex1 = roles.findIndex(x=>x.includes(message.guild.name));
                        message.guild.roles.fetch(roles[serverIndex][1]).then(role=>{
                            if (message.member.roles.highest.comparePositionTo(role) >= 0) {
                                bot.commands.get('delete').execute(bot, message);
                            }else {
                                message.author.send('You are lacking the required permissions.');
                            }
                        });
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
                message.author.send('```'
                                        + 'Please use the date when naming an event (e.g. Thursday Night Ops 14/5).\n' 
                                        + 'The time of the event should be in YYYY-MM-DD hh:mm format (e.g. 2020-05-17 17:00). \n\n'
                                        + 'List of current commands: \n' 
                                        + '     ($help)              Displays help message. \n\n'
                                        + '     ($addChannel)        Adds the channel to the whitelist.\n'
                                        + '     ($removeChannel)     Removes the channel from the whitelist.\n'
                                        + '     ($role add|remove)   Adds or removes the minimum role required to use the bot on a server \n'
                                        + '     Events:\n'
                                        + '     ($event delete)      Delete event. \n'
                                        + '     ($event PS2OP)       Sets up a PS2 Op. \n'
                                        + '     ($event Training)    Sets up a PS2 Training. ```');
            break;

            
        }
    } 

        switch(args[0]){
            case 'addChannel':
                //Find the server index in the array
                if(!(message.guild === null)){
                    let serverIndex = roles.findIndex(x=>x.includes(message.guild.name));
                    if( serverIndex === -1) {
                        message.channel.bulkDelete(1);
                        message.author.send("You need to add at least one role for the server first.\n`$role add`");
                        break;
                    }
                    
                    message.guild.roles.fetch(roles[serverIndex][1]).then(role=>{
                    
                        if (message.member.roles.highest.comparePositionTo(role) >= 0) {
                            message.channel.bulkDelete(1);
                            if(allowedChannels.includes(message.channel.id)){
                                message.author.send('Channel already whitelisted.');
                            }else{
                                allowedChannels.push(message.channel.id);
                                FileSystem.writeData(allowedChannels, 'channels', '');
                                message.author.send('Channel added to whitelist.');
                            }
                        }else {
                            message.author.send('You are lacking the required permissions.');
                        }
                    });
                }else{
                    message.author.send('Please use this command in a server channel.')
                }
            break;

            case 'removeChannel':
                if(!(message.guild === null)){
                    //Find the server index in the array
                    var serverIndex1 = roles.findIndex(x=>x.includes(message.guild.name));
                    if( serverIndex === -1) {
                        message.channel.bulkDelete(1);
                        message.author.send("You need to add at least one role for the server first.\n`$role add`");
                        break;
                    }
                    
                    message.guild.roles.fetch(roles[serverIndex1][1]).then(role=>{
                    
                        if (message.member.roles.highest.comparePositionTo(role) >= 0) {
                            message.channel.bulkDelete(1);
                            if(!allowedChannels.includes(message.channel.id)){
                                message.author.send('The channel isn\'t whitelisted.');
                            }else{
                                allowedChannels.splice(allowedChannels.indexOf(message.channel.id), 1);
                                FileSystem.writeData(allowedChannels, 'channels', '');
                                message.author.send('Channel removed from whitelist.');
                            }
                        }else {
                            message.author.send('You are lacking the required permissions.');
                        }
                    });
                }else{
                    message.author.send('Please use this command in a server channel.')
                }
            break;

            case 'role':
                if (!(message.guild === null)) {
                    message.channel.bulkDelete(1);
                    if(!args[1]){ 
                        message.author.send('You need to enter a second argument. For a list of commands write $help.');                       
                    }else if(!message.member.hasPermission("ADMINISTRATOR")){
                        message.author.send("you need to be an administrator to use the `$role` command.");
                    }else if(args[1] == 'add'){
                         bot.commands.get('role').execute(bot, message, roles, 'add');
                    }else if(args[1] == 'remove'){
                         bot.commands.get('role').execute(bot, message, roles, 'remove');
                    }
                    

                }
                else {
                    message.author.send('Please use the command in a server channel.');
                }
                
            break;
        }
           
    
});

bot.login(token);
