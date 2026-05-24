# 🔄 项目更新指南

## 方法一：快速更新（推荐）

每次修改代码后，在 `F:\other\magic-fingers` 目录下执行：

```powershell
# 1. 查看修改了哪些文件
git status

# 2. 添加所有修改的文件
git add .

# 3. 提交更新（引号里写你修改了什么）
git commit -m "添加了新功能"

# 4. 推送到GitHub（自动部署）
git push
```

推送成功后，GitHub Pages 会在 1-2 分钟内自动更新网站！

---

## 方法二：详细步骤

### 1. 先拉取最新代码（如果多人协作）

```powershell
git pull
```

### 2. 修改代码

编辑你要修改的文件：
- [index.html](index.html) - 页面内容
- [app.js](app.js) - 功能逻辑
- [README.md](README.md) - 说明文档

### 3. 查看修改

```powershell
git status
```

### 4. 添加到暂存区

```powershell
# 添加所有文件
git add .

# 或者只添加特定文件
git add index.html
```

### 5. 提交修改

```powershell
# 写清楚你改了什么
git commit -m "优化移动端性能"
```

### 6. 推送到GitHub

```powershell
git push
```

---

## 📝 commit message 建议写法

| 类型 | 例子 | 说明 |
|------|------|------|
| feat | `git commit -m "feat: 添加新特效"` | 新功能 |
| fix | `git commit -m "fix: 修复手势识别bug"` | 修复 |
| docs | `git commit -m "docs: 更新说明文档"` | 文档 |
| style | `git commit -m "style: 调整按钮样式"` | 样式 |
| perf | `git commit -m "perf: 优化性能"` | 性能 |
| refactor | `git commit -m "refactor: 重构代码"` | 重构 |

---

## 🌐 查看更新状态

在你的GitHub仓库页面：
- https://github.com/wangbo1912/magic-fingers

查看：
1. **Commits** - 提交历史
2. **Actions** - 部署状态（绿色✅表示成功）

---

## 💡 小贴士

**如果 git push 失败怎么办？**

可能是其他人也推送了代码，先拉取：
```powershell
git pull
git push
```

**想撤销本地修改？**
```powershell
git checkout .
```

**查看提交历史？**
```powershell
git log
```

---

就这么简单！修改 → 提交 → 推送，GitHub Pages 自动更新！✨
