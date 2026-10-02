const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nowplaying')
		.setDescription('Get currently playing song.'),
	// TODO: addOption for song title and singer
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

			const progress = queue.node.createProgressBar();
			const perc = queue.node.getTimestamp() ?? { progress: 0 };

			return interaction.followUp({
				embeds: [
					{
						title: 'Now Playing',
						description: `🎶 | **${queue.currentTrack.author} - ${queue.currentTrack.title}**! (\`${perc.progress}%\`)`,
						fields: [
							{
								name: '\u200b',
								value: progress,
							},
						],
						color: 0xffffff,
					},
				],
			});
		} catch (error) {
			console.log(error);
			interaction.followUp({
				content: '❌ | There was an error trying to execute that command',
			});
		}
	},
};