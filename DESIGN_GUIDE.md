# 🎨 SplitWise 設計指南 - 奶茶色系

## 設計理念

**簡約 • 溫馨 • 乾淨**

我們採用溫暖的奶茶色系，營造出親切、舒適的使用體驗，讓分帳這件事變得更有溫度。

---

## 🎨 色彩系統 - Milk Tea Palette

### 主色調
```
奶蓋白 (Background)    oklch(0.97 0.01 40)   #F5EBE0
珍珠黑 (Text)          oklch(0.25 0.02 30)   #3E3E3E
```

### 品牌色
```
奶茶棕 (Primary)       oklch(0.55 0.08 45)   #A0826D
焦糖色 (Accent)        oklch(0.88 0.04 42)   #D4B5A0
淺奶茶 (Secondary)     oklch(0.92 0.02 40)   #E8DDD0
```

### 成員標識色 (8種奶茶口味)
```css
#A0826D  /* 經典奶茶 */
#C9A88A  /* 焦糖奶茶 */
#8B6F47  /* 深焦糖 */
#D4B5A0  /* 淺奶茶 */
#9B7E5E  /* 巧克力奶茶 */
#B8956F  /* 榛果奶茶 */
#7A5C42  /* 黑糖奶茶 */
#CDB8A3  /* 香草奶茶 */
```

---

## 📐 設計原則

### 1. 圓潤感
- 按鈕圓角：`12px` (0.75rem)
- 卡片圓角：`12px`
- 圖標容器：`16px` (rounded-xl)
- 避免尖銳的直角，營造溫暖感

### 2. 留白與呼吸感
- 卡片內邊距：`p-6` (24px) 或 `p-8` (32px)
- 區塊間距：`gap-5` (20px) 或 `mb-10` (40px)
- 最大寬度限制：`max-w-6xl` 保持內容集中

### 3. 漸層與層次
- 微妙漸層：`bg-gradient-to-br from-card to-primary/5`
- 邊框左側強調：`border-l-4` 搭配品牌色
- 陰影層次：
  - 靜態：`shadow-sm`
  - Hover：`shadow-lg`

### 4. 動畫過渡
- 標準過渡：`transition-all duration-200`
- Hover 縮放：`hover:scale-[1.02]`
- 陰影變化：`hover:shadow-lg`

---

## 🧩 組件設計規範

### Header (頁首)
```vue
<header class="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
  <!-- Logo + 品牌名 -->
  <div class="flex items-center gap-3">
    <div class="w-10 h-10 rounded-full bg-primary/10">
      <Receipt class="text-primary" />
    </div>
    <div>
      <h1 class="text-2xl font-bold tracking-tight">SplitWise</h1>
      <p class="text-xs text-muted-foreground">Smart Receipt Splitter</p>
    </div>
  </div>
</header>
```

特點：
- 毛玻璃效果 `backdrop-blur-sm`
- 淡化邊框 `border-border/40`
- 固定在頂部 `sticky top-0`

### Action Card (操作卡片)
```vue
<Card class="hover:shadow-lg hover:scale-[1.02] transition-all border-primary/20">
  <CardContent class="p-8">
    <!-- 圓角圖標 -->
    <div class="w-14 h-14 rounded-2xl bg-primary shadow-md">
      <Icon class="text-primary-foreground" />
    </div>
    <!-- 標題 + 描述 -->
    <h3 class="font-bold text-xl">Title</h3>
    <p class="text-sm text-muted-foreground">Description</p>
  </CardContent>
</Card>
```

特點：
- **純色扁平設計，無漸層**
- Hover 時輕微放大
- 大尺寸圖標容器 (56px)

### Stats Card (統計卡片)
```vue
<Card class="border-l-4 border-l-primary/40">
  <CardContent class="p-6">
    <!-- 圖標 -->
    <div class="w-12 h-12 rounded-xl bg-primary/10">
      <Icon class="text-primary" />
    </div>
    <!-- 數字 -->
    <p class="text-3xl font-bold">123</p>
    <!-- 標籤 -->
    <p class="text-sm text-muted-foreground font-medium">Label</p>
  </CardContent>
</Card>
```

特點：
- 左側彩色邊框作為視覺識別
- 大數字強調 (text-3xl)
- 淺色圖標背景

### List Item Card (列表項卡片)
```vue
<Card class="hover:shadow-lg hover:border-primary/20 transition-all">
  <CardContent class="p-6">
    <div class="flex items-center justify-between">
      <!-- 左側：圖標 + 信息 -->
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-primary/10">
          <Icon />
        </div>
        <div>
          <h3 class="font-bold text-lg">Title</h3>
          <p class="text-sm text-muted-foreground">Details</p>
        </div>
      </div>
      <!-- 右側：金額 -->
      <p class="text-2xl font-bold">$123.45</p>
    </div>
  </CardContent>
</Card>
```

---

## 📝 排版規範

### 字體大小
```css
頁面標題     text-3xl (30px)
區塊標題     text-2xl (24px)
卡片標題     text-xl (20px)
正文         text-base (16px)
輔助文字     text-sm (14px)
標籤/小字    text-xs (12px)
```

### 字重
```css
標題         font-bold (700)
次要標題     font-semibold (600)
正文         font-medium (500)
輔助         font-normal (400)
```

---

## 🎯 間距系統

### 組件內部
```css
p-6   (24px)  - 標準卡片內邊距
p-8   (32px)  - 大卡片內邊距
gap-3 (12px)  - 小間距
gap-4 (16px)  - 標準間距
gap-5 (20px)  - 大間距
```

### 區塊間距
```css
mb-5  (20px)  - 小區塊間距
mb-8  (32px)  - 標準區塊間距
mb-10 (40px)  - 大區塊間距
```

---

## 🖱️ 互動狀態

### Hover 效果
```css
/* 卡片 */
hover:shadow-lg
hover:scale-[1.02]
hover:border-primary/20

/* 按鈕 */
hover:bg-primary/90
hover:shadow-md

/* 過渡 */
transition-all duration-200
```

### Focus 狀態
```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-primary
```

---

## 🎨 背景效果

### 純色背景（無漸層）
```css
bg-card               /* 卡片背景 */
bg-primary/10         /* 淺色背景 */
bg-accent/20          /* 強調色背景 */
bg-secondary          /* 次要色背景 */
```

### 毛玻璃效果
```css
bg-card/50 backdrop-blur-sm  /* 半透明毛玻璃 */
```

**設計原則：保持扁平化，不使用漸層效果**

---

## 📱 響應式設計

### 斷點
```css
默認         < 768px   (Mobile)
md:          ≥ 768px   (Tablet)
lg:          ≥ 1024px  (Desktop)
```

### Grid 布局
```css
/* 手機 1列，平板以上 2列 */
grid grid-cols-1 md:grid-cols-2

/* 手機 1列，平板以上 3列 */
grid grid-cols-1 md:grid-cols-3
```

---

## ✨ 設計細節

### 圖標容器
```vue
<!-- 小圖標 (40px) -->
<div class="w-10 h-10 rounded-full bg-primary/10">
  <Icon class="w-5 h-5 text-primary" />
</div>

<!-- 中圖標 (48px) -->
<div class="w-12 h-12 rounded-xl bg-primary/10">
  <Icon class="w-6 h-6 text-primary" />
</div>

<!-- 大圖標 (56px) -->
<div class="w-14 h-14 rounded-2xl bg-primary">
  <Icon class="w-7 h-7 text-primary-foreground" />
</div>
```

### 陰影層次
```css
shadow-sm     /* 輕微陰影 */
shadow-md     /* 標準陰影 */
shadow-lg     /* 明顯陰影 (Hover) */
```

---

## 🎯 典型頁面布局

```vue
<div class="min-h-screen bg-background">
  <!-- 固定頁首 -->
  <header class="sticky top-0 z-10 border-b bg-card/50 backdrop-blur-sm">
    ...
  </header>

  <!-- 主內容區 -->
  <main class="container mx-auto px-6 py-8 max-w-6xl">
    <!-- 歡迎區 -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold mb-2">Title</h2>
      <p class="text-muted-foreground">Subtitle</p>
    </div>

    <!-- 內容區塊 -->
    <div class="space-y-10">
      <!-- Section 1 -->
      <!-- Section 2 -->
    </div>
  </main>
</div>
```

---

## 🚀 開發建議

### 使用現有組件
✅ 優先使用 Shadcn-vue 組件保持統一性
✅ 遵循設計系統的色彩和間距規範
✅ 保持動畫過渡的一致性

### 擴展組件
✅ 在組件基礎上添加自定義類名
✅ 使用 Tailwind utilities 調整樣式
✅ 保持可訪問性 (a11y)

### 避免事項
❌ 不要使用鮮艷刺眼的顏色
❌ 不要過度使用動畫
❌ 不要破壞統一的圓角系統

---

## 📸 設計範例

可參考 [DashboardView.vue](src/views/DashboardView.vue) 查看完整實現。

---

**設計原則：簡約但不簡單，溫暖但不失專業** ☕
