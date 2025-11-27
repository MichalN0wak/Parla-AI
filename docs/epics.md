## Workflow Mode

- Mode: CREATE (initial epic planning run)
- Trigger: `docs/epics.md` not found, so generating net-new epic structure.
- Next: Load PRD and supporting briefs to inventory all FRs before grouping them.

## Available Context

- ✅ PRD `docs/prd.md` (required) – contains full FR/NFR inventory and scope definitions.
- ✅ Product Brief `docs/product-brief-Parla-AI-2025-11-27.md` – reinforces vision, differentiators.
- ✅ UX Design Spec `docs/ux-design-specification.md` (+ color themes & directions HTML) – interaction patterns, layout cues.
- ✅ Architecture Notes `docs/architecture.md` + workflow artifacts – early technical decisions.
- ⚪️ Domain brief not provided (will rely on PRD/domain context sections).

## Functional Requirement Inventory

| FR ID | Capability Summary |
| --- | --- |
| FR-001 | Start voice conversation session after topic + proficiency selection |
| FR-002 | Real-time capture & transcription of Italian speech |
| FR-003 | Recognize mixed Italian-Polish speech during transcription |
| FR-004 | AI responds in Italian, maintaining immersion |
| FR-005 | Conversation complexity adapts to A2/B1/B2 proficiency |
| FR-006 | AI engages naturally on user-specified topics |
| FR-007 | End session any time via “End Session” control |
| FR-008 | Visual status for listening / processing / speaking |
| FR-009 | Identify language per token in mixed speech |
| FR-010 | Understand Polish helper phrases while staying in Italian |
| FR-011 | Seamless transitions between languages without explicit toggle |
| FR-012 | Interpret Polish helper words and answer appropriately in Italian |
| FR-013 | Show Learning Cards panel during conversation |
| FR-014 | Generate vocabulary cards with Italian+Polish pairing |
| FR-015 | Generate grammar correction cards with error vs corrected form |
| FR-016 | Copy individual Learning Cards |
| FR-017 | Copy all Learning Cards at once |
| FR-018 | Real-time Learning Cards (no session-end batching) |
| FR-019 | Visual differentiation between vocabulary vs correction cards |
| FR-020 | Topic input accepts free-text Polish descriptions |
| FR-021 | Select proficiency via toggle/pills |
| FR-022 | Start new session from landing screen |
| FR-023 | Show summary screen after session |
| FR-024 | Store current-session data locally in browser |
| FR-025 | No login/account required |
| FR-026 | Keyboard navigation support |
| FR-027 | Full functionality via keyboard only |
| FR-028 | Split view layout: conversation + Learning Cards |
| FR-029 | Visual microphone status indicators |
| FR-030 | Feedback on when AI is speaking vs user’s turn |
| FR-031 | Accessible audio volume controls |
| FR-032 | Responsive desktop/tablet layout |
| FR-033 | Operate without authentication |
| FR-034 | No server-side storage of personal convo data |
| FR-035 | Local-only session data |
| FR-036 | Users can clear local storage via browser controls |
| FR-037 | Support modern browsers with Web Speech API |
| FR-038 | PWA behavior with basic offline UI |
| FR-039 | Graceful degradation when Web Speech API unavailable |
| FR-040 | Real-time transcription pipeline <2s latency |
| FR-041 | AI responses stay natural and contextual |
| FR-042 | Identify vocab/grammar learning opportunities live |
| FR-043 | Adapt AI style to proficiency level |
| FR-044 | WCAG 2.1 AA compliance |
| FR-045 | Learning Cards accessible to screen readers |
| FR-046 | High contrast mode support |
| FR-047 | Clear focus indicators for all interactive elements |

The FR inventory now covers all 47 numbered requirements from the PRD and will serve as the baseline for epic mapping in the next step.

## Epic Structure Proposal

### Epic 1 – Foundation & Conversational Core
- **Goal:** Establish the deployable SPA shell, voice pipeline scaffolding, and zero-friction session flow so users can launch a guided conversation immediately.
- **Scope Highlights:** Repo/project setup, audio capture/transcription backbone, landing + topic/proficiency intake, conversation state management, privacy-first local storage, responsive split layout skeleton, accessibility primitives.
- **Why this grouping:** Delivers the minimum usable experience (start, speak, end) while respecting the “no login” differentiator and performance/privacy constraints. All subsequent value depends on this groundwork.

### Epic 2 – Adaptive Voice Conversation Engine
- **Goal:** Make the AI partner feel natural, supportive, and proficiency-aware throughout an Italian conversation session.
- **Scope Highlights:** Proactive topic engagement, proficiency-tuned prompting, conversation turn orchestration, latency safeguards, persona cues from product brief, closing summaries.
- **Why this grouping:** Once the core shell exists, the AI experience must feel safe and tailored; this epic converts the skeleton into an empathetic speaking partner.

### Epic 3 – Natural Code-Switching Intelligence
- **Goal:** Let learners mix Polish helper words freely without breaking immersion, ensuring the system understands and responds gracefully.
- **Scope Highlights:** Token-level language tagging, helper-phrase understanding, Italian-only responses with Polish-aware context, seamless Italian/Polish transitions, UI cues that reassure users their Polish inserts are understood.
- **Why this grouping:** Code-switching is the hero differentiator; isolating it ensures the behavior is engineered end-to-end and can be iterated independently.

### Epic 4 – Real-Time Learning Cards & Feedback
- **Goal:** Provide immediate visual reinforcement (vocabulary + grammar cards) that users can copy/share while conversation continues uninterrupted.
- **Scope Highlights:** Card generation engine, vocabulary vs correction templates, copy micro-interactions, animation/timing rules, accessibility of cards, card persistence for session summary.
- **Why this grouping:** Learning Cards translate raw conversation into actionable learning moments, delivering the “immediate value” promise.

### Epic 5 – Session Experience & Accessibility Polish
- **Goal:** Round out the UX with responsive layouts, audio controls, accessibility compliance, and PWA/offline affordances so the app feels production-ready.
- **Scope Highlights:** High-contrast/keyboard support, WCAG AA audit fixes, audio volume UI, PWA shell, graceful degradation for unsupported browsers, session summary enhancements.
- **Why this grouping:** Final epic ensures every FR around usability, accessibility, and platform support is satisfied, enabling confident release.

### FR Coverage Map

| Epic | FRs Covered |
| --- | --- |
| Foundation & Conversational Core | FR-001, FR-002, FR-007, FR-008, FR-020–FR-032, FR-033–FR-038 |
| Adaptive Voice Conversation Engine | FR-004–FR-008, FR-041–FR-043 |
| Natural Code-Switching Intelligence | FR-003, FR-009–FR-012, FR-040 |
| Real-Time Learning Cards & Feedback | FR-013–FR-019, FR-016–FR-018, FR-024 |
| Session Experience & Accessibility Polish | FR-025–FR-027, FR-034–FR-047, FR-039 |

All 47 FRs are mapped; overlapping FRs (e.g., FR-007, FR-008) appear where necessary to reflect shared responsibility but remain primarily owned by a single epic.

## Epic 1: Foundation & Conversational Core

### Epic Goal
Deliver a privacy-first, voice-ready SPA shell where learners can launch, conduct, and conclude an Italian conversation session with bare-minimum guidance and visual cues.

### Stories

#### Story 1.1 – Project Setup & Deployment Skeleton
**User Story:** As a developer, I want a configured repo with SPA tooling, CI/CD hooks, and environment scaffolding so the team can ship voice-ready builds safely.  
**Acceptance Criteria:**  
- Given the repo is cloned, when developers run `npm install && npm run dev`, then the base SPA boots with placeholder conversation/learning panes.  
- Given a PR merges to main, when CI runs, then lint/tests pass and deploy automatically to staging (Vercel) using environment variables for AI keys.  
- Given new env secrets are added locally, when pushing to Vercel, then automated secrets synchronization exists (documented script).  
**Prerequisites:** None.  
**Technical Notes:** Next.js/React baseline, Typescript enforced, ESLint + Prettier pre-configured, GitHub Actions or Vercel deploy hooks, `.env.example` committed with guidance.

#### Story 1.2 – Voice Capture & Transcription Pipeline Backbone
**User Story:** As a learner, I want the app to capture my speech and stream it for transcription so I can speak naturally without manual start/stop toggles.  
**Acceptance Criteria:**  
- Given microphone permission granted, when I click Start, then Web Speech API (or streaming SDK) begins listening with Italian+Polish locale settings.  
- Given continuous speech, when >2s silence detected, then the system still keeps session active unless End is pressed.  
- Given unsupported browser, when mic initialization fails, then user sees graceful fallback messaging with supported-browser list.  
**Prerequisites:** Story 1.1.  
**Technical Notes:** Web Speech API fallback detection, polyfill for Firefox, audio worker abstraction to swap in 3rd-party speech services later, capture status exposed via context.

#### Story 1.3 – Session Landing Flow (Topic + Proficiency Intake)
**User Story:** As a learner, I want to quickly set my topic and proficiency before starting so the AI knows how to guide me.  
**Acceptance Criteria:**  
- Given landing screen, when I type a free-text topic (Polish allowed) and pick A2/B1/B2 pill, then Start button becomes active.  
- Given I try to start without both fields, when Start clicked, then inline validation indicates what’s missing (no modals).  
- Given I revisit landing after session, when I focus topic field, then previous entry is cleared (privacy-first).  
**Prerequisites:** Story 1.1.  
**Technical Notes:** Controlled inputs, localized placeholder copy, pill selector with ARIA roles, topic stored transiently in memory store.

#### Story 1.4 – Conversation Layout Shell (Split View + Status Indicators)
**User Story:** As a learner, I want a calming split layout with conversation on the left and space for Learning Cards on the right so I can follow along comfortably.  
**Acceptance Criteria:**  
- Given a desktop viewport, when session starts, then layout snaps to 65/35 split with sticky header showing topic + proficiency tag.  
- Given microphone active, when state changes (listening, processing, speaking), then status chip updates with icon + text and is read by screen readers.  
- Given tablet viewport (>768px), when orientation changes, then layout adapts without overlapping panels.  
**Prerequisites:** Stories 1.1, 1.2.  
**Technical Notes:** CSS grid layout, theme tokens from UX colors, live region for status chips, responsive breakpoints defined in UX spec.

#### Story 1.5 – Session Lifecycle & Local Privacy Guardrails
**User Story:** As a privacy-conscious learner, I want assurance that my session lives only in the browser and that I can end it anytime.  
**Acceptance Criteria:**  
- Given active session, when End Session clicked, then microphone stops, AI stops streaming, and summary placeholder screen appears.  
- Given session data stored (topic, proficiency, transient transcript), when I refresh, then data clears automatically unless summary view open.  
- Given user accesses local storage info, when checking, then only minimal session flags exist and are documented.  
**Prerequisites:** Stories 1.2, 1.3, 1.4.  
**Technical Notes:** Use in-memory stores with optional IndexedDB for short-lived caching, ensure `End Session` also revokes MediaStream tracks, update privacy copy referencing PRD commitments.

#### Story 1.6 – Accessibility & Keyboard Navigation Baseline
**User Story:** As a learner who prefers keyboard or assistive tech, I need to control the session without relying on mouse interactions.  
**Acceptance Criteria:**  
- Given tab navigation, when cycling through landing controls, then focus order follows Start flow logically and visibly.  
- Given active session, when I press assigned shortcuts (e.g., Space to toggle mic, Esc to open End dialog), then actions trigger without losing focus.  
- Given screen reader, when announcing key controls, then ARIA labels describe state (listening/speaking).  
**Prerequisites:** Stories 1.3, 1.4.  
**Technical Notes:** ARIA live regions for status, `prefers-reduced-motion` respect, ensures foundation for later WCAG work in Epic 5.

### FR Coverage (Epic 1)
- FR-001, FR-002, FR-007, FR-008, FR-020–FR-024, FR-025–FR-038, portions of FR-044–FR-047 (baseline accessibility groundwork).

━━━━━━━━━━━━━━━━━━━━━━━

## Epic 2: Adaptive Voice Conversation Engine

### Epic Goal
Transform the foundational shell into an empathetic Italian-speaking AI partner that adapts tone, pacing, and difficulty to each learner’s chosen proficiency and topic.

### Stories

#### Story 2.1 – Topic-Aware Prompting & Persona Definition
**User Story:** As a learner, I want the AI to remember my topic selection so the conversation feels tailored and not generic.  
**Acceptance Criteria:**  
- Given a topic entered on landing, when the session starts, then AI introductions reference that topic explicitly (e.g., “Parliamo del tuo prossimo viaggio…”).  
- Given proficiency level selection, when prompt templates are built, then tone instructions adjust (A2 simpler sentences, B2 nuanced follow-ups).  
- Given system prompt updates, when new topics are launched, then logs show the persona instructions used for traceability.  
**Prerequisites:** Epic 1 completion.  
**Technical Notes:** Store topic/proficiency in conversation context; bake persona cues from product brief (warm, supportive); create prompt builder module for reuse.

#### Story 2.2 – Turn Orchestration & Latency Safeguards
**User Story:** As a learner, I need clear turn-taking so I know when to speak and responses arrive without awkward gaps.  
**Acceptance Criteria:**  
- Given AI is speaking, when audio playback ends, then status switches to “Your turn” automatically within <300 ms.  
- Given AI response latency exceeds 3 seconds, when fallback triggers, then UI shows “Still thinking…” microcopy and optionally plays soft tone.  
- Given network error occurs mid-turn, when retry succeeds, then conversation resumes without duplicating the previous AI utterance.  
**Prerequisites:** Stories 1.2, 1.4.  
**Technical Notes:** Queue manager for speech synthesis, streaming partial transcripts, timeout watchdogs, optional tone cue per UX audio guidance.

#### Story 2.3 – Proficiency-Tuned Dialogue Strategies
**User Story:** As a learner at different CEFR levels, I want questions and corrections that match my ability so I feel challenged but not overwhelmed.  
**Acceptance Criteria:**  
- Given A2 level, when AI asks follow-ups, then questions stay in present tense with everyday vocabulary.  
- Given B1 level, when AI probes, then it introduces past/future tenses with scaffolding.  
- Given B2 level, when grammar corrections are offered, then they include nuanced explanations (subjunctive hints, stylistic notes).  
- Given I switch proficiency between sessions, when a new session starts, then AI uses the new difficulty without requiring a reload.  
**Prerequisites:** Story 2.1.  
**Technical Notes:** Parameterize prompt fragments per level, track learner level in context/state, add evaluation hooks for later analytics.

#### Story 2.4 – Supportive Coaching & Confidence Cues
**User Story:** As an anxious speaker, I want the AI to encourage me even when I stumble so I keep practicing.  
**Acceptance Criteria:**  
- Given repeated Polish helper words, when AI responds, then it acknowledges effort and gently rephrases in Italian.  
- Given long pauses (>4 seconds) are detected, when AI resumes, then it offers a prompt or suggestion rather than silence.  
- Given learner expresses frustration (“Nie wiem jak powiedzieć…”), when AI answers, then it supplies the Italian phrase plus reassurance.  
**Prerequisites:** Stories 2.1, 2.2.  
**Technical Notes:** Pause-detection hooks from microphone stream, sentiment heuristics (keywords), prompt snippets that reinforce supportive tone.

#### Story 2.5 – Session Summary Narrative
**User Story:** As a learner, I want a short summary after the session highlighting what went well so I can reflect before closing.  
**Acceptance Criteria:**  
- Given End Session triggered, when AI generates summary, then it includes 2–3 bullet highlights plus a suggested next topic.  
- Given session lasted <2 minutes, when summary is produced, then messaging acknowledges brevity and encourages longer practice.  
- Given summary ready, when user returns to landing, then summary content clears automatically (privacy).  
**Prerequisites:** Story 1.5 plus Epic 2 conversation context.  
**Technical Notes:** Summaries reuse trimmed transcript slices; store only in memory; allow future export hook for growth features.

### FR Coverage (Epic 2)
- FR-004, FR-005, FR-006, FR-008 (shared for status cues), FR-041, FR-042, FR-043; contributes to FR-007 via summary handling.

━━━━━━━━━━━━━━━━━━━━━━━

## Epic 3: Natural Code-Switching Intelligence

### Epic Goal
Let learners mix Polish helper words without breaking immersion by detecting language shifts, interpreting Polish context, and keeping responses in Italian while acknowledging intent.

### Stories

#### Story 3.1 – Dual-Language Transcription & Token Tagging
**User Story:** As a learner who mixes languages, I want the system to understand which parts are Polish vs. Italian so it can respond accurately.  
**Acceptance Criteria:**  
- Given mixed speech, when transcription completes, then each token carries language metadata (IT vs PL).  
- Given purely Italian speech, when processed, then no unnecessary language switching occurs (<2% mis-tags).  
- Given transcription provider lacks dual-language support, when fallback logic runs, then system switches to alternate service or displays warning.  
**Prerequisites:** Story 1.2 foundation.  
**Technical Notes:** Evaluate Web Speech API multi-language mode vs. external ASR (e.g., Whisper), maintain token arrays for downstream logic.

#### Story 3.2 – Polish Helper Phrase Understanding
**User Story:** As a learner, I want to ask “jak się mówi…” type questions in Polish and still get Italian answers.  
**Acceptance Criteria:**  
- Given phrases like “jak się mówi ___ po włosku”, when detected, then AI responds with the Italian phrase plus short explanation.  
- Given Polish clarifications (e.g., “czy to poprawne, że…”), when parsed, then AI replies in Italian referencing the Polish context.  
- Given no helper phrases, when regular Polish words appear, then system treats them as inline vocabulary and optionally adds them to Learning Cards (handoff to Epic 4).  
**Prerequisites:** Story 3.1, Story 2.1 persona/prompt builder.  
**Technical Notes:** Regex + intent classifier for helper phrases; prompt snippets instruct AI to keep Italian responses while acknowledging Polish question.

#### Story 3.3 – Seamless Response Blending
**User Story:** As a learner, I need the AI to stay in Italian even if I switch languages mid-sentence, without chastising me.  
**Acceptance Criteria:**  
- Given Polish tokens appear mid-sentence, when AI responds, then it stays in Italian but may include Polish gloss in parentheses when clarifying.  
- Given repeated Polish usage indicating confusion, when AI replies, then it proactively teaches the Italian equivalent and encourages repetition.  
- Given user insists on Polish (rare edge), when AI replies, then it gently guides back to Italian within two exchanges.  
**Prerequisites:** Stories 2.4, 3.1, 3.2.  
**Technical Notes:** Prompt instructions referencing language metadata, heuristic to detect “too much Polish,” escalate supportive coaching.

#### Story 3.4 – UI Feedback for Code-Switch Events
**User Story:** As a learner, I want subtle UI cues showing the system understood my Polish inserts so I feel safe using them.  
**Acceptance Criteria:**  
- Given Polish tokens detected, when transcript renders, then Polish words display with a soft highlight and tooltip (“Zrozumiano PL, odpowiedź po włosku”).  
- Given user hovers/taps highlight, when tooltip shows, then message reassures them they can keep mixing languages.  
- Given no Polish detected, when transcript shows, then formatting stays neutral.  
**Prerequisites:** Story 3.1, Story 1.4 layout shell.  
**Technical Notes:** Use UX color tokens for highlights, ensure accessibility (contrast, ARIA descriptions), toggle via settings later.

### FR Coverage (Epic 3)
- FR-003, FR-009, FR-010, FR-011, FR-012, FR-040; supports FR-042 by flagging vocab opportunities for Learning Cards.

━━━━━━━━━━━━━━━━━━━━━━━

## Epic 4: Real-Time Learning Cards & Feedback

### Epic Goal
Surface vocabulary and grammar insights during conversation without disrupting flow, enabling learners to copy or review notes instantly.

### Stories

#### Story 4.1 – Learning Card Generation Engine
**User Story:** As a learner, I want the system to capture interesting words or corrections as cards so I can review them at a glance.  
**Acceptance Criteria:**  
- Given Italian vocabulary appears, when relevance rules trigger, then a vocabulary card renders with Italian term + Polish translation + sample sentence.  
- Given AI notices a grammar mistake, when correction rules fire, then a correction card shows “You said / Correct form / Why”.  
- Given no relevant events occur for 30 seconds, when conversation continues, then no empty cards are generated (no noise).  
**Prerequisites:** Stories 2.1, 2.3, 3.2.  
**Technical Notes:** Hook into transcript/AI response stream; heuristics to avoid duplicates; card payload normalized for UI.

#### Story 4.2 – Vocabulary vs. Correction Card Templates
**User Story:** As a learner, I need cards to be visually distinct so I can tell vocabulary from corrections instantly.  
**Acceptance Criteria:**  
- Given vocabulary cards, when rendered, then they use green accent and icon per UX spec.  
- Given correction cards, when rendered, then they use amber/red accent plus microcopy (“Spróbuj tak”).  
- Given high-contrast mode, when toggled, then both card types maintain WCAG AA contrast.  
**Prerequisites:** Story 4.1, Story 1.4 layout.  
**Technical Notes:** CSS variables for themes, ARIA descriptions for screen readers, card component library for reuse.

#### Story 4.3 – Copy Interactions (Single + Bulk)
**User Story:** As a learner, I want to copy individual cards or the entire note stack so I can save discoveries elsewhere.  
**Acceptance Criteria:**  
- Given individual card, when Copy icon clicked, then clipboard contains formatted text (Italian – Polish / explanation) and toast confirms success.  
- Given “Copy all” action pressed, when cards exist, then clipboard includes chronological list separated by headers.  
- Given clipboard fails (browser restriction), when fallback occurs, then message instructs manual select/copy without breaking conversation.  
**Prerequisites:** Story 4.2.  
**Technical Notes:** Use async Clipboard API with fallback, throttle repeated clicks, ensure focus management for keyboard use.

#### Story 4.4 – Real-Time Card Timing & Animations
**User Story:** As a learner, I want cards to appear smoothly without blocking the conversation area.  
**Acceptance Criteria:**  
- Given new card emitted, when inserted, then it animates in from top within 250 ms and does not shift conversation panel width.  
- Given multiple cards appear quickly, when stacked, then scroll container pins newest to top with subtle pulse (per UX spec).  
- Given user scrolls older cards, when new card arrives, then unobtrusive badge indicates new content without forcing scroll jump.  
**Prerequisites:** Story 4.1, Story 1.4 layout.  
**Technical Notes:** CSS transitions leveraging `prefers-reduced-motion`, virtualization if list grows large, maintain 60 fps budget.

#### Story 4.5 – Session Summary Integration
**User Story:** As a learner, I want Learning Cards to feed into the session summary so I can review insights before exiting.  
**Acceptance Criteria:**  
- Given End Session triggered, when summary screen opens, then it shows top 3 vocabulary + corrections from card stack.  
- Given user copies “Copy all” after session, when action fires, then summary view uses same formatting as in-session.  
- Given new session starts, when landing loads, then previous card data clears automatically.  
**Prerequisites:** Story 2.5 summary narrative, Story 4.1.  
**Technical Notes:** Reuse card store; ensure privacy by clearing memory on window unload; optional export hook for future PDF features.

### FR Coverage (Epic 4)
- FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019, FR-024, FR-042 (shared with Epic 2/3 for detection input).

━━━━━━━━━━━━━━━━━━━━━━━

## Epic 5: Session Experience & Accessibility Polish

### Epic Goal
Finalize the experience with production-ready accessibility, audio controls, PWA/offline affordances, and graceful degradation so every FR around usability and platform support is satisfied.

### Stories

#### Story 5.1 – WCAG 2.1 AA Hardening
**User Story:** As a learner using assistive tech, I want the entire app to meet WCAG 2.1 AA so I can practice without barriers.  
**Acceptance Criteria:**  
- Given screen reader audit, when traversing landing → session → summary, then landmarks, labels, and focus orders pass WCAG 2.1 AA.  
- Given color contrast checks, when testing default + high-contrast themes, then all ratios meet ≥4.5:1 for normal text and ≥3:1 for large text/icons.  
- Given keyboard-only usage, when running through start, conversation controls, Learning Cards, and End Session, then no focus trap or unreachable control exists.  
**Prerequisites:** Stories 1.6, 4.2.  
**Technical Notes:** Use axe/lighthouse audits; ensure ARIA live regions for new cards; document compliance matrix in sprint artifacts.

#### Story 5.2 – Audio Controls & Feedback Enhancements
**User Story:** As a learner, I need accessible audio controls so I can adjust volume or mute without leaving the experience.  
**Acceptance Criteria:**  
- Given session active, when I move the volume slider or hit mute, then AI playback adjusts instantly with visual confirmation.  
- Given keyboard users, when focusing controls, then slider operates via arrow keys and announces current level.  
- Given audio muted, when AI attempts to speak, then UI indicates “Muted” status so users know why they cannot hear sound.  
**Prerequisites:** Story 1.4 layout, Story 2.2 turn orchestration.  
**Technical Notes:** Reuse audio pipeline, adopt accessible slider component, tie into status indicators.

#### Story 5.3 – PWA Shell & Offline Graceful Degradation
**User Story:** As a learner, I want the UI to load even when offline so I understand why conversation isn’t available.  
**Acceptance Criteria:**  
- Given the app installed as PWA, when device is offline, then landing UI loads with messaging that voice features require connectivity.  
- Given offline detection mid-session, when triggered, then microphone stops safely and reconnection prompt appears without data loss.  
- Given browsers without PWA support, when visiting, then experience still works as standard SPA without console errors.  
**Prerequisites:** Story 1.1 foundation.  
**Technical Notes:** Service worker caches shell assets, network status hook surfaces offline banner, degrade gracefully for unsupported features.

#### Story 5.4 – Browser Compatibility & Fallback Messaging
**User Story:** As a learner on an older or unsupported browser, I want clear guidance so I can still access the product.  
**Acceptance Criteria:**  
- Given browser lacks Web Speech API, when detected, then page displays tailored instructions listing supported browsers and links to docs.  
- Given microphone permission denied, when happening, then inline instructions explain how to re-enable access.  
- Given mobile device <768 px, when visiting, then a non-blocking banner suggests desktop/tablet for optimal experience.  
**Prerequisites:** Stories 1.2, 1.4.  
**Technical Notes:** Feature detection module, localized copy (PL/IT/EN), optional analytics event for unsupported cases.

#### Story 5.5 – Performance & Quality Assurance Sign-off
**User Story:** As the product owner, I want proof the app meets latency and performance targets so learners enjoy smooth sessions.  
**Acceptance Criteria:**  
- Given Lighthouse/Web Vitals tests, when run on baseline hardware, then scores remain ≥90 for performance/accessibility/best practices.  
- Given transcription + AI pipeline, when profiled, then documented latency shows <2 s transcription and <3 s AI response per PRD targets.  
- Given Learning Cards panel, when stressed with 20+ cards, then 60 fps scrolling is maintained.  
**Prerequisites:** Completion of previous epics.  
**Technical Notes:** Instrument metrics, share QA report in `docs/sprint-artifacts`, tie results to FR-040/FR-041/FR-042 performance notes.

### FR Coverage (Epic 5)
- FR-025, FR-026, FR-027, FR-028 (reinforcement), FR-029–FR-032, FR-033–FR-039, FR-044–FR-047; closes remaining usability/performance requirements.

━━━━━━━━━━━━━━━━━━━━━━━

## Epic Breakdown Summary

- **Epic 1 – Foundation & Conversational Core:** Project setup, voice backbone, intake flow, split layout, privacy guardrails, baseline accessibility. Stories 1.1 – 1.6 enable a working zero-login conversation shell.
- **Epic 2 – Adaptive Voice Conversation Engine:** Topic-aware prompting, turn orchestration, proficiency tuning, supportive coaching, and reflective summaries (Stories 2.1 – 2.5) make the AI feel safe and empathetic.
- **Epic 3 – Natural Code-Switching Intelligence:** Stories 3.1 – 3.4 detect Polish/Italian tokens, interpret helper phrases, keep replies in Italian, and reassure learners via UI cues.
- **Epic 4 – Real-Time Learning Cards & Feedback:** Stories 4.1 – 4.5 generate, style, animate, and copy Learning Cards in sync with conversation flow while feeding the session summary.
- **Epic 5 – Session Experience & Accessibility Polish:** Stories 5.1 – 5.5 finalize WCAG AA compliance, audio controls, PWA/offline behavior, browser fallbacks, and performance sign-off.

All epics deliver user-facing value (Foundation exception justified), follow sequential dependencies, and stay sized for single-session implementation.

## FR Coverage Matrix

| FR ID | Epic / Story Coverage |
| --- | --- |
| FR-001 | Epic 1 · Stories 1.3/1.5 – start session + lifecycle |
| FR-002 | Epic 1 · Story 1.2 – voice capture pipeline |
| FR-003 | Epic 3 · Story 3.1 – dual-language tagging |
| FR-004 | Epic 2 · Stories 2.1/2.4 – Italian persona responses |
| FR-005 | Epic 2 · Story 2.3 – proficiency tuning |
| FR-006 | Epic 2 · Story 2.1 – topic-aware engagement |
| FR-007 | Epic 1 · Story 1.5 & Epic 2 · Story 2.5 – end + summary |
| FR-008 | Epic 1 · Story 1.4 & Epic 2 · Story 2.2 – status cues |
| FR-009 | Epic 3 · Story 3.1 – language identification |
| FR-010 | Epic 3 · Story 3.2 – helper phrase intent |
| FR-011 | Epic 3 · Story 3.3 – seamless transitions |
| FR-012 | Epic 3 · Stories 3.2/3.3 – Polish helper handling |
| FR-013 | Epic 4 · Stories 4.1/4.2 – Learning Card panel |
| FR-014 | Epic 4 · Story 4.1 – vocabulary cards |
| FR-015 | Epic 4 · Story 4.1 – grammar corrections |
| FR-016 | Epic 4 · Story 4.3 – copy individual card |
| FR-017 | Epic 4 · Stories 4.3/4.5 – copy all cards |
| FR-018 | Epic 4 · Story 4.4 – real-time card timing |
| FR-019 | Epic 4 · Story 4.2 – visual differentiation |
| FR-020 | Epic 1 · Story 1.3 – topic input |
| FR-021 | Epic 1 · Story 1.3 – proficiency selector |
| FR-022 | Epic 1 · Story 1.3 – start control |
| FR-023 | Epic 2 · Story 2.5 & Epic 4 · Story 4.5 – summary |
| FR-024 | Epic 1 · Story 1.5 & Epic 4 · Story 4.5 – local session data |
| FR-025 | Epic 1 · Story 1.5 & Epic 5 · Story 5.4 – no-login access |
| FR-026 | Epic 1 · Story 1.6 & Epic 5 · Story 5.1 – keyboard nav |
| FR-027 | Epic 1 · Story 1.6 & Epic 5 · Story 5.1 – keyboard-only use |
| FR-028 | Epic 1 · Story 1.4 – split layout |
| FR-029 | Epic 1 · Story 1.4 – microphone status |
| FR-030 | Epic 1 · Story 1.4 & Epic 2 · Story 2.2 – turn cues |
| FR-031 | Epic 5 · Story 5.2 – audio volume controls |
| FR-032 | Epic 1 · Story 1.4 & Epic 5 · Story 5.4 – responsive layout |
| FR-033 | Epic 1 · Story 1.5 – no authentication |
| FR-034 | Epic 1 · Story 1.5 – no server-side storage |
| FR-035 | Epic 1 · Story 1.5 – local-only data |
| FR-036 | Epic 1 · Story 1.5 – user-cleared local data |
| FR-037 | Epic 5 · Story 5.4 – browser support guidance |
| FR-038 | Epic 5 · Story 5.3 – PWA capabilities |
| FR-039 | Epic 5 · Stories 5.3/5.4 – graceful degradation |
| FR-040 | Epic 3 · Story 3.1 & Epic 5 · Story 5.5 – <2 s transcription |
| FR-041 | Epic 2 · Stories 2.2/2.4 – natural responses |
| FR-042 | Epic 2 · Story 2.3 & Epic 4 · Story 4.1 – learning detection |
| FR-043 | Epic 2 · Story 2.3 – style adaptation |
| FR-044 | Epic 1 · Story 1.6 & Epic 5 · Story 5.1 – WCAG compliance |
| FR-045 | Epic 4 · Story 4.2 & Epic 5 · Story 5.1 – accessible cards |
| FR-046 | Epic 5 · Story 5.1 – high contrast mode |
| FR-047 | Epic 1 · Story 1.6 & Epic 5 · Story 5.1 – focus indicators |

All FRs from the PRD map to at least one story; overlapping entries indicate shared accountability (primary ownership shown first).

## Next Steps

- ✅ Context incorporated: PRD + UX design spec + architecture notes; epics reflect all available guidance.
- 🧭 Ready to hand off to Phase 4 implementation / sprint planning using this `epics.md` plus existing architecture artifacts.
- 🔍 Recommended follow-up: keep Architecture workflow outputs aligned with Epic 3 & 4 technical needs (ASR service choice, Learning Card data model) and update this doc if new constraints emerge.