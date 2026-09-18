# TalentVerse - Local Development Setup Guide

## Prerequisites

Before you begin, make sure you have the following installed on your computer:

### 1. **Node.js & npm/pnpm**
- **Download Node.js**: https://nodejs.org/ (LTS version recommended, v18 or higher)
- This includes npm by default
- **Verify installation**:
  ```bash
  node --version
  npm --version
  ```

### 2. **Git** (Optional but recommended)
- **Download Git**: https://git-scm.com/
- **Verify installation**:
  ```bash
  git --version
  ```

### 3. **Code Editor** (Recommended)
- **VS Code**: https://code.visualstudio.com/
- **WebStorm**: https://www.jetbrains.com/webstorm/
- Or any text editor of your choice

---

## Installation Steps

### Step 1: Download the Project

**Option A: Using Git (Recommended)**
```bash
# Clone the repository (replace with your actual repo URL if available)
git clone <your-repository-url> talentverse
cd talentverse
```

**Option B: Download ZIP**
1. Download the project files as a ZIP from Manus
2. Extract the ZIP to your desired location
3. Open terminal/command prompt and navigate to the folder:
   ```bash
   cd path/to/talentverse
   ```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install
# OR if you prefer pnpm (faster):
pnpm install
```

This will download all the necessary libraries and dependencies (React, Tailwind CSS, etc.).

**Expected time**: 2-5 minutes depending on your internet speed

### Step 3: Start the Development Server

```bash
# Start the local development server
npm run dev
# OR with pnpm:
pnpm dev
```

**Expected output**:
```
➜  Local:   http://localhost:3000/
➜  Network: http://192.168.x.x:3000/
```

### Step 4: Open in Browser

- Open your web browser
- Navigate to: **http://localhost:3000/**
- You should see the TalentVerse landing page with all animations and glowing effects

---

## Project Structure

```
talentverse/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Home.tsx          # Main landing page
│   │   ├── components/
│   │   │   ├── AnimatedElements.tsx  # Reusable animated components
│   │   │   └── ui/               # UI components (buttons, cards, etc.)
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # React entry point
│   │   └── index.css             # Global styles & animations
│   ├── index.html                # HTML template
│   └── public/                   # Static assets
├── package.json                  # Dependencies & scripts
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── vite.config.ts                # Vite build configuration
```

---

## Available Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Check TypeScript errors
npm run check

# Format code with Prettier
npm run format
```

---

## Troubleshooting

### Issue: Port 3000 is already in use

**Solution**: The dev server will automatically try the next available port. Check the terminal output for the correct URL.

Or manually specify a different port:
```bash
npm run dev -- --port 3001
```

### Issue: Dependencies installation fails

**Solution**: Clear npm cache and try again:
```bash
npm cache clean --force
npm install
```

Or use pnpm (which is faster and more reliable):
```bash
npm install -g pnpm
pnpm install
pnpm dev
```

### Issue: Animations not showing

**Solution**: 
1. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
3. Make sure JavaScript is enabled in your browser

### Issue: Styles not loading correctly

**Solution**:
1. Stop the dev server (Ctrl+C)
2. Delete `node_modules` folder and `.next` or `.vite` cache
3. Reinstall dependencies: `npm install`
4. Restart: `npm run dev`

---

## Making Changes

### Edit the Landing Page
- **File**: `client/src/pages/Home.tsx`
- Changes will automatically reload in your browser (Hot Module Reload)

### Edit Styles
- **File**: `client/src/index.css`
- Global animations and theme colors are defined here

### Edit Animations
- **File**: `client/src/components/AnimatedElements.tsx`
- Reusable animated components

### Edit Colors & Theme
- **File**: `client/src/index.css`
- Look for CSS variables in `:root` and `.dark` sections
- Update OKLCH color values to change the theme

---

## Customization Guide

### Change Primary Color
In `client/src/index.css`, find and modify:
```css
:root {
  --glow-purple: #a855f7;  /* Change this hex color */
  --glow-blue: #3b82f6;
  --glow-pink: #ec4899;
  --glow-orange: #f97316;
}
```

### Adjust Animation Speed
In `client/src/index.css`, modify animation durations:
```css
@keyframes float {
  /* Change 4s to make floating faster/slower */
  animation: float 4s ease-in-out infinite;
}
```

### Add New Sections
1. Create a new component in `client/src/components/`
2. Import and add it to `client/src/pages/Home.tsx`
3. Style using Tailwind CSS classes

---

## Performance Tips

1. **Use pnpm instead of npm** - It's faster and uses less disk space
2. **Enable SSD** - Development is much faster on SSD drives
3. **Close unnecessary browser tabs** - Reduces memory usage
4. **Use VS Code** - Excellent TypeScript and React support

---

## Production Deployment

When you're ready to deploy:

```bash
# Build for production
npm run build

# This creates an optimized production build in the dist/ folder
# You can then deploy this folder to:
# - Vercel (https://vercel.com)
# - Netlify (https://netlify.com)
# - GitHub Pages
# - Your own server
```

---

## Getting Help

- **React Documentation**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Vite Documentation**: https://vitejs.dev
- **TypeScript**: https://www.typescriptlang.org

---

## Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Start dev server | `npm run dev` |
| Build for production | `npm run build` |
| Preview production build | `npm run preview` |
| Check for errors | `npm run check` |
| Format code | `npm run format` |

---

## Next Steps

1. ✅ Install and run locally
2. 📝 Customize colors and content
3. 🎨 Add your own sections
4. 🚀 Deploy to production

Happy coding! 🚀✨
