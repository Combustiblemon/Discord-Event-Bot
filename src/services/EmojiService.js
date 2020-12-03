const fs = require('fs')
let emojis = require('../models/emojis.json')

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