import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import type client from '../index'
import { Collection } from 'discord.js'


module.exports = (client: client) => {

    //load commands
    const commands = readdirSync(join(__dirname, "../commands"))
    commands.forEach(e => {
        console.log(e) // => ['ping.ts']
        const cmd: Icommands = require(join(__dirname, "../commands/" + e))
        // @ts-ignore
        client.commandArray = []
        // @ts-ignore
        client.commandlist = new Collection()
        // @ts-ignore
        client.commandlist.set(cmd.data.name, cmd)
        // @ts-ignore
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
        name: string
    },
    execute: () => void
}