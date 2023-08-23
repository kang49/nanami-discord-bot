import { Events } from 'discord.js';
import type client from '../index';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const statusList = [
    { name: 'เค้าชื่อนานามินะ 💕' },
    { name: 'เธอว่างเล่นกับเค้ามั้ยคะ?' },
    { name: 'เธอทำไรอยู่เหรอ?' },
    { name: 'คิดถึงเธอจัง' },
    { name: 'ขอกอดเธอได้ไหมคะ 🥺' },
    { name: 'คืนนี้อย่าลืมฝันถึงเค้าบ้างนะ 💤' },
    { name: 'ใครจะน่ารักเท่าเธอ 💕' },
    { name: 'ตั้งใจเรียนนะคะเธอ 📚' },
    { name: 'วันนี้เหนื่อยไหมคะ?' },
    // Add more status messages as needed
];

export = (client: client) => {
    let currentStatusIndex = 0;

    function updateStatus() {
        const status = statusList[currentStatusIndex];
        client.user?.setPresence({
            activities: [status]
        });
        currentStatusIndex = (currentStatusIndex + 1) % statusList.length;
    }

    client.once("ready", c => {
        updateStatus();
        setInterval(updateStatus, 5000); // Update status every 5sec 

        console.log(`Ready! Logged in as ${c.user.tag}`);
        client.guilds.cache.forEach(async (guild) => {
            try {
                guild.commands.cache.forEach(command => guild.commands.delete(command.id));
                guild.commands?.set(client.commandArray);
            } catch (e) {
                console.log(e);
            }
        });
    });

    client.on("guildCreate", c => {
        client.guilds.cache.forEach(async (guild) => {
            try {
                guild.commands.cache.forEach(command => guild.commands.delete(command.id));
                guild.commands?.set(client.commandArray);
            } catch (error) {
                return;
            }
        });
    });
}