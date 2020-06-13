const fs = require('fs');
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
     * @param {string} mode 
     */
    execute(bot, message, roles, mode) {

        //Find the server index in the array
        let serverIndex = roles.findIndex(x => x.includes(message.guild.name));

        if (serverIndex === -1 && mode === 'remove') {
            message.author.send('There is no role for this server.');

            return;
        }

        let filter = m => m.author.id === message.author.id;
        
        if (mode == 'add') {
            message.author.send("```Type the ID of the role you want to add as a new minimum:```").then(msg => {
                msg.channel.awaitMessages(filter, { max: 1, time: 600000, errors: ['time'] }).then(collected => {
                    let answer = collected.first().content;
                    if (serverIndex !== -1 && roles[serverIndex][1] === answer) {
                        message.author.send('This role is already the minimum.');

                        return;
                    } else {
                        answer = answer.trim();
                        const tempArray = [message.guild.name, answer];
                        roles.push(tempArray);
                        FileSystem.writeData(roles, 'roles', './');
                        message.author.send('Role Added.');

                        return;
                    }
                }).catch(error => {
                    console.error(error);
                    message.author.send('No ID was entered.');
                })
            }).catch(() => {
                console.error(error);
                message.author.send('No ID was entered.');
            })

        } else if (mode == 'remove') {
            let msg = message.author.send("```Type the ID of the role you want to remove:```").then(msg => {
                msg.channel.awaitMessages(filter, { max: 1, time: 600000, errors: ['time'] }).then(collected => {
                    if (typeof roles[serverIndex][1] !== 'undefined' && roles[serverIndex][1] === collected.first().content) {
                        roles.splice(serverIndex, 1);
                        FileSystem.writeData(roles, 'roles', './')
                        message.author.send('Role removed.');

                        return;
                    } else {
                        message.guild.roles.fetch(collected.first().content).then(role => {
                            message.author.send('The roleID does not exist in the database.');

                            return;
                        });
                    }
                }).catch(() => {
                    message.author.send('No ID was entered.');
                })
            }).catch(() => {
                message.author.send('No ID was entered.');
            })
        }

        return;
    }
}

/*message.author.send("```Type the ID of the channel you want to remove:```").then(()=>{
                        message.channel.awaitMessages(filter, {max: 1, time:600_000, errors:['time']}).then(collected =>{
                            if(!allowedChannels.includes(collected.first().content)){
                                message.author.send('The channel isn\'t whitelisted.');
                            }else{
                                allowedChannels.splice(allowedChannels.indexOf(collected.first().content), 1);
                                message.author.send('Channel removed from whitelist.');
                                FileSystem.writeData(allowedChannels, 'channels', '');
                            }
                        })
                    }).catch(()=>{
                        message.author.send('No ID was entered.');
                    })*/