const { SlashCommandBuilder } = require('discord.js');
const { useMasterPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('volume')
		.setDescription('Set song volume.')
    .addIntegerOption(option =>
      option.setName('volume')
        .setDescription('Number between 1-100')
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
			if (!queue || !queue.currentTrack) return interaction.followUp({content: '❌ | No music is being played!'});
			var volume = interaction.options.getInteger('volume');
      volume = Math.max(0, volume);
      volume = Math.min(200, volume);
      queue.setVolume(volume*2);

      returninteraction.followUp(`🔊 | Volume set to ${volume*2}`);
		} catch (error) {
			console.log(error);
      interaction.followUp({
        content: '❌ | There was an error trying to execute that command',
      });
		}
	},
};