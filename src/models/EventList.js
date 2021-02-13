//let eventList = [['PS2', ['**(Training)** Single signup option', '**(PS2OP)** PS2 OP multiple signup options', '**(OW)** Similar to PS2OP, but set up for Outfit Wars']]]


let eventList = new Object();
eventList.events = new Object();

class EventList{
    initialize(){
        eventList.events['Generic'] = ['**(Single)** Single signup option.']
        eventList.events['PS2'] = ['**(PS2OP)** PS2 OP, multiple signup options.', '**(OW)** Similar to PS2OP, but set up for Outfit Wars.']
        eventList.events['Foxhole'] = ['**(FoxOp)** Foxhole OP, multiple signup options.']
    }

    getEvents(){
        var result = []
        let index = 0
        for (var i in eventList.events) {
            result.push([i])
            // obj.hasOwnProperty() is used to filter out properties from the object's prototype chain
            if (eventList.events.hasOwnProperty(i)) {
                result[index].push(eventList.events[i]);
            }
            index+=1
        }

        return result
    }
}

module.exports = new EventList();

