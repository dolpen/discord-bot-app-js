import {Client} from 'discord.js'
import ytdl from 'ytdl-core'
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
    if (!message.guild || !message.member) {
        message.reply('Role があるサーバー上で指定してください')
        return
    }
    const filteredRole = message.guild.roles.filter((role) => role.name === roleName).array()
    if (whitelist.indexOf(roleName) < 0) {
        message.reply('その Role はダメなやつです。')
        return
    }
    message.member.roles.add(filteredRole[0].id)
        .then(() => message.react('⭕'))
        .catch(() => message.react('❌'))
})

operationHandler.addHandler('remove', (message, command) => {
    const roleName = command.getParam(0)
    if (!roleName) {
        message.reply('Role の名前指定して')
        return
    }
    if (!message.guild || !message.member) {
        message.reply('サーバー上で発言してください')
        return
    }
    const filteredRole = message.guild.roles.filter((role) => role.name === roleName).array()
    if (whitelist.indexOf(roleName) < 0) {
        message.reply('その Role はダメなやつです。')
        return
    }
    message.member.roles.remove(filteredRole[0].id)
        .then(() => message.react('⭕'))
        .catch(() => message.react('❌'))
})

operationHandler.addHandler('all', (message) => {
    if (!message.guild) {
        message.reply('サーバー上で発言してください')
        return
    }
    const roles = message.guild.roles
        .map((role) => role.name)
        .filter((name) => whitelist.indexOf(name) >= 0)
        .join('\n')
    message.reply(`このサーバーの Role (追加/削除可能なもの) :\n${roles}`)
})

operationHandler.addHandler('list', (message) => {
    if (!message.member) {
        message.reply('サーバー上で発言してください')
        return
    }
    const roles = message.member.roles
        .map((role) => role.name)
        .filter((name) => whitelist.indexOf(name) >= 0)
        .join('\n')
    message.reply(`あなたの Role (削除可能なもの) :\n${roles}`)
})

operationHandler.addHandler('afk', (message) => {
    if (!message.guild) {
        message.reply('サーバー上で指定してください')
        return
    }
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
    const vc = member.voice.channel
    if (!vc) {
        message.reply('ボイチャしてない気がする')
        return
    }
    member.voice.setChannel(null)
        .then(() => message.react('⭕'))
        .catch(() => message.react('❌'))
})

operationHandler.addHandler('play', (message, command) => {
    if (!message.member) {
        message.reply('サーバー上で指定してください')
        return
    }

    const uri = command.getParam(0)
    if (!uri) {
        message.reply('URL 指定して')
        return
    }
    const vc = message.member.voice.channel
    if (!vc) {
        message.reply('ボイチャしてない気がする')
        return
    }
    vc.join()
        .then((connection) => {
            const dl = ytdl(uri, {filter: 'audioonly'})
                .on('error', (error) => {
                    debug(error.message)
                })
            const dispatcher = connection.play(dl)
                .on('end', () => {
                    connection.disconnect()
                }).on('error', (error) => {
                    debug(error.message)
                    connection.disconnect()
                })
        }).catch((reason) => {
        debug(reason)
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
