import React from 'react';
/**
 * Branding Service for ETLA Platform
 * Handles dynamic customer name resolution and multi-tenant branding
 */

import { supabase } from '@/lib/supabase';

export interface CustomerBranding {
  legalName: string;
  displayName: string;
  tenantId: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

class BrandingService {
  private brandingCache: Map<string, CustomerBranding> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get customer branding information for a specific tenant
   */
  async getCustomerBranding(tenantId: string): Promise<CustomerBranding> {
    // Check cache first
    const cached = this.getCachedBranding(tenantId);
    if (cached) {
      return cached;
    }

    try {
      // Query tenant information from database
      const { data: tenant, error } = await supabase
        .from('tenants')
        .select('id, name, legal_name, display_name, logo_url, primary_color, secondary_color')
        .eq('id', tenantId)
        .single();

      if (error) {
        console.error('Error fetching tenant branding:', error);
        return this.getDefaultBranding(tenantId);
      }

      const branding: CustomerBranding = {
        legalName: tenant.legal_name || tenant.name || 'ETLA Platform',
        displayName: tenant.display_name || tenant.name || 'ETLA Platform',
        tenantId: tenant.id,
        logoUrl: tenant.logo_url,
        primaryColor: tenant.primary_color,
        secondaryColor: tenant.secondary_color,
      };

      // Cache the result
      this.setCachedBranding(tenantId, branding);
      return branding;

    } catch (error) {
      console.error('Error in getCustomerBranding:', error);
      return this.getDefaultBranding(tenantId);
    }
  }

  /**
   * Get customer legal name for use in reports and documents
   */
  async getCustomerLegalName(tenantId: string): Promise<string> {
    const branding = await this.getCustomerBranding(tenantId);
    return branding.legalName;
  }

  /**
   * Get customer display name for UI elements
   */
  async getCustomerDisplayName(tenantId: string): Promise<string> {
    const branding = await this.getCustomerBranding(tenantId);
    return branding.displayName;
  }

  /**
   * Replace "HelixBridge" or "ETLA Platform" with customer name in text
   */
  async replaceBrandingInText(text: string, tenantId: string): Promise<string> {
    const branding = await this.getCustomerBranding(tenantId);
    
    return text
      .replace(/HelixBridge/g, branding.legalName)
      .replace(/ETLA Platform/g, branding.legalName)
      .replace(/Helix Bridge/g, branding.legalName);
  }

  /**
   * Get branding for multiple tenants (batch operation)
   */
  async getBrandingForTenants(tenantIds: string[]): Promise<Map<string, CustomerBranding>> {
    const results = new Map<string, CustomerBranding>();
    
    // Check cache for all tenants
    const uncachedTenants = tenantIds.filter(id => !this.getCachedBranding(id));
    
    if (uncachedTenants.length === 0) {
      // All tenants are cached
      tenantIds.forEach(id => {
        const cached = this.getCachedBranding(id);
        if (cached) {
          results.set(id, cached);
        }
      });
      return results;
    }

    try {
      // Fetch uncached tenants
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select('id, name, legal_name, display_name, logo_url, primary_color, secondary_color')
        .in('id', uncachedTenants);

      if (error) {
        console.error('Error fetching tenant branding batch:', error);
        // Return defaults for uncached tenants
        uncachedTenants.forEach(id => {
          results.set(id, this.getDefaultBranding(id));
        });
        return results;
      }

      // Process fetched tenants
      tenants?.forEach(tenant => {
        const branding: CustomerBranding = {
          legalName: tenant.legal_name || tenant.name || 'ETLA Platform',
          displayName: tenant.display_name || tenant.name || 'ETLA Platform',
          tenantId: tenant.id,
          logoUrl: tenant.logo_url,
          primaryColor: tenant.primary_color,
          secondaryColor: tenant.secondary_color,
        };

        this.setCachedBranding(tenant.id, branding);
        results.set(tenant.id, branding);
      });

      // Add cached tenants to results
      tenantIds.forEach(id => {
        if (!results.has(id)) {
          const cached = this.getCachedBranding(id);
          if (cached) {
            results.set(id, cached);
          } else {
            results.set(id, this.getDefaultBranding(id));
          }
        }
      });

      return results;

    } catch (error) {
      console.error('Error in getBrandingForTenants:', error);
      // Return defaults for all tenants
      tenantIds.forEach(id => {
        results.set(id, this.getDefaultBranding(id));
      });
      return results;
    }
  }

  /**
   * Clear branding cache for a specific tenant
   */
  clearBrandingCache(tenantId?: string): void {
    if (tenantId) {
      this.brandingCache.delete(tenantId);
      this.cacheExpiry.delete(tenantId);
    } else {
      this.brandingCache.clear();
      this.cacheExpiry.clear();
    }
  }

  /**
   * Preload branding for a tenant (useful for performance optimization)
   */
  async preloadBranding(tenantId: string): Promise<void> {
    await this.getCustomerBranding(tenantId);
  }

  // Private helper methods

  private getCachedBranding(tenantId: string): CustomerBranding | null {
    const expiry = this.cacheExpiry.get(tenantId);
    if (!expiry || Date.now() > expiry) {
      this.brandingCache.delete(tenantId);
      this.cacheExpiry.delete(tenantId);
      return null;
    }

    return this.brandingCache.get(tenantId) || null;
  }

  private setCachedBranding(tenantId: string, branding: CustomerBranding): void {
    this.brandingCache.set(tenantId, branding);
    this.cacheExpiry.set(tenantId, Date.now() + this.CACHE_DURATION);
  }

  private getDefaultBranding(tenantId: string): CustomerBranding {
    return {
      legalName: 'ETLA Platform',
      displayName: 'ETLA Platform',
      tenantId,
    };
  }
}

// Export singleton instance
export const brandingService = new BrandingService();

// Export hook for React components
export function useBranding(tenantId?: string) {
  const [branding, setBranding] = React.useState<CustomerBranding | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);

    brandingService.getCustomerBranding(tenantId)
      .then(setBranding)
      .catch(err => {
        console.error('Error loading branding:', err);
        setError(err.message);
        setBranding(brandingService.getDefaultBranding(tenantId));
      })
      .finally(() => setLoading(false));
  }, [tenantId]);

  return { branding, loading, error };
}

export default brandingService;
