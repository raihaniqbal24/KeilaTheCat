const dotenv = require('dotenv');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const { AttachmentExtractor, DefaultExtractors } = require('@discord-player/extractor');
const { YoutubeExtractor } = require('discord-player-youtubei');

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.commands = new Collection();
client.cooldowns = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// const eventsPath = path.join(__dirname, 'events');
// const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// for (const file of eventFiles) {
// 	const filePath = path.join(eventsPath, file);
// 	const event = require(filePath);
// 	if (event.once) {
// 		client.once(event.name, (...args) => event.execute(...args));
// 	} else {
// 		client.on(event.name, (...args) => event.execute(...args));
// 	}
// }

const player = new Player(client);

// The attachment extractor is left out: it reads local file paths and relies on the old file-type API
const extractors = DefaultExtractors.filter(extractor => extractor !== AttachmentExtractor);

// YouTube is no longer part of the default extractors, so it is registered separately
player.extractors.loadMulti(extractors).catch(console.error);
player.extractors.register(YoutubeExtractor, {}).catch(console.error);

player.events.on('error', (queue, error) => {
	console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
});

player.events.on('playerError', (queue, error) => {
	console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
});

player.events.on ('playerStart', (queue, track) => {
	queue.metadata.channel.send(`▶ | Started playing: **${track.author} - ${track.title}** in **${queue.channel.name}**!`);
});

// player.events.on ('playerPause', (queue, track) => {
// 	queue.metadata.channel.send(`▶ | Started playing: **${track.author} - ${track.title}** in **${queue.channel.name}**!`);
// });

// player.events.on ('playerResume', (queue, track) => {
// 	queue.metadata.channel.send(`▶ | Started playing: **${track.author} - ${track.title}** in **${queue.channel.name}**!`);
// });

player.events.on('audioTrackAdd', (queue, track) => {
	queue.metadata.channel.send(`🎶 | Track **${track.author} - ${track.title}** queued!`);
});

player.events.on('disconnect', queue => {
	queue.metadata.channel.send('❌ | I was manually disconnected from the voice channel, clearing queue!');
});

player.events.on('emptyChannel', queue => {
	queue.metadata.channel.send('❌ | Nobody is in the voice channel, leaving...');
});

player.events.on('emptyQueue', queue => {
	queue.metadata.channel.send('✅ | Queue finished!');
});

client.once(Events.ClientReady, () => {
	console.log('Ready!');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	const { cooldowns } = client;

	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.data.name);
	const defaultCooldownDuration = 0;
	const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
		}
	}

	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		const errorMessage = { content: 'There was an error while executing this command!', ephemeral: true };
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp(errorMessage).catch(console.error);
		} else {
			await interaction.reply(errorMessage).catch(console.error);
		}
	}
});

// make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); // login bot using token
