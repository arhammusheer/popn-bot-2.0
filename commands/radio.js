const { Util } = require("discord.js");
const ytdl = require("ytdl-core");

module.exports = {
	name: "radio",
	description: "Plays server radio",
	execute(message) {
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

		if (serverQueue) {
			if (serverQueue.radio) {
				return message.channel.send("Radio aleady running");
			} else {
				serverQueue.radio = true;
				serverQueue.connection.on("finish", async () => {
					serverQueue.songs.shift();
					if ((serverQueue.songs = [])) {
						randomPlaylist =
							allPlaylists[Math.floor(Math.random() * allPlaylists.length)];
						for (genre in playlists) {
							if (genre == randomPlaylist) {
								currentPlaylist = playlists[genre];
								youtubeLink =
									currentPlaylist[
										Math.floor(Math.random() * currentPlaylist.length)
									];
								songInfo = await ytdl.getInfo(youtubeLink);
								serverQueue.songs.push({
									id: songInfo.videoDetails.videoId,
									title: Util.escapeMarkdown(songInfo.videoDetails.title),
									url: songInfo.videoDetails.video_url,
								});
							}
						}
					}
					return connection.play(ytdl(queue.songs[0].url));
				});
			}
		}

		const queueConstruct = {
			textChannel: message.channel,
			voiceChannel: channel,
			connection: null,
			songs: [],
			volume: 2,
			playing: true,
			radio: true,
		};
	},
};
