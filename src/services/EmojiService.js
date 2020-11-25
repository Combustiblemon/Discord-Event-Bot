const fs = require('fs')
let emojis = require('../models/emojis.json')

module.exports={
    name: "EmojiService",
    description: "contains all the emoji",
    initialize(){
        //var test = JSON.parse(fs.readFileSync('../models/emojis.json', 'utf8'));
        for(const i in emojis){
            console.log(i)
            for(const j in emojis[i]){
                console.log(`   ${j}:  ${emojis[i][j]}`)
            }
        } 
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