import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import type client from '../index';
import type { CommandInteraction } from 'discord.js';

export = {
    data: {
        name: "clone",
        description: "Duplicate your voice channel to new channel and delete when left",
        description_localizations: {
            'th': 'โคลน Voice Channel เป็น channel ใหม่ และลบทิ้งเมื่อออก'
        },
        options: [
            {
                name: "setup",
                description: "setup to use",
                type: 1,
                options: [
                    {
                        "name": "voice-channel",
                        "description": "Select target voice channel to clone",
                        "type": 7,
                        "required": true
                    },
                ]
            },
            {
                name: "cancel",
                description: "cancel clone voice channel function",
                type: 1,
                options: [
                    {
                        "name": "voice-channel",
                        "description": "Select target voice channel to cancel",
                        "type": 7,
                        required: true,
                    },
                ]
            }
        ]
    },
    async execute(client: client, interaction: CommandInteraction) {
        if (!interaction.isCommand()) return; // Check if the interaction is a command
        //@ts-ignore
        const setupOption = interaction?.options.getSubcommand(); // Get the setup subcommand name
        //@ts-ignore
        const voiceChannelOption = interaction?.options.getChannel('voice-channel'); // Get the voice-channel option value
        //@ts-ignore
        const confirmOption = interaction?.options.getSubcommand();
        
        // console.log('Setup Option:', setupOption); //setup or cancel
        // console.log('Voice Channel Option:', voiceChannelOption); //voice state data
        // console.log('Confirm Option:', confirmOption); //yes or no

        if (setupOption === 'setup') {
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
            if (!voiceChannelOption || voiceChannelOption.type !== 2) return interaction.reply({ 
                embeds: [
                    {
                        color: 0xE6ED20,
                        title: `***Error***`,
                        description: `⚠️ นี่ไม่ใช่ **Voice Channel** นี่คะ ⚠️

                        ⚠️ This's not **Voice Channel** ⚠️`
                    }
                ]
             });
            const _create_Vstate_id: string = voiceChannelOption.id
        
            //insert create_Vstate_id to sql
            //@ts-ignore
            await prisma.voiceChatClone.create({
                data: {
                  create_Vstate_id: _create_Vstate_id
                }
            });
            await interaction.reply({
                embeds: [
                    {
                        color: 0x0099ff,
                        description: `🟦 **Registed Clone Voice Channel** ที่ห้องไอดี: **${_create_Vstate_id}** เรียบร้อยแล้วค่ะ`
                    }
                ]
            })
        }
        else if (confirmOption === 'cancel') {
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
            if (!voiceChannelOption || voiceChannelOption.type !== 2) return interaction.reply({ 
                embeds: [
                    {
                        color: 0xE6ED20,
                        title: `***Error***`,
                        description: `⚠️ นี่ไม่ใช่ **Voice Channel** นี่คะ ⚠️

                        ⚠️ This's not **Voice Channel** ⚠️`
                    }
                ]
            });
            const _create_Vstate_id: string = voiceChannelOption.id
        
            //delete all create_Vstate_id match with _create_Vstate_id to sql
            //@ts-ignore
            await prisma.voiceChatClone.deleteMany({
                where: {
                  create_Vstate_id: _create_Vstate_id
                }
            });
            await interaction.reply({
                embeds: [
                    {
                        color: 0x0099ff,
                        description: `🟥 **Cancelled Clone Voice Channel** เรียบร้อยแล้วค่ะ`
                    }
                ]
            })
        }
        else if (confirmOption === 'no') {
            return;
        }
    },
}