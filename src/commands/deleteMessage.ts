import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import type client from '../index';
import type { CommandInteraction } from 'discord.js';
import { channel } from 'diagnostics_channel';

export = {
    data: {
        name: "delmsg",
        description: "Delete message in your channel",
        description_localizations: {
            'th': 'ลบข้อความในช่องแชท'
        },
        options: [
            {
                name: "del-all",
                description: "Delete all message in your channel",
                description_localizations: {
                    'th': 'ลบข้อความทั้งหมดในช่องแชท'
                },
                type: 1,
            },
            {
                name: 'del-only',
                description: 'Delete message only user you fix',
                description_localizations: {
                    'th': 'ลบข้อความเฉพาะ User ที่กำหนด'
                },
                type: 1,
                options: [
                    {
                        "name": "user",
                        "description": "Select user you want",
                        description_localizations: {
                            'th': 'เลิอก User ที่ต้องการจะลบข้อความ'
                        },
                        "type": 6,
                        "required": true
                    },
                ]
            },
        ]
    },
    async execute(client: client, interaction: CommandInteraction) {
        if (!interaction.isCommand()) return; // Check if the interaction is a command
        if (!interaction.memberPermissions?.has('Administrator')) return interaction.reply({ 
            embeds: [
                {
                    color: 0xE6ED20,
                    title: `***Error***`,
                    description: `⚠️ ขอโทษนะคะที่ทำตามคำสั่งไม่ได้ แต่คุณไม่ใช่แอดมินนะคะ ⚠️`
                }
            ]
        });

        //main options
        //@ts-ignore
        const delMsgOptions = interaction?.options.getSubcommand(); // Get delMsg subcommand //del-all

        //Input User info
        const guildId: string = interaction.guildId ?? ""
        const userID: string = interaction.user.id;
        const userName: string = interaction.user.username
        const userTag: string = interaction.user.discriminator
        
        const channelIdAns: string = interaction.channelId as string
        const userIdAns: string = interaction.options.get('user')?.value as string

        
        if (delMsgOptions === 'del-all') {

            var deleteMessage = await prisma.deleteMessage.findMany({
                where: {
                    guildId: guildId,
                    channelId: channelIdAns
                }
            })
        }
        else if (delMsgOptions === 'del-only') {
            var deleteMessage = await prisma.deleteMessage.findMany({
                where: {
                    guildId: guildId,
                    channelId: channelIdAns,
                    messageAuthorId: userIdAns
                }
            })
        }

        async function deleteMessages() {
            for (let i = 0; i < deleteMessage.length; i++) {
                try {
                // Delete the message using the message's ID
                //@ts-ignore
                await client.channels.cache.get(deleteMessage[i].channelId)?.messages.delete(deleteMessage[i].messageId);

                await prisma.deleteMessage.deleteMany({
                    where: {
                        //@ts-ignore
                        messageId: deleteMessage[i].messageId,
                    },
                });  
                } catch (e) {
                    console.log(e)
                    continue;
                }
            }
            const sentMessage = await interaction.followUp({
                embeds: [
                {
                    author: {
                    name: `${interaction.user.username} | ผู้สั่งลบ`,
                    icon_url: `${interaction.user.avatarURL()}`,
                    },
                    color: 0x0099ff,
                    title: `**ลบข้อความทั้งหมดตามที่สั่งเรียบร้อยแล้วนะคะ**`,
                    thumbnail: {
                    url: `https://media0.giphy.com/media/Ncho45YUJ37QvueLvQ/200w.gif?cid=82a1493bxl7raie7v09fgv7sw1bp9xnvej6xqwoxn5tuhtlv&ep=v1_gifs_related&rid=200w.gif&ct=s`,
                    },
                },
                ],
            });
            const sendMessageId: string = sentMessage.id as string
            setTimeout(async() => {
                //@ts-ignore
                await client.channels.cache.get(channelIdAns)?.messages.delete(sendMessageId);
                await prisma.deleteMessage.deleteMany({
                    where: {
                        messageId: sendMessageId
                    },
                });  
            }, 5000);
        }
        interaction.reply({
            content: 'รอสักครู่นะคะ หนูกำลังทำให้อยู่ค่ะ 💕',
            ephemeral: true // หากต้องการให้ข้อความนี้เป็นเพียงแค่ข้อความแชทที่เท่ากับผู้ใช้เท่านั้นที่เห็น (ephemeral)
        }).then(() => {
            deleteMessages()
        });
    }
}