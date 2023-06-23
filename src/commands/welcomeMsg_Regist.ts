import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import type client from '../index'
import type { CommandInteraction } from "discord.js"
import welcomeMsg from '../events/welcomeMsg';

export = {
    data: {
        name: "welcome-msg",
        description: "Send welcome message to new member in server",
        description_localizations: {
            'th': 'ส่งข้อความต้อนรับให้กับสมาชิกใหม่'
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
                        description: `🟥 **Cancle welcome message** ที่ห้องไอดี: **${interaction.channelId}** เรียบร้อยแล้วค่ะ`
                    }
                ]
            })
            try {
                await prisma.guild.upsert({
                    update: {
                        welcome_log_id: interaction.channelId,
                        welcomeMsg: false
                    },
                    where: {
                        guild_id: interaction.guildId ?? ""
                    },
                    create: {
                        guild_id: interaction.guildId,
                        welcome_log_id: interaction.channelId,
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
            return;
        }
        

        // เขียน db
        try{
            await prisma.guild.upsert({
                update: {
                    welcome_log_id: interaction.channelId,
                    welcomeMsg: true
                },
                where: {
                    guild_id: interaction.guildId ?? ""
                },
                create: {
                    guild_id: interaction.guildId,
                    welcome_log_id: interaction.channelId,
                    welcomeMsg: true
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
                    description: `🟦 **Setup welcome message** ที่ห้องไอดี: **${interaction.channelId}** เรียบร้อยแล้วค่ะ
                    
                    ⚠️ **หมายเหตุ:** ถ้า Setup แล้วใช้ไม่ได้ให้ Setup ซ้ำอีกรอบนะคะ`
                }
            ]
        })
    }
};