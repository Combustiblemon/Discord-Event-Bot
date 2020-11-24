//let eventList = [['PS2', ['**(Training)** Single signup option', '**(PS2OP)** PS2 OP multiple signup options', '**(OW)** Similar to PS2OP, but set up for Outfit Wars']]]

let eventList = new Object();
eventList.games = new Object();

class EventList{
    initialize(){
        eventList.games['PS2'] = ['**(Training)** Single signup option', '**(PS2OP)** PS2 OP multiple signup options', '**(OW)** Similar to PS2OP, but set up for Outfit Wars']
    }

    getEvents(){
        var result = []
        let index = 0
        for (var i in eventList.games) {
            result.push([i])
            // obj.hasOwnProperty() is used to filter out properties from the object's prototype chain
            if (eventList.games.hasOwnProperty(i)) {
                result[index].push(eventList.games[i]);
            }
            index+=1
        }

        return result
    }
}

module.exports = new EventList();

