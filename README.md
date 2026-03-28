# OpenClaw Memory Qdrant Skill

**定制版团队向量记忆技能** - 连接本地 Qdrant + Ollama bge-m3 (1024 维)

## 快速开始

### 前置要求

1. **Qdrant 运行中**
   ```powershell
   # 检查 Qdrant 状态
   Invoke-RestMethod -Uri "http://localhost:6333/"
   ```

2. **Ollama + bge-m3 模型**
   ```powershell
   # 检查 Ollama 状态
   ollama list
   # 应该看到 bge-m3
   ```

3. **Node.js >= 18.17.0**
   ```powershell
   node --version
   ```

### 安装

```bash
# 从本地安装
cd C:\Users\Administrator\.openclaw\workspace\projects\memory-qdrant-skill
npm install

# 复制到 OpenClaw 技能目录
cp -r . ~/.openclaw/skills/memory-qdrant/
```

### 配置

编辑 `~/.openclaw/openclaw.json`:

```json
{
  "plugins": {
    "entries": {
      "memory-qdrant": {
        "enabled": true
      }
    }
  }
}
```

### 重启 Gateway

```bash
openclaw gateway restart
```

## 使用示例

### 1. 保存记忆

```javascript
memory_store({
  text: "企业微信 Hook SDK 采用 GoFrame v2.10 框架",
  category: "memory",
  agent_id: "main",
  metadata: { project: "wecom-hook" }
})
```

### 2. 搜索记忆

```javascript
memory_search({
  query: "企业微信开发",
  category: "memory",
  limit: 5
})
```

### 3. 删除记忆

```javascript
memory_forget({
  memoryId: "uuid-here"
})
```

## Collections

| Collection | 用途 | 维度 |
|------------|------|------|
| `team_memory_v3` | 团队记忆、决策记录 | 1024 |
| `code_index_v3` | 代码片段、技术方案 | 1024 |
| `decision_log_v3` | 重要决策、会议纪要 | 1024 |

## 配置选项

| 选项 | 默认值 | 说明 |
|------|--------|------|
| `qdrantUrl` | `http://localhost:6333` | Qdrant 服务器地址 |
| `ollamaUrl` | `http://localhost:11434` | Ollama 服务器地址 |
| `embeddingModel` | `bge-m3` | 嵌入模型名称 |
| `autoCapture` | `false` | 自动捕获对话内容 |
| `autoRecall` | `true` | 自动检索相关记忆 |

## 开发

### 运行测试

```bash
npm test
```

### 代码结构

```
├── index.js                 # 主入口
├── tools/
│   ├── memory_store.js      # 存储工具
│   ├── memory_search.js     # 搜索工具
│   └── memory_forget.js     # 删除工具
├── lib/
│   ├── ollama-embed.js      # Ollama 客户端
│   ├── qdrant-client.js     # Qdrant 客户端
│   └── auto-recall.js       # 自动检索
└── SKILL.md                 # 技能说明
```

## 故障排除

### Qdrant 连接失败

```powershell
# 检查 Qdrant 是否运行
Get-Process qdrant
netstat -ano | findstr ":6333"
```

### Ollama 连接失败

```powershell
# 检查 Ollama 是否运行
Get-Process ollama
ollama list
```

### 向量维度不匹配

确保使用 `bge-m3` 模型（1024 维），Collections 也必须是 1024 维。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

_版本：1.0.0 | 创建时间：2026-03-28_
