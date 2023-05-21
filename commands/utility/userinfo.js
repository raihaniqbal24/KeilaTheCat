const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('userinfo')
		.setDescription('Get Discord information about user.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you want to get info about')
        .setRequired(true)),
	async execute(interaction) {
    const user = interaction.options.getUser('user');

    interaction.reply({
      content: `Name: ${user.username}, ID: ${user.id}, Avatar: ${user.displayAvatarURL({dynamic: true})}`,
      ephemeral: true,
    });
	},
};