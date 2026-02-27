# AI Chat & Tasks Guide

The AI Chat is the central intelligence of Solaris. Every conversation is a "task" — a focused interaction where you and the AI work together to accomplish goals within your project context.

---

## Starting a Conversation

### From the Welcome Screen
1. Open a project directory (required)
2. Type your request in the main text input
3. Press **Enter** or click the arrow button
4. A new conversation session is created with your message as the title

### Using Quick Action Tags
The welcome screen offers pre-built prompts for common tasks:
- **Create File** — Generate new project files
- **Crunch Data** — Analyze and process data
- **Organize Files** — Structure and sort files
- **Check Emails** — Summarize recent emails (requires Chrome connector)
- **Search Papers** — Research academic papers (requires Chrome connector)
- **Summarize Papers to Notion** — Research and save papers to Notion (requires Notion connector)

Click a tag to populate the input with a pre-written prompt. Modify it as needed before sending.

### From the Sidebar
Click **New Task** (sparkle icon) at any time to start a fresh conversation.

---

## The Conversation Interface

### Message Input
- **Multi-line**: Press `Shift+Enter` for new lines, `Enter` to send
- **Auto-resize**: The input area grows as you type (up to 8 lines)
- **Image paste**: Press `Ctrl+V` / `Cmd+V` to paste screenshots or images directly
- **File attach**: Click the paperclip icon to attach project files
- **Drag & drop**: Drop images directly onto the input area

### Image Support
- Images are automatically resized if they exceed the 5MB API limit
- Multiple images can be attached to a single message
- Remove images by clicking the X button on the thumbnail
- Supported formats: PNG, JPEG, GIF, WebP, and more

### File Attachments
- Attach any file from your filesystem
- Files appear as chips below the input
- The AI can read and analyze attached file contents

---

## Understanding AI Responses

### Streaming Responses
- Responses stream in real-time as the AI generates them
- The chat auto-scrolls to keep the latest content visible
- If you scroll up to read older messages, auto-scroll pauses

### Response Content
Solaris AI can produce:
- **Text** with full Markdown formatting (headings, lists, code blocks, tables)
- **Code blocks** with syntax highlighting
- **Math formulas** rendered with KaTeX
- **Tool calls** — actions the AI takes on your behalf (file operations, browser automation, etc.)
- **Creative content** — images, documents, and other generated assets

### Tool Usage & Permissions
The AI can use various tools to help you:
- **File operations** — Read, create, edit, and manage project files
- **Browser automation** — Navigate websites, fill forms, extract data (requires Chrome connector)
- **Code execution** — Run code in a sandboxed environment
- **MCP tools** — Use any connected MCP server tools

Some actions require your explicit approval via the **Permission Dialog** that appears when the AI requests to perform potentially sensitive operations.

---

## Managing Conversations

### Conversation List
The sidebar organizes your conversations into three sections:
- **Recent (3)** — Your three most recent conversations across all projects
- **Project** — Conversations belonging to the currently open project
- **Other Projects** — Conversations from different project directories

### Switching Conversations
- Click any conversation in the sidebar to switch to it
- If the conversation belongs to a different project, Solaris will ask if you want to switch projects
- Messages are loaded from persistent storage when you switch

### Status Indicators
Each conversation shows a colored dot:
- **Blue (pulsing)** — AI is currently processing
- **Green** — Completed successfully
- **Red** — Encountered an error
- **Gray** — Idle/inactive

### Deleting Conversations
- Hover over a conversation and click the trash icon to delete it
- Use "Delete All Messages" at the bottom of the sidebar to clear everything
- Deletion is permanent — there is no undo

---

## Session Context

### Project-Aware AI
Every conversation is tied to your current project directory. The AI has access to:
- Your project's file structure
- File contents (when referenced or needed)
- Previous messages in the current conversation
- Your configured credentials and connected tools

### Cross-Session Context
- Each conversation maintains its own independent context
- Switching between conversations preserves each conversation's state
- The AI does not automatically share context between different conversations

---

## Advanced Features

### Continuation & Stopping
- **Stop** a running AI response by clicking the stop button (square icon)
- If the AI's response is cut off, it can be continued in the next message
- Pending messages queue up and execute sequentially

### Multi-Turn Workflows
Solaris excels at multi-step tasks:
1. Start with a high-level request
2. The AI breaks it down and executes step by step
3. Provide feedback or corrections at any point
4. The AI adapts and continues

### Working with the Context Panel
When a project is open, the Context Panel on the right provides:
- Project file tree
- Active file context
- Relevant project information

---

## Tips for Effective Conversations

- **Be specific**: "Create a React component for a user profile card with avatar, name, and bio" works better than "make a component"
- **Provide context**: Reference specific files, technologies, or constraints
- **Iterate**: Build on the AI's responses with follow-up requests
- **Use skills**: Ask the AI about available skills for specialized tasks
- **Attach references**: Paste screenshots or attach files for the AI to analyze

---

## Troubleshooting

### AI not responding
- Check your API key configuration in Settings
- Verify your internet connection
- Check the Logs tab in Settings for error details

### Slow responses
- Try a faster/smaller AI model
- Check your API provider's rate limits and quotas
- Large project contexts may slow down initial responses

### Messages not persisting
- Ensure you have a project directory open
- Check that the `.solaris/` directory is writable
- Restart the app if messages seem lost

---

**The AI Chat is your command center.** Start a conversation, describe what you need, and let Solaris handle the rest.
