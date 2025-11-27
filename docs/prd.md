# Parla-AI - Product Requirements Document

**Author:** Michal
**Date:** 2025-11-27
**Version:** 1.0

---

## Executive Summary

Parla AI is a voice-first web application designed to help adult Polish speakers learning Italian (A2–B2 level) overcome the "language block" and fear of speaking. The application acts as a proactive, non-judgmental AI conversation partner that allows users to practice speaking on any topic in a safe, private environment. Unlike existing language learning apps, Parla AI uniquely supports natural code-switching (mixing Polish words when users forget Italian equivalents) and delivers immediate value through real-time visual notes during conversation—all without requiring user login.

The core vision is to create a safe, judgment-free space where intermediate language learners can practice speaking Italian naturally, using their native Polish language as a bridge when needed, while receiving real-time learning support through visual feedback.

### What Makes This Special

Parla AI's unique differentiator is its **natural code-switching support** combined with **real-time learning feedback**. Unlike ChatGPT's voice agent or traditional language learning apps, Parla AI:

1. **Handles mixed-language input naturally** - Users can seamlessly mix Italian and Polish when they forget words, and the system understands the context while maintaining Italian immersion in responses
2. **Delivers immediate learning value** - Real-time visual Learning Cards appear during conversation, showing new vocabulary and corrections without interrupting the flow
3. **Zero-friction access** - No login required means users can start practicing immediately, reducing barriers to regular practice
4. **Proactive conversation partner** - The AI actively engages users on topics they choose, creating natural conversation flow rather than scripted lessons

This combination addresses the core problem: learners have the knowledge but freeze when speaking. Parla AI removes the fear by providing a private, supportive environment that adapts to their natural communication patterns.

---

## Project Classification

**Technical Type:** web_app
**Domain:** edtech
**Complexity:** medium

Parla AI is a browser-based web application (SPA) that provides real-time voice interaction capabilities. The application leverages modern web APIs for voice capture, real-time transcription, and AI-powered conversation. It's designed as a progressive web application that can work offline for basic functionality, though core features require internet connectivity for AI processing.

The project falls into the educational technology (edtech) domain, specifically focused on language learning for adult learners. The complexity is medium due to:
- Real-time voice processing and transcription requirements
- Bilingual code-switching detection and handling
- Integration with AI models for natural conversation
- Real-time visual feedback system

However, it avoids high complexity factors like regulatory compliance (COPPA/FERPA don't apply to adult learners), clinical validation, or enterprise security requirements.

### Domain Context

As an educational technology product for adult language learning, Parla AI operates in a domain with moderate complexity. Key considerations include:

- **Privacy**: While COPPA/FERPA don't apply to adult learners, user privacy remains important, especially since no login is required
- **Accessibility**: The application should be accessible to users with varying technical skills and potentially different abilities
- **Content Guidelines**: The AI should provide appropriate, educational content suitable for language learning contexts
- **Learning Standards**: While not strictly required, alignment with CEFR (Common European Framework of Reference) levels (A2, B1, B2) helps ensure appropriate difficulty levels

The product focuses on conversation practice rather than formal curriculum delivery, which simplifies compliance requirements compared to K-12 or formal educational institution products.

---

## Success Criteria

Success for Parla AI is measured by its ability to help users overcome the language block and become more confident speaking Italian. Specifically:

**Primary Success Indicators:**
- **Code-switching accuracy**: The system correctly identifies and handles mixed Italian-Polish input with >90% accuracy, allowing users to naturally use Polish words when needed without breaking conversation flow
- **AI response quality**: The AI maintains natural, contextually appropriate Italian conversation that feels engaging and supportive, not robotic or scripted
- **User confidence**: Users report feeling less anxious about speaking Italian after regular practice sessions
- **Engagement**: Users return for multiple practice sessions, indicating the tool provides value and feels safe to use

**Technical Success Metrics:**
- Real-time transcription latency < 2 seconds from speech to visual feedback
- Learning Cards appear contextually relevant and helpful (not overwhelming)
- System handles code-switching without requiring users to explicitly indicate language switches

**Learning Success Metrics:**
- Users can complete full conversations on topics of their choice
- Users receive helpful vocabulary and grammar corrections that they can understand and apply
- Users feel the practice is preparing them for real-world Italian conversations

Success is not measured by traditional metrics like user count or retention rates (since there's no login), but by the quality of the learning experience and the confidence users gain.

{{#if business_metrics}}

### Business Metrics

{{business_metrics}}
{{/if}}

---

## Product Scope

### MVP - Minimum Viable Product

The MVP focuses on delivering the core value proposition: safe, private conversation practice with code-switching support and real-time learning feedback.

**Core MVP Features:**

1. **Voice Conversation System**
   - Real-time voice capture using browser Web Speech API or similar
   - Streaming transcription of user speech (Italian + Polish)
   - AI-powered conversation partner that responds in Italian
   - Natural conversation flow on user-selected topics

2. **Code-Switching Support**
   - Bilingual transcription that recognizes both Italian and Polish
   - Context understanding when users mix languages
   - AI maintains Italian responses even when user uses Polish helper words/questions
   - Seamless handling of language transitions

3. **Real-Time Learning Cards**
   - Visual panel (right-hand side) displaying learning notes during conversation
   - New vocabulary cards: Italian word with Polish translation
   - Grammar correction cards: user's error vs. correct form
   - Copy functionality: individual cards and full note content
   - Cards appear in real-time without interrupting audio flow

4. **Session Management**
   - Minimalist landing screen
   - Topic input field (free text, Polish language)
   - Proficiency level selection (A2, B1, B2)
   - Start/End session controls
   - Basic session summary screen

5. **No-Login Access**
   - Immediate access without account creation
   - No authentication system
   - Session data stored locally (browser storage) if needed

**MVP Exclusions:**
- PDF report generation
- PDF notes download
- User accounts or login
- Session history tracking
- Progress tracking over time
- Multiple language pairs (Polish → Italian only)
- Advanced analytics or reporting

### Growth Features (Post-MVP)

**Enhanced Learning Support:**
- PDF report generation with comprehensive grammar analysis
- Comprehensibility scoring and detailed feedback
- PDF notes download for offline review
- Session history (optional, privacy-first approach)
- Progress tracking with visual indicators of improvement
- Vocabulary review system based on past sessions

**Expanded Capabilities:**
- Additional language pairs beyond Polish → Italian
- Custom conversation scenarios and role-play templates
- Difficulty adjustment during conversation based on user performance
- Pronunciation feedback and practice
- Grammar-focused practice modes

**User Experience Enhancements:**
- Session replay functionality
- Favorite topics and conversation starters
- Customizable AI personality/teaching style
- Offline mode for basic functionality
- Mobile app version for on-the-go practice

### Vision (Future)

**Advanced Learning Platform:**
- Comprehensive learning analytics and personalized learning paths
- Integration with formal language learning curricula
- Community features for peer practice (optional)
- Teacher/tutor dashboard for monitoring student progress
- Certification and assessment capabilities aligned with CEFR standards

**Technology Evolution:**
- Advanced AI models fine-tuned specifically for language learning
- Real-time pronunciation analysis and correction
- Multi-modal learning (voice + visual + text)
- AR/VR integration for immersive conversation practice
- Adaptive difficulty that adjusts in real-time based on user performance

**Market Expansion:**
- Support for 20+ language pairs
- Enterprise/B2B version for language schools and institutions
- API for integration with other learning platforms
- White-label solution for educational institutions

---

{{#if domain_considerations}}

## Domain-Specific Requirements

{{domain_considerations}}

This section shapes all functional and non-functional requirements below.
{{/if}}

---

{{#if innovation_patterns}}

## Innovation & Novel Patterns

{{innovation_patterns}}

### Validation Approach

{{validation_approach}}
{{/if}}

---

## web_app Specific Requirements

**Browser Support:**
- Modern browsers with Web Speech API support (Chrome, Edge, Safari 14.1+, Firefox with polyfill)
- Progressive Web App (PWA) capabilities for potential offline functionality
- Responsive design for desktop and tablet use (mobile optimization in future)

**Application Architecture:**
- Single Page Application (SPA) architecture for smooth, app-like experience
- Real-time communication for voice streaming and transcription
- Client-side state management for session data
- No server-side session storage required (stateless design)

**Performance Targets:**
- Initial page load < 3 seconds
- Voice transcription latency < 2 seconds
- Learning Cards appear within 1 second of relevant conversation moment
- Smooth audio playback without stuttering

**SEO Strategy:**
- Basic SEO for landing page (though primary access is direct)
- No deep linking requirements for MVP (no shareable sessions)
- Focus on performance and user experience over search optimization

**Accessibility Level:**
- WCAG 2.1 Level AA compliance for visual elements
- Keyboard navigation support for all interactive elements
- Screen reader compatibility for Learning Cards content
- High contrast mode support

{{#if endpoint_specification}}

### API Specification

{{endpoint_specification}}
{{/if}}

{{#if authentication_model}}

### Authentication & Authorization

{{authentication_model}}
{{/if}}

{{#if platform_requirements}}

### Platform Support

{{platform_requirements}}
{{/if}}

{{#if device_features}}

### Device Capabilities

{{device_features}}
{{/if}}

{{#if tenant_model}}

### Multi-Tenancy Architecture

{{tenant_model}}
{{/if}}

{{#if permission_matrix}}

### Permissions & Roles

{{permission_matrix}}
{{/if}}
{{/if}}

---

## User Experience Principles

**Visual Personality:**
- **Minimalist and calming** - Clean interface that reduces anxiety, not overwhelming with options
- **Warm and supportive** - Visual design should feel friendly and non-judgmental
- **Focus on conversation** - UI elements support the voice interaction without competing for attention
- **Learning-first** - Visual hierarchy prioritizes the conversation and learning feedback

**Key Interaction Patterns:**

1. **Session Start Flow:**
   - Large, clear topic input field (prominent, not hidden)
   - Simple proficiency level selector (toggle or pills, not dropdown)
   - Prominent "Start" button that feels inviting, not intimidating
   - No unnecessary steps or friction

2. **During Conversation:**
   - Split view: Main conversation area (left) + Learning Cards panel (right)
   - Visual indicators for when AI is listening vs. speaking
   - Non-intrusive Learning Cards that don't interrupt flow
   - Clear visual distinction between vocabulary cards and correction cards
   - Easy copy functionality (one-click for cards, one-click for all notes)

3. **Audio Experience:**
   - Visual feedback for microphone status (listening, processing, speaking)
   - Clear indication when user should speak
   - Smooth transitions between user speech and AI response
   - Volume controls easily accessible but not prominent

4. **Session End:**
   - Clear "End Session" button (Zakończ) that's accessible but not accidentally clickable
   - Summary screen that feels like an accomplishment, not a report card
   - Option to start new session easily

**Design Philosophy:**
The UI should reinforce the core value: "This is a safe space to practice. You can make mistakes. The AI is here to help, not judge." Every design decision should reduce anxiety and increase confidence.

---

## Functional Requirements

Functional requirements define WHAT capabilities the product must have. These are the complete inventory of user-facing and system capabilities that deliver the product vision.

### Voice Interaction & Conversation

**FR-001:** Users can start a voice conversation session by clicking a "Start" button after entering a topic and selecting proficiency level.

**FR-002:** Users can speak in Italian and the system captures and transcribes their speech in real-time.

**FR-003:** Users can mix Polish words into their Italian speech when they forget Italian equivalents, and the system recognizes both languages.

**FR-004:** The AI conversation partner responds in Italian, maintaining language immersion even when users use Polish helper words.

**FR-005:** The AI conversation partner adapts conversation complexity based on selected proficiency level (A2, B1, or B2).

**FR-006:** The AI conversation partner engages users on topics they specify, creating natural conversation flow rather than scripted responses.

**FR-007:** Users can end a conversation session at any time by clicking an "End Session" button.

**FR-008:** The system provides visual feedback indicating when it's listening, processing, or speaking.

### Code-Switching Support

**FR-009:** The system transcribes mixed Italian-Polish speech, identifying which words are in which language.

**FR-010:** The system understands Polish context (e.g., user asking "jak się mówi..." or using Polish words) while maintaining Italian conversation flow.

**FR-011:** The system handles seamless transitions between Italian and Polish without requiring explicit language switching.

**FR-012:** The AI recognizes when Polish words are used as helper words or questions and responds appropriately in Italian.

### Learning Cards & Real-Time Feedback

**FR-013:** The system displays Learning Cards in a right-hand panel during conversation without interrupting audio flow.

**FR-014:** The system generates vocabulary Learning Cards showing new Italian words with Polish translations when relevant words appear in conversation.

**FR-015:** The system generates grammar correction Learning Cards showing user's error versus correct form when grammatical mistakes are detected.

**FR-016:** Users can copy individual Learning Cards to clipboard with a single click.

**FR-017:** Users can copy all Learning Cards content to clipboard with a single action.

**FR-018:** Learning Cards appear in real-time as relevant moments occur in conversation, not delayed until session end.

**FR-019:** Learning Cards are visually distinct (vocabulary cards vs. correction cards) so users can quickly identify content type.

### Session Management

**FR-020:** Users can enter a conversation topic via free text input field (accepts Polish language input).

**FR-021:** Users can select their Italian proficiency level (A2, B1, or B2) using a toggle or pill selector.

**FR-022:** Users can start a new conversation session from the landing screen.

**FR-023:** Users can view a session summary screen after ending a session.

**FR-024:** The system stores session data locally in browser storage (if needed for current session functionality).

### User Interface & Experience

**FR-025:** Users can access the application immediately without creating an account or logging in.

**FR-026:** Users can navigate the interface using keyboard controls (accessibility requirement).

**FR-027:** Users can access all functionality without requiring mouse/touch input (keyboard navigation support).

**FR-028:** The interface displays in a split-view layout: main conversation area (left) and Learning Cards panel (right).

**FR-029:** The interface provides clear visual indicators for microphone status (listening, processing, muted).

**FR-030:** The interface displays visual feedback when the AI is speaking vs. when the user should speak.

**FR-031:** Users can adjust audio volume through accessible controls.

**FR-032:** The interface is responsive and works on desktop and tablet screen sizes.

### Data & Privacy

**FR-033:** The system operates without requiring user authentication or account creation.

**FR-034:** The system does not store user conversations or personal data on servers (privacy-first approach).

**FR-035:** The system can store session data locally in browser storage for current session functionality only.

**FR-036:** Users can clear any locally stored data through browser settings (standard browser functionality).

### Browser & Platform Support

**FR-037:** The application works in modern browsers that support Web Speech API (Chrome, Edge, Safari 14.1+, Firefox with polyfill).

**FR-038:** The application functions as a Progressive Web App (PWA) with basic offline capabilities for UI (core features require internet).

**FR-039:** The application provides graceful degradation for browsers without full Web Speech API support.

### AI & Processing

**FR-040:** The system processes voice input using real-time transcription with latency under 2 seconds.

**FR-041:** The system generates AI responses that are contextually appropriate and maintain natural conversation flow.

**FR-042:** The system identifies learning opportunities (new vocabulary, grammar corrections) during conversation in real-time.

**FR-043:** The system adapts AI conversation style and complexity based on selected proficiency level.

### Accessibility

**FR-044:** The application meets WCAG 2.1 Level AA accessibility standards for visual elements.

**FR-045:** Learning Cards content is accessible to screen readers.

**FR-046:** The interface supports high contrast mode for users with visual impairments.

**FR-047:** All interactive elements have clear focus indicators for keyboard navigation.

---

**Total Functional Requirements: 47**

**Organization Notes:**
- FRs are organized by capability area (Voice Interaction, Code-Switching, Learning Cards, etc.)
- All FRs describe WHAT capabilities exist, not HOW they're implemented
- Each FR is testable and verifiable
- FRs cover all MVP scope features, domain requirements, and project-specific needs

---

## Non-Functional Requirements

### Performance

**Real-Time Processing:**
- Voice transcription latency: < 2 seconds from speech completion to transcription display
- AI response generation: < 3 seconds from user speech completion to AI response start
- Learning Cards appearance: < 1 second from relevant conversation moment to card display
- Audio playback: Smooth, continuous playback without stuttering or gaps

**Page Load & Responsiveness:**
- Initial page load: < 3 seconds on standard broadband connection
- Time to interactive: < 4 seconds
- UI responsiveness: All user interactions respond within 100ms
- Learning Cards panel updates without blocking main conversation interface

**Resource Efficiency:**
- Memory usage: Application should not cause browser performance degradation during typical 15-30 minute sessions
- Network efficiency: Minimize data transfer for real-time voice streaming
- Battery efficiency: Optimize for laptop/desktop use (tablet optimization in future)

### Security

**Privacy-First Design:**
- No user authentication required - zero account creation friction
- No server-side storage of user conversations or personal data
- Local storage only for current session functionality (can be cleared by user)
- No tracking or analytics that identify individual users

**Data Protection:**
- Voice data transmitted securely (HTTPS/WSS) to AI processing services
- No persistent storage of voice recordings
- Clear user understanding that conversations are not saved (privacy-first messaging)
- Compliance with GDPR principles (even though no personal data stored)

**Browser Security:**
- Follow browser security best practices for Web Speech API usage
- Secure handling of API keys and credentials (client-side considerations)
- No injection vulnerabilities in user-provided topic input

### Accessibility

**WCAG 2.1 Level AA Compliance:**
- Color contrast ratios meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- All functionality accessible via keyboard navigation
- Screen reader compatibility for all text content and Learning Cards
- Focus indicators clearly visible for all interactive elements

**User Experience Accessibility:**
- High contrast mode support for users with visual impairments
- Clear visual feedback for all user actions (not relying solely on color)
- Text alternatives for all non-text content
- Resizable text without breaking layout (up to 200% zoom)

**Language Learning Accessibility:**
- Learning Cards readable by screen readers with proper semantic markup
- Audio controls accessible via keyboard
- Visual indicators for audio state (listening/speaking) are clear and unambiguous

### Scalability

**User Load:**
- Application designed for individual user sessions (no concurrent user limits for MVP)
- Stateless architecture allows horizontal scaling if needed in future
- No shared state between sessions reduces scaling complexity

**Content & Language Support:**
- Architecture supports future addition of new language pairs without major refactoring
- Topic input system flexible enough to handle diverse conversation topics
- AI model integration designed to support different proficiency levels and languages

**Technical Scalability:**
- Client-side architecture reduces server load (processing happens client-side or via API)
- API integration designed to handle variable load (OpenAI API scaling)
- No database requirements for MVP simplifies scaling considerations

### Integration

**AI Service Integration:**
- Integration with OpenAI API for conversation and language processing
- Architecture supports switching or adding AI providers if needed
- Error handling for API failures with graceful degradation

**Browser API Integration:**
- Web Speech API for voice capture and transcription
- Browser storage APIs for local session data (if needed)
- Progressive Web App capabilities for offline UI functionality

**Future Integration Readiness:**
- Architecture allows for future integration with learning management systems (if needed)
- Design supports potential future user account system (though not in MVP)
- Structure supports future analytics integration (privacy-preserving, if implemented)

---

## References

**Source Documents:**
- Product Brief: `docs/product-brief-Parla-AI-2025-11-27.md`
- Workflow Status: `docs/bmm-workflow-status.yaml`

**Key Decisions:**
- Technology stack: OpenAI API, Vercel hosting, Web Speech API
- No authentication system: Privacy-first, zero-friction access
- Focus: Polish → Italian language learning for A2-B2 level adult learners
- Core innovation: Natural code-switching support with real-time learning feedback

---

_This PRD captures the essence of Parla-AI - a voice-first language learning application that helps adult Polish speakers overcome the language block through safe, private conversation practice with natural code-switching support and real-time learning feedback, all without requiring user login._

_Created through collaborative discovery between Michal and AI facilitator on 2025-11-27._

