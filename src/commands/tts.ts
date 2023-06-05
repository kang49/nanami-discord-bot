import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import type client from '../index';
import type { CommandInteraction } from 'discord.js';
const { getVoiceConnection, joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');

const { createReadStream } = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);
const ffmpeg = require('ffmpeg-static');
const axios = require('axios');

export = {
    data: {
        name: "speak",
        description: "Speak in voice chat",
        description_localizations: {
            'th': 'สั่งให้บอทพูด'
        },
        options: [
            {
                name: "text",
                description: "Enter message",
                description_localizations: {
                    'th': 'ใส่ข้อความ'
                },
                type: 3,
                required: true
            },
        ]
    },
    async execute(client: client, interaction: CommandInteraction) {
        if (!interaction.isCommand()) return; // Check if the interaction is a command


        const userId: string = interaction.member?.user.id as string
        const guildId: string = interaction.guildId ?? ''
        const channelId: string = interaction.channelId
        const textMessage = interaction.options.get('text')?.value //ดึงค่าของ text //message from user
        //Check user already in voice channel
        const guildMember = await interaction.guild?.members.fetch(userId);

        // Check if the guild member is in a voice state
        const inVoiceState = guildMember?.voice.channel
        if (!inVoiceState) return interaction.reply({ 
            embeds: [
                {
                    color: 0xE6ED20,
                    title: `***Error***`,
                    description: `⚠️ เข้า **Voice Channel** ก่อนนะคะ ⚠️`
                }
            ],
            ephemeral: true,
        });

        //Botnoi voice API
        const options = {
            method: 'POST',
            url: 'https://api-voice.botnoi.ai/api/service/generate_audio',
            headers: {
                'Botnoi-Token': process.env.BOTNOI_TOKEN,
                'Content-Type': 'application/json',
            },
            data: {
                text: textMessage,
                speaker: '30',
                volume: 1,
                speed: 1,
                type_media: 'm4a',
            },
        };
        const sendMessage = interaction.reply({
            content: 'รอสักครู่นะคะ หนูกำลังฝึกพูดอยู่ค่ะ 😮 💕',
            ephemeral: true // หากต้องการให้ข้อความนี้เป็นเพียงแค่ข้อความแชทที่เท่ากับผู้ใช้เท่านั้นที่เห็น (ephemeral)
        }).then(async (message) => {
            axios(options)
                .then(async function (response: any) {
                    console.log(response.data);
                    const botnoi_response = response.data;
                    const botnoi_voice: string = botnoi_response.audio_url;
        
                    //Speak
                    //@ts-ignore
                    const voiceChannel = interaction.member?.voice.channel;
                    const connection = await joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: voiceChannel.guild.id,
                        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                    });
                    const audioPlayer = createAudioPlayer();
                    const audioResource = createAudioResource(`${botnoi_voice}`);
                    connection.subscribe(audioPlayer);
                    audioPlayer.play(audioResource);
        
                    // Optional: Handle playback finished event
                    audioPlayer.on('idle', () => {
                        setTimeout(() => {
                            connection.destroy();
                        }, 5 * 60 * 1000); // 5 minutes

                        // Delete the message
                        message.delete().catch(console.error);
                    });
                })
                .catch(function (error: any) {
                    console.error(error);
                });
        });        
    },
}