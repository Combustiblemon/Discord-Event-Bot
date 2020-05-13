
module.exports = class Event {

    /**
     * 
     * @param {string} name
     * @param {string} description
     * @param {string} time 
     */
    constructor(name, description, time) {
        this.name = name;
        this.description = description; 
        this.time = time;       
    }
}
