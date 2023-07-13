import { Channel } from 'diagnostics_channel';
import type client from '../index';
import { PrismaClient } from '@prisma/client';
import { TextChannel } from 'discord.js';
const prisma = new PrismaClient();

export = (client: client) => {
    client.on('messageCreate', async (message) => {
        const userId: string = message.author.id as string
        const userDisplayName: string = message.member?.displayName as string;
        const userTag: string = message.author.discriminator as string;
        const guildId: string = message.guildId as string;
        const guildName: string = message.guild?.name as string;
        const channelId: string = message.channelId as string;
        const messageId: string = message.id as string;
        let messageContent: string = message.content as string;
        const messageAuthorId: string = message.author.id as string;
        const messageAuthorName: string = message.author.username as string;

        //Filter long message content
        if (messageContent.length > 200) {
            messageContent = 'Long message'
        }

        try {
            await prisma.deleteMessage.create({
                data: {
                    guildId: guildId,
                    channelId: channelId,
                    messageId: messageId,
                    messageContent: messageContent,
                    messageAuthorId: messageAuthorId,
                    messageAuthorName: messageAuthorName,
                }
            });

            try {
                const userSQL = await prisma.user.findFirst({
                    where: {
                        userId: userId,
                        guildId: guildId,
                    }
                })
                const userSQL_guildMsgCount: number = userSQL?.guildMsgCount as number
                await prisma.user.updateMany({
                    data: {
                        userId: userId,
                        userName: userDisplayName,
                        userTag: userTag,
                        guildId: guildId,
                        guildName: guildName,
                        guildMsgCount: userSQL_guildMsgCount + 1,
                    },
                    where: {
                        userId: userId,
                        guildId: guildId,
                    },
                });
            } catch {
                await prisma.user.create({
                    data: {
                        userId: userId,
                        userName: userDisplayName,
                        userTag: userTag,
                        guildId: guildId,
                        guildName: guildName,
                        guildMsgCount: 1,
                    },
                })
            }
        } catch (e) {
            return;
        }
    });


    //Functions
    client.on('messageCreate', async (message) => {
        if (message.author.id === '1109721426279280660') return; //เช็คว่าเป็นบอทหรือไม่ กันการอ่านตัวเอง

        //Anime Daily Image Send
        const animeGirlImage_sql = await prisma.attachment.findFirst({
            where: {
                animeGirlImage_Check: false,
            }
        });
        if (!animeGirlImage_sql) return; //กรณีไม่มีภาพที่ต้องส่ง
        const animeGirlImageUrl: string = animeGirlImage_sql.animeGirlImage ?? '' as string;

        const guild_sql = await prisma.guild.findMany({
            where: {
                animeGirlDaily: true,
            }
        })
        for (let i = 0; i < guild_sql.length; i++) {
            const animeGirlImage_channel_sql: string = guild_sql[i].animeGirlDaily_log_id as string;
            const animeGirlImage_channel: TextChannel | null = client.channels.cache.get(animeGirlImage_channel_sql) as TextChannel | null;

            if (!animeGirlImage_channel) {
                console.error('Main channel not found.');
                return;
            }
            animeGirlImage_channel.send(animeGirlImageUrl);
        }
        await prisma.attachment.update({
            where: {
                animeGirlImage: animeGirlImageUrl,
            },
            data: {
                animeGirlImage_Check: true,
            }
        })
    });
};
