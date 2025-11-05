// Saved Filters Service
// Handles all database operations for saved candidate filters

import { supabase } from '@/lib/supabase';
import { SavedFilter, SavedFilterCreate, SavedFilterUpdate } from '@/types/savedFilters';

/**
 * Get all saved filters for a user in a tenant
 */
export async function getSavedFilters(
  userId: string,
  tenantId: string
): Promise<SavedFilter[]> {
  try {
    const { data, error } = await supabase
      .from('candidate_saved_filters')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved filters:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch saved filters:', error);
    return [];
  }
}

/**
 * Get a specific saved filter by ID
 */
export async function getSavedFilterById(
  filterId: string,
  userId: string,
  tenantId: string
): Promise<SavedFilter | null> {
  try {
    const { data, error } = await supabase
      .from('candidate_saved_filters')
      .select('*')
      .eq('id', filterId)
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      console.error('Error fetching saved filter:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch saved filter:', error);
    return null;
  }
}

/**
 * Create a new saved filter
 */
export async function createSavedFilter(
  userId: string,
  tenantId: string,
  filterData: SavedFilterCreate
): Promise<SavedFilter | null> {
  try {
    // If this is set as default, unset other defaults first
    if (filterData.is_default) {
      await unsetDefaultFilters(userId, tenantId);
    }

    const { data, error } = await supabase
      .from('candidate_saved_filters')
      .insert({
        user_id: userId,
        tenant_id: tenantId,
        name: filterData.name,
        description: filterData.description,
        filters: filterData.filters,
        is_default: filterData.is_default || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating saved filter:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create saved filter:', error);
    return null;
  }
}

/**
 * Update an existing saved filter
 */
export async function updateSavedFilter(
  filterId: string,
  userId: string,
  tenantId: string,
  updates: SavedFilterUpdate
): Promise<SavedFilter | null> {
  try {
    // If setting as default, unset other defaults first
    if (updates.is_default) {
      await unsetDefaultFilters(userId, tenantId);
    }

    const { data, error } = await supabase
      .from('candidate_saved_filters')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', filterId)
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
      console.error('Error updating saved filter:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update saved filter:', error);
    return null;
  }
}

/**
 * Delete a saved filter
 */
export async function deleteSavedFilter(
  filterId: string,
  userId: string,
  tenantId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('candidate_saved_filters')
      .delete()
      .eq('id', filterId)
      .eq('user_id', userId)
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Error deleting saved filter:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete saved filter:', error);
    return false;
  }
}

/**
 * Get the default filter for a user
 */
export async function getDefaultFilter(
  userId: string,
  tenantId: string
): Promise<SavedFilter | null> {
  try {
    const { data, error } = await supabase
      .from('candidate_saved_filters')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching default filter:', error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Failed to fetch default filter:', error);
    return null;
  }
}

/**
 * Unset all default filters for a user (internal helper)
 */
async function unsetDefaultFilters(
  userId: string,
  tenantId: string
): Promise<void> {
  try {
    await supabase
      .from('candidate_saved_filters')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .eq('is_default', true);
  } catch (error) {
    console.error('Failed to unset default filters:', error);
  }
}

/**
 * Set a filter as default
 */
export async function setDefaultFilter(
  filterId: string,
  userId: string,
  tenantId: string
): Promise<boolean> {
  try {
    // Unset other defaults first
    await unsetDefaultFilters(userId, tenantId);

    // Set this one as default
    const { error } = await supabase
      .from('candidate_saved_filters')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', filterId)
      .eq('user_id', userId)
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Error setting default filter:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to set default filter:', error);
    return false;
  }
}
