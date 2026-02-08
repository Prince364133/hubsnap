# AI Agent Instruction: Integrate HubSnap Explore & Guides Features

## Objective
Your task is to integrate the "Explore" (AI Tools Directory) and "Guides" (Knowledge Base) features into the attached project. You must ensure seamless integration, consistent styling, and full admin control for content management.

## Provided Package Structure
All necessary files are located in the `feature_export` folder. Mirror this structure in your target project:
- `/explore.html`: Main page for AI tools discovery.
- `/guides.html`: Main page for the knowledge base/guides.
- `/guide.html`: Template for individual guide articles.
- `/tool.html`: Template for individual tool details.
- `/dashboard.html`: Reference for the "Mission Control" theme.
- `/style.css`: Core site styling and layout.
- `/css/ai-features.css`: Specialized styling for AI-driven UI components.
- `/css/dashboard-theme.css`: Core theme for the Admin Panel.
- `/js/`:
    - `explore.js`: Logic for tool searching, filtering, and rendering.
    - `guides.js` & `guide.js`: Logic for the knowledge base.
    - `data-service.js`: CRUD layer for Firestore interactions.
    - `ai-features.js` & `ai-features-ui.js`: UI helpers for AI features.
    - `firebase-config.js`: Firebase initialization reference.
    - `paywall.js`: Logic for handling premium content access.
    - `header.js` & `footer.js`: Layout consistency scripts.
- `/admin/`:
    - `admin/tools.html`: Admin interface for managing the tools directory.
    - `admin/js/tools-manager.js`: Logic for adding/editing/locking tools.

## Mandatory Integration Requirements

### 1. Feature Porting
- Integrate the **Explore Page** with full search, category filtering, and "Surprise Me" functionality.
- Integrate the **Guides Page** allowing users to browse and read specific execution guides.
- Ensure all links in `header.js` and `footer.js` are updated to point to these new pages.

### 2. Admin Panel Integration
- **DO NOT** create a new admin dashboard if one already exists in the target project.
- If an admin panel exists: Add a new section or navigation items labeled **"Tools Manager"** and **"Guides Manager"**.
- If no admin panel exists: Create one that exclusively controls these features using the provided `admin/dashboard.html` as a template.
- **Design Requirement**: The admin panel MUST follow the theme of `http://localhost:5000/dashboard#/home`. This means:
    - **Sky Blue & White** color palette.
    - **Glassmorphism** effects (blur, subtle borders).
    - **Sidebar Navigation** as seen in `dashboard.html`.
    - Use variables from `dashboard-theme.css`.

### 3. Content Management Controls
- Implement full CRUD (Create, Read, Update, Delete) for:
    - **AI Tools**: Name, Company, Website, Description, Categories, Pricing (Free/Paid), and "Locked" status.
    - **Guides**: Title, Category, Content, and "Premium" status.
- Ensure the Admin Panel includes a "Lock/Unlock" toggle for each item, which interacts with `paywall.js` on the frontend.

### 4. Technical Setup (Firebase)
- Use `firebase-config.js` to initialize Firebase in the target project.
- Ensure the following Firestore collections exist:
    - `tools`: For storing tool directory data.
    - `guides`: For storing guide articles.
    - `admins`: For verifying administrative access.
- Utilize `data-service.js` as the primary interface for all database operations to maintain consistency.

## Design Aesthetics
The frontend for these features must feel premium and "alive":
- Use smooth hover transitions on tool cards.
- Implement glassmorphism for all filter panels and modals.
- Follow the **Sky Blue / White / Deep Blue** theme consistently.

## Final Goal
The target project should have a functional AI tools directory and a guides section, manageable via a sleek, professional admin dashboard that uses the HubSnap/CreatorOS design language.
