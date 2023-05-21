const { SlashCommandBuilder } = require('discord.js');
const { useMasterPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Remove a song from queue.')
    .addIntegerOption(option =>
      option.setName('number')
        .setDescription('The queue number you want to remove')
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
			const number = interaction.options.getInteger('number') - 1;
      if (number > queue.tracks.size)
        return void interaction.followUp('❌ | Track number greater than queue depth!');
      queue.node.remove(number);
      return void interaction.followUp(`✅ | Removed **${removedTrack}**!`);
		} catch (error) {
			console.log(error);
      interaction.followUp({
        content: '❌ | There was an error trying to execute that command',
      });
		}
	},
};