# MCP Connectors Guide

MCP (Model Context Protocol) Connectors extend Solaris's capabilities by connecting the AI to external tools and services. Through MCP, Solaris can control browsers, access databases, interact with APIs, and use hundreds of community-built integrations.

---

## What Is MCP?

The **Model Context Protocol** is an open standard that allows AI systems to connect with external tools and data sources. Each MCP server exposes a set of "tools" that the AI can discover and use during conversations.

### How It Works
1. You configure an MCP server in Solaris Settings
2. Solaris connects to the server and discovers its available tools
3. During conversations, the AI can call these tools to perform actions
4. Results are returned to the AI and incorporated into its response

---

## Managing Connectors

### Accessing the Connectors Panel
1. Click **Settings** (gear icon) in the sidebar
2. Navigate to the **Connectors** tab
3. View all configured MCP servers, their status, and available tools

### Connector Status
Each connector shows:
- **Green dot** — Connected and ready
- **Gray dot** — Disconnected or disabled
- **Tool count** — Number of available tools from this server
- **Type badge** — STDIO or SSE (connection method)

---

## Adding Connectors

### Quick Add from Presets
Solaris includes pre-configured presets for popular MCP servers:

1. In the Connectors tab, expand the **Quick Add Presets** section
2. Browse available presets
3. Click **Add** for servers that don't require configuration
4. Click **Configure** for servers that need API keys or tokens
5. Enter the required credentials and click **Add**

### Adding a Custom Connector

1. Click **Add Custom Connector** at the bottom of the Connectors tab
2. Fill in the server details:

#### STDIO Servers (Most Common)
- **Name**: A descriptive name for the server
- **Type**: Select "STDIO"
- **Command**: The command to run (e.g., `npx`, `node`, `python`)
- **Arguments**: Command arguments (e.g., `-y @modelcontextprotocol/server-filesystem`)
- **Environment Variables**: Any required env vars (e.g., API keys)

#### SSE Servers (Remote)
- **Name**: A descriptive name
- **Type**: Select "SSE"
- **URL**: The server's SSE endpoint URL
- **Headers**: Optional HTTP headers (e.g., authentication tokens)

3. Click **Save** to add the connector

### Windsurf MCP Integration
If you have Windsurf (Codeium) installed, Solaris automatically imports MCP servers from your Windsurf configuration at `~/.codeium/windsurf/mcp_config.json`. These appear as built-in servers.

---

## Enabling & Disabling Connectors

- Toggle the **Enable/Disable** switch on any connector card
- Enabled connectors attempt to connect automatically
- Disabled connectors are saved but inactive
- The AI can only use tools from enabled and connected servers

---

## Popular MCP Connectors

### Browser Automation (Chrome)
Control Chrome for web automation:
- Navigate websites
- Fill forms and click buttons
- Extract data from web pages
- Take screenshots

**Setup**: Requires Chrome running with debug port 9222:
```bash
# Windows
chrome.exe --remote-debugging-port=9222

# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

### File System
Access to local file system operations beyond the project directory.

### GitHub
Interact with GitHub repositories, issues, and pull requests.

### Notion
Create and manage Notion pages and databases.

### Slack
Send messages and interact with Slack channels.

### Database Connectors
Connect to PostgreSQL, MySQL, SQLite, and other databases.

---

## Connector Tools in Conversations

Once a connector is enabled and connected, its tools are automatically available to the AI. You don't need to reference connectors explicitly — just describe what you want:

- *"Search Google for the latest Next.js features"* → Uses Chrome/browser tools
- *"Create a new GitHub issue for this bug"* → Uses GitHub tools
- *"Add this meeting summary to my Notion workspace"* → Uses Notion tools

### Viewing Available Tools
In the Connectors tab, click the **tools** count on any connector card to expand the list of available tools with their descriptions.

---

## Bundled Node.js

Solaris bundles its own Node.js runtime specifically for running MCP servers. This means:
- You don't need Node.js installed on your system
- MCP servers using `npx` work out of the box
- The bundled runtime is isolated from your system Node.js

---

## Troubleshooting

### Connector won't connect
- Verify the command and arguments are correct
- Check that required environment variables are set
- For Chrome: ensure Chrome is running with `--remote-debugging-port=9222`
- Check the Logs tab in Settings for connection errors

### Tools not appearing
- Wait a few seconds after enabling — tool discovery takes a moment
- The tool count auto-refreshes every 3 seconds
- Try disabling and re-enabling the connector

### "Command not found" errors
- For STDIO servers, ensure the command is in your system PATH
- Solaris uses its bundled Node.js for `npx` commands
- For Python-based servers, verify Python is installed

### Server crashes
- Check the server's required dependencies are installed
- Verify API keys and tokens are correct
- Some servers require specific Node.js or Python versions

### Environment variable issues
- Environment variables are passed to the server process
- Sensitive values (API keys) are stored securely
- Changes to env vars require re-enabling the connector

---

**MCP Connectors make Solaris infinitely extensible.** Connect to any tool, service, or API — and the AI will know how to use it.
