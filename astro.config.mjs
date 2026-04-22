// @ts-check
// 【文件作用】Astro 项目的主配置文件，控制整个网站的构建行为、集成插件和 Starlight 主题设置。

// 从 Astro 核心包导入 defineConfig 辅助函数，用于提供配置项的类型检查和补全
import { defineConfig } from 'astro/config';
// 导入 Starlight 插件，用于将 Astro 变成一个文档/博客站点
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	// 网站的正式部署地址，用于生成 sitemap 和规范 URL
	site: 'https://www.theo99.me/',

	// integrations：注册 Astro 集成插件，这里启用 Starlight 主题
	integrations: [
		starlight({
			// 显示在网站顶部导航栏的标题
			title: {
				en: "Theo's Portfolio",
				'zh-CN': 'Theo 的个人网站',
			},

			// locales：启用中英文双语路由
			// root 表示默认语言直接使用根路径；英文内容放在 src/content/docs/en/ 下
			defaultLocale: 'root',
			locales: {
				root: {
					label: '简体中文',
					lang: 'zh-CN',
				},
				en: {
					label: 'English',
					lang: 'en',
				},
			},

			// customCss：引入自定义样式文件，覆盖默认 Starlight 外观
			customCss: ['./src/styles/custom-theme.css'],

			// markdown：控制 Markdown 内容的渲染行为
			markdown: {
				// 全局关闭标题旁边的锚点链接图标
				headingLinks: false,
			},

			// tableOfContents：关闭右侧目录，使主内容区域更接近作品集/简历版式
			tableOfContents: false,

			// pagination：关闭文档式上一页/下一页导航
			pagination: false,

			// components：覆写 Starlight 内置组件，替换为自定义布局部件
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

			// social：配置显示在页面页脚或导航栏的社交媒体链接
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/TheoCKG/Something-About-Theo',
				},
			],

			// sidebar：定义网站左侧边栏的导航结构
			// 每个对象是一个分组，label 是分组标题，items 是该分组下的页面链接
			sidebar: [
				{
					// 第一个侧边栏分组：个人经历
					label: '个人经历',
					items: [
						// slug 对应 src/content/docs/ 下的文件路径（不含扩展名）
						{ label: '工作经历', slug: 'experience/work-experience' },
						{ label: '教育经历', slug: 'experience/education' },
						{ label: '项目经历', slug: 'experience/projects' },
					],
				},
				{
					// 第二个侧边栏分组：个人博客
					label: '个人博客',
					items: [
						{ label: '博客导航', slug: 'blog' },
						{
							label: '游戏拆解',
							// autogenerate：自动扫描指定目录下的所有 .md/.mdx 文件并生成链接列表
							autogenerate: { directory: 'blog/game-breakdown' },
						},
						{
							label: '游戏鉴赏',
							autogenerate: { directory: 'blog/game-appreciation' },
						},
						{
							label: '电影锐评',
							autogenerate: { directory: 'blog/movie-critique' },
						},
						{
							label: '学习笔记',
							autogenerate: { directory: 'blog/study-notes' },
						},
					],
				},
			],
		}),
	],
});
