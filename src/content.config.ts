// 【文件作用】Astro 内容集合配置文件，告诉 Astro 如何加载和验证 src/content/docs/ 目录下的所有文档文件。
// Astro 会根据此配置对每个 .md/.mdx 文件的 frontmatter（头部元数据）进行类型校验，并生成对应的 TypeScript 类型声明。

// defineCollection：Astro 的工具函数，用于定义一个内容集合（规定加载方式 + 数据校验规则）
import { defineCollection } from 'astro:content';
// docsLoader：Starlight 提供的加载器，负责从文件系统中扫描并读取所有文档文件
import { docsLoader } from '@astrojs/starlight/loaders';
// docsSchema：Starlight 提供的 Zod 数据结构，用于校验文档 frontmatter 字段（如 title、description 等）
import { docsSchema } from '@astrojs/starlight/schema';

// 导出 collections 对象，Astro 将自动识别并注册其中的所有集合
export const collections = {
	// 注册名为 "docs" 的集合，对应 src/content/docs/ 目录
	// loader：使用 Starlight 的文档加载器读取文件
	// schema：使用 Starlight 的文档 schema 验证每篇文档的 frontmatter 格式
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
