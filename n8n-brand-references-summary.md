# n8n Brand References Summary

This document contains all n8n brand references found in the codebase that need to be updated for whitelabeling.

## 1. Localization File (en.json)
Location: `/packages/frontend/@n8n/i18n/src/locales/en.json`

### Key Brand References:
- **About/Info Messages:**
  - "about.aboutN8n": "About n8n"
  - "about.n8nLicense": "Sustainable Use License + n8n Enterprise License"
  - "about.n8nVersion": "n8n Version"
  - "mainSidebar.aboutN8n": "About n8n"

- **AI and Services:**
  - "aiAssistant.n8nAi": "n8n AI"
  - "aiAssistant.serviceError.message": "Unable to connect to n8n's AI service ({message})"

- **Banners and Notifications:**
  - "banners.nonProductionLicense.message": "This n8n instance is not licensed for production purposes."
  - "banners.trial.message": "1 day left in your n8n trial | {count} days left in your n8n trial"
  - "banners.v1.message": "n8n has been updated to version 1..."

- **Chat and Embed:**
  - "chatEmbed.infoTip.description": "Add chat to external applications using the n8n chat package."
  - "chatEmbed.install": "First, install the n8n chat package:"
  - "chatEmbed.packageInfo.description": "The n8n Chat widget can be easily customized..."
  - "chatEmbed.url": "https://www.npmjs.com/package/{'@'}n8n/chat"

- **Error Messages:**
  - Multiple references to "n8n can't figure out" in error descriptions
  - "readOnlyEnv.cantAdd" messages mentioning "protected n8n instance"
  - "nodeSettings.nodeTypeUnknown.description": mentions "newer version of n8n"

- **User Interface:**
  - "editor.mainHeader.githubButton.label": "Star n8n-io/n8n on GitHub"
  - "personalizationModal.customizeN8n": "Customize n8n to you"
  - "personalizationModal.imNotUsingN8nForWork": "I'm not using n8n for work"
  - "personalizationModal.howDidYouHearAboutN8n": "How did you hear about n8n?"

- **Settings and Configuration:**
  - "settings.n8napi": "n8n API"
  - Multiple references to "n8n instance" in settings descriptions
  - "settings.communityNodes" references to packages "verified by n8n"

- **Documentation Links:**
  - Numerous links to "https://docs.n8n.io"
  - Community links to "https://community.n8n.io"

## 2. Email Templates
Location: `/packages/nodes-base/utils/sendAndWait/email-templates.ts`

- **Email Footer:** "Automated with n8n" with link to n8n.io
- **HTML Templates:** Contains n8n branding in email footers
- **Page Title:** References to n8n in action recorded pages

## 3. CSS and Styling
Location: `/packages/cli/src/public-api/swagger-theme.css`

- **Brand Colors:**
  - Primary color: `#ff6d5a` (orange-red)
  - Logo color: `#EA4B71` (pink-red, visible in SVG)
  - Base64 encoded n8n logo in swagger UI

## 4. Constants and Node References
Location: `/packages/nodes-base/utils/constants.ts`

- Links to n8n documentation in node warnings

## 5. Additional Brand References Found:

### In Error Messages:
- "Unable to connect to n8n's AI service"
- "n8n can't figure out the matching item"
- "n8n isn't set up to send email right now"
- "n8n stops executing the workflow when..."

### In UI Elements:
- NPM package references starting with "n8n-nodes-"
- GitHub repository references to "n8n-io/n8n"
- Version notifications about n8n updates
- Trial and license notifications

### In Documentation Links:
- All links pointing to docs.n8n.io
- Community forum links to community.n8n.io
- NPM package links to @n8n packages

## Recommendations for Whitelabeling:

1. **Text Replacements:** Replace all instances of "n8n" with your brand name
2. **URL Updates:** Update all documentation and community links
3. **Color Changes:** Update brand colors (#ff6d5a, #EA4B71) in CSS files
4. **Logo Replacement:** Replace the base64 encoded logo in swagger-theme.css
5. **Package Names:** Consider if npm package naming conventions need updating
6. **Email Branding:** Update email templates to remove n8n attribution or replace with your brand
7. **Error Messages:** Update all error messages to use your brand name
8. **License Text:** Update license-related messages