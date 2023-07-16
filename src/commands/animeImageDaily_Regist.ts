import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import type client from '../index'
import type { CommandInteraction } from "discord.js"
import welcomeMsg from '../events/welcomeMsg';

export = {
    data: {
        name: "anime-daily",
        description: "Send anime girl image in your channel when have new update image",
        description_localizations: {
            'th': 'ส่งภาพอนิเมะผู้หญิงน่ารักในช่องของคุณทุกครั้งที่มีการอัพเดต'
        },
        options: [
            {
                name: "setup",
                description: "ตั้งค่าห้องนี้เป็นห้องส่งภาพหรือไม่?",
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
            try {
                await prisma.guild.upsert({
                    update: {
                        animeGirlDaily_log_id: interaction.channelId,
                        animeGirlDaily: false
                    },
                    where: {
                        guild_id: interaction.guildId ?? ""
                    },
                    create: {
                        guild_id: interaction.guildId,
                        animeGirlDaily_log_id: interaction.channelId,
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
                        color: 0xE51F33,
                        description: `🟥 **Cancle Anime Girl Daily** ที่ห้องไอดี: **${interaction.channelId}** เรียบร้อยแล้วค่ะ`
                    }
                ]
            })
            return;
        }
        

        // เขียน db
        try{
            await prisma.guild.upsert({
                update: {
                    animeGirlDaily_log_id: interaction.channelId,
                    animeGirlDaily: true
                },
                where: {
                    guild_id: interaction.guildId ?? ""
                },
                create: {
                    guild_id: interaction.guildId,
                    animeGirlDaily_log_id: interaction.channelId,
                    animeGirlDaily: true
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
                    description: `🟦 **Setup Anime Girl Daily** ที่ห้องไอดี: **${interaction.channelId}** เรียบร้อยแล้วค่ะ`
                }
            ]
        })
    }
};