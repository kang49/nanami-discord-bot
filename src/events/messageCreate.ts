import type client from '../index';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export = (client: client) => {
    client.on('messageCreate', async (message) => {
        const guildId: string = message.guildId as string
        const channelId: string = message.channelId as string
        const messageId: string = message.id as string
        let messageContent: string = message.content as string
        const messageAuthorId: string = message.author.id
        const messageAuthorName: string = message.author.username as string

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
            })
        } catch (e) {
            return;
        }
    });
};
