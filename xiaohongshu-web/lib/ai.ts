// AI optimization with Kimi API

import OpenAI from "openai";

function getClient() {
  if (!process.env.MOONSHOT_API_KEY) {
    throw new Error("MOONSHOT_API_KEY is not configured");
  }
  return new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: "https://api.moonshot.cn/v1",
  });
}

const SYSTEM_PROMPT = `你是一个专业的 Markdown 格式化专家，专注于将小红书内容转换为结构清晰、易于阅读的 Markdown 格式。

请按照以下要求优化内容：

1. **标题层级组织**：
   - 识别主要内容部分，使用适当的标题层级 (##, ###)
   - 对于步骤类内容，使用有序列表 (1., 2., 3.)
   - 对于要点类内容，使用无序列表 (-)

2. **段落格式化**：
   - 将长段落分段，每个段落之间空一行
   - 保持原有的换行习惯
   - 保留所有表情符号和特殊字符

3. **内容组织**：
   - 食谱：将食材和步骤分开组织
   - 教程：使用清晰的步骤编号
   - 攻略：按照逻辑顺序组织信息
   - 一般内容：保持原有结构，改善可读性

4. **保持不变**：
   - 图片和视频标签原样保留
   - 话题标签放在文末
   - 不添加或删除实质性内容
   - 保持原有的语气和风格

请只返回优化后的 Markdown 内容，不要有任何其他说明。`;

/**
 * Optimize markdown content using Kimi AI
 */
export async function optimizeMarkdown(markdown: string): Promise<string> {
  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: "kimi-k2-turbo-preview",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: markdown,
        },
      ],
      temperature: 0.6,
    });

    return response.choices[0].message.content || markdown;
  } catch (error) {
    console.error("AI optimization error:", error);
    throw new Error(
      `AI optimization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Optimize markdown with custom instructions
 */
export async function optimizeMarkdownWithInstructions(
  markdown: string,
  instructions: string,
): Promise<string> {
  const customPrompt = `${SYSTEM_PROMPT}

额外要求：
${instructions}`;

  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: "kimi-k2-turbo-preview",
      messages: [
        {
          role: "system",
          content: customPrompt,
        },
        {
          role: "user",
          content: markdown,
        },
      ],
      temperature: 0.6,
    });

    return response.choices[0].message.content || markdown;
  } catch (error) {
    console.error("AI optimization error:", error);
    throw new Error(
      `AI optimization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
