# Wing App Setup Guide

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Settings > API
3. Copy your Project URL and anon public key
4. Add them to your `.env.local` file

### 3. Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### 4. Mobile Development

#### Prerequisites
- **iOS**: Xcode (macOS only)
- **Android**: Android Studio

#### Setup Mobile Platforms

```bash
# Build the web app
npm run build:mobile

# Add mobile platforms (run once)
npx cap add ios
npx cap add android

# Sync and open
npm run run:ios     # For iOS
npm run run:android # For Android
```

## 📱 Mobile-Specific Features

### Capacitor Plugins

The app is configured with these Capacitor plugins:
- **Splash Screen**: 2-second white background
- **Status Bar**: Dark theme
- **Android Scheme**: HTTPS for security

### Platform Detection

Use the `usePlatform` hook to detect the current platform:

```tsx
import { usePlatform, useIsMobile, useIsNative } from '@/hooks/usePlatform'

function MyComponent() {
  const platform = usePlatform() // 'web' | 'ios' | 'android' | 'unknown'
  const isMobile = useIsMobile()  // boolean
  const isNative = useIsNative()  // boolean
  
  return (
    <div>
      {isMobile && <MobileSpecificComponent />}
      {platform === 'ios' && <iOSSpecificComponent />}
    </div>
  )
}
```

### Mobile Navigation

The app includes a mobile-optimized navigation component that automatically shows on mobile devices:

```tsx
import { MobileNavigation } from '@/components/MobileNavigation'

function Layout() {
  return (
    <div>
      <MobileNavigation />
      {/* Your content */}
    </div>
  )
}
```

## 🔧 Configuration Files

### Next.js (`next.config.ts`)
- Static export enabled for Capacitor
- Image optimization disabled for static export
- Trailing slash enabled

### Capacitor (`capacitor.config.ts`)
- App ID: `com.wingapp.app`
- Web directory: `out`
- Android scheme: HTTPS
- Splash screen and status bar configured

### Tailwind CSS
- Configured with Shadcn/ui
- Mobile-first responsive design
- Dark mode support

## 🚀 Deployment

### Web Deployment
1. Build: `npm run build`
2. Deploy the `out` directory to Vercel, Netlify, etc.

### Mobile Deployment
1. Build: `npm run build:mobile`
2. Sync: `npm run sync:ios` or `npm run sync:android`
3. Open in Xcode/Android Studio
4. Build and deploy to app stores

## 🛠️ Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:mobile` | Build for mobile |
| `npm run sync:ios` | Sync iOS project |
| `npm run sync:android` | Sync Android project |
| `npm run open:ios` | Open iOS in Xcode |
| `npm run open:android` | Open Android in Android Studio |
| `npm run run:ios` | Build + Sync + Open iOS |
| `npm run run:android` | Build + Sync + Open Android |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript checks |

## 📁 Project Structure

```
wing-app/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn/ui components
│   │   └── MobileNavigation.tsx
│   ├── hooks/              # Custom hooks
│   │   └── usePlatform.ts
│   └── lib/                # Utilities
│       ├── supabase.ts     # Supabase client
│       └── utils.ts        # General utilities
├── public/                 # Static assets
├── android/                # Android project (generated)
├── ios/                    # iOS project (generated)
├── capacitor.config.ts     # Capacitor config
├── next.config.ts          # Next.js config
└── components.json         # Shadcn/ui config
```

## 🔐 Security Notes

- Environment variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Supabase handles authentication and database security
- Android scheme is set to HTTPS for secure connections
- All sensitive data should be handled server-side

## 🐛 Troubleshooting

### Common Issues

1. **Build fails**: Make sure all dependencies are installed with `npm install`
2. **Mobile sync fails**: Ensure you've run `npm run build:mobile` first
3. **iOS build fails**: Check Xcode installation and iOS simulator
4. **Android build fails**: Check Android Studio and SDK installation
5. **Supabase connection fails**: Verify your environment variables

### Getting Help

- Check the [Next.js documentation](https://nextjs.org/docs)
- Check the [Capacitor documentation](https://capacitorjs.com/docs)
- Check the [Shadcn/ui documentation](https://ui.shadcn.com)
- Check the [Supabase documentation](https://supabase.com/docs)
