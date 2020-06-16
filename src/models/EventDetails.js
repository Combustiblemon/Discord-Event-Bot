
module.exports = class Event {

    /**
     * 
     * @param {string} name
     * @param {string} description
     * @param {Date} date 
     * @param {boolean=} bastion
     * @param {boolean=} colossus
     */
    constructor(name, description, date, bastion = false, colossus = false) {
        this.name = name;
        this.description = description; 
        this.date = date;
        this.bastion = bastion;
        this.colossus = colossus;      
    }
}
