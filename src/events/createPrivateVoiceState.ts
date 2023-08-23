import {ChannelType } from 'discord.js';
import client from '../index';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export = (client: client) => {
    try{
        client.on("voiceStateUpdate", async (oldState, newState) => {
            const user = newState.member;

            //Get guild data
            const guild = await prisma.guild.findFirst({
                where: {
                    guild_id: newState.guild.id
                }
            });
            // Get voiceChatClone data
            //@ts-ignore
            const voiceChatClones = await prisma.voiceChatClone.findMany(); // Get ทุก row ใน voiceChatClone table


            const _guild = await client.guilds.fetch(`${guild?.guild_id}`); // table
            const _channel = await _guild.channels.fetch(`${guild?.log_id}`);
            //@ts-ignore
            const _currentVstateId = newState.channelId;
            //@ts-ignore
            const _create_Vstate_ids: string[] = voiceChatClones.map((vc) => vc.create_Vstate_id); //รวมทุก create_Vstate_id
            //@ts-ignore
            const _new_create_Vstate_ids: string[] = voiceChatClones.map((vc) => vc.new_create_Vstate_id); //รวมทุก new_create_Vstate_id
            // console.log(_create_Vstate_ids); // output an array of new_create_Vstate_id values


            //เช็คว่าเป็นการกด join หรือไม่
            if (oldState.channelId === null && newState.channelId !== null) {
                if (!_channel) return;
                if (_channel.type !== ChannelType.GuildText) return;
                
                // เช็คว่าห้องที่ user เข้าปัจจุบันตรงกับห้องที่ Set สำหรับสร้างห้องส่วนตัวใน SQL หรือไม่
                //@ts-ignore
                if (_create_Vstate_ids.includes(_currentVstateId)) {
                    // สร้าง Voice Private Voice State
                    //@ts-ignore
                    const guildChannel = newState.guild.channels.cache.get(_currentVstateId);
                    //@ts-ignore
                    var newVoiceState = await guildChannel.clone({
                        name: `${user?.displayName} Room`
                    });

                    // Move user to new Private State
                    //@ts-ignore
                    user.voice.setChannel(newVoiceState);
                    //@ts-ignore
                    // console.log(`User ${user.displayName} moved to ${newVoiceState.name}`);

                    // Insert SQL
                    try{
                        await prisma.voiceChatClone.create({
                            data: {
                                create_Vstate_id: _currentVstateId ?? "",
                                new_create_Vstate_id: newVoiceState.id,
                            },
                        });     
                    } catch {
                        //nothing
                    }     
                }

            } else if (oldState.channelId !== null && newState.channelId === null) {
                if (!_channel) return;
                if (_channel.type !== ChannelType.GuildText) return;
            
                // Delete newVoiceState
                if (_new_create_Vstate_ids.includes(oldState.channelId)) {
                    const voiceChannel = _guild.channels.cache.get(oldState.channelId);
                    if (voiceChannel && voiceChannel.type === ChannelType.GuildVoice) {
                        const memberCount = voiceChannel.members.size;
                        //Check member still in new voice channel
                        if (memberCount === 0) {
                            voiceChannel.delete();
                            try {
                            //@ts-ignore
                            await prisma.voiceChatClone.deleteMany({
                                where: {
                                    new_create_Vstate_id: `${oldState.channelId}`,
                                }
                            });
                            } catch {
                                //noting
                            }
                            // console.log(`Voice channel ${_new_create_Vstate_id} has been deleted.`);
                        }
                    }
                }
            }
            else if (oldState.channelId !== newState.channelId) {
                if (!_channel) return;
                if (_channel.type !== ChannelType.GuildText) return;
                
                // เช็คว่าห้องที่ user เข้าปัจจุบันตรงกับห้องที่ Set สำหรับสร้างห้องส่วนตัวใน SQL หรือไม่
                //@ts-ignore
                if (_create_Vstate_ids.includes(_currentVstateId)) {
                    // สร้าง Voice Private Voice State
                    //@ts-ignore
                    const guildChannel = newState.guild.channels.cache.get(_currentVstateId);
                    //@ts-ignore
                    var newVoiceState = await guildChannel.clone({
                        name: `${user?.displayName} Room`
                    });

                    // Move user to new Private State
                    //@ts-ignore
                    user.voice.setChannel(newVoiceState);
                    //@ts-ignore
                    // console.log(`User ${user.displayName} moved to ${newVoiceState.name}`);

                    // Insert SQL
                    await prisma.voiceChatClone.create({
                        data: {
                            create_Vstate_id: _currentVstateId ?? "",
                            new_create_Vstate_id: newVoiceState.id,
                        },
                    });             
                }
                // Delete newVoiceState
                //@ts-ignore
                if (_new_create_Vstate_ids.includes(oldState.channelId)) {
                    //@ts-ignore
                    const voiceChannel = _guild.channels.cache.get(oldState.channelId);
                    if (voiceChannel && voiceChannel.type === ChannelType.GuildVoice) {
                        const memberCount = voiceChannel.members.size;
                        //Check member still in new voice channel
                        if (memberCount === 0) {
                            voiceChannel.delete();
                            //@ts-ignore
                            await prisma.voiceChatClone.deleteMany({
                                where: {
                                    new_create_Vstate_id: `${oldState.channelId}`,
                                }
                            });
                            // console.log(`Voice channel ${_new_create_Vstate_id} has been deleted.`);
                        }
                    }
                }
            }
        });
    } catch (e) {
        return;
    }
};