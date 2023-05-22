import { Events, ChannelType } from 'discord.js';
import client from '../index';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export = (client: client) => {
    client.on("voiceStateUpdate", async (oldState, newState) => {
        const user = newState.member;

        //Get guild data
        const guild = await prisma.guild.findFirst({
            where: {
                guild_id: newState.guild.id
            }
        });
        //@ts-ignore
        if (guild.create_Vstate_id == null || guild.create_Vstate_id === undefined) return; //ถ้าไม่มีข้อมูลใน create_Vstate_id ให้ return ค่าทิ้ง

        const _guild = await client.guilds.fetch(`${guild?.guild_id}`); //table
        const _channel = await _guild.channels.fetch(`${guild?.log_id}`);
        //@ts-ignore
        const _createVstateId: string = guild.create_Vstate_id; //Get column create_Vstate_id
        const _currentVstateId = newState.channelId;
        //@ts-ignore
        const _new_create_Vstate_id: string = guild.new_create_Vstate_id;
        // console.log(guild)

        //เช็คว่าเป็นการกด join หรือไม่
        var newVoiceState;
        if (oldState.channelId === null && newState.channelId !== null) {
            if (!_channel) return;
            if (_channel.type !== ChannelType.GuildText) return;
            
            // เช็คว่าห้องที่ user เข้าปัจจุบันตรงกับห้องที่ Set สำหรับสร้างห้องส่วนตัวใน SQL หรือไม่
            if (_currentVstateId === _createVstateId) {
                // สร้าง Voice Private Voice State
                const guildChannel = newState.guild.channels.cache.get(_currentVstateId);
                //@ts-ignore
                newVoiceState = await guildChannel.clone({
                    name: `${user?.displayName} Room`
                });

                // Move user to new Private State
                //@ts-ignore
                user.voice.setChannel(newVoiceState);
                //@ts-ignore
                // console.log(`User ${user.displayName} moved to ${newVoiceState.name}`);

                // Update SQL
                await prisma.guild.upsert({
                    update: {
                        //@ts-ignore
                        new_create_Vstate_id: newVoiceState.id,
                    },
                    where: {
                        guild_id: _guild.id ?? ""
                    },
                    create: {
                        guild_id: _guild.id,
                        //@ts-ignore
                        new_create_Vstate_id: newVoiceState.id,
                    }
                });
            }

        } else if (oldState.channelId !== null && newState.channelId === null) {
            if (!_channel) return;
            if (_channel.type !== ChannelType.GuildText) return;
        
            // Delete newVoiceState
            if (_new_create_Vstate_id) {
                const voiceChannel = _guild.channels.cache.get(_new_create_Vstate_id);
                if (voiceChannel && voiceChannel.type === ChannelType.GuildVoice) {
                    const memberCount = voiceChannel.members.size;
                    //Check member still in new voice channel
                    if (memberCount === 0) {
                        voiceChannel.delete();
                        await prisma.guild.upsert({
                            update: {
                                //@ts-ignore
                                new_create_Vstate_id: null,
                            },
                            where: {
                                guild_id: _guild.id ?? ""
                            },
                            create: {
                                //@ts-ignore
                                new_create_Vstate_id: null,
                            }
                        });
                        // console.log(`Voice channel ${_new_create_Vstate_id} has been deleted.`);
                    }
                }
            }
        }
        else if (oldState.channelId !== newState.channelId) {
            if (!_channel) return;
            if (_channel.type !== ChannelType.GuildText) return;
            
            // เช็คว่าห้องที่ user เข้าปัจจุบันตรงกับห้องที่ Set สำหรับสร้างห้องส่วนตัวใน SQL หรือไม่
            if (_currentVstateId === _createVstateId) {
                // สร้าง Voice Private Voice State
                const guildChannel = newState.guild.channels.cache.get(_currentVstateId);
                //@ts-ignore
                newVoiceState = await guildChannel.clone({
                    name: `${user?.displayName} Room`
                });

                // Move user to new Private State
                //@ts-ignore
                user.voice.setChannel(newVoiceState);
                //@ts-ignore
                // console.log(`User ${user.displayName} moved to ${newVoiceState.name}`);

                // Update SQL
                await prisma.guild.upsert({
                    update: {
                        //@ts-ignore
                        new_create_Vstate_id: newVoiceState.id,
                    },
                    where: {
                        guild_id: _guild.id ?? ""
                    },
                    create: {
                        guild_id: _guild.id,
                        //@ts-ignore
                        new_create_Vstate_id: newVoiceState.id,
                    }
                });
            }
        }
    });
};