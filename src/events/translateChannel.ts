import { Events, ChannelType, TextChannel } from 'discord.js';
import type client from '../index';
require('dotenv').config()

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const axios = require('axios');

export = (client: client) => {
    client.on("messageCreate", async (message) => {
        // Get sql where guild and mainChannel
        if (!message.guildId) return;
        
        const translateChannel = await prisma.translateChannel.findMany({
            where: {
                guild: message.guildId,
                mainChannel: message.channelId
            }
        });
        if (message.author.bot) return; //เช็คว่าเป็นบอทหรือไม่ กันการอ่านตัวเอง
        try{ //เช็ึคว่า message ที่อ่านมากจากห้องที่ลงทะเบียนไว้ไหม ถ้าไม่หรือ get ไม่ผ่านให้ return ทิ้ง
            if (message.channelId !== translateChannel[0].mainChannel) return;
        } catch (e) {
            return;
        }
        //@ts-ignores
        const translateChannel_targetLanguage:string = translateChannel[0].targetLanguage;
        //@ts-ignore
        const translateChannel_mainChannelId: string = translateChannel[0].mainChannel;
        //@ts-ignore
        const translateChannel_targetChannelId: string = translateChannel[0].targetChannel;

        if (!translateChannel_targetChannelId) return;

        const translateChannel_targetChannel: TextChannel | null = client.channels.cache.get(translateChannel_targetChannelId) as TextChannel | null;
        if (!translateChannel_targetChannel) {
            console.error('Target channel not found.');
            return;
        }

        if (message.channelId === translateChannel_mainChannelId) {

            // Microsoft Translator API
            const options_microsoftTrAPI = {
                method: 'POST',
                url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
                params: {
                    'to[0]': translateChannel_targetLanguage,
                    'api-version': '3.0',
                    profanityAction: 'NoAction',
                    textType: 'plain'
                },
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Key': process.env.X_RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com'
                },
                data: [
                    {
                    Text: `${message.content}`
                    }
                ]
            };

            try {
                const response_microsiftTR = await axios.request(options_microsoftTrAPI);
                const message_contentTR: string = response_microsiftTR.data[0].translations[0].text;

                translateChannel_targetChannel.send({
                    embeds: [
                        {
                            author: {
                                name: `${message.author.username}`,
                                icon_url: `${message.author.avatarURL()}`,
                            },
                            color: 0x0099ff,
                            title: `***${message_contentTR}***`,
                            timestamp: new Date().toISOString(),
                        }
                    ]
                });
            } catch (error) {
                console.error(error);
            }
        }
    });
};
