const Discord = require('discord.js');
// const bot = new Discord.Client();

class Event {
    constructor(name, time, description) {
        this.name = name;
        this.time = time;
        this.description = description;
        this.infantrySignups = [];
        this.armorSignups = [];
        this.airSignups= [];
        this.slSignups = [];
    }

    addInfantrySignup(name) {
        this.infantrySignups.push(name);
    }

    removeInfantrySignup(name) {
        const isUsername = (element) => element === name;
        this.infantrySignups.splice(this.infantrySignups.findIndex(isUsername) ,1);
    }

    addArmorSignup(name) {
        this.armorSignups.push(name);
    }

    removeArmorSignup(name) {
        const isUsername = (element) => element === name;
        this.armorSignups.splice(this.armorSignups.findIndex(isUsername) ,1);
    }

    addAirSignup(name) {
        this.airSignups.push(name);
    }

    removeAirSignup(name) {
        const isUsername = (element) => element === name;
        this.airSignups.splice(this.airSignups.findIndex(isUsername) ,1);
    }

    addSlSignup(name) {
        this.slSignups.push(name);
    }

    removeSlSignup(name) {
        const isUsername = (element) => element === name;
        this.slSignups.splice(this.slSignups.findIndex(isUsername) ,1);
    }

    getTotalSignups() {
        return this.infantrySignups.length 
            + this.armorSignups.length 
            + this.airSignups.length;
    }
}

const events = {};
let didSetupListeners = false;

const botUserId = '706985785529860147';

const infantryEmoji = "707719532721995883";
const airEmoji = "707719532785172581";
const armorEmoji = "707719532617269280";
const slEmoji = '⭐';


module.exports = {
    name: 'PS2OP',
    description: 'Sets up an OP for PS2.',
    execute(bot, message, args, token){

        setupListeners(bot);

        //console.log('pepeL emote: ', bot.emojis.resolveIdentifier("440825903426043924"));
        //const emojiTest = bot.emoji.resolve("440825903426043924");
        /*const infantryEmoji = bot.emojis.resolve("440825903426043924");
        const airEmoji = bot.emojis.resolve("440825903426043924");
        const armorEmoji = bot.emojis.resolve("440825903426043924");
        const slEmoji = '⭐';*/

        // bot.login(token);
       
        eventName = ' ';
        eventTime = ' ';
        eventDescription = ' ';

        const filter = m => m.author.id === message.author.id;
        message.channel.bulkDelete(1).catch(console.error);
        
        message.channel.send('What is the name of the OP?').then(() => {
            message.channel.awaitMessages(filter, {max:1, time: 300000, errors:['time'] })
            .then(collected =>{
                eventName = collected.first().content;
                message.channel.bulkDelete(2).catch(console.error);
                message.channel.send('What time is the OP?').then(() =>{
                    message.channel.awaitMessages(filter, {max:1, time: 300000, errors:['time'] })
                        .then(collected => {
                            eventTime = collected.first().content
                            message.channel.bulkDelete(2).catch(console.error);
                            message.channel.send('Write a short description of the OP.').then(() =>{
                                message.channel.awaitMessages(filter, {max:1, time: 300000, errors:['time'] })
                                    .then(collected =>{
                                        eventDescription = collected.first().content;
                                        message.channel.bulkDelete(2).catch(console.error);
                                        
                                        event = new Event(eventName, eventTime, eventDescription);

                                        drawEmbed(event);
                                    }).catch(() =>{
                                        message.channel.send('No description was entered.');
                                        message.channel.bulkDelete(2).catch(console.error);
                                    })
                                })
                            

                    }).catch(() =>{
                        message.channel.send('No time was entered.');
                        message.channel.bulkDelete(2).catch(console.error);
                    })
                })
            }).catch(() =>{
                message.channel.send('No name was entered.');
                message.channel.bulkDelete(2).catch(console.error);
            })

        });

        message.channel.fetch();
        
        async function drawEmbed(event){
            const embed = createEmbedForEvent(event);

            await message.channel.send(embed)
                .then(async embed => {
                    events[embed.id] = event;

                    try {
                        await embed.react(infantryEmoji);
                        await embed.react(armorEmoji);
                        await embed.react(airEmoji);
                        await embed.react(slEmoji);
                    } catch (error) {
                        console.log(error);
                    }
                })
        }      
         
    }
}

function createEmbedForEvent(event) {
    return new Discord.MessageEmbed()
        .setTitle(event.name)
        .setDescription(event.description)
        .addField(
            'Infantry (' + event.infantrySignups.length + ')', 
            createMembersListFromSignups(event.infantrySignups), 
            true)
        .addField(
            'Armor (' + event.armorSignups.length + ')', 
            createMembersListFromSignups(event.armorSignups), 
            true)
        .addField(
            'Air (' + event.airSignups.length + ')', 
            createMembersListFromSignups(event.airSignups), 
            true)
        .addField(
            'Squad Leaders (' + event.slSignups.length + ')', 
            createMembersListFromSignups(event.slSignups))
        .addField(
            'Total number of signups:', event.getTotalSignups())
        .setFooter(event.time)
        .setColor(0xF1C40F);
}

function createMembersListFromSignups(signups) {
    if (signups.length == 0) return 'Empty';

    var members = '';

    for (let i = 0; i < signups.length; i++) {
        members += signups[i] + '\n';
    }

    return members;
}

async function updateEmbedForEvent(message, event) {
    const embed = createEmbedForEvent(event);

    await message.edit(message.embeds[0] = embed);
}

function setupListeners(bot) {
    if (didSetupListeners) return;

    bot.on('messageReactionAdd', (reaction, user) => {
        messageReactionAdded(reaction, user, bot);
    })
    bot.on('messageReactionRemove', (reaction, user) => {
        messageReactionRemoved(reaction, user, bot);
    })

    didSetupListeners = true;
}

function messageReactionAdded(reaction, user, bot) {
    let message = reaction.message;

    if (message.guild.member(user.id) == botUserId) return;

    let emoji = reaction.emoji;
    let event = events[message.id];
    let username = user.username;

    console.log('Event: ' + event.name + ', Signup: ' + emoji.name + ', User: ' + username);
    //console.log('emoji identifier: ', bot.emojis.resolveIdentifier(armorEmoji)/*.substring().split(":", 1).toString()*/);

    if (emoji.name === bot.emojis.resolveIdentifier(infantryEmoji).substring().split(":", 1).toString() && !event.infantrySignups.includes(username)) {
        event.addInfantrySignup(username);
    }
    else if (emoji.name === bot.emojis.resolveIdentifier(armorEmoji).substring().split(":", 1).toString() && !event.armorSignups.includes(username)) {
        event.addArmorSignup(username);
    }
    else if (emoji.name === bot.emojis.resolveIdentifier(airEmoji).substring().split(":", 1).toString() && !event.airSignups.includes(username)) {
        event.addAirSignup(username);
    }
    else if (emoji.name === slEmoji && !event.slSignups.includes(username)) {
        event.addSlSignup(username);
    }

    updateEmbedForEvent(message, event);
}

function messageReactionRemoved(reaction, user, bot) {
    let message = reaction.message;

    if (message.guild.member(user.id) == botUserId) return;

    let emoji = reaction.emoji;
    let event = events[message.id];
    let username = user.username;

    console.log('Event: ' + event.name + ', Signoff: ' + emoji.name + ', User: ' + username);
    
    if (emoji.name === bot.emojis.resolveIdentifier(infantryEmoji).substring().split(":", 1).toString() && event.infantrySignups.includes(username)) {
        event.removeInfantrySignup(username);
    }
    else if (emoji.name === bot.emojis.resolveIdentifier(armorEmoji).substring().split(":", 1).toString() && event.armorSignups.includes(username)) {
        event.removeArmorSignup(username);
    }
    else if (emoji.name === bot.emojis.resolveIdentifier(airEmoji).substring().split(":", 1).toString() && event.airSignups.includes(username)) {
        event.removeAirSignup(username);
    }
    else if (emoji.name === slEmoji && event.slSignups.includes(username)) {
        event.removeSlSignup(username);
    }

    updateEmbedForEvent(message, event);
}

