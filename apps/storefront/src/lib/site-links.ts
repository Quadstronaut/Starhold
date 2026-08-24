// One-line-update constants.
//
// DISCORD_INVITE: public server invite — set once the invite code is minted.
// While it is empty, the Discord channel is omitted from the site entirely.
// A "public Discord opening soon" line reads unfinished to an evaluator, and an
// unfinished site is the one thing a contractor cannot afford to look like.
export const DISCORD_INVITE: string = ''; // pending

// #contact ticket channel — works for existing server members; outsiders need
// DISCORD_INVITE first, which is why this only renders alongside it.
export const DISCORD_TICKET_URL =
	'https://discord.com/channels/914352168058908732/1513054615472705687';

export const CONTACT_EMAIL = 'hello@starhold.dev';
