const Discord = require('discord.js');
const Event = require('../src/models/Event');
const SignupOption = require('../src/models/SignupOption');
const EventService = require('../src/services/EventService');

module.exports = {
    name: 'TestOp',
    description: 'Sets up a test op',
    execute(bot, message, args, token) {
       
        eventName = ' ';
        eventTime = ' ';
        eventDescription = ' ';

        const filter = m => m.author.id === message.author.id;
        message.channel.bulkDelete(1).catch(console.error);
        
        message.channel.send('What is the name of the OP?').then(() => {
            message.channel.awaitMessages(filter, {max: 1, time: 300000, errors :['time'] })
            .then(collected => {
                eventName = collected.first().content;

                message.channel.bulkDelete(2).catch(console.error);
                message.channel.send('What time is the OP?').then(() =>{
                    message.channel.awaitMessages(filter, {max: 1, time: 300000, errors: ['time'] })
                        .then(collected => {
                            eventTime = collected.first().content;

                            message.channel.bulkDelete(2).catch(console.error);
                            message.channel.send('Write a short description of the OP.').then(() =>{
                                message.channel.awaitMessages(filter, {max: 1, time: 300000, errors: ['time'] })
                                    .then(collected =>{
                                        eventDescription = collected.first().content;
                                        message.channel.bulkDelete(2).catch(console.error);
                                        
                                        let event = createTestEvent(eventName, eventTime, eventDescription);

                                        EventService.newEvent(bot, message.channel, event);
                                    }).catch(error =>{
                                        console.log(error);
                                        message.channel.send('No description was entered.');
                                        message.channel.bulkDelete(2).catch(console.error);
                                    })
                                })
                            

                    }).catch(error =>{
                        console.log(error);
                        message.channel.send('No time was entered.');
                        message.channel.bulkDelete(2).catch(console.error);
                    })
                })
            }).catch(error =>{
                console.log(error);
                message.channel.send('No name was entered.');
                message.channel.bulkDelete(2).catch(console.error);
            })

        });

        message.channel.fetch();
    }

    
}

/**
 * @returns {Event}
 */
function createTestEvent(name, description, time) {
    return new Event(
        name, 
        time, 
        description, 
        [
            new SignupOption('707719532721995883', 'Infantry', false, []),
            new SignupOption('707719532617269280', 'Armor', false, []),
            new SignupOption('707719532785172581', 'Air', false, []),
            new SignupOption('⭐', 'Squad Leaders', true, [])
        ]
    )
}
