const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const Discord = require('discord.js');
const fs = require('fs');

let embedsInMemoryID = [];
let embedsInMemoryName = [];

class FileSystem{

    /**
     * 
     * @param {Discord.Message} embed 
     * @param {Event} event
     * @param {string} mode
     */
    async writeJSON(event, embed, mode){
            if(mode == 'embed'){
                this.writeData(embed, event.name, 'embeds');
            }else if(mode == 'event'){
                this.writeData(event, event.name, 'event');
            }else if(mode == 'both'){
                await this.writeData(embed, event.name, 'embeds');
                await this.writeData(event, event.name, 'event');
            }
    }

    /**
     * 
     * @param {any} data 
     * @param {string} name 
     * @param {string} mode 
     */
    writeData(data, name, mode){
        let embedData = JSON.stringify(data, null, 2);
                
            fs.writeFileSync(mode + '/' + name + '.json', embedData);
            console.log('Done writing '+ mode +' file: ' + name + '.json');
        return;
    }

    /**
     * @param {string} name
     * @returns {Discord.Message}
     */
    readJSON(name){
        if(name.includes('.json')){
            let rawdata = fs.readFileSync('embeds/' + name);
            let message = JSON.parse(rawdata);
            return message;
        }else{
            let rawdata = fs.readFileSync('embeds/' + name + '.json');
            let message = JSON.parse(rawdata);
            return message;
        }
        
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