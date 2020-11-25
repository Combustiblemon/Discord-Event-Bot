// Configure environment
require('dotenv').config();
//#region Requires/initializations 
const fs = require('fs');
const Discord = require('discord.js');
const FileSystem = require('./src/services/FileSystem');
const EventService = require('./src/services/EventService');
const EventDetails = require('./src/models/EventDetails');
const SignupOption = require('./src/models/SignupOption');
const EventList = require('./src/models/EventList');
var CronJob = require('cron').CronJob;
const glob = require('glob');
const bot = new Discord.Client({ partials: ['USER', 'GUILD_MEMBER', 'MESSAGE', 'CHANNEL', 'REACTION'] });
const Event = require('./src/models/Event');
const EventScheduler = require('./src/services/EventScheduler');
const token = process.env.DISCORD_BOT_TOKEN;
const PREFIX = '^';


let savedServers = []
fs.readdirSync('./embeds/').forEach(file => {
    if(file != '.gitignore'){
        savedServers.push(file)
    }
});

EventList.initialize()
FileSystem.initializeEmbedName(savedServers)

let cronJob = new CronJob('0 0 5 * * *', function() {
    console.log('hello :3');
}, null, true, 'UTC')
cronJob.start();

//read the files from disk, if they don't exist write them
let allowedChannels = FileSystem.ensureFileExistance('channels.json', './').then(function(result){
    allowedChannels = result;
});
let roles = FileSystem.ensureFileExistance('roles.json', './').then(function(result){
    roles = result;
});

bot.commands = new Discord.Collection();
var commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    
    bot.commands.set(command.name, command);
}

commandFiles = fs.readdirSync('./commands/events').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/events/${file}`);
    
    bot.commands.set(command.name, command);
}

for (const server of savedServers){
    var embedFiles = fs.readdirSync(`./embeds/${server}`).filter(file => file.endsWith('.json'));
    for (const file of embedFiles) {
        const embed = JSON.parse(fs.readFileSync(`./embeds/${server}/${file}`, 'utf8'));
        const event = JSON.parse(fs.readFileSync(`./events/${server}/${file}`, 'utf8'));
        
        FileSystem.addEmbedID(embed.id);
        FileSystem.addEmbedName(file.replace(/.json/gi, '').trim(), server);
        
        let tempSignupOption = [];
        for (let position of event.signupOptions) {
            tempSignupOption.push(new SignupOption(position.emoji, position.name, position.isAdditionalRole, position.isInline, position.signups));
        }
        let tempDate = `${event.date.substring(0,10)}T${event.date.substring(11,16)}Z`;
        let tempEvent = new Event(new EventDetails(event.name, event.description, new Date(tempDate), event.repeatableDay), event.header, event.author, tempSignupOption);
        EventService.saveEventForMessageId(tempEvent, embed.id);

        if (event.repeatableDay > -1){
            EventScheduler.addEventToCheck(file.replace(/.json/gi, '').trim(), event.repeatableDay);
        }
    }
}
//#endregion



bot.on("ready", () => {
    //sets up the status message
    bot.user.setPresence({ activity: { name: `${PREFIX}help`, type: 'LISTENING' }, status: 'active' })
    .catch(console.error);
    //sets up the reaction listeners
    EventService.setupListeners(bot);
    console.log('This bot is online.');
    setInterval(() => {
        bot.user.setPresence({ activity: { name: `${PREFIX}help`, type: 'LISTENING' }, status: 'active' })
        .catch(console.error);
    }, 3,600,000);
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
    let command = args[0].toLowerCase();
    let subCommand = ''
    if(args[1]) subCommand = args[1].toLowerCase();
    

    if(allowedChannels.includes(message.channel.id) || message.channel.type == "dm"){
        if (serverIndex === -1 && `${command} ${subCommand}` != 'role add'){
            message.author.send(`Please use \`$role add\` before using \`$${command} ${subCommand}\`.`);
            return;
        }

        //#region command event
        switch(command) {
            case 'test':
                bot.commands.get('test').execute(bot, message);
            break;
            
            case 'event':
                if (message.guild) {
                    if(!subCommand) {
                        bot.commands.get('EventInterface').execute(bot, message, EventList.getEvents());
                        //message.author.send('You need to enter a second argument. For a list of commands write $help.');
                        
                    }
                    else if(subCommand === 'ps2op') {
                        bot.commands.get('PS2OP').execute(bot, message);
                    }
                    else if(subCommand === 'training') {
                        bot.commands.get('PS2Training').execute(bot, message);
                    }
                    else if(subCommand === 'testop') {
                        bot.commands.get('TestOp').execute(bot, message); 
                    }else if(subCommand === 'ow'){
                        bot.commands.get('OW').execute(bot, message); 
                    }
                    else if(subCommand === 'delete'){
                        message.guild.roles.fetch(roles[serverIndex][1]).then(role=>{
                            if (message.member.roles.highest.comparePositionTo(role) >= 0 || message.member.hasPermission("ADMINISTRATOR")) {
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
            
            case 'channel':
                message.guild.roles.fetch(roles[serverIndex][1]).then(role=>{
                    if (message.member.roles.highest.comparePositionTo(role) >= 0 || message.member.hasPermission("ADMINISTRATOR")) {
                        bot.commands
                            .get('channel')
                            .execute(bot, message, subCommand, allowedChannels, roles, serverIndex);
                    }else {
                        message.author.send('You are lacking the required permissions.');
                    }});
            break;

            case 'role':
                message.guild.roles.fetch(roles[serverIndex][1]).then(role=>{
                    if (message.member.roles.highest.comparePositionTo(role) >= 0 || message.member.hasPermission("ADMINISTRATOR")) {
                        bot.commands
                            .get('role')
                            .execute(bot, message, roles, subCommand);
                    }else {
                        message.author.send('You are lacking the required permissions.');
                    }});
            break;

            case 'csv':
                message.guild.roles.fetch(roles[serverIndex][1]).then(role=>{
                    if (message.member.roles.highest.comparePositionTo(role) >= 0 || message.member.hasPermission("ADMINISTRATOR")) {
                        bot.commands
                            .get('csv')
                            .execute(bot, message);
                    }else {
                        message.author.send('You are lacking the required permissions.');
                    }});
            break;
            
        }
        //#endregion 
    } 

    //#region commands 
    switch (command) {

        case 'help':
            bot.commands
                .get('help')
                .execute(bot, message);
        break;
    }
    //#endregion
           
    
});


bot.login(token);




function GetRoles(){
    return Array.from(roles);
}

exports.GetRoles = GetRoles;