//IMPORTS
require("dotenv").config();
const bot = require("discord.js");
const yt = require("ytdl-core");
const ytsearch = require("youtube-search")
const ytplaylist = require("youtube-playlist");
const { prefix, name } = require("./config.json");

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

