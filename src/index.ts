// Require the necessary discord.js classes
import { Client } from 'discord.js';
require('dotenv').config()

export default class client extends Client {
	constructor() {
		super({
			intents: [
				'Guilds',
				'GuildMessages',
				'GuildVoiceStates'
			]
		})
		this.reqevent()
		this.login(process.env.BOT_TOKEN)
	}

	async reqevent() {
		require('./functions/eventHandler')(this)
		return true
	}
}
new client();