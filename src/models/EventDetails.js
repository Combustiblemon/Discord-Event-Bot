
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
     */
    constructor(name, description, date, options={}, repeatableDay=-1) {
        this.name = name;
        this.description = description; 
        this.date = date;
        this.repeatableDay = repeatableDay;
        this.bastion = options.bastion || false;
        this.colossus = options.colossus || false;
        this.construction = options.construction || false;      
    }
}
