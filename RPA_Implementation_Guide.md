# RPA Implementation Guide for HelixBridge

## Table of Contents

1. [Quick Start](#quick-start)
2. [Database Setup](#database-setup)
3. [Worker Deployment](#worker-deployment)
4. [Frontend Integration](#frontend-integration)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase project set up
- Paycom account with credentials
- Basic understanding of TypeScript and Playwright

### 5-Minute Setup (Development)

```bash
# 1. Navigate to RPA worker directory
cd /path/to/ETLA-Platform/rpa-worker

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium

# 4. Copy environment template
cp .env.example .env

# 5. Edit .env with your credentials
nano .env

# 6. Run database migrations (see Database Setup section)

# 7. Start the worker
npm run dev
```

---

## Database Setup

### Step 1: Run SQL Migrations

Connect to your Supabase project and run the following SQL:

```sql
-- Create RPA tasks table
CREATE TABLE rpa_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  task_type VARCHAR(50) NOT NULL,
  task_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 5,
  
  input_data JSONB NOT NULL,
  output_data JSONB,
  error_message TEXT,
  error_stack TEXT,
  
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  screenshot_urls TEXT[],
  log_file_url TEXT,
  
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

CREATE POLICY "Users can view their own RPA tasks"
  ON rpa_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create RPA tasks"
  ON rpa_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RPA tasks"
  ON rpa_tasks FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RPA credentials table
CREATE TABLE rpa_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  service_name VARCHAR(100) NOT NULL,
  credential_type VARCHAR(50) NOT NULL,
  
  username_encrypted TEXT,
  password_encrypted TEXT,
  api_key_encrypted TEXT,
  additional_data_encrypted JSONB,
  
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(tenant_id, service_name)
);

ALTER TABLE rpa_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service account can access credentials"
  ON rpa_credentials FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create RPA audit log
CREATE TABLE rpa_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  task_id UUID REFERENCES rpa_tasks(id),
  
  event_type VARCHAR(50) NOT NULL,
  event_message TEXT NOT NULL,
  event_data JSONB,
  
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rpa_audit_tenant ON rpa_audit_log(tenant_id);
CREATE INDEX idx_rpa_audit_task ON rpa_audit_log(task_id);
CREATE INDEX idx_rpa_audit_created ON rpa_audit_log(created_at DESC);

ALTER TABLE rpa_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for their tenant"
  ON rpa_audit_log FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to rpa_tasks
CREATE TRIGGER update_rpa_tasks_updated_at
  BEFORE UPDATE ON rpa_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to rpa_credentials
CREATE TRIGGER update_rpa_credentials_updated_at
  BEFORE UPDATE ON rpa_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Step 2: Create Storage Bucket

In Supabase Dashboard:

1. Go to Storage
2. Create new bucket: `rpa-screenshots`
3. Set to Public (or Private with signed URLs)
4. Configure retention policy (optional)

---

## Worker Deployment

### Option 1: Local Development

```bash
cd rpa-worker
npm install
npm run dev
```

### Option 2: Production Server (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Build the worker
cd rpa-worker
npm install
npm run build

# Start with PM2
pm2 start dist/index.js --name rpa-worker

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Option 3: Docker

```bash
# Build Docker image
cd rpa-worker
docker build -t helixbridge-rpa-worker .

# Run container
docker run -d \
  --name rpa-worker \
  --env-file .env \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/screenshots:/app/screenshots \
  --restart unless-stopped \
  helixbridge-rpa-worker

# View logs
docker logs -f rpa-worker
```

### Option 4: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  rpa-worker:
    build: ./rpa-worker
    container_name: helixbridge-rpa-worker
    env_file:
      - ./rpa-worker/.env
    volumes:
      - ./rpa-worker/logs:/app/logs
      - ./rpa-worker/screenshots:/app/screenshots
    restart: unless-stopped
    networks:
      - helixbridge

networks:
  helixbridge:
    driver: bridge
```

Run with:
```bash
docker-compose up -d
```

---

## Frontend Integration

### Step 1: Create API Routes

Create `/frontend/src/app/api/rpa/tasks/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: tasks, error } = await supabase
    .from('rpa_tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  const { data: task, error } = await supabase
    .from('rpa_tasks')
    .insert({
      user_id: user.id,
      tenant_id: body.tenant_id,
      task_type: body.task_type,
      task_name: body.task_name,
      description: body.description,
      input_data: body.input_data,
      priority: body.priority || 5
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task }, { status: 201 });
}
```

### Step 2: Create RPA Service

Create `/frontend/src/services/rpa/rpaTaskService.ts`:

```typescript
import { createClient } from '@/lib/supabase';

export interface RPATask {
  id: string;
  task_type: string;
  task_name: string;
  status: string;
  input_data: any;
  output_data?: any;
  error_message?: string;
  screenshot_urls?: string[];
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export async function createRPATask(
  taskType: string,
  taskName: string,
  inputData: any,
  tenantId: string
): Promise<RPATask> {
  const response = await fetch('/api/rpa/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task_type: taskType,
      task_name: taskName,
      input_data: inputData,
      tenant_id: tenantId
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create RPA task');
  }

  const { task } = await response.json();
  return task;
}

export async function getRPATasks(): Promise<RPATask[]> {
  const response = await fetch('/api/rpa/tasks');

  if (!response.ok) {
    throw new Error('Failed to fetch RPA tasks');
  }

  const { tasks } = await response.json();
  return tasks;
}

export async function getRPATask(taskId: string): Promise<RPATask> {
  const response = await fetch(`/api/rpa/tasks/${taskId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch RPA task');
  }

  const { task } = await response.json();
  return task;
}
```

### Step 3: Create UI Component

Create `/frontend/src/components/rpa/I9UploadForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { createRPATask } from '@/services/rpa/rpaTaskService';

export function I9UploadForm({ tenantId }: { tenantId: string }) {
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [i9File, setI9File] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Upload I-9 file to Supabase Storage first
      const supabase = createClient();
      const fileName = `i9/${employeeId}/${i9File!.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(fileName, i9File!);

      if (uploadError) throw uploadError;

      // Create RPA task
      const task = await createRPATask(
        'paycom_i9_upload',
        `Upload I-9 for ${employeeName}`,
        {
          employeeId,
          employeeName,
          i9DocumentPath: fileName
        },
        tenantId
      );

      setMessage(`Task created successfully! Task ID: ${task.id}`);
      
      // Reset form
      setEmployeeId('');
      setEmployeeName('');
      setI9File(null);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Employee ID</label>
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Employee Name</label>
        <input
          type="text"
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">I-9 Document (PDF)</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setI9File(e.target.files?.[0] || null)}
          required
          className="mt-1 block w-full"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Upload to Paycom'}
      </button>

      {message && (
        <div className={`p-3 rounded ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </form>
  );
}
```

---

## Testing

### Unit Tests

Create `/rpa-worker/src/automations/paycom/PaycomI9Upload.test.ts`:

```typescript
import { PaycomI9Upload } from './PaycomI9Upload';
import { AutomationTask } from '../base/BaseAutomation';

describe('PaycomI9Upload', () => {
  it('should create automation instance', () => {
    const task: AutomationTask = {
      id: 'test-123',
      task_type: 'paycom_i9_upload',
      tenant_id: 'tenant-123',
      input_data: {
        employeeId: 'EMP001',
        employeeName: 'John Doe',
        i9DocumentPath: '/path/to/i9.pdf'
      }
    };

    const automation = new PaycomI9Upload(task);
    expect(automation).toBeInstanceOf(PaycomI9Upload);
  });
});
```

Run tests:
```bash
npm test
```

### Integration Testing

1. **Test with Paycom Staging**:
   - Get staging credentials from Paycom
   - Update selectors for staging environment
   - Run test automation

2. **Verify Screenshots**:
   - Check screenshots directory
   - Ensure all steps are captured

3. **Check Database**:
   - Verify task status updates
   - Check audit logs
   - Validate error handling

---

## Production Deployment

### Deployment Checklist

- [ ] Database migrations applied
- [ ] Storage bucket created
- [ ] Environment variables configured
- [ ] Paycom credentials stored securely
- [ ] Selectors verified against production Paycom
- [ ] Worker deployed and running
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Documentation updated
- [ ] Team trained

### Environment Variables (Production)

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-production-key

# Encryption (use strong key!)
ENCRYPTION_KEY=your-32-char-production-key-here

# Worker
POLL_INTERVAL=5000
LOG_LEVEL=info
NODE_ENV=production
HEADLESS=true

# Optional: Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Security Best Practices

1. **Never commit credentials**
   - Use environment variables
   - Use secret management (AWS Secrets Manager, HashiCorp Vault)

2. **Encrypt all sensitive data**
   - Use strong encryption keys
   - Rotate keys regularly

3. **Limit access**
   - Use RLS policies
   - Implement RBAC
   - Audit all access

4. **Monitor everything**
   - Log all automation runs
   - Alert on failures
   - Track success rates

---

## Monitoring & Maintenance

### Key Metrics to Monitor

1. **Task Success Rate**
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*) as success_rate
   FROM rpa_tasks
   WHERE created_at > NOW() - INTERVAL '24 hours';
   ```

2. **Average Execution Time**
   ```sql
   SELECT 
     AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_seconds
   FROM rpa_tasks
   WHERE status = 'completed'
   AND created_at > NOW() - INTERVAL '24 hours';
   ```

3. **Error Breakdown**
   ```sql
   SELECT 
     error_message,
     COUNT(*) as count
   FROM rpa_tasks
   WHERE status = 'failed'
   AND created_at > NOW() - INTERVAL '7 days'
   GROUP BY error_message
   ORDER BY count DESC;
   ```

### Maintenance Tasks

**Daily:**
- Check worker health
- Review failed tasks
- Monitor queue depth

**Weekly:**
- Clean up old screenshots
- Review error patterns
- Update selectors if needed

**Monthly:**
- Rotate encryption keys
- Review access logs
- Update dependencies
- Performance optimization

---

## Troubleshooting

### Common Issues

#### 1. Worker Not Processing Tasks

**Symptoms**: Tasks stuck in "pending" status

**Solutions**:
- Check worker is running: `pm2 status` or `docker ps`
- Check worker logs: `pm2 logs rpa-worker` or `docker logs rpa-worker`
- Verify database connection
- Check environment variables

#### 2. Login Failures

**Symptoms**: Tasks fail with "Login failed" error

**Solutions**:
- Verify Paycom credentials are correct
- Check if credentials are encrypted properly
- Verify Paycom hasn't changed login flow
- Check for MFA/2FA requirements
- Review login selectors

#### 3. Upload Failures

**Symptoms**: Tasks fail during document upload

**Solutions**:
- Verify file paths are correct
- Check file permissions
- Verify Paycom upload selectors
- Check file size limits
- Review network connectivity

#### 4. Selector Errors

**Symptoms**: "Element not found" errors

**Solutions**:
- Inspect Paycom UI with browser DevTools
- Update selectors in `PaycomSelectors.ts`
- Add wait conditions
- Use more specific selectors
- Check for dynamic content

### Debug Mode

Enable debug mode for detailed logging:

```bash
# In .env
LOG_LEVEL=debug
HEADLESS=false  # Show browser window
```

### Getting Help

1. Check logs: `/rpa-worker/logs/`
2. Review screenshots: `/rpa-worker/screenshots/`
3. Check audit log in database
4. Contact Paycom support for UI changes
5. Consult Playwright documentation

---

## Next Steps

1. **Set up development environment**
   - Follow Quick Start guide
   - Run test automation

2. **Verify Paycom selectors**
   - Login to Paycom manually
   - Inspect UI elements
   - Update selectors in code

3. **Test with staging data**
   - Create test employee
   - Upload test I-9
   - Verify in Paycom

4. **Deploy to production**
   - Follow deployment checklist
   - Monitor closely
   - Be ready to rollback

5. **Expand automations**
   - Add more task types
   - Integrate with other systems
   - Build monitoring dashboard

---

**See also:**
- `RPA_Integration_Architecture.md` - Architecture overview
- `Paycom_I9_RPA_Analysis.md` - Paycom API analysis
- `PaycomSelectors.ts` - UI selector reference
