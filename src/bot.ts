import {Client} from 'discord.js'
import {Command} from './models/command'
import {OperationHandler} from './handlers'
import Debug from 'debug'

const client = new Client()
const prefix = '!!'
const whitelist = (process.env.ALLOWED_ROLES || '').trim().split(',')
const debug = Debug('bot')

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

operationHandler.addHandler('afk', (message) => {
    const user = message.mentions.users.first()
    if (!user) {
        message.reply('いない気がする')
        return
    }
    const member = message.guild.member(user)
    if (!member) {
        message.reply('いない気がする')
        return
    }
    const vc = member.voiceChannel
    if (!vc) {
        message.reply('ボイチャしてない気がする')
        return
    }
    member.setVoiceChannel(null)
        .then(() => message.react('⭕'))
        .catch(() => message.react('❌'))
})

operationHandler.addHandler('play', (message, command) => {
    const uri = command.getParam(0)
    if (!uri) {
        message.reply('URL 指定して')
        return
    }
    const vc = message.member.voiceChannel
    if (!vc) {
        message.reply('ボイチャしてない気がする')
        return
    }
    vc.join()
        .then((connection) => {
            connection.playArbitraryInput(uri)
                .on('end', () => {
                    connection.disconnect()
                })
                .on('error', (s) => {
                    debug(s)
                    connection.disconnect()
                })
        })
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
    debug(`DISCORD_TOKEN is ${token}`)
    client.login(token)
}
