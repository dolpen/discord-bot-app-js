import {Client, GuildMember, Message} from 'discord.js'
import ytdl from 'ytdl-core'
import Debug from 'debug'
import {Command} from './models/command'
import {OperationHandler} from './handlers'
import {OptionalOf} from './langs/optional'

const EMOJI_OK = '⭕'
const EMOJI_NG = '❌'
const client = new Client()
const prefix = '!!'
const whitelist = (process.env.ALLOWED_ROLES || '').trim().split(',')
const debug = Debug('bot')

const operationHandler = new OperationHandler()

const roleOperation = (message: Message, command: Command) => {
    const nameOption = command.getParam(0)
    const memberOption = OptionalOf(message.member)
    const roleOption = nameOption.flatMap((name) => {
        return OptionalOf(message.guild).map((g) => {
            const roles = g.roles.filter((role) => role.name === name).array()
            return roles.length > 0 ? roles[0] : null
        })
    })
    return Promise.all([memberOption.toPromise(), roleOption.toPromise()])
}

// メンバーにロールを付与する
operationHandler.addHandler('add', (message, command) => {
    roleOperation(message, command).then(([member, role]) => {
        member.roles.add(role.id)
            .then(() => message.react(EMOJI_OK))
            .catch(() => message.react(EMOJI_NG))
    }).catch(() => message.react(EMOJI_NG))
})

// メンバーからロールを削除する
operationHandler.addHandler('remove', (message, command) => {
    roleOperation(message, command).then(([member, role]) => {
        member.roles.remove(role.id)
            .then(() => message.react(EMOJI_OK))
            .catch(() => message.react(EMOJI_NG))
    }).catch(() => message.react(EMOJI_NG))
})

// メンバーに付与できるロールを一覧する
operationHandler.addHandler('all', (message) => {
    OptionalOf(message.guild).map((guild) => {
        return guild.roles
            .map((role) => role.name)
            .filter((name) => whitelist.indexOf(name) >= 0)
            .join('\n')
    }).toPromise().then((roles) => {
        message.reply(`このサーバーの Role (追加/削除可能なもの) :\n${roles}`)
    }).catch(() => {
        message.reply('サーバー上で発言してください')
    })
})

// メンバー付与されているロールを一覧する
operationHandler.addHandler('list', (message) => {
    OptionalOf(message.member).map((member) => {
        return member.roles
            .map((role) => role.name)
            .filter((name) => whitelist.indexOf(name) >= 0)
            .join('\n')
    }).toPromise().then((roles) => {
        message.reply(`あなたの Role (削除可能なもの) :\n${roles}`)
    }).catch(() => {
        message.reply('サーバー上で発言してください')
    })
})

// メンション先のメンバーをVC切断させる
operationHandler.addHandler('afk', (message) => {
    OptionalOf(message.guild).map((guild) => {
        const user = message.mentions.users.first()
        return user ? guild.member(user) : null
    }).map((member) => {
        return member.voice
    }).toPromise().then((voiceConnection) => {
        if (voiceConnection.channel) {
            voiceConnection.setChannel(null)
                .then(() => message.react(EMOJI_OK))
                .catch(() => message.react(EMOJI_NG))
        } else {
            message.reply('VCしてない気がする')
        }
    }).catch(() => {
        message.reply('サーバーにいない気がする')
    })
})

operationHandler.addHandler('play', (message, command) => {
    const urlOption = command.getParam(0)
    const channelOption = OptionalOf(message.member).map((member) => {
        return member.voice.channel
    })
    Promise.all([urlOption.toPromise(), channelOption.toPromise()])
        .then(([url, channel]) => {
            channel.join()
                .then((connection) => {
                    const dl = ytdl(url, {filter: 'audioonly'})
                        .on('error', (error) => {
                            debug(error.message)
                        })
                    connection.play(dl)
                        .on('end', () => {
                            connection.disconnect()
                        }).on('error', (error) => {
                        debug(error.message)
                        connection.disconnect()
                    })
                    message.react(EMOJI_OK)
                })
                .catch((reason) => {
                    message.react(EMOJI_NG)
                    debug(reason)
                })
        }).catch((reason) => {
        message.react(EMOJI_NG)
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
