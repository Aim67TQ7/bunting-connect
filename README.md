# Bunting Authentication Hub

## Overview

Central authentication portal for Bunting applications, running at **login.buntinggpt.com**.

## Features

- Microsoft OAuth authentication via Supabase
- Badge-based login for employees without company email
- Cross-subdomain session management for *.buntinggpt.com
- Dark theme with Bunting branding

## Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Authentication, Database)
- **Hosting**: login.buntinggpt.com

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Authentication Flow

1. User visits login.buntinggpt.com
2. Authenticates via Microsoft OAuth or Badge login
3. Session token stored in cross-subdomain cookie
4. User redirected to requesting application
