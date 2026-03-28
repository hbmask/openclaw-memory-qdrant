# 定制 Memory Qdrant Skill 项目

## 项目目标

创建一个 OpenClaw Skill，让团队 Agent 能够：
1. **主动写入** Qdrant 向量数据库
2. **自动检索** 相关记忆（autoRecall）
3. 使用 **Ollama bge-m3** (1024 维) 本地模型
4. 连接 **本地 Qdrant** (http://localhost:6333)

## 需求清单

### 核心功能
- [ ] `memory_store` 工具 - 保存记忆到 Qdrant
- [ ] `memory_search` 工具 - 搜索相关记忆
- [ ] `memory_forget` 工具 - 删除记忆
- [ ] autoRecall - 对话前自动检索相关记忆
- [ ] autoCapture (可选) - 自动捕获对话中的关键信息

### 技术栈
- **向量模型**: Ollama bge-m3 (1024 维)
- **向量库**: Qdrant v1.13.4 (本地)
- **运行环境**: Node.js + OpenClaw Skill SDK
- **Collections**:
  - `team_memory_v3` - 团队记忆
  - `code_index_v3` - 代码片段
  - `decision_log_v3` - 决策记录

### 配置项
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

## 项目结构

```
openclaw-memory-qdrant/
├── SKILL.md                 # 技能说明
├── package.json             # 依赖配置
├── index.js                 # 主入口
├── tools/
│   ├── memory_store.js      # 存储工具
│   ├── memory_search.js     # 搜索工具
│   └── memory_forget.js     # 删除工具
├── lib/
│   ├── qdrant-client.js     # Qdrant 客户端
│   ├── ollama-embed.js      # Ollama 嵌入生成
│   └── auto-recall.js       # 自动检索逻辑
├── config/
│   └── default.json         # 默认配置
├── tests/                   # 测试
└── README.md                # 使用文档
```

## 团队分工

| Agent | 职责 |
|-------|------|
| lingong | 架构设计、技术方案 |
| coding | 代码实现、单元测试 |
| laochen | 测试用例、验收 |
| main | 项目管理、GitHub 发布 |

## 里程碑

1. **架构设计** - lingong 完成
2. **代码实现** - coding 完成
3. **测试验收** - laochen 完成
4. **GitHub 发布** - main 完成

## 参考资源

- 原技能：https://github.com/zuiho-kai/openclaw-memory-qdrant
- Qdrant API: http://localhost:6333/dashboard
- Ollama API: http://localhost:11434/api/embeddings

---

_创建时间：2026-03-28 22:05_
