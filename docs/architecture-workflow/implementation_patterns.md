## Implementation Patterns

### Naming Patterns
- **API routes:** `/api/{capability}/{action}` (e.g., `/api/conversation/token`).  
- **Events:** `domain:event` (`conversation:start`, `learningCard:add`).  
- **Store hooks:** `useXStore` (`useAppStore`).  
- **Files:** kebab-case for components (`learning-card.tsx`).

### Structure Patterns
- **Components by feature:** group under `components/voice`, `components/learning-cards`, etc.  
- **Tests colocated in `src/tests`** mirroring feature directories.  
- **Edge functions under `app/api/*/route.ts`.**

### Format Patterns
- **Learning Card JSON:** `{ id, type: 'vocabulary' | 'correction', italianText, polishText?, helperPhrase?, timestamp }`.  
- **Logging payloads:** `{ level, context, message, metadata }` with metadata redacted.  
- **API responses:** `{ success: boolean, data?, error? }`.

### Communication Patterns
- **Events via Zustand:** dispatch actions (`addLearningCard`, `setMicStatus`) instead of custom emitters.  
- **WebRTC channel:** wrap send/receive in a `RealtimeBridge` helper to keep logic centralized.

### Lifecycle Patterns
- **Loading states:** show skeleton loader in Learning Card pane while establishing connection.  
- **Error recovery:** auto-retry mic/AI connection once, then present “Retry” button.  
- **Session end:** call `endSession()` to stop streams, clear stores, and show summary.

### Location Patterns
- **Icons & audio:** `public/icons`, `public/sounds`.  
- **Shared constants:** `src/lib/constants.ts`.  
- **Session storage helpers:** `src/lib/storage.ts`.

### Consistency Patterns
- **Dates in UI:** `date-fns` relative labels; store as ISO.  
- **Logging format:** JSON lines, redacted.  
- **Copy tone:** Encouraging, non-judgmental (mirror UX guidance).

