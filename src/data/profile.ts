// 履历的唯一数据源。首页按 教育 → 工作 → 游戏 → 项目 → 博客 的顺序排列，教育 / 工作 / 项目都只在首页出现一次。
// 内容来自原 experience/*.mdx（2026-11 重构时迁移，文字未改写）。
//   education：教育经历
//   works：项目，job 字段有值的是工作经历（公司 + 职位），没有的是课程 / 训练营项目

export type Lang = 'zh' | 'en';
type T = Record<Lang, string>;

export interface WorkItem {
	id: string;
	art: 'reaper' | 'npc' | 'movement' | 'rift' | 'text';
	period: string;
	kind: T; // 项目类型：职业 / 课程 / 训练营
	title: T;
	context: T;
	summary: T;
	role: T;
	tags: string;
	honor?: T;
	points: Record<Lang, string[]>;
	featured?: boolean;
	job?: { org: T; position: T; start: string }; // 有值 = 工作经历
}

export const works: WorkItem[] = [
	{
		id: 'monster-reaper',
		art: 'reaper',
		period: '2026.01 – 2026.04',
		kind: { zh: '训练营项目', en: 'Training camp' },
		title: { zh: 'Monster Reaper', en: 'Monster Reaper' },
		context: { zh: '腾讯星跃训练营', en: 'Tencent Starry Leap Camp' },
		summary: { zh: '横版 2D ACT + 肉鸽游戏，探索动作游戏与肉鸽元素的结合方式。', en: 'A fast-paced 2D action game built around roguelike progression.' },
		role: { zh: '怪物制作、镜头死区等参数调整、移动手感调整', en: 'Enemy creation, camera dead-zone tuning, and movement feel' },
		tags: 'COMBAT / CAMERA / GAME FEEL',
		points: { zh: [], en: [] },
		featured: true,
	},
	{
		id: 'ai-npc',
		art: 'npc',
		period: '2023 – 2024',
		kind: { zh: '职业项目 · 元绎娱乐', en: 'Professional · YuanYi Entertainment' },
		job: { org: { zh: '元绎娱乐', en: 'YuanYi Entertainment' }, position: { zh: 'AI 策划', en: 'AI Designer' }, start: '2023' },
		title: { zh: '会回应的游戏世界', en: 'A world that responds' },
		context: { zh: '元绎娱乐 · AI 策划', en: 'YuanYi Entertainment · AI Designer' },
		summary: { zh: '由 UE5 + LLM 驱动的 AI NPC 模拟世界，游戏对象基于大模型自主感知、决策、行动。', en: 'A UE5 + LLM driven world where game objects perceive, decide, and act on their own.' },
		role: { zh: '游戏对象数据结构、NPC 行为与感知、动画融合、Lua 脚本与多端通信', en: 'Object data structures, NPC behaviors and perception, animation blending, Lua scripting' },
		tags: 'PERCEPTION / BEHAVIOR / LUA',
		honor: { zh: '2023 年“优秀员工”', en: 'Outstanding Employee, 2023' },
		points: {
			zh: [
				'负责 3 种游戏对象（NPC、物品、区域）的数据结构设计。设计属性、标签管理架构，实现对象高度自定义化并维护配置表。',
				'设计 NPC 的 TALK、MOVE、DOING 这 3 种游戏行为。撰写 AI 提示词，规定大语言模型、游戏服务器与客户端之间的通信参数；制作相应客户端表现。',
				'设计 NPC 基于 7 个身体部位 + 3 级优先级的动画融合方案，提高动作资源复用率；构建并维护动作库中 2700+ 动作资源，提升 NPC 动作表现验证效率；维护相关配置表。',
				'基于物理建模设计了 NPC 的听觉、嗅觉 2 大感知模型，为 LLM 提供标准化的 NPC 感知输入。设计感知事件对游戏对象行为事件的触发规则。',
				'负责维护 3 种游戏对象的 Lua 脚本，在脚本中调用接口进行多个游戏对象之间的通信；以及进行客户端、游戏服务器、大语言模型三者之间的通信。',
				'设计由大语言模型驱动游戏对象行为的多分支任务流程，打通“玩家交互→大语言模型决策→NPC/物品行为触发”的完整闭环；制作 4 支技术 DEMO 视频，展示 AI 动态叙事能力，助力公司获得二轮千万美元级别融资。',
			],
			en: [
				'Worked on a UE5 + LLM driven project and designed NPC data structures and behaviors.',
				'Designed NPC behavior states such as Talk, Move, and Doing, plus hearing and smell perception models.',
			],
		},
		featured: true,
	},
	{
		id: 'combat',
		art: 'movement',
		period: '2022 – 2023',
		kind: { zh: '职业项目 · 祖龙娱乐', en: 'Professional · Archosaur Games' },
		job: { org: { zh: '祖龙娱乐', en: 'Archosaur Games' }, position: { zh: '战斗策划', en: 'Combat Designer' }, start: '2022' },
		title: { zh: '动作与战斗机制', en: 'Movement & combat' },
		context: { zh: '祖龙娱乐 · 战斗策划', en: 'Archosaur Games · Combat Designer' },
		summary: { zh: '三人小队，英雄技能 + 动作射击类 FPS/TPS 大逃杀。', en: 'A three-player squad hero shooter (FPS/TPS battle royale).' },
		role: { zh: '跑酷动作、统一运动规则、局内互动元素、英雄技能设计', en: 'Parkour actions, movement rules, interactive elements, hero abilities' },
		tags: 'MOVEMENT / HEROES / COMBAT',
		honor: { zh: '2022 年“最佳新人”', en: 'Best Newcomer, 2022' },
		points: {
			zh: [
				'独立完成 5 个跑酷动作的策划设计，设计触发规则及动作表现，提升了跑酷体验的流畅性与连贯性；持续跟进动作表现，包括优化动作融合效果，完善触发参数配置，改进动作镜头表现，维护动作、音效、特效资源配置等。',
				'设计统一的运动规则，修改行走与奔跑状态、起跳与落地状态、受击状态下的移动速度变化规则，优化了移动体验。',
				'负责 2 种局内可互动元素的设计：门、墙壁滑道，设计互动规则、美术表现、网络同步规则等，丰富局内玩法。',
				'主导 2 名英雄的战斗定位、技能机制、美术风格参数的设计，技能设计涵盖数值、动作表现、特效音效等。',
			],
			en: [
				'Designed combat and movement systems for an FPS/TPS hero shooter project.',
				'Contributed to parkour actions, movement rules, and hero skill design.',
			],
		},
		featured: true,
	},
	{
		id: 'rift',
		art: 'rift',
		period: '2025.10',
		kind: { zh: '课程项目', en: 'Course project' },
		title: { zh: '裂隙奇兵', en: 'Rift Vanguard' },
		context: { zh: '清华《互动媒体制作工作坊（基础）》', en: 'Tsinghua interactive media workshop' },
		summary: { zh: '轻 RTS + 类背包管理的 PVE 自走棋游戏，合理配置每一行的领主单位来召唤特性各异的兵种，对抗多波次敌人。', en: 'A strategy project combining RTS, inventory management, and PVE auto-battle loops.' },
		role: { zh: '参与玩法及系统设计；负责数值设计', en: 'Gameplay and systems design; numbers design' },
		tags: 'SYSTEMS / BALANCE / AUTO-BATTLER',
		honor: { zh: '2025 年秋季课程银奖', en: 'Silver award, Fall 2025' },
		points: { zh: [], en: [] },
	},
	{
		id: 'project-text',
		art: 'text',
		period: '2021.09 – 2021.12',
		kind: { zh: '公开课项目', en: 'Course project' },
		title: { zh: 'Project tEXt', en: 'Project tEXt' },
		context: { zh: '腾讯游戏策划公开课', en: 'Tencent Game Design Course' },
		summary: { zh: '以中文文字为平台的 2D 平台跳跃解谜游戏，以手动输入文字为解谜的主要手段。', en: 'A text-driven 2D platform puzzle game where typing words is the main way to solve puzzles.' },
		role: { zh: '关卡策划 / 测试：反复测试迭代关卡设计，调整难度到合理范围，完善边界情况设计', en: 'Level design and testing: iterating levels, tuning difficulty, covering edge cases' },
		tags: 'LEVEL DESIGN / PUZZLE',
		honor: { zh: '2021 年腾讯游戏策划公开课金奖', en: 'Gold award, 2021' },
		points: { zh: [], en: [] },
	},
];

export const jobs = works.filter((w) => w.job);
export const projects = works.filter((w) => !w.job);

export interface EducationItem {
	id: string;
	start: string;
	period: T;
	school: T;
	degree: T;
	notes: Record<Lang, string[]>;
	projectIds?: string[]; // 在校期间做的项目，链接到项目经历
}

export const education: EducationItem[] = [
	{
		id: 'tsinghua',
		start: '2025',
		period: { zh: '2025 — 至今', en: '2025 — Present' },
		school: { zh: '清华大学', en: 'Tsinghua University' },
		degree: { zh: '互动媒体设计与技术 · 硕士在读', en: 'M.S. · Interactive Media Design & Technology' },
		notes: { zh: [], en: [] },
		projectIds: ['rift'],
	},
	{
		id: 'pku',
		start: '2018',
		period: { zh: '2018 — 2022', en: '2018 — 2022' },
		school: { zh: '北京大学', en: 'Peking University' },
		degree: { zh: '光华管理学院 · 市场营销本科', en: 'Guanghua School of Management · B.A. Marketing' },
		notes: { zh: ['以 2018 年重庆市高考理科第 6 名获北京大学新生奖学金'], en: ['Freshman scholarship (6th in Chongqing science gaokao, 2018)'] },
	},
];

export const RESUME_HREF = '/张文韬_战斗策划_清华大学_18523868820.pdf';
export const GITHUB_HREF = 'https://github.com/TheoCKG';
