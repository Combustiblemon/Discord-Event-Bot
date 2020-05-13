
module.exports = class Event {

    /**
     * 
     * @param {string} name
     * @param {string} description
     * @param {Date} date 
     */
    constructor(name, description, date) {
        this.name = name;
        this.description = description; 
        this.date = date;       
    }
}
