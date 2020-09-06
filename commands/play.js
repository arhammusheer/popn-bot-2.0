const { Util } = require("discord.js");
const ytdl = require("ytdl-core");
const ytSearch = require("youtube-search");
const ytPlaylist = require("youtube-playlist");
var ytSearchOps = {
  maxResults: 1,
  key: process.env.YOUTUBE_API_KEY,
};
//Regex checks
const isLink = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
);
const isYoutube = new RegExp(
  "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+"
);
const isSpotify = new RegExp(
  "^(https://open.spotify.com/user/spotify/playlist/|spotify:user:spotify:playlist:)([a-zA-Z0-9]+)(.*)$"
);

module.exports = {
  name: "play",
  description: "Play command.",
  usage: "[command name]",
  args: true,
  cooldown: 5,
  async execute(message, args) {
    const { channel } = message.member.voice;
    if (!channel)
      return message.channel.send(
        "I'm sorry but you need to be in a voice channel to play music!"
      );
    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return message.channel.send(
        "I cannot connect to your voice channel, make sure I have the proper permissions!"
      );
    if (!permissions.has("SPEAK"))
      return message.channel.send(
        "I cannot speak in this voice channel, make sure I have the proper permissions!"
      );
    const serverQueue = message.client.queue.get(message.guild.id);
    const songInfo = await ytdl.getInfo(args[0].replace(/<(.+)>/g, "$1"));

    ytSearch(args.join(" "), ytSearchOps, async (err, result) => {
      const songInfo = await ytdl.getInfo(result[0].link);
    });
    const song = {
      id: songInfo.videoDetails.videoId,
      title: Util.escapeMarkdown(songInfo.videoDetails.title),
      url: songInfo.videoDetails.video_url,
    };

    if (serverQueue) {
      serverQueue.songs.push(song);
      console.log(serverQueue.songs);
      return message.channel.send(
        `✅ **${song.title}** has been added to the queue!`
      );
    }

    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: channel,
      connection: null,
      songs: [],
      volume: 2,
      playing: true,
      radio: false,
    };
    message.client.queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

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
      queueConstruct.connection = connection;
      play(queueConstruct.songs[0]);
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
