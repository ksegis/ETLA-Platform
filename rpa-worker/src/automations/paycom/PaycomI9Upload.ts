import { BaseAutomation, AutomationResult } from '../base/BaseAutomation';
import { logger } from '../../utils/logger';
import { PaycomSelectors } from './PaycomSelectors';
import { getCredentials } from '../../utils/credentials';

export interface PaycomI9UploadInput {
  employeeId: string;
  employeeName: string;
  i9DocumentPath: string; // Path to I-9 PDF file
  idDocumentPaths?: string[]; // Paths to ID documents (passport, driver's license, etc.)
}

export class PaycomI9Upload extends BaseAutomation {
  private selectors = PaycomSelectors;

  async execute(): Promise<AutomationResult> {
    const input = this.task.input_data as PaycomI9UploadInput;

    logger.info('Starting Paycom I-9 upload', {
      taskId: this.task.id,
      employeeId: input.employeeId,
      employeeName: input.employeeName
    });

    try {
      // Initialize browser
      await this.initBrowser(process.env.NODE_ENV === 'production');

      // Step 1: Login to Paycom
      await this.login();
      await this.takeScreenshot('01-logged-in');

      // Step 2: Navigate to employee profile
      await this.navigateToEmployee(input.employeeId);
      await this.takeScreenshot('02-employee-profile');

      // Step 3: Navigate to I-9 section
      await this.navigateToI9Section();
      await this.takeScreenshot('03-i9-section');

      // Step 4: Upload I-9 document
      await this.uploadI9Document(input.i9DocumentPath);
      await this.takeScreenshot('04-i9-uploaded');

      // Step 5: Upload ID documents (if provided)
      if (input.idDocumentPaths && input.idDocumentPaths.length > 0) {
        await this.uploadIdDocuments(input.idDocumentPaths);
        await this.takeScreenshot('05-id-documents-uploaded');
      }

      // Step 6: Verify upload success
      const verified = await this.verifyUploadSuccess();
      await this.takeScreenshot('06-verification');

      if (!verified) {
        throw new Error('I-9 upload verification failed');
      }

      logger.info('Paycom I-9 upload completed successfully', {
        taskId: this.task.id,
        employeeId: input.employeeId
      });

      return {
        success: true,
        message: `I-9 uploaded successfully for ${input.employeeName}`,
        data: {
          employeeId: input.employeeId,
          uploadedAt: new Date().toISOString(),
          documentsUploaded: {
            i9: true,
            idDocuments: input.idDocumentPaths?.length || 0
          }
        },
        screenshots: this.screenshots
      };
    } catch (error: any) {
      logger.error('Paycom I-9 upload failed', {
        taskId: this.task.id,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Login to Paycom
   */
  private async login(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    logger.info('Logging into Paycom');

    // Get credentials from secure storage
    const credentials = await getCredentials(
      this.supabase,
      this.task.tenant_id,
      'paycom'
    );

    if (!credentials) {
      throw new Error('Paycom credentials not found');
    }

    // Navigate to Paycom login page
    await this.page.goto('https://www.paycomonline.net/', {
      waitUntil: 'networkidle'
    });

    await this.logAuditEvent('navigation', 'Navigated to Paycom login page');

    // Enter username
    await this.page.fill(this.selectors.login.usernameInput, credentials.username);
    
    // Enter password
    await this.page.fill(this.selectors.login.passwordInput, credentials.password);

    // Click login button
    await this.page.click(this.selectors.login.loginButton);

    // Wait for dashboard to load
    await this.page.waitForSelector(this.selectors.dashboard.mainContainer, {
      timeout: 30000
    });

    await this.logAuditEvent('login_success', 'Successfully logged into Paycom');

    logger.info('Successfully logged into Paycom');
  }

  /**
   * Navigate to employee profile
   */
  private async navigateToEmployee(employeeId: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    logger.info('Navigating to employee profile', { employeeId });

    // Click on Employees menu
    await this.page.click(this.selectors.navigation.employeesMenu);

    // Search for employee
    await this.page.fill(this.selectors.employees.searchInput, employeeId);
    await this.page.press(this.selectors.employees.searchInput, 'Enter');

    // Wait for search results
    await this.page.waitForSelector(this.selectors.employees.searchResults, {
      timeout: 10000
    });

    // Click on first result
    await this.page.click(this.selectors.employees.firstResult);

    // Wait for employee profile to load
    await this.page.waitForSelector(this.selectors.employees.profileContainer, {
      timeout: 10000
    });

    await this.logAuditEvent('navigation', 'Navigated to employee profile', {
      employeeId
    });

    logger.info('Successfully navigated to employee profile');
  }

  /**
   * Navigate to I-9 section
   */
  private async navigateToI9Section(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    logger.info('Navigating to I-9 section');

    // Click on Onboarding/I-9 tab
    await this.page.click(this.selectors.employees.onboardingTab);

    // Wait for I-9 section to load
    await this.page.waitForSelector(this.selectors.i9.container, {
      timeout: 10000
    });

    // Click on I-9 documents section
    await this.page.click(this.selectors.i9.documentsSection);

    await this.logAuditEvent('navigation', 'Navigated to I-9 section');

    logger.info('Successfully navigated to I-9 section');
  }

  /**
   * Upload I-9 document
   */
  private async uploadI9Document(documentPath: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    logger.info('Uploading I-9 document', { documentPath });

    // Click upload button
    await this.page.click(this.selectors.i9.uploadButton);

    // Wait for file input to appear
    const fileInput = await this.page.waitForSelector(
      this.selectors.i9.fileInput,
      { timeout: 5000 }
    );

    if (!fileInput) {
      throw new Error('File input not found');
    }

    // Upload file
    await fileInput.setInputFiles(documentPath);

    // Wait for upload to complete
    await this.page.waitForSelector(this.selectors.i9.uploadSuccess, {
      timeout: 30000
    });

    await this.logAuditEvent('document_upload', 'I-9 document uploaded', {
      documentPath
    });

    logger.info('I-9 document uploaded successfully');
  }

  /**
   * Upload ID documents
   */
  private async uploadIdDocuments(documentPaths: string[]): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    logger.info('Uploading ID documents', {
      count: documentPaths.length
    });

    for (let i = 0; i < documentPaths.length; i++) {
      const documentPath = documentPaths[i];

      // Click add ID document button
      await this.page.click(this.selectors.i9.addIdDocumentButton);

      // Wait for file input
      const fileInput = await this.page.waitForSelector(
        this.selectors.i9.idFileInput,
        { timeout: 5000 }
      );

      if (!fileInput) {
        throw new Error('ID file input not found');
      }

      // Upload file
      await fileInput.setInputFiles(documentPath);

      // Wait for upload to complete
      await this.page.waitForSelector(this.selectors.i9.uploadSuccess, {
        timeout: 30000
      });

      await this.logAuditEvent('document_upload', 'ID document uploaded', {
        documentPath,
        index: i + 1
      });

      logger.info(`ID document ${i + 1} uploaded successfully`);
    }
  }

  /**
   * Verify upload success
   */
  private async verifyUploadSuccess(): Promise<boolean> {
    if (!this.page) throw new Error('Page not initialized');

    logger.info('Verifying upload success');

    try {
      // Check for success message or uploaded document indicator
      const successIndicator = await this.page.waitForSelector(
        this.selectors.i9.uploadedDocumentIndicator,
        { timeout: 5000 }
      );

      if (!successIndicator) {
        return false;
      }

      // Verify document count
      const documentCount = await this.page.locator(
        this.selectors.i9.documentList
      ).count();

      logger.info('Upload verification successful', { documentCount });

      return documentCount > 0;
    } catch (error) {
      logger.error('Upload verification failed', { error });
      return false;
    }
  }
}
