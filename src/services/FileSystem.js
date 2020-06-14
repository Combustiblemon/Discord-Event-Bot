const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const Discord = require('discord.js');
const fs = require('fs');

let embedsInMemoryID = [];
let embedsInMemoryName = [];

class FileSystem {

    /**
     * 
     * @param {Discord.Message} embed 
     * @param {Event} event
     * @param {string} mode
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
     * @param {any} data 
     * @param {string} name 
     * @param {string} folder 
     */
    writeData(data, name, folder) {
        let embedData = JSON.stringify(data, null, 2);
                
        fs.writeFileSync(folder + name + '.json', embedData);
        
        console.log('Done writing file: ' + folder + name + '.json');
        
        return;
    }

    /**
     * @param {string} name
     * @returns {Discord.Message}
     */
    readJSON(name, folder) {
        if (name.includes('.json')) {
            let rawdata = fs.readFileSync(folder + name);
            let message = JSON.parse(rawdata);
            return message;
        } else {
            let rawdata = fs.readFileSync(folder + name + '.json');
            let message = JSON.parse(rawdata);
            return message;
        }
        
    }

    /**
     * 
     * @param {Event} event 
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
     * @param {Event} name
     * @param {Array} header
     * @param {Array} array
     */
    async createCSV(header ,event, array){
        let name = this.getFileNameForEvent(event);

        const csvWriter = createCsvWriter({
            header: header,
            path: ('csv_files/' + name + '.csv')
        });

        csvWriter.writeRecords(array);
        console.log('Done writing file: ' + name + '.csv');
    }

    /**
     * 
     * @param {string} id 
     */
    addEmbedID(id){
        embedsInMemoryID.push(id);
    }

    /**
     * 
     * @param {string} id 
     */
    removeEmbedID(id){
        const isName = (element) => element === id;
        embedsInMemoryName.splice(embedsInMemoryName.findIndex(isName), 1)
    }

    /**
     * @param {string} name
     */
    addEmbedName(name){
        embedsInMemoryName.push(name);
    }


    /**
     * 
     * @param {string} name 
     */
    removeEmbedName(name){
        const isName = (element) => element === name;
        embedsInMemoryName.splice(embedsInMemoryName.findIndex(isName), 1)
    }

    /**
     * @returns {Array}
     */
    getEmbedIDs(){
        return embedsInMemoryID;
    }

    /**
     * @returns {Array}
     */
    getEmbedNames(){
        return embedsInMemoryName;
    }

    /**
     * 
     * @param  {string} name
     * @return {string} 
     */
    async getEmbedID(name){
        let message = await this.readJSON(name, 'embeds/');
        return message.id;

    }

    /**
     * 
     * @param {string} name 
     * @return {Promise<boolean>}
     */
    embedNameExists(name){
        return embedsInMemoryName.includes(name);
    }
}

module.exports = new FileSystem();