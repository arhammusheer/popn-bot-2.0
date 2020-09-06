const ytdl = require("ytdl-core");
module.exports = {
  name: "summon",
  description: "summon the bot into voice channel",
  cooldown: 5,
  async execute(message) {
    const { channel } = message.member.voice;
    if (!channel)
      return message.channel.send(
        "I'm sorry but you need to be in a voice channel to play music!"
      );
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send("There is nothing playing.");
    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return message.channel.send(
        "I cannot connect to your voice channel, make sure I have the proper permissions!"
      );
    if (!permissions.has("SPEAK"))
      return message.channel.send(
        "I cannot speak in this voice channel, make sure I have the proper permissions!"
      );
    const play = async (song) => {
      const queue = message.client.queue.get(message.guild.id);
      if (!song) {
        queue.voiceChannel.leave();
        message.client.queue.delete(message.guild.id);
        return;
      }

      const dispatcher = queue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
          queue.songs.shift();
          play(queue.songs[0]);
        })
        .on("error", (error) => console.error(error));
      dispatcher.setVolumeLogarithmic(queue.volume / 5);
      queue.textChannel.send(`🎶 Start playing: **${song.title}**`);
    };
    try {
      const connection = await channel.join();
      serverQueue.connection = connection;
      play(serverQueue.songs[0]);
    } catch (error) {
      console.error(`I could not join the voice channel: ${error}`);
      message.client.queue.delete(message.guild.id);
      await channel.leave();
      return message.channel.send(
        `I could not join the voice channel: ${error}`
      );
    }
  },
};
