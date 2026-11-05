// 游戏卡片数据：把文章元数据（breakdowns.ts）和同步结果（games.json，由 scripts/sync-games.mjs 生成）合成一份。
import { breakdowns } from './breakdowns';
import synced from './games.json';

export type AwardShow = 'TGA' | 'GJ';
export interface Award {
	show: AwardShow;
	year: number;
	category: string;
	grand?: boolean;
}
export interface Metacritic {
	score: number | null;
	reviews: number | null;
	platform: string | null;
	mustPlay: boolean;
	url: string | null;
	source: string;
}
export type Tier = 'grand' | 'award' | 'none';

export interface GameCard {
	slug: string;
	game: string;
	titleEn: string;
	articleTitle: string;
	category: string;
	summary: string;
	year: number | null;
	href: string;
	cover: string | null;
	mc: Metacritic | null;
	hours: number | null;
	hourSources: Record<string, number>;
	sharedPlaytime: boolean;
	awards: Award[];
	tier: Tier;
	tgaCount: number;
	gjCount: number;
	grandAwards: Award[];
}

interface SyncedGame {
	slug: string;
	titleEn: string;
	year: number;
	awards: Award[];
	metacritic: Metacritic | null;
	playtime: { hours: number | null; sources: Record<string, number>; shared?: boolean };
	cover: string | null;
}

const bySlug = new Map((synced.games as SyncedGame[]).map((g) => [g.slug, g]));

export const AWARD_LABEL: Record<AwardShow, string> = { TGA: 'TGA', GJ: '金摇杆' };
export const AWARD_FULL: Record<AwardShow, string> = { TGA: 'The Game Awards', GJ: 'Golden Joystick Awards' };

export const gameCards: GameCard[] = breakdowns.map((b) => {
	const s = bySlug.get(b.slug);
	const awards = s?.awards ?? [];
	const grandAwards = awards.filter((a) => a.grand);
	return {
		slug: b.slug,
		game: b.game,
		titleEn: s?.titleEn ?? b.game,
		articleTitle: b.title,
		category: b.category,
		summary: b.summary,
		year: s?.year ?? null,
		href: `/blog/game-breakdown/${b.slug}/`,
		cover: s?.cover ?? null,
		mc: s?.metacritic?.score != null ? s.metacritic : null,
		hours: s?.playtime?.hours ?? null,
		hourSources: s?.playtime?.sources ?? {},
		sharedPlaytime: !!s?.playtime?.shared,
		awards,
		tier: grandAwards.length ? 'grand' : awards.length ? 'award' : 'none',
		tgaCount: awards.filter((a) => a.show === 'TGA').length,
		gjCount: awards.filter((a) => a.show === 'GJ').length,
		grandAwards,
	};
});

export const getGameCard = (slug: string) => gameCards.find((g) => g.slug === slug);

export const syncedAt: string = synced.syncedAt;

/** Metacritic 的配色规则：75+ 绿，50–74 黄，<50 红 */
export const mcTone = (score: number | null | undefined) =>
	score == null ? 'none' : score >= 75 ? 'good' : score >= 50 ? 'mixed' : 'bad';

export const formatHours = (h: number | null) =>
	h == null ? null : h >= 100 ? Math.round(h).toLocaleString('en-US') : String(Math.round(h * 10) / 10);

export const CATEGORY_HUE: Record<string, string> = {
	动作与战斗: '#ff6a3d',
	开放世界与叙事: '#45b8ff',
	射击与团队: '#d7ff3f',
	协作与独立体验: '#c8a2ff',
};

export const sourceLabel: Record<string, string> = { steam: 'Steam', psn: 'PlayStation', manual: '手动记录' };
