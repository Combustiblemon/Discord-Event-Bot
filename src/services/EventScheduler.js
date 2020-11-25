const FileSystem = require('./FileSystem.js');
var CronJob = require('cron').CronJob;
const Discord = require('discord.js');
const EventDetailsService = require('./EventDetailsService.js');


let eventsToCheck = new Object;
let dictionary = new Map();
dictionary.set('Monday', 0)
dictionary.set('Tuesday', 1)
dictionary.set('Wednesday', 2)
dictionary.set('Thursday', 3)
dictionary.set('Friday', 4)
dictionary.set('Saturday', 5)
dictionary.set('Sunday', 6)
class EventScheduler{
    startJob(){
        this.checkEvents()
        let cronJob = new CronJob('0 0 4 * * *', function() {
            this.checkEvents();
        }, null, true, 'UTC')
        cronJob.start();
    }

    checkEvents(){
        let datetime = new Date();
        let day = dictionary.get(datetime.toLocaleDateString('en-GB', {weekday: 'long'}));
        //console.log(day)
    }

    addEventToCheck(filename, repeatableDay, server){
        eventsToCheck[server].push(filename, repeatableDay);
    }

    removeEventFromCheck(filename){
        for (i = 0; i < eventsToCheck.length; i++){
            if(eventsToCheck[i][0] == filename){
                eventsToCheck.splice(i, 1);
                return
            }
        }
    }

    /**
     * 
     * @param {Discord.message} message 
     */
    displayRepeatingEvents(message){
        message.author.send(createEmbed('', true)).then(async embed => {
            try {
                await embed.react('✅');

            } catch (error) {
                console.error(error);
            }
            const filter = (reaction, user) => {
                return (reaction.emoji.name === '✅')&& user.id === message.author.id;
            };

            await embed.awaitReactions(filter, { max: 1, time: 120000, errors: ['time'] })
                .then(collected => {
                    if (collected.firstKey(1) == '✅'){
                        this.deleteRepeating(message);
                    }
                })
                .catch(collected => {
                    console.warn(collected);
                });
        });
    }

    async deleteRepeating(message){
        let answer = await EventDetailsService.prototype.requestSingleDetail('Copy paste the name of the repeating event you would like to delete.', message);
        this.removeEventFromCheck(answer);
        message.author.send(`Repeating event ${answer} stopped.`)
    }
}

module.exports = new EventScheduler();

function createEmbed(description, footer=false){
    let embed = new Discord.MessageEmbed()
        .setTitle('List of repeating events.')
        .setDescription(description)
        .setColor(0xF1C40F);

        if(footer){
            embed.setFooter('If you would like to delete one click ✅');
        }

        let text = ''
        for (let i = 0; i < eventsToCheck.length; i++){
            text += `${eventsToCheck[i][0]}\n`    
        }
        embed.addField(`Current repeatable events:`, text); 
    
    return embed;
}
