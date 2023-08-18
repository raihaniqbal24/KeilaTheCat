const { SlashCommandBuilder } = require('discord.js');
const { useMasterPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play song(s).')
		.addStringOption(option =>
			option.setName('ytlink')
				.setDescription('Music link from youtube')
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

      const query = interaction.options.getString('ytlink', true);

			// let's defer the interaction as things can take time to process
			await interaction.deferReply();
			const searchResult = await player.search(query, { requestedBy: interaction.user });
			// console.log(searchResult);
      if (!searchResult.hasTracks()) {
        // If player didn't find any songs for this query
        await interaction.reply(`We found no tracks for ${query}!`);
        return;
			}

			const queue = player.nodes.create(interaction.guild, {
				metadata: {
					channel: interaction.channel,
					client: interaction.guild.members.me,
					requestedBy: interaction.user,
				},
				selfDeaf: true,
				volume: 80,
				leaveOnEmpty: true,
				leaveOnEmptyCooldown: 3000,
				leaveOnEnd: true,
				leaveOnEndCooldown: 3000,
			});

			try {
				if (!queue.connection) await queue.connect(interaction.member.voice.channel);
			} catch (e) {
				console.log(e);
				return interaction.followUp({
					content: 'Could not join your voice channel!',
				});
			}

			await interaction.followUp(`⏱ | Loading your ${searchResult.playlist ? 'playlist' : 'track'}...`);

      searchResult.playlist ? queue.addTrack(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
      if (!queue.node.isPlaying()) {
				await queue.node.play();
			}
    } catch (error) {
      console.log(error);
      interaction.followUp({
        content: '❌ | There was an error trying to execute that command',
      });
    }
	},
};