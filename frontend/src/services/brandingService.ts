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
   * Replace HelixBridge branding with customer branding in text content
   */
  replaceHelixBridgeBranding(content: string, branding: CustomerBranding): string {
    if (!content) return content;

    // Define replacement patterns
    const replacements = [
      // Exact matches
      { pattern: /HelixBridge Platform/gi, replacement: `${branding.displayName} Platform` },
      { pattern: /HelixBridge/gi, replacement: branding.displayName },
      
      // Common variations
      { pattern: /Helix Bridge/gi, replacement: branding.displayName },
      { pattern: /HELIXBRIDGE/gi, replacement: branding.displayName.toUpperCase() },
      { pattern: /helixbridge/gi, replacement: branding.displayName.toLowerCase() },
      
      // Legal entity references
      { pattern: /HelixBridge, Inc\./gi, replacement: branding.legalName },
      { pattern: /HelixBridge Inc/gi, replacement: branding.legalName },
      { pattern: /HelixBridge Corporation/gi, replacement: branding.legalName },
      { pattern: /HelixBridge LLC/gi, replacement: branding.legalName },
      
      // System references
      { pattern: /HelixBridge System/gi, replacement: `${branding.displayName} System` },
      { pattern: /HelixBridge Dashboard/gi, replacement: `${branding.displayName} Dashboard` },
      { pattern: /HelixBridge Portal/gi, replacement: `${branding.displayName} Portal` },
      { pattern: /HelixBridge Application/gi, replacement: `${branding.displayName} Application` },
      
      // URL and domain references (be careful with these)
      { pattern: /helixbridge\.com/gi, replacement: `${branding.shortName.toLowerCase()}.com` },
      { pattern: /www\.helixbridge\.com/gi, replacement: `www.${branding.shortName.toLowerCase()}.com` },
      
      // Email references
      { pattern: /@helixbridge\.com/gi, replacement: `@${branding.shortName.toLowerCase()}.com` },
      
      // Support and contact references
      { pattern: /HelixBridge Support/gi, replacement: `${branding.displayName} Support` },
      { pattern: /HelixBridge Customer Service/gi, replacement: `${branding.displayName} Customer Service` },
      { pattern: /HelixBridge Team/gi, replacement: `${branding.displayName} Team` },
      
      // Copyright and legal references
      { pattern: /© HelixBridge/gi, replacement: `© ${branding.legalName}` },
      { pattern: /Copyright HelixBridge/gi, replacement: `Copyright ${branding.legalName}` },
      { pattern: /Powered by HelixBridge/gi, replacement: `Powered by ${branding.displayName}` },
      { pattern: /Built by HelixBridge/gi, replacement: `Built by ${branding.displayName}` }
    ];

    let processedContent = content;
    
    // Apply all replacements
    replacements.forEach(({ pattern, replacement }) => {
      processedContent = processedContent.replace(pattern, replacement);
    });

    return processedContent;
  }

  /**
   * Replace branding in HTML content while preserving structure
   */
  replaceHelixBridgeBrandingInHTML(htmlContent: string, branding: CustomerBranding): string {
    if (!htmlContent) return htmlContent;

    // First apply text replacements
    let processedHTML = this.replaceHelixBridgeBranding(htmlContent, branding);

    // Handle specific HTML attributes and meta tags
    const htmlReplacements = [
      // Title tags
      { pattern: /<title>([^<]*HelixBridge[^<]*)<\/title>/gi, replacement: (match: string, title: string) => {
        const newTitle = this.replaceHelixBridgeBranding(title, branding);
        return `<title>${newTitle}</title>`;
      }},
      
      // Meta descriptions
      { pattern: /<meta\s+name="description"\s+content="([^"]*HelixBridge[^"]*)"/gi, replacement: (match: string, content: string) => {
        const newContent = this.replaceHelixBridgeBranding(content, branding);
        return `<meta name="description" content="${newContent}"`;
      }},
      
      // Alt text in images
      { pattern: /alt="([^"]*HelixBridge[^"]*)"/gi, replacement: (match: string, altText: string) => {
        const newAltText = this.replaceHelixBridgeBranding(altText, branding);
        return `alt="${newAltText}"`;
      }},
      
      // Placeholder text
      { pattern: /placeholder="([^"]*HelixBridge[^"]*)"/gi, replacement: (match: string, placeholder: string) => {
        const newPlaceholder = this.replaceHelixBridgeBranding(placeholder, branding);
        return `placeholder="${newPlaceholder}"`;
      }}
    ];

    // Apply HTML-specific replacements
    htmlReplacements.forEach(({ pattern, replacement }) => {
      if (typeof replacement === 'function') {
        processedHTML = processedHTML.replace(pattern, replacement as any);
      } else {
        processedHTML = processedHTML.replace(pattern, replacement);
      }
    });

    return processedHTML;
  }

  /**
   * Replace branding in JSON content
   */
  replaceHelixBridgeBrandingInJSON(jsonContent: string, branding: CustomerBranding): string {
    if (!jsonContent) return jsonContent;

    try {
      const parsed = JSON.parse(jsonContent);
      const processedObject = this.replaceHelixBridgeBrandingInObject(parsed, branding);
      return JSON.stringify(processedObject, null, 2);
    } catch (error) {
      console.warn('Could not parse JSON for branding replacement, applying text replacement:', error);
      return this.replaceHelixBridgeBranding(jsonContent, branding);
    }
  }

  /**
   * Recursively replace branding in JavaScript objects
   */
  private replaceHelixBridgeBrandingInObject(obj: any, branding: CustomerBranding): any {
    if (typeof obj === 'string') {
      return this.replaceHelixBridgeBranding(obj, branding);
    } else if (Array.isArray(obj)) {
      return obj.map(item => this.replaceHelixBridgeBrandingInObject(item, branding));
    } else if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Replace branding in both keys and values
        const newKey = this.replaceHelixBridgeBranding(key, branding);
        result[newKey] = this.replaceHelixBridgeBrandingInObject(value, branding);
      }
      return result;
    }
    return obj;
  }

  /**
   * Get CSS variables for customer branding
   */
  getCustomerBrandingCSS(branding: CustomerBranding): string {
    return `
      :root {
        --customer-primary-color: ${branding.primaryColor || '#3B82F6'};
        --customer-secondary-color: ${branding.secondaryColor || '#1E40AF'};
        --customer-brand-name: "${branding.displayName}";
        --customer-legal-name: "${branding.legalName}";
        --customer-short-name: "${branding.shortName}";
      }
      
      .customer-primary-bg { background-color: var(--customer-primary-color); }
      .customer-secondary-bg { background-color: var(--customer-secondary-color); }
      .customer-primary-text { color: var(--customer-primary-color); }
      .customer-secondary-text { color: var(--customer-secondary-color); }
      .customer-primary-border { border-color: var(--customer-primary-color); }
      .customer-secondary-border { border-color: var(--customer-secondary-color); }
    `;
  }

  /**
   * Apply customer branding to document head
   */
  applyBrandingToDocument(branding: CustomerBranding): void {
    if (typeof document === 'undefined') return;

    // Update document title if it contains HelixBridge
    if (document.title.includes('HelixBridge')) {
      document.title = this.replaceHelixBridgeBranding(document.title, branding);
    }

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (metaDescription && metaDescription.content.includes('HelixBridge')) {
      metaDescription.content = this.replaceHelixBridgeBranding(metaDescription.content, branding);
    }

    // Add or update custom CSS variables
    let styleElement = document.getElementById('customer-branding-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'customer-branding-styles';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = this.getCustomerBrandingCSS(branding);

    // Update favicon if logo URL is provided
    if (branding.logoUrl) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = branding.logoUrl;
    }
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

  /**
   * Get customer legal name for a specific tenant (convenience method)
   */
  async getCustomerLegalName(tenantId: string): Promise<string> {
    const branding = await this.getCustomerBranding(tenantId);
    return branding.legalName;
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
