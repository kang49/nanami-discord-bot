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
                        "name": "confirm",
                        "description": "Select target voice channel to clone",
                        "type": 3,
                        required: true,
                        choices: [
                            {
                                name: "yes",
                                value: "yes"
                            },
                            {
                                name: "no",
                                value: "no"
                            }
                        ]
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
        const confirmOption = interaction?.options.get('confirm')?.value; // Get the confirm option value
        
        // console.log('Setup Option:', setupOption); //setup or cancel
        // console.log('Voice Channel Option:', voiceChannelOption); //voice state data
        // console.log('Confirm Option:', confirmOption); //yes or no

        if (setupOption === 'setup') {
            if (!voiceChannelOption || voiceChannelOption.type !== 2) return interaction.reply({ 
                embeds: [
                    {
                        color: 0xE6ED20,
                        description: `⚠️ นี่ไม่ใช่ **Voice Channel** นี่เจ้าคะ ⚠️

                        ⚠️ This's not **Voice Channel** ⚠️`
                    }
                ]
             });
            const _create_Vstate_id: string = voiceChannelOption.id
        
            //Update create_Vstate_id to sql
            await prisma.guild.upsert({
                update: {
                    //@ts-ignore
                    create_Vstate_id: _create_Vstate_id,
                },
                where: {
                    guild_id: interaction.guildId ?? ""
                },
                create: {
                    guild_id: interaction.guildId,
                    //@ts-ignore
                    create_Vstate_id: _create_Vstate_id
                }
            })
            await interaction.reply({
                embeds: [
                    {
                        color: 0x0099ff,
                        description: `🟦 **Registed Clone Voice Channel** ที่ห้องไอดี: **${_create_Vstate_id}** เรียบร้อยแล้วเจ้าค่ะ
                        
                        ⚠️ **หมายเหตุ:** ฟังก์ชั่นนี้ set clone ได้แค่ 1 voice channel/Server เท่านั้นน้าา`
                    }
                ]
            })
        }
        else if (confirmOption === 'yes') {
            //Update create_Vstate_id to sql
            await prisma.guild.upsert({
                update: {
                    //@ts-ignore
                    create_Vstate_id: null,
                    new_create_Vstate_id: null
                },
                where: {
                    guild_id: interaction.guildId ?? ""
                },
                create: {
                    guild_id: interaction.guildId,
                    //@ts-ignore
                    create_Vstate_id: null,
                    new_create_Vstate_id: null
                }
            })
            await interaction.reply({
                embeds: [
                    {
                        color: 0x0099ff,
                        description: `🟥 **Cancelled Clone Voice Channel** เรียบร้อยแล้วเจ้าค่ะ`
                    }
                ]
            })
        }
        else if (confirmOption === 'no') {
            return;
        }
    },
}