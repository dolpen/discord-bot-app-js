const Discord = require('discord.js');
const client = new Discord.Client();

const prefix = "!!";
const whitelist = ["違法バイター", "Splatoon"];
const nop = {
    op: "nop",
    params: []
};

const parse = (content) => {
    if (content.indexOf(prefix) !== 0) return nop;
    let command = content.substr(prefix.length).split(/\s/);
    if (command.length < 1) return nop;
    return {
        op: command[0],
        params: command.slice(1)
    };
};


client.on('ready', () => {
    console.log('I am ready!');
});


const addRoleToUser = (message, params) => {
    if (params == null || params.length < 1) {
        message.reply('Role の名前指定して');
        return;
    }
    const roleName = params[0];
    const filteredRole = message.guild.roles.filter(role => role.name === roleName).array();
    if (filteredRole.length < 1) {
        message.reply('そんな Role ないです。');
        return;
    }
    if (whitelist.indexOf(roleName) < 0) {
        message.reply('その Role はダメなやつです。');
        return;
    }
    message.member
        .addRole(filteredRole[0].id)
        .then(() => message.react('⭕'))
        .catch(() => message.react('❌'));
};

const removeRoleFromUser = (message, params) => {
    if (params == null || params.length < 1) {
        message.reply('Role の名前指定して');
        return;
    }
    const roleName = params[0];
    const filteredRole = message.guild.roles.filter(role => role.name === roleName).array();
    if (filteredRole.length < 1) {
        message.reply('そんな Role ないです : ' + roleName);
        return;
    }
    if (whitelist.indexOf(roleName) < 0) {
        message.reply('その Role はダメなやつです。');
        return;
    }
    message.member
        .removeRole(filteredRole[0].id)
        .then(() => message.react('⭕'))
        .catch(() => message.react('❌'));
};

client.on('message', message => {
    let operation = parse(message.content);
    switch (operation.op) {
        case 'all':
            message.reply('このサーバーの Role (追加/削除可能なもの) :\n' + message.guild.roles.map(role => role.name).filter(name => whitelist.indexOf(name) >= 0).join('\n'));
            break;
        case 'list':
            message.reply('あなたの Role (削除可能なもの) :\n' + message.member.roles.map(role => role.name).filter(name => whitelist.indexOf(name) >= 0).join('\n'));
            break;
        case 'add':
            addRoleToUser(message, operation.params);
            break;
        case 'remove':
            removeRoleFromUser(message, operation.params);
            break;
        case 'ping':
            message.reply('pong');
            break;
    }
});


client.login(process.env.DISCORD_TOKEN);