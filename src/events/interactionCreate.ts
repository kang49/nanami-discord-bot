import type client from '../index'
export = (client: client) => {
    client.on("interactionCreate", async (interaction) => {
        if(!interaction.isCommand()) return;
        const command = client.commandlist.get(interaction.commandName);
        if (!command) return;
        await command.execute(client, interaction);
    });
}