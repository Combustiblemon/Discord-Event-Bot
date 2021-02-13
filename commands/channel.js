const Discord = require('discord.js');
const FileSystem = require('../src/services/FileSystem');

module.exports = {
    name: 'channel',
    description: 'Adds or removes a channel',
    /**
     * 
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message
     * @param {string} subCommand 
     * @param {String} serverRoleID
     */
    execute(bot, message, subCommand, serverRoleID) {
        if (message.guild === null) {
            message.author.send('Please use this command in a server channel.');
            return;
        }

        if (!subCommand) { 
            message.author.send('You need to enter a second argument. For a list of commands write $help.');   
            return;                    
        }

        if (!serverRoleID) {
            message.author.send("You need to add at least one role for the server first.\n`$role add`");
            return;
        }

        switch (subCommand) {
            case 'add':
                addChannel(message, serverRoleID);
                break;

            case 'remove':
                removeChannel(message, serverRoleID);
                break;
        }
    }
}

//#region addChannel
/**
 * 
 * @param {Discord.Message} message
 * @param {String} serverRoleID  
 */
async function addChannel( message, serverRoleID) {
    let author = message.author;

    message.guild.roles.fetch(serverRoleID).then(async role => {
    
        if (message.member.roles.highest.comparePositionTo(role) < 0 && !message.member.hasPermission("ADMINISTRATOR")) {
            author.send('You are lacking the required permissions.');
            return;
        }


        if (await FileSystem.getWhitelistedChannel(message.channel.id)) {
            author.send('```Channel already whitelisted.```');
            return;
        }
        
        await FileSystem.ensureDirectoryExistence(`./csv_files/${message.guild.name.replace(/[<>:"/\\|?*]/gi, '')}/test.csv`);

        FileSystem.addChannelToWhitelist(message.channel.id, message.guild.id);
        console.log(new Date(), `User "${message.author.username}" whitelisted channel "${message.channel.name}"(${message.channel.id}) in "${message.guild.name}"`);
        author.send('```Channel added to whitelist.```');
    });
}
//#endregion

//#region removeChannel
/**
 * 
 * @param {Discord.Message} message
 * @param {String} serverRoleID  
 */
function removeChannel( message, serverRoleID) {
    let author = message.author;

    message.guild.roles.fetch(serverRoleID).then(async role => {
    
        if (message.member.roles.highest.comparePositionTo(role) < 0) {
            author.send('```You are lacking the required permissions.```');
            return;
        }

        
        if (!await FileSystem.getWhitelistedChannel(message.channel.id)) {
            author.send('```The channel isn\'t whitelisted.```');
            return;
        }
        
        FileSystem.removeChannelFromWhitelist(message.channel.id);
        console.log(new Date(), `User "${message.author.username}" dewhitelisted channel "${message.channel.name}"(${message.channel.id}) in "${message.guild.name}"`);
        author.send('```Channel removed from whitelist.```');
    });
}
//#endregion
