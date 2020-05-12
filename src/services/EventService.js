const BotEvent = require('../models/Event');
const Discord = require('discord.js');

const botUserId = '707594931287490611';

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
                this.saveEventForMessageId(event, embed.id);

                try {
                    await event.signupOptions.forEach(signupOption => {
                        embed.react(signupOption.emoji);
                    });
                } catch (error) {
                    console.log(error);
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
            .setFooter(event.time)
            .setColor(0xF1C40F);

        let embedCount = 0;

        event.signupOptions.forEach(signupOption => {
            // Additional roles are displayed on a separate line
            const isInline = !signupOption.isAdditionalRole;

            embed.addField(
                signupOption.name + ' (' + signupOption.getNumberOfSignups() + ')',
                this.createMembersListFromSignups(signupOption.signups),
                isInline
            );

            embedCount++;
        })

        embed.addField('Total number of signups:', event.getTotalSignups());

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
    
        bot.on('messageReactionAdd', (reaction, user) => {
            this.messageReactionAdded(reaction, user);
        })
        
        bot.on('messageReactionRemove', (reaction, user) => {
            this.messageReactionRemoved(reaction, user);
        })
    
        this.didSetupListeners = true;
    }

    /**
     * 
     * @param {Discord.MessageReaction} reaction 
     * @param {Discord.User} user 
     */
    messageReactionAdded(reaction, user) {
        let message = reaction.message;
    
        if (message.guild.member(user.id) == botUserId) return;
        
        let event = this.getEventForMessageId(message.id);

        if (!event) {
            console.log('No event found for message: ' + message.id);
            return;
        }

        let emoji = reaction.emoji;
        let username = user.username;

        console.log('Event: ' + event.name + ', Signup: ' + emoji.name + ', User: ' + username);

        let signupOption = event.getSingupOptionForEmoji(emoji.name);

        if (!signupOption) {
            console.log('No signup option for emoji: ' + emoji.name);
            return;
        }

        if (signupOption.signups.find(s => s == username)) {
            console.log('User ' + username + ' is already signed up for ' + event.name);
            return;
        }

        signupOption.addSignup(username);
    
        this.editEmbedForEvent(message, event);
    }
    
    /**
     * 
     * @param {Discord.MessageReaction} reaction 
     * @param {Discord.User} user 
     */
    messageReactionRemoved(reaction, user) {
        let message = reaction.message;
    
        if (message.guild.member(user.id) == botUserId) return;
        
        let event = this.getEventForMessageId(message.id);

        if (!event) {
            console.log('No event found for message: ' + message.id);
            return;
        }

        let emoji = reaction.emoji;
        let username = user.username;

        console.log('Event: ' + event.name + ', Signup: ' + emoji.name + ', User: ' + username);

        let signupOption = event.getSingupOptionForEmoji(emoji.name);

        if (!signupOption) {
            console.log('No signup option for emoji: ' + emoji.name);
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
