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

const infantryEmoji = '🔫';
const airEmoji = '✈';
const armorEmoji = '🚌';
const slEmoji = '⭐';

module.exports = {
    name: 'PS2OP',
    description: 'Sets up an OP for PS2.',
    execute(bot, message, args, token){

        setupListeners(bot);

        // bot.login(token);
       
        eventName = ' ';
        eventTime = ' ';
        eventDescription = ' ';

        const filter = m => m.author.id === message.author.id;
        message.channel.bulkDelete(1).catch(console.error);
        
        message.channel.send('What is the name of the OP?').then(() => {
            message.channel.awaitMessages(filter, {max:1, time: 60000, errors:['time'] })
            .then(collected =>{
                eventName = collected.first().content;
                message.channel.bulkDelete(2).catch(console.error);
                message.channel.send('What time is the OP?').then(() =>{
                    message.channel.awaitMessages(filter, {max:1, time: 60000, errors:['time'] })
                        .then(collected => {
                            eventTime = collected.first().content
                            message.channel.bulkDelete(2).catch(console.error);
                            message.channel.send('Write a short description of the OP.').then(() =>{
                                message.channel.awaitMessages(filter, {max:1, time: 60000, errors:['time'] })
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

    
        //console.log(message.channel.fetch());
        message.channel.fetch();
        
        // bot.on('messageReactionAdd', (reaction, user) =>{
        //     let message = reaction.message;
        //     let emoji = reaction.emoji;
        //     let tempEmbed = message.embeds;

        //     console.log('bot: ' + eventName + ', message: ' + message.embeds[0].title);
            
        //     //let messageState = message.fetch();
           
        //     reactUsernameAdd = user.username;
        //     console.log('in: ', user.username);
            
        //     if (emoji.name === airEmoji){
        //         if(message.guild.member(user.id) != botUserId){
        //             if(!airSignups.includes(reactUsernameAdd)){
        //                 //console.log('add: ', reactUsernameAdd);
        //                 airSignups.push(reactUsernameAdd);
        //                 console.log('array: ', airSignups);
        //                 airCount ++;

                        
        //                 updateEmbed('add', message, airSignups, airCount, 2);
        //             }
        //         }
        //     }
        //  })
        //  bot.on('messageReactionRemove', (reaction, user) =>{
        //     let message = reaction.message;
        //     let emoji = reaction.emoji;

        //     reactUsernameRemove = user.username;
        //     //console.log('out: ', user.username);
        //     if (emoji.name === airEmoji){
        //         if(message.guild.member(user.id) != botUserId){
        //             if(airSignups.includes(reactUsernameRemove)){
        //                 //console.log('remove: ', reactUsernameRemove);
        //                 const isUsername = (element) => element === reactUsernameRemove;
        //                 airSignups.splice(airSignups.findIndex(isUsername) ,1);
        //                 console.log('array: ', airSignups);
        //                 airCount--;

        //                 updateEmbed('remove', message, airSignups, airCount, 2);
        //             }
                    
        //         }
        //     }else if (emoji.name === armorEmoji){
        //         if(message.guild.member(user.id) != botUserId){
        //             if(armorSignups.includes(reactUsernameRemove)){
        //                 //console.log('remove: ', reactUsernameRemove);
        //                 const isUsername = (element) => element === reactUsernameRemove;
        //                 armorSignups.splice(armorSignups.findIndex(isUsername) ,1);
        //                 //console.log('array: ', airSignups);
        //             }
                    
        //         }
        //     }
        //  })
        
        async function drawEmbed(event){
            const embed = createEmbedForEvent(event);

            await message.channel.send(embed)
                .then(async embed => {
                    events[embed.id] = event;

                    try {
                        await embed.react(airEmoji);
                        await embed.react(armorEmoji);
                        await embed.react(infantryEmoji);
                        await embed.react(slEmoji);
                    } catch (error) {
                        console.log(error);
                    }

                    //bot.message.reactionAdd()
                })
        }

        // async function updateEmbed(operation, passedMessage, passedArray, index, fieldIndex){
            
        //     if (operation === 'add'){
        //         //console.log('passed embed: ', passedMessage.embeds[0]);
        //         //console.log('passed embed field: ', passedMessage.embeds[0].fields[0]);                
                
        //         var members = 'empty';
        //         if(index != 0){
        //             members = ' ';
        //             for (let i =0; i < index; i++){
        //             members += passedArray[i] + '\n ';
        //             }
        //         }
                
        //         var tempEmbed = await new Discord.MessageEmbed().addField('Air (' + airCount + ')', members, true)
        //         await passedMessage.edit(passedMessage.embeds[0].spliceFields(fieldIndex, 1, tempEmbed.fields[0]));
        //         //console.log('passed embed field edit: ', passedEmbed[0].fields[0]);

        //         tempEmbed = await new Discord.MessageEmbed().addField('Total number of signups:', infantryCount + armorCount + airCount + slCount)
        //         await passedMessage.edit(passedMessage.embeds[0].spliceFields(4, 1, tempEmbed.fields[0]));

        //     }else if(operation === 'remove'){

        //         var members = 'empty';
        //         if(index != 0){
        //             members = ' ';
        //             for (let i =0; i < index; i++){
        //             members += passedArray[i] + '\n ';
        //             }
        //         }

        //         var tempEmbed = await new Discord.MessageEmbed().addField('Air (' + airCount + ')', members, true)
        //         await passedMessage.edit(passedMessage.embeds[0].spliceFields(fieldIndex, 1, tempEmbed.fields[0]));

        //         tempEmbed = await new Discord.MessageEmbed().addField('Total number of signups:', infantryCount + armorCount + airCount + slCount)
        //         await passedMessage.edit(passedMessage.embeds[0].spliceFields(4, 1, tempEmbed.fields[0]));
        //     } 

        // }
         
          
         
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
    
    if (emoji.name === infantryEmoji && !event.infantrySignups.includes(username)) {
        event.addInfantrySignup(username);
    }
    else if (emoji.name === armorEmoji && !event.armorSignups.includes(username)) {
        event.addArmorSignup(username);
    }
    else if (emoji.name === airEmoji && !event.airSignups.includes(username)) {
        event.addAirSignup(username);
    }
    else if (emoji.name === slEmoji && !event.slSignups.includes(username)) {
        event.addSlSignup(username);
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
    
    if (emoji.name === infantryEmoji && event.infantrySignups.includes(username)) {
        event.removeInfantrySignup(username);
    }
    else if (emoji.name === armorEmoji && event.armorSignups.includes(username)) {
        event.removeArmorSignup(username);
    }
    else if (emoji.name === airEmoji && event.airSignups.includes(username)) {
        event.removeAirSignup(username);
    }
    else if (emoji.name === slEmoji && event.slSignups.includes(username)) {
        event.removeSlSignup(username);
    }

    updateEmbedForEvent(message, event);
}

//bot id 706985785529860147
/*So the index param is the total number of fields the embed has minus 1 (arrays start at 0 - fields are just an array of fields). 
The deleteCount is the amount of fields you want to remove, in your case 1. 
The fields is the fields you want to insert in the position you you deleted at*/