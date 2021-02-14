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
const SQLiteUtilities = require('./src/utils/SQLiteUtilities');
//var CronJob = require('cron').CronJob;
//const glob = require('glob');
const bot = new Discord.Client({ partials: ['USER', 'GUILD_MEMBER', 'MESSAGE', 'CHANNEL', 'REACTION'] });
const Event = require('./src/models/Event');
//const EventScheduler = require('./src/services/EventScheduler');
const token = process.env.DISCORD_BOT_TOKEN;
const PREFIX = '$';


EventList.initialize()

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


bot.on("ready", () => {
    //sets up the status message
    bot.user.setPresence({ activity: { name: `${PREFIX}help`, type: 'LISTENING' }, status: 'active' })
    .catch(err => {console.error(new Date(), err)});
    //sets up the reaction listeners
    EventService.setupListeners(bot);
    console.log(new Date(), 'This bot is online.');
    setInterval(() => {
        bot.user.setPresence({ activity: { name: `${PREFIX}help`, type: 'LISTENING' }, status: 'active' })
        .catch(err => {console.error(new Date(), err)});
    }, 3600000);
});

bot.on('message', async message => {
    
    //if the message doesn't start with PREFIX return
    if(!message.content.startsWith(PREFIX)) return;
    if(!(message.guild === null)) {
        //get role data from DB.
        //returns {role_id, server_id}
        var serverRole = await SQLiteUtilities.getDataSingle(null, 'ROLES', {query: 'server_id = ?', values: [`${message.guild.id}`]});
        //delete the command message
        message.channel.bulkDelete(1).catch(err => {console.error(new Date(), err)});
    }
    
    

    // args is what a person types after the prefix
    let args = message.content.substring(PREFIX.length).split(' ');
    
    // args[0] is the first word($ping)
    let command = args[0].toLowerCase();
    let subCommand = ''
    if(args[1]) subCommand = args[1].toLowerCase();
    

    if(await FileSystem.getWhitelistedChannel(message.channel.id) || message.channel.type === "dm"){
        if (!serverRole && `${command} ${subCommand}` !== 'role add' && message.channel.type !== "dm"){
            message.author.send(`Please use \`$role add\` before using \`$${command} ${subCommand}\`.`);
            return;
        }

        //#region command event
        switch(command) {
            case 'test':
                if (message.author.id === '107852471136686080') {
                    bot.commands.get('test').execute(bot, message, args);
                }
            break;
            
            case 'event':
                if (message.guild) {
                    if(!subCommand) {
                        bot.commands.get('EventInterface').execute(bot, message, EventList.getEvents());
                        //message.author.send('You need to enter a second argument. For a list of commands write $help.');
                        break;
                    }
                    switch(subCommand){
                        case 'ps2op':
                            bot.commands.get('PS2OP').execute(bot, message);
                        break;

                        case 'single':
                            bot.commands.get('Single').execute(bot, message);
                        break;

                        case 'testop':
                            bot.commands.get('TestOp').execute(bot, message); 
                        break;

                        case 'ow':
                            bot.commands.get('OW').execute(bot, message); 
                        break;

                        case 'foxop':
                            bot.commands.get('FoxOp').execute(bot, message); 
                        break;

                        case 'delete':
                            message.guild.roles.fetch(serverRole.role_id).then(role=>{
                                if (message.member.roles.highest.comparePositionTo(role) >= 0 || message.member.hasPermission("ADMINISTRATOR")) {
                                    bot.commands.get('delete').execute(bot, message);
                                }else {
                                    message.author.send('You are lacking the required permissions.');
                                }
                            });
                        break;
                        
                        default:
                            message.author.send(`No command \"$${command} ${subCommand}\". For a list of commands write $help.`)
                    }
                }
                else {
                    message.author.send('Please use the command in a server channel.');
                }
                
            break;

            case 'csv':
                message.guild.roles.fetch(serverRole.role_id).then(role=>{
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
                .execute(bot, message, subCommand);
        break;

        case 'notify':
            FileSystem.ignoreUser(message.author.id);
        break;

        case 'role':
                if (message.member.hasPermission("ADMINISTRATOR")) {
                    bot.commands
                        .get('role')
                        .execute(bot, message, serverRole, subCommand);
                }else {
                    message.author.send('You are lacking the required permissions. You need the \`Administrator\` permission.');
                }
        break;

        case 'channel':
                message.guild.roles.fetch(serverRole.role_id).then(role=>{
                    if (message.member.roles.highest.comparePositionTo(role) >= 0 || message.member.hasPermission("ADMINISTRATOR")) {
                        bot.commands
                            .get('channel')
                            .execute(bot, message, subCommand, serverRole.role_id);
                    }else {
                        message.author.send('You are lacking the required permissions.');
                    }});
        break;
    }
    //#endregion
           
    
});


bot.login(token);