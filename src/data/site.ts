// 站点结构：顶部导航按履历顺序 教育 → 工作 → 游戏 → 项目 → 博客。
//   教育 / 工作 / 项目：内容不多，完整写在首页对应区块（/#education、/#experience、/#projects），不另开页面
//   游戏 /blog/game-breakdown   玩过的游戏 + 设计拆解（条目多，独立页面）
//   博客 /blog                  拆解以外的文字：设计笔记、测评、影评（独立页面）

export const stripLocale = (pathname: string) => pathname.replace(/^\/en(?=\/|$)/, '').replace(/\/+$/, '') || '/';
export const isEnglishPath = (pathname: string) => pathname === '/en' || pathname.startsWith('/en/');

export const LANDING_PATHS = ['/', '/blog', '/blog/game-breakdown'];
export const isLanding = (pathname: string) => LANDING_PATHS.includes(stripLocale(pathname));

export interface NavItem {
	zh: string;
	en: string;
	/** 首页内的区块 id；有值时链接为 /#id，首页上随滚动高亮 */
	anchor?: string;
	/** 独立页面路径 */
	href?: string;
	match?: (p: string) => boolean;
	/** 只有中文版本 */
	zhOnly?: boolean;
	/** 首页上对应的区块 id，用于滚动高亮（独立页面的栏目在首页也有精选区块） */
	spy?: string;
}

export const NAV: NavItem[] = [
	{ zh: '教育', en: 'Education', anchor: 'education' },
	{ zh: '工作', en: 'Experience', anchor: 'experience' },
	{ zh: '游戏', en: 'Games', href: '/blog/game-breakdown', match: (p) => p.startsWith('/blog/game-breakdown'), zhOnly: true, spy: 'games' },
	{ zh: '项目', en: 'Projects', anchor: 'projects' },
	{ zh: '博客', en: 'Blog', href: '/blog', match: (p) => p.startsWith('/blog') && !p.startsWith('/blog/game-breakdown'), spy: 'blog' },
];

// 博客：按目录归类（“游戏拆解”不在这里，它属于游戏库）
export const WRITING_TYPES: { dir: string; zh: string; en: string }[] = [
	{ dir: 'blog/study-notes', zh: '设计笔记', en: 'Design notes' },
	{ dir: 'blog/game-appreciation', zh: '游戏测评', en: 'Game reviews' },
	{ dir: 'blog/movie-critique', zh: '影评', en: 'Film' },
];
