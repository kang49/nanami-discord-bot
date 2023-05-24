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
        
        let translateChannels = await prisma.translateChannel.findMany({
            where: {
                guild: message.guildId,
                mainChannel: message.channelId
            }
        });
        if (message.author.bot) return; //เช็คว่าเป็นบอทหรือไม่ กันการอ่านตัวเอง
        if (translateChannels[0] === undefined) { //reply target to main
            let translateChannel = await prisma.translateChannel.findMany({
                where: {
                    guild: message.guildId,
                    targetChannel: message.channelId
                }
            });
            if (translateChannel[0] === undefined) return; //ถ้าว่างให้ return ค่าทิ้ง กรณีคือส่งช่องอื่นที่ไม่ใช่ทั้ง main และ target
            const translateChannel_mainLanguage: string = translateChannel[0].mainLanguage ?? ''
            const translateChannel_mainChannelId: string = translateChannel[0].mainChannel ?? ''
            if (!translateChannel_mainChannelId) return;
            const translateChannel_mainChannel: TextChannel | null = client.channels.cache.get(translateChannel_mainChannelId) as TextChannel | null;
            if (!translateChannel_mainChannel) {
                console.error('Main channel not found.');
                return;
            }


            // Microsoft Translator API
            const options_microsoftTrAPI = {
                method: 'POST',
                url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
                params: {
                    'to[0]': translateChannel_mainLanguage,
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

                let _attachment: string | undefined;
                try {
                    _attachment = message.attachments.first()?.url;
                } catch (e) {
                    _attachment = undefined;
                }
                //@ts-ignore
                if (_attachment === undefined || _attachment === null) {
                    _attachment = ''
                }
                translateChannel_mainChannel.send({
                    embeds: [
                        {
                            author: {
                                name: `${message.author.username}`,
                                icon_url: `${message.author.avatarURL()}`,
                            },
                            color: 0x0099ff,
                            title: `**${message_contentTR}**`,
                            image: {
                                url: _attachment || '',
                            },
                            timestamp: new Date().toISOString(),
                            footer: {
                                text: `Nanami Translate`
                            }
                        }
                    ]
                });
            } catch (error) {
                console.error(error);
            }
        }
        else {
        for (const translateChannel of translateChannels) {
            if (message.channelId === translateChannel.mainChannel) {
                //@ts-ignores
                const translateChannel_targetLanguage: string = translateChannel.targetLanguage;
                //@ts-ignore
                const translateChannel_targetChannelId: string = translateChannel.targetChannel;

                if (!translateChannel_targetChannelId) continue;

                const translateChannel_targetChannel: TextChannel | null = client.channels.cache.get(translateChannel_targetChannelId) as TextChannel | null;
                if (!translateChannel_targetChannel) {
                    console.error('Target channel not found.');
                    continue;
                }

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

                    if (message.content !== '') {
                        let _attachment: string | undefined;
                        try {
                            _attachment = message.attachments.first()?.url;
                        } catch (e) {
                            _attachment = undefined;
                        }
                        translateChannel_targetChannel.send({
                            embeds: [
                                {
                                    author: {
                                        name: `${message.author.username}`,
                                        icon_url: `${message.author.avatarURL()}`,
                                    },
                                    color: 0x0099ff,
                                    title: `**${message_contentTR}**`,
                                    image: {
                                        url: _attachment || '',
                                    },
                                    timestamp: new Date().toISOString(),
                                    footer: {
                                        text: `Nanami Translate`
                                    }
                                }
                            ]
                        });
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }
    });
};
