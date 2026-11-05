# 视觉参考清单

整理于 2026-11-05。“本版已用”指这次改版直接借鉴、已经落到代码里的；其余留给下一轮。

## 1. 游戏 UI / HUD（定整体气质）

| 参考 | 链接 | 看什么 | 本版 |
|---|---|---|---|
| Game UI Database | https://www.gameuidatabase.com/ | 按游戏、界面类型（菜单、HUD、物品栏）检索的 UI 截图库，找具体界面最快 | |
| Interface In Game | https://interfaceingame.com/ | 同类截图库，偏主机大作，可按游戏浏览 | |
| HUDS+GUIS | https://www.hudsandguis.com/ | 影视和游戏里的科幻 HUD 设计 | |
| 装甲核心 6 官网 | https://www.armoredcore.net/ | 机甲 HUD、角标、细线框、等宽数字 | 已用：卡片四角角标、统计面板 |
| VALORANT 官网 | https://playvalorant.com/ | 大字排版、斜切块、单一强调色 | 已用：金色绶带斜切角 |
| Arwes | https://arwes.dev/ | 开源科幻 UI 框架（线框、扫描、出现动画），可参考动效节奏 | |

想细看的游戏界面：《尼尔：机械纪元》菜单、《死亡搁浅》任务结算、《女神异闻录 5》全部菜单、《装甲核心 6》机库。都能在 Game UI Database 里搜到。

## 2. 卡片与收藏墙（游戏拆解主视觉）

| 参考 | 链接 | 看什么 | 本版 |
|---|---|---|---|
| Pokémon Cards CSS（演示） | https://poke-holo.simey.me/ | 纯 CSS 镭射卡：鼠标位置驱动光泽、彩虹层、倾斜 | 已用：金卡镭射层 + 高光 |
| Pokémon Cards CSS（源码） | https://github.com/simeydotme/pokemon-cards-css | 每种稀有度的 CSS 写法，可以直接抄混合模式参数 | 已用 |
| vanilla-tilt.js | https://micku7zu.github.io/vanilla-tilt.js/ | 3D 倾斜的手感参数（最大角度、回弹速度） | 已用：自己写的倾斜，没引入库 |
| Steam Replay | https://store.steampowered.com/replay | 年度游玩总结：大数字统计、按时长排序 | 已用：顶部统计面板 |
| Backloggd | https://backloggd.com/ | 游戏库网格、评分、玩过/想玩状态的组织方式 | |
| The Game Awards | https://www.thegameawards.com/ | 奖项视觉、获奖名单 | 奖项数据来源 |
| Golden Joystick Awards | https://www.goldenjoystickawards.com/ | 同上 | 奖项数据来源 |

## 3. 个人作品集网站（整体动效和版式）

| 参考 | 链接 | 看什么 |
|---|---|---|
| Bruno Simon | https://bruno-simon.com/ | 把作品集做成可以开车的 3D 小游戏，游戏人做作品集最常被拿来对标 |
| Lusion | https://lusion.co/ | WebGL 动效工作室官网，转场和滚动节奏 |
| Awwwards Portfolio 分类 | https://www.awwwards.com/websites/portfolio/ | 获奖作品集合集，按年份翻 |
| Godly | https://godly.website/ | 网页设计灵感合集，偏大字排版和动效 |

## 4. 技术实现参考

| 参考 | 链接 | 用途 | 本版 |
|---|---|---|---|
| 跨文档 View Transitions | https://developer.chrome.com/docs/web-platform/view-transitions/cross-document | 点小卡后封面“飞”进文章头图 | 已用 |
| Astro View Transitions | https://docs.astro.build/en/guides/view-transitions/ | 以后想做无刷新页面切换时看 | |
| CSS 滚动驱动动画（MDN） | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations | 顶部阅读进度条 | 已用 |
| Lenis | https://lenis.darkroom.engineering/ | 平滑滚动 | 下一轮 |
| GSAP ScrollTrigger | https://gsap.com/docs/v3/Plugins/ScrollTrigger/ | 首页按滚动编排的进场动画 | 下一轮（本版用 IntersectionObserver 做了简化版） |

## 5. 数据接口

| 数据 | 来源 | 说明 |
|---|---|---|
| Metacritic 评分 | metacritic.com 前端用的 backend 接口 | 非官方，脚本里有失效时的替换说明；失败时退回 Steam 商店的 metacritic 字段 |
| Steam 时长 | https://steamcommunity.com/dev/apikey | `IPlayerService/GetOwnedGames`，需要 API Key + 资料“游戏详情”公开 |
| PSN 时长 | https://psn-api.achievements.app/authentication/authenticating-manually | `psn-api` 库，用 NPSSO 登录，PS4/PS5 才有时长 |
| 竖版封面 | Steam `library_600x900` / PSN 商店图 / https://www.steamgriddb.com/profile/preferences/api | 按顺序回退，全部失败就用排版海报 |
