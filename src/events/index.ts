import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import type client from '../index'

module.exports = (client: client) => {
    const files = readdirSync(join(__dirname, "list"))
    
    files.forEach(e => {
        require(join(__dirname, "list")+"/"+e)(client)
        console.log(e)
    })
}