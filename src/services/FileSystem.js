const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const Discord = require('discord.js');
const fs = require('fs');
const BotEvent = require('../models/Event');

let embedsInMemoryID = [];
let embedsInMemoryName = [];

class FileSystem {

    /**
     * Writes events and embeds to file.
     * 
     * @param {Discord.Message} embed The embed to be written to file
     * @param {BotEvent} event The event to be written to file
     * @param {string} mode The mode to use: 'embed'|'event'|'both'
     */
    async writeJSON(event, embed, mode) {
        let name = this.getFileNameForEvent(event);

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
     * @param {string} folder The folder of the file
     */
    writeData(data, name, folder) {
        let embedData = JSON.stringify(data, null, 2);
                
        fs.writeFileSync(`${folder}${name}.json`, embedData);
        
        console.log(`Done writing file: ${folder}${name}.json`);
        
        return;
    }

    /**
     * @param {string} name The name of the file
     * @param {string} folder The folder where the file is
     * @returns {Discord.Message}
     */
    readJSON(name, folder) {
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

    /**
     * @param {BotEvent} event
     */
    async createCSV(event) {
        let records = this.createCSVRecords(event);

        let name = this.getFileNameForEvent(event);

        let header = event.getHeader();
        // Add additional roles to header
        header = header.concat(event.signupOptions.filter(x => x.isAdditionalRole).map(x => x.name));        

        const csvWriter = createCsvWriter({
            header: header,
            path: (`csv_files/${name}.csv`)
        });

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

    /**
     * 
     * @param {string} id The id of the embed
     */
    addEmbedID(id){
        embedsInMemoryID.push(id);
    }

    /**
     * 
     * @param {string} id The id of the embed
     */
    removeEmbedID(id){
        const isName = (element) => element === id;
        embedsInMemoryName.splice(embedsInMemoryName.findIndex(isName), 1)
    }

    /**
     * @param {string} name The name of the embed
     */
    addEmbedName(name){
        embedsInMemoryName.push(name);
    }


    /**
     * 
     * @param {string} name The name of the embed
     */
    removeEmbedName(name){
        const isName = (element) => element === name;
        embedsInMemoryName.splice(embedsInMemoryName.findIndex(isName), 1)
    }

    /**
     * @returns {Array}
     */
    getEmbedIDs(){
        return Array.from(embedsInMemoryID);
    }

    /**
     * @returns {Array}
     */
    getEmbedNames(){
        return Array.from(embedsInMemoryName);
    }

    /**
     * 
     * @param  {string} name The name of the embed to be converted to ID
     * @return {string} 
     */
    getEmbedID(name){
        if(this.embedNameExists(name)){
            let embed = this.readJSON(name, 'embeds/');
            return embed.id;
        }

        return null;

    }

    /**
     * 
     * @param  {string} name The name of the embed to return the channel of
     * @return {string} 
     */
    getEmbedChannel(name){
        if(this.embedNameExists(name)){
            let embed = this.readJSON(name, 'embeds/');
            return embed.channelID;
        }

        return null;

    }

    /**
     * 
     * @param {string} name The name of the embed to be checked
     * @return {Promise<boolean>}
     */
    embedNameExists(name){
        return embedsInMemoryName.includes(name);
    }
}

module.exports = new FileSystem();