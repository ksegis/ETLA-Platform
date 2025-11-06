# RPA Integration Architecture for HelixBridge

## Overview

This document outlines how to integrate Playwright-based RPA (Robotic Process Automation) into HelixBridge for automating tasks like I-9 document uploads to Paycom.

## Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     HelixBridge Frontend                     │
│  (Next.js - User initiates RPA tasks, views status)         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ API Requests
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  HelixBridge Backend API                     │
│         (Next.js API Routes / Supabase Functions)           │
│  • Receives RPA task requests                               │
│  • Validates input data                                      │
│  • Queues tasks                                              │
│  • Returns task status                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Queue Task
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Task Queue System                         │
│              (Supabase Realtime / BullMQ)                   │
│  • Manages RPA task queue                                    │
│  • Handles retries and failures                              │
│  • Provides task status updates                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Process Task
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   RPA Worker Service                         │
│              (Node.js + Playwright)                         │
│  • Runs in separate process/container                       │
│  • Executes browser automation                               │
│  • Handles authentication                                    │
│  • Uploads documents                                         │
│  • Captures screenshots/logs                                 │
│  • Reports results                                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Browser Automation
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Paycom Web Interface                      │
│  • Login and authentication                                  │
│  • Navigate to I-9 upload                                    │
│  • Upload documents                                          │
│  • Verify completion                                         │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. Frontend (User Interface)
- **Location**: `/frontend/src/app/rpa/` or `/frontend/src/app/automation/`
- **Purpose**: Allow users to initiate RPA tasks and monitor progress
- **Technology**: React/Next.js components

#### 2. Backend API
- **Location**: `/frontend/src/app/api/rpa/` or Supabase Edge Functions
- **Purpose**: Handle RPA task requests, validation, and orchestration
- **Technology**: Next.js API routes or Supabase Functions

#### 3. Task Queue
- **Options**: 
  - Supabase Realtime (simple)
  - BullMQ with Redis (advanced)
  - Database-backed queue (medium)
- **Purpose**: Manage async RPA task execution

#### 4. RPA Worker Service
- **Location**: Separate Node.js service (can run in Docker)
- **Purpose**: Execute browser automation tasks
- **Technology**: Playwright + Node.js

#### 5. Storage & Logging
- **Database**: Supabase PostgreSQL for task metadata
- **File Storage**: Supabase Storage for screenshots/logs
- **Secrets**: Environment variables or Supabase Vault

---

## Implementation Options

### Option A: Simple Integration (Recommended for MVP)

**Architecture**: API Route → Direct Playwright Execution

**Pros:**
- Simple to implement
- No additional infrastructure
- Good for low-volume tasks

**Cons:**
- Blocks API response
- No task queuing
- Limited scalability

**Use Case**: Testing, proof of concept, low-volume automation

---

### Option B: Queue-Based (Recommended for Production)

**Architecture**: API Route → Task Queue → Worker Service

**Pros:**
- Async execution
- Scalable (multiple workers)
- Retry logic built-in
- Task prioritization

**Cons:**
- More complex setup
- Requires queue infrastructure

**Use Case**: Production deployment, high-volume automation

---

### Option C: Serverless (Cloud-Native)

**Architecture**: API Route → Cloud Function → Playwright in Container

**Pros:**
- Auto-scaling
- Pay-per-use
- Managed infrastructure

**Cons:**
- Cold start latency
- More expensive at scale
- Platform-specific

**Use Case**: Variable workload, cloud-first architecture

---

## Recommended Stack

### For HelixBridge Integration:

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Browser Automation** | Playwright | Better than Selenium for modern web apps |
| **Queue System** | Supabase + pg_cron | Leverage existing infrastructure |
| **Worker Service** | Node.js standalone | Easy to deploy, same language as frontend |
| **Credential Storage** | Supabase Vault | Secure, integrated with existing DB |
| **File Storage** | Supabase Storage | Screenshots, logs, documents |
| **Monitoring** | Supabase Logs + Custom Dashboard | Track success/failure rates |

---

## Database Schema

### RPA Tasks Table

```sql
-- Create RPA tasks table
CREATE TABLE rpa_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Task details
  task_type VARCHAR(50) NOT NULL, -- 'paycom_i9_upload', 'paycom_timecard', etc.
  task_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending', 
  -- pending, queued, running, completed, failed, cancelled
  
  priority INTEGER DEFAULT 5, -- 1-10, higher = more important
  
  -- Task data
  input_data JSONB NOT NULL, -- Task-specific input parameters
  output_data JSONB, -- Results from task execution
  error_message TEXT,
  error_stack TEXT,
  
  -- Execution tracking
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Artifacts
  screenshot_urls TEXT[], -- Array of screenshot URLs
  log_file_url TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_rpa_tasks_tenant ON rpa_tasks(tenant_id);
CREATE INDEX idx_rpa_tasks_user ON rpa_tasks(user_id);
CREATE INDEX idx_rpa_tasks_status ON rpa_tasks(status);
CREATE INDEX idx_rpa_tasks_created ON rpa_tasks(created_at DESC);

-- Enable RLS
ALTER TABLE rpa_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own RPA tasks"
  ON rpa_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create RPA tasks"
  ON rpa_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RPA tasks"
  ON rpa_tasks FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_rpa_tasks_updated_at
  BEFORE UPDATE ON rpa_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### RPA Credentials Table

```sql
-- Create RPA credentials table (encrypted)
CREATE TABLE rpa_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  -- Credential details
  service_name VARCHAR(100) NOT NULL, -- 'paycom', 'adp', etc.
  credential_type VARCHAR(50) NOT NULL, -- 'username_password', 'api_key', 'oauth'
  
  -- Encrypted credentials (use Supabase Vault or pgcrypto)
  username_encrypted TEXT,
  password_encrypted TEXT,
  api_key_encrypted TEXT,
  additional_data_encrypted JSONB, -- For MFA codes, security questions, etc.
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(tenant_id, service_name)
);

-- Enable RLS
ALTER TABLE rpa_credentials ENABLE ROW LEVEL SECURITY;

-- Only allow service account access (not direct user access)
CREATE POLICY "Service account can access credentials"
  ON rpa_credentials FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

### RPA Audit Log

```sql
-- Create RPA audit log
CREATE TABLE rpa_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  task_id UUID REFERENCES rpa_tasks(id),
  
  -- Event details
  event_type VARCHAR(50) NOT NULL, -- 'task_started', 'login_success', 'upload_complete', etc.
  event_message TEXT NOT NULL,
  event_data JSONB,
  
  -- Context
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_rpa_audit_tenant ON rpa_audit_log(tenant_id);
CREATE INDEX idx_rpa_audit_task ON rpa_audit_log(task_id);
CREATE INDEX idx_rpa_audit_created ON rpa_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE rpa_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for their tenant"
  ON rpa_audit_log FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );
```

---

## Directory Structure

```
/frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── rpa/
│   │   │       ├── tasks/
│   │   │       │   ├── route.ts          # Create/list RPA tasks
│   │   │       │   └── [id]/
│   │   │       │       └── route.ts      # Get/update specific task
│   │   │       ├── execute/
│   │   │       │   └── route.ts          # Trigger task execution
│   │   │       └── credentials/
│   │   │           └── route.ts          # Manage RPA credentials
│   │   │
│   │   └── automation/                   # RPA UI pages
│   │       ├── page.tsx                  # Dashboard
│   │       ├── tasks/
│   │       │   ├── page.tsx              # Task list
│   │       │   ├── new/
│   │       │   │   └── page.tsx          # Create new task
│   │       │   └── [id]/
│   │       │       └── page.tsx          # Task details
│   │       └── settings/
│   │           └── page.tsx              # RPA settings/credentials
│   │
│   ├── services/
│   │   └── rpa/
│   │       ├── rpaTaskService.ts         # API client for RPA tasks
│   │       └── rpaTypes.ts               # TypeScript types
│   │
│   └── components/
│       └── rpa/
│           ├── TaskList.tsx              # Display task list
│           ├── TaskStatus.tsx            # Show task status
│           ├── TaskForm.tsx              # Create task form
│           └── CredentialForm.tsx        # Manage credentials
│
/rpa-worker/                              # Separate RPA worker service
├── src/
│   ├── index.ts                          # Worker entry point
│   ├── queue/
│   │   ├── taskQueue.ts                  # Queue management
│   │   └── worker.ts                     # Task processor
│   ├── automations/
│   │   ├── base/
│   │   │   ├── BaseAutomation.ts         # Base class for all automations
│   │   │   └── BrowserManager.ts         # Playwright browser management
│   │   ├── paycom/
│   │   │   ├── PaycomI9Upload.ts         # I-9 upload automation
│   │   │   ├── PaycomLogin.ts            # Paycom authentication
│   │   │   └── PaycomSelectors.ts        # UI element selectors
│   │   └── index.ts                      # Export all automations
│   ├── utils/
│   │   ├── credentials.ts                # Credential decryption
│   │   ├── logger.ts                     # Logging utility
│   │   ├── screenshots.ts                # Screenshot capture
│   │   └── errorHandler.ts               # Error handling
│   └── config/
│       └── config.ts                     # Worker configuration
├── package.json
├── tsconfig.json
└── Dockerfile                            # For containerized deployment
```

---

## Why Playwright Over Selenium?

| Feature | Playwright | Selenium |
|---------|-----------|----------|
| **Speed** | ✅ Faster | ❌ Slower |
| **Modern Web Apps** | ✅ Excellent | ⚠️ Good |
| **Auto-wait** | ✅ Built-in | ❌ Manual |
| **Network Interception** | ✅ Yes | ❌ No |
| **Multiple Contexts** | ✅ Yes | ❌ Limited |
| **Screenshots** | ✅ Full page | ⚠️ Viewport only |
| **Debugging** | ✅ Excellent tools | ⚠️ Basic |
| **Headless** | ✅ Native | ⚠️ Requires config |
| **API** | ✅ Modern async/await | ⚠️ Older patterns |

**Recommendation**: Use Playwright for HelixBridge integration.

---

## Deployment Models

### Model 1: Monolithic (Simplest)

```
┌─────────────────────────────────┐
│   Single Next.js Application    │
│                                  │
│  ┌──────────┐  ┌──────────────┐ │
│  │ Frontend │  │  API Routes  │ │
│  └──────────┘  └──────────────┘ │
│                       │          │
│                       ▼          │
│              ┌──────────────┐   │
│              │  Playwright  │   │
│              │   (in-proc)  │   │
│              └──────────────┘   │
└─────────────────────────────────┘
```

**Pros**: Simple deployment, no additional services  
**Cons**: Blocks API, not scalable  
**Use Case**: Development, testing

---

### Model 2: Separate Worker (Recommended)

```
┌──────────────────┐         ┌──────────────────┐
│  Next.js App     │         │   RPA Worker     │
│  (Frontend+API)  │◄───────►│   (Node.js)      │
└──────────────────┘         └──────────────────┘
         │                            │
         │                            │
         ▼                            ▼
┌──────────────────────────────────────────────┐
│         Supabase (Database + Queue)          │
└──────────────────────────────────────────────┘
```

**Pros**: Scalable, async, multiple workers  
**Cons**: More complex deployment  
**Use Case**: Production

---

### Model 3: Containerized (Cloud-Native)

```
┌──────────────────┐    ┌─────────────────────────┐
│  Next.js App     │    │   Kubernetes/ECS        │
│  (Vercel/Cloud)  │    │                         │
└──────────────────┘    │  ┌────────────────────┐ │
         │              │  │  RPA Worker Pod 1  │ │
         │              │  └────────────────────┘ │
         ▼              │  ┌────────────────────┐ │
┌──────────────────┐   │  │  RPA Worker Pod 2  │ │
│  Task Queue      │◄──┼─►└────────────────────┘ │
│  (Redis/SQS)     │   │  ┌────────────────────┐ │
└──────────────────┘   │  │  RPA Worker Pod N  │ │
                       │  └────────────────────┘ │
                       └─────────────────────────┘
```

**Pros**: Auto-scaling, high availability  
**Cons**: Complex, higher cost  
**Use Case**: Enterprise, high-volume

---

## Security Considerations

### 1. Credential Management

**Never store plaintext credentials!**

```typescript
// ❌ WRONG
const credentials = {
  username: 'admin@company.com',
  password: 'MyPassword123'
};

// ✅ CORRECT
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, serviceRoleKey);

// Store encrypted
await supabase.from('rpa_credentials').insert({
  tenant_id: tenantId,
  service_name: 'paycom',
  username_encrypted: await encrypt(username),
  password_encrypted: await encrypt(password)
});

// Retrieve and decrypt in worker only
const { data } = await supabase
  .from('rpa_credentials')
  .select('*')
  .eq('service_name', 'paycom')
  .single();

const credentials = {
  username: await decrypt(data.username_encrypted),
  password: await decrypt(data.password_encrypted)
};
```

### 2. Network Security

- Run RPA workers in private subnet
- Whitelist worker IPs in Paycom
- Use VPN for sensitive automations
- Implement rate limiting

### 3. Access Control

- RBAC for who can create RPA tasks
- Audit all RPA operations
- Limit credential access to service role
- Implement approval workflows for sensitive tasks

### 4. Data Protection

- Encrypt screenshots containing PII
- Auto-delete logs after retention period
- Mask sensitive data in logs
- Comply with data residency requirements

---

## Monitoring & Observability

### Key Metrics to Track

| Metric | Purpose | Alert Threshold |
|--------|---------|-----------------|
| Task Success Rate | Overall health | < 90% |
| Average Execution Time | Performance | > 5 minutes |
| Queue Depth | Capacity planning | > 100 tasks |
| Error Rate by Type | Identify issues | > 5% |
| Credential Expiry | Prevent failures | < 7 days |
| Worker CPU/Memory | Resource usage | > 80% |

### Logging Strategy

```typescript
// Structured logging
logger.info('Task started', {
  taskId: task.id,
  taskType: task.task_type,
  tenantId: task.tenant_id,
  timestamp: new Date().toISOString()
});

logger.error('Task failed', {
  taskId: task.id,
  error: error.message,
  stack: error.stack,
  screenshot: screenshotUrl
});
```

### Dashboard Components

1. **Task Overview**
   - Total tasks (today/week/month)
   - Success vs failure rate
   - Average execution time

2. **Active Tasks**
   - Currently running tasks
   - Queue depth
   - Estimated completion time

3. **Recent Failures**
   - Failed tasks with error messages
   - Screenshots of failures
   - Retry status

4. **System Health**
   - Worker status (online/offline)
   - CPU and memory usage
   - Browser instance count

---

## Cost Considerations

### Infrastructure Costs

| Component | Estimated Monthly Cost |
|-----------|----------------------|
| Supabase (existing) | $0 (included) |
| RPA Worker (1 instance) | $20-50 (VPS/Cloud) |
| Browser instances | Included in worker |
| Storage (screenshots/logs) | $5-10 |
| **Total** | **$25-60/month** |

### Scaling Costs

- Each additional worker: +$20-50/month
- High-volume (1000+ tasks/day): Consider serverless
- Enterprise (10,000+ tasks/day): Kubernetes cluster

---

## Next Steps

To implement RPA in HelixBridge:

1. **Choose deployment model** (recommend Model 2 for production)
2. **Set up database schema** (run SQL migrations)
3. **Build RPA worker service** (see implementation guide)
4. **Create UI components** (task management interface)
5. **Implement first automation** (Paycom I-9 upload)
6. **Test and iterate** (start with staging environment)
7. **Deploy to production** (with monitoring)

---

**See also:**
- `RPA_Implementation_Guide.md` - Step-by-step code examples
- `Paycom_I9_Automation.md` - Specific Paycom I-9 implementation
