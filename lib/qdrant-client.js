/**
 * Qdrant 向量数据库客户端
 */

import { request } from 'undici';

export class QdrantClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:6333';
  }

  /**
   * 存储点到集合
   */
  async upsert(collectionName, points) {
    try {
      const response = await request(`${this.baseUrl}/collections/${collectionName}/points`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points })
      });

      if (response.statusCode !== 200) {
        const errorText = await response.body.text();
        throw new Error(`Qdrant API error (${response.statusCode}): ${errorText}`);
      }

      const result = await response.body.json();
      return result;

    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to Qdrant at ${this.baseUrl}. Is Qdrant running?`);
      }
      throw error;
    }
  }

  /**
   * 搜索相似点
   */
  async search(collectionName, vector, limit = 5, filter = null) {
    try {
      const searchBody = {
        vector,
        limit,
        with_payload: true
      };

      if (filter) {
        searchBody.filter = filter;
      }

      const response = await request(`${this.baseUrl}/collections/${collectionName}/points/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchBody)
      });

      if (response.statusCode !== 200) {
        const errorText = await response.body.text();
        throw new Error(`Qdrant API error (${response.statusCode}): ${errorText}`);
      }

      const result = await response.body.json();
      return result.result || [];

    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to Qdrant at ${this.baseUrl}. Is Qdrant running?`);
      }
      throw error;
    }
  }

  /**
   * 删除点
   */
  async delete(collectionName, pointIds) {
    try {
      const response = await request(`${this.baseUrl}/collections/${collectionName}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: pointIds,
          operation: 'delete'
        })
      });

      if (response.statusCode !== 200) {
        const errorText = await response.body.text();
        throw new Error(`Qdrant API error (${response.statusCode}): ${errorText}`);
      }

      const result = await response.body.json();
      return result;

    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取集合信息
   */
  async getCollectionInfo(collectionName) {
    try {
      const response = await request(`${this.baseUrl}/collections/${collectionName}`, {
        method: 'GET'
      });

      if (response.statusCode !== 200) {
        const errorText = await response.body.text();
        throw new Error(`Qdrant API error (${response.statusCode}): ${errorText}`);
      }

      const result = await response.body.json();
      return result.result;

    } catch (error) {
      throw error;
    }
  }

  /**
   * 检查 Qdrant 服务状态
   */
  async isHealthy() {
    try {
      const response = await request(`${this.baseUrl}/`, {
        method: 'GET'
      });
      return response.statusCode === 200;
    } catch {
      return false;
    }
  }
}
