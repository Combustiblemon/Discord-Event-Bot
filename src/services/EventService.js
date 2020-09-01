const BotEvent = require('../models/Event');
const FileSystem = require('../services/FileSystem');
const SignupOption = require('../models/SignupOption');
const Discord = require('discord.js');
const fs = require('fs');
const index = require('../../index');

const botUserId = process.env.DISCORD_BOT_USER_ID;

let csvEmoji = '📋';

class EventService {
    
    /**
     * @type {Object}
     */
    events = {};

    /**
     * @type {boolean}
     */
    didSetupListeners = false;

    /**
     * 
     * @param {Discord.Client} bot
     * @param {Discord.TextChannel} channel
     * @param {BotEvent} event 
     */
    newEvent(bot, channel, event) {
        this.setupListeners(bot);

        this.postEmbedForEvent(channel, event);
    }

    /**
     * 
     * @param {Discord.TextChannel} channel
     * @param {BotEvent} event 
     */
    async postEmbedForEvent(channel, event) {
        const embed = this.createEmbedForEvent(event);
        
        

        await channel.send(embed)
            .then(async embed => {
                let fileName = FileSystem.getFileNameForEvent(event);

                FileSystem.addEmbedName(fileName);
                this.saveEventForMessageId(event, embed.id);
                FileSystem.addEmbedID(embed.id);

                try {
                    await event.signupOptions.forEach(signupOption => {
                        embed.react(signupOption.emoji);
                    });

                    await embed.react(csvEmoji);
                    await FileSystem.writeJSON(event, embed, 'both');
                    await FileSystem.createCSV(event, embed.guild.name);
                } catch (error) {
                    console.error(error);
                }

            })
    }

    /**
     * 
     * @param {Discord.Message} message 
     * @param {BotEvent} event 
     */
    async editEmbedForEvent(message, event) {
        const embed = this.createEmbedForEvent(event);
        
        await message.edit(message.embeds[0] = embed);
        
        FileSystem.createCSV(event, message.guild.name);
        FileSystem.writeJSON(event, embed, 'event');
    }

    /**
     * 
     * @param {BotEvent} event
     * @returns {Discord.MessageEmbed}
     */
    createEmbedForEvent(event) {
        let embed = new Discord.MessageEmbed()
            .setTitle(event.name)
            .setDescription(event.description)
            .setColor(0xF1C40F)
            .setFooter(`Click 📋 to get signups.\n Created by: ${event.author}`);

        let dateOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }

        embed.addField('Date', event.date.toLocaleDateString('en-US', dateOptions));

        let timeOptions = {
            timeZone: 'UTC',
            timeZoneName: 'short',
            hourCycle: 'h23'
        }

        let startTime = event.date.toLocaleTimeString('en-GB', timeOptions);

        let startTimeField = `${startTime}\n[🕓 Convert time to local](https://google.com/search?q=${encodeURI(startTime)})`
        
        embed.addField('Start time', startTimeField);
        
        let signupOptionsField = {field: '', count: 0};
        
        event.signupOptions.forEach(signupOption => {
            if (signupOption.isAdditionalRole || signupOption.isInline) return;

            let displayEmoji = signupOption.emoji
            if (displayEmoji.length > 4){
                displayEmoji = `<:${signupOption.emoji}>`;
            }
                
            signupOptionsField.field += `${displayEmoji} ${signupOption.name}: ${signupOption.getNumberOfSignups()}\n`;
            signupOptionsField.count += 1;
        });

        if(signupOptionsField.count > 0){
            signupOptionsField.field += `Total: ${ event.getTotalSignups()}\n`
            embed.addField(
                `Signups:`, 
                signupOptionsField.field
            );
        }

        event.signupOptions.forEach(signupOption => {
            if (!signupOption.isAdditionalRole && !signupOption.isInline) return;

            let displayEmoji = signupOption.emoji
            if (displayEmoji.length > 4){
                displayEmoji = `<:${signupOption.emoji}>`;
            }

            embed.addField(
                `${displayEmoji} ${signupOption.name}: ${signupOption.getNumberOfSignups()}`,
                this.createMembersListFromSignups(signupOption.signups),
                signupOption.isInline
            );
        });

        return embed;
    }

    /**
     * 
     * @param {string[]} signups
     * @returns {string}
     */
    createMembersListFromSignups(signups) {
        if (signups.length == 0) return 'Empty';
    
        var members = '';
    
        for (let i = 0; i < signups.length; i++) {
            members += signups[i] + '\n';
        }
    
        return members;
    }

    /**
     * 
     * @param {Event} event
     * @param {string} messageId 
     */
    saveEventForMessageId(event, messageId) {
        this.events[messageId] = event;
    }

    /**
     * 
     * @param {string} messageId
     * @returns {Event} 
     */
    getEventForMessageId(messageId) {
        return this.events[messageId];
    }

    /**
     * 
     * @param {Discord.Client} bot
     */
    setupListeners(bot) {
        if (this.didSetupListeners) return;
    
        bot.on('messageReactionAdd', async (reaction, user) => {
            if (reaction.message.partial) await reaction.message.fetch();
            this.messageReactionAdded(reaction, user);
        })
        
        bot.on('messageReactionRemove', async (reaction, user) => {
            if (reaction.message.partial) await reaction.message.fetch();
            this.messageReactionRemoved(reaction, user);
        })
    
        this.didSetupListeners = true;
    }

    /**
     * 
     * @param {Discord.MessageReaction} reaction 
     * @param {Discord.User} user 
     */
    async messageReactionAdded(reaction, user) {
        let message = reaction.message;
    
        if (message.guild.member(user.id) == botUserId) return;
        
        let event = this.getEventForMessageId(message.id);

        if (!event) {
            console.log('No event found for message: ' + message.id);
            return;
        }

        let reactionUser = await message.guild.members.fetch(user.id);
        let emoji = reaction.emoji;
        let username = reactionUser.displayName;

        console.log('Event: ' + event.name + ', Signup: ' + emoji.name + ', User: ' + username);
        
        let signupOption = event.getSingupOptionForEmoji(emoji);
        let guildname = reaction.message.guild.name.replace(/[<>:"/\\|?*]/gi, '');
        if(signupOption == csvEmoji){
            let roles = index.GetRoles();
            var serverIndex = roles.findIndex(x=>x.includes(message.guild.name));
            message.guild.roles.fetch(roles[serverIndex][1]).then(role=>{
                if (reactionUser.roles.highest.comparePositionTo(role) >= 0 || reactionUser.hasPermission('ADMINISTRATOR')) {
                    user.send('CSV file for ' + event.name +'.\n', {files: [
                        (`./csv_files/${guildname}/${FileSystem.getFileNameForEvent(event)}.csv`)
                    ]});
                    reaction.users.remove(user.id);
                    return;
                    
                }else {
                    user.send('You are lacking the required permissions.');
                    reaction.users.remove(user.id);
                    return;
                }
            });
            return;
        }

        if (!signupOption) {
            console.log('No signup option for emoji: ' + emoji.name + ', ' + emoji.identifier + ', ' + emoji.id);
            reaction.users.remove(user.id);
            return;
        }

        if (signupOption.isAdditionalRole) {
            if (signupOption.signups.find(s => s == username)) {
                console.log(`User ${username} is already signed up for ${event.name} as ${signupOption.name}`);
                return;
            }
        }   
        else {
            let allSignups = event.signupOptions
                .filter(so => !so.isAdditionalRole)
                .map(so => so.signups)
                .flat(1);

            if (allSignups.find(s => s == username)) {
                console.log('User ' + username + ' is already signed up for ' + event.name);
                reaction.users.remove(user.id);
                return;
            }
        }

        signupOption.addSignup(username);
    
        this.editEmbedForEvent(message, event);
    }
    
    /**
     * 
     * @param {Discord.MessageReaction} reaction 
     * @param {Discord.User} user 
     */
    async messageReactionRemoved(reaction, user) {
        let message = reaction.message;
    
        if (message.guild.member(user.id) == botUserId) return;
        
        let event = this.getEventForMessageId(message.id);

        if (!event) {
            console.log('No event found for message: ' + message.id);
            return;
        }

        let reactionUser = await message.guild.members.fetch(user.id);
        let emoji = reaction.emoji;
        let username = reactionUser.displayName;

        console.log('Event: ' + event.name + ', Signup: ' + emoji.name + ', User: ' + username);

        let signupOption = event.getSingupOptionForEmoji(emoji);
        
        if(signupOption == csvEmoji){
            return;
        }

        if (!signupOption) {
            console.log('No signup option for emoji: ' + emoji.name + ', ' + emoji.identifier + ', ' + emoji.id);
            return;
        }

        if (!signupOption.signups.find(s => s == username)) {
            console.log('User ' + username + ' is not signed up for ' + event.name);
            return;
        }

        signupOption.removeSignup(username);
    
        this.editEmbedForEvent(message, event);
    }
}

module.exports = new EventService();
