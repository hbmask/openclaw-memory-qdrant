/**
 * memory_search 工具 - 搜索相关记忆
 */

import { request } from 'undici';

/**
 * 创建 memory_search 工具
 */
export function MemorySearch(config) {
  const { qdrantUrl, ollamaUrl, embeddingModel, collections } = config;

  /**
   * 生成向量嵌入
   */
  async function getEmbedding(text) {
    const response = await request(`${ollamaUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: embeddingModel,
        prompt: text
      })
    });
    
    if (response.statusCode !== 200) {
      throw new Error(`Ollama API error: ${response.statusCode}`);
    }
    
    const data = await response.body.json();
    return data.embedding;
  }

  /**
   * 搜索记忆
   */
  async function search({ query, category = 'memory', limit = 5, agent_id = null }) {
    try {
      // 生成查询向量
      const vector = await getEmbedding(query);
      
      // 选择 collection
      const collectionName = collections[category] || collections.memory;
      
      // 构建搜索请求
      const searchBody = {
        vector,
        limit,
        with_payload: true
      };
      
      // 可选：按 agent_id 过滤
      if (agent_id) {
        searchBody.filter = {
          must: [
            { key: 'agent_id', match: { value: agent_id } }
          ]
        };
      }
      
      // 搜索
      const searchResponse = await request(`${qdrantUrl}/collections/${collectionName}/points/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchBody)
      });
      
      if (searchResponse.statusCode !== 200) {
        throw new Error(`Qdrant API error: ${searchResponse.statusCode}`);
      }
      
      const result = await searchResponse.body.json();
      
      // 格式化结果
      const memories = result.result.map(item => ({
        id: item.id,
        score: item.score,
        content: item.payload?.content,
        agent_id: item.payload?.agent_id,
        timestamp: item.payload?.timestamp,
        metadata: item.payload
      }));
      
      return {
        success: true,
        results: memories,
        count: memories.length,
        collection: collectionName
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }

  // 返回工具函数
  return search;
}
