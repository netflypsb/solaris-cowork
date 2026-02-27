# Settings & Configuration Guide

Solaris's Settings panel provides complete control over your AI provider, sandbox environment, credentials, connectors, skills, automation, and language preferences.

---

## Accessing Settings

Click the **Settings** button at the bottom of the sidebar (gear icon or your user avatar) to open the Settings panel. The panel has a sidebar with the following tabs:

- **API Settings** — Configure your AI provider and model
- **Sandbox** — Manage the secure code execution environment
- **Credentials** — Store login credentials for AI-assisted web tasks
- **Connectors** — Manage MCP server connections
- **Skills** — Enable/disable AI skill modules
- **Ralph Loop** — Configure the automated completion loop
- **Logs** — View application logs and debug information
- **Language** — Change the interface language

---

## API Settings

This is where you configure which AI model powers Solaris.

### Supported Providers

| Provider | Description | Best For |
|----------|-------------|----------|
| **OpenRouter** | Gateway to 100+ models from multiple providers | Widest model selection, flexibility |
| **Anthropic** | Direct access to Claude models | Best reasoning, coding, and analysis |
| **OpenAI** | Access to GPT models | General purpose, GPT ecosystem |
| **xAI** | Access to Grok models | Alternative reasoning approaches |
| **Custom** | Any OpenAI-compatible or Anthropic-compatible API | Self-hosted models, specialized endpoints |

### Configuration Steps

1. **Select Provider** — Click your preferred provider button
2. **Enter API Key** — Paste your API key for the selected provider
3. **Choose Model** — Select from the dropdown (models are fetched automatically) or enter a custom model ID
4. **Test Connection** — Click to verify your key and model work
5. **Save Settings** — Persist your configuration

### Per-Provider API Keys
Solaris stores API keys per provider. When you switch providers, your previously saved key for that provider is restored. This lets you easily switch between providers without re-entering keys.

### Dynamic Model Fetching
For OpenRouter, Anthropic, OpenAI, and xAI, Solaris fetches the latest available models from the provider's API. Click the refresh icon next to the model dropdown to update the list.

### Custom Model ID
Toggle "Custom" next to the model selector to enter any model ID manually. This is useful for:
- Newly released models not yet in the dropdown
- Fine-tuned models
- Models from custom endpoints

### Image Generation Model
When an OpenRouter API key is available, you can select a dedicated **Image Generation Model**. This is used for AI image generation tasks (brochures, ads, infographics, etc.). Options include models from Google Gemini, FLUX, Riverflow, SeedReam, and OpenAI.

### Live Test
Enable the **"Send a live test request"** checkbox before testing to send an actual API request (uses a small amount of credits) rather than just validating the key format.

---

## Sandbox

The sandbox provides a secure, isolated environment for code execution. The AI can write and run Python and Node.js code without affecting your main system.

### Sandbox Modes

| Mode | Description | Platform |
|------|-------------|----------|
| **Local (WSL)** | Uses Windows Subsystem for Linux | Windows |
| **Local (Lima)** | Uses Lima virtual machine | macOS |
| **E2B Cloud** | Uses E2B cloud sandbox | Any |
| **Disabled** | No code execution | Any |

### Local Sandbox Setup (Windows — WSL)
- Requires WSL2 installed with a Linux distribution
- Solaris auto-detects WSL availability
- Shows status of: WSL, Node.js, Python, pip, and Claude Code availability
- One-click install buttons for missing dependencies

### Local Sandbox Setup (macOS — Lima)
- Uses Lima lightweight virtual machines
- Solaris manages the Lima instance automatically
- Similar dependency checking and installation

### E2B Cloud Sandbox
- Requires an E2B API key (get one at [e2b.dev](https://e2b.dev))
- Code executes in the cloud — no local setup needed
- Enter your E2B API key and save

### Sandbox Status
The sandbox tab shows real-time status:
- Platform detection (Windows/macOS)
- Sandbox initialization state
- Available runtimes (Node.js, Python)
- Package managers (npm, pip)
- Claude Code availability

---

## Credentials

Store login credentials securely for services that the AI can access on your behalf (e.g., email accounts, websites).

### Adding Credentials
1. Click **Add Credential**
2. Fill in the form:
   - **Name** — Descriptive label (e.g., "Work Gmail")
   - **Type** — Email, Website, API, or Other
   - **Service** — Select from presets (Gmail, Outlook, GitHub, AWS, etc.) or choose "Other"
   - **Username** — Your login username/email
   - **Password** — Your login password (stored securely)
   - **Login URL** — The website URL for automated login
   - **Notes** — Any additional information

### Credential Security
- Passwords are stored in the local Electron store
- Credentials are only used when the AI requests access (with your permission)
- The AI references credentials by name in its tool calls
- You can view/edit/delete credentials at any time

### Use Cases
- **Email checking**: Store Gmail/Outlook credentials for the "Check Emails" quick action
- **Website login**: Store credentials for services the AI needs to access
- **API access**: Store API keys for services used in browser automation

---

## Connectors (MCP)

Manage Model Context Protocol server connections. See the dedicated [MCP Connectors Guide](./mcp-connectors-guide.md) for full details.

Key points:
- Add servers from presets or configure custom ones
- Toggle servers on/off
- View connected status and available tools
- Auto-imports Windsurf MCP configuration if available

---

## Skills

Manage AI skill modules. See the dedicated [Skills Guide](./skills-guide.md) and [Custom Skills Guide](./custom-skills-guide.md) for full details.

Key points:
- Toggle individual skills on/off
- Skills are organized by category (Built-in, General, Scientific, Custom)
- Enable/disable state persists across sessions
- Project-level skills load automatically

---

## Ralph Loop

The Ralph Loop is Solaris's automated task completion system. It enables the AI to work autonomously on multi-step tasks without manual intervention.

### Configuration
- **Enable/Disable** — Toggle the Ralph Loop feature
- **Max Iterations** — Set the maximum number of autonomous steps
- **Auto-approve actions** — Configure which actions can be auto-approved

### How It Works
1. You give the AI a complex task
2. The Ralph Loop breaks it into steps
3. The AI executes each step autonomously
4. Checkpoints are saved for resumption if needed
5. The loop stops when the task is complete or max iterations are reached

---

## Logs

View application logs for debugging and monitoring.

### Log Levels
- **Error** — Critical issues that need attention
- **Warning** — Potential problems
- **Info** — General operation information
- **Debug** — Detailed technical information

### Use Cases
- Debug API connection issues
- Monitor MCP server connections
- Track skill loading and usage
- Diagnose sandbox setup problems

---

## Language

Change the interface language for Solaris.

### Supported Languages
Solaris supports multiple languages through i18next internationalization. The language setting affects:
- All UI labels and buttons
- Settings panel text
- Error and status messages
- Quick action tags and prompts

---

## Tips

- **Test your API connection** after any changes to provider or model settings
- **Enable only the skills you need** to keep the AI focused
- **Check Logs** when something isn't working — they often reveal the exact issue
- **Save credentials** for services you use frequently with the AI
- **Keep sandbox enabled** for full code execution capabilities

---

**Settings make Solaris yours.** Configure it once, and it adapts to your workflow perfectly.
