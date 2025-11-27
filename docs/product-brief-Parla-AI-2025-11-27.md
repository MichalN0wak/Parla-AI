# Product Brief: Parla-AI

**Date:** 2025-11-27
**Author:** Michal
**Context:** greenfield

---

## Executive Summary

Parla AI is a voice-first web application designed to help adult Polish speakers learning Italian (A2–B2 level) overcome the "language block" and fear of speaking. The application acts as a proactive, non-judgmental AI conversation partner that allows users to practice speaking on any topic in a safe, private environment. Unlike existing language learning apps, Parla AI uniquely supports natural code-switching (mixing Polish words when users forget Italian equivalents) and delivers immediate value through real-time visual notes during conversation—all without requiring user login.

---

## Core Vision

### Problem Statement

Adult Polish speakers learning Italian at intermediate levels (A2–B2) face a critical barrier: the "language block" and fear of speaking. Despite having theoretical knowledge (reading/writing skills), learners freeze during conversation due to:

1. **Stress and fear of judgment** - Anxiety about making mistakes in front of others
2. **Lack of safe practice environment** - No private space to practice without embarrassment
3. **Code-switching limitation** - Existing apps cannot handle natural mixed-language input (Italian with Polish interruptions when users forget the Italian equivalent)

This prevents learners from becoming truly communicative, even when they have the vocabulary and grammar knowledge to express themselves.

### Why Existing Solutions Fall Short

The primary reference point is ChatGPT's voice agent, which demonstrates the potential of AI conversation partners. However, existing solutions fail to address the specific needs of language learners:

1. **No code-switching support** - Cannot handle natural mixed-language input (Italian with Polish interruptions)
2. **Lack of language learning focus** - Generic AI assistants don't provide structured learning feedback
3. **No real-time learning support** - Missing live vocabulary and correction notes during conversation
4. **No comprehensive reporting** - Lack of grammar analysis and comprehensibility scoring
5. **Requires login/account** - Creates friction for users who want immediate, private practice

### Proposed Solution

Parla AI is a voice-first web application that acts as a proactive, non-judgmental AI conversation partner. Key features:

- **Voice-first interaction** - Natural conversation practice on any topic the user chooses
- **Code-switching support** - Handles mixed-language input (Italian with Polish interruptions) naturally
- **Safe, private practice** - Designed for use at home with headphones, no judgment, no login required
- **Immediate value delivery** - Real-time visual notes (Learning Cards) during conversation with copy functionality

---

## Target Users

### Primary Users

Adult Polish speakers learning Italian at intermediate levels (A2–B2) who:
- Have theoretical knowledge (reading/writing) but struggle with speaking
- Experience stress or fear of judgment when speaking
- Want to practice in a safe, private environment (e.g., at home with headphones)
- Need to become more communicative despite having vocabulary and grammar knowledge

### User Journey

**Session Start:**
1. User lands on a minimalist landing screen
2. Manually types a topic into a central text input field (input in Polish language)
3. Selects proficiency level (A2, B1, or B2) using a toggle or pill selector
4. Clicks a large "Start" button to enter the session

**Topic Selection:**
- Users have complete freedom to choose any topic via free text input
- Examples include specific scenarios: "shopping at the market," "situations in a restaurant"
- Or broader subjects: "investing," "football"

**During Conversation:**
- System uses bilingual transcription to recognize both Italian speech and Polish interruptions/helper questions
- AI understands Polish context (e.g., user asking for a word) but responds in Italian to maintain learning immersion
- Real-time visual notes appear in right-hand panel (Split View) without interrupting audio flow
- Learning Cards show:
  - New vocabulary (Italian word with translation)
  - Corrections (highlighting user's error versus correct form)
- Users can copy individual Learning Cards or the full note content

**Session End:**
- User clicks "End Session" (Zakończ) button
- Summary screen appears (future versions may include PDF report downloads)

---

## MVP Scope

### Core Features (MVP)

The minimum viable product focuses on delivering immediate value with essential functionality:

1. **Voice conversation** - Real-time voice interaction with AI conversation partner
2. **Code-switching support** - Bilingual transcription handling Italian speech with Polish interruptions
3. **Real-time Learning Cards** - Visual notes appearing during conversation:
   - New vocabulary (Italian word with Polish translation)
   - Grammar corrections (user error vs. correct form)
   - Copy functionality for individual cards or full note content
4. **No login required** - Immediate access without account creation
5. **Proficiency level selection** - A2, B1, or B2 level selection at session start
6. **Topic input** - Free text input (in Polish) for choosing conversation topics

### Out of Scope for MVP

- PDF report generation (grammar analysis, comprehensibility scoring)
- PDF notes download
- User accounts or login system
- Session history or progress tracking
- Multiple language pairs (focusing on Polish → Italian only)

---

## Success Metrics

### Product Metrics

The success of Parla AI will be measured through:

1. **Code-switching accuracy** - How well the system recognizes and handles mixed-language input (Italian with Polish interruptions)
2. **AI response quality** - Relevance, appropriateness, and helpfulness of AI responses in maintaining conversation flow and learning immersion
3. **User satisfaction** - Overall experience quality, ease of use, and perceived value

These metrics will be evaluated through:
- Technical testing of transcription and code-switching capabilities
- User testing and feedback sessions
- Quality assessment of AI conversation responses

---

## Technical Preferences

### Technology Stack

- **AI Model:** OpenAI (user has OpenAI account setup)
- **Hosting/Deployment:** Vercel (low budget solution)
- **Platform:** Web application (browser-based)
- **Voice Processing:** Real-time voice transcription and processing

### Constraints

- Budget-conscious solution (Vercel hosting)
- No login/authentication system required
- Personal project with no enterprise requirements

---

## Business Context

### Project Type

- **Personal project** - Educational/learning project for building such a product
- **No timeline constraints** - Flexible development schedule
- **No stakeholders** - Independent development
- **No external considerations** - Focus on learning and product development

---

## Future Vision

### Potential Enhancements (Post-MVP)

- **PDF Reports** - Comprehensive grammar analysis and comprehensibility scoring
- **PDF Notes Download** - Exportable vocabulary lists from sessions
- **Session History** - Optional tracking of practice sessions (with privacy-first approach)
- **Progress Tracking** - Visual indicators of improvement over time
- **Additional Language Pairs** - Expand beyond Polish → Italian

---

