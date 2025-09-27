# Wing App

A production-grade cross-platform application built with Next.js, Capacitor, Shadcn/ui, Supabase, and Tailwind CSS. This single codebase runs on web, iOS, and Android.

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Mobile**: Capacitor 7 for iOS and Android
- **UI**: Shadcn/ui components with Tailwind CSS
- **Database**: Supabase for backend and authentication
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4

## 📱 Features

- Single codebase for web and mobile
- Modern UI with Shadcn/ui components
- Responsive design with Tailwind CSS
- TypeScript for type safety
- Supabase integration ready
- PWA support
- Production-ready configuration

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- iOS development: Xcode (for iOS builds)
- Android development: Android Studio (for Android builds)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd wing-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

#### Web Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Mobile Development

1. Build the web app:
```bash
npm run build:mobile
```

2. Add mobile platforms:
```bash
npx cap add ios
npx cap add android
```

3. Sync and open in native IDEs:
```bash
# For iOS
npm run run:ios

# For Android  
npm run run:android
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:mobile` - Build for mobile deployment
- `npm run sync:ios` - Sync iOS project
- `npm run sync:android` - Sync Android project
- `npm run open:ios` - Open iOS project in Xcode
- `npm run open:android` - Open Android project in Android Studio
- `npm run run:ios` - Build and open iOS project
- `npm run run:android` - Build and open Android project
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📁 Project Structure

```
wing-app/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   └── ui/            # Shadcn/ui components
│   └── lib/               # Utility functions
│       ├── supabase.ts    # Supabase client
│       └── utils.ts       # General utilities
├── public/                # Static assets
├── android/               # Android project (generated)
├── ios/                   # iOS project (generated)
├── capacitor.config.ts    # Capacitor configuration
└── next.config.ts         # Next.js configuration
```

## 🔧 Configuration

### Capacitor Configuration

The app is configured to use static export (`out` directory) for mobile deployment. This is set in `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.wingapp.app',
  appName: 'Wing App',
  webDir: 'out',
  // ... other config
};
```

### Next.js Configuration

Static export is enabled in `next.config.ts` for Capacitor compatibility:

```typescript
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};
```

## 🚀 Deployment

### Web Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `out` directory to your hosting service (Vercel, Netlify, etc.)

### Mobile Deployment

1. Build and sync:
```bash
npm run build:mobile
npm run sync:ios
npm run sync:android
```

2. Open in native IDEs and build for app stores:
```bash
npm run open:ios    # Opens Xcode
npm run open:android # Opens Android Studio
```

## 📱 Mobile-Specific Features

- **Status Bar**: Configured for dark theme
- **Splash Screen**: 2-second duration with white background
- **PWA Support**: Manifest file included
- **Responsive Design**: Mobile-first approach
- **Touch Optimized**: Large touch targets and gestures

## 🔐 Supabase Setup

1. Create a new Supabase project
2. Get your project URL and anon key
3. Add them to your `.env.local` file
4. Configure authentication and database as needed

## 🎨 UI Components

This project uses Shadcn/ui components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

Available components include Button, Card, Input, Dialog, Sheet, and more.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both web and mobile
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.