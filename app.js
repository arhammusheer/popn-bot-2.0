//IMPORTS
require("dotenv").config();
const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const { prefix, name, server } = require("./config.json");
const { readdirSync } = require("fs");
const { join } = require("path");

//Bot setup


const bot = new Discord.Client();
bot.commands = new Discord.Collection();
bot.cooldowns = new Discord.Collection();
bot.queue = new Map();

const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) =>
  file.endsWith(".js")
);
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  bot.commands.set(command.name, command);
}

//Bot onlogin
bot.once("ready", () => {
  console.log(`${name} is online and connected`);
  bot.user.setActivity("Exclusive bot of College in Quarantine server");
});

bot.on("message", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command =
    bot.commands.get(commandName) ||
    bot.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );
  //If command doesn't exist
  if (!command) return message.channel.send("That isn't a command");
  //Ignore DMs
  if (command.guildOnly && message.channel.type !== "text")
    return message.reply("I can't execute that command inside DMs!");
  //Proper argument not given
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    if (command.usage)
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    return message.channel.send(reply);
  }
  //Cooldown on command
  if (!bot.cooldowns.has(command.name)) {
    bot.cooldowns.set(command.name, new Discord.Collection());
  }
  const now = Date.now();
  const timestamps = bot.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command!");
  }
});

//Bot login
bot.login(process.env.TOKEN);
