# KeilaTheCat

Introducing KeilaTheCat, a Discord bot that plays music in voice channels and has a few utility commands.

## Table of Contents

- [Requirements](#requirements)
- [Setup](#setup)
- [Usage](#usage)
- [Commands](#commands)
- [Development](#development)
- [Project structure](#project-structure)

## Requirements

- Node.js **22.12 or newer**
- A Discord application with a bot user, created in the [Discord Developer Portal](https://discord.com/developers/applications)

FFmpeg does not need to be installed separately, it comes with `npm install`.

## Setup

To **clone this repo**, run:
```
git clone https://github.com/raihaniqbal24/KeilaTheCat.git
cd KeilaTheCat
```

After cloning the repository, **install dependencies** by executing:
```
npm install
```

**Create a `.env` file** in the project folder:
```
CLIENT_TOKEN=your-bot-token
CLIENT_ID=your-application-id
GUILD_ID=your-server-id
```

| Variable | Where to find it |
|---|---|
| `CLIENT_TOKEN` | Developer Portal → your application → Bot → Token |
| `CLIENT_ID` | Developer Portal → your application → General Information → Application ID |
| `GUILD_ID` | In Discord, enable Developer Mode, then right-click your server → Copy Server ID |

**Invite the bot** to your server from Developer Portal → OAuth2 → URL Generator, with the `bot` and `applications.commands` scopes and the `View Channels`, `Send Messages`, `Embed Links`, `Connect` and `Speak` permissions.

**Register the slash commands** on your server:
```
node deploy-commands.js
```
Run this again whenever a command's name, description or options change.

**Run the bot** by executing:
```
npm start
```

## Usage

1. Join a voice channel.
2. Run `/play` with a song name or a link, for example `/play query: never gonna give you up`.
   - A song name is searched on YouTube and the first result is played.
   - A link is played from its own source (YouTube, Spotify, SoundCloud, Apple Music, Vimeo, ReverbNation). Playlist links queue the whole playlist.
3. Run `/play` again to add more songs to the queue.
4. Use `/queue` to see what is coming up. The numbers shown there are the track numbers used by `/remove`, `/move` and `/swap`.

Music commands only work while you are in a voice channel, and in the same one as the bot once it has joined. The bot leaves on its own when the queue ends or the channel is empty.

## Commands

### Music

| Command | Description |
|---|---|
| `/play query` | Play a song or playlist, or add it to the queue |
| `/pause` | Pause the current song |
| `/resume` | Resume the paused song |
| `/skip` | Skip the current song |
| `/stop` | Stop playing and clear the queue |
| `/nowplaying` | Show the current song with a progress bar |
| `/queue` | Show the current song and the upcoming songs |
| `/shuffle` | Shuffle the queue |
| `/loop mode` | Set the loop mode: `Off`, `Track`, `Queue` or `Autoplay` |
| `/volume volume` | Set the volume, from 0 to 200 |
| `/remove number` | Remove a song from the queue |
| `/move track position` | Move a song to another position in the queue |
| `/swap track1 track2` | Swap two songs in the queue |

### Utility

| Command | Description |
|---|---|
| `/help` | List all available commands |
| `/ping` | Replies with Pong! |
| `/server` | Show the server name and member count |
| `/user` | Show your username and when you joined the server |
| `/userinfo user` | Show a user's name, ID and avatar |
| `/avatar [target]` | Show a user's avatar, or your own (5 second cooldown) |

## Development

| Script | Description |
|---|---|
| `npm run dev` | Run the bot with nodemon, restarting on file changes |
| `npm run lint` | Check the code with ESLint |
| `npm test` | Check that every command loads and builds a valid slash command |

To add a command, create a file in a `commands` subfolder that exports `data` (a `SlashCommandBuilder`) and `execute`, then run `node deploy-commands.js`.

## Project structure

```
project_folder
├── commands
│   ├── music
│   └── utility
├── events
├── test
├── deploy-commands.js
└── index.js
```
