
module.exports = class Event {

    /**
     * 
     * @param {string} name
     * @param {string} description
     * @param {Date} date 
     * @param {int} repeatableDay What day to repeat the event (0 Monday - 6 Sunday)
     * @param {object} options The extra options available
     * @param {boolean} options.bastion If the event has the posibility for a Bastion pilot signup
     * @param {boolean} options.colossus If the event has the posibility for a Colossus driver signup
     * @param {boolean} options.construction If the event has the posibility for a Construction signup  
     * @param {string} authorID The ID of the event creator
     */
    constructor(name, description, date, repeatableDay=-1, options={}, authorID=null) {
        this.name = name;
        this.description = description; 
        this.date = date;
        this.repeatableDay = repeatableDay;
        this.bastion = options.bastion || false;
        this.colossus = options.colossus || false;
        this.construction = options.construction || false;
        this.authorID = authorID;      
    }
}
