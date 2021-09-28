const fs = require('fs-extra')

const dotenv = require('dotenv');
dotenv.config();

const currency = require('currency.js')

const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko()

const keepAlive = require("./server")

const config = require("./config.json")
const Discord = require("discord.js");
const client = new Discord.Client()

client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()
client.categories = fs.readdirSync("./commands/");
["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
}); 

// ----------------- EVENTS ------------------ //
client.on('ready', async () => {
  Initialize()
  console.log(`${client.user.username} ✅`)

  setInterval(function(){
    getCoin()
    console.log(`Update Data ${client.user.username}`)
  } ,60000)
})

async function getCoin(){
  let data = await CoinGeckoClient.coins.fetch(process.env.COIN, {})
  let usdPrice = data.data.market_data.current_price["usd"]
  let coinPrice = data.data.market_data.current_price[process.env.PRICE_COIN]
  let avatarUrl = data.data.image.large

  client.guilds.cache.map(guild => guild.members.cache.forEach(function(member){
    if(member.id == client.user.id)
      member.setNickname(process.env.NAME_BOT)
  }))   

  client.user.setUsername(`${process.env.NAME_BOT}`)
  client.user.setActivity(`$${currency(usdPrice, {separator: '.', decimal: ',', pattern: '#', precision: process.env.PRICE_DECIMAL}).format()} | R$${currency(coinPrice, {separator: '.', decimal: ',', pattern: '#', precision: process.env.PRICE_DECIMAL}).format()}`)

  return avatarUrl;
}

async function Initialize(){
  const avatarUrl = await getCoin()
  client.user.setAvatar(avatarUrl)    
}

keepAlive()
client.login(process.env.TOKEN)
