#!/usr/bin/env node
// 同步游戏卡片数据：src/data/games.manual.json + 各平台 API -> src/data/games.json，封面下载到 public/media/covers/。
//
// 数据源（按优先级）：
//   Metacritic 评分  : Metacritic 网站前端使用的 backend 接口（非官方，无需申请）-> 失败时退回 Steam appdetails 里的 metacritic 字段
//   游玩时长 Steam   : STEAM_API_KEY 存在时调用 IPlayerService/GetOwnedGames；否则只能读公开资料页里的“最常玩”一款
//   游玩时长 PSN     : PSN_NPSSO 存在时用 psn-api 的 getUserPlayedGames（PS4/PS5，PS3 拿不到）
//   封面             : public/media/covers/<slug>.jpg 已存在且未 --force 时跳过；
//                      否则 Steam 600x900 -> PSN 竖版封面 -> SteamGridDB(STEAMGRIDDB_API_KEY) -> 无封面（前端用排版海报兜底）
//
// 用法：
//   npm run sync:games            # 读取 .env（如有）后同步
//   npm run sync:games -- --force # 重新下载所有封面
//
// 环境变量放在仓库根目录 .env（已被 .gitignore 忽略）或 GitHub Actions Secrets：
//   STEAM_API_KEY, PSN_NPSSO, STEAMGRIDDB_API_KEY（可选）, METACRITIC_API_KEY（可选，覆盖默认值）

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manualPath = path.join(root, 'src/data/games.manual.json');
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
const previous = existsSync(outPath) ? JSON.parse(await readFile(outPath, 'utf8')) : { games: [] };
const prevBySlug = new Map(previous.games.map((g) => [g.slug, g]));
await mkdir(coverDir, { recursive: true });

// ---------- Steam ----------
const steamId = manual.profile?.steamId;
let steamOwned = null; // Map<appid, minutes>
let steamMode = 'none';
if (steamId && env.STEAM_API_KEY) {
	try {
		const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${env.STEAM_API_KEY}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`;
		const data = await getJson(url);
		const list = data?.response?.games ?? [];
		if (!list.length) warn('Steam 返回 0 款游戏：请确认 Steam 隐私设置里“游戏详情”为公开。');
		steamOwned = new Map(list.map((g) => [g.appid, g.playtime_forever ?? 0]));
		steamMode = 'api';
		log(`Steam: ${list.length} 款游戏`);
	} catch (e) {
		warn('Steam API 失败：', e.message);
	}
}
if (!steamOwned && steamId) {
	// 无 key 兜底：公开资料页 XML 只给“最常玩游戏”
	try {
		const xml = await getText(`https://steamcommunity.com/profiles/${steamId}/?xml=1`);
		steamOwned = new Map();
		for (const m of xml.matchAll(/<mostPlayedGame>([\s\S]*?)<\/mostPlayedGame>/g)) {
			const id = Number(m[1].match(/app\/(\d+)/)?.[1]);
			const hours = Number((m[1].match(/<hoursOnRecord>([^<]+)<\/hoursOnRecord>/)?.[1] ?? '0').replace(/,/g, ''));
			if (id) steamOwned.set(id, Math.round(hours * 60));
		}
		steamMode = 'profile';
		log(`Steam: 未配置 STEAM_API_KEY，只从公开资料页读到 ${steamOwned.size} 款最常玩游戏`);
	} catch (e) {
		warn('Steam 公开资料页读取失败：', e.message);
	}
}

// ---------- PSN ----------
let psnTitles = null; // [{ name, norm, minutes, images }]
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

// ---------- 逐个游戏 ----------
const out = [];
for (const g of manual.games) {
	const prev = prevBySlug.get(g.slug);
	const item = {
		slug: g.slug,
		titleEn: g.titleEn,
		year: g.year,
		steam: g.steam ?? [],
		awards: (g.awards ?? []).slice().sort(awardSort),
	};

	// Metacritic
	item.metacritic = await fetchMetacritic(g.metacritic).catch((e) => {
		warn(`${g.slug}: Metacritic 失败 ${e.message}`);
		return null;
	});
	if (!item.metacritic?.score && g.steam?.length) {
		item.metacritic = (await fetchSteamMetacritic(g.steam)) ?? item.metacritic;
	}
	if (g.metacriticOverride) item.metacritic = { ...(item.metacritic ?? {}), ...g.metacriticOverride, source: 'manual' };
	if (!item.metacritic?.score && prev?.metacritic?.score) item.metacritic = prev.metacritic; // 网络失败时保留上次结果

	// 时长
	const sources = {};
	if (steamOwned && g.steam?.length) {
		const minutes = g.steam.reduce((sum, id) => sum + (steamOwned.get(id) ?? 0), 0);
		if (minutes > 0) sources.steam = round1(minutes / 60);
	}
	let psnMatches = [];
	if (psnTitles && g.psn?.length) {
		psnMatches = psnTitles.filter((t) => matchPsn(t, g));
		const minutes = psnMatches.reduce((s, t) => s + t.minutes, 0);
		if (minutes > 0) sources.psn = round1(minutes / 60);
	}
	if (typeof g.hours === 'number') sources.manual = g.hours;
	// 某个来源本次没拿到（没配 key / 接口失败）时，沿用上次同步结果
	for (const key of ['steam', 'psn']) {
		const stale = key === 'steam' ? steamMode !== 'api' : !psnTitles;
		if (sources[key] == null && stale && prev?.playtime?.sources?.[key] != null) sources[key] = prev.playtime.sources[key];
	}
	const total = typeof g.hoursOverride === 'number' ? g.hoursOverride : Object.values(sources).reduce((a, b) => a + b, 0);
	item.playtime = { hours: total > 0 ? round1(total) : null, sources, shared: psnMatches.some((t) => /collection|合集/i.test(t.name)) };

	// 封面
	item.cover = await resolveCover(g, psnMatches, prev);
	out.push(item);
	log(`${g.slug.padEnd(30)} MC ${String(item.metacritic?.score ?? '—').padStart(3)}  时长 ${String(item.playtime.hours ?? '—').padStart(6)} h  奖项 ${item.awards.length}  封面 ${item.cover ? '✓' : '—'}`);
}

const result = {
	$comment: '由 scripts/sync-games.mjs 生成，请勿手改；要改数据请编辑 games.manual.json 后重新运行 npm run sync:games',
	syncedAt: new Date().toISOString(),
	sources: { steam: steamMode, psn: psnTitles ? 'api' : (previous.sources?.psn ?? 'none') },
	games: out,
};
await writeFile(outPath, JSON.stringify(result, null, '\t') + '\n');
log(`写入 ${path.relative(root, outPath)}（${out.length} 款）`);

// ================= helpers =================
async function fetchMetacritic(slug) {
	if (!slug) return null;
	const url = `https://backend.metacritic.com/composer/metacritic/pages/games/${slug}/web?&apiKey=${MC_KEY}`;
	const data = await getJson(url);
	const it = data?.components?.find((c) => c?.data?.item?.criticScoreSummary)?.data?.item;
	if (!it) return null;
	const cs = it.criticScoreSummary;
	return {
		score: cs.score ?? null,
		reviews: cs.reviewCount ?? null,
		platform: it.platform ?? null,
		mustPlay: !!it.mustPlay,
		url: `https://www.metacritic.com/game/${slug}/`,
		source: 'metacritic',
	};
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
		candidates.push(`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900_2x.jpg`);
		candidates.push(`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900.jpg`);
	}
	for (const t of psnMatches) {
		const pick = (type) => t.images.find((im) => im.type === type)?.url;
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
			// 统一裁成 2:3、压缩，避免把 300KB 的原图塞进仓库
			await sharp(buf).resize(600, 900, { fit: 'cover', position: 'attention' }).jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(file);
			return rel;
		} catch {}
	}
	return prev?.cover ?? null;
}

async function steamGridDbCover(title) {
	const headers = { Authorization: `Bearer ${env.STEAMGRIDDB_API_KEY}` };
	const search = await getJson(`https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(title)}`, headers);
	const id = search?.data?.[0]?.id;
	if (!id) return null;
	const grids = await getJson(`https://www.steamgriddb.com/api/v2/grids/game/${id}?dimensions=600x900&types=static`, headers);
	return grids?.data?.[0]?.url ?? null;
}

function matchPsn(t, g) {
	const hit = (pattern) => {
		const p = norm(pattern.replace(/^=/, ''));
		return pattern.startsWith('=') ? t.norm === p || t.altNorm === p : t.norm.includes(p) || t.altNorm.includes(p);
	};
	return g.psn.some(hit) && !(g.psnExclude ?? []).some(hit);
}

function awardSort(a, b) {
	return (b.grand ? 1 : 0) - (a.grand ? 1 : 0) || a.year - b.year || (a.show === 'TGA' ? -1 : 1);
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
