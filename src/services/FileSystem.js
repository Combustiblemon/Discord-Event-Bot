const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const BotEvent = require('../models/Event');
const Errors = require('../models/error');
const EventDetailsService = require('./EventDetailsService');

let savedServers = JSON.parse(fs.readFileSync("./servers.json", 'utf8'));
let embedsInMemory = new Object()
embedsInMemory.ID = [];
embedsInMemory.Name = new Object();
//let embedsInMemoryName = [];
let csvFilesInMemory = [];

//make the object, i should just save the object in a file
for (const server of savedServers.Names){
    embedsInMemory.Name[server] = []
}
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
        let name = `${embed.guild.name.replace(/[<>:"/\\|?*]/gi, '^')}/${this.getFileNameForEvent(event)}`

        this.ensureDirectoryExistence(`embeds/${embed.guild.name.replace(/[<>:"/\\|?*]/gi, '^')}/test.json`)
        this.ensureDirectoryExistence(`events/${embed.guild.name.replace(/[<>:"/\\|?*]/gi, '^')}/test.json`)

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
            fs.writeFileSync(`${folder}${name}`, embedData);
            console.log(`Done writing file: ${folder}${name}`);
        }else{
            fs.writeFileSync(`${folder}${name}.json`, embedData);
            console.log(`Done writing file: ${folder}${name}.json`);
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
    async createCSV(event, guildName) {
        let records = this.createCSVRecords(event);

        //remove illegal characters from the server name
        guildName = guildName.replace(/[<>:"/\\|?*]/gi, '^');
        
        let name = this.getFileNameForEvent(event);
        
        let header = event.getHeader();
        // Add additional roles to header
        header = header.concat(event.signupOptions.filter(x => x.isAdditionalRole).map(x => x.name));        
        const csvWriter = createCsvWriter({
            header: header,
            path: (`csv_files/${guildName}/${name}.csv`)
        });
        
        this.ensureDirectoryExistence(`csv_files/${guildName}/${name}.csv`)
        csvWriter.writeRecords(records);
        console.log(`Done writing file: ${name}.csv`);
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
     * @param {string} id The id of the embed
     */
    addEmbedID(id){
        embedsInMemory.ID.push(id);
    }

    /**
     * 
     * @param {string} id The id of the embed
     */
    removeEmbedID(id){
        const isName = (element) => element === id;
        let index = embedsInMemory.ID.findIndex(isName)
        if(index === -1){
            console.error(new Errors.arrayLookupFail(''));
            return;
        }
        embedsInMemory.ID.splice(index, 1)
    }

    initializeServerName(serverNames){
        //finds the names in the given object
        /* var result = ''
        for (var i in embedsInMemory.Name) {
            // obj.hasOwnProperty() is used to filter out properties from the object's prototype chain
            if (embedsInMemory.Name.hasOwnProperty(i)) {
              result += `embedsInMemory.Name.${i} = ${embedsInMemory.Name[i]}\n`;
            }
          }
        console.log(result); */
    }

    addServerName(serverName){
        if(!embedsInMemory.Name[serverName.replace(/[<>:"/\\|?*]/gi, '^')]){
            embedsInMemory.Name[serverName.replace(/[<>:"/\\|?*]/gi, '^')] = []
            savedServers.Names.push(serverName.replace(/[<>:"/\\|?*]/gi, '^'))
            this.writeData(savedServers, 'servers.json', './')
        }
    }

    /**
     * @param {string} name The name of the embed
     */
    addEmbedName(name, server){
        if(!embedsInMemory.Name[server.replace(/[<>:"/\\|?*]/gi, '^')]){
            this.addServerName(server);
        }
        embedsInMemory.Name[server.replace(/[<>:"/\\|?*]/gi, '^')].push(name);
    }

    /**
     * 
     * @param {string} name The name of the embed
     */
    removeEmbedName(name, server){
        const isName = (element) => element.includes(name);
        let index = embedsInMemory.Name[server.replace(/[<>:"/\\|?*]/gi, '^')].findIndex(isName)
        if(index === -1){
            console.error(new Errors.arrayLookupFail(''));
            return;
        }
        embedsInMemory.Name[server.replace(/[<>:"/\\|?*]/gi, '^')].splice(index, 1);
    }

    /**
     * @returns {Array}
     */
    getEmbedIDs(){
        return Array.from(embedsInMemory.ID);
    }

    /**
     * @returns {Array}
     */
    getEmbedNames(server){
        if(embedsInMemory.Name[server.replace(/[<>:"/\\|?*]/gi, '^')]){
            return Array.from(embedsInMemory.Name[server.replace(/[<>:"/\\|?*]/gi, '^')]);
        }
        return null
    }

    /**
     * 
     * @param  {string} name The name of the embed to be converted to ID
     * @return {string} 
     */
    getEmbedID(name, server){
        if(this.embedNameExists(name, server.replace(/[<>:"/\\|?*]/gi, '^'))){
            let embed = this.readJSON(name, `embeds/${server.replace(/[<>:"/\\|?*]/gi, '^')}/`);
            return embed.id;
        }

        return null;

    }

    /**
     * 
     * @param  {string} name The name of the embed to return the channel of
     * @return {string} 
     */
    getEmbedChannel(name, server){
        if(this.embedNameExists(name, server)){
            let embed = this.readJSON(name, `embeds/${server.replace(/[<>:"/\\|?*]/gi, '^')}/`);
            return embed.channelID;
        }

        return null;

    }

    /**
     * 
     * @param {string} name The name of the embed to be checked
     * @return {Promise<boolean>}
     */
    embedNameExists(name, server){
        return embedsInMemory.Name[server.replace(/[<>:"/\\|?*]/gi, '^')].includes(name);
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
        fs.mkdirSync(path.dirname(filePath));
        console.log(`Created path: ${filePath}`);
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