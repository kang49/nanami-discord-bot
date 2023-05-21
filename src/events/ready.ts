import { Events } from 'discord.js'
import type client from '../index'

export = (client: client) => {
    client.once("ready", c => {
        client.user?.setPresence({ activities: [{ name: `ชื่อนานามินะคะ💕` }] }) //Set status
        console.log(`Ready! Logged in as ${c.user.tag}`);
        client.guilds.cache.map(g => g).forEach(async (guild) => {
            try {
                guild.commands.cache.map(command => guild.commands.delete(command.id))
                guild.commands?.set(client.commandArray)
            } catch (e) {
                console.log((e))
            }
        });
    });
}