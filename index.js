const fs = require('fs-extra')

const dotenv = require('dotenv');
dotenv.config();

const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko()


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

  var formatterUSD = new Intl.NumberFormat(process.env.PRICE_LOCALIZATION, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: process.env.PRICE_DECIMAL
  });

  var formatterCOIN = new Intl.NumberFormat(process.env.PRICE_LOCALIZATION, {
    style: 'currency',
    currency: process.env.PRICE_COIN,
    minimumFractionDigits: 0,
    maximumFractionDigits: process.env.PRICE_DECIMAL 
  }); 

  client.guilds.cache.map(guild => guild.members.cache.forEach(function(member){
    if(member.id == client.user.id)
      member.setNickname(process.env.NAME_BOT)
  }))   

  client.user.setUsername(`${process.env.NAME_BOT}`)
  client.user.setActivity(`${formatterUSD.format(usdPrice)} | ${formatterCOIN.format(coinPrice)}`)

  return avatarUrl;
}

async function Initialize(){
  const avatarUrl = await getCoin()
  client.user.setAvatar(avatarUrl)    
}

client.login(process.env.TOKEN)
