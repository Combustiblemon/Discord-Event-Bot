const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const BotEvent = require('../models/Event');
const Errors = require('../models/error');
const EventDetailsService = require('./EventDetailsService');
const SQLiteUtilities = require('../utils/SQLiteUtilities');

let embedsInMemory = new Object()
embedsInMemory.ID = [];
embedsInMemory.Name = new Object();
//let embedsInMemoryName = [];
let csvFilesInMemory = [];
class FileSystem {

    //#region JSON logic
    /**
     * Writes events and embeds to file.
     * 
     * @param {Discord.Message} embed The embed to be written to file
     * @param {BotEvent} event The event to be written to file
     * @param {string} mode The mode to use: 'embed'|'event'|'both'
     */
    async writeJSON(event, embed, mode) {
        let name = `${embed.guild.id}/${this.getFileNameForEvent(event)}`

        this.ensureDirectoryExistence(`embeds/${embed.guild.id}/test.json`)
        this.ensureDirectoryExistence(`events/${embed.guild.id}/test.json`)

        if (mode == 'embed') {
            this.writeData(embed, name, 'embeds/');
        } else if (mode == 'event') {
            this.writeData(event, name, 'events/');
        } else if (mode == 'both') {
            await this.writeData(embed, name, 'embeds/');
            await this.writeData(event, name, 'events/');
        }
    }

    /**
     * 
     * @param {any} data The data to be written
     * @param {string} name The name of the file
     * @param {string} folder The folder to write the file
     */
    writeData(data, name, folder) {
        let embedData = JSON.stringify(data, null, 2);
        
        if(name.includes('.json')){
            writeFileSync(`${folder}${name}`, embedData);
            console.log(new Date(), `Done writing file: ${folder}${name}`);
        }else{
            writeFileSync(`${folder}${name}.json`, embedData);
            console.log(new Date(), `Done writing file: ${folder}${name}.json`);
        }
        
        
        return;
    }

    /**
     * @param {string} name The name of the file
     * @param {string} folder The folder where the file is
     * @returns {Discord.Message}
     */
    readJSON(name, folder='') {
        if (name.includes('.json')) {
            let rawdata = fs.readFileSync(`${folder}${name}`);
            let message = JSON.parse(rawdata);
            return message;
        } else {
            let rawdata = fs.readFileSync(`${folder}${name}.json`);
            let message = JSON.parse(rawdata);
            return message;
        }
        
    }

    //#endregion

    /**
     * 
     * @param {BotEvent} event The event from which the name will be created
     */
    getFileNameForEvent(event) {
        let date = event.date.toISOString();
        // Only use the date for brevity
        date = date.substring(0, 10);

        let name = event.name;
        // Replace spaces with '_'
        name = name.replace(/ /gi, "_");

        return `${date}_${name}`;
    }

    //#region CSV logic
    /**
     * @param {BotEvent} event The event to find the signups from.
     * @param {string} guildName The name of the server the event is in.
     */
    async createCSV(event, guildID) {
        let records = this.createCSVRecords(event);
        
        let name = this.getFileNameForEvent(event);
        
        let header = event.header;
        // Add additional roles to header
        header = header.concat(event.signupOptions.filter(x => x.isAdditionalRole).map(x => x.name));        
        const csvWriter = createCsvWriter({
            header: header,
            path: (`csv_files/${guildID}/${name}.csv`)
        });
        
        this.ensureDirectoryExistence(`csv_files/${guildID}/${name}.csv`)
        csvWriter.writeRecords(records);
        console.log(new Date(), `Done writing file: ${name}.csv`);
    }

    /**
     * @param {BotEvent} event The event the CSV corresponds to
     */
    createCSVRecords(event) {
        let records = new Array();
        
        let main = event.signupOptions.filter(x => !x.isAdditionalRole);
        let additional = event.signupOptions.filter(x => x.isAdditionalRole);

        main.forEach(mainOption => {
            mainOption.signups.forEach(signup => {
                let record = [mainOption.name, signup];
                
                additional.forEach(() => record.push('n'));

                records.push(record);
            });
        });

        additional.forEach((additionalOption, index) => {
            // Index of the additional option in a record (after main option and signup name)
            let additionalIndex = index + 2;

            additionalOption.signups.forEach(signup => {
                let recordIndex = records.findIndex(x => x[1] === signup);
                
                if (recordIndex !== -1) {
                    // Record for user already exists
                    records[recordIndex][additionalIndex] = 'y';
                } 
                else {
                    // Record for user does not exist
                    let record = ['', signup];
                
                    additional.forEach(() => record.push('n'));
                    record[additionalIndex] = 'y';

                    records.push(record);
                }
            });
        });

        return records;
    }
    //#endregion

    //#region add/remove/get/checks

    /**
     * 
     * @param {string} name The name of the CSV file
     */
    addCSVFile(name){
        if(!csvFilesInMemory.includes(name)){
            csvFilesInMemory.push(name);
        }
    }

    /**
     * @returns {Array} An array of the CSV file names in memory
     */
    getCSVFilesNames(){
        return Array.from(csvFilesInMemory);
    }

    /**
     * 
     * @param {BotEvent} event 
     * @param {Discord.Message} embed 
     * @param {JSON} options 
     */
    saveEvent(event, embed, options = null){
        //Columns go in this order:
        //{server_id, event_name, embed_id, event_date, event_channel, options, event, embed}
        SQLiteUtilities.insertData('EVENTS', [embed.channel.guild.id, event.name, embed.id, event.date.toISOString(), embed.channel.id, options, JSON.stringify(event), JSON.stringify(embed)])
    }

    /**
     * 
     * @param {BotEvent} event 
     * @param {Discord.Message} embed 
     * @param {JSON} options 
     */
    updateEvent(event, embed, options=null){
        //EVENT table columns
        //{server_id, event_name, embed_id, event_date, event_channel, options, event, embed}
        SQLiteUtilities.updateData('EVENTS', {event_name: event.name, event_date: event.date.toISOString(), options, event: JSON.stringify(event), embed:  JSON.stringify(embed)}, {query: 'embed_id = ?', values: [embed.id]})
    }

    /**
     * @description Returns {name, date, embedID, channelID}.
     * 
     * @param {String} serverID The id of the server.
     */
    async getEmbedDataFromServerID(serverID){
        let data = await SQLiteUtilities.getDataAll({event_name: 'name', event_date: 'date', embed_id: 'embedID', event_channel: 'channelID'}, 'EVENTS', {query: 'server_id = ?', values: [serverID]});
        data.forEach(element => {
            element.date = new Date(element.date);
        });

        return data
    }

    /**
     * @param {String} msgID 
     */
    async getEventFromMsgID(msgID){
        let data = await SQLiteUtilities.getDataSingle({event: 'event'}, 'EVENTS', {query: 'embed_id = ?', values: [`${msgID}`]});
        data = JSON.parse(data.event);
        data.date = new Date(data.date);
        return data
    }

    /**
     * 
     * @param {String} serverID 
     */
    async getRoleIdFromServerId(serverID){
        return (await SQLiteUtilities.getDataSingle({role_id: 'roleID'}, 'ROLES', {query: 'server_id = ?', values: [`${serverID}`]})).roleID;
    }

    /**
     * 
     * @param {String} roleID 
     * @param {String} serverID 
     */
    saveRoleToDB(roleID, serverID){
        SQLiteUtilities.insertData('ROLES', [serverID, roleID]);
    }

    /**
     * 
     * @param {String} roleID 
     * @param {String} serverID 
     */
    removeRoleFromDB(roleID, serverID){
        SQLiteUtilities.deleteData('ROLES', {query: 'role_id = ? AND server_id = ?', values: [roleID, serverID]});
    }

    /**
     * 
     * @param {String} channelID
     * @param {String} serverID
     */
    addChannelToWhitelist(channelID, serverID){
        SQLiteUtilities.insertData('WHITELISTED_CHANNELS', [channelID, serverID]);
    }

    /**
     * 
     * @param {String} channelID 
     */
    removeChannelFromWhitelist(channelID){
        SQLiteUtilities.deleteData('WHITELISTED_CHANNELS', {query: 'channel_id = ?', values: [channelID]});
    }

    /**
     * 
     * @param {String} channelID 
     */
    async getWhitelistedChannel(channelID){
        return await SQLiteUtilities.getDataSingle({channel_id: 'channelID'}, 'WHITELISTED_CHANNELS', {query: 'channel_id = ?', values: [channelID]})
    }

    /**
     * 
     * @param {String} userID 
     */
    async ignoreUser(userID){
        let a = await SQLiteUtilities.deleteData('IGNORE_USERS', {query: 'user_id = ?', values: [userID]});
        if (a === 0) {
            SQLiteUtilities.insertData('IGNORE_USERS', [userID]);
            console.log(new Date(), `User "${userID}" now ignored.`)
            return
        }
        console.log(new Date(), `User "${userID}" no longer ignored.`)
    }

    /**
     * 
     * @param {String} userID 
     * @returns {Boolean}
     */
    async isIgnoredUser(userID){
        let a = await SQLiteUtilities.getDataSingle(null, 'IGNORE_USERS', {query: 'user_id = ?', values: [userID]});
        if (a) return true
        else return false
    }
    //#endregion

    /**
     * 
     * @param {string} filePath The path of the file to be written
     * @returns {Promise<boolean>} 
     */
    async ensureDirectoryExistence(filePath) {
        //remove the '/' character from filePath and then rejoin the string
        var dirname = filePath.substring(2).split('/');
        
        //Check for illegal characters before writing
        if(EventDetailsService.prototype.containsIllegalCharacters(dirname.join(' '))){
            console.error(new Errors.illegalCharactersInFilename(`'${filePath}' contains illegal characters`));
            return null;
        }

        //check if the patch exists
        if (fs.existsSync(path.dirname(filePath))) {
            return true;
        }
        
        //if the path doesn't exist write it
        mkdirSync(_dirname(filePath));
        console.log(new Date(), `Created path: ${filePath}`);
        return true;
    }

    /**
     * 
     * @param {string} name The name of the file to check.
     * @param {string=} folder The folder the file is in.
     */
    async ensureFileExistance(name, folder){
        if(fs.existsSync(`${folder}${name}`)){
            let file = this.readJSON(name, folder);
            return file;
        }else{
            let data = [];
            this.writeData(data, `${name}`,`${folder}` )
            return data;
        }
    }
}

module.exports = new FileSystem();