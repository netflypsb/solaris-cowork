# Skills Guide

Skills are specialized knowledge modules that extend Solaris's AI capabilities. They provide domain-specific expertise, templates, workflows, and instructions that the AI uses to perform specialized tasks with higher accuracy.

---

## What Are Skills?

A skill is a structured knowledge package — typically a `SKILL.md` file and optional supporting resources — that gives the AI detailed instructions for a specific domain. When a skill is enabled, the AI can discover and use it via the **tool-search-tool** mechanism, which keeps the system prompt lean while making hundreds of capabilities available on demand.

### How Skills Work
1. **Discovery**: When you ask the AI to do something, it searches available skills for relevant expertise
2. **Loading**: The matching skill's instructions are loaded into context
3. **Execution**: The AI follows the skill's detailed guidance to complete your task
4. **Output**: Results are produced according to the skill's templates and quality standards

---

## Skill Categories

### Built-in Skills
Pre-packaged with Solaris, always available:
- **PDF** — Create, manipulate, extract, merge, and fill PDF documents
- **XLSX** — Create and edit spreadsheets with formulas, formatting, and data analysis
- **DOCX** — Create and edit Word documents with tracked changes, comments, and formatting
- **PPTX** — Create and edit PowerPoint presentations with layouts and speaker notes
- **Browser Use** — Web automation, search, research, and online task execution

### General Skills
A library of creative and productivity skills:
- **Advertisement** — Create professional ad campaigns and marketing materials
- **Algorithmic Art** — Generate mathematical and generative art
- **Brand Guidelines** — Develop comprehensive brand identity documents
- **Brochure** — Design informational brochures and pamphlets
- **Carousel** — Create social media carousel posts
- **Digital Planner** — Design interactive digital planners
- **E-book** — Create formatted e-books and publications
- **Infographic** — Design data-driven infographics
- **Poster** — Create visual posters for events, marketing, etc.
- And many more...

### Scientific Skills
Specialized skills for scientific research and analysis:
- **AlphaFold Database** — Protein structure analysis
- **AnnData** — Single-cell genomics data handling
- **Bioinformatics tools** — Various computational biology skills
- **Data analysis frameworks** — Statistical and computational tools
- Over 130 scientific domain skills available

---

## Managing Skills

### Accessing the Skills Panel
1. Click **Settings** (gear icon) at the bottom of the sidebar
2. Navigate to the **Skills** tab
3. View all available skills organized by category

### Enabling & Disabling Skills
- Each skill has a toggle switch to enable or disable it
- Enabled skills are available for the AI to discover and use
- Disabled skills are hidden from the AI
- Your enable/disable preferences persist across sessions

### Skill Information
Each skill card shows:
- **Name** — The skill's display name
- **Description** — What the skill does
- **Category** — Built-in, General, Scientific, or Custom
- **Type** — Built-in, Custom, or MCP-based
- **Group** — Logical grouping (e.g., "creative", "document", "research")

---

## Using Skills in Conversations

You don't need to explicitly "call" a skill. Simply describe what you want, and the AI will automatically find and use the right skill:

### Examples
- *"Create a professional brochure for my consulting business"* → Uses the Brochure skill
- *"Make an infographic showing our quarterly sales data"* → Uses the Infographic skill
- *"Generate a PDF report from this data"* → Uses the PDF skill
- *"Create a PowerPoint presentation for my research findings"* → Uses the PPTX skill
- *"Design an advertisement for our new product launch"* → Uses the Advertisement skill

### Skill-Powered Creative Hub
Many skills produce visual outputs that automatically appear in the **Creative Hub**:
- Generated brochures, posters, and advertisements
- Infographics and data visualizations
- E-books and digital planners
- Algorithmic art pieces

---

## Tips for Getting the Most from Skills

- **Be specific about format**: "Create a PDF report" vs. "Create an XLSX spreadsheet" helps the AI choose the right skill
- **Provide context**: The more details you give (content, style, audience), the better the output
- **Check the Creative Hub**: Generated creative works are saved automatically
- **Enable relevant skills**: If working on scientific research, enable the scientific skills you need
- **Combine skills**: Ask for multi-step workflows that use multiple skills in sequence

---

## Troubleshooting

### Skill not being used
- Check that the skill is **enabled** in Settings → Skills
- Be more explicit in your request about the desired output format
- Verify the skill is available for your skill category

### Output quality issues
- Provide more detailed requirements in your prompt
- Specify the target audience, style, and content requirements
- Iterate with follow-up messages to refine the output

### Skills not loading
- Restart Solaris if skills aren't appearing
- Check the Logs tab in Settings for any skill loading errors
- Ensure the skills directories are intact and not corrupted

---

**Skills make Solaris infinitely extensible.** The more skills you enable, the more your AI coworker can do.
