# Project Board, Knowledge Base & Visual Editor

Solaris includes three powerful productivity tools built directly into your workspace: a Kanban-style Project Board, a Wiki-powered Knowledge Base, and an Interactive Visual Editor. This guide covers how to use each one.

---

## Project Management Dashboard

**Access**: Click the blue clipboard icon in your sidebar → "Project Board"

### Getting Started
1. **Create your first task**: Click "New Task" in the top-right
2. **Fill in details**: Title (required), description, priority, due date, labels
3. **Watch it appear**: Your task shows up in the "To Do" column by default

### Kanban Board Workflow
- **5 columns**: Backlog → To Do → In Progress → Review → Done
- **Drag & drop**: Click and hold any task card to move it between columns
- **Quick add**: Click the "+" button in any column header to create tasks directly there

### Task Cards
- **Priority colors**: Critical (red), High (orange), Medium (yellow), Low (blue)
- **Labels**: Organize with tags like "bug", "feature", "urgent"
- **Subtasks**: Track progress with checklist items (shows X/Y completed)
- **Due dates**: Orange warning when overdue, green when on track
- **Assignee**: User (you) or AI for AI-assisted tasks

### Task Details
Click any task card to open the detail panel:
- **Edit everything**: Title, description, status, priority, assignee, due date, estimated hours
- **Subtask management**: Add/remove checklist items, mark complete/incomplete
- **Linked files**: Shows associated project files
- **Linked conversations**: Connects to specific AI chat sessions

### List View
Toggle between Kanban (grid) and List (table) views in the top-right corner. List view shows:
- All tasks in a sortable table
- Status badges, priority colors, due dates, labels
- Click any row to open task details

### Data Storage
- Tasks are saved in `.solaris/tasks/` as JSON files
- Each task gets a unique ID: `task-slug-timestamp.json`
- Automatic saving when you create, edit, or move tasks

---

## Knowledge Base & Wiki

**Access**: Click the amber book icon in your sidebar → "Knowledge Base"

### Creating Pages
1. **New Page**: Click "New Page" in the top-right
2. **Choose template**: Blank, Meeting Notes, Project Brief, or Research Notes
3. **Set details**: Title, folder organization, tags
4. **Start writing**: Markdown editor opens automatically

### Markdown Features
- **Headings**: `# H1`, `## H2`, `### H3`
- **Lists**: `- bullet points` or `* bullets`
- **Horizontal rules**: `---`
- **Wiki links**: `[[Page Name]]` creates clickable links to other pages

### Wiki Links (Powerful!)
- **Create links**: Type `[[Project Alpha]]` anywhere in your content
- **Auto-navigation**: Click any wiki link to jump to that page
- **Backlinks**: Each page shows "Pages that link here" automatically
- **Bidirectional**: Links work both ways without manual management

### Organization
- **Folders**: Organize pages in folders like "meetings", "projects", "research"
- **Tags**: Add multiple tags like "project, q1, important"
- **Search**: Use the search bar to find pages by title or tags
- **Filter**: Filter by folder to browse specific sections

### Editor Modes
- **Edit mode**: Write in markdown with live preview of wiki links
- **Preview mode**: See rendered markdown with clickable links
- **Toggle**: Switch between Edit/Preview with the toolbar button

### Templates
- **Meeting Notes**: Date, attendees, agenda, discussion, action items, decisions
- **Project Brief**: Overview, goals, timeline, resources, risks, related pages
- **Research Notes**: Topic, findings, sources, questions, next steps
- **Blank**: Clean slate for any content type

### Data Storage
- Pages saved in `.solaris/wiki/` as `.md` files
- YAML frontmatter stores metadata (title, tags, status, dates)
- `_meta/links.json` tracks all wiki connections
- Folder structure preserved in file system

---

## Interactive Visual Editor

**Access**: Click the rose pen icon in your sidebar → "Visual Editor"

### Creating Designs
1. **New Design**: Click "New Design" in the top-right
2. **Choose size**: Pick from presets (Instagram, Twitter, Facebook, etc.) or Custom
3. **Set details**: Name, tags, dimensions
4. **Start designing**: Canvas editor opens with your chosen size

### Drawing Tools
- **Select Tool**: Click objects to select, drag to move, use property panel to edit
- **Rectangle Tool**: Click and drag to create rectangles
- **Circle Tool**: Click and drag to create ellipses
- **Text Tool**: Creates text boxes (double-click to edit text content)

### Canvas Controls
- **Zoom**: Use zoom buttons (25% to 400%) or mouse wheel
- **Colors**: Fill color and stroke color pickers in toolbar
- **Undo/Redo**: Full history support for all actions
- **Delete**: Select object and press Delete button or use property panel

### Property Panel
When you select an object, the right panel shows:
- **Position**: X, Y coordinates
- **Size**: Width, Height
- **Appearance**: Rotation, opacity, fill color, stroke color
- **Text options**: Font size (for text objects)
- **Real-time updates**: Changes apply instantly to canvas

### Canvas Presets
Quick start with common sizes:
- **Instagram Post**: 1080×1080 (square)
- **Instagram Story**: 1080×1920 (vertical)
- **Twitter/X Post**: 1200×675 (landscape)
- **Facebook Cover**: 820×312 (wide)
- **YouTube Thumbnail**: 1280×720 (16:9)
- **LinkedIn Banner**: 1584×396 (wide)
- **A4 Poster**: 2480×3508 (print)
- **Presentation**: 1920×1080 (16:9)
- **Custom**: Set your own dimensions

### Export Options
- **PNG Export**: Click Download button to save as PNG image
- **Automatic thumbnails**: Generated when you save projects
- **High quality**: Full resolution export at canvas size

### Project Gallery
- **Grid view**: See all your designs with thumbnails
- **Project cards**: Show name, dimensions, last updated, tags
- **Quick actions**: Open to edit or delete projects
- **Search/Filter**: Find designs by name or tags

### Data Storage
- Projects saved in `.solaris/canvas-projects/` as JSON files
- Includes: metadata, canvas size, background, all objects, thumbnail
- Objects stored as arrays with position, size, style properties

---

## Feature Interactions

### Cross-Feature Workflows
1. **Project → Wiki**: Link project tasks to wiki documentation pages
2. **Wiki → Visual**: Create visual designs for wiki pages (diagrams, mockups)
3. **Visual → Project**: Attach design files to project tasks
4. **AI Integration**: Use AI chat to generate content for any feature

### Mutual Exclusion
- Only one hub can be active at a time
- Opening a new hub automatically closes others
- Switching between chat sessions closes all hubs
- Keeps interface clean and focused

### File System Integration
All features store data in your project's `.solaris/` directory:
```
.solaris/
├── tasks/           # Project Management
├── wiki/            # Knowledge Base
└── canvas-projects/ # Visual Editor
```

---

## Tips & Best Practices

### Project Management
- **Use labels consistently**: "bug", "feature", "urgent", "review"
- **Break down large tasks**: Use subtasks for complex work
- **Set realistic due dates**: Helps prioritize work
- **Link to conversations**: Connect tasks to AI discussions about them

### Knowledge Base
- **Create link networks**: Use `[[Page Name]]` extensively
- **Organize with folders**: Keep related pages together
- **Use templates**: Start with Meeting Notes or Project Brief templates
- **Tag everything**: Makes search and filtering powerful

### Visual Editor
- **Start with presets**: Use social media sizes for quick designs
- **Use layers concept**: Create background shapes first, then details
- **Experiment with colors**: Fill and stroke colors create visual hierarchy
- **Export frequently**: Save your work as you go

### General
- **Save automatically**: All features auto-save when you make changes
- **Use keyboard shortcuts**: Enter to submit forms, Escape to close modals
- **Check file system**: Data persists even if you close the app
- **Combine features**: Use all three together for complete project management

---

## Getting Started Workflow

1. **Open a project** in Solaris
2. **Create a project board** for your tasks
3. **Set up a wiki** for documentation and notes
4. **Design visuals** for presentations or mockups
5. **Link everything** together with wiki links and task associations
6. **Use AI chat** to generate content, ideas, or solve problems

You now have a complete productivity suite built into Solaris.

---

## Troubleshooting

### Tasks not saving?
- Check you have a project open (working directory set)
- Verify `.solaris/tasks/` folder exists
- Try refreshing the hub (close and reopen)

### Wiki links not working?
- Make sure target page exists
- Check spelling in `[[Page Name]]` matches exactly
- Use lowercase and hyphens for page IDs automatically

### Canvas export blurry?
- Increase zoom level before exporting
- Use appropriate canvas size for your needs
- Check you're using the Download button, not screenshot

### Features not showing?
- Ensure you have a project directory open
- Restart the app if features are unresponsive
- Check Settings → Logs for any errors

---

**Need help?** Use the AI chat to ask questions about any feature, or visit the [Getting Started Guide](./getting-started-guide.md) for initial setup instructions.
