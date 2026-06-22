# 微缩城市天气卡片

输入城市提示词，生成 45 度俯视的微缩城市背景图。页面里可直接粘贴 OpenAI API Key，不需要配置环境变量。

## 一键部署到 Vercel

先把这个项目推到 GitHub，然后把下面链接里的 `YOUR_GITHUB_REPO_URL` 换成你的仓库地址：

```text
https://vercel.com/new/clone?repository-url=YOUR_GITHUB_REPO_URL
```

例如：

```text
https://vercel.com/new/clone?repository-url=https://github.com/yourname/minicity
```

Vercel 导入后保持默认配置即可：

- Framework Preset: Next.js
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: 留空
- Environment Variables: 不需要

## 发压缩包给别人

不要直接压缩整个目录，`node_modules` 和 `.next` 会让压缩包变成几百 MB。

用这个命令生成源码包：

```bash
zip -r minicity-source.zip . \
  -x "node_modules/*" ".next/*" "public/generated/*" "data/image-cache.json" ".git/*" ".DS_Store"
```

对方解压后运行：

```bash
npm install
npm run dev
```

## 部署环境说明

本地运行时，生成图会写入 `public/generated` 并缓存。

Vercel 等 serverless 环境不保证运行时可写项目目录，所以项目会自动降级为返回内联图片 `data:` URL。这样不需要配置 S3/R2，也能直接部署使用。
