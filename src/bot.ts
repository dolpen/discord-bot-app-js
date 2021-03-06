import {Client, Message, TextChannel} from 'discord.js'
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
const pt = [15, 51, 85, 105, 153, 165, 195];

const operationHandler = new OperationHandler()
const matchOption = (names: string[]) => {
    return pt.map((p, i) => {
        return '' + (i + 1) + ' : ' + [0, 1, 2, 3, 4, 5, 6, 7]
            .filter((c) => (p & (1 << c)) > 0)
            .map(i => names[i]).join(',')
    }).join('\n')
}

operationHandler.addHandler('match', (message) => {
    OptionalOf(message.member).map((member) => {
        return member.voice.channel
    }).map((channel) => {
        return channel.members.filter(m => m.voice.selfMute === false && m.voice.selfDeaf == false)
    }).map((members) => {
        if (members.size != 8) return null;
        return matchOption(members.map(m => m.displayName))
    }).toPromise()
        .then((data) => {
            message.reply(`アルファチームのみ記載\n${data}`)
        })
        .catch(() => message.react(EMOJI_NG))
})

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

// レポート
operationHandler.addHandler('report', (message) => {
    const now = new Date();
    const border = now.getTime() - 30 * 86400 * 1000
    const getLastUpdated = (channel: TextChannel) => {
        return OptionalOf(channel.lastMessageID).map((snowflake) => {
            const id = Number(snowflake)
            return new Date(Math.floor((id / 4194304)) + 1420070400000)
        }).orElse(channel.createdAt)
    }
    OptionalOf(message.guild).map((guild) => {
        return guild.channels
    }).toPromise().then((channels) => {
        const names = channels.array().filter((channel) => {
            return channel.type === 'text'
        }).map((channel) => {
            const chat = channel as TextChannel
            return {
                channel: chat,
                time: getLastUpdated(chat),
            }
        }).filter((info) => {
            return info.time.getTime() < border
        }).map((info) => {
            const passed = Math.floor((now.getTime() - info.time.getTime()) / (86400 * 1000))
            const parent = OptionalOf(info.channel.parent).map((cate) => {
                return cate.name
            }).orElse('')
            return `${parent} / ${info.channel.name} : ${passed} days ago`
        }).join('\n')
        message.reply(`channels :\n${names}`)
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
                    const dl = ytdl(url)
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
    if (!(message instanceof Message)) {
        return
    }
    if (message.content === null) {
        return
    }
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
