import { Events } from 'discord.js';
import type client from '../index';

const statusList = [
    { name: 'ชื่อนานามินะคะ 💕' },
    { name: 'ลองเรียกใช้หนูได้นะคะ' },
    { name: 'อยากโดนเธอจังค่ะ อ้าาส์ 💘' }
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
        setInterval(updateStatus, 60000); // Update status every 1 minute

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
}
