// Source: 游戏拆解分析/37款游戏拆解案/00_总目录.md (2026-09-20).
// Article claims and version limits remain in the individual imported articles.
export interface Breakdown {
	slug: string;
	title: string;
	game: string;
	category: string;
	summary: string;
	image: string;
	imageKind?: 'screenshot' | 'diagram';
	imageAlt?: string;
}

export const breakdowns: Breakdown[] = [
	{
		"slug": "monster-hunter-world",
		"title": "怪物猎人：世界：狩猎如何把动作知识变成对局势的掌控",
		"game": "怪物猎人：世界",
		"category": "动作与战斗",
		"summary": "武器、部位、动作承诺与生态怎样共同建立狩猎掌控感？",
		"image": "/media/games/monster-hunter-world.jpg",
		"imageKind": "screenshot",
		"imageAlt": "猎人骑乘蛮颚龙头部，展示近身战斗中的体型、站位与动作关系。"
	},
	{
		"slug": "bloodborne",
		"title": "血源诅咒：恐惧为什么会把玩家推向敌人",
		"game": "血源诅咒",
		"category": "动作与战斗",
		"summary": "恐惧、抢回血、枪反与变形武器怎样推动有条件的进攻？",
		"image": "/media/breakdowns/bloodborne.png"
	},
	{
		"slug": "black-myth-wukong",
		"title": "黑神话：悟空：怎样把神魔奇观变成玩家亲手赢下的一场战斗",
		"game": "黑神话：悟空",
		"category": "动作与战斗",
		"summary": "棍势、法术、Boss与神魔演出怎样兑现亲手取胜的体验？",
		"image": "/media/breakdowns/black-myth-wukong.png"
	},
	{
		"slug": "sekiro",
		"title": "只狼：主动进攻怎样成为读取敌人的方法",
		"game": "只狼",
		"category": "动作与战斗",
		"summary": "生命、架势与敌人回应怎样让进攻成为读取对手的方法？",
		"image": "/media/games/sekiro.jpg",
		"imageKind": "screenshot",
		"imageAlt": "狼与僧人敌人近身交锋，画面包含敌方长柄武器、玩家跳跃动作与义手斧。"
	},
	{
		"slug": "the-witcher-3",
		"title": "《巫师 3》：当杀怪变成理解人，任务怎样产生分量",
		"game": "巫师3",
		"category": "开放世界与叙事",
		"summary": "调查、选择、准备与战斗怎样让一份猎魔委托产生分量？",
		"image": "/media/breakdowns/the-witcher-3.png"
	},
	{
		"slug": "gta-v",
		"title": "《GTA 5》：一座任你惹事的城市，为何又需要严格导演",
		"game": "GTA5",
		"category": "开放世界与叙事",
		"summary": "城市规则、三主角与导演式任务怎样组织犯罪冒险？",
		"image": "/media/breakdowns/gta-v.png"
	},
	{
		"slug": "god-of-war-3",
		"title": "战神3：巨大奇观怎样变成一次有因果的亲手弑神",
		"game": "战神3",
		"category": "动作与战斗",
		"summary": "群战、武器、镜头与处决怎样把巨大奇观变成亲手完成的动作？",
		"image": "/media/breakdowns/god-of-war-3.png"
	},
	{
		"slug": "nioh",
		"title": "仁王：精力管理怎样从等待恢复变成主动争取进攻",
		"game": "仁王",
		"category": "动作与战斗",
		"summary": "残心、架势、敌人精力与装备怎样组织持续进攻？",
		"image": "/media/breakdowns/nioh.png"
	},
	{
		"slug": "nioh-2",
		"title": "仁王2：怎样把敌人的危险转成自己的战斗资源",
		"game": "仁王2",
		"category": "动作与战斗",
		"summary": "妖反、魂核与常暗怎样把危险接入玩家的资源循环？",
		"image": "/media/breakdowns/nioh-2.png"
	},
	{
		"slug": "monster-hunter-rise",
		"title": "怪物猎人崛起：高机动如何重新分配一次狩猎中的主动权",
		"game": "怪物猎人：崛起",
		"category": "动作与战斗",
		"summary": "翔虫、受身、虫技与御龙怎样重新分配狩猎主动权？",
		"image": "/media/breakdowns/monster-hunter-rise.png"
	},
	{
		"slug": "apex-legends",
		"title": "APEX：英雄如何让一场枪战拥有第二次机会",
		"game": "APEX",
		"category": "射击与团队",
		"summary": "英雄能力、移动、标记与大逃杀压力怎样给小队重组机会？",
		"image": "/media/games/apex-legends.jpg",
		"imageKind": "screenshot",
		"imageAlt": "第一人称视角下的技能视觉效果与近处角色，周围建筑提供高低与遮挡关系。"
	},
	{
		"slug": "valorant",
		"title": "无畏契约：英雄技能怎样把一次进点变成有组织的冒险",
		"game": "无畏契约",
		"category": "射击与团队",
		"summary": "信息、烟雾、进点与补枪怎样让英雄能力服务战术执行？",
		"image": "/media/breakdowns/valorant.png"
	},
	{
		"slug": "overwatch",
		"title": "守望先锋：让不同英雄以不同方式赢得同一场团战",
		"game": "守望先锋",
		"category": "射击与团队",
		"summary": "不同英雄怎样以不同操作共同争夺空间、时间与目标？",
		"image": "/media/breakdowns/overwatch.png"
	},
	{
		"slug": "the-division",
		"title": "全境封锁 1：为什么拿到装备以后，紧张才真正开始",
		"game": "全境封锁1",
		"category": "射击与团队",
		"summary": "掩体战斗、战利品、暗区撤离与城市氛围怎样制造持续紧张？",
		"image": "/media/breakdowns/the-division.png"
	},
	{
		"slug": "the-division-2",
		"title": "全境封锁 2：怎样让一块安全掩体逐渐变得不安全",
		"game": "全境封锁2",
		"category": "射击与团队",
		"summary": "敌人分工、功能弱点与构筑怎样让安全掩体逐渐失效？",
		"image": "/media/games/the-division-2.jpg",
		"imageKind": "screenshot",
		"imageAlt": "带游戏 HUD 的多人交火画面，能同时看到掩体、敌人、队友与空中无人机。"
	},
	{
		"slug": "ghost-of-tsushima",
		"title": "对马岛之魂：怎样让玩家的刀既致命，又值得反复使用",
		"game": "对马岛之魂",
		"category": "动作与战斗",
		"summary": "架势、破防、决心与战鬼能力怎样维持刀剑的致命感？",
		"image": "/media/breakdowns/ghost-of-tsushima.png"
	},
	{
		"slug": "genshin-impact",
		"title": "原神：让喜欢的角色，成为探索世界与理解战斗的同一种语言",
		"game": "原神",
		"category": "动作与战斗",
		"summary": "元素、队伍切换与开放世界怎样让探索和战斗互相解释？",
		"image": "/media/breakdowns/genshin-impact.png"
	},
	{
		"slug": "zenless-zone-zero",
		"title": "绝区零：怎样把一次正确防御，接成整支队伍的动作高潮",
		"game": "绝区零",
		"category": "动作与战斗",
		"summary": "闪避、支援、失衡与角色表演怎样组织接续不断的动作体验？",
		"image": "/media/breakdowns/zenless-zone-zero.png"
	},
	{
		"slug": "honkai-star-rail",
		"title": "崩坏：星穹铁道：少量战斗按钮，怎样承载一支队伍的决策",
		"game": "崩坏：星穹铁道",
		"category": "动作与战斗",
		"summary": "战技点、能量与行动顺序怎样让少量按钮承载全队决策？",
		"image": "/media/breakdowns/honkai-star-rail.png"
	},
	{
		"slug": "god-of-war-2018",
		"title": "战神2018：一把能离手的斧头，怎样把力量感与战场控制接在一起",
		"game": "战神2018",
		"category": "动作与战斗",
		"summary": "近身镜头、斧头、敌群和父子协作怎样共同重建战神体验？",
		"image": "/media/breakdowns/god-of-war-2018.png"
	},
	{
		"slug": "god-of-war-ragnarok",
		"title": "战神：诸神黄昏：更多工具怎样变成一场战斗里的真实选择",
		"game": "战神：诸神黄昏",
		"category": "动作与战斗",
		"summary": "扩展武器、角色与战斗场景后，选择怎样仍然保持意义？",
		"image": "/media/breakdowns/god-of-war-ragnarok.png"
	},
	{
		"slug": "the-last-of-us",
		"title": "《最后生还者 1》：共同活下去，怎样变成无法放手",
		"game": "最后生还者1",
		"category": "开放世界与叙事",
		"summary": "资源稀缺、伙伴协作与操作身份怎样让共同生存变成依赖？",
		"image": "/media/breakdowns/the-last-of-us.png"
	},
	{
		"slug": "the-last-of-us-part-2",
		"title": "《最后生还者 2》：当敌人也在寻找你，战斗怎样制造压力与立场",
		"game": "最后生还者2",
		"category": "开放世界与叙事",
		"summary": "感知、潜行、暴露和换位怎样组织压力，并参与立场转换？",
		"image": "/media/breakdowns/the-last-of-us-part-2.png"
	},
	{
		"slug": "uncharted",
		"title": "《神秘海域 1》：有限动词如何撑起一场寻宝冒险",
		"game": "神秘海域1",
		"category": "开放世界与叙事",
		"summary": "有限的移动、射击和探索动作怎样撑起寻宝冒险？",
		"image": "/media/breakdowns/uncharted.png"
	},
	{
		"slug": "uncharted-2",
		"title": "《神秘海域 2》：移动的战场，怎样把枪战变成冒险高潮",
		"game": "神秘海域2",
		"category": "开放世界与叙事",
		"summary": "列车、倒塌楼房与节奏间隔怎样让场面变化成为玩法？",
		"image": "/media/breakdowns/uncharted-2.png"
	},
	{
		"slug": "uncharted-3",
		"title": "《神秘海域 3》：不断失控的冒险，怎样逼角色面对自己的执念",
		"game": "神秘海域3",
		"category": "开放世界与叙事",
		"summary": "飞机、沙漠和失控空间怎样把人物执念变成操作体验？",
		"image": "/media/breakdowns/uncharted-3.png"
	},
	{
		"slug": "uncharted-4",
		"title": "《神秘海域 4》：让冒险更自由，也让主角学会选择生活",
		"game": "神秘海域4",
		"category": "开放世界与叙事",
		"summary": "宽线性空间、绳索与家庭生活怎样共同收束冒险主题？",
		"image": "/media/breakdowns/uncharted-4.png"
	},
	{
		"slug": "marvels-spider-man",
		"title": "《漫威蜘蛛侠》：怎样让玩家持续做出“蜘蛛侠才会做”的动作",
		"game": "漫威蜘蛛侠",
		"category": "开放世界与叙事",
		"summary": "摆荡、空战、装置与救援怎样持续兑现英雄身份？",
		"image": "/media/breakdowns/marvels-spider-man.png"
	},
	{
		"slug": "spider-man-miles-morales",
		"title": "《漫威蜘蛛侠：迈尔斯》：新能力怎样让同一座城市拥有另一个英雄",
		"game": "漫威蜘蛛侠：迈尔斯",
		"category": "开放世界与叙事",
		"summary": "生物电、隐身、动作性格与社区关系怎样建立另一位英雄？",
		"image": "/media/breakdowns/spider-man-miles-morales.png"
	},
	{
		"slug": "red-dead-redemption-2",
		"title": "荒野大镖客2：生活的重复如何为一段无法挽回的故事赋予重量",
		"game": "荒野大镖客2",
		"category": "开放世界与叙事",
		"summary": "营地、旅途与生活动作怎样积累故事的情感重量？",
		"image": "/media/breakdowns/red-dead-redemption-2.png"
	},
	{
		"slug": "death-stranding",
		"title": "死亡搁浅：路途的阻力怎样让连接成为可以亲手完成的事情",
		"game": "死亡搁浅",
		"category": "协作与独立体验",
		"summary": "负重、地形、工具与异步合作怎样让连接成为可操作的劳动？",
		"image": "/media/breakdowns/death-stranding.png"
	},
	{
		"slug": "star-wars-battlefront-2",
		"title": "星球大战：前线 2：让普通士兵也能参与一场星战大片",
		"game": "星球大战：前线2",
		"category": "射击与团队",
		"summary": "普通士兵、英雄与大型战场怎样共同兑现星战幻想？",
		"image": "/media/breakdowns/star-wars-battlefront-2.png"
	},
	{
		"slug": "what-remains-of-edith-finch",
		"title": "艾迪芬奇的记忆：操作如何让玩家参与一种感知方式",
		"game": "艾迪芬奇的记忆",
		"category": "协作与独立体验",
		"summary": "短篇操作、注意力分配与空间叙事怎样让玩家参与人物感知？",
		"image": "/media/breakdowns/what-remains-of-edith-finch.png"
	},
	{
		"slug": "it-takes-two",
		"title": "双人成行：互补能力如何把共同游玩变成彼此需要",
		"game": "双人成行",
		"category": "协作与独立体验",
		"summary": "互补能力、控制权、分屏与恢复机制怎样让两人彼此需要？",
		"image": "/media/breakdowns/it-takes-two.png"
	},
	{
		"slug": "gris",
		"title": "GRIS：能力与世界的共同变化如何形成情绪旅程",
		"game": "GRIS",
		"category": "协作与独立体验",
		"summary": "能力、空间、色彩与音乐怎样共同形成情绪旅程？",
		"image": "/media/breakdowns/gris.png"
	},
	{
		"slug": "how-to-fish",
		"title": "How to Fish：荒诞动作怎样在合作与成长目标之间持续发生",
		"game": "How to Fish",
		"category": "协作与独立体验",
		"summary": "荒诞动作、物理互动、花式奖励与成长怎样延长合作乐趣？",
		"image": "/media/breakdowns/how-to-fish.png"
	},
	{
		"slug": "the-roottrees-are-dead",
		"title": "鲁特里一家死了：搜索如何变成建立和修正人物关系的推理",
		"game": "鲁特里一家死了",
		"category": "协作与独立体验",
		"summary": "搜索、族谱约束与证据界面怎样把阅读变成推理？",
		"image": "/media/breakdowns/the-roottrees-are-dead.png"
	}
];
