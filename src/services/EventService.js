const BotEvent = require('../models/Event');
const FileSystem = require('../services/FileSystem');
const SignupOption = require('../models/SignupOption');
const Discord = require('discord.js');
const fs = require('fs');
const index = require('../../index');
const EventDetailsService = require('./EventDetailsService');
const DeleteEvent = require('../../commands/delete');
const { getRoleToPing } = require('./RoleService');
const { deleteEmbed } = require('../../commands/delete');
const SQLiteUtilities = require('../utils/SQLiteUtilities');

const botUserId = process.env.DISCORD_BOT_USER_ID;

let csvEmoji = '📋';
const deleteEmoji = "🗑";
let blacklist = JSON.parse(fs.readFileSync('blacklist.json', 'utf8'));


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

        this.postEmbedForEvent(channel, event, bot);
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
     * @param {Discord.TextChannel} channel
     * @param {BotEvent} event 
     * @param {Discord.Client} bot
     */
    async postEmbedForEvent(channel, event, bot) {
        const embed = this.createEmbedForEvent(event);
        let author = await bot.users.fetch(event.authorID)
        let roleIDtoPing = await getRoleToPing(channel.guild, author)
        let text = ''
        if(roleIDtoPing){
            if(roleIDtoPing == '@everyone' || roleIDtoPing == '@here'){
                text = roleIDtoPing
            }else{
                text = `<@&${roleIDtoPing}>`
            }
        }
        

        await channel.send(text, {embed:embed})
            .then(async embed => {
                let fileName = FileSystem.getFileNameForEvent(event);


                try {
                    await event.signupOptions.forEach(signupOption => {
                        embed.react(signupOption.emoji);
                    });

                    if(event.csv) {
                        await embed.react(csvEmoji);
                        await FileSystem.createCSV(event, embed.guild.id);
                    }
                    await embed.react(deleteEmoji);

                    FileSystem.saveEvent(event, embed);
                    console.log(new Date(), `${event.author} created event ${event.name}. Server: ${channel.guild.name}`)
                    author.send(`\`\`\`Event created successfully.\`\`\``)
                } catch (error) {
                    console.error(new Date(), error);
                }

            })
    }

    /**
     * 
     * @param {Discord.Message} message 
     * @param {BotEvent} event 
     */
    async editEmbedForEvent(message, event) {
        let embed = this.createEmbedForEvent(event);
        
        embed = await message.edit(message.embeds[0] = embed);
        
        FileSystem.createCSV(event, message.guild.id);
        //FileSystem.writeJSON(event, embed, 'event');
        FileSystem.updateEvent(event, embed);
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
                
            signupOptionsField.field += `${displayEmoji} ${signupOption.name}: ${signupOption.signups.length}\n`;
            signupOptionsField.count += 1;
        });

        if(signupOptionsField.count > 0){
            signupOptionsField.field += `Total: ${ EventFunctions.getTotalSignups(event)}\n`
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
                `${displayEmoji} ${signupOption.name}: ${signupOption.signups.length}`,
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
            if((members + signups[i][0] + '\n').length < 1024){
                members += signups[i][0] + '\n';
            }
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
    async getEventForMessageId(messageId) {
        return await FileSystem.getEventFromMsgID(messageId);
    }

    /**
     * 
     * @param {Event} event 
     * @param {String} guildName
     * @param {boolean} signup 
     */
    async createEmbedForSignup(event, guildName, signup){
        let color = 0xffffff
        let text = ''
        if(signup){
            color = 0x1ce1e8
            text = `You have signed up for event \`${event.name}\` in \`${guildName}\``
        }else{
            color = 0xde2410
            text = `You have removed your signup for event \`${event.name}\` in \`${guildName}\``
        }

        let embed = new Discord.MessageEmbed()
            .setDescription(text)
            .setColor(color)
            .setFooter('To stop getting these messages send me `$notify`.\nEvent date:')
            .setTimestamp(event.date);

        return embed
    }

    /**
     * 
     * @param {Discord.MessageReaction} reaction 
     * @param {Discord.User} user 
     */
    async messageReactionAdded(reaction, user) {
        let message = reaction.message;
        
        if (message.channel.type == 'dm') return;
        if (message.guild.member(user.id) == botUserId) return;
        
        let event = await this.getEventForMessageId(message.id);

        if (!event) {
            //console.warn('No event found for message: ' + message.id);
            return;
        }

        let reactionUser = await message.guild.members.fetch(user.id);
        let emoji = reaction.emoji;
        let username = reactionUser.displayName;

        

        let signupOptionIndex = event.signupOptions.findIndex(s => s.emoji === emoji.name || s.emoji === emoji.id || s.emoji === emoji.identifier);
        if(emoji.name === deleteEmoji){
            message.guild.roles.fetch(await FileSystem.getRoleIdFromServerId(message.guild.id)).then(async role=>{
                if (reactionUser.roles.highest.comparePositionTo(role) >= 0 || reactionUser.hasPermission('ADMINISTRATOR')) {
                    let answer = await EventDetailsService.prototype.questionYesNo(`\`Are you sure you want to delete "${event.name}"?\``, reactionUser);
                    if(answer == 'no answer'){ 
                        reactionUser.send('\`Event not deleted.\`')
                        return
                    }
                    if(answer){
                        deleteEmbed(message.id, message);
                        reactionUser.send('\`Event deleted.\`');
                        console.log(new Date(), `${reactionUser.user.tag} deleted ${event.name}. Server: ${message.guild.name}`);
                        return
                    }
                    else reactionUser.send('\`Event not deleted.\`')
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

        if(emoji.name === csvEmoji){
            message.guild.roles.fetch(await FileSystem.getRoleIdFromServerId(message.guild.id)).then(role=>{
                if (reactionUser.roles.highest.comparePositionTo(role) >= 0 || reactionUser.hasPermission('ADMINISTRATOR')) {
                    user.send('CSV file for ' + event.name +'.\n', {files: [
                        (`./csv_files/${message.guild.id}/${FileSystem.getFileNameForEvent(event)}.csv`)
                    ]});
                    reaction.users.remove(user.id);
                    console.log(new Date(), `${reactionUser.user.tag} got csv for ${event.name}. Server: ${message.guild.name}`);
                    return;
                    
                }else {
                    user.send('You are lacking the required permissions.');
                    reaction.users.remove(user.id);
                    return;
                }
            });
            return;
        }

        if (signupOptionIndex === -1) {
            console.log(new Date(), reaction.message.author.tag + '   No signup option for emoji: ' + emoji.name + ', ' + emoji.identifier + ', ' + emoji.id);
            reaction.users.remove(user.id);
            return;
        }

        if (event.signupOptions[signupOptionIndex].isAdditionalRole) {
            if (event.signupOptions[signupOptionIndex].signups.find(s => s == reactionUser.id)) {
                //console.log(new Date(), `User ${reactionUser.user.tag} is already signed up for ${event.name} as ${signupOption.name}`);
                return;
            }
        }   
        else {
            let allSignups = event.signupOptions
                .filter(so => !so.isAdditionalRole)
                .map(so => so.signups)
                .flat(1);

            if (allSignups.find(s => s === reactionUser.id)) {
                //console.log(new Date(), 'User ' + reactionUser.user.tag + ' is already signed up for ' + event.name);
                reaction.users.remove(user.id);
                return;
            }
        }

        //console.log(new Date(), 'Event: ' + event.name + ', Signup: ' + emoji.name + ', User: ' + reactionUser.user.tag);
        event.signupOptions[signupOptionIndex].signups.push([reactionUser.displayName, reactionUser.id]);
        
        this.editEmbedForEvent(message, event);
        if(!(await FileSystem.isIgnoredUser(reactionUser.id))){
            reactionUser.send(await this.createEmbedForSignup(event, message.guild.name, true))
        }
    }
    
    /**
     * 
     * @param {Discord.MessageReaction} reaction 
     * @param {Discord.User} user 
     */
    async messageReactionRemoved(reaction, user) {
        let message = reaction.message;
        
        if (message.channel.type == 'dm') return;
        if (message.guild.member(user.id) == botUserId) return;
        
        let event = await this.getEventForMessageId(message.id);

        if (!event) {
            //console.warn('No event found for message: ' + message.id);
            return;
        }

        let reactionUser = await message.guild.members.fetch(user.id);
        let emoji = reaction.emoji;
        let username = reactionUser.displayName;

        

        let signupOptionIndex = event.signupOptions.findIndex(s => s.emoji === emoji.name || s.emoji === emoji.id || s.emoji === emoji.identifier);
        
        if(emoji.name === csvEmoji || emoji.name === deleteEmoji){
            return;
        }

        if (signupOptionIndex === -1) {
            console.log(new Date(), 'No signup option for emoji: ' + emoji.name + ', ' + emoji.identifier + ', ' + emoji.id);
            return;
        }

        if (!event.signupOptions[signupOptionIndex].signups.find(s => s[1] === reactionUser.id)) {
            console.log(new Date(), 'User ' + reactionUser.user.tag + ' is not signed up for ' + event.name);
            return;
        }

        event.signupOptions[signupOptionIndex].signups.splice(event.signupOptions[signupOptionIndex].signups.findIndex(s => s[1] === reactionUser.id), 1)
        //console.log(new Date(), 'Event: ' + event.name + ', Remove Signup: ' + emoji.name + ', User: ' + reactionUser.user.tag);
        
        this.editEmbedForEvent(message, event);
        if(!(await FileSystem.isIgnoredUser(reactionUser.id))){
            reactionUser.send(await this.createEmbedForSignup(event, message.guild.name, false))
        }
    }

    /**
     * 
     * @param {Discord.User} user 
     */
    messageUserBlacklist(user){
        let index = blacklist.IDs.indexOf(user.id)
        if(index > -1){
            blacklist.IDs.splice(index, 1)
            user.send('```You will now receive messages when you sign up to an event.\nTo revert send me \'$notify\' again.```')
        }else{
            blacklist.IDs.push(user.id);
            user.send('```You will not receive messages when you sign up to an event.\nTo revert send me \'$notify\' again.```')
        }
        FileSystem.writeData(blacklist, 'blacklist.json', '')
    }
}

module.exports = new EventService();
