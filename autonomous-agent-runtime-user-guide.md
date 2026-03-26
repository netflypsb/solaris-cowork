# Solaris Phase 2: Autonomous Agent Runtime — Complete User Guide

> **Version**: 2.0.0  
> **Date**: March 2026  
> **Target Audience**: All Solaris users wanting to automate tasks, schedule workflows, and run proactive AI agents

---

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Task Scheduler](#task-scheduler)
   - [Creating Scheduled Tasks](#creating-scheduled-tasks)
   - [Natural Language Scheduling](#natural-language-scheduling)
   - [Managing Tasks](#managing-tasks)
   - [Viewing Execution History](#viewing-execution-history)
4. [Event Triggers](#event-triggers)
   - [Trigger Types](#trigger-types)
   - [Creating Triggers](#creating-triggers)
   - [Webhook Configuration](#webhook-configuration)
   - [File Watching](#file-watching)
5. [Agent Planner](#agent-planner)
   - [Creating Plans](#creating-plans)
   - [Plan Execution Controls](#plan-execution-controls)
   - [Monitoring Progress](#monitoring-progress)
6. [Multi-Agent Orchestration](#multi-agent-orchestration)
   - [Creating Orchestrations](#creating-orchestrations)
   - [Sub-Agent Coordination](#sub-agent-coordination)
   - [Result Synthesis](#result-synthesis)
7. [Integration Examples](#integration-examples)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

Phase 2 transforms Solaris from a **reactive assistant** (responds when asked) into a **proactive autonomous agent** that:

- **Monitors** conditions and events
- **Plans** multi-step tasks with explicit reasoning
- **Executes** on schedules or triggers
- **Coordinates** multiple sub-agents in parallel
- **Notifies** you through any configured channel

### Core Components

```
┌─────────────────────────────────────────┐
│         Autonomous Agent Runtime         │
│                                          │
│  ┌─────────────┐   ┌─────────────────┐  │
│  │  Scheduler  │   │ Event Triggers  │  │
│  │  (Cron)     │   │ (Webhooks/Files)│  │
│  └──────┬──────┘   └────────┬────────┘  │
│         │                   │            │
│         ▼                   ▼            │
│  ┌─────────────────────────────────────┐ │
│  │         Agent Planner                │ │
│  │  (Multi-step plans with reasoning) │ │
│  └──────────────┬─────────────────────┘ │
│                  │                       │
│         ┌────────▼────────┐             │
│         │  Orchestrator   │             │
│         │ (Parallel agents)│             │
│         └────────┬────────┘             │
│                  │                       │
│         ┌────────▼────────┐             │
│         │  Notification   │             │
│         │    Hub          │             │
│         └─────────────────┘             │
└─────────────────────────────────────────┘
```

---

## Quick Start

### Accessing Phase 2 Features

All Phase 2 features are available in **Settings → Autonomous Agent Runtime** with four tabs:

| Tab | Icon | Purpose |
|-----|------|---------|
| **Scheduled Tasks** | ⏰ Calendar | Time-based automation |
| **Event Triggers** | ⚡ Zap | React to events (files, webhooks, etc.) |
| **Agent Planner** | ☑️ ListChecks | Multi-step plans with progress tracking |
| **Orchestration** | 🔗 Network | Parallel sub-agent coordination |

### Your First Scheduled Task (2 minutes)

1. Open **Settings → Autonomous Agent Runtime → Scheduled Tasks**
2. Click **"New Task"**
3. Enter:
   - **Name**: "Daily Morning Briefing"
   - **Schedule**: Type "every day at 8am" (natural language)
   - **Prompt**: "Summarize my calendar for today and check for any urgent emails"
4. Click **Create**
5. The task will now run automatically every morning at 8am

---

## Task Scheduler

The Task Scheduler runs AI tasks on a recurring schedule using cron expressions or natural language.

### Creating Scheduled Tasks

**Required Fields:**

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Descriptive task name | "Weekly Report Generation" |
| **Schedule** | When to run (cron or natural language) | "every Friday at 5pm" |
| **Agent Prompt** | What the AI should do | "Generate a summary of all tasks completed this week" |
| **Channels** | Where to send results (optional) | Telegram, Discord, etc. |

**Optional Fields:**

| Field | Default | Description |
|-------|---------|-------------|
| Max Retries | 3 | Retry attempts on failure |
| Timeout | 300000ms (5 min) | Maximum execution time |
| Description | "" | Additional context about the task |

### Natural Language Scheduling

Instead of writing cron expressions, use plain English:

| Natural Language | Cron Equivalent | Description |
|------------------|-----------------|-------------|
| "every day at 8am" | `0 8 * * *` | Daily at 8:00 AM |
| "every Monday at 9am" | `0 9 * * 1` | Weekly on Mondays |
| "every 30 minutes" | `*/30 * * * *` | Every half hour |
| "every hour" | `0 * * * *` | On the hour |
| "every Friday at 5pm" | `0 17 * * 5` | Weekly Friday evening |
| "at 2pm on weekdays" | `0 14 * * 1-5` | Business afternoons |

**Testing Natural Language:**

Use the **Schedule Parser** tool in the Scheduled Tasks tab to test your expressions before creating tasks.

### Managing Tasks

**Enable/Disable:** Toggle the switch next to any task to pause/resume scheduling.

**Run Now:** Click the play button (▶) to manually trigger a task immediately.

**Edit:** Click the pencil icon (✏️) to modify task settings.

**Delete:** Click the trash icon (🗑️) to remove a task permanently.

**Task States:**

| Status | Icon | Meaning |
|--------|------|---------|
| Enabled | 🟢 | Task is active and will run on schedule |
| Disabled | ⚪ | Task is paused, won't run automatically |
| Running | 🔄 | Task is currently executing |
| Failed | 🔴 | Last execution failed |

### Viewing Execution History

Each task shows:
- **Last Run**: When the task last executed
- **Next Run**: When the task will execute next
- **Run Count**: Total number of executions
- **Execution Log**: Click any task to see detailed history

**Execution Status:**
- ✅ **Completed**: Task finished successfully
- 🔴 **Failed**: Task encountered an error
- ⏱️ **Timeout**: Task exceeded time limit
- 🔄 **Running**: Task is currently executing

### Scheduler Statistics

The stats panel shows:
- **Active Tasks**: Currently enabled tasks
- **Successful Runs**: Completed executions (last 24h)
- **Failed Runs**: Failed executions (last 24h)

---

## Event Triggers

Event Triggers react to external events like file changes, webhooks, or system events.

### Trigger Types

| Source | Description | Use Case |
|--------|-------------|----------|
| **File Change** | Monitor files/folders | Auto-process new invoices in Downloads |
| **Webhook** | HTTP endpoint trigger | GitHub push notifications |
| **Channel Message** | Telegram/Discord events | Welcome new group members |
| **System** | CPU, memory, disk events | Alert when CPU > 90% |
| **Schedule** | Time-based (like Scheduler) | Complementary to main scheduler |
| **Custom** | Application-specific | Integrate with external tools |

### Creating Triggers

**Required Fields:**

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Descriptive trigger name | "Invoice Processor" |
| **Source** | Event type | File Change |
| **Condition** | When to fire | Path pattern or condition |
| **Agent Prompt** | What to do when triggered | "Extract invoice data and update spreadsheet" |
| **Cooldown** | Minimum time between triggers | 60000ms (1 minute) |

**Cooldown Protection:**

Set a cooldown (in milliseconds) to prevent triggers from firing too rapidly:
- **1 minute**: `60000` — Good for file watching
- **5 minutes**: `300000` — Good for webhooks
- **1 hour**: `3600000` — Good for system events

### Webhook Configuration

For webhook triggers, Solaris provides an HTTP endpoint:

```
POST http://localhost:3000/webhook/{trigger-id}
```

**Example Payload:**
```json
{
  "event": "deployment",
  "status": "success",
  "project": "my-app",
  "timestamp": "2026-03-26T10:00:00Z"
}
```

The payload is passed to the agent prompt as context.

**Security:**
- Webhooks run on localhost by default
- For production, configure a reverse proxy (nginx, Caddy)
- Use the optional `secret` field to verify webhook authenticity

### File Watching

File triggers monitor directories for changes:

**Configuration:**
- **Paths**: Directories to watch (e.g., `/home/user/Downloads/invoices`)
- **Patterns**: File patterns (e.g., `*.pdf`, `invoice_*.csv`)
- **Recursive**: Watch subdirectories
- **Ignore Patterns**: Exclude patterns (e.g., `*.tmp`, `.git`)

**Example Setup:**
```
Path: /Users/me/Downloads/invoices
Pattern: *.pdf
Recursive: Yes
Ignore: *.tmp, .DS_Store
```

### Managing Triggers

**Enable/Disable:** Toggle triggers on/off without deleting them.

**Fire Manually:** Use the "Test Trigger" button to simulate an event.

**View Events:** Click any trigger to see recent events and their status.

---

## Agent Planner

The Agent Planner creates explicit, step-by-step plans for complex tasks with full progress visibility.

### Creating Plans

**Simple Plan (AI generates steps):**
1. Enter a **Goal** (e.g., "Research competitor pricing")
2. Leave steps empty — AI will plan automatically
3. Click **Create Plan**
4. AI generates steps, then begins execution

**Detailed Plan (You specify steps):**
1. Enter a **Goal**
2. Click **Add Step** for each sub-task:
   - Step 1: "Search web for Acme Corp pricing"
   - Step 2: "Search web for Beta Inc pricing"
   - Step 3: "Compare and create summary table"
3. Click **Create Plan**
4. AI executes steps in sequence

**Optional Settings:**

| Setting | Default | Description |
|---------|---------|-------------|
| Reasoning | Enabled | Show AI's thought process |
| Timeout per Step | 5 minutes | Maximum time per step |
| Tools | All | Limit which tools the agent can use |

### Plan Execution Controls

During execution, you can:

| Control | Action | When to Use |
|---------|--------|-------------|
| ⏸️ **Pause** | Stop at current step | Need to review before continuing |
| ▶️ **Resume** | Continue execution | Ready to proceed |
| ⏹️ **Cancel** | Abort entire plan | Plan is no longer needed |
| ⏭️ **Skip Step** | Skip current step | Step is unnecessary or stuck |

### Monitoring Progress

The Planner UI shows:

**Progress Bar:**
```
Research Competitor Pricing
[████████░░░░░░░░░░░░] 40% (2/5 steps)
```

**Step Status Icons:**

| Icon | Status | Meaning |
|------|--------|---------|
| ⏳ | Pending | Waiting to execute |
| 🔄 | In Progress | Currently executing |
| ✅ | Completed | Finished successfully |
| ❌ | Failed | Encountered an error |
| ⏭️ | Skipped | Manually skipped |

**Step Details:**
Click any step to see:
- Start and end times
- Duration
- Result/output
- Error message (if failed)
- Tools used

### Plan States

| Status | Description | Actions Available |
|--------|-------------|-------------------|
| **Planning** | AI is generating steps | Cancel |
| **Executing** | Running steps | Pause, Cancel |
| **Paused** | Stopped mid-execution | Resume, Cancel, Skip Step |
| **Completed** | All steps done | Delete, Clone |
| **Failed** | Step failed | Retry, Cancel, Skip Step |
| **Cancelled** | Aborted by user | Delete, Clone |

---

## Multi-Agent Orchestration

Orchestration spawns multiple sub-agents that work in parallel, then synthesizes their results.

### Creating Orchestrations

**Example: Meeting Preparation**

1. **Goal**: "Prepare for Acme Corp meeting"
2. **Sub-Agents** (parallel tasks):
   - Agent 1: "Search email for recent Acme correspondence"
   - Agent 2: "Research latest Acme news and funding"
   - Agent 3: "Check calendar for meeting details"
3. **Max Concurrent**: 3 (run all at once)
4. Click **Create** — execution starts automatically

**Configuration Fields:**

| Field | Description | Example |
|-------|-------------|---------|
| **Goal** | Overall objective | "Analyze Q1 sales data" |
| **Tasks** | Sub-agent descriptions | Array of parallel tasks |
| **Max Concurrent** | Simultaneous agents | 3 (limits resource usage) |
| **Timeout** | Per-agent timeout | 5 minutes |

### Sub-Agent Coordination

Each sub-agent:
- Runs independently with isolated context
- Has access to specified tools only
- Reports progress separately
- Can fail independently without affecting others

**Task Specification:**

```typescript
{
  description: "Research competitor pricing",
  tools: ["web_search", "browser_navigate"],
  model: "claude-3-opus",  // Optional: different model per task
  timeout_ms: 300000,
  max_steps: 10,
  context: "Focus on enterprise pricing tiers",
  priority: 1  // Higher = runs first if limited concurrency
}
```

### Result Synthesis

After all sub-agents complete, the **Lead Agent** synthesizes results:

1. **Collects** outputs from all sub-agents
2. **Analyzes** for conflicts or gaps
3. **Combines** into coherent response
4. **Notifies** through configured channels

**Example Synthesis:**
```
Meeting Prep for Acme Corp:

📧 Email Summary (Agent 1):
   - Last contact: March 20
   - Outstanding proposal pending

📰 News Research (Agent 2):
   - Announced $10M Series B yesterday
   - New CTO hired this month

📅 Meeting Details (Agent 3):
   - Tomorrow 2pm, 5 attendees
   - Agenda: Pricing discussion

🎯 Recommended Focus:
   Address their new funding in context of our proposal
```

### Orchestration States

| Status | Description |
|--------|-------------|
| **Planning** | Setting up sub-agents |
| **Running** | Sub-agents executing in parallel |
| **Synthesizing** | Lead agent combining results |
| **Completed** | All done, results ready |
| **Failed** | One or more agents failed |
| **Cancelled** | Stopped by user |

### Monitoring Orchestrations

The UI shows:
- **Progress**: Overall completion percentage
- **Individual Agents**: Status of each sub-agent with duration
- **Live Updates**: Real-time status changes
- **Final Result**: Synthesized output when complete

---

## Integration Examples

### Example 1: Daily Intelligence Briefing

**Goal**: Receive a daily summary of relevant news, emails, and tasks.

**Setup:**
1. **Scheduled Task**: "Daily at 8am"
2. **Orchestration** with 3 sub-agents:
   - Agent 1: "Search news for AI industry updates"
   - Agent 2: "Summarize unread emails from priority contacts"
   - Agent 3: "List overdue tasks from project management"
3. **Notification**: Send to Telegram

### Example 2: Automated Invoice Processing

**Goal**: Process new invoices automatically.

**Setup:**
1. **Event Trigger**: File Change
   - Watch: `/Downloads/invoices/`
   - Pattern: `*.pdf`
2. **Agent Planner**:
   - Step 1: Extract invoice data (vendor, amount, date)
   - Step 2: Validate against purchase orders
   - Step 3: Update accounting spreadsheet
   - Step 4: Send confirmation email

### Example 3: CI/CD Pipeline Notifications

**Goal**: Monitor deployments and notify on status.

**Setup:**
1. **Event Trigger**: Webhook
   - Endpoint: `/webhook/deployments`
2. **Condition**: `event.status === 'failed'`
3. **Agent Prompt**: "Analyze deployment logs, identify root cause, suggest fix"
4. **Channel**: Alert to Slack #alerts channel

### Example 4: Competitor Monitoring

**Goal**: Track competitor website changes.

**Setup:**
1. **Scheduled Task**: "Every day at 9am"
2. **Orchestration**:
   - Agent 1: Check Competitor A pricing page
   - Agent 2: Check Competitor B pricing page
   - Agent 3: Check Competitor C pricing page
3. **Synthesis**: Compare prices, detect changes
4. **Condition**: Only notify if prices changed

---

## Best Practices

### Scheduling Best Practices

1. **Stagger Heavy Tasks**
   - Don't schedule all tasks at the same minute
   - Spread across the hour: `:05`, `:15`, `:30`, `:45`

2. **Use Natural Language**
   - "every weekday at 9am" is clearer than `0 9 * * 1-5`
   - Test with the Schedule Parser first

3. **Set Appropriate Timeouts**
   - Simple tasks: 1-2 minutes
   - Research tasks: 5-10 minutes
   - Complex analysis: 15-30 minutes

4. **Configure Retries**
   - Default 3 retries is good for most tasks
   - Reduce to 1 for time-sensitive operations
   - Increase to 5 for unreliable external APIs

### Event Trigger Best Practices

1. **Always Set Cooldowns**
   - Prevents spam from rapid file changes
   - 1-5 minutes is usually appropriate

2. **Use Specific Patterns**
   - `invoice_*.pdf` better than `*.pdf`
   - Reduces false triggers

3. **Test Webhooks**
   - Use "Test Trigger" button before going live
   - Verify payload structure

4. **Monitor Event Volume**
   - Check trigger stats regularly
   - High volume may indicate misconfiguration

### Planner Best Practices

1. **Let AI Plan When Uncertain**
   - Provide goal, let AI generate steps
   - Review and modify before execution

2. **Break Complex Tasks**
   - 5-10 steps is ideal
   - More than 15 steps may need splitting

3. **Use Reasoning Visibility**
   - Enable reasoning for debugging
   - Disable for production speed

4. **Pause to Review**
   - Use pause/resume for critical plans
   - Verify intermediate results

### Orchestration Best Practices

1. **Limit Concurrency**
   - Match to your API rate limits
   - 3-5 concurrent is usually optimal
   - More isn't always faster (diminishing returns)

2. **Isolate Tool Access**
   - Give sub-agents only needed tools
   - Reduces errors and costs

3. **Set Different Models**
   - Use fast/cheap models for simple tasks
   - Use powerful models for synthesis

4. **Handle Partial Failures**
   - Design workflows that work with partial results
   - Not all sub-agents need to succeed

---

## Troubleshooting

### Scheduled Tasks Not Running

**Symptoms:** Task shows "Next Run" in the past

**Solutions:**
1. Check if task is **enabled** (toggle switch)
2. Verify the schedule expression using Schedule Parser
3. Check **Settings → Autonomous Agent Runtime** is active
4. Restart Solaris if scheduler appears stuck
5. Check execution log for previous failures

### Event Triggers Not Firing

**Symptoms:** Events occur but no agent execution

**Solutions:**
1. Verify trigger is **enabled**
2. Check **Cooldown** hasn't suppressed the event
3. For file triggers: Verify path exists and is accessible
4. For webhooks: Test with "Test Trigger" button
5. Check payload matches expected format

### Plans Stuck or Failing

**Symptoms:** Plan shows "In Progress" for long time or fails

**Solutions:**
1. Check step timeout — may need to increase
2. Review failed step details for error messages
3. Try **Skip Step** if one step is problematic
4. Use **Cancel** and recreate with modified steps
5. Check if required tools are available

### Orchestrations Timing Out

**Symptoms:** Sub-agents show timeout status

**Solutions:**
1. Increase **Timeout** setting (default 5 min may be too short)
2. Reduce **Max Concurrent** to prevent resource exhaustion
3. Split into smaller, faster tasks
4. Check if external APIs are responding slowly

### High Resource Usage

**Symptoms:** System slow, many concurrent AI requests

**Solutions:**
1. Reduce **Max Concurrent** in orchestrations
2. Stagger scheduled task times
3. Disable unnecessary triggers
4. Check for runaway triggers (rapid firing)
5. Review and cancel stuck plans

### Notification Not Received

**Symptoms:** Task/plan completes but no message received

**Solutions:**
1. Verify channels are configured in Settings
2. Check channel is connected (Telegram/Discord bot running)
3. Ensure channel is selected in task/plan settings
4. Check notification logs for errors

---

## Command Reference (Channel Integration)

When messaging channels are configured, you can manage Phase 2 features via chat:

### Scheduler Commands

| Command | Description |
|---------|-------------|
| `/schedule "every day at 9am" check my email` | Create scheduled task |
| `/schedules` | List your scheduled tasks |
| `/unschedule <id>` | Delete a scheduled task |
| `/runnow <id>` | Manually trigger a task |

### Planner Commands

| Command | Description |
|---------|-------------|
| `/plan "Research competitors"` | Create a new plan |
| `/plans` | List active plans |
| `/pause <plan-id>` | Pause plan execution |
| `/resume <plan-id>` | Resume plan execution |
| `/cancel <plan-id>` | Cancel plan |

### Orchestration Commands

| Command | Description |
|---------|-------------|
| `/orchestrate "Analyze Q1 data"` | Create orchestration |
| `/orchestrations` | List orchestrations |
| `/status <id>` | Check orchestration status |

---

## Glossary

| Term | Definition |
|------|------------|
| **Scheduled Task** | Time-based automated AI execution |
| **Event Trigger** | Condition-based automated execution |
| **Plan** | Multi-step task with explicit steps |
| **Orchestration** | Parallel sub-agent coordination |
| **Sub-Agent** | Individual agent in an orchestration |
| **Cooldown** | Minimum time between trigger firings |
| **Cron Expression** | Time specification format (e.g., `0 9 * * 1`) |
| **Synthesis** | Combining sub-agent results into coherent output |
| **Reasoning** | AI's explicit thought process shown during execution |

---

## Support & Feedback

For issues, feature requests, or questions:
- Check **Settings → Logs** for error details
- Review this guide's Troubleshooting section
- File issues in the Solaris repository

---

*End of Guide — Happy Automating! 🤖*
