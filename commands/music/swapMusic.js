const { SlashCommandBuilder } = require('discord.js');
const { useMasterPlayer } = require('discord-player');

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
      const queueNumbers = [interaction.options.getInteger('track1') - 1, interaction.options.getInteger('track2') - 1];
      // Sort so the lowest number is first for swap logic to work
      queueNumbers.sort(function (a, b) {
        return a - b;
      });
      
      if (queueNumbers[1] > queue.tracks.size)
        return void interaction.followUp('❌ | Track number greater than queue depth!');
      
        const track2 = queue.remove(queueNumbers[1]); // Remove higher track first to avoid list order issues
      const track1 = queue.remove(queueNumbers[0]);
      queue.insertTrack(track2, queueNumbers[0]); // Add track in lowest position first to avoid list order issues
      queue.insertTrack(track1, queueNumbers[1]);
      return void interaction.followUp(`✅ | Swapped **${track1}** & **${track2}**!`);
      } catch (error) {
			console.log(error);
      interaction.followUp({
        content: '❌ | There was an error trying to execute that command',
      });
		}
	},
};