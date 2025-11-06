import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';
import * as crypto from 'crypto';

export interface Credentials {
  username: string;
  password: string;
  apiKey?: string;
  additionalData?: any;
}

/**
 * Encryption key from environment variable
 * In production, use a proper key management service (AWS KMS, HashiCorp Vault, etc.)
 */
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt sensitive data
 */
export function encrypt(text: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedText: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Get credentials from Supabase
 */
export async function getCredentials(
  supabase: SupabaseClient,
  tenantId: string,
  serviceName: string
): Promise<Credentials | null> {
  try {
    logger.info('Retrieving credentials', { tenantId, serviceName });

    const { data, error } = await supabase
      .from('rpa_credentials')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('service_name', serviceName)
      .eq('is_active', true)
      .single();

    if (error) {
      logger.error('Failed to retrieve credentials', { error });
      return null;
    }

    if (!data) {
      logger.warn('No credentials found', { tenantId, serviceName });
      return null;
    }

    // Decrypt credentials
    const credentials: Credentials = {
      username: data.username_encrypted ? decrypt(data.username_encrypted) : '',
      password: data.password_encrypted ? decrypt(data.password_encrypted) : '',
      apiKey: data.api_key_encrypted ? decrypt(data.api_key_encrypted) : undefined,
      additionalData: data.additional_data_encrypted 
        ? JSON.parse(decrypt(JSON.stringify(data.additional_data_encrypted)))
        : undefined
    };

    // Update last_used_at
    await supabase
      .from('rpa_credentials')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);

    logger.info('Credentials retrieved successfully');

    return credentials;
  } catch (error: any) {
    logger.error('Error retrieving credentials', { error: error.message });
    return null;
  }
}

/**
 * Store credentials in Supabase
 */
export async function storeCredentials(
  supabase: SupabaseClient,
  tenantId: string,
  serviceName: string,
  credentials: Credentials
): Promise<boolean> {
  try {
    logger.info('Storing credentials', { tenantId, serviceName });

    const encryptedData = {
      tenant_id: tenantId,
      service_name: serviceName,
      credential_type: 'username_password',
      username_encrypted: encrypt(credentials.username),
      password_encrypted: encrypt(credentials.password),
      api_key_encrypted: credentials.apiKey ? encrypt(credentials.apiKey) : null,
      additional_data_encrypted: credentials.additionalData 
        ? encrypt(JSON.stringify(credentials.additionalData))
        : null,
      is_active: true
    };

    const { error } = await supabase
      .from('rpa_credentials')
      .upsert(encryptedData, {
        onConflict: 'tenant_id,service_name'
      });

    if (error) {
      logger.error('Failed to store credentials', { error });
      return false;
    }

    logger.info('Credentials stored successfully');
    return true;
  } catch (error: any) {
    logger.error('Error storing credentials', { error: error.message });
    return false;
  }
}

/**
 * Delete credentials
 */
export async function deleteCredentials(
  supabase: SupabaseClient,
  tenantId: string,
  serviceName: string
): Promise<boolean> {
  try {
    logger.info('Deleting credentials', { tenantId, serviceName });

    const { error } = await supabase
      .from('rpa_credentials')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('service_name', serviceName);

    if (error) {
      logger.error('Failed to delete credentials', { error });
      return false;
    }

    logger.info('Credentials deleted successfully');
    return true;
  } catch (error: any) {
    logger.error('Error deleting credentials', { error: error.message });
    return false;
  }
}
