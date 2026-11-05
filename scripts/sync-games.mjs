#!/usr/bin/env node
// 同步游戏库数据 -> src/data/games.json，封面下载到 public/media/covers/。
//
// 两类游戏：
//   1. 已拆解：src/data/games.manual.json 的 games[]，和 breakdowns.ts 里的文章一一对应
//   2. 待拆解：自动从 Steam / PSN 游玩记录里发现（时长 ≥ discover.minHours），不需要手填；
//      想隐藏、改中文名、指定 Metacritic 链接，就在 games.manual.json 的 discover / extras 里写
//
// 数据源：
//   Metacritic 评分  : metacritic.com 前端使用的 backend 接口（非官方）-> 失败时退回 Steam 商店的 metacritic 字段
//   TGA / 金摇杆奖项 : src/data/awards.json（手工维护的历年获奖名单，按英文名匹配）
//   游玩时长 Steam   : STEAM_API_KEY -> IPlayerService/GetOwnedGames；没有 key 只能读公开资料页的“最常玩”
//   游玩时长 PSN     : PSN_NPSSO -> psn-api getUserPlayedGames（PS4/PS5）
//   手填时长         : games.manual.json 里的 hours（战网、拳头等没有接口的平台）
//   封面             : Steam 600x900 -> PSN 竖版图 -> SteamGridDB（STEAMGRIDDB_API_KEY）-> 前端排版海报兜底
//
// 用法：npm run sync:games            （读取仓库根目录 .env）
//       npm run sync:games -- --force （重新下载所有封面）

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manualPath = path.join(root, 'src/data/games.manual.json');
const awardsPath = path.join(root, 'src/data/awards.json');
const outPath = path.join(root, 'src/data/games.json');
const coverDir = path.join(root, 'public/media/covers');
const force = process.argv.includes('--force');

loadDotEnv(path.join(root, '.env'));
const env = process.env;
// metacritic.com 前端页面自带的公开 key；若失效，打开 metacritic.com 任一游戏页，在网络请求 backend.metacritic.com 的 apiKey 参数里可找到新值。
const MC_KEY = env.METACRITIC_API_KEY || '1MOZgmNFxvmljaQR1X9KAij9Mo4xAY3u';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36 TheoPortfolioSync/1.0';

const log = (...a) => console.log('[sync-games]', ...a);
const warn = (...a) => console.warn('[sync-games] !', ...a);

const manual = JSON.parse(await readFile(manualPath, 'utf8'));
const awardsDb = JSON.parse(await readFile(awardsPath, 'utf8'));
const previous = existsSync(outPath) ? JSON.parse(await readFile(outPath, 'utf8')) : { games: [] };
const prevBySlug = new Map(previous.games.map((g) => [g.slug, g]));
await mkdir(coverDir, { recursive: true });

const awardIndex = buildAwardIndex(awardsDb);

// ---------- Steam ----------
const steamId = manual.profile?.steamId;
let steamGames = null; // [{ appid, name, minutes }]
let steamMode = 'none';
if (steamId && env.STEAM_API_KEY) {
	try {
		const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${env.STEAM_API_KEY}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`;
		const data = await getJson(url);
		const list = data?.response?.games ?? [];
		if (!list.length) warn('Steam 返回 0 款游戏：请确认 Steam 隐私设置里“游戏详情”为公开。');
		steamGames = list.map((g) => ({ appid: g.appid, name: g.name, minutes: g.playtime_forever ?? 0 }));
		steamMode = 'api';
		log(`Steam: ${list.length} 款游戏`);
	} catch (e) {
		warn('Steam API 失败：', e.message);
	}
}
if (!steamGames && steamId) {
	try {
		const xml = await getText(`https://steamcommunity.com/profiles/${steamId}/?xml=1`);
		steamGames = [];
		for (const m of xml.matchAll(/<mostPlayedGame>([\s\S]*?)<\/mostPlayedGame>/g)) {
			const appid = Number(m[1].match(/app\/(\d+)/)?.[1]);
			const name = m[1].match(/<gameName><!\[CDATA\[(.*?)\]\]><\/gameName>/)?.[1] ?? '';
			const hours = Number((m[1].match(/<hoursOnRecord>([^<]+)<\/hoursOnRecord>/)?.[1] ?? '0').replace(/,/g, ''));
			if (appid) steamGames.push({ appid, name, minutes: Math.round(hours * 60) });
		}
		steamMode = 'profile';
		log(`Steam: 未配置 STEAM_API_KEY，只从公开资料页读到 ${steamGames.length} 款最常玩游戏`);
	} catch (e) {
		warn('Steam 公开资料页读取失败：', e.message);
	}
}
const steamById = new Map((steamGames ?? []).map((g) => [g.appid, g]));

// ---------- PSN ----------
let psnTitles = null; // [{ name, norm, altNorm, minutes, images }]
if (env.PSN_NPSSO) {
	try {
		const psn = await import('psn-api');
		const accessCode = await psn.exchangeNpssoForAccessCode(env.PSN_NPSSO);
		const auth = await psn.exchangeAccessCodeForAuthTokens(accessCode);
		psnTitles = [];
		let offset = 0;
		for (let page = 0; page < 20; page++) {
			const res = await psn.getUserPlayedGames(auth, 'me', { limit: 200, offset });
			for (const t of res.titles ?? []) {
				const name = t.concept?.name || t.localizedName || t.name;
				psnTitles.push({
					name,
					norm: norm(name),
					altNorm: norm(t.name || ''),
					minutes: isoDurationToMinutes(t.playDuration),
					images: [...(t.concept?.media?.images ?? []), ...(t.media?.images ?? [])],
				});
			}
			if (!res.nextOffset || res.nextOffset <= offset) break;
			offset = res.nextOffset;
		}
		log(`PSN: ${psnTitles.length} 款游戏`);
	} catch (e) {
		warn('PSN 同步失败（NPSSO 可能已过期，需重新获取）：', e.message);
		psnTitles = null;
	}
}

const out = [];
const usedPsn = new Set();
const usedSteam = new Set();

// ---------- 1. 已拆解的游戏 ----------
for (const g of manual.games) {
	const prev = prevBySlug.get(g.slug);
	(g.steam ?? []).forEach((id) => usedSteam.add(id));
	const psnMatches = psnTitles && g.psn?.length ? psnTitles.filter((t) => matchPsn(t, g)) : [];
	psnMatches.forEach((t) => usedPsn.add(t));

	const mc = await resolveMetacritic(g.metacritic, g.steam, prev);
	const sources = {};
	if (steamGames && g.steam?.length) {
		const minutes = g.steam.reduce((sum, id) => sum + (steamById.get(id)?.minutes ?? 0), 0);
		if (minutes > 0) sources.steam = round1(minutes / 60);
	}
	const psnMinutes = psnMatches.reduce((s, t) => s + t.minutes, 0);
	if (psnMinutes > 0) sources.psn = round1(psnMinutes / 60);
	if (typeof g.hours === 'number') sources.manual = g.hours;
	carryStaleSources(sources, prev);

	const item = {
		slug: g.slug,
		written: true,
		titleEn: g.titleEn,
		year: g.year,
		steam: g.steam ?? [],
		awards: findAwards([g.titleEn, ...(g.awardNames ?? [])]),
		metacritic: mc?.data ?? null,
		mcSlug: g.metacritic ?? null,
		playtime: makePlaytime(sources, g.hoursOverride, psnMatches),
		cover: await resolveCover({ slug: g.slug, steam: g.steam, titleEn: g.titleEn, cover: g.cover }, psnMatches, prev),
	};
	out.push(item);
	logRow(item);
}

// ---------- 2. 自动发现：玩过但还没写拆解的游戏 ----------
const discover = { minHours: 2, ignore: [], ...(manual.discover ?? {}) };
const ignore = new Set(discover.ignore.map(matchKey));
const extrasCfg = Object.fromEntries(Object.entries(manual.extras ?? {}).map(([k, v]) => [matchKey(k), v]));
const groups = new Map(); // key -> { names, steam:[], psn:[], minutes }
const addCandidate = (name, entry) => {
	const key = matchKey(name);
	if (!key || ignore.has(key)) return;
	const grp = groups.get(key) ?? { key, names: [], steam: [], psn: [], steamMin: 0, psnMin: 0 };
	grp.names.push(name);
	if (entry.appid) { grp.steam.push(entry.appid); grp.steamMin += entry.minutes; }
	else { grp.psn.push(entry); grp.psnMin += entry.minutes; }
	groups.set(key, grp);
};
for (const g of steamGames ?? []) if (!usedSteam.has(g.appid)) addCandidate(g.name, g);
for (const t of psnTitles ?? []) if (!usedPsn.has(t)) addCandidate(t.name, t);

const freshExtraSlugs = new Set();
const sortedGroups = [...groups.values()].sort((a, b) => b.steamMin + b.psnMin - (a.steamMin + a.psnMin));
for (const grp of sortedGroups) {
	const cfg = extrasCfg[grp.key] ?? {};
	const sources = {};
	if (grp.steamMin > 0) sources.steam = round1(grp.steamMin / 60);
	if (grp.psnMin > 0) sources.psn = round1(grp.psnMin / 60);
	if (typeof cfg.hours === 'number') sources.manual = cfg.hours;
	const totalHours = Object.values(sources).reduce((a, b) => a + b, 0);
	if (cfg.hidden || totalHours < discover.minHours) continue;

	const slug = `g-${grp.key.replace(/\s+/g, '-')}`;
	const prev = prevBySlug.get(slug);
	carryStaleSources(sources, prev);
	const titleEn = cfg.titleEn ?? displayName(grp.names[0]);
	const mcSlug = cfg.metacritic ?? prev?.mcSlug ?? (await searchMetacritic(titleEn, grp.key).catch(() => null));
	const mc = await resolveMetacritic(mcSlug, grp.steam, prev);
	const item = {
		slug,
		written: false,
		titleEn,
		nameZh: cfg.zh ?? null,
		year: cfg.year ?? mc?.year ?? prev?.year ?? null,
		steam: grp.steam,
		awards: findAwards([titleEn, ...grp.names, ...(cfg.awardNames ?? [])], true),
		metacritic: mc?.data ?? null,
		mcSlug: mcSlug ?? null,
		playtime: makePlaytime(sources, cfg.hoursOverride, grp.psn),
		cover: await resolveCover({ slug, steam: grp.steam, titleEn, cover: cfg.cover }, grp.psn, prev),
		article: cfg.article ?? null,
	};
	freshExtraSlugs.add(slug);
	out.push(item);
	logRow(item);
}
// 某个平台这次没读到（key 过期 / 接口失败）时，保留上次发现的游戏，避免卡片墙突然缩水
if (steamMode !== 'api' || !psnTitles) {
	for (const prev of previous.games) {
		if (prev.written === false && !freshExtraSlugs.has(prev.slug) && !extrasCfg[matchKey(prev.titleEn)]?.hidden) out.push(prev);
	}
}

const result = {
	$comment: '由 scripts/sync-games.mjs 生成，请勿手改；要改数据请编辑 games.manual.json / awards.json 后重新运行 npm run sync:games',
	// 数据没变就沿用上次的时间戳，避免每周产生只改时间的空提交
	syncedAt: JSON.stringify(previous.games) === JSON.stringify(out) && previous.syncedAt ? previous.syncedAt : new Date().toISOString(),
	sources: { steam: steamMode, psn: psnTitles ? 'api' : (previous.sources?.psn ?? 'none') },
	games: out,
};
await writeFile(outPath, JSON.stringify(result, null, '\t') + '\n');
log(`写入 ${path.relative(root, outPath)}（已拆解 ${out.filter((g) => g.written).length} 款，待拆解 ${out.filter((g) => !g.written).length} 款）`);

// ================= helpers =================
function logRow(item) {
	log(`${(item.written ? '' : '+ ') + item.titleEn}`.slice(0, 40).padEnd(40), `MC ${String(item.metacritic?.score ?? '—').padStart(3)}  时长 ${String(item.playtime.hours ?? '—').padStart(7)} h  奖项 ${String(item.awards.length).padStart(2)}  封面 ${item.cover ? '✓' : '—'}`);
}

function carryStaleSources(sources, prev) {
	for (const key of ['steam', 'psn']) {
		const stale = key === 'steam' ? steamMode !== 'api' : !psnTitles;
		if (sources[key] == null && stale && prev?.playtime?.sources?.[key] != null) sources[key] = prev.playtime.sources[key];
	}
}

function makePlaytime(sources, override, psnMatches) {
	const total = typeof override === 'number' ? override : Object.values(sources).reduce((a, b) => a + b, 0);
	return { hours: total > 0 ? round1(total) : null, sources, shared: psnMatches.some((t) => /collection|合集/i.test(t.name)) };
}

async function resolveMetacritic(slug, steamIds, prev) {
	let data = null;
	let year = null;
	if (slug) {
		try {
			const r = await fetchMetacritic(slug);
			if (r) ({ data, year } = r);
		} catch (e) {
			warn(`Metacritic ${slug} 失败 ${e.message}`);
		}
	}
	if (!data?.score && steamIds?.length) data = (await fetchSteamMetacritic(steamIds)) ?? data;
	if (!data?.score && prev?.metacritic?.score) data = prev.metacritic; // 网络失败时保留上次结果
	return { data, year };
}

async function fetchMetacritic(slug) {
	const url = `https://backend.metacritic.com/composer/metacritic/pages/games/${slug}/web?&apiKey=${MC_KEY}`;
	const json = await getJson(url);
	const it = json?.components?.find((c) => c?.data?.item?.criticScoreSummary)?.data?.item;
	if (!it) return null;
	const cs = it.criticScoreSummary;
	return {
		year: it.premiereYear ?? null,
		data: {
			score: cs.score ?? null,
			reviews: cs.reviewCount ?? null,
			platform: it.platform ?? null,
			mustPlay: !!it.mustPlay,
			url: `https://www.metacritic.com/game/${slug}/`,
			source: 'metacritic',
		},
	};
}

// 只接受标题与游戏名（归一化后）一致的结果，宁可没有分数也不挂错
async function searchMetacritic(title, key) {
	const url = `https://backend.metacritic.com/finder/metacritic/search/${encodeURIComponent(title)}/web?apiKey=${MC_KEY}&offset=0&limit=10&mcoTypeId=13&componentName=search-tabs&componentDisplayName=Search+Page+Tab+Group&componentType=FilterConfig`;
	const json = await getJson(url);
	const items = (json?.data?.items ?? []).filter((i) => i.type === 'game-title');
	const exact = items.find((i) => matchKey(i.title) === key);
	if (exact) return exact.slug;
	if (title.includes(':')) {
		const main = matchKey(title.split(':')[0]);
		return items.find((i) => matchKey(i.title) === main)?.slug ?? null;
	}
	return null;
}

async function fetchSteamMetacritic(appIds) {
	for (const id of appIds) {
		try {
			const data = await getJson(`https://store.steampowered.com/api/appdetails?appids=${id}&filters=metacritic`);
			const mc = data?.[id]?.data?.metacritic;
			if (mc?.score) return { score: mc.score, reviews: null, platform: 'PC', mustPlay: false, url: mc.url ?? null, source: 'steam' };
		} catch {}
	}
	return null;
}

async function resolveCover(g, psnMatches, prev) {
	const rel = `/media/covers/${g.slug}.jpg`;
	const file = path.join(root, 'public', rel);
	if (g.cover) return g.cover; // 手动指定（public 下的路径）
	if (!force && (await exists(file))) return rel;

	const candidates = [];
	for (const id of g.steam ?? []) {
		const asset = await steamLibraryCapsule(id).catch(() => null);
		if (asset) candidates.push(asset);
		candidates.push(`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900_2x.jpg`);
		candidates.push(`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900.jpg`);
	}
	for (const t of psnMatches) {
		const pick = (type) => t.images?.find((im) => im.type === type)?.url;
		for (const type of ['PORTRAIT_BANNER', 'GAMEHUB_COVER_ART', 'MASTER']) {
			const u = pick(type);
			if (u) candidates.push(u);
		}
	}
	if (env.STEAMGRIDDB_API_KEY) {
		const u = await steamGridDbCover(g.titleEn).catch(() => null);
		if (u) candidates.push(u);
	}
	for (const url of candidates) {
		try {
			const res = await fetch(url, { headers: { 'User-Agent': UA } });
			const type = res.headers.get('content-type') ?? '';
			if (!res.ok || !type.startsWith('image/')) continue;
			const buf = Buffer.from(await res.arrayBuffer());
			if (buf.length < 8000) continue; // Steam 对缺图返回的小占位图
			// 统一裁成 2:3、压缩，避免把原图塞进仓库
			await sharp(buf).resize(600, 900, { fit: 'cover', position: 'attention' }).jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(file);
			return rel;
		} catch {}
	}
	return prev?.cover ?? null;
}

// 新版 Steam 资源路径带哈希目录，需要从商店接口取真实地址
async function steamLibraryCapsule(appid) {
	const input = { ids: [{ appid }], context: { language: 'english', country_code: 'US' }, data_request: { include_assets: true } };
	const json = await getJson(`https://api.steampowered.com/IStoreBrowseService/GetItems/v1/?input_json=${encodeURIComponent(JSON.stringify(input))}`);
	const a = json?.response?.store_items?.[0]?.assets;
	const file = a?.library_capsule_2x ?? a?.library_capsule;
	if (!a?.asset_url_format || !file) return null;
	return 'https://shared.akamai.steamstatic.com/store_item_assets/' + a.asset_url_format.replace('${FILENAME}', file);
}

async function steamGridDbCover(title) {
	const headers = { Authorization: `Bearer ${env.STEAMGRIDDB_API_KEY}` };
	const search = await getJson(`https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(title)}`, headers);
	const id = search?.data?.[0]?.id;
	if (!id) return null;
	const grids = await getJson(`https://www.steamgriddb.com/api/v2/grids/game/${id}?dimensions=600x900&types=static`, headers);
	return grids?.data?.[0]?.url ?? null;
}

// ---------- 奖项 ----------
function buildAwardIndex(db) {
	const index = new Map();
	for (const show of ['TGA', 'GJ']) {
		const grand = new Set(db.grand?.[show] ?? []);
		for (const [year, list] of Object.entries(db[show] ?? {})) {
			for (const [category, game, note] of list) {
				const key = matchKey(game);
				const arr = index.get(key) ?? [];
				arr.push({ show, year: Number(year), category, ...(note ? { note } : {}), ...(grand.has(category) ? { grand: true } : {}) });
				index.set(key, arr);
			}
		}
	}
	return index;
}

// loose=true 时额外尝试冒号前的主标题（如 “Fall Guys: Ultimate Knockout” -> “Fall Guys”），只用于自动发现的游戏
function findAwards(names, loose = false) {
	const keys = new Set();
	for (const n of names) {
		keys.add(matchKey(n));
		if (loose && n.includes(':')) keys.add(matchKey(n.split(':')[0]));
	}
	const found = [];
	const seen = new Set();
	for (const k of keys) {
		for (const a of awardIndex.get(k) ?? []) {
			const id = `${a.show}${a.year}${a.category}${a.note ?? ''}`;
			if (!seen.has(id)) { seen.add(id); found.push(a); }
		}
	}
	return found.sort(awardSort);
}

function awardSort(a, b) {
	return (b.grand ? 1 : 0) - (a.grand ? 1 : 0) || a.year - b.year || (a.show === 'TGA' ? -1 : 1);
}

// ---------- 名称处理 ----------
function matchKey(s) {
	let k = String(s ?? '')
		.replace(/[™®©]/g, ' ')
		.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/\((?:playstation\s*\d|ps\d)\)/g, ' ')
		.replace(/ps4\s*&\s*ps5/g, ' ')
		.replace(/['’‘]/g, '')
		.replace(/[^a-z0-9\u4e00-\u9fa5]+/g, ' ')
		.replace(/\b(classic|definitive|complete|goty|game of the year|deluxe|digital deluxe|standard|ultimate) edition\b/g, ' ')
		.replace(/\b(remastered|directors cut|open beta|beta|enhanced|legacy)\b/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	return awardsDb.aliases?.[k] ?? k;
}

function displayName(name) {
	return String(name)
		.replace(/[™®©](?=\S)/g, ' ')
		.replace(/[™®©]/g, '')
		.replace(/\s*\((?:PlayStation\s*\d|PS\d)\)/gi, '')
		.replace(/\s*PS4\s*&\s*PS5/gi, '')
		.replace(/\s+(Open\s+)?Beta$/i, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function matchPsn(t, g) {
	const hit = (pattern) => {
		const p = norm(pattern.replace(/^=/, ''));
		return pattern.startsWith('=') ? t.norm === p || t.altNorm === p : t.norm.includes(p) || t.altNorm.includes(p);
	};
	return g.psn.some(hit) && !(g.psnExclude ?? []).some(hit);
}

function norm(s) {
	return String(s).toLowerCase().replace(/[™®©]/g, '').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
}

function isoDurationToMinutes(d) {
	const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?/.exec(d ?? '');
	if (!m) return 0;
	return (Number(m[1] ?? 0) * 24 + Number(m[2] ?? 0)) * 60 + Number(m[3] ?? 0) + Number(m[4] ?? 0) / 60;
}

function round1(n) {
	return Math.round(n * 10) / 10;
}

async function exists(p) {
	try { await access(p); return true; } catch { return false; }
}

async function getJson(url, headers = {}) {
	const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json', ...headers } });
	if (!res.ok) throw new Error(`HTTP ${res.status} ${url.replace(/key=[^&]+/, 'key=***')}`);
	return res.json();
}

async function getText(url) {
	const res = await fetch(url, { headers: { 'User-Agent': UA } });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.text();
}

function loadDotEnv(file) {
	if (!existsSync(file)) return;
	for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
		const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
		if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
	}
}
