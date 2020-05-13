const Discord = require('discord.js');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const bot = new Discord.Client();
const token = 'NzA2OTg1Nzg1NTI5ODYwMTQ3.XrqCmQ.idV_gV8ZErJF1ehrfruAFLkd_AE';
const PREFIX = '$';

const fs = require('fs');
bot.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
 
    bot.commands.set(command.name, command);
}

/*eventName = ' ';
eventTime = ' ';
msgCount = 0; */

bot.on("ready", () => {
    console.log('This bot is online.');
});

bot.on('message', message=>{
    
    let args = message.content.substring(PREFIX.length).split(' ');

    

    //args is what a person types after the prefix. args[0] is the first word($ping)
    switch(args[0]){
        case 'event':
            if(!(message.guild === null)){
                if(!args[1]) {
                        message.channel.bulkDelete(1);
                    message.author.send('```Please use the date when naming an event (e.g. Thursday Night Ops 14/5) \n\n'
                                        + 'List of current events: \n' 
                                        + 'PS2 Ops ($event PS2OP)```' );
                }
                else if(args[1] === 'PS2OP'){
                        bot.commands.get('PS2OP').execute(bot, message, args, token);
                }
                else if(args[1] === 'PS2Training'){
                        bot.commands.get('PS2Training').execute(bot, message, args, token);
                }
                else if(args[1] === 'TestOp'){
                        bot.commands.get('TestOp').execute(bot, message, args, token); 
                }
                
            }else {
                message.author.send('Please use the command in a server channel.');
            }
            
        break;

        case 'csvTest':
            let filename = ' ';
            let eventTest = 'Test Event';

            filename = 'csv_files/' + eventTest + '.csv';
            console.log(filename);

            const csvWriter = createCsvWriter({
                header: ['NAME', 'LANGUAGE'],
                path: filename
            });

            const records = [
                ['Bob',  'French, English'],
                ['Mary', 'English']
            ];

            csvWriter.writeRecords(records)       // returns a promise
                .then(() => {
                    console.log('...Done');
                });
        break;


        
        
        
    }
});

bot.login(token);