const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('swap')
		.setDescription('Swap between 2 songs.')
		.addIntegerOption(option =>
			option.setName('track1')
				.setDescription('Track 1 for swapping')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('track2')
				.setDescription('Track 2 for swapping')
				.setRequired(true)),
	async execute(interaction) {
		try {
			const player = useMainPlayer(); // Get the player instance that we created earlier
			const channel = interaction.member.voice.channel;
			if (!channel) {
				return interaction.reply({
					content: 'You are not in a voice channel!',
					ephemeral: true,
				});
			}

			if (
				interaction.guild.members.me.voice.channelId &&
				interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId
			) {
				return interaction.reply({
					content: 'You are not in my voice channel!',
					ephemeral: true,
				});
			}

			await interaction.deferReply();
			const queue = player.nodes.get(interaction.guildId);
			if (!queue || !queue.currentTrack) return interaction.followUp('❌ | No music is being played!');
			const queueNumbers = [interaction.options.getInteger('track1') - 1, interaction.options.getInteger('track2') - 1];
			// Sort so the lowest number is first for swap logic to work
			queueNumbers.sort(function(a, b) {
				return a - b;
			});

			if (queueNumbers[0] < 0 || queueNumbers[1] >= queue.tracks.size) {return interaction.followUp('❌ | Track number is outside the queue!');}
			if (queueNumbers[0] === queueNumbers[1]) {return interaction.followUp('❌ | Pick two different tracks to swap!');}

			const track2 = queue.node.remove(queueNumbers[1]); // Remove higher track first to avoid list order issues
			const track1 = queue.node.remove(queueNumbers[0]);
			queue.insertTrack(track2, queueNumbers[0]); // Add track in lowest position first to avoid list order issues
			queue.insertTrack(track1, queueNumbers[1]);
			return interaction.followUp(`✅ | Swapped **${track1}** & **${track2}**!`);
		} catch (error) {
			console.log(error);
			interaction.followUp({
				content: '❌ | There was an error trying to execute that command',
			});
		}
	},
};