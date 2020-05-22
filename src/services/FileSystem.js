const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const Discord = require('discord.js');
const fs = require('fs');

let embedsInMemory = [];

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
     * @returns {Discord.MessageEmbed}
     */
    readJSON(name){
        let rawdata = fs.readFileSync('embeds/' + name + '.json');
        return JSON.parse(rawdata);
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
        embedsInMemory.push(id);
        console.log(embedsInMemory);
    }
}

module.exports = new FileSystem();