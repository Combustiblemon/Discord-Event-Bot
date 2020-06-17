const Discord = require('discord.js');
const FileSystem = require('../src/services/FileSystem');

module.exports = {
    name: 'role',
    description: 'Adds or removes a role',
    /**
     * 
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message 
     * @param {Array} roles
     * @param {string} subCommand 
     */
    execute(bot, message, roles, subCommand) {
        if (message.guild === null) {
            message.author.send('Please use the command in a server channel.');
            return;
        }


        if (!message.member.hasPermission("ADMINISTRATOR")) {
            message.author.send("You need to be an administrator to use the `$role` command.");
            return;
        }

        if (!subCommand) { 
            message.author.send('You need to enter a second argument. For a list of commands write $help.');   
            return;                    
        }

        // Find the server index in the array
        let serverIndex = roles.findIndex(x => x.includes(message.guild.name));
        
        if (subCommand == 'add') {
            addRole(message, serverIndex, roles);
        } 
        else if (subCommand == 'remove') {
            if (serverIndex === -1) {
                message.author.send('There is no role for this server.');

                return;
            }

            removeRole(message, serverIndex, roles);
        }

        return;
    }
}

/**
 * 
 * @param {Discord.Message} message
 * @param {string} serverIndex
 * @param {Array} roles
 */
function addRole(message, serverIndex, roles) {
    let author = message.author;
    let text = "```Type the ID of the role you want to add as a new minimum:\nHint: enable discord developer mode and right click the role to get the ID.```";
    let filter = m => m.author.id === author.id;

    author.send(text).then(msg => {
        msg.channel.awaitMessages(filter, { max: 1, time: 600000, errors: ['time'] }).then(collected => {
            let answer = collected.first().content;
            if (serverIndex !== -1 && roles[serverIndex][1] === answer) {
                author.send('This role is already the minimum.');

                return;
            }
            
            answer = answer.trim();
            const tempArray = [message.guild.name, answer];
            roles.push(tempArray);
            FileSystem.writeData(roles, 'roles', './');
            author.send('Role Added.');
        }).catch(() => {
            console.error('No role ID was entered.');
            author.send('No ID was entered.');
        })
    }).catch(() => {
        console.error(new Error('An error occurred'));
        message.author.send('An error occurred');
    })
}

/**
 * 
 * @param {Discord.Message} message
 * @param {string} serverIndex
 * @param {Array} roles
 * @returns {Promise}
 */
function removeRole(message, serverIndex, roles) {
    let author = message.author;
    let text = "```Type the ID of the role you want to remove:```";
    let filter = m => m.author.id === author.id;

    author.send(text).then(question => {
        question.channel.awaitMessages(filter, { max: 1, time: 600000, errors: ['time'] }).then(collected => {
            let answer = collected.first().content;
            if (typeof roles[serverIndex][1] !== 'undefined' && roles[serverIndex][1] === answer) {
                roles.splice(serverIndex, 1);
                FileSystem.writeData(roles, 'roles', './')
                author.send('Role removed.');

                return;
            }
            
            message.guild.roles.fetch(answer).then(role => {
                message.author.send('The roleID does not exist in the database.');

                return;
            });
        }).catch(() => {
            console.error('No role ID was entered.');
            message.author.send('No ID was entered.');
        });
    }).catch(() => {
        cconsole.error(new Error('An error occurred'));
        message.author.send('An error occurred');
    });
}
