import { Events, ChannelType } from 'discord.js'
import type client from '../index'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export = (client: client) => {
    client.on("voiceStateUpdate", async (oldState, newState) => {
        const user = newState.member;

        // Get guild data
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
            const guildName = newState.guild.name;
            console.log(`[${guildName}][in-out]: ✅ ${user?.displayName} joined ${newState.channel?.name}`);
            _channel?.send({
                embeds: [
                    {
                        author: {
                            name: `${user?.displayName}`,
                            icon_url: `${user?.displayAvatarURL()}`,
                        },
                        thumbnail: {
                            url: `${user?.displayAvatarURL()}`,
                        },
                        color: 0x2CE51F,
                        title: '***✅ Member joined***',
                        description: `**${user?.displayName}** joined **${newState.channel?.name}**`,
                        timestamp: new Date().toISOString(),
                    }
                ]
            })
        } else if (oldState.channelId !== null && newState.channelId === null) {
            if (!_channel) return;
            if (_channel.type !== ChannelType.GuildText) return;
            const guildName = newState.guild.name;
            console.log(`[${guildName}][in-out]: ⭕️ ${user?.displayName} left ${oldState.channel?.name}`);
            _channel.send({
                embeds: [
                    {
                        author: {
                            name: `${user?.displayName}`,
                            icon_url: `${user?.displayAvatarURL()}`,
                        },
                        thumbnail: {
                            url: `${user?.displayAvatarURL()}`,
                        },
                        color: 0xB6B6B6,
                        title: '***⭕️ Member left***',
                        description: `**${user?.displayName}** left **${oldState.channel?.name}**`,
                        timestamp: new Date().toISOString(),
                    }
                ]
            })
        } else if (oldState.channelId !== newState.channelId) {
            if (!_channel) return;
            if (_channel.type !== ChannelType.GuildText) return;
            const guildName = newState.guild.name;
            console.log(`[${guildName}][in-out]: 🔄 ${user?.displayName} moved from ${oldState.channel?.name} to ${newState.channel?.name}`);
            _channel.send({
                embeds: [
                    {
                        author: {
                            name: `${user?.displayName}`,
                            icon_url: `${user?.displayAvatarURL()}`,
                        },
                        thumbnail: {
                            url: `${user?.displayAvatarURL()}`,
                        },
                        color: 0xFFC200,
                        title: '***🔄 Member moved***',
                        description: `**${user?.displayName}** moved from **${oldState.channel?.name}** to **${newState.channel?.name}**`,
                        timestamp: new Date().toISOString(),
                    }
                ]
            })
        }
    })
}
