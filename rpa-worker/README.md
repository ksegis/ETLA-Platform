# HelixBridge RPA Worker

Robotic Process Automation worker service for HelixBridge platform using Playwright.

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run in development
npm run dev

# Build for production
npm run build

# Run in production
npm start
\`\`\`

## Features

- ✅ Paycom I-9 document upload automation
- ✅ Secure credential management
- ✅ Screenshot capture for debugging
- ✅ Comprehensive audit logging
- ✅ Task queue management
- ✅ Error handling and retries

## Documentation

See `/ETLA-Platform/RPA_Implementation_Guide.md` for complete documentation.

## Architecture

\`\`\`
src/
├── automations/          # Automation implementations
│   ├── base/            # Base automation class
│   └── paycom/          # Paycom-specific automations
├── queue/               # Task queue and worker
├── utils/               # Utility functions
└── index.ts             # Entry point
\`\`\`

## Adding New Automations

1. Create new automation class extending `BaseAutomation`
2. Implement `execute()` method
3. Add to worker task routing
4. Update documentation

## Support

For issues or questions, see the troubleshooting section in the implementation guide.
