import type client from '../index';
import { PrismaClient } from '@prisma/client';
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
                });
                //When no data
                if (!userSQL) {
                    try{
                        await prisma.user.create({
                            data: {
                                userId: userId,
                                userName: userDisplayName,
                                userTag: userTag,
                                guildId: guildId,
                                guildName: guildName,
                                guildMsgCount: 1,
                            },
                        });
                    } catch (e) {
                        console.error(e, 'messageCreate')
                        return;
                    }
                } else {
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
                }
            } catch (e) {
                console.error(e, 'messageCreate')
                return;
            }
        } catch (e) {
            console.error(e, 'messageCreate');
            return;
        }
    });
};