const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('List all available commands.'),
	// TODO: addOption for song title and singer
	async execute(interaction) {
		const str = interaction.client.commands
			.map(command => `Name: ${command.data.name}\nDescription: ${command.data.description}`)
			.join('\n\n');

		return interaction.reply({
			content: str,
			ephemeral: true,
		});
	},
};