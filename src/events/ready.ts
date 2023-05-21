import { Events } from 'discord.js'
import type client from '../index'

module.exports = (client:client) => {
    client.once("ready", c => {
        client.user?.setPresence({ activities: [{ name: `hello world` }] }) //Set status
        console.log(`Ready! Logged in as ${c.user.tag}`);
    });
}