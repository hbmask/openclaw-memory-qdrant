/**
 * memory_forget 工具 - 删除记忆
 */

import { request } from 'undici';

/**
 * 创建 memory_forget 工具
 */
export function MemoryForget(config) {
  const { qdrantUrl, collections } = config;

  /**
   * 删除记忆（通过 ID）
   */
  async function forgetById(memoryId, category = 'memory') {
    const collectionName = collections[category] || collections.memory;
    
    try {
      const response = await request(`${qdrantUrl}/collections/${collectionName}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: [memoryId],
          operation: 'delete'
        })
      });
      
      if (response.statusCode !== 200) {
        throw new Error(`Qdrant API error: ${response.statusCode}`);
      }
      
      const result = await response.body.json();
      
      return {
        success: true,
        id: memoryId,
        status: result.status
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 删除记忆（通过搜索查询）
   */
  async function forgetByQuery(query, category = 'memory', limit = 10) {
    // TODO: 需要先搜索，然后批量删除
    // 简化版本：直接返回错误，要求使用 ID 删除
    return {
      success: false,
      error: 'Query-based deletion not yet implemented. Use memoryId instead.'
    };
  }

  /**
   * 主函数 - 根据参数选择删除方式
   */
  async function forget({ memoryId = null, query = null, category = 'memory' }) {
    if (memoryId) {
      return await forgetById(memoryId, category);
    } else if (query) {
      return await forgetByQuery(query, category);
    } else {
      return {
        success: false,
        error: 'Either memoryId or query must be provided'
      };
    }
  }

  // 返回工具函数
  return forget;
}
