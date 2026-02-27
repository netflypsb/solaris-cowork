# Core components of Solaris

## Overview 

Solaris is an Agent 3.0, a 'Coworker' Agent. Agent 3.0 'Coworker' Agents are AI Agents that go beyond the Agent 2.0 'DeepAgents' that was introduced by the langchain team in mid-2025. 

Agent 1.0 'AI Agents' were simple chatbots that had access to tools. 

Agent 2.0 'DeepAgents' as defined by the langchain team are AI agents that can 'Work on Complex Long Horizon tasks without losing context. They achieve this by having access to 1. Planning tool, 2. File System access, 3. Persistent Memory, 4. Subagents for context offloading, 5. Detailed system prompts and extensive context engineering. 

Agent 3.0 'Coworker' Agents takes DeepAgent several steps further with: 1. Near infinite context, 2. Autonomous task completion and 3. Higher accuracy.

## Core Components
Agent 3.0 'Coworker' Agents are able to perform as they do by having 12 core components:

1. RSAU (Reason-Search-Act-Update) loop for near infinite context

2. Ralph loop for task completion

3. Hierarchical planning with quality checks for breaking down problems into actionable plan, documented in a structured, persistent plan file.

4. persistent file system for memory and for 'file system as infinite context'

5. file system access tools for enabling it to access file system to implement RSAU loop and Ralph loop

6. State management via persistent state, checkpointing, continue from checkpoint for resumption of workflow with a fresh context to avoid context bloat, context rot and to reduce dependence on context length of AI models (use file system for agentic context engineering).

7. Custom checkpointing practice that stops an agent run and calls a new, fresh agent instance with fresh context + state (for context) + instructions to use file system for agentic context engineering + plan file. This avoids context rot and maintains continuity.

8. coding environment, secure sandbox for writing and executing code for data analysis, data extraction, information search, problem solving via code.

9. Browser use and automation capabilities for internet access, research, use of web tools for solving problems. 

10. System prompt. Focused system prompt to avoid context polution. Use of tool-search-tool and skills to reduce context bloat and pollution.

11. tool-search-tool for enhanced tool discovery and usage.

12. Agent Skills for specialized task execution and domain expertise.