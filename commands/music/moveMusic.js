const { SlashCommandBuilder } = require('discord.js');
const { useMasterPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('move')
		.setDescription('Move song position in queue.')
    .addIntegerOption(option =>
      option.setName('track')
        .setDescription('The track number you want to move')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('position')
        .setDescription('The position to move it to')
        .setRequired(true)),
	async execute(interaction) {
		try {
			const player = useMasterPlayer(); // Get the player instance that we created earlier
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
			const queueNumbers = [interaction.options.getInteger('track') - 1, interaction.options.getInteger('position') - 1];
      if (queueNumbers[0] > queue.tracks.size || queueNumbers[1] > queue.tracks.size)
        return interaction.followUp('❌ | Track number greater than queue depth!');
      const track = queue.node.remove(queueNumbers[0]);
      queue.insertTrack(track, queueNumbers[1]);
      return interaction.followUp(`✅ | Moved **${track}**`);
    } catch (error) {
			console.log(error);
      interaction.followUp({
        content: '❌ | There was an error trying to execute that command',
      });
		}
	},
};