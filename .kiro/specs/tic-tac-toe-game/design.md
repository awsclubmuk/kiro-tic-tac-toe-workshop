# Design Document

## Spider-Man Tic-Tac-Toe Game Design

## 1. High-Level Architecture

### System Components

- **Frontend UI Layer**: React/Vue component-based architecture with Tailwind CSS
- **Game State Management**: Centralized game logic handling board state, players, turns
- **Data Persistence Layer**: Local storage for game history, leaderboards, player metrics
- **AI Engine**: CPU opponent with difficulty-based strategy selection

### Technology Stack

- **UI Framework**: React/Vue.js
- **Styling**: Tailwind CSS + Custom CSS
- **State Management**: Context API / Vuex
- **Storage**: LocalStorage / IndexedDB for persistence
- **Build Tool**: Vite / Webpack

## 2. Spider-Man Theme Color Palette

### Primary Colors
- **Web Red**: `#DC143C` (Crimson) - Main primary color for Spider-Man
- **Deep Blue**: `#001F3F` - Secondary color from suit
- **Black**: `#000000` - Accent and borders
- **Web Yellow**: `#FFD700` - Accent highlights

#### Tailwind Custom Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'spiderman': {
          'red': '#DC143C',
          'blue': '#001F3F',
          'web': '#FFD700',
          'dark': '#0a0a0a',
          'light': '#f8f9fa'
        }
      },
      boxShadow: {
        'web': '0 0 20px rgba(220, 20, 60, 0.6)',
        'web-lg': '0 0 30px rgba(220, 20, 60, 0.8)',
      },
      backgroundImage: {
        'web-pattern': 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 10 Q5 5 10 10 T20 10\' stroke=\'%23DC143C\' fill=\'none\' opacity=\'0.1\'/%3E%3C/svg%3E")',
      }
    }
  }
}
```

### 3. UI Component Design

#### Game Container
- **Background**: Dark navy/black (`bg-spiderman-dark`) with web pattern overlay
- **Border**: Crimson red gradient border with glow effect (`shadow-web-lg`)
- **Layout**: Centered, responsive grid container

#### Board Grid
- **Grid Layout**: 3x3 to 10x10 customizable (CSS Grid)
- **Cell Styling**:
  - Empty cells: Dark blue background with web pattern
  - Occupied cells: Gradient effect based on player symbol
  - Hover effect: Glow shadow in Spider-Man red
  - Active state: Bright red border with animation

#### Cell Styling (Tailwind + CSS)

```css
/* Tailwind Classes */
@apply w-16 h-16 bg-gradient-to-br from-spiderman-dark to-spiderman-blue
       border-2 border-spiderman-red rounded-lg
       cursor-pointer transition-all duration-300
       hover:shadow-web hover:scale-105 active:scale-95
       flex items-center justify-center text-3xl font-bold

/* Player 1 Symbol (Spider-Man Red Theme) */
.cell-player1 {
  @apply text-spiderman-red;
  text-shadow: 0 0 10px rgba(220, 20, 60, 0.8);
}

/* Player 2 Symbol (Web Yellow Theme) */
.cell-player2 {
  @apply text-spiderman-web;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}
```

#### Header Section
- **Title**: "Spider-Man Tic-Tac-Toe" with web pattern background
- **Styling**: Large, bold text in red with glow effect
- **Navigation**: Player info, difficulty selector, game mode toggle

#### Player Indicator
- **Current Player Display**: Shows whose turn it is
- **Styling**:
  - Player 1: Red background with white text
  - Player 2: Yellow background with blue text
  - CPU: Blue background with red text
- **Animation**: Pulse effect during active turn

#### Buttons
- **Primary Button** (Play, Start Game):
  ```css
  @apply bg-gradient-to-r from-spiderman-red to-red-700
         text-white px-6 py-3 rounded-lg font-bold
         hover:shadow-web-lg hover:scale-110
         transition-all duration-300
         active:scale-95
  ```

- **Secondary Button** (Reset, Replay):
  ```css
  @apply bg-spiderman-blue text-spiderman-web
         border-2 border-spiderman-red px-6 py-3 rounded-lg
         hover:bg-spiderman-dark hover:shadow-web
         transition-all duration-300
  ```

#### Stats & Leaderboard Panel
- **Background**: Semi-transparent dark blue with red border
- **Text**: Yellow/Gold for stats, white for labels
- **Layout**: Vertical card list with hover effects

### 4. Responsive Design

#### Breakpoints (Tailwind)
- **sm** (640px): Stack layout, smaller board cells
- **md** (768px): Two-column layout for stats
- **lg** (1024px): Three-column layout with sidebar
- **xl** (1280px): Full dashboard layout

#### Mobile Optimization
- **Touch Targets**: Minimum 44x44px for cells
- **Responsive Grid**: Scales from 3x3 board fitting on small screens
- **Stacked Layout**: Controls below board on mobile

### 5. Animation & Visual Effects

#### Transitions
- **Cell Hover**: Scale up with glow shadow
- **Cell Click**: Brief scale-down animation
- **Win Animation**: Flash effect on winning cells with red/yellow pulse
- **Board Load**: Staggered fade-in animation

#### CSS Animations

```css
/* Web Glow Animation */
@keyframes web-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(220, 20, 60, 0.6); }
  50% { box-shadow: 0 0 40px rgba(220, 20, 60, 1); }
}

/* Winning Line Animation */
@keyframes winner-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.web-animate {
  animation: web-pulse 1.5s ease-in-out infinite;
}

.winner-animate {
  animation: winner-pulse 0.6s ease-in-out 3;
}

/* Board Entry Animation */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.board-enter {
  animation: slide-in 0.6s ease-out;
}
```

### 6. Symbol Customization

#### Default Symbols
- **Player 1**: 🕷️ (Spider) in Red
- **Player 2**: 🕸️ (Web) in Yellow

#### Custom Symbol Options
- Comic style icons: P1 styled as Spider-Man mask (red), P2 as web pattern (yellow)
- Emoji variations: 🔴 Red Circle, 🟡 Yellow Circle
- Letter options: S (Spider-Man red), W (Web yellow)

#### Symbol Styling

```css
.symbol-player1 {
  color: #DC143C;
  filter: drop-shadow(0 0 8px rgba(220, 20, 60, 0.7));
}

.symbol-player2 {
  color: #FFD700;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.7));
}
```

### 7. Game State Visual Feedback

#### Win State
- **Background Flash**: Red to darker red gradient pulse
- **Winning Cells**: Highlighted with bright glow
- **Message Display**: "PLAYER 1 WINS!" with web pattern background
- **Button State**: Replay button glows in gold

#### Draw State
- **Background**: Static dark with yellow border glow
- **Message**: "IT'S A DRAW!" centered with web pattern
- **Color**: Combination of red and yellow effects

#### Game Over Screen
- **Overlay**: Semi-transparent dark with red border
- **Stats Display**: Yellow text on dark background
- **Buttons**: Glow effects for CTA

### 8. Leaderboard & History UI

#### Leaderboard Card Layout
```html
<div class="bg-gradient-to-b from-spiderman-blue to-spiderman-dark 
            border-2 border-spiderman-red rounded-lg p-4 shadow-web">
  <!-- Player Rank: Gold text with red glow -->
  <div class="text-spiderman-web font-bold text-lg">#{rank}</div>
  <!-- Player Name -->
  <div class="text-white font-semibold">{playerName}</div>
  <!-- Stats -->
  <div class="text-spiderman-web text-sm">{wins}W {losses}L {draws}D</div>
</div>
```

#### History Item
```html
<div class="bg-spiderman-dark border-l-4 border-spiderman-red p-3
            hover:bg-spiderman-blue transition-all">
  <!-- Players -->
  <div class="text-white font-bold">{player1} vs {player2}</div>
  <!-- Result with color coding -->
  <div class="text-spiderman-red font-bold">{result}</div>
  <!-- Date -->
  <div class="text-gray-400 text-sm">{date}</div>
</div>
```

### 9. Accessibility & Contrast

#### Color Contrast Compliance
- Red (#DC143C) on Dark (#000) = High contrast ✓
- Yellow (#FFD700) on Dark (#000) = High contrast ✓
- Text colors meet WCAG AA standards

#### Focus States
- **Keyboard Navigation**: Clear red outline on focused elements
- **Tab Order**: Logical tab order through game board and controls
- **Screen Readers**: Semantic HTML with ARIA labels

### 10. CSS Custom Properties for Theming

```css
:root {
  --spiderman-red: #DC143C;
  --spiderman-blue: #001F3F;
  --spiderman-web: #FFD700;
  --spiderman-dark: #0a0a0a;
  --spiderman-light: #f8f9fa;
  
  --shadow-web: 0 0 20px rgba(220, 20, 60, 0.6);
  --shadow-web-lg: 0 0 30px rgba(220, 20, 60, 0.8);
  
  --transition-fast: 300ms ease-in-out;
  --transition-normal: 500ms ease-in-out;
}
```

### 11. Code Component Structure

#### Main Layout Component
```
SpiderManGame/
├── GameContainer (main wrapper with theme)
├── Header (title, mode selector)
├── GameBoard (grid container)
│   └── GameCell (individual cells with symbols)
├── PlayerIndicator (current player display)
├── ControlPanel (buttons, difficulty selector)
├── Sidebar
│   ├── LeaderboardPanel
│   ├── HistoryPanel
│   └── StatsPanel
└── ResultOverlay (win/draw/loss display)
```

### 12. Tailwind Utility Classes Summary

**Core Game Classes**:
- `bg-spiderman-red` / `bg-spiderman-blue` / `bg-spiderman-dark`
- `text-spiderman-red` / `text-spiderman-web`
- `border-spiderman-red` / `border-spiderman-blue`
- `shadow-web` / `shadow-web-lg`
- `hover:shadow-web-lg` / `hover:scale-105`
- `transition-all` / `duration-300`

**Interactive States**:
- `active:scale-95` - Press animation
- `hover:bg-spiderman-dark` - Hover states
- `focus:outline-red-600` - Keyboard focus
- `disabled:opacity-50` - Disabled states

---

## Design Decisions

1. **Color Scheme**: Uses Spider-Man's iconic red and blue with gold accents to create a cohesive, recognizable theme
2. **Glow Effects**: Emulates web-like glow using Tailwind shadows and CSS filters
3. **Responsive**: Fully responsive from mobile to desktop using Tailwind breakpoints
4. **Performance**: Uses CSS animations over JavaScript for smooth 60fps performance
5. **Accessibility**: High contrast colors and semantic HTML ensure accessibility compliance
6. **Customization**: Tailwind config allows easy theme modifications and extensions
