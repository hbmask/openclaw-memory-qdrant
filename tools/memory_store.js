/**
 * memory_store 工具 - 保存记忆到 Qdrant
 */

import { request } from 'undici';

/**
 * 创建 memory_store 工具
 */
export function MemoryStore(config) {
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
   * 存储记忆到 Qdrant
   */
  async function store({ text, category = 'memory', agent_id = 'main', metadata = {} }) {
    try {
      // 生成向量
      const vector = await getEmbedding(text);
      
      // 选择 collection
      const collectionName = collections[category] || collections.memory;
      
      // 构建 payload
      const payload = {
        content: text,
        agent_id,
        timestamp: new Date().toISOString(),
        ...metadata
      };
      
      // 存储到 Qdrant
      const pointId = crypto.randomUUID();
      const storeResponse = await request(`${qdrantUrl}/collections/${collectionName}/points`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: [{
            id: pointId,
            vector,
            payload
          }]
        })
      });
      
      if (storeResponse.statusCode !== 200) {
        throw new Error(`Qdrant API error: ${storeResponse.statusCode}`);
      }
      
      const result = await storeResponse.body.json();
      
      return {
        success: true,
        id: pointId,
        collection: collectionName,
        status: result.status
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 返回工具函数
  return store;
}
