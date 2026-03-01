# Feature Landscape

**Domain:** Visual problem-solving / collaborative graph editing
**Researched:** 2026-03-01
**Confidence:** HIGH

## Executive Summary

This research examines features across mind mapping tools (MindNode, Whimsical, XMind), collaborative whiteboards (Miro, Figma), and document editors (Notion) to understand what users expect from visual collaboration tools in 2026. The competitive landscape reveals clear patterns: real-time collaboration, AI-powered assistance, and version control are now table stakes. The opportunity for Solve lies in being the only tool that treats problem decomposition as a first-class workflow with GitHub-style collaboration.

Key insight: Users expect instant collaboration, intuitive canvas interactions, and multiple export formats as baseline features. What sets tools apart in 2026 is intelligent automation (AI features), seamless integration workflows, and novel interaction paradigms.

---

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature                           | Why Expected                                                        | Complexity | Notes                                                                                   |
| --------------------------------- | ------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------- |
| **Real-time collaboration**       | Standard across Miro, Figma, Notion, MindNode since 2024            | High       | Live cursors, presence awareness, conflict-free editing. See CRDT implementation notes. |
| **Infinite canvas with zoom/pan** | Core interaction model for all visual tools                         | Medium     | Must support pinch-to-zoom, two-finger pan, space+drag. Performance critical at scale.  |
| **Keyboard shortcuts**            | Power users expect productivity (Whimsical "wins on time to value") | Low        | Tab for child node, Enter for sibling, Delete, Undo/Redo minimum.                       |
| **Multi-format export**           | PDF, PNG, SVG are universal (XMind, Lucidchart, all major tools)    | Low        | SVG for vector, PNG for raster, PDF for sharing. JSON for backup/restore.               |
| **Touch gestures (mobile)**       | Mobile apps expect tap, swipe, pinch, rotate in 2026                | Medium     | Cross-device sync required. Offline mode expected.                                      |
| **Undo/Redo**                     | Universal expectation, but complex in collaborative context         | High       | User should only undo their own changes, not others'. Requires operation tracking.      |
| **Comments/annotations**          | Present in Figma, Notion, Miro, Lucidchart, all collaboration tools | Medium     | @mentions for notifications. Inline on nodes/edges. Threaded conversations.             |
| **Sharing with permissions**      | RBAC (role-based access control) standard: view/comment/edit        | Medium     | Granular control at graph level. Public links with view-only access.                    |
| **Search and filter**             | Essential for large canvases (Miro 1000+ templates, large boards)   | Medium     | Search by node text, tags, author. Filter by type, date created, status.                |
| **Selection and multi-select**    | Required for bulk operations (move, delete, style)                  | Low        | Shift+click, drag-to-select box, Ctrl+A for all.                                        |
| **Auto-layout**                   | Mind mapping tools (Whimsical, XMind) expect automatic arrangement  | Medium     | Tree layout for hierarchies. Force-directed for graphs. Manual override required.       |
| **Copy/paste**                    | Universal expectation for productivity                              | Low        | Within graph and cross-graph. Preserve relationships.                                   |
| **Visual customization**          | Colors, icons, shapes expected in all visual tools                  | Low        | Node colors, border styles, edge types. Visual tags (Miro sticky note colors).          |

---

## Differentiators

Features that set products apart. Not expected, but highly valued.

| Feature                                           | Value Proposition                                                      | Complexity | Notes                                                                                                |
| ------------------------------------------------- | ---------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| **GitHub-style fork/propose/merge**               | UNIQUE TO SOLVE: Version control for visual problem-solving            | Very High  | No competitor offers this for graphs. Figma has branching but not merge proposals with visual diffs. |
| **Subgraph selection for forking**                | Solve specific: fork part of a problem to work on independently        | High       | Select nodes/edges, extract as new graph, maintain parent relationship.                              |
| **Visual diff for merge proposals**               | Show what changed (added/removed/modified nodes/edges) side-by-side    | High       | Figma 2026 has visual diffs in PR view. Critical for Solve's value prop.                             |
| **Problem decomposition as first-class workflow** | Explicit "break down this problem" affordances vs generic mind mapping | Medium     | Guided workflows: identify problem → decompose → assign → solve → integrate.                         |
| **AI-assisted node generation**                   | 2026 trend: Whimsical, Miro Assist, Mapify all offer AI                | Medium     | "Expand this problem" → AI suggests sub-problems. Auto-cluster related nodes.                        |
| **Dependency tracking**                           | Show which sub-problems block others (critical path)                   | Medium     | Edge types: "depends on", "blocks", "relates to". Auto-detect cycles.                                |
| **Task status tracking**                          | Mark nodes as "open", "in progress", "solved", "verified"              | Low        | Integrates with problem-solving workflow. Color coding. Progress metrics.                            |
| **Activity timeline**                             | History of who did what when (like Git log)                            | Medium     | "User X forked subgraph Y", "Merge proposal submitted", etc.                                         |
| **Proposal review workflow**                      | Approve/request changes/merge proposals with comments                  | High       | GitHub PR review UI adapted for graphs. Inline comments on changes.                                  |
| **End-to-end encryption for collaboration**       | MindNode 2026 offers e2e encryption for live collab                    | High       | Privacy differentiator for sensitive problem-solving (corporate, research).                          |
| **Template library**                              | Miro has 1000+ templates; could offer problem types                    | Low        | "Software architecture", "Research question", "Business strategy" templates.                         |
| **Integration with external tools**               | Miro integrates 160+ tools; Solve could do Notion, Jira, GitHub        | Medium     | Export sub-problems to Jira tickets, link to GitHub issues.                                          |

---

## Anti-Features

Features to explicitly NOT build (at least for MVP/early phases).

| Anti-Feature                         | Why Avoid                                                | What to Do Instead                                                                      |
| ------------------------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Video/audio attachments on nodes** | Scope creep, storage costs, out of scope for M1-M3       | Text notes + external links only. Defer to M5 per PROJECT.md.                           |
| **Built-in video chat**              | Already solved by Zoom/Meet/Teams; integration better    | Provide integration hooks, not built-in solution.                                       |
| **Advanced diagramming shapes**      | Solve is for problem graphs, not flowcharts/UML          | Simple node shapes only. Don't compete with Lucidchart.                                 |
| **Presentation mode (slides)**       | Miro has this, but not core to problem-solving           | Defer. Export to PDF/PNG for presentations instead.                                     |
| **AI auto-solve**                    | Too ambitious, trust/accuracy issues, not valuable yet   | AI suggests decomposition, doesn't solve problems autonomously.                         |
| **Marketplace for solutions**        | M4 or post-MVP feature, requires community               | Build community features first before marketplace.                                      |
| **Native mobile app (iOS/Android)**  | Use React Native web/PWA first to validate               | M1-M3 use PWA. Native apps only if traction proves need.                                |
| **Offline-first architecture**       | Too complex for M1-M3; sync conflicts multiply issues    | Online-first. Cache for brief disconnects, but don't support offline editing initially. |
| **Granular node-level permissions**  | Complexity explosion; graph-level permissions sufficient | Permissions at graph level (owner/editor/viewer), not per-node.                         |
| **Custom scripting/plugins**         | Premature; need stable core first                        | Hard-code common workflows. Plugin system is post-MVP.                                  |

---

## Feature Dependencies

Dependency relationships between features (B requires A):

```
Real-time collaboration → Conflict resolution (CRDT or OT)
Real-time collaboration → Presence awareness (cursors, avatars)
Fork/propose/merge → Visual diff
Fork/propose/merge → Proposal review workflow
Fork/propose/merge → Version history
Subgraph forking → Selection tools
Subgraph forking → Graph extraction algorithm
AI-assisted generation → Node/edge creation API
AI-assisted generation → External LLM integration
Dependency tracking → Edge type system
Task status tracking → Node metadata system
Search and filter → Full-text indexing
Search and filter → Tag system
Export (SVG/PDF) → Server-side rendering
Mobile support → Touch gesture handling
Mobile support → Responsive layouts
Offline mode → Local storage + sync
Offline mode → Conflict resolution
```

---

## MVP Recommendation

**Prioritize (M1 Foundation):**

1. **Infinite canvas with zoom/pan** — Core interaction model, blocking everything else
2. **Node/edge CRUD** — Create, read, update, delete graphs
3. **Selection and multi-select** — Required for productivity
4. **Keyboard shortcuts** — Power user table stakes
5. **Visual customization basics** — Colors, basic styling
6. **Export to PNG/SVG/PDF** — Sharing necessity
7. **Undo/Redo (local)** — Expected feature, start with single-user version
8. **Auth (email + Google OAuth)** — Already in PROJECT.md requirements

**Defer to M2 (Collaboration):**

1. **Real-time collaboration** — M3 per PROJECT.md, design for it now
2. **Comments/annotations** — Requires real-time infrastructure
3. **Sharing with permissions** — Comes with collaboration
4. **Presence awareness** — Part of real-time collab package

**Defer to M3 (Fork/Merge Workflow):**

1. **GitHub-style fork/propose/merge** — The differentiator, but needs collab first
2. **Visual diff** — Critical for merge workflow
3. **Subgraph forking** — Advanced forking feature
4. **Proposal review workflow** — Part of merge workflow
5. **Activity timeline** — Shows fork/merge history

**Defer to M4+ (Advanced Features):**

1. **AI-assisted node generation** — Nice to have, not core
2. **Dependency tracking** — Adds value after basic workflow proven
3. **Task status tracking** — Enhancement to problem-solving workflow
4. **Template library** — After usage patterns emerge
5. **Integration with external tools** — Post-PMF

---

## Research Findings: Feature Clusters

### Real-Time Collaboration (High Complexity)

**What's standard in 2026:**

- Live cursors showing user positions (Figma, Miro, Notion, MindNode)
- User avatars with color-coded presence
- Conflict-free editing using CRDTs or Operational Transformation
- Per-user undo/redo (users only undo their own changes)
- Automatic sync with offline support (Google Docs, Notion)

**Implementation notes:**

- CRDTs (Yjs framework) are preferred over OT in 2026 (Tiptap, Decipad use Yjs)
- WebSocket + Redis for presence service typical
- Offline editing requires local state + sync on reconnect
- "Each user has individual command stack" pattern (Eclipse GLSP)

**For Solve:**

- Design data model for CRDT compatibility in M1
- Implement in M3 after core graph editing proven
- Use Yjs + WebSocket (via Fastify @fastify/socket.io)

### Canvas Interaction (Medium Complexity)

**What's standard in 2026:**

- Infinite canvas with smooth zoom/pan (Miro, Figma, Whimsical)
- Pinch-to-zoom on trackpad/mobile
- Space+drag for panning
- Scroll wheel zoom (or Ctrl+scroll)
- Rubber-band selection (drag box to select multiple items)

**Performance considerations:**

- Canvas rendering for 10,000+ nodes requires WebGL or aggressive optimization
- Level-of-detail rendering: hide/simplify distant nodes
- Offscreen canvas caching for static content
- Batch rendering to reduce draw calls
- GPU acceleration for transforms (zoom/pan)

**For Solve:**

- React Native Skia for mobile (already decided per PROJECT.md)
- Web: Skia-wasm or HTML Canvas with WebGL fallback
- Implement viewport culling from day one (only render visible nodes)

### Version Control for Visual Content (Very High Complexity)

**What exists in 2026:**

- **Figma branching:** Create branch → edit → request review → merge with visual diff
- **Figma GitHub integration (2026):** Branch/commit Figma files to GitHub, PR shows visual diffs
- **Kactus:** Git for Sketch files with visual diffing
- **CAD tools (Onshape):** Git-style branching for 3D models

**What Solve needs:**

- Fork graph (or subgraph) → work independently → submit proposal → visual diff → merge
- Visual diff: side-by-side comparison showing added/removed/modified nodes/edges
- Conflict resolution UI when merge conflicts occur (both users edited same node)
- Graph merging algorithm (three-way merge: base, fork, proposal)

**Challenges:**

- Graph structure changes are complex (not just text diffs)
- Detecting semantic conflicts (e.g., two users add different children to same node)
- UI for resolving conflicts visually

**For Solve:**

- Start with simple "copy graph" fork in M2
- Add proposal system in M3 (proposal = diff between fork and original)
- Visual diff: highlight changed nodes in different colors
- Merge: accept/reject individual changes, or auto-merge non-conflicting

### AI-Powered Features (Medium Complexity)

**What's standard in 2026:**

- **Mind mapping:** AI generates mind map from text prompt (Whimsical, Mapify)
- **Expansion:** AI suggests child nodes when you click "expand" (Miro Assist)
- **Clustering:** AI groups related sticky notes/nodes (Miro Assist)
- **Summarization:** AI condenses large maps to summaries (several tools)
- **Auto-generation:** AI creates related topics as you type (various tools)

**What Solve could do:**

- "Expand this problem" → LLM suggests 3-5 sub-problems
- "Cluster related nodes" → ML groups similar problems
- "Suggest dependencies" → AI detects likely "blocks" relationships
- "Generate problem template" → AI creates starter graph from description

**Implementation:**

- OpenAI API or similar (Whimsical uses OpenAI, doesn't train on user data)
- Send minimal context (node text, not full graph structure)
- User reviews/edits suggestions before accepting
- Privacy: opt-in, clear about data sent to external API

**For Solve:**

- Defer to M4 at earliest (after core workflow proven)
- Start with simple "suggest child nodes" feature
- Require user approval for all AI suggestions

### Mobile Experience (Medium Complexity)

**What's expected in 2026:**

- Touch gestures: tap, swipe, pinch-to-zoom, rotate, long-press
- Cross-device sync (edit on desktop, view on mobile)
- Offline mode with auto-sync on reconnect
- Simplified UI for small screens
- Finger-optimized targets (large hit areas)

**For Solve:**

- React Native + Expo supports iOS/Android/Web (already decided)
- Skia for consistent rendering across platforms
- M1: Focus on web/desktop, but don't break mobile
- M2: Polish mobile experience
- PWA first, native apps only if needed

---

## Confidence Assessment

| Feature Category         | Confidence | Reason                                                                        |
| ------------------------ | ---------- | ----------------------------------------------------------------------------- |
| Real-time collaboration  | HIGH       | Verified across Figma, Miro, Notion, MindNode official docs + WebSearch       |
| Canvas interaction       | HIGH       | Multiple sources (Grafana, technical blogs, MDN) + consistent patterns        |
| Version control (visual) | HIGH       | Figma official docs 2026, Atlassian Git tutorial, specialized tools verified  |
| AI features              | MEDIUM     | WebSearch for current tools; rapidly evolving area, less stable patterns      |
| Mobile gestures          | HIGH       | Multiple 2026 sources (Material Design, mobile app trends, mind mapping apps) |
| Export formats           | HIGH       | Consistent across all tools (PDF, PNG, SVG universal)                         |
| Permissions/sharing      | HIGH       | Standard RBAC patterns verified in SharePoint, collaboration tool docs        |
| Offline sync             | MEDIUM     | Implementation details vary; CRDT approach well-documented but complex        |

---

## Gaps and Open Questions

**Unanswered by research:**

1. **Graph-specific version control:** No existing tool does fork/merge for arbitrary graphs (not mind maps with tree structure, not design files). Solve is breaking new ground here. Research needed in M3 for:
   - Graph merge algorithms
   - Semantic conflict detection
   - Visual diff UX for graphs (not trees)

2. **Scale limits:** When does a graph become too large for real-time collaboration? Most sources focus on documents/diagrams, not graphs with 1000+ nodes. Need to:
   - Load test Yjs with large graph structures
   - Define soft limits (warn at 500 nodes? hard limit at 5000?)

3. **Problem-solving specific features:** Domain research focused on general visual collaboration, not problem decomposition specifically. Need to:
   - Interview users about problem-solving workflows
   - Observe how people currently break down problems (spreadsheets? docs? tools?)
   - Identify patterns to codify in UI

4. **Mobile-first vs desktop-first:** Research shows most visual collaboration tools are desktop-first with mobile support. Should Solve be mobile-first given React Native stack? Need to:
   - Define primary use case (quick capture on mobile vs deep editing on desktop)
   - Validate target users' device preferences

---

## Sources

### Collaborative Whiteboards

- [Miro Review 2026: Best Visual Collaboration Tool?](https://work-management.org/project-management/miro-review/)
- [5 Powerful Collaboration Features in Miro](https://miro.com/collaboration/)
- [What is Miro and how to use it for collaboration - Tekpon 2026](https://tekpon.com/insights/productivity-tools/collaboration/what-is-miro/)

### Design Collaboration Tools

- [Figma: The Collaborative Interface Design Tool](https://www.figma.com/)
- [Mastering Figma: A Guide to Collaborative Design Projects](https://belovdigital.agency/blog/how-to-use-figma-for-collaborative-design-projects/)
- [Guide to branching – Figma Learn](https://help.figma.com/hc/en-us/articles/360063144053-Guide-to-branching)
- [Figma's 2026 Updates Quietly Redefine Design-Dev Handoff](https://medium.com/@Rythmuxdesigner/figmas-2026-updates-quietly-redefine-design-dev-handoff-and-not-everyone-s-ready-98307f2ea2a8)
- [How to Use Figma Branching & Versioning](https://www.supernova.io/blog/how-to-use-figma-branching-versioning-for-your-component-library)

### Mind Mapping Tools

- [Free Mind Map Maker - Whimsical](https://whimsical.com/mind-maps)
- [How to use AI-assisted mind mapping - Whimsical](https://help.whimsical.com/article/708-how-to-use-ai-assisted-mind-mapping)
- [Best Mind Mapping Software Compared (2026)](https://www.atlasworkspace.ai/blog/best-mind-mapping-software)
- [MindNode Features](https://www.mindnode.com/features)
- [The best mind mapping software | Zapier](https://zapier.com/blog/best-mind-mapping-software/)
- [10 Best Mind-Mapping Software of 2026 | Creately](https://creately.com/reviews/best-mind-mapping-software/)

### Document Collaboration

- [Notion Review 2026: Pricing, Features, Pros & Cons](https://research.com/software/reviews/notion)
- [Mastering Real-Time Collaboration: Notion's Document Editing](https://ones.com/blog/mastering-real-time-collaboration-notion-document-editing/)
- [Does Notion have real-time collaboration?](https://latwy.co/knowledge-base/does-notion-have-real-time-collaboration)

### Version Control (Visual)

- [Understanding the git fork and pull request workflow](https://graphite.com/guides/understanding-git-fork-pull-request-workflow)
- [Git-Style Version Control for CAD](https://www.onshape.com/en/blog/git-style-version-control-cad-data-management)
- [Top 10+ Version Control Tools in 2026](https://research.aimultiple.com/version-control-tools/)

### Collaborative Graph/Diagram Editors

- [Lucidchart | Diagramming Powered By Intelligence](https://www.lucidchart.com/pages)
- [Real-time multi-user collaborative diagramming - draw.io](https://drawio-app.com/blog/real-time-multi-user-collaborative-diagramming/)
- [Graphity - Collaborative Editing](https://www.graphity.com/collaborative-editing.html)
- [Real-time Collaboration on Diagrams with Eclipse GLSP](https://eclipsesource.com/blogs/2024/02/21/real-time-collaboration-on-diagrams-with-eclipse-glsp/)

### Canvas Rendering & Performance

- [Optimising HTML5 Canvas Rendering](https://blog.ag-grid.com/optimising-html5-canvas-rendering-best-practices-and-techniques/)
- [Creating a Zoom UI - Steve Ruiz](https://www.steveruiz.me/posts/zoom-ui)
- [Canvas pan and zoom improvements | Grafana Labs](https://grafana.com/whats-new/2025-07-31-canvas-pan-and-zoom-improvements/)
- [Graph visualization efficiency of popular web-based libraries](https://pmc.ncbi.nlm.nih.gov/articles/PMC12061801/)

### Conflict Resolution & Real-Time Editing

- [Conflict Resolution in Real-Time Collaborative Editing | Hoverify](https://tryhoverify.com/blog/conflict-resolution-in-real-time-collaborative-editing/)
- [Building a Collaborative Document Editor: CRDTs and Conflict Resolution](https://codefarm0.medium.com/building-a-collaborative-document-editor-real-time-synchronization-crdts-and-conflict-resolution-4743436639f5)
- [Collaborative and Offline Editing Using CRDTs • Decipad](https://www.decipad.com/blog/decipads-innovative-method-collaborative-and-offline-editing-using-crdts)
- [Tiptap Collaboration - Collaborative Real Time Editor](https://tiptap.dev/product/collaboration)

### User Presence & Awareness

- [Collaborative Presence Features • Flexum](https://flexum.io/features/collaborative-presence-features)
- [Awareness & Presence | Yjs Docs](https://docs.yjs.dev/getting-started/adding-awareness)
- [How to use presence indicators like live cursors](https://dev.to/superviz/how-to-use-presence-indicators-like-live-cursors-to-enhance-user-experience-38jn)
- [PartyKit: Building Real-Time Collaborative Apps in 2026](https://latestfromtechguy.com/article/partykit-realtime-collaboration-2026)

### Permissions & Access Control

- [Permissions Management: Secure Access Without Complexity](https://baserow.io/blog/permissions-management-secure-access)
- [Balancing Security and Productivity: Team Collaboration Permissions](https://ones.com/blog/balancing-security-productivity-mastering-team-collaboration-permissions/)
- [Top Rated Collaboration Software with Access Controls 2026](https://www.getapp.com/collaboration-software/web-collaboration/f/access-control/)

### AI Features & Problem Decomposition

- [How to Create Task Decomposition](https://oneuptime.com/blog/post/2026-01-30-task-decomposition/view)
- [Breaking Down Tasks: Task Decomposition for AI Agents](https://mbrenndoerfer.com/writing/breaking-down-tasks-task-decomposition-ai-agents)
- [AI-Driven Decomposition: Refactoring Monoliths in 2026](https://beckmoulton.medium.com/ai-driven-decomposition-refactoring-monoliths-with-generative-tools-in-2026-85dd27f33e5d)

### Export & Productivity Features

- [Export - Xmind - Mind Mapping App](https://xmind.app/user-guide/xmind/export-new/)
- [7 Amazing Enterprise Mindmap Tools with Powerful Export Options](https://mindmap.guide/post/7-amazing-enterprise-mindmap-tools-with-powerful-export-options/)
- [22 Best Mind Mapping Software For Teams In 2026](https://thedigitalprojectmanager.com/tools/mind-mapping-software/)

### Mobile & Touch Gestures

- [Top 5 Mind Mapping Apps for Mac, Windows, iPad and Mobile (2026)](https://mapify.so/blog/best-mind-mapping-apps)
- [Use gestures and transitions in your app interaction design](https://www.justinmind.com/features/mobile-app-gestures-transitions)
- [The Next Wave of Mobile Apps: 2026 Design Innovations](https://uidesignz.com/blogs/mobile-apps-design-innovations)
