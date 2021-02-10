const dotenv = require('dotenv');
const { Markup, Stage, session, Telegraf } = require("telegraf");

const result = dotenv.config();
if (result.error) throw result.error;

const bot = new Telegraf(process.env.BOT_TOKEN)
const DEV = true;
const MAX_MEMBERS = 12;
const state = {
    registering: false,
    allIds: [],
    members: [],
    rezerve: [],
    teams: []
};

bot.hears('+1', ctx => {
    console.log('ctx', ctx);
    if( !DEV && state.allIds.indexOf(ctx.update.message.from.id) !== -1 )
        return ctx.replyWithMarkdown(`${ctx.update.message.from.first_name} ${ctx.update.message.from.last_name} (@${ctx.update.message.from.username}) - ești deja în listă.`);
    if( ctx.update.message.from.is_bot )
        return ctx.reply('@' + ctx.update.message.from.username + ', nu ai voie sa te inscrii, ești bot!');
    let unde = state.members.length !== MAX_MEMBERS ? 'members' : 'rezerve';
    let member = {};
    member['id'] = ctx.update.message.from.id;
    member['name'] = ctx.update.message.from.first_name + ' ' + ctx.update.message.from.last_name + ' (@' + ctx.update.message.from.username + ')';
    state[unde].push(member)
    state.allIds.push(ctx.update.message.from.id);

    if( state.members.length === MAX_MEMBERS ){
        createTeams();
    }

    return ctx.replyWithMarkdown(
        `\nJucatori: ${state.members.length} ${state.rezerve.length ? `Rezerve:  ${state.rezerve.length}` : ``}`
    );
});

bot.hears('-1', ctx => {
    if( state.allIds.indexOf(ctx.update.message.from.id) === -1 )
        return ctx.replyWithMarkdown(`${ctx.update.message.from.first_name} ${ctx.update.message.from.last_name} (@${ctx.update.message.from.username}) - nici nu ai fost înscris.`);
    if( ctx.update.message.from.is_bot ) return ctx.reply('@' + ctx.update.message.from.username + ', nu e permis, ești bot!');
    let inMembers = false;
    let inRezerve = false;
    let members = state.members.length && state.members.filter(a => {
        let isHere = a.id === ctx.update.message.from.id;
        if( isHere ) inMembers = true;
        return !isHere
    })
    let rezerve = state.rezerve.length && state.rezerve.filter(a => {
        let isHere = a.id === ctx.update.message.from.id;
        if( isHere ) inRezerve = true;
        return !isHere
    })
    if( inMembers ){
        if( state.rezerve.length ) {
            state.members = members.push(state.rezerve[0]);
            state.rezerve = rezerve.slice(1);
        }else{
            state.members = members
        }
    }else if( inRezerve ){
        state.rezerve = rezerve;
    }
    state.allIds = state.allIds.filter(a => a.id === ctx.update.message.from.id);
    return ctx.replyWithMarkdown(
        `\nJucatori: ${state.members.length} ${state.rezerve.length ? `Rezerve:  ${state.rezerve.length}` : ``}`
    );
});

bot.command('start', ctx => {
    if( state.registering ){
        return ctx.replyWithMarkdown(`Inscrierea deja a inceput.`);
    }
    state.members = [];
    state.rezerve = [];
    state.teams = [];
    state.registering = true;
    return ctx.replyWithMarkdown(`Se poate incepe inscrierea.`);
})
bot.command('reset', ctx => {
    state.members = [];
    state.rezerve = [];
    state.teams = [];
    state.registering = false;
    return ctx.replyWithMarkdown(`Sa revenit la setarile initiale.`);
})

bot.command('status', ctx => {
    if( !state.registering ){
        return ctx.replyWithMarkdown(`Înscrierea e oprită.`);
    }
    return ctx.replyWithMarkdown(
        `\nÎnscriși: ${state.members.length}`+
        `\n${state.members.map((a, i) => '*'+ (++i) + '.* '+a.name).join('\n')}`+
        `\n\nRezerve: ${state.rezerve.length}`+
        `\n${state.rezerve.map((a, i) => '*'+ (++i) + '.* '+a.name).join('\n')}`+
        `\n\nEchipe:`
    );
})
bot.startPolling();
/*
start - 🚀 start la înscrieri
status - 📖 info despre înscrieri
reset - 💣 revină la setări inițiale
 */