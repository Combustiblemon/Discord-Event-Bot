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
     * @param {JSON} serverRole
     * @param {string} subCommand 
     */
    execute(bot, message, serverRole, subCommand) {
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
        
        if (subCommand == 'add') {
            addRole(message, serverRole);
        } 
        else if (subCommand == 'remove') {
            if (!serverRole) {
                message.author.send('There is no role for this server.');

                return;
            }

            removeRole(message, serverRole);
        }

        return;
    }
}

//#region addRole
/**
 * 
 * @param {Discord.Message} message
 * @param {JSON} serverRole The role object as gotten from the DB. {role_id, server_id}
 * @param {Array} roles
 */
async function addRole(message, serverRole) {
    let author = message.author;
    let text = await getRolesAsFormattedString(message.guild)
    let filter = m => m.author.id === author.id;

    if(serverRole){
        message.author.send(`\`\`\`There is already a minimum role for ${message.guild.name} (${(await message.guild.roles.fetch(serverRole.role_id)).name}).\nPlease use $role remove before adding a new role.\`\`\``)
        return
    }

    text.forEach(element => {
        author.send(`\`\`\`${element}\`\`\``)
    });
    
    let msg = await author.send(`\`\`\`Copy paste from above the role ID you want to be the minimum able to make events.\n**WARNING** ONLY COPY THE ID **WARNING**\`\`\``)
    let completed = false
    while(completed == false){
        try {
            let collected = await msg.channel.awaitMessages(filter, { max: 1, time: 600000, errors: ['time'] })
            let answer = collected.first().content;
            
            answer = answer.trim()
            
            let exists = await checkIfRoleExistsInGuild(message.guild, answer)
            if(!exists){
                author.send(`\`\`\`"${answer}" is not a role ID in ${message.guild.name}. Please try copying the ID again.\`\`\``);
                continue
            }
        
            console.log(new Date(), `${message.author.tag} set role (${(await message.guild.roles.fetch(answer)).name}){${answer}} as minimum. server: (${message.guild.name})`)
            FileSystem.saveRoleToDB(answer, message.guild.id);
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
 * @param {JSON} serverRole The role object as gotten from the DB. {role_id, server_id}
 * @returns {Promise}
 */
async function removeRole(message, serverRole) {
    let roleName = (await message.guild.roles.fetch(serverRole.role_id)).name;
    let answer = await EventDetailsService.prototype.questionYesNo(`\`\`\`Are you sure you want to remove "${roleName}" as minimum role from ${message.guild.name}\`\`\``,  message.author);
    if(answer === true && answer != 'no answer') {
        console.log(new Date(), `${message.author.tag} removed role "${roleName}"(${serverRole.role_id}) from (${message.guild.name})`)
        FileSystem.removeRoleFromDB(serverRole.role_id, serverRole.server_id);
        message.author.send('```Role removed.```');
        return;
    }
    return
}
//#endregion