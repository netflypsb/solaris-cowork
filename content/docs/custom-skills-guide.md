# Creating & Adding Custom Skills

Solaris's skill system is fully extensible. You can create your own custom skills to teach the AI new domain expertise, workflows, and specialized capabilities tailored to your needs.

---

## How Custom Skills Work

A custom skill is a directory containing a `SKILL.md` file that provides structured instructions to the AI. When the skill is enabled and relevant to your request, the AI loads the skill's content and follows its guidance.

### Skill Directory Structure
```
my-custom-skill/
├── SKILL.md          # Required — main skill definition
├── templates/        # Optional — template files
│   ├── template1.md
│   └── template2.html
├── references/       # Optional — reference materials
│   ├── api-docs.md
│   └── examples.md
└── LICENSE.txt       # Optional — license information
```

---

## Creating a Custom Skill

### Step 1: Create the Skill Directory

Create a new folder with a descriptive name (use kebab-case):
```
my-project/
└── .skills/
    └── my-custom-skill/
        └── SKILL.md
```

### Step 2: Write the SKILL.md File

The `SKILL.md` file is the heart of your skill. It uses YAML frontmatter for metadata followed by Markdown instructions.

```markdown
---
name: My Custom Skill
description: A brief description of what this skill does
group: custom
---

# My Custom Skill

## Purpose
Describe what this skill enables the AI to do.

## Instructions
Step-by-step instructions for the AI to follow when this skill is activated.

### Step 1: Understanding the Request
- Analyze the user's requirements
- Identify key parameters

### Step 2: Execution
- Follow these specific procedures...
- Use these templates...
- Apply these quality standards...

## Templates
Include any templates the AI should use.

## Examples
Provide example inputs and expected outputs.

## Quality Checklist
- [ ] Output meets specification
- [ ] All required sections included
- [ ] Formatting is correct
```

### Step 3: Add Supporting Files (Optional)

Place any templates, reference materials, or example files in subdirectories:
- **templates/** — Reusable file templates the AI can use
- **references/** — API documentation, style guides, or other reference material
- **examples/** — Sample inputs and outputs for the AI to learn from

---

## Where to Place Custom Skills

### Project-Level Skills (Recommended)

Place skills in your project's `.skills/` or `skills/` directory:

```
my-project/
├── .skills/
│   ├── my-skill-1/
│   │   └── SKILL.md
│   └── my-skill-2/
│       └── SKILL.md
├── src/
└── package.json
```

> **IMPORTANT**: The custom skill directory **must be inside the active project directory**. If you place skills outside the project directory, Solaris will not be able to access them due to file system sandboxing, resulting in file access errors. Always ensure your `.skills/` or `skills/` folder is at the root of the project you have open in Solaris.

### Global Skills

Place skills in your user config directory for availability across all projects:
- **Windows**: `%APPDATA%/solaris-cowork/claude/skills/`
- **macOS**: `~/Library/Application Support/solaris-cowork/claude/skills/`

### User Home Skills

Skills placed in `~/.claude/skills/` are automatically imported into Solaris.

---

## Skill Loading Priority

When Solaris starts or a project is opened, skills are loaded in this order:

1. **Project-level**: `<project>/.skills/` or `<project>/skills/`
2. **Global**: `<userData>/claude/skills/` (includes `~/.claude/skills/` via symlinks)
3. **Built-in**: Pre-packaged skills (PDF, XLSX, DOCX, PPTX, Browser Use)
4. **External**: `general-skills/` and `scientific-skills/` directories

Project-level skills take priority, allowing you to override or specialize global skills for specific projects.

---

## Writing Effective SKILL.md Files

### Best Practices

1. **Be specific**: Provide clear, unambiguous instructions
2. **Use structured steps**: Break complex workflows into numbered steps
3. **Include examples**: Show the AI what good output looks like
4. **Define quality criteria**: Tell the AI how to validate its own output
5. **Keep it focused**: One skill = one capability domain
6. **Use templates**: Provide reusable templates for consistent output

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Display name of the skill |
| `description` | Yes | Brief description (shown in Skills panel) |
| `group` | No | Logical grouping (e.g., "creative", "research", "development") |

### Content Structure

A well-structured SKILL.md typically includes:
1. **Purpose** — What the skill does and when to use it
2. **Prerequisites** — What the AI needs before starting
3. **Instructions** — Step-by-step execution guide
4. **Templates** — Reusable content structures
5. **Examples** — Input/output demonstrations
6. **Quality Checklist** — Validation criteria
7. **Troubleshooting** — Common issues and solutions

---

## Example: Creating a "Meeting Summary" Skill

```markdown
---
name: Meeting Summary Generator
description: Generate structured meeting summaries from notes or transcripts
group: productivity
---

# Meeting Summary Generator

## Purpose
Transform raw meeting notes or transcripts into structured, actionable meeting summaries.

## Instructions

### Step 1: Analyze Input
- Identify the meeting type (standup, planning, review, etc.)
- Extract attendees if mentioned
- Determine the date and duration

### Step 2: Generate Summary
Use the following template:

## Meeting Summary
**Date**: [extracted date]
**Attendees**: [list of attendees]
**Duration**: [duration if known]

### Key Discussion Points
1. [Topic 1 summary]
2. [Topic 2 summary]

### Decisions Made
- [Decision 1]
- [Decision 2]

### Action Items
| Owner | Action | Deadline |
|-------|--------|----------|
| [Name] | [Task] | [Date] |

### Follow-up Items
- [Item that needs future discussion]

### Step 3: Quality Check
- Verify all action items have owners
- Ensure decisions are clearly stated
- Check that no key topics are missed
```

---

## Managing Custom Skills

### In the Settings Panel
1. Go to Settings → Skills
2. Custom skills appear with their category label
3. Toggle skills on/off as needed
4. Your enable/disable preferences are persisted in the database

### Reloading Skills
- Skills are loaded when Solaris starts and when you open a project
- To reload skills after adding new ones, restart Solaris
- Project-level skills reload when you switch projects

---

## Troubleshooting

### Skill not appearing in Settings
- Verify the `SKILL.md` file exists in the skill directory
- Check that the frontmatter has valid `name` and `description` fields
- Ensure the skill directory is in a recognized location (project `.skills/`, global, or user home)
- Restart Solaris after adding new skills

### "File access error" when using a skill
- **This almost always means the skill directory is outside the active project directory**
- Move the skill's `.skills/` folder into the root of your currently open project
- Verify the project is correctly open in Solaris (check the folder name in the sidebar)

### Skill not being activated
- Make sure the skill is enabled in Settings → Skills
- Be more explicit in your request about what you want
- The AI uses the tool-search-tool to discover skills — make sure your skill's `name` and `description` clearly describe its purpose

---

**Custom skills are your secret weapon.** Create skills for your team's workflows, your industry's standards, or your personal preferences — and watch Solaris become the perfect AI coworker for your specific needs.
