import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import type client from '../index'
import { Collection } from 'discord.js'


module.exports = (client: client) => {
    client.commandArray = []
    client.commandlist = new Collection()

    //load commands
    const commands = readdirSync(join(__dirname, "../commands"))
    commands.forEach(e => {
        console.log(e) // => ['ping.ts']
        const cmd: Icommands = require(join(__dirname, "../commands/" + e))
        client.commandlist.set(cmd.data.name, cmd)
        client.commandArray.push((cmd.data).toJSON())
    })

    //load event
    const files = readdirSync(join(__dirname, "../events"))
    files.forEach(e => {
        require(join(__dirname, "../events") + "/" + e)(client)
        console.log(e)
    })
}

export interface Icommands {
    data: {
        toJSON(): import("discord.js").ApplicationCommandDataResolvable
        name: string
    },
    execute: () => void
}