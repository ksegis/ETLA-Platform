// Saved Filters Types and Interfaces

export interface FilterState {
  searchTerm: string;
  locations: string[];
  jobTitles: string[];
  requisitionIds: string[];
  requisitionDescriptions: string[];
  status: string;
  skills: string[];
}

export interface SavedFilter {
  id: string;
  user_id: string;
  tenant_id: string;
  name: string;
  description?: string;
  filters: FilterState;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedFilterCreate {
  name: string;
  description?: string;
  filters: FilterState;
  is_default?: boolean;
}

export interface SavedFilterUpdate {
  name?: string;
  description?: string;
  filters?: FilterState;
  is_default?: boolean;
}
