const Discord = require('discord.js');


module.exports={
    name: "RoleService",
    description: "contains functionality for discord roles",
    /**
     * 
     * @param {Discord.Guild} guild The server object
     * @param {String} roleName the name of the role. Case Sensitive
     * @param {Int} position The position of the role
     */
    async getRoleIDFromName(guild, roleName, position){
        if(!isGuildAvailable(guild)) return null
        let roles = await guild.roles.fetch();

        return roles.cache.find(r => r.name == roleName && r.rawPosition == position).id
    },

    /**
     * 
     * @param {Discord.Guild} guild The server object
     * @param {String} roleID the name of the role. Case Sensitive
     */
    async getRoleNameFromID(guild, roleID){
        if(!isGuildAvailable(guild)) return null
        let roles = await guild.roles.fetch(roleID);

        return roles.name
    },

    /**
     * 
     * @param {Discord.Guild} guild The server object
     */
    async getRolesAsFormattedString(guild){
        if(!isGuildAvailable(guild)) return null
        let roles = await guild.roles.fetch();
        let text = ''
        let rolesPosition = []
        roles.cache.forEach((Role) =>{
            rolesPosition.push([Role.name, Role.rawPosition])
            
        })
        
        for(const item of rolesPosition.sort(compareSecondColumn)){
            text += `${item[0]}:::${item[1]}\n`
        }

        return text
    },

    /**
     * 
     * @param {Discord.Guild} guild 
     * @param {String} roleName 
     */
    async checkIfRoleExistsInGuild(guild, roleName, position){
        if(!isGuildAvailable(guild)) return null
        let role = guild.roles.cache.find(x => x.name === roleName && x.rawPosition == position);
        if (typeof role === 'undefined') {
            return false
        } else {
            return true
        }
    }
    

}

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