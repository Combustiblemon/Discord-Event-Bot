const Discord = require('discord.js');
const EventDetailsService = require('./EventDetailsService');

    /**
     * 
     * @param {Discord.Guild} guild The server object
     * @param {String} roleName the name of the role. Case Sensitive
     * @param {Int} position The position of the role
     */
    async function getRoleIDFromName(guild, roleName, position){
        if(!isGuildAvailable(guild)) return null
        let roles = await guild.roles.fetch();

        return roles.cache.find(r => r.name == roleName && r.rawPosition == position).id
    }

    /**
     * 
     * @param {Discord.Guild} guild The server object
     * @param {String} roleID the name of the role. Case Sensitive
     */
    async function getRoleNameFromID(guild, roleID){
        if(!isGuildAvailable(guild)) return null
        let roles = await guild.roles.fetch(roleID);

        return roles.name
    }

    /**
     * 
     * @param {Discord.Guild} guild The server object
     */
    async function getRolesAsFormattedString(guild){
        if(!isGuildAvailable(guild)) return null
        let roles = await guild.roles.fetch();
        let text = [];
        let rolesPosition = [];
        roles.cache.forEach((Role) =>{
            rolesPosition.push([Role.name, Role.rawPosition, Role.id]);
            
        });

        let temp = '';
        let index = 0;
        text.push(temp);
        for(const item of rolesPosition.sort(compareSecondColumn)){
            if(temp.length > 1994){
                temp = '';
                index++;
                text[index] = temp;
            }
            text[index] += `${item[1]}) ${item[0]}:   ${item[2]}\n`;
        };

        return text;
    }

    /**
     * 
     * @param {Discord.Guild} guild 
     * @param {String} roleID the id of the role. 
     */
    async function checkIfRoleExistsInGuild(guild, roleID){
        if(!isGuildAvailable(guild)) return null
        let role = guild.roles.cache.find(x => x.id === roleID);
        if (typeof role === 'undefined') {
            return false
        } else {
            return true
        }
    }

    async function getRoleToPing(guild, author){
        let question = `\`\`\`Would you like to ping a role for the event?\`\`\``
        let answer = await EventDetailsService.prototype.questionYesNo(question, author)
        if(answer && answer != 'no answer'){
            let question = `\`\`\`Copy paste from above the role ID you would like to Ping for the event. if you want to ping @everyone or @here type the corresponding below.\n***WARNING*** ONLY COPY THE ID ***WARNING***\`\`\``
            return await selectRoleFromServer(question, guild, author)
        }
        return null
    }

    /**
     * @param {Discord.Guild} guild 
     * @param {Discord.Author} author
     */
    async function selectRoleFromServer(question, guild, author){
        let text = await getRolesAsFormattedString(guild)
        let filter = m => m.author.id === author.id;

        text.forEach(element => {
            author.send(`\`\`\`${element}\`\`\``)
        });
        
        let msg = await author.send(question)
        let completed = false
        while(completed == false){
            try {
                let collected = await msg.channel.awaitMessages(filter, { max: 1, time: 600000, errors: ['time'] })
                let answer = collected.first().content.trim();
                if(answer == '@everyone' || answer == '@here'){
                    return answer
                }
                
                let exists = await checkIfRoleExistsInGuild(guild, answer);
                if(!exists){
                    author.send(`\`\`\`"${answer}" is not a role ID in ${guild.name}. Please try again.\nMake sure to only copy the ID (only the numbers).\`\`\``);
                    continue
                }
                completed = true
                return answer
                  
            } catch (error) {
                console.error(new Date(), error)
                completed = true
                author.send('```Nothing was entered.```');
                return null
            }
        }
    }


    module.exports.getRoleNameFromID = getRoleNameFromID;
    module.exports.getRolesAsFormattedString = getRolesAsFormattedString;
    module.exports.checkIfRoleExistsInGuild = checkIfRoleExistsInGuild;
    module.exports.getRoleToPing = getRoleToPing;
    module.exports.selectRoleFromServer = selectRoleFromServer;
    module.exports.getRoleIDFromName = getRoleIDFromName;



/**
 * 
 * @param {Discord.Guild} guild the guild object 
 */
function isGuildAvailable(guild){
    return guild.available
}

function compareSecondColumn(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] > b[1]) ? -1 : 1;
    }
}