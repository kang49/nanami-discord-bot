import { Events } from 'discord.js'
import type client from '../index'

module.exports = (client: client) => {
    client.once("ready", c => {
        client.user?.setPresence({ activities: [{ name: `hello world` }] }) //Set status
        console.log(`Ready! Logged in as ${c.user.tag}`);
        client.guilds.cache.map(g => g).forEach(async (guild) => {
            try {
                guild.commands.cache.map(command => guild.commands.delete(command.id))
                // @ts-ignore
                guild.commands?.set(client.commandArray)
            } catch (e) {
                console.log((e))
            }
        });
    });
}