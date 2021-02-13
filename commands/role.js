const Discord = require('discord.js');
const EventDetailsService = require('../src/services/EventDetailsService');
const FileSystem = require('../src/services/FileSystem');
const { getRolesAsFormattedString, getRoleIDFromName, checkIfRoleExistsInGuild } = require('../src/services/RoleService');

module.exports = {
    name: 'role',
    description: 'Adds or removes a role',
    /**
     * 
     * @param {Discord.Client} bot 
     * @param {Discord.Message} message 
     * @param {Array} roles
     * @param {string} subCommand 
     */
    execute(bot, message, roles, subCommand) {
        if (message.guild === null) {
            message.author.send('Please use the command in a server channel.');
            return;
        }


        if (!message.member.hasPermission("ADMINISTRATOR")) {
            message.author.send("You need to be an administrator to use the `$role` command.");
            return;
        }

        if (!subCommand) { 
            message.author.send('You need to enter a second argument. For a list of commands write $help.');   
            return;                    
        }

        // Find the server index in the array
        let serverIndex = roles.findIndex(x => x.includes(message.guild.id));
        
        if (subCommand == 'add') {
            addRole(message, serverIndex, roles);
        } 
        else if (subCommand == 'remove') {
            if (serverIndex === -1) {
                message.author.send('There is no role for this server.');

                return;
            }

            removeRole(message, serverIndex, roles);
        }

        return;
    }
}

//#region addRole
/**
 * 
 * @param {Discord.Message} message
 * @param {string} serverIndex
 * @param {Array} roles
 */
async function addRole(message, serverIndex, roles) {
    let author = message.author;
    let text = await getRolesAsFormattedString(message.guild)
    let filter = m => m.author.id === author.id;

    if(serverIndex !== -1 ){
        message.author.send(`\`\`\`There is already a minimum role for ${roles[serverIndex][3]} (${roles[serverIndex][2]}).\nPlease use $role remove before adding a new role.\`\`\``)
        return
    }

    author.send(`\`\`\`${text}\`\`\``)
    let msg = await author.send(`\`\`\`Copy paste from above the role you want to be the minimum able to make events.\n**WARNING** CASE SENSITIVE **WARNING**\`\`\``)
    let completed = false
    while(completed == false){
        try {
            let collected = await msg.channel.awaitMessages(filter, { max: 1, time: 600000, errors: ['time'] })
            let answer = collected.first().content;
            if(!answer.includes(':::')){
                author.send('\`\`\`Wrong format entered. Please try again.\`\`\`')
                continue
            }
            answer = answer.trim().split(':::');
            if (serverIndex !== -1 && roles[serverIndex][2] === answer[0]) {
                author.send('```This role is already the minimum.```');
                completed = true
                return;
            }
            let exists = await checkIfRoleExistsInGuild(message.guild, answer[0], answer[1])
            if(!exists){
                author.send(`\`\`\`"${answer[0]}" is not a role in ${message.guild.name}. Please try again.\`\`\``);
                continue
            }
        
            let roleID = await getRoleIDFromName(message.guild, answer[0], parseInt(answer[1]))
            console.log(new Date(), `${message.author.tag} added role (${answer[0]}){${roleID}} as minimum. server: (${message.guild.name})`)
            const tempArray = [message.guild.id, roleID, answer[0], message.guild.name];
            roles.push(tempArray);
            FileSystem.writeData(roles, 'roles', './');
            FileSystem.addServerName(message.guild.id)
            completed = true
            author.send('```Role Added.```');
            return    
        } catch (error) {
            console.error(new Date(), err)
            completed = true
            author.send('```Nothing was entered.```');
            return
        }
    }
}
//#endregion

//#region removeRole
/**
 * 
 * @param {Discord.Message} message
 * @param {string} serverIndex
 * @param {Array} roles
 * @returns {Promise}
 */
async function removeRole(message, serverIndex, roles) {
    let answer = await EventDetailsService.prototype.questionYesNo(`\`\`\`Are you sure you want to remove "${roles[serverIndex][2]}" as minimum role from ${roles[serverIndex][3]}\`\`\``,  message.author);
    if(answer === true && answer != 'no answer') {
        console.log(new Date(), `${message.author.tag} removed role "${roles[serverIndex][2]}"(${roles[serverIndex][1]}) from (${roles[serverIndex][3]})`)
        roles.splice(serverIndex, 1);
        FileSystem.writeData(roles, 'roles', './')
        message.author.send('\`Role removed.\`');
        return;
    }
    return
}
//#endregion