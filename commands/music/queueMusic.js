const { SlashCommandBuilder } = require('discord.js');
const { useMasterPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('View current song(s) queue.'),
	// TODO: addOption for song title and singer
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
      if (typeof(queue) != 'undefined') {
        trimString = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);
          return interaction.followUp({
            embeds: [
              {
                title: 'Now Playing',
                description: trimString(`The Current song playing is 🎶 | **${queue.currentTrack.author} - ${queue.currentTrack.title}**! \n 🎶 | ${queue}! `, 4095),
              }
            ]
          })
      } else {
        return interaction.reply({
          content: 'There is no song in the queue!'
        })
      }
		} catch (error) {
			console.log(error);
      interaction.followUp({
        content: '❌ | There was an error trying to execute that command',
      });
		}
	},
};