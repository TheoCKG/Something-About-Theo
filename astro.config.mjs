// @ts-check
// 【文件作用】Astro 项目的主配置文件，控制整个网站的构建行为、集成插件和 Starlight 主题设置。
// 站点栏目结构见 src/data/site.ts：作品 /work、游戏库 /blog/game-breakdown、文章 /blog、关于 /about。

import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	// 网站的正式部署地址，用于生成 sitemap 和规范 URL
	site: 'https://www.theo99.me/',

	// redirects：2026-11 栏目重构后，旧地址跳到新位置，避免外部链接失效
	redirects: {
		'/experience': '/about/',
		'/experience/work-experience': '/about/',
		'/experience/education': '/about/',
		'/experience/projects': '/work/',
		'/blog/blog-home': '/blog/',
		'/blog/study-notes': '/blog/',
		'/blog/game-appreciation': '/blog/',
		'/blog/movie-critique': '/blog/',
		'/en/experience': '/en/about/',
		'/en/experience/work-experience': '/en/about/',
		'/en/experience/education': '/en/about/',
		'/en/experience/projects': '/en/work/',
		'/en/blog/blog-home': '/en/blog/',
		'/en/blog/study-notes': '/en/blog/',
		'/en/blog/game-appreciation': '/en/blog/',
		'/en/blog/movie-critique': '/en/blog/',
	},

	integrations: [
		starlight({
			title: {
				en: "Theo's Portfolio",
				'zh-CN': 'Theo 的个人网站',
			},

			// 中英文双语：root 为中文，英文内容放在 src/content/docs/en/ 下
			defaultLocale: 'root',
			locales: {
				root: { label: '简体中文', lang: 'zh-CN' },
				en: { label: 'English', lang: 'en' },
			},

			customCss: ['./src/styles/custom-theme.css'],
			markdown: { headingLinks: false },
			tableOfContents: false,
			pagination: false,

			// 覆写 Starlight 内置组件：整站外框、导航、页脚都在 PageFrame.astro
			components: {
				PageFrame: './src/components/layout/PageFrame.astro',
				TwoColumnContent: './src/components/layout/TwoColumnContent.astro',
				Header: './src/components/layout/Header.astro',
				Sidebar: './src/components/layout/Sidebar.astro',
				PageSidebar: './src/components/layout/PageSidebar.astro',
				ContentPanel: './src/components/layout/ContentPanel.astro',
				PageTitle: './src/components/layout/PageTitle.astro',
				MarkdownContent: './src/components/layout/MarkdownContent.astro',
				Footer: './src/components/layout/Footer.astro',
			},

			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/TheoCKG/Something-About-Theo' }],

			// 页面不显示侧边栏，这里只用于 Starlight 生成页面索引
			sidebar: [
				{ label: '作品', slug: 'work' },
				{ label: '游戏库', autogenerate: { directory: 'blog/game-breakdown' } },
				{ label: '文章', autogenerate: { directory: 'blog/study-notes' } },
				{ label: '关于', slug: 'about' },
			],
		}),
	],
});
