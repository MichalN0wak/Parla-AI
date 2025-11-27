## Novel Pattern – Real-Time Bilingual Conversation Loop

- **Purpose:** Guarantee smooth Italian conversation while users freely mix Polish helper phrases, and surface Learning Cards without interrupting voice flow.

### Components & Responsibilities
1. **Audio Capture Module (`useAudioInput`)**  
   - Streams microphone audio frames.  
   - Adds light noise suppression and language hint metadata (“primary=it-IT, secondary=pl-PL”).

2. **Realtime Bridge (`useRealtimeConnection`)**  
   - Establishes WebRTC channel with OpenAI Realtime using signed token.  
   - Sends audio frames + context summaries; receives Italian responses + transcript events.  
   - Emits structured events: `transcript:partial`, `transcript:final`, `response:audio`.

3. **Code-Switch Interpreter**  
   - Watches transcript events, tags segments as Italian vs Polish using language IDs returned by the model.  
   - Adds metadata (e.g., `helperPhrase=true`) when Polish phrases like “jak się mówi...” appear.

4. **Learning Card Engine (`useLearningCardsStore`)**  
   - Subscribes to interpreter events.  
   - Generates vocabulary cards when new Italian words appear alongside Polish queries.  
   - Generates correction cards when grammar mismatches are flagged.

5. **Conversation UI**  
   - Left pane: voice bubbles, mic states, real-time transcript.  
   - Right pane: Learning Card list with subtle slide-in animations; ARIA announcements keep accessibility intact.

### Data Flow Sequence
1. User speaks → Audio Capture streams frames + metadata.  
2. Realtime Bridge sends frames to OpenAI; receives incremental transcripts + AI audio.  
3. Code-Switch Interpreter tags each transcript chunk and notifies Learning Card Engine.  
4. Learning Card Engine appends cards, persists to `sessionStorage`, and triggers ARIA updates.  
5. Conversation UI updates both panes simultaneously without blocking audio playback.

### Implementation Guide
- Maintain a lightweight event bus (could be Zustand store actions) so interpreter → card engine communication stays decoupled.  
- Keep transcript buffers capped (e.g., last 90 seconds) to avoid memory bloat.  
- Ensure fallback UI: if interpreter fails, default to Italian-only handling but keep conversation running.  
- Testing: simulate mixed-language phrases to verify correct tagging, card generation timing, and UI announcements.

### FR Coverage
- Voice Interaction & Conversation (FR-001–FR-008)  
- Code-Switching Support (FR-009–FR-012)  
- Learning Cards & Real-Time Feedback (FR-013–FR-019)

