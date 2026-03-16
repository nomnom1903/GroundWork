# Groundwork
### Institutional Knowledge Operating System for Enterprise NOCs

**Live demo:** https://nomnom1903.github.io/GroundWork/

---

## The Problem

AI can only automate what it knows.

Today's AI networking tools — including Cisco's AI Canvas — know networking in general. They know BGP, OSPF, NXOS, ThousandEyes. What they don't know is *your* network: your device quirks, your unwritten operational constraints, the diagnostic patterns your senior engineers carry in their heads and never write down.

That gap is why AI in network operations stays stuck at "advice." It's why a technically correct recommendation still causes a 3-hour outage. It's why operators don't trust it to act.

**Groundwork closes that gap.**

---

## What Groundwork Does

Groundwork is an agentic AI platform that learns your NOC's institutional knowledge — without asking anyone to write documentation.

It works through four interlocking mechanisms:

| Mechanism | How it works |
|---|---|
| **Ambient Capture** | Watches CLI commands, MCP tool calls, config diffs, and resolution actions during live investigations. Extracts knowledge from behavior, not forms. |
| **Structured Verification** | After each resolved incident, presents what it captured and asks the operator to confirm or correct — in under 60 seconds, using multiple-choice questions. |
| **Progressive Trust** | Every confirmed knowledge item raises the automation confidence ceiling for that incident type. The system earns its right to act autonomously, step by step. |
| **Safety Through Knowledge** | Institutional knowledge is not just the product — it is the safety guardrail. Autonomous execution only occurs when the system has validated knowledge of root cause, fix, and blast radius. |

---

## Who It's For

Groundwork serves four roles within a NOC environment:

- **NOC Operators** — Faster context at incident start, AI reasoning visible on demand, unambiguous action options, and instant override at any point.
- **Senior Network Engineers** — Governance over knowledge quality. Full provenance on every item. The ability to correct, expire, or flag knowledge without a ticket process.
- **NOC Team Leads** — A weekly governance digest completable in 15 minutes. Divergence resolution. Business metrics in outcomes (MTTR, escalations avoided), not system internals.
- **Network Operations Managers** — Adoption dashboards, autonomy coverage trend, and business impact quantification to demonstrate ROI.

---

## Core Workflow

```
Alert fires
    → Groundwork queries all four knowledge types in parallel
    → Operator opens Alert Command Center (O-1)
    → Reviews pre-loaded context and knowledge gaps (O-2)
    → Collaborates with AI on live investigation (O-3)
    → Reviews execution tier, blast radius, and approves action (O-4)
    → Confirms captured knowledge in 60 seconds post-resolution (O-5)
    → Sees autonomy coverage change: "2 more confirmations to Tier 1" (O-6)
```

The three execution tiers reflect the system's current state of knowledge — not danger:

| Tier | Label | What it means |
|---|---|---|
| **Tier 1** | Autonomous | Already handled. See it in the resolutions feed. |
| **Tier 2** | Supervised | Executing now. 5-minute window to halt if you disagree. |
| **Tier 3** | Approval Required | The AI has laid out the case — you decide. |

---

## The Four Types of Institutional Knowledge

| Type | What it contains | Capture strategy |
|---|---|---|
| **Topological** | Device relationships, routing topology, downstream impact maps | KARL-style vector retrieval from Catalyst Center / CMDB |
| **Historical** | Past incidents, resolution notes, config change logs, baselines | KARL retrieval + Claude parsing of ServiceNow free-text |
| **Operational** | Active change windows, SLA states, maintenance schedules, institutional locks | Real-time ITSM subscription + operator-declared locks |
| **Tacit** | Diagnostic instincts, device quirks, "never do X on Y" — never written down | Ambient behavioral capture + structured micro-verification post-resolution |

---

## Solving the Cold Start Problem

On day one, the tacit knowledge base is empty. Groundwork addresses this through two parallel bootstrap activities before go-live:

**Silent Mining** — Ingests 3 years of ServiceNow tickets, Splunk incident history, and Catalyst Center config change logs. Extracts 200–400 candidate knowledge items at low confidence, ready for live confirmation from day one.

**Knowledge Sprint** — A structured 20-minute guided interview per senior engineer. Three question types: what a new engineer would get wrong, institutional locks ("I would never X on Y because Z"), and lessons learned the hard way. Each answer creates a medium-confidence tacit knowledge entry immediately.

---

## Design Principles

Seven principles govern every design decision. When two valid approaches conflict, these are the tiebreaker — in order:

1. **Trust is architecture, not aesthetics** — The system earns trust through consistent, transparent behavior across dozens of interactions before operators are asked to rely on it.
2. **Operators are always in control** — Every autonomous action has a visible rollback. No silent execution. Override is always within 3 interactions.
3. **Show reasoning, not just answers** — Every confidence score, recommendation, and tier assignment has an expandable "why" with specific evidence and reasoning steps.
4. **Minimum friction for maximum capture** — Capture is ambient or confirmation-based. The only freeform input is the "Other" field.
5. **Progressive disclosure** — Primary views show what's needed for immediate decisions. Depth is one click away, never required.
6. **Failure is visible and recoverable** — When the AI is wrong, correction is obvious and frictionless. Every wrong recommendation is a learning opportunity.
7. **Calm technology** — A NOC is already high-stress. Groundwork must not add to it. Notifications surface only when operator attention is genuinely required.

---

## Platform Structure

Three top-level navigation areas:

| Area | Primary users | Purpose |
|---|---|---|
| **Operations** | NOC Operators, Senior Engineers | Active incident triage, investigation, execution, post-resolution capture |
| **Knowledge** | Senior Engineers, Team Leads | Knowledge base browsing, governance review, validation queue |
| **Insights** | Team Leads, Managers | Autonomy coverage dashboard, business metrics, knowledge health |

---

## Success Metrics

| Category | Metric | Target at 90 days |
|---|---|---|
| Adoption | Daily active usage | >80% of operators per shift |
| Adoption | O-5 completion rate | >70% of resolved investigations |
| Knowledge | Tacit knowledge items captured | >200 |
| Knowledge | Validation rate (ambient captures confirmed) | >45% |
| Business | MTTR improvement vs. baseline | >30% reduction |
| Business | Autonomy coverage (Tier 1 eligible incident types) | >25% |
| Business | Autonomous resolutions per month | >20 by Day 90 |

---

## V1 Scope

Groundwork V1 is a desktop-first web application. The following are explicitly **out of scope** for V1:

- Mobile application
- Multi-organization knowledge sharing
- Voice interface
- Natural language policy creation (free-form)
- Public internet knowledge sources
- Predictive alerting
- Cross-team knowledge sharing (outside the NOC)

---

## Running Locally

```bash
npm install
npm run dev
```

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **UI Components:** Radix UI, shadcn/ui, MUI
- **Design source:** Figma Make

---

## Design Source

This codebase was generated from the Groundwork Figma design file. The original design is available at the link in [`ATTRIBUTIONS.md`](./ATTRIBUTIONS.md).
