# Folder Structure Documentation

This project follows React/TypeScript best practices with a feature-based architecture.

## 📁 Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements (buttons, inputs, cards)
│   └── layout/          # Layout components (header, footer, sidebar)
├── features/            # Feature-based modules
│   ├── templates/       # Website template showcase
│   ├── pharmacy-tools/  # Pharmacy calculation tools
│   └── hmr-system/      # Home Medicine Reviews system
├── pages/               # Page components and routing
├── hooks/               # Custom React hooks
├── utils/               # Utility functions and helpers
├── services/            # API calls and external services
├── types/               # TypeScript type definitions
├── context/             # React Context providers
├── assets/              # Static assets
│   ├── images/          # Image files
│   └── icons/           # Icon files
└── styles/              # Global styles and theme
```

## 🏗️ Architecture Principles

### 1. Feature-Based Organization
Each major feature has its own folder with:
- `components/` - Feature-specific components
- `hooks/` - Feature-specific hooks
- `services/` - Feature-specific API calls
- `types/` - Feature-specific TypeScript types

### 2. Component Categories
- **UI Components**: Basic, reusable elements (Button, Input, Card)
- **Layout Components**: Structure elements (Header, Footer, Sidebar)
- **Feature Components**: Business logic components specific to features

### 3. Import Patterns
- Use barrel exports (`index.ts`) for clean imports
- Prefer relative imports within features
- Use absolute imports with path mapping for cross-feature imports

### 4. TypeScript Integration
- Shared types in `/types`
- Feature-specific types in feature folders
- Strict typing for props and API responses

## 🚀 Benefits

- **Scalability**: Easy to add new features without refactoring
- **Maintainability**: Clear separation of concerns
- **Reusability**: Shared components and utilities
- **Developer Experience**: Consistent patterns and easy navigation
- **Team Collaboration**: Clear ownership and boundaries