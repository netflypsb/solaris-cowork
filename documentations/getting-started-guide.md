# Getting Started with Solaris

Welcome to Solaris — your AI-powered coworker that replaces dozens of separate tools with one unified intelligent workspace. This guide walks you through installation, first launch, and your first productive session.

---

## System Requirements

- **Operating System**: Windows 10/11 (64-bit) or macOS 12+
- **RAM**: 8 GB minimum, 16 GB recommended
- **Storage**: 500 MB for the app, plus space for project files
- **Internet**: Required for AI model API access
- **API Key**: You need an API key from one of the supported providers (OpenRouter, Anthropic, OpenAI, xAI, or a custom endpoint)

---

## Installation

### Windows
1. Download the Solaris installer (`.exe`) from the [Downloads](/download) page
2. Run the installer and follow the on-screen prompts
3. Solaris will be installed and a desktop shortcut will be created
4. Launch Solaris from the desktop shortcut or Start Menu

### macOS
1. Download the Solaris disk image (`.dmg`) from the [Downloads](/download) page
2. Open the `.dmg` file and drag Solaris into your Applications folder
3. Launch Solaris from Applications or Spotlight

---

## First Launch — Quick Setup

### Step 1: Configure Your AI Provider

On first launch, Solaris will prompt you to configure an AI provider. This is required for all AI-powered features.

1. Click the **Settings** button (gear icon) at the bottom of the sidebar, or the configuration prompt that appears
2. In the **API Settings** tab, choose your provider:
   - **OpenRouter** — Access to hundreds of models from multiple providers (recommended for beginners)
   - **Anthropic** — Direct access to Claude models
   - **OpenAI** — Access to GPT models
   - **xAI** — Access to Grok models
   - **Custom** — Connect to any OpenAI-compatible or Anthropic-compatible endpoint
3. Enter your **API Key** for the chosen provider
4. Select a **Model** from the dropdown (models are fetched automatically when your API key is valid)
5. Click **Test Connection** to verify everything works
6. Click **Save Settings**

> **Tip**: OpenRouter is recommended for new users as it provides access to the widest range of models with a single API key. Get your key at [openrouter.ai](https://openrouter.ai).

### Step 2: Open a Project

Solaris is project-based — all your work is organized within project directories.

1. Click **Open Project** in the sidebar (folder icon)
2. Select an existing project folder, or create a new empty folder for a new project
3. The project name appears below the Open Project button
4. All conversations, tasks, wiki pages, and creative works are stored within your project's `.solaris/` directory

> **Important**: You must have a project open before you can start conversations or use any hub features. All actions are sandboxed to the active project.

### Step 3: Start Your First Conversation

1. Click **New Task** in the sidebar (sparkle icon)
2. Type your request in the text area — for example: *"Help me plan a website for my portfolio"*
3. Press **Enter** or click the arrow button to send
4. Solaris will respond with an intelligent, context-aware answer

You can also use the **Quick Action Tags** on the welcome screen for common tasks:
- **Create File** — Generate new files for your project
- **Crunch Data** — Analyze and process data
- **Organize Files** — Sort and structure your project files
- **Check Emails** — Summarize recent emails (requires Chrome connector)
- **Search Papers** — Find and summarize research papers (requires Chrome connector)

---

## Understanding the Interface

### Sidebar
The sidebar is your navigation hub:
- **App Title & Theme Toggle** — Switch between dark and light modes
- **Open Project** — Select your working directory
- **New Task** — Start a fresh conversation
- **Hubs** — Expand to access Learning Hub, Creative Hub, Project Board, Knowledge Base, and Visual Editor
- **Conversations** — Your recent, project, and other-project conversations
- **Settings** — Configure API, sandbox, credentials, connectors, skills, and more

### Main Content Area
- Shows your active conversation, hub, or the welcome screen
- Auto-switches based on what you select in the sidebar

### Context Panel
- Appears on the right when a project is open
- Shows project context, file tree, and relevant information

---

## Core Workflows

### Chat with AI
The primary way to interact with Solaris. Ask questions, request code, analyze data, or get help with any task. Solaris has access to your project files and can read, create, and modify them with your permission.

### Use the Hubs
Expand the **Hubs** section in the sidebar to access:
- **Learning Hub** — Structured AI-generated learning experiences
- **Creative Hub** — AI-generated visual content and creative assets
- **Project Board** — Kanban-style task management
- **Knowledge Base** — Wiki-style documentation with bidirectional links
- **Visual Editor** — Canvas-based design tool

> Only one hub can be active at a time. Opening a new hub closes the current one.

### Attach Files & Images
- **Paste images** directly into the chat input (Ctrl+V / Cmd+V)
- **Drag & drop** images onto the input area
- **Attach files** using the paperclip button (Electron only)

---

## What's Next?

- **[AI Chat & Tasks Guide](./chat-tasks-guide.md)** — Master the conversation system
- **[Skills Guide](./skills-guide.md)** — Learn about AI skills and capabilities
- **[MCP Connectors Guide](./mcp-connectors-guide.md)** — Connect to external tools
- **[Settings & Configuration Guide](./settings-guide.md)** — Deep dive into all settings
- **[Project Management Guide](./user-guide.md)** — Use the Project Board, Wiki, and Visual Editor
- **[Learning & Creative Hubs Guide](./learning-creative-hubs-guide.md)** — Explore AI-powered learning and creation
- **[Unified Platform Guide](./unified-platform-guide.md)** — Understand how everything works together

---

## Troubleshooting First Launch

### "API not configured" indicator
- Go to Settings → API Settings and enter a valid API key
- Click Test Connection to verify

### Can't start a conversation
- Make sure you have a project directory open (green folder icon in sidebar)
- Check that your API key is configured and valid

### App won't launch
- **Windows**: Try running as Administrator
- **macOS**: Check System Preferences → Security & Privacy if the app is blocked

### Slow responses
- Check your internet connection
- Try a different/faster AI model
- Verify your API key has sufficient credits/quota

---

**Ready to go?** Open a project, start a conversation, and let Solaris be your AI coworker!
