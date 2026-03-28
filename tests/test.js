/**
 * Memory Qdrant Skill 测试
 */

import { MemoryStore } from '../tools/memory_store.js';
import { MemorySearch } from '../tools/memory_search.js';

const config = {
  qdrantUrl: 'http://localhost:6333',
  ollamaUrl: 'http://localhost:11434',
  embeddingModel: 'bge-m3',
  collections: {
    memory: 'team_memory_v3',
    code: 'code_index_v3',
    decision: 'decision_log_v3'
  }
};

async function runTests() {
  console.log('🧪 开始测试 Memory Qdrant Skill...\n');

  // 测试 1: 存储记忆
  console.log('测试 1: 存储记忆');
  const store = MemoryStore(config);
  const storeResult = await store({
    text: '测试记忆 - 向量数据库技能开发完成',
    category: 'memory',
    agent_id: 'test',
    metadata: { test: true }
  });
  console.log('存储结果:', JSON.stringify(storeResult, null, 2));

  if (!storeResult.success) {
    console.error('❌ 存储测试失败');
    return;
  }

  // 测试 2: 搜索记忆
  console.log('\n测试 2: 搜索记忆');
  const search = MemorySearch(config);
  const searchResult = await search({
    query: '向量数据库',
    category: 'memory',
    limit: 3
  });
  console.log('搜索结果:', JSON.stringify(searchResult, null, 2));

  if (!searchResult.success || searchResult.count === 0) {
    console.error('❌ 搜索测试失败');
    return;
  }

  console.log('\n✅ 所有测试通过！');
}

runTests().catch(console.error);
