const Discord = require('discord.js')
const config = require('../config.json')

const bot = new Discord.Client()

bot.on('message', msg => {
    if (msg.content === '&ping'){
        msg.reply("whatever you want your bot to say.")
    }
})

bot.login(config.token)

