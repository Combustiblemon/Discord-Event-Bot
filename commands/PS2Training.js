const Discord = require('discord.js');
// const bot = new Discord.Client();

class Event {
    constructor(name, time, description) {
        this.name = name;
        this.time = time;
        this.description = description;
        this.trainingSignups = [];
    }

    addTrainingSignup(name) {
        this.trainingSignups.push(name);
    }

    removeTrainingSignups(name) {
        const isUsername = (element) => element === name;
        this.trainingSignups.splice(this.trainingSignups.findIndex(isUsername) ,1);
    }

    getTotalSignups() {
        return this.trainingSignups.length;
    }
}

const events = {};
let didSetupListeners = false;

const botUserId = '706985785529860147';

const signupEmoji = '✅';

module.exports = {
    name: 'PS2Training',
    description: 'Sets up a training for PS2.',
    execute(bot, message, args, token){

        setupListeners(bot);

        eventName = ' ';
        eventTime = ' ';
        eventDescription = ' ';

        const filter = m => m.author.id === message.author.id;
        message.channel.bulkDelete(1).catch(console.error);
        
        message.channel.send('What is the name of the training?').then(() => {
            message.channel.awaitMessages(filter, {max:1, time: 300000, errors:['time'] })
            .then(collected =>{
                eventName = collected.first().content;
                message.channel.bulkDelete(2).catch(console.error);
                message.channel.send('What time is the training?').then(() =>{
                    message.channel.awaitMessages(filter, {max:1, time: 300000, errors:['time'] })
                        .then(collected => {
                            eventTime = collected.first().content
                            message.channel.bulkDelete(2).catch(console.error);
                            message.channel.send('Write a short description of the Training.').then(() =>{
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
                        await embed.react(signupEmoji);
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
            'Training Signups (' + event.trainingSignups.length + ')', 
            createMembersListFromSignups(event.trainingSignups), 
            true)
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
        messageReactionAdded(reaction, user);
    })
    bot.on('messageReactionRemove', (reaction, user) => {
        messageReactionRemoved(reaction, user);
    })

    didSetupListeners = true;
}

function messageReactionAdded(reaction, user) {
    let message = reaction.message;

    if (message.guild.member(user.id) == botUserId) return;

    let emoji = reaction.emoji;
    let event = events[message.id];
    let username = user.username;

    console.log('Event: ' + event.name + ', Signup: ' + emoji.name + ', User: ' + username);
    
    if (emoji.name === signupEmoji && !event.trainingSignups.includes(username)) {
        event.addTrainingSignup(username);
        
    }

    updateEmbedForEvent(message, event);
}

function messageReactionRemoved(reaction, user) {
    let message = reaction.message;

    if (message.guild.member(user.id) == botUserId) return;

    let emoji = reaction.emoji;
    let event = events[message.id];
    let username = user.username;

    console.log('Event: ' + event.name + ', Signoff: ' + emoji.name + ', User: ' + username);
    
    if (emoji.name === signupEmoji && event.trainingSignups.includes(username)) {
        event.removeTrainingSignups(username);
    }

    updateEmbedForEvent(message, event);
}

