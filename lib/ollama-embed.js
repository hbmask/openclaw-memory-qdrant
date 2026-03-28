/**
 * Ollama Embedding 客户端
 * 
 * 封装 Ollama bge-m3 模型调用，生成 1024 维向量
 */

import { request } from 'undici';

export class OllamaEmbedding {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.model = config.model || 'bge-m3';
  }

  /**
   * 生成向量嵌入
   * @param {string} text - 输入文本
   * @returns {Promise<number[]>} - 1024 维向量
   */
  async embed(text) {
    try {
      const response = await request(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: text
        })
      });

      if (response.statusCode !== 200) {
        const errorText = await response.body.text();
        throw new Error(`Ollama API error (${response.statusCode}): ${errorText}`);
      }

      const data = await response.body.json();
      
      if (!data.embedding || !Array.isArray(data.embedding)) {
        throw new Error('Invalid response format from Ollama API');
      }

      return data.embedding;

    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to Ollama at ${this.baseUrl}. Is Ollama running?`);
      }
      throw error;
    }
  }

  /**
   * 批量生成向量
   * @param {string[]} texts - 文本数组
   * @returns {Promise<number[][]>} - 向量数组
   */
  async embedBatch(texts) {
    const results = [];
    for (const text of texts) {
      try {
        const vector = await this.embed(text);
        results.push(vector);
      } catch (error) {
        console.error(`Failed to embed text: ${text}`, error);
        results.push(null);
      }
    }
    return results;
  }

  /**
   * 检查 Ollama 服务状态
   * @returns {Promise<boolean>}
   */
  async isHealthy() {
    try {
      const response = await request(`${this.baseUrl}/api/tags`, {
        method: 'GET'
      });
      return response.statusCode === 200;
    } catch {
      return false;
    }
  }
}
