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
     * @param {Array} allowedChannels
     * @param {Array} roles
     * @param {number} serverIndex
     */
    execute(bot, message, subCommand, allowedChannels, roles, serverIndex) {
        if (message.guild === null) {
            message.author.send('Please use this command in a server channel.');
            return;
        }

        if (!subCommand) { 
            message.author.send('You need to enter a second argument. For a list of commands write $help.');   
            return;                    
        }

        if (serverIndex === -1) {
            message.author.send("You need to add at least one role for the server first.\n`$role add`");
            return;
        }

        switch (subCommand) {
            case 'add':
                addChannel(allowedChannels, message, roles, serverIndex);
                break;

            case 'remove':
                removeChannel(allowedChannels, message, roles, serverIndex);
                break;
        }
    }
}

/**
 * 
 * @param {Array} allowedChannels
 * @param {Discord.Message} message
 * @param {Array} roles
 * @param {number} serverIndex  
 */
function addChannel(allowedChannels, message, roles, serverIndex) {
    let author = message.author;

    message.guild.roles.fetch(roles[serverIndex][1]).then(async role => {
    
        if (message.member.roles.highest.comparePositionTo(role) < 0) {
            author.send('You are lacking the required permissions.');
            return;
        }


        if (allowedChannels.includes(message.channel.id)) {
            author.send('Channel already whitelisted.');
            return;
        }
        
        await FileSystem.ensureDirectoryExistence(`./csv_files/${message.guild.name.replace(/[<>:"/\\|?*]/gi, '')}/test.csv`);

        allowedChannels.push(message.channel.id);
        FileSystem.writeData(allowedChannels, 'channels', '');
        author.send('Channel added to whitelist.');
    });
}

/**
 * 
 * @param {Array} allowedChannels
 * @param {Discord.Message} message
 * @param {Array} roles
 * @param {number} serverIndex  
 */
function removeChannel(allowedChannels, message, roles, serverIndex) {
    let author = message.author;

    message.guild.roles.fetch(roles[serverIndex][1]).then(role => {
    
        if (message.member.roles.highest.comparePositionTo(role) < 0) {
            author.send('You are lacking the required permissions.');
            return;
        }


        if (!allowedChannels.includes(message.channel.id)) {
            author.send('The channel isn\'t whitelisted.');
            return;
        }
        
        allowedChannels.splice(allowedChannels.indexOf(message.channel.id), 1);
        FileSystem.writeData(allowedChannels, 'channels', '');
        author.send('Channel removed from whitelist.');
    });
}
