<<<<<<< HEAD
# SplitWise - Smart Receipt Splitter

一個智能小票分帳應用，使用 Vue 3 + Shadcn-vue 構建。

## 🎯 專案概述

這是一個幫助朋友、室友之間輕鬆分攤收據費用的應用程序。支持上傳收據、OCR 識別、智能分配項目給成員，並自動計算每個人應付的金額。

## 🛠️ 技術棧

- **框架**: Vue 3 + TypeScript
- **構建工具**: Vite
- **UI 庫**: Shadcn-vue (官方 CLI 安裝)
- **樣式**: Tailwind CSS v4
- **組件庫**: Radix Vue (無障礙性)
- **圖標**: Lucide Vue
- **路由**: Vue Router 4
- **狀態管理**: Vue Composables

## ✅ Shadcn-vue 已正確安裝

本專案使用 **Shadcn-vue CLI** 正確安裝，符合官方文檔標準：

```bash
# 已執行的命令
npx shadcn-vue@latest init
npx shadcn-vue@latest add button card input badge progress avatar separator
```

### 驗證方式

1. **核心依賴**: `radix-vue`, `class-variance-authority`, `clsx`, `tailwind-merge`
2. **配置文件**: `components.json`, `src/lib/utils.ts`
3. **組件結構**: 所有組件在 `src/components/ui/` 通過 CLI 生成

## 🚀 開始使用

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 構建
npm run build

# 類型檢查
npm run type-check
```

## 📱 頁面路由

| 路徑 | 頁面 | 說明 |
|------|------|------|
| `/` | Dashboard | 首頁 |
| `/create` | Create Split | 創建分帳 |
| `/assign/:id` | Assign Items | 分配項目 ⭐ |
| `/summary/:id` | Summary | 結算 |
| `/history` | History | 歷史記錄 |

## 🎨 組件使用示例

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent>
      <Button>Click me</Button>
    </CardContent>
  </Card>
</template>
```

## 📚 參考文檔

- [Shadcn-vue](https://www.shadcn-vue.com/)
- [設計系統文檔](./DESIGN_SYSTEM.md)
- [Vue 3](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## 👥 團隊協作

### 添加新組件
```bash
npx shadcn-vue@latest add [component-name]
```

### 開發規範
1. 使用 Shadcn-vue 組件保持統一風格
2. 從 `@/components/ui/*` 導入組件
3. 使用 TypeScript 類型安全
4. Composition API + `<script setup>`
5. Composables 管理共享狀態
=======
# web
>>>>>>> 74c5b1138e519f0749c5c4d67417096245a12ec2
