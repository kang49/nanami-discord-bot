import type client from '../index'
module.exports = (client: client) => {
    client.on("interactionCreate", async (interaction) => {
        if(!interaction.isCommand()) return;
        // @ts-ignore
        const command = client.commandlist.get(interaction.commandName);
        if (!command) return;
        await command.execute(client, interaction);
    });
}