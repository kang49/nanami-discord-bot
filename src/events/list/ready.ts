import type client from '../../index'

module.exports = (client: client) => {
    client.once("ready", c => {
        console.log(`Ready! Logged in as ${c.user.tag}`);
    });
}