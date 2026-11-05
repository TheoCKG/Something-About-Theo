// 站点结构：顶部导航 = 四个一级栏目，每个栏目一个落地页；首页按同样顺序给每个栏目一个预览。
//   作品 /work            做过的项目（职业 + 课程 + 训练营）
//   游戏库 /blog/game-breakdown   玩过的游戏 + 设计拆解
//   文章 /blog            拆解以外的文字：设计笔记、测评、影评
//   关于 /about           经历时间线 + 联系方式

export const stripLocale = (pathname: string) => pathname.replace(/^\/en(?=\/|$)/, '').replace(/\/+$/, '') || '/';
export const isEnglishPath = (pathname: string) => pathname === '/en' || pathname.startsWith('/en/');

export const LANDING_PATHS = ['/', '/work', '/about', '/blog', '/blog/game-breakdown'];
export const isLanding = (pathname: string) => LANDING_PATHS.includes(stripLocale(pathname));

export const NAV = [
	{ href: '/work', zh: '作品', en: 'Work', match: (p: string) => p.startsWith('/work') },
	{ href: '/blog/game-breakdown', zh: '游戏库', en: 'Games', match: (p: string) => p.startsWith('/blog/game-breakdown'), zhOnly: true },
	{ href: '/blog', zh: '文章', en: 'Writing', match: (p: string) => p.startsWith('/blog') && !p.startsWith('/blog/game-breakdown') },
	{ href: '/about', zh: '关于', en: 'About', match: (p: string) => p.startsWith('/about') },
];

// 文章页：按目录归类（“游戏拆解”不在这里，它属于游戏库）
export const WRITING_TYPES: { dir: string; zh: string; en: string }[] = [
	{ dir: 'blog/study-notes', zh: '设计笔记', en: 'Design notes' },
	{ dir: 'blog/game-appreciation', zh: '游戏测评', en: 'Game reviews' },
	{ dir: 'blog/movie-critique', zh: '影评', en: 'Film' },
];
