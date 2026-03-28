# memory-qdrant - 团队向量记忆技能

**定制版 OpenClaw Memory Skill** - 连接本地 Qdrant + Ollama bge-m3

## 使用场景

**TRIGGER when**:
- 用户要求"记住 XXX"、"保存这个"
- 用户询问历史、之前的内容
- 需要团队共享知识库
- 项目里程碑、重大决策需要记录

**DO NOT TRIGGER for**:
- 简单对话（使用 OpenClaw 内置记忆）
- 临时信息（无需长期存储）

## 功能

- ✅ **语义搜索** - 使用 Ollama bge-m3 (1024 维) 本地模型
- ✅ **持久化存储** - 连接本地 Qdrant 数据库
- ✅ **自动检索** - 对话前自动注入相关记忆 (autoRecall)
- ✅ **团队共享** - 所有 Agent 访问同一知识库
- ✅ **分类管理** - memory/code/decision 三种集合

## 配置

```json
{
  "plugins": {
    "memory-qdrant": {
      "enabled": true,
      "qdrantUrl": "http://localhost:6333",
      "ollamaUrl": "http://localhost:11434",
      "embeddingModel": "bge-m3",
      "autoCapture": false,
      "autoRecall": true,
      "collections": {
        "memory": "team_memory_v3",
        "code": "code_index_v3",
        "decision": "decision_log_v3"
      }
    }
  }
}
```

## 工具使用

### memory_store - 保存记忆

```javascript
memory_store({
  text: "企业微信 Hook SDK 采用 GoFrame v2.10 框架",
  category: "memory",
  agent_id: "main",
  metadata: { project: "wecom-hook" }
})
```

### memory_search - 搜索记忆

```javascript
memory_search({
  query: "企业微信开发",
  category: "memory",
  limit: 5
})
```

### memory_forget - 删除记忆

```javascript
memory_forget({
  memoryId: "uuid-here"
})
// 或
memory_forget({
  query: "要删除的内容关键词"
})
```

## 安装

```bash
# 从 GitHub 安装
npx clawhub@latest install memory-qdrant

# 或本地安装
cd C:\Users\Administrator\.openclaw\workspace\projects\memory-qdrant-skill
npm install
```

## 依赖

- Node.js >=18.17.0
- undici (HTTP 请求)
- Qdrant v1.13.4 (本地运行)
- Ollama + bge-m3 模型

## 隐私与安全

- ✅ **完全本地** - 无外部 API 调用
- ✅ **数据可控** - Qdrant 本地存储
- ✅ **autoCapture 默认关闭** - 保护隐私

## 技术细节

| 组件 | 配置 |
|------|------|
| 向量模型 | Ollama bge-m3 (1024 维) |
| 向量库 | Qdrant v1.13.4 |
| Collections | team_memory_v3, code_index_v3, decision_log_v3 |
| 距离算法 | Cosine 相似度 |

## 链接

- GitHub: https://github.com/your-org/openclaw-memory-qdrant
- 问题反馈：https://github.com/your-org/openclaw-memory-qdrant/issues

---

_版本：1.0.0 | 创建时间：2026-03-28_
