# 🚀 GitHub Pages 部署指南

## 步骤一：在GitHub上创建仓库

1. 访问 https://github.com/new
2. 填写仓库名称：`magic-fingers`（或你喜欢的名字）
3. 选择 **Public**（公开仓库）或 **Private**（私有仓库）
4. **不要勾选** "Initialize this repository with a README"
5. 点击 **Create repository**

## 步骤二：关联本地仓库并推送代码

在 `F:\other\magic-fingers` 目录下，打开终端（PowerShell或cmd），执行以下命令：

```bash
# 复制你GitHub仓库的地址（替换为你的用户名）
git remote add origin https://github.com/你的用户名/magic-fingers.git

# 推送代码到main分支
git branch -M main
git push -u origin main
```

如果你的GitHub用户名是 `exampleuser`，完整命令就是：
```bash
git remote add origin https://github.com/exampleuser/magic-fingers.git
git branch -M main
git push -u origin main
```

## 步骤三：启用GitHub Pages（免费部署）

1. 进入你的GitHub仓库页面
2. 点击 **Settings**（设置）
3. 在左侧菜单找到 **Pages**
4. 在 **Build and deployment** 下：
   - Source 选择 **Deploy from a branch**
   - Branch 选择 **main**
   - Folder 选择 **/ (root)**
5. 点击 **Save**

## 步骤四：访问你的网站

等待1-2分钟后，GitHub会部署完成！你的网站将在以下地址：

```
https://你的用户名.github.io/magic-fingers/
```

例如：`https://exampleuser.github.io/magic-fingers/`

## 🔐 关于摄像头权限

GitHub Pages 使用 HTTPS，所以摄像头功能可以正常工作！

## 🌟 更新项目

以后如果要修改代码并重新部署：

```bash
# 1. 修改代码
# 2. 提交更改
git add .
git commit -m "描述你的修改"

# 3. 推送到GitHub
git push
```

GitHub Pages会自动重新部署！

---

祝部署顺利！🎉
