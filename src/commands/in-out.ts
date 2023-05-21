import { SlashCommandBuilder } from "discord.js";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('in-out')
        .setDescription("Report user in and out voice chat in server")

        //เพิ่ม args 
        .addStringOption(o =>
            o.setName('setup')
                .setDescription("ตั้งค่าห้องนี้เป็นห้องเก็บ LOGS หรือไม่?")
                .setRequired(true) //บังคับว่าต้องกรอก

                //เพิ่ม ตัวเลือก
                .addChoices(
                    { name: 'yes', value: 'yes' },
                    { name: 'cancel', value: 'cancel' },
                ))
        .setDescriptionLocalizations({
            th: 'รีพอร์ตการเข้าออก Voice Chat',
        }),
    async execute(client: any, interaction: any) {
        const _setup = interaction.options.getString('setup') //ดึงค่าของ args
        if (_setup != "yes") {
            await interaction.reply({
                embeds: [
                    {
                        color: 0xE51F33,
                        description: `Cancle in-out report ที่ห้องไอดี: ${interaction.channelId} สำเร็จ`
                    }
                ]
            })

            return await prisma.guild.upsert({
                update: {
                    log_id: interaction.channelId,
                    inout: false
                },
                where: {
                    guild_id: interaction.guildId
                },
                create: {
                    guild_id: interaction.guildId,
                    log_id: interaction.channelId,
                    inout: false
                }
            })
        }

        // เขียน db
        // @ts-ignore
        await prisma.guild.upsert({
            update: {
                log_id: interaction.channelId,
                inout: true
            },
            where: {
                guild_id: interaction.guildId
            },
            create: {
                guild_id: interaction.guildId,
                log_id: interaction.channelId
            }
        })

        await interaction.reply({
            embeds: [
                {
                    color: 0x0099ff,
                    description: `Setup in-out report ที่ห้องไอดี: ${interaction.channelId} สำเร็จ`
                }
            ]
        })
    }
}