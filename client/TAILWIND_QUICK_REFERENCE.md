# Tailwind CSS Quick Reference - LifeTwin

## 🚀 Your Dev Server is Running

**Access your dashboard at: http://localhost:5173/**

---

## 📦 Installation Summary

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | Latest | Core CSS framework |
| `postcss` | Latest | CSS processing pipeline |
| `autoprefixer` | Latest | Vendor prefix support |

**Status**: ✅ All installed successfully via `npm install -D`

---

## 📂 Files Overview

### Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| `tailwind.config.js` | `/client/` | Theme customization & content paths |
| `postcss.config.js` | `/client/` | PostCSS plugin pipeline |
| `index.css` | `/client/src/` | Tailwind directives + custom styles |

### Component Files

| File | Location | Purpose |
|------|----------|---------|
| `DashboardTest.jsx` | `/client/src/` | Showcase component (visible now) |
| `App.jsx` | `/client/src/` | Entry component (updated) |

---

## 🎨 Essential Tailwind Classes

### Flexbox & Grid
```jsx
// Flexbox
<div className="flex items-center justify-between gap-4">
  {/* flex row, centered items, space between, gap 1rem */}
</div>

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 1 column mobile, 2 tablet, 3 desktop, gap 1.5rem */}
</div>
```

### Colors & Backgrounds
```jsx
// Text Colors
<p className="text-slate-900 dark:text-white">
  {/* Black in light mode, white in dark mode */}
</p>

// Background Colors
<div className="bg-primary-500 hover:bg-primary-600">
  {/* SaaS purple, darker on hover */}
</div>

// Gradients
<div className="bg-linear-to-r from-primary-500 to-blue-500">
  {/* Left to right gradient */}
</div>
```

### Spacing
```jsx
// Padding
<div className="p-6 px-8 py-4">
  {/* 1.5rem all, 2rem horizontal, 1rem vertical */}
</div>

// Margins
<div className="mt-4 mb-8 mx-auto">
  {/* Margin top, bottom, auto horizontal */}
</div>

// Gap (flex/grid)
<div className="flex gap-4">
  {/* 1rem gap between items */}
</div>
```

### Typography
```jsx
// Font Sizes
<h1 className="text-4xl font-bold">
  {/* 2.25rem, bold weight */}
</h1>

<p className="text-sm text-slate-600">
  {/* Smaller text, gray color */}
</p>

// Font Families (uses system fonts by default)
// Customize in tailwind.config.js if needed
```

### Borders & Shadows
```jsx
// Borders
<div className="border border-slate-200 rounded-lg">
  {/* 1px border, rounded corners */}
</div>

// Shadows
<div className="shadow-md hover:shadow-lg">
  {/* Medium shadow, larger on hover */}
</div>

// Combined
<button className="px-4 py-2 bg-primary-500 text-white 
                   rounded-lg shadow-md hover:shadow-lg transition">
  {/* Complete card/button styling */}
</button>
```

### Responsive Design
```jsx
// Mobile-first approach (default = mobile)
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Full width, 50% on md, 33% on lg */}
</div>

// Breakpoints
// sm: 640px    md: 768px    lg: 1024px    xl: 1280px    2xl: 1536px

<div className="text-base md:text-lg lg:text-xl">
  {/* Size increases on larger screens */}
</div>
```

### Dark Mode
```jsx
// Simple dark mode classes
<div className="bg-white dark:bg-slate-900">
  <p className="text-slate-900 dark:text-white">
    Adapts to system dark mode preference
  </p>
</div>

// Works with all utilities
<button className="bg-slate-200 dark:bg-slate-700
                   text-slate-900 dark:text-white
                   hover:bg-slate-300 dark:hover:bg-slate-600">
  Responsive to dark mode
</button>
```

### States & Transitions
```jsx
// Hover, Focus, Active
<button className="bg-primary-500 hover:bg-primary-600 
                   focus:outline-none focus:ring-2 focus:ring-primary-300
                   active:bg-primary-700">
  Interactive states
</button>

// Transitions
<div className="hover:shadow-lg transition duration-300">
  Smooth transition on hover
</div>
```

---

## 📱 Responsive Layout Example

```jsx
// Create responsive dashboard
export function Dashboard() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 
                   dark:from-slate-900 dark:to-slate-800 p-6">
      
      {/* Container */}
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 
                      text-slate-900 dark:text-white">
          Dashboard
        </h1>
        
        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg 
                        shadow-md hover:shadow-lg transition-shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Card Title</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Content here
            </p>
          </div>
          
          {/* More cards... */}
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 Creating New Components

### Card Component Template
```jsx
export function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg 
                    shadow-md hover:shadow-lg transition-shadow 
                    p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      {children}
    </div>
  );
}

// Usage:
<Card title="My Card">
  <p>Content here</p>
</Card>
```

### Button Component Template
```jsx
export function Button({ variant = 'primary', children, ...props }) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white',
    secondary: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
  };
  
  return (
    <button className={`${baseClasses} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}

// Usage:
<Button variant="primary">Click me</Button>
```

---

## 🔧 Customization

### Adding Custom Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      brand: {
        50: '#f9f5ff',
        500: '#a33bff',
        900: '#5f179a',
      }
    }
  }
}
```

Then use: `className="text-brand-500"` or `className="bg-brand-900"`

### Adding Custom Fonts
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    fontFamily: {
      display: ['Playfair Display', 'serif'],
      body: ['Inter', 'sans-serif'],
    }
  }
}
```

Then use: `className="font-display text-4xl"` or `className="font-body"`

### Adding Custom Animations
Edit `tailwind.config.js`:
```javascript
keyframes: {
  'slide-in': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(0)' },
  },
},
animation: {
  'slide-in': 'slide-in 0.3s ease-out',
}
```

Then use: `className="animate-slide-in"`

---

## 📊 Custom SaaS Colors Available

```
Primary Colors (use for accents/buttons):
- primary-50 through primary-900 (10 shades)
- Main: primary-500 = #a33bff (SaaS purple)

Dark Mode Colors:
- dark-50 through dark-900 (10 shades)
- For dashboard backgrounds: dark-800, dark-900

Default Tailwind Colors (all available):
- slate, gray, zinc, neutral, stone
- red, orange, amber, yellow, lime, green
- emerald, teal, cyan, sky, blue, indigo
- violet, purple, fuchsia, pink, rose
```

---

## ✅ Testing Your Setup

### Visit the Test Component
1. Open http://localhost:5173/
2. You should see the `DashboardTest` component
3. Verify:
   - ✅ Styled cards and buttons
   - ✅ Color palette displays
   - ✅ Responsive grid (resize browser)
   - ✅ Dark mode works (toggle in settings)

### Make a Change
1. Edit [src/DashboardTest.jsx](src/DashboardTest.jsx)
2. Change any Tailwind class: `text-4xl` → `text-5xl`
3. Browser should hot-reload automatically ✅

---

## 🚀 Building for Production

```bash
# Optimized production build
npm run build

# Output: dist/
# CSS will be purged to only used classes (~50KB vs ~500KB in dev)

# Preview production build locally
npm run preview
```

---

## 📚 Additional Resources

- **Tailwind Docs**: https://tailwindcss.com/docs
- **Component Examples**: https://tailwindui.com/
- **Colors**: https://tailwindcss.com/docs/customizing-colors
- **Responsive Design**: https://tailwindcss.com/docs/responsive-design
- **Dark Mode**: https://tailwindcss.com/docs/dark-mode

---

## 💡 Pro Tips

1. **Mobile-First**: Always define mobile classes first, then add `md:`, `lg:` for larger screens
2. **Reuse Classes**: Create React components to avoid repeating long className strings
3. **Extract Components**: Use `@layer` in CSS for frequently-used patterns
4. **Dark Mode**: Add `dark:` prefix to any class that should change in dark mode
5. **Use DevTools**: Install Tailwind CSS IntelliSense extension in VS Code for autocomplete

---

## 🎓 Common Mistakes to Avoid

❌ Don't: `className="w-${width}%"` (dynamic classes don't work)
✅ Do: Use predefined sizes or pass complete className strings

❌ Don't: Override Tailwind with inline styles when a utility exists
✅ Do: Use Tailwind utility first, customize config if needed

❌ Don't: Forget responsive prefixes for mobile
✅ Do: Think mobile-first: `w-full md:w-1/2 lg:w-1/3`

❌ Don't: Use same color for light and dark mode
✅ Do: Use `dark:` prefix for dark mode colors

---

## Support Files

📖 Setup Guide: [TAILWIND_SETUP.md](TAILWIND_SETUP.md)
📋 Architecture: [TAILWIND_ARCHITECTURE.md](TAILWIND_ARCHITECTURE.md)
🧪 Test Component: [src/DashboardTest.jsx](src/DashboardTest.jsx)

---

**Happy building! 🚀 Your Tailwind CSS is ready to use.**
