import {Client} from 'discord.js'
import {Command} from './models/command'
import {OperationHandler} from './handlers'
import Debug from 'debug'

const client = new Client()
const prefix = '!!'
// const whitelist = ['違法バイター', 'Splatoon']
const whitelist = (process.env.ALLOWED_ROLES || '').trim().split(',')
const debug = Debug.debug('bot')

const operationHandler = new OperationHandler()

operationHandler.addHandler('add', (message, command) => {
    const roleName = command.getParam(0)
    if (!roleName) {
        message.reply('Role の名前指定して')
        return
    }
    const filteredRole = message.guild.roles.filter((role) => role.name === roleName).array()
    if (whitelist.indexOf(roleName) < 0) {
        message.reply('その Role はダメなやつです。')
        return
    }
    message.member
        .addRole(filteredRole[0].id)
        .then(() => message.react('⭕'))
        .catch(() => message.react('❌'))
})

operationHandler.addHandler('remove', (message, command) => {
    const roleName = command.getParam(0)
    if (!roleName) {
        message.reply('Role の名前指定して')
        return
    }
    const filteredRole = message.guild.roles.filter((role) => role.name === roleName).array()
    if (whitelist.indexOf(roleName) < 0) {
        message.reply('その Role はダメなやつです。')
        return
    }
    message.member
        .removeRole(filteredRole[0].id)
        .then(() => message.react('⭕'))
        .catch(() => message.react('❌'))
})

operationHandler.addHandler('all', (message) => {
    const roles = message.guild.roles
        .map((role) => role.name)
        .filter((name) => whitelist.indexOf(name) >= 0)
        .join('\n')
    message.reply(`このサーバーの Role (追加/削除可能なもの) :\n${roles}`)
})

operationHandler.addHandler('list', (message) => {
    const roles = message.member.roles
        .map((role) => role.name)
        .filter((name) => whitelist.indexOf(name) >= 0)
        .join('\n')
    message.reply(`あなたの Role (削除可能なもの) :\n${roles}`)
})

operationHandler.addHandler('ping', (message) => {
    message.reply('pong')
})

client.on('ready', () => {
    debug('I am ready!')
})

client.on('message', (message) => {
    const command = new Command(prefix, message.content)
    operationHandler.invoke(message, command)
})

const token = process.env.DISCORD_TOKEN

if (!token) {
    debug('Can\'t launch bot without DISCORD_TOKEN environment variable')
} else {
    client.login()
}
