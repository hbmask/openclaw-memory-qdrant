/**
 * OpenClaw Memory Qdrant Skill
 * 
 * 团队向量记忆技能 - 连接本地 Qdrant + Ollama bge-m3
 * 
 * @author TeamClaw
 * @version 1.0.0
 */

import { MemoryStore } from './tools/memory_store.js';
import { MemorySearch } from './tools/memory_search.js';
import { MemoryForget } from './tools/memory_forget.js';
import { AutoRecall } from './lib/auto-recall.js';

/**
 * 技能工厂函数
 * @param {Object} config - 插件配置
 * @returns {Object} OpenClaw 技能接口
 */
export default function MemoryQdrantSkill(config = {}) {
  const {
    qdrantUrl = 'http://localhost:6333',
    ollamaUrl = 'http://localhost:11434',
    embeddingModel = 'bge-m3',
    autoCapture = false,
    autoRecall = true,
    collections = {
      memory: 'team_memory_v3',
      code: 'code_index_v3',
      decision: 'decision_log_v3'
    }
  } = config;

  // 初始化工具
  const storeTool = MemoryStore({ qdrantUrl, ollamaUrl, embeddingModel, collections });
  const searchTool = MemorySearch({ qdrantUrl, ollamaUrl, embeddingModel, collections });
  const forgetTool = MemoryForget({ qdrantUrl, collections });
  
  // 初始化自动检索
  const autoRecallHandler = AutoRecall({ 
    qdrantUrl, 
    ollamaUrl, 
    embeddingModel, 
    collections,
    enabled: autoRecall 
  });

  return {
    name: 'memory-qdrant',
    version: '1.0.0',
    
    // 注册工具
    tools: {
      memory_store: storeTool,
      memory_search: searchTool,
      memory_forget: forgetTool
    },
    
    // 生命周期钩子
    hooks: {
      // 对话前自动检索相关记忆
      beforeAgentTurn: async (context) => {
        if (!autoRecall) return context;
        return await autoRecallHandler.handle(context);
      },
      
      // 对话后自动捕获关键信息（可选）
      afterAgentTurn: async (context) => {
        if (!autoCapture) return context;
        // TODO: 实现自动捕获逻辑
        return context;
      }
    },
    
    // 配置验证
    validateConfig: () => {
      const errors = [];
      
      // 验证 Qdrant 连接
      if (!qdrantUrl) {
        errors.push('qdrantUrl is required');
      }
      
      // 验证 Ollama 连接
      if (!ollamaUrl) {
        errors.push('ollamaUrl is required');
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
    }
  };
}
