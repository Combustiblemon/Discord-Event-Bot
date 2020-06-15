
module.exports = class Event {

    /**
     * 
     * @param {string} name
     * @param {string} description
     * @param {Date} date 
     * @param {boolean=} bastion
     */
    constructor(name, description, date, bastion = false) {
        this.name = name;
        this.description = description; 
        this.date = date;
        this.bastion = bastion;       
    }
}
