const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer, QueueRepeatMode } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Loop queue based on chosen mode.')
		.addIntegerOption(option =>
			option.setName('mode')
				.setDescription('Loop mode')
				.setRequired(true)
				.addChoices(
					{ name: 'Off', value: QueueRepeatMode.OFF },
					{ name: 'Track', value: QueueRepeatMode.TRACK },
					{ name: 'Queue', value: QueueRepeatMode.QUEUE },
					{ name: 'Autoplay', value: QueueRepeatMode.AUTOPLAY },
				)),
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
			if (!queue || !queue.currentTrack) return interaction.followUp({ content: '❌ | No music is being played!' });

			const loopMode = interaction.options.getInteger('mode');
			queue.setRepeatMode(loopMode);
			const mode = loopMode === QueueRepeatMode.TRACK ? '🔂' : loopMode === QueueRepeatMode.QUEUE ? '🔁' : '▶';

			return interaction.followUp(`${mode} | Updated loop mode!`);
		} catch (error) {
			console.log(error);
			interaction.followUp({
				content: '❌ | There was an error trying to execute that command',
			});
		}
	},
};