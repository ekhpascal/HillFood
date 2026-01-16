# HillFood 🍳

A modern Progressive Web App (PWA) for managing your personal recipe database with real-time sync capabilities.

## Features

- 📝 **Easy Recipe Entry** - Add recipes with ingredients, instructions, photos, and more
- 🔍 **Quick Search** - Find recipes instantly by title, description, or category
- 🔄 **Multi-User Sync** - Share recipes between users with Supabase backend
- 📱 **PWA Support** - Install on any device and use offline
- 🎨 **Modern UI** - Clean, responsive design with TailwindCSS
- ⚡ **Fast** - Built with Vite for lightning-fast development and builds

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **PWA**: vite-plugin-pwa with Workbox

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available at [supabase.com](https://supabase.com))

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Set up Supabase database**

Run this SQL in your Supabase SQL Editor to create the recipes table:

```sql
-- Create recipes table
create table recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text not null,
  ingredients text[] not null,
  instructions text[] not null,
  prep_time integer default 0,
  cook_time integer default 0,
  servings integer default 4,
  category text default 'Main Course',
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table recipes enable row level security;

-- Create policies
create policy "Users can view all recipes"
  on recipes for select
  using (true);

create policy "Users can insert their own recipes"
  on recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recipes"
  on recipes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own recipes"
  on recipes for delete
  using (auth.uid() = user_id);

-- Create index for better search performance
create index recipes_title_idx on recipes using gin(to_tsvector('english', title));
create index recipes_user_id_idx on recipes(user_id);
```

4. **Run the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
HillFood/
├── src/
│   ├── components/       # Reusable React components
│   │   ├── Layout.tsx
│   │   ├── Navigation.tsx
│   │   └── RecipeCard.tsx
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── Recipes.tsx
│   │   ├── AddRecipe.tsx
│   │   └── RecipeDetail.tsx
│   ├── services/         # API and service layers
│   │   ├── supabase.ts
│   │   └── recipeService.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # TailwindCSS configuration
└── package.json
```

## Features Roadmap

### Current Features ✅
- Recipe CRUD operations
- Search functionality
- Category filtering
- PWA installation
- Responsive design

### Planned Features 🎯
- User authentication
- Recipe sharing between users
- Recipe collections/favorites
- Meal planning
- Shopping list generation
- Photo upload to Supabase Storage
- Recipe ratings and comments
- Import from URLs
- Export to PDF
- Offline mode with sync

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT
