/**
 * AutoRecall - 自动检索相关记忆
 * 
 * 在 Agent 回答前，自动从 Qdrant 检索相关记忆并注入上下文
 */

import { OllamaEmbedding } from './ollama-embed.js';
import { QdrantClient } from './qdrant-client.js';

export function AutoRecall(config) {
  const {
    qdrantUrl,
    ollamaUrl,
    embeddingModel,
    collections,
    enabled = true
  } = config;

  const ollama = new OllamaEmbedding({ baseUrl: ollamaUrl, model: embeddingModel });
  const qdrant = new QdrantClient({ baseUrl: qdrantUrl });

  /**
   * 从用户消息中提取检索关键词
   */
  function extractQueryFromMessage(message) {
    // 简单实现：直接使用用户消息作为查询
    // TODO: 可以使用 LLM 提取更精确的关键词
    return message;
  }

  /**
   * 处理对话前检索
   */
  async function handle(context) {
    if (!enabled) {
      return context;
    }

    try {
      const userMessage = context.lastUserMessage;
      if (!userMessage) {
        return context;
      }

      // 提取查询
      const query = extractQueryFromMessage(userMessage);

      // 从所有 collections 搜索
      const allMemories = [];
      
      for (const [category, collectionName] of Object.entries(collections)) {
        try {
          const vector = await ollama.embed(query);
          const results = await qdrant.search(collectionName, vector, 3);
          
          results.forEach(item => {
            allMemories.push({
              category,
              content: item.payload?.content,
              score: item.score,
              agent_id: item.payload?.agent_id
            });
          });
        } catch (error) {
          console.error(`Search failed for ${collectionName}:`, error.message);
        }
      }

      // 如果有相关记忆，注入上下文
      if (allMemories.length > 0) {
        // 按分数排序，取前 5 条
        const topMemories = allMemories
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        // 构建记忆上下文
        const memoryContext = [
          '📚 相关记忆：',
          ...topMemories.map((m, i) => `  ${i + 1}. [${m.category}] ${m.content} (相关度：${m.score.toFixed(2)})`)
        ].join('\n');

        // 注入到系统提示
        context.systemPrompt = context.systemPrompt 
          ? `${context.systemPrompt}\n\n${memoryContext}`
          : memoryContext;

        context.memories = topMemories;
      }

      return context;

    } catch (error) {
      console.error('AutoRecall failed:', error.message);
      return context; // 失败不影响正常对话
    }
  }

  return {
    handle
  };
}
