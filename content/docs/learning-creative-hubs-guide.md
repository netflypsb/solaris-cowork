# Learning Hub & Creative Hub — User Guide

The Learning Hub and Creative Hub are Solaris's foundational AI-powered tools that work seamlessly with your project data and conversations.

---

## Learning Hub

**Access**: Click the green graduation cap icon in your sidebar → "Learning Hub"

### Overview
The Learning Hub provides structured learning experiences with quizzes, lessons, and progress tracking. It's designed to help you learn new skills while staying connected to your actual project work.

### Getting Started
1. **Browse Experiences**: See available learning modules as cards with emoji icons
2. **Check Details**: Each card shows topic, difficulty, XP earned, and progress
3. **Launch Learning**: Click any experience to start the interactive lesson

### Experience Types
- **Quizzes**: Test your knowledge with multiple-choice questions
- **Interactive Lessons**: Step-by-step guided learning with examples
- **Skill Challenges**: Practical exercises to apply what you've learned
- **Project-Based Learning**: Learn while working on your actual projects

### Progress Tracking
- **XP System**: Earn experience points for completing activities
- **Progress Bars**: Visual indicators showing completion percentage
- **Section Tracking**: See which parts of a lesson you've finished
- **Last Played**: Resume where you left off

### Learning Profiles
- **Multiple Profiles**: Create different learning profiles for various skills
- **Personalized Paths**: The system adapts to your learning pace
- **Skill Assessment**: Track improvement over time
- **Achievement System**: Unlock new content as you progress

### AI Integration
- **Contextual Learning**: AI creates lessons based on your project needs
- **Adaptive Difficulty**: Content adjusts to your skill level
- **Real-world Examples**: Uses your actual project files as teaching material
- **Conversation Links**: Connect learning to specific AI chat discussions

---

## Creative Hub

**Access**: Click the purple palette icon in your sidebar → "Creative Hub"

### Overview
The Creative Hub is your AI-powered creative workspace for generating, viewing, and managing visual content, code, and creative assets directly connected to your project context.

### Getting Started
1. **Browse Gallery**: View your generated creative works in a grid layout
2. **Filter by Type**: Use the dropdown to filter by asset type (images, code, designs)
3. **View Details**: Click any asset to see full-size preview and metadata

### Asset Types
- **AI-Generated Images**: Visual content created from text descriptions
- **Code Snippets**: Generated code examples and solutions
- **Design Mockups**: UI/UX designs and wireframes
- **Creative Writing**: Stories, scripts, and other text content
- **Diagrams & Charts**: Visual representations of data and concepts

### Creative Viewer
When you click on an asset:
- **Full Preview**: See the complete creation in detail
- **Metadata**: View creation date, type, and associated conversation
- **Context**: See which AI chat session generated this content
- **Export Options**: Save or share your creative assets

### AI-Powered Generation
- **Conversation-Linked**: All creative work is tied to specific AI discussions
- **Context-Aware**: AI uses your project files and previous conversations
- **Iterative Creation**: Refine and improve based on your feedback
- **Multi-Format Support**: Generate various types of creative content

### Creative Workflow
1. **Start a Conversation**: Use AI chat to request creative content
2. **AI Generates**: The AI creates images, code, or other assets
3. **Auto-Saved**: All generated content appears in Creative Hub
4. **Review & Refine**: View, organize, and request improvements

### Organization Features
- **Automatic Categorization**: Assets sorted by type and date
- **Search Functionality**: Find specific creative works quickly
- **Thumbnail Previews**: Quick visual browsing of your gallery
- **Metadata Tracking**: Keep track of creation context and usage

---

## Hub Integration

### Connected Experience
Both hubs work together with your main Solaris workspace:
- **Shared Context**: Learning and creative work uses your project data
- **Conversation Links**: Connect to specific AI chat sessions
- **Progress Sync**: Your learning influences creative suggestions
- **Unified Storage**: Everything saved in your project's `.solaris/` folder

### Data Storage
```
.solaris/
├── learning-hub/
│   ├── experiences/     # Learning modules and progress
│   ├── profiles.json    # User learning profiles
│   └── progress.json   # Overall progress tracking
└── creative-hub/
    └── assets/          # Generated creative content
```

### AI-Powered Features
- **Personalized Learning**: AI creates lessons based on your project needs
- **Contextual Creativity**: AI generates content relevant to your work
- **Skill Development**: Learn skills that directly apply to your projects
- **Creative Inspiration**: Get ideas based on your learning progress

---

## Tips & Best Practices

### Learning Hub Best Practices
- **Start with Assessment**: Let AI evaluate your current skill level
- **Apply Immediately**: Use new skills in your actual projects
- **Track Progress**: Regularly check your XP and completion rates
- **Connect to Work**: Link learning to specific project challenges

### Creative Hub Best Practices
- **Be Specific**: Give AI detailed descriptions for better results
- **Iterate**: Ask for refinements and variations
- **Save Everything**: All generated content is automatically stored
- **Use Context**: Reference your project files in creative requests

### Combined Workflow
1. **Learn a Skill**: Complete a Learning Hub module
2. **Apply Knowledge**: Use AI chat to implement what you learned
3. **Create Assets**: Generate related creative content
4. **Review Progress**: See how learning and creativity connect

---

## Example Workflows

### Web Development Workflow
1. **Learning**: Take "React Fundamentals" course in Learning Hub
2. **Implementation**: Ask AI to help build a React component
3. **Creative**: Generate UI mockups in Creative Hub
4. **Integration**: Combine code and designs in your project

### Content Creation Workflow
1. **Learning**: Study "Copywriting Basics" in Learning Hub
2. **Brainstorming**: Use AI chat for content ideas
3. **Creative**: Generate images and graphics in Creative Hub
4. **Production**: Combine text and visuals in your project

### Data Analysis Workflow
1. **Learning**: Complete "Data Visualization" module
2. **Analysis**: Work with AI on your actual data
3. **Creative**: Generate charts and diagrams
4. **Presentation**: Combine insights and visuals

---

## Troubleshooting

### Learning Hub Issues
- **Progress not saving?** Ensure you have a project open
- **Can't access experiences?** Check your learning profile setup
- **Content not relevant?** Update your skill assessment

### Creative Hub Issues
- **Assets not appearing?** Check they were generated in AI chat
- **Can't view previews?** Verify file formats are supported
- **Missing context?** Ensure conversations are linked to projects

### General Hub Issues
- **Hubs not loading?** Verify you're in a project directory
- **Data not syncing?** Check `.solaris/` folder permissions
- **AI not responding?** Restart the app and check connection

---

**Ready to learn and create?** Start with the Learning Hub to build skills, then use the Creative Hub to apply them. For more on how these hubs connect with the rest of Solaris, see the [Unified Platform Guide](./unified-platform-guide.md).
