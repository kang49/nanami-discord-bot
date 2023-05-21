// Require the necessary discord.js classes
import { Client, Collection, ApplicationCommandDataResolvable } from 'discord.js';
require('dotenv').config()

export default class client extends Client {

	public commandlist: Dictionary = new Collection()
	public commandArray: Array<ApplicationCommandDataResolvable> = []

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

declare global {
    interface Array<T> {
        delete(index: number): boolean;
        apply(): any[];
    }
    type Dictionary<V = any, K extends string | symbol = string> = Record<K, V>;
}