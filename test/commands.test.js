const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const foldersPath = path.join(__dirname, '..', 'commands');
const commandFiles = fs.readdirSync(foldersPath).flatMap(folder =>
	fs.readdirSync(path.join(foldersPath, folder))
		.filter(file => file.endsWith('.js'))
		.map(file => path.join(folder, file)));

describe('commands', () => {
	const names = new Map();

	for (const file of commandFiles) {
		describe(file, () => {
			const command = require(path.join(foldersPath, file));

			it('exports data and execute', () => {
				assert.ok(command.data, 'missing "data"');
				assert.strictEqual(typeof command.execute, 'function');
			});

			it('builds a valid slash command payload', () => {
				const json = command.data.toJSON();
				assert.ok(json.name);
				assert.ok(json.description);
			});

			it('has a unique name', () => {
				const { name } = command.data;
				assert.ok(!names.has(name), `"${name}" is already used by ${names.get(name)}`);
				names.set(name, file);
			});
		});
	}
});
