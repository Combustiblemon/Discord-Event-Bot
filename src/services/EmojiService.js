const fs = require('fs')
let emojis = JSON.parse(fs.readFileSync('src/models/emojis.json', 'utf8'));

module.exports={
    name: "EmojiService",
    description: "contains all the emoji",
    initialize(){
    },

    getEmoji(server, emojiName){
        return emojis[server][emojiName]
    },

    addEmoji(){
        throw {name : "NotImplementedError", message : "too lazy to implement"}; 
    },

    removeEmoji(){
        throw {name : "NotImplementedError", message : "too lazy to implement"};
    }
}