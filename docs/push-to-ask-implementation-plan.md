# Push-to-Ask Implementation Plan

## Overview
This document outlines the implementation plan for the "Push-to-Ask" solution to address Issue #1 (Polish helper phrase detection in garbled transcriptions).

## Problem Statement
The Web Speech API cannot reliably handle code-switching between Italian and Polish. When users ask Polish questions like "jak powiedzieć bezchmurne?", the API garbles the transcription, making detection impossible.

## Solution: Explicit Language Switch
Instead of trying to detect garbled Polish, we implement an explicit "Push-to-Ask" mechanism where users temporarily switch to Polish recognition mode.

## Architecture Changes

### 1. Dual ASR Instances
- **Italian Instance (Default):** `lang: 'it-IT'`, `continuous: true`, `interimResults: true`
- **Polish Instance (Helper):** `lang: 'pl-PL'`, `continuous: false`, `interimResults: true`

### 2. State Machine
```
┌─────────────────┐
│ Conversation    │ (Default: Italian listening)
│ Mode (Italian)  │
└────────┬────────┘
         │ User presses "Help" button/Spacebar
         ▼
┌─────────────────┐
│ Switching       │ (Stop Italian, wait 100-200ms)
│ State           │
└────────┬────────┘
         │ Start Polish instance
         ▼
┌─────────────────┐
│ Polish Question │ (Polish listening, UI shows "🇵🇱 Listening...")
│ Mode            │
└────────┬────────┘
         │ User releases button OR silence detected
         ▼
┌─────────────────┐
│ Processing      │ (Stop Polish, send transcript with flag)
│ State           │
└────────┬────────┘
         │ Restart Italian
         ▼
┌─────────────────┐
│ Conversation    │ (Back to Italian)
│ Mode (Italian)  │
└─────────────────┘
```

## Implementation Steps

### Step 1: Create Dual ASR Service
**File:** `web/src/lib/transcription/dualASRService.ts`

- Manage two separate `SpeechRecognition` instances
- Handle state transitions
- Provide unified callback interface
- Handle errors and race conditions

### Step 2: Create React Hook
**File:** `web/src/hooks/usePushToAsk.ts`

- Manage button/keyboard state
- Coordinate with dual ASR service
- Update UI state
- Handle edge cases (rapid clicks, errors)

### Step 3: Update VoiceExperience Component
**File:** `web/src/components/voice/VoiceExperience.tsx`

- Add "Help" button or Spacebar handler
- Show visual indicator when in Polish mode
- Integrate with existing conversation flow

### Step 4: Update Helper Phrase Detection
**File:** `web/src/lib/transcription/helperPhrases.ts`

- Simplify detection (no need for garbled pattern matching)
- Polish mode transcripts are already clean
- Focus on intent detection only

### Step 5: Update Conversation Service
**File:** `web/src/lib/ai/conversation.ts`

- Handle Polish transcripts with `type: 'translation_request'` flag
- Provide appropriate responses

### Step 6: Update PRD
**File:** `docs/prd.md`

- Document Push-to-Ask as the primary method for Polish questions
- Update FR-010, FR-011, FR-012
- Remove reliance on automatic code-switching detection

## Technical Details

### State Management
```typescript
type ASRMode = 'italian' | 'polish' | 'switching';

interface DualASRState {
  mode: ASRMode;
  italianInstance: SpeechRecognition | null;
  polishInstance: SpeechRecognition | null;
  isPolishActive: boolean;
}
```

### API Surface
```typescript
class DualASRService {
  startItalian(): void;
  stopItalian(): void;
  switchToPolish(): Promise<void>;
  switchToItalian(): Promise<void>;
  isPolishMode(): boolean;
  setCallbacks(callbacks: CallbackMap): void;
}
```

### UI Indicators
- **Italian Mode:** Normal microphone indicator
- **Polish Mode:** Special indicator (e.g., "🇵🇱 Listening for question...")
- **Switching:** Brief loading state

## Error Handling

1. **Race Conditions:** Debounce rapid button presses
2. **Browser Limitations:** Fallback if Polish locale not supported
3. **Connection Issues:** Auto-reconnect Italian instance when returning from Polish
4. **Timeout:** Auto-return to Italian after 10 seconds in Polish mode

## Testing Strategy

1. **Unit Tests:** State machine transitions
2. **Integration Tests:** Full flow from button press to AI response
3. **Edge Cases:** Rapid switching, errors, browser limitations
4. **Accessibility:** Keyboard-only navigation

## Migration Path

1. Implement dual ASR service alongside existing service
2. Add feature flag to enable Push-to-Ask
3. Test with users
4. Deprecate garbled detection logic
5. Make Push-to-Ask the default

## PRD Updates Required

### FR-010 (Understand Polish helper phrases)
**Before:** System automatically detects Polish helper phrases in mixed speech
**After:** User explicitly switches to Polish mode to ask questions

### FR-011 (Seamless transitions)
**Before:** Automatic code-switching detection
**After:** Explicit button/keyboard shortcut for Polish questions

### FR-012 (Interpret Polish helper words)
**Before:** Detect and interpret from garbled transcriptions
**After:** Receive clean Polish transcriptions from dedicated Polish ASR instance

## Benefits

1. **Reliability:** 100% accurate Polish transcription (no garbling)
2. **User Control:** Explicit intent (user knows they're asking a question)
3. **Simpler Logic:** No complex pattern matching needed
4. **Better UX:** Clear visual feedback about mode
5. **Accessibility:** Keyboard shortcut support

## Drawbacks

1. **Extra Step:** User must press button (but this is intentional)
2. **UI Complexity:** Additional button/indicator needed
3. **State Management:** More complex than single instance

## Success Metrics

- Polish question detection accuracy: 100% (vs ~30% with garbled detection)
- User satisfaction with explicit control
- Time to detect Polish question: < 500ms (vs variable with garbled detection)

