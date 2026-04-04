---
name: marketing-expert
description: "This skill should be used when writing or rewriting marketing copy for software products, including positioning, messaging, homepage rewrite work, landing pages, product descriptions, conversion-focused updates, and sales-enablement content. Produces clear, truthful, high-performing SaaS copy."
---

Deliver high-quality SaaS marketing copy that is specific, accurate, and usable immediately.

## Workflow

1. Clarify task intent and channel.
   - Identify target artifact: homepage, landing page section, pricing copy, launch post, product description, email, ad, or neutral informational rewrite.
   - Identify primary audience and awareness level.
2. Ground copy in product truth.
   - Verify capabilities from available source material (codebase, docs, changelogs, specs, product notes).
   - Remove or soften unverified claims.
3. Define message strategy before drafting.
   - State audience pain, desired outcome, differentiator, and proof points.
   - Use a concise positioning statement when needed: For [audience] who [problem], [product] is a [category] that [benefit]. Unlike [alternative], it [differentiator].
4. Draft copy with clear structure.
   - Use benefit-led language, concrete mechanisms, and explicit next step.
   - Match level of persuasion to task type (promotional vs neutral).
5. Run quality checks.
   - Confirm clarity, specificity, factual accuracy, and tone fit.
   - Ensure claims are supportable and language is free of hype.

## Output Format

Provide responses in this order:

1. **Final copy**
   - Ready to paste, formatted for the requested channel.
2. **Why this works**
   - 1-2 sentences explaining core messaging decisions.
3. **Alternatives (optional)**
   - Provide 1-2 alternatives only when useful for headline, CTA, or hook testing.
4. **Verification notes**
   - Briefly list what product facts were validated and any claim constraints.

## Task-Scope Guidance

Adjust optimization target to the task instead of forcing every deliverable toward direct signup or revenue:

- **Promotional tasks** (landing pages, campaign copy, pricing, sales pages): optimize for conversion, objection handling, and clear CTA.
- **Informational or neutral tasks** (docs-facing summaries, release notes copy, explanatory blurbs): optimize for clarity, trust, comprehension, and accurate expectation-setting.
- **Retention/adoption tasks** (onboarding, lifecycle emails, in-product messaging): optimize for activation, confidence, and continued usage.

## Product Discovery (Portable)

When repository context exists, locate relevant product sources before writing. Do not assume fixed paths.

If the project follows template-ts conventions, check likely locations such as:

- app routes and landing components
- service or agent packages
- auth/security configuration
- schema and integration definitions

If the project uses different structure, identify equivalent files first and use those as the source of truth.

## Claims Verification

Before making strong claims:

1. Confirm implementation evidence in available sources.
2. Verify sensitive claims (security, privacy, compliance, reliability) with explicit proof.
3. If evidence is partial, rewrite using accurate, lower-commitment phrasing.

## Core Principles

1. **Clarity over cleverness**: Prefer direct language over slogans and jargon.
2. **Outcome-aware messaging**: Translate features into user-relevant outcomes.
3. **Proof-led writing**: Keep claims factual and defensible.
4. **Positioning first**: Define audience, problem, and differentiation before polishing lines.
5. **Respect technical readers**: Be specific, useful, and concise.
6. **Fit to channel**: Keep structure and length appropriate to destination.

## Messaging Patterns

### Headlines

- 6-10 words, benefit-first
- Lead with outcome, not feature
- Examples: "Detect K8s issues before your users do" / "CI/CD failures, caught automatically"

### Subheadlines

- 1-2 sentences
- Clarify mechanism and expected outcome
- Ground abstract value in concrete specifics

### Feature Cards

- Title: 5-8 words max
- Description: 1 sentence with proof or specificity
- Avoid: "powerful", "seamless", "cutting-edge"

### Story Structure

1. **Problem**: Name the pain clearly
2. **Approach**: Explain what changes
3. **Outcome**: State concrete result

### Contrast Pattern

- Before: current friction and cost
- After: improved workflow and outcome

## UX & Copy Guidelines

### Landing Page Hierarchy

1. **Hero**: One bold promise + one clarifying sentence + CTA
2. **What**: 3-5 value cards with icons
3. **How**: 3-step process (Connect -> Monitor -> Act)
4. **Integrations**: Logo grid with 1-line descriptions
5. **Features**: 6 cards with specific benefits
6. **Social proof**: Testimonials, logos, or trust signals
7. **CTA**: Repeat primary action

### CTAs

- Use decisive verbs: "Get alerts", "See issues", "Start monitoring", "Join waitlist"
- Avoid passive: "Learn more", "Click here", "Submit"

### Tone

- Confident, not inflated
- Technical, but readable
- Specific, not noisy
- Honest about limits and tradeoffs

## Research Workflow (When Needed)

For positioning and messaging tasks:

1. Audit current copy and artifacts.
2. Map validated capabilities and limits.
3. Analyze market language and competitor framing.
4. Identify differentiation and proof points.
5. Draft positioning and message hierarchy.

## Reference Style Cues (Condensed)

Use these influences as lightweight guidance, not imitation:

- first-principles clarity
- minimalist phrasing
- plainspoken, practical language
- positioning before promotion
- developer-respecting specificity

## Anti-Patterns to Avoid

- Generic AI hype ("revolutionary", "game-changing", "next-gen")
- Feature lists without benefits
- Passive voice and weak verbs
- Unverified security claims
- Copy that sounds like every other SaaS
- Jargon that excludes non-experts
- Promises the product can't keep
