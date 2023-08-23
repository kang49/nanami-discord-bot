import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import type client from '../index'
import type { CommandInteraction } from "discord.js"

export = {
    data: {
        name: "auto-delete",
        description: "Schedule auto-delete messages on your channel.",
        description_localizations: {
            'th': 'กำหนดเวลาลบข้อความอัตโนมัติในช่องของคุณ +- 1min'
        },
        options: [
            {
                name: "setup",
                description: "ตั้งค่าห้องนี้ให้ลบข้อความอัตโนมัติหรือไม่",
                type: 3,
                required: true,
                choices: [
                    {
                        name: "yes",
                        value: "yes"
                    },
                    {
                        name: "cancel",
                        value: "cancel"
                    }
                ]
            },
            {
                name: "count-down",
                description: "จะให้ลบเมื่อเวลาผ่านไปกี่วินาที?/Sec",
                type: 10,
            }
        ]
    },
    async execute(client: client, interaction: CommandInteraction) {
        //เช็ค Role Admin
        if (!interaction.memberPermissions?.has('Administrator')) return interaction.reply({ 
            embeds: [
                {
                    color: 0xE6ED20,
                    title: `***Error***`,
                    description: `⚠️ ขอโทษนะคะที่ทำตามคำสั่งไม่ได้ แต่คุณไม่ใช่แอดมินนะคะ ⚠️`
                }
            ]
        });


        const _setup = interaction.options.get('setup')?.value //ดึงค่าของ args
        const deleteTimeSec = interaction.options.get('count-down')?.value as number || 0;

        if (_setup != "yes") {
            try {
                await prisma.autoDeleteMsg.delete({
                    where: {
                        channelId: interaction.channelId
                    },
                })
            } catch {
                return interaction.reply(
                    {
                        embeds: [
                            {
                                color: 0xB6B6B6,
                                title: `⭕️ ***Connection Error***`,
                                description: `**Database** isn't response please try again later`
                            }
                        ]
                    }
                )
            }
            await interaction.reply({
                embeds: [
                    {
                        color: 0xE51F33,
                        description: `🟥 **Cancle AutoDeleteMsg** ที่ห้องไอดี: **${interaction.channelId}** เรียบร้อยแล้วค่ะ`
                    }
                ]
            })
            return;
        }

        if (deleteTimeSec < 10) return interaction.reply(
            {
                embeds: [
                    {
                        color: 0xB6B6B6,
                        title: `⚠️ **Error** ⚠️`,
                        description: `สั่งให้ลบได้ขั้นต่ำคือ 10 วินาทีนะคะ`
                    }
                ],
                ephemeral: true
            }
        );
        

        // เขียน db
        try{
            await prisma.autoDeleteMsg.upsert({
                update: {
                    guildId: interaction.guildId,
                    guildName: interaction.guild?.name,
                    channelId: interaction.channelId,
                    deleteLimit: deleteTimeSec,
                },
                where: {
                    channelId: interaction.channelId
                },
                create: {
                    guildId: interaction.guildId,
                    guildName: interaction.guild?.name,
                    channelId: interaction.channelId,
                    deleteLimit: deleteTimeSec,
                }
            })
        } catch {
            return interaction.reply(
                {
                    embeds: [
                        {
                            color: 0xB6B6B6,
                            title: `⭕️ ***Connection Error***`,
                            description: `**Database** isn't response please try again later`
                        }
                    ]
                }
            )
        }

        await interaction.reply({
            embeds: [
                {
                    color: 0x0099ff,
                    description: `🟦 **Setup AutoDeleteMsg** ที่ห้องไอดี: **${interaction.channelId}** เรียบร้อยแล้วค่ะ`
                }
            ]
        })
    }
};