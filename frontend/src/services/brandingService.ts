'use client';

import { supabase } from '@/lib/supabase';

export interface CustomerBranding {
  legalName: string;
  displayName: string;
  shortName: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface Tenant {
  id: string;
  name: string;
  legal_name?: string;
  display_name?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
}

class BrandingService {
  private brandingCache = new Map<string, CustomerBranding>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get customer branding information for a specific tenant
   */
  async getCustomerBranding(tenantId: string): Promise<CustomerBranding> {
    // Check cache first
    const cached = this.brandingCache.get(tenantId);
    const expiry = this.cacheExpiry.get(tenantId);
    
    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    try {
      // Fetch tenant information from Supabase
      const { data: tenant, error } = await supabase
        .from('tenants')
        .select('id, name, legal_name, display_name, logo_url, primary_color, secondary_color')
        .eq('id', tenantId)
        .single();

      if (error) {
        console.warn('Could not fetch tenant branding:', error);
        return this.getDefaultBranding(tenantId);
      }

      const branding: CustomerBranding = {
        legalName: tenant.legal_name || tenant.name || 'ETLA Platform',
        displayName: tenant.display_name || tenant.name || 'ETLA Platform',
        shortName: tenant.name || 'ETLA',
        logoUrl: tenant.logo_url,
        primaryColor: tenant.primary_color,
        secondaryColor: tenant.secondary_color
      };

      // Cache the result
      this.brandingCache.set(tenantId, branding);
      this.cacheExpiry.set(tenantId, Date.now() + this.CACHE_DURATION);

      return branding;
    } catch (error) {
      console.error('Error fetching customer branding:', error);
      return this.getDefaultBranding(tenantId);
    }
  }

  /**
   * Get branding for multiple tenants at once
   */
  async getBulkCustomerBranding(tenantIds: string[]): Promise<Map<string, CustomerBranding>> {
    const results = new Map<string, CustomerBranding>();
    
    // Check which tenants need to be fetched (not in cache or expired)
    const tenantsToFetch: string[] = [];
    
    for (const tenantId of tenantIds) {
      const cached = this.brandingCache.get(tenantId);
      const expiry = this.cacheExpiry.get(tenantId);
      
      if (cached && expiry && Date.now() < expiry) {
        results.set(tenantId, cached);
      } else {
        tenantsToFetch.push(tenantId);
      }
    }

    // Fetch missing tenants
    if (tenantsToFetch.length > 0) {
      try {
        const { data: tenants, error } = await supabase
          .from('tenants')
          .select('id, name, legal_name, display_name, logo_url, primary_color, secondary_color')
          .in('id', tenantsToFetch);

        if (error) {
          console.warn('Could not fetch bulk tenant branding:', error);
        }

        // Process fetched tenants
        tenants?.forEach((tenant: Tenant) => {
          const branding: CustomerBranding = {
            legalName: tenant.legal_name || tenant.name || 'ETLA Platform',
            displayName: tenant.display_name || tenant.name || 'ETLA Platform',
            shortName: tenant.name || 'ETLA',
            logoUrl: tenant.logo_url,
            primaryColor: tenant.primary_color,
            secondaryColor: tenant.secondary_color
          };

          // Cache and add to results
          this.brandingCache.set(tenant.id, branding);
          this.cacheExpiry.set(tenant.id, Date.now() + this.CACHE_DURATION);
          results.set(tenant.id, branding);
        });

        // Add default branding for any tenants that weren't found
        tenantsToFetch.forEach(tenantId => {
          if (!results.has(tenantId)) {
            const defaultBranding = this.getDefaultBranding(tenantId);
            results.set(tenantId, defaultBranding);
          }
        });

      } catch (error) {
        console.error('Error fetching bulk customer branding:', error);
        
        // Add default branding for all missing tenants
        tenantsToFetch.forEach(tenantId => {
          results.set(tenantId, this.getDefaultBranding(tenantId));
        });
      }
    }

    return results;
  }

  /**
   * Get default branding when tenant data is not available
   */
  public getDefaultBranding(tenantId?: string): CustomerBranding {
    return {
      legalName: 'ETLA Platform',
      displayName: 'ETLA Platform',
      shortName: 'ETLA',
      logoUrl: undefined,
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF'
    };
  }

  /**
   * Clear branding cache for a specific tenant
   */
  clearCache(tenantId?: string): void {
    if (tenantId) {
      this.brandingCache.delete(tenantId);
      this.cacheExpiry.delete(tenantId);
    } else {
      this.brandingCache.clear();
      this.cacheExpiry.clear();
    }
  }

  /**
   * Preload branding for multiple tenants (useful for multi-tenant views)
   */
  async preloadBranding(tenantIds: string[]): Promise<void> {
    await this.getBulkCustomerBranding(tenantIds);
  }
}

// Export singleton instance
export const brandingService = new BrandingService();

// React hook for using branding in components
export function useCustomerBranding(tenantId?: string) {
  const [branding, setBranding] = React.useState<CustomerBranding | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!tenantId) {
      setBranding(brandingService.getDefaultBranding());
      return;
    }

    setLoading(true);
    setError(null);

    brandingService.getCustomerBranding(tenantId)
      .then(branding => {
        setBranding(branding);
      })
      .catch(err => {
        console.error('Error loading branding:', err);
        setError(err.message);
        setBranding(brandingService.getDefaultBranding(tenantId));
      })
      .finally(() => setLoading(false));
  }, [tenantId]);

  return { branding, loading, error };
}

// Add React import for the hook
import React from 'react';
