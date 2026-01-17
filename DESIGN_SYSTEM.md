# CoSplit Design System

## 🎨 Design Philosophy

This project uses **Shadcn-vue** components with a **minimalist black & white** color scheme for a clean, modern aesthetic.

## 📦 Tech Stack

- **Vue 3** + TypeScript
- **Shadcn-vue** - Headless UI components
- **Radix Vue** - Accessible primitives
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Modern icon library

## 🎨 Color System

### Base Colors (Zinc Palette)
```css
--primary: 240 5.9% 10%        /* Almost black */
--secondary: 240 4.8% 95.9%    /* Light gray */
--muted: 240 4.8% 95.9%        /* Muted gray */
--accent: 240 4.8% 95.9%       /* Accent gray */
--border: 240 5.9% 90%         /* Border gray */
```

### Member Assignment Colors
```typescript
const MEMBER_COLORS = [
  '#18181b', // zinc-900
  '#3f3f46', // zinc-700
  '#71717a', // zinc-500
  '#a1a1aa', // zinc-400
  '#0a0a0a', // black variant 1
  '#262626', // black variant 2
  '#404040', // black variant 3
  '#525252', // black variant 4
]
```

### Semantic Colors
- **Success**: Default primary (black)
- **Destructive**: Red for errors/delete actions
- **Warning**: Use muted colors with borders

## 🧩 Component Library

### Core UI Components

All components are located in `src/components/ui/`

#### Button
```vue
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost">Tertiary Action</Button>
<Button variant="link">Link Style</Button>
```

**Variants:**
- `default` - Solid black background
- `outline` - Border with transparent background
- `secondary` - Light gray background
- `ghost` - Transparent, shows on hover
- `destructive` - Red for dangerous actions
- `link` - Underlined text

**Sizes:**
- `default` - Standard height (36px)
- `sm` - Small (32px)
- `lg` - Large (40px)
- `icon` - Square for icons only

#### Card
```vue
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer actions
  </CardFooter>
</Card>
```

#### Input
```vue
<Input
  v-model="value"
  type="text"
  placeholder="Enter text..."
/>
```

#### Badge
```vue
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
```

#### Progress
```vue
<Progress :model-value="50" :max="100" />
```

#### Avatar
```vue
<Avatar
  fallback="JD"
  alt="John Doe"
/>
```

#### Separator
```vue
<Separator orientation="horizontal" />
<Separator orientation="vertical" />
```

## 📐 Layout Patterns

### Page Structure
```vue
<div class="min-h-screen bg-background">
  <!-- Header -->
  <header class="border-b">
    <div class="container mx-auto px-4 py-4">
      <!-- Header content -->
    </div>
  </header>

  <!-- Main Content -->
  <main class="container mx-auto px-4 py-8">
    <!-- Page content -->
  </main>
</div>
```

### Responsive Grid
```vue
<!-- 1 column on mobile, 2 on tablet, 3 on desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Grid items -->
</div>
```

### Card Hover Effect
```vue
<Card class="cursor-pointer hover:shadow-md transition-shadow">
  <!-- Content -->
</Card>
```

## 🎯 Component Composition Patterns

### Dashboard Stats Widget
```vue
<Card>
  <CardContent class="p-6 flex items-center gap-4">
    <div class="rounded-full bg-muted p-3">
      <Icon class="w-5 h-5" />
    </div>
    <div>
      <p class="text-2xl font-bold">{{ value }}</p>
      <p class="text-sm text-muted-foreground">{{ label }}</p>
    </div>
  </CardContent>
</Card>
```

### List Item with Avatar
```vue
<div class="flex items-center justify-between p-4 rounded-lg border">
  <div class="flex items-center gap-3">
    <Avatar :fallback="name[0]" />
    <div>
      <p class="font-medium">{{ name }}</p>
      <p class="text-sm text-muted-foreground">{{ subtitle }}</p>
    </div>
  </div>
  <Badge>{{ status }}</Badge>
</div>
```

## 🎭 Interaction States

### Hover States
- Cards: `hover:shadow-md`
- Buttons: Built into variants
- List items: `hover:bg-accent`

### Focus States
- All interactive elements have `focus-visible:ring-1 focus-visible:ring-ring`

### Disabled States
- `disabled:pointer-events-none disabled:opacity-50`

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

## 🎨 Typography Scale

```css
text-xs: 0.75rem     /* 12px */
text-sm: 0.875rem    /* 14px */
text-base: 1rem      /* 16px */
text-lg: 1.125rem    /* 18px */
text-xl: 1.25rem     /* 20px */
text-2xl: 1.5rem     /* 24px */
text-3xl: 1.875rem   /* 30px */
text-4xl: 2.25rem    /* 36px */
```

## 📏 Spacing System

```css
p-1: 0.25rem   /* 4px */
p-2: 0.5rem    /* 8px */
p-3: 0.75rem   /* 12px */
p-4: 1rem      /* 16px */
p-6: 1.5rem    /* 24px */
p-8: 2rem      /* 32px */
```

## 🔧 Utility Functions

### cn() - Class Name Merger
```typescript
import { cn } from '@/lib/utils'

// Merges Tailwind classes properly
<div :class="cn('base-class', props.class)" />
```

### formatCurrency()
```typescript
import { formatCurrency } from '@/utils/currency'

formatCurrency(45.99) // "$45.99"
```

### getColorForIndex()
```typescript
import { getColorForIndex } from '@/utils/colors'

const color = getColorForIndex(0) // Returns first member color
```

## 🗂️ File Structure

```
src/
├── components/
│   ├── ui/                 # Shadcn-vue base components
│   ├── common/             # App-specific reusable components
│   ├── dashboard/          # Dashboard feature components
│   ├── upload/             # Upload flow components
│   ├── members/            # Member management components
│   └── assign/             # Assignment feature components
│
├── views/                  # Page components
│   ├── DashboardView.vue
│   ├── CreateSplitView.vue
│   ├── AssignItemsView.vue
│   ├── SummaryView.vue
│   └── HistoryView.vue
│
├── composables/            # Vue composables for state
├── types/                  # TypeScript definitions
├── utils/                  # Utility functions
└── router/                 # Vue Router config
```

## 🎯 Best Practices

### Component Usage
1. Always import from `@/components/ui/` for consistency
2. Use `cn()` utility when combining classes
3. Prefer composition over prop-heavy components
4. Keep components focused and single-purpose

### Styling
1. Use Tailwind utilities first
2. Leverage CSS variables for theming
3. Keep custom CSS minimal
4. Use semantic color names (primary, secondary) not specific colors

### State Management
1. Use composables for shared state
2. Keep component-specific state local
3. Persist important data to localStorage
4. Use TypeScript for type safety

### Accessibility
1. All buttons have proper labels
2. Interactive elements are keyboard accessible
3. Color is not the only indicator
4. Use semantic HTML

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## 📚 Resources

- [Shadcn-vue Docs](https://www.shadcn-vue.com/)
- [Radix Vue](https://www.radix-vue.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
