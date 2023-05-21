import { Events, ChannelType } from 'discord.js'
import type client from '../index'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

module.exports = (client: client) => {
    client.on("voiceStateUpdate", async (oldState, newState) => {
        const user = newState.member;

        //get guild data
        const guild = await prisma.guild.findFirst({
            where: {
                guild_id: newState.guild.id
            }
        })
        if (!guild?.inout) return;

        const _guild = await client.guilds.fetch(`${guild?.guild_id}`)
        const _channel = await _guild.channels.fetch(`${guild?.log_id}`)
        if (oldState.channelId === null && newState.channelId !== null) {
            if (!_channel) return;
            if (_channel.type !== ChannelType.GuildText) return;
            _channel?.send({
                embeds: [
                    {
                        color: 0x2CE51F,
                        description: `${user?.displayName} join voice channel ${newState.channel?.name}`
                    }
                ]
            })
        } else if (oldState.channelId !== null && newState.channelId === null) {
            if (!_channel) return;
            if (_channel.type !== ChannelType.GuildText) return;
            _channel.send({
                embeds: [
                    {
                        color: 0xB6B6B6,
                        description: `${user?.displayName} left voice channel ${oldState.channel?.name}`
                    }
                ]
            })
        }
    })
}