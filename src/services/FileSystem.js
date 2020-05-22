const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const Discord = require('discord.js');
const fs = require('fs');

let embedsInMemoryID = [];
let embedsInMemoryName = [];

class FileSystem{

    /**
     * 
     * @param {Discord.Message} message 
     * @param {Event} event
     */
    async writeJSON(event, message){
                let data = JSON.stringify(message, null, 2);
                
                fs.writeFileSync('embeds/' + event.name + '.json', data);
                console.log('Done writing file: ' + event.name + '.json');
    }

    /**
     * @param {string} name
     * @returns {Discord.Message}
     */
    readJSON(name){
        let rawdata = fs.readFileSync('embeds/' + name + '.json');
        let message = JSON.parse(rawdata);
        return message;
    }

    /**
     * @param {string} name
     * @param {Array} header
     * @param {Array} array
     */
    async createCSV(header ,name, array){
        const csvWriter = createCsvWriter({
            header: header,
            path: ('csv_files/' + name + '.csv')
        });

        csvWriter.writeRecords(array);
    }

    /**
     * 
     * @param {string} id 
     */
    addEmbedID(id){
        embedsInMemoryID.push(id);
    }

    /**
     * @param {string} name
     */
    addEmbedName(name){
        embedsInMemoryName.push(name);
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
        let message = await this.readJSON(name);
        return message.id;
    }
}

module.exports = new FileSystem();