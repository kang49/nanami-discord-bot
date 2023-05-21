// Require the necessary discord.js classes
import { Client } from 'discord.js';
require('dotenv').config()

export default class client extends Client {
	constructor() {
		super({
			intents: [
				'Guilds',
				'GuildMessages'
			]
		})
		this.reqevent()
		this.login(process.env.BOT_TOKEN)
	}

	async reqevent() {
		require('./events')(this)
		return true
	}
}
new client();