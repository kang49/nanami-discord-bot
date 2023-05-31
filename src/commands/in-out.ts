import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import type client from '../index'
import type { CommandInteraction } from "discord.js"

export = {
    data: {
        name: "in-out",
        description: "Report user in and out voice chat in server",
        description_localizations: {
            'th': 'รีพอร์ตการเข้าออก Voice Chat'
        },
        options: [
            {
                name: "setup",
                description: "ตั้งค่าห้องนี้เป็นห้องเก็บ LOGS หรือไม่?",
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
        if (_setup != "yes") {
            await interaction.reply({
                embeds: [
                    {
                        color: 0xE51F33,
                        description: `🟥 **Cancle in-out report** ที่ห้องไอดี: **${interaction.channelId}** เรียบร้อยแล้วค่ะ`
                    }
                ]
            })

            try {
                await prisma.guild.upsert({
                    update: {
                        log_id: interaction.channelId,
                        inout: false
                    },
                    where: {
                        guild_id: interaction.guildId ?? ""
                    },
                    create: {
                        guild_id: interaction.guildId,
                        log_id: interaction.channelId,
                        inout: false
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
        }

        // เขียน db
        try{
            await prisma.guild.upsert({
                update: {
                    log_id: interaction.channelId,
                    inout: true
                },
                where: {
                    guild_id: interaction.guildId ?? ""
                },
                create: {
                    guild_id: interaction.guildId,
                    log_id: interaction.channelId
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
                    description: `🟦 **Setup in-out report** ที่ห้องไอดี: **${interaction.channelId}** เรียบร้อยแล้วค่ะ
                    
                    ⚠️ **หมายเหตุ:** ถ้า Setup แล้วใช้ไม่ได้ให้ Setup ซ้ำอีกรอบนะคะ`
                }
            ]
        })
    }
}