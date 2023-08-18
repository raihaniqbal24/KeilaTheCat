const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('List all available commands.'),
	// TODO: addOption for song title and singer
	async execute(interaction) {
    let str = '';
    const foldersPath = path.join(__dirname, '../../commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
      for (const file of commandFiles) {
        console.log(file);
        const command = require(path.join(commandsPath, file));
        console.log(command);
        str += `Name: ${command.data.name}\nDescription: ${command.data.description} \n\n`;
      }
    }

    return interaction.reply({
      content: str,
      ephemeral: true,
    });
	},
};