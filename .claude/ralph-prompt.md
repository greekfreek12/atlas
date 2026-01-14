Build the Atlas Site Editor - a fully functional AI-powered site editor.

## ENVIRONMENT
- Working directory: /workspaces/atlas/atlas-sites
- Database: Supabase (credentials in .env.local)
- Dev server: npm run dev (may already be running on port 3000)
- Site chat UI: http://localhost:3000/admin/site-chat
- Browser automation: Playwright MCP available

## CODEBASE STRUCTURE
- /app/admin/api/site-agent/route.ts - AI agent API with tools
- /lib/site-config/ - Config types, data operations, defaults
- /components/sections/ - Section components (hero, services, etc.)
- /components/PageRenderer.tsx - Renders sections with GenericSection fallback

## WHAT YOU CAN CHANGE
- ANY code files needed to make this work
- Add new tools to the AI agent
- Create new section components
- Add new API routes
- Modify database schema if needed (run migrations)
- Add new skills or agents if helpful
- Update system prompts

## TEST SEQUENCE (complete each phase before moving on)

### PHASE 1 - Tool Verification
1. Open browser to http://localhost:3000/admin/site-chat
2. Switch to a business in dropdown (clears session)
3. Ask "what sections are on the homepage?"
4. VERIFY: Server logs show [get_site_config] being called
5. VERIFY: AI response matches actual sections (5 sections: hero, trust-bar, services, reviews, cta)

### PHASE 2 - Content Editing
1. Ask "change the hero headline to Welcome to Our Business"
2. VERIFY: Preview iframe updates with new headline
3. Ask "add a gallery section with images"
4. VERIFY: Gallery section appears in preview

### PHASE 3 - Theme Per Business
1. Ask "change the primary color to #dc2626" (red)
2. VERIFY: Preview shows red colored elements
3. Switch to a DIFFERENT business in dropdown
4. VERIFY: Second business has its original colors (NOT red)
5. Switch back to first business
6. VERIFY: First business still has red colors

### PHASE 4 - Generate New Section Type
1. Ask "create a pricing section with 3 tiers: Basic $99, Pro $199, Premium $299"
2. VERIFY: Pricing section renders in preview (via GenericSection or auto-generated component)
3. Content should be visible and styled reasonably

### PHASE 5 - Service Management
1. Ask "add a new service called Emergency Sewer Repair with description Fast 24/7 sewer line repairs"
2. VERIFY: New service appears in services section in preview
3. Ask "remove the Emergency Sewer Repair service"
4. VERIFY: Service is removed from preview

### PHASE 6 - Persistence Check
1. Refresh the browser page
2. Ask "what sections are on the homepage?"
3. VERIFY: All changes from previous phases are still there (not lost)

## DEBUGGING
- Check server terminal for [get_site_config], [add_section], [update_section] logs
- If AI doesn't call tools, fix the system prompt in route.ts
- If sections don't render, check PageRenderer and section registry
- If changes don't persist, check saveSiteConfig in lib/site-config/data.ts
- Use Playwright browser_snapshot to see current page state

## COMPLETION
When ALL 6 phases pass successfully, output:
<promise>SITE EDITOR COMPLETE</promise>

If something fails, debug it, fix the code, and re-test that phase.
