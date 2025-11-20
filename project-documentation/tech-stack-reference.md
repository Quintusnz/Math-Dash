# Math Dash – Tech Stack Reference (Nov 2025)

This document serves as a "Cheat Sheet" for the specific versions of the libraries we are using. It highlights the modern patterns (React 19, Motion, Next.js 16) that differ from older tutorials.

---

## 1. Motion (formerly Framer Motion)

**Version:** `motion` (v12+)
**Key Change:** The package name is now `motion`. Imports for React components are namespaced under `motion/react`.

### Installation
```bash
npm install motion
```

### Basic Usage
```tsx
import { motion } from "motion/react"

export const FadeInButton = () => (
  <motion.button
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    Click Me
  </motion.button>
)
```

### AnimatePresence (Exit Animations)
```tsx
import { motion, AnimatePresence } from "motion/react"

export const Notification = ({ isVisible }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        Saved!
      </motion.div>
    )}
  </AnimatePresence>
)
```

---

## 2. React 19 & Next.js 16

**Key Change:** Simplified data fetching and context usage.

### The `use` Hook (Promise Unwrapping)
Instead of `useEffect` + `useState` for simple data fetching in Client Components, you can pass a Promise from a Server Component and unwrap it with `use`.

**Server Component:**
```tsx
import { db } from "@/lib/db"

export default async function Page() {
  const profilePromise = db.profiles.toArray()
  return <ClientList profilePromise={profilePromise} />
}
```

**Client Component:**
```tsx
"use client"
import { use } from "react"

export function ClientList({ profilePromise }: { profilePromise: Promise<Profile[]> }) {
  const profiles = use(profilePromise) // Suspends automatically!
  return <ul>{profiles.map(p => <li key={p.id}>{p.displayName}</li>)}</ul>
}
```

### Simplified Context
No need for `<Context.Provider>`.

```tsx
const ThemeContext = createContext('light')

function App() {
  return (
    <ThemeContext value="dark">
      <Child />
    </ThemeContext>
  )
}
```

### Server Actions (Next.js 16)
Directly call server functions from event handlers.

```tsx
// actions.ts
"use server"
export async function updateName(formData: FormData) {
  const name = formData.get('name')
  await db.updateName(name)
}

// Component.tsx
"use client"
import { updateName } from "./actions"

export function Form() {
  return (
    <form action={updateName}>
      <input name="name" />
      <button type="submit">Save</button>
    </form>
  )
}
```

---

## 3. TanStack Query v5

**Key Change:** `useQuery` now requires an object syntax. `useSuspenseQuery` is recommended for data that is required for the component to render.

### Standard Fetch
```tsx
import { useQuery } from "@tanstack/react-query"

const { data, isPending } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
})
```

### Suspense Integration
```tsx
import { useSuspenseQuery } from "@tanstack/react-query"

// Component will suspend if data is missing
const { data } = useSuspenseQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
})
```

---

## 4. Dexie.js (v4+)

**Key Change:** Strong TypeScript inference and React hooks.

### Schema Definition
```ts
import Dexie, { type EntityTable } from 'dexie';

interface Friend {
  id: number;
  name: string;
  age: number;
}

const db = new Dexie('FriendsDatabase') as Dexie & {
  friends: EntityTable<Friend, 'id'>;
};

db.version(1).stores({
  friends: '++id, name, age'
});
```

### React Hook (`useLiveQuery`)
Automatically re-renders the component when the database changes.

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";

export function FriendList() {
  const friends = useLiveQuery(() => db.friends.toArray());
  
  if (!friends) return null;
  
  return <div>{friends.length} friends</div>;
}
```

---

## 5. Data Visualization (Recharts)

**Version:** `recharts` (v2.x)
**Note:** Ensure `ResponsiveContainer` has a defined parent height.

### Radar Chart Example
```tsx
"use client"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const data = [
  { subject: 'Math', A: 120, fullMark: 150 },
  { subject: 'Chinese', A: 98, fullMark: 150 },
  { subject: 'English', A: 86, fullMark: 150 },
];

export function SkillChart() {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <Radar name="Mike" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
