// =====================================================
// PMBOK PROJECT MANAGEMENT SERVICE LAYER
// =====================================================
// Author: Manus AI
// Date: August 30, 2025
// Purpose: TypeScript service layer for PMBOK-compliant project management

import { createClient } from '@supabase/supabase-js';

// =====================================================
// TYPESCRIPT INTERFACES
// =====================================================

export interface Tenant {
  id: string;
  name: string;
  code: string;
  host_customer_id?: string;
  tenant_type: 'host' | 'direct_client' | 'sub_customer';
  parent_tenant_id?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country: string;
  status: 'active' | 'inactive' | 'suspended';
  subscription_plan: string;
  max_projects: number;
  max_users: number;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProjectCharter {
  id: string;
  tenant_id: string;
  project_code: string;
  project_name: string;
  business_case?: string;
  project_justification?: string;
  success_criteria?: string;
  project_objectives?: string;
  measurable_objectives: any[];
  project_scope?: string;
  scope_inclusions?: string;
  scope_exclusions?: string;
  project_sponsor?: string;
  project_manager?: string;
  key_stakeholders: any[];
  planned_start_date?: string;
  planned_end_date?: string;
  estimated_budget?: number;
  approved_budget?: number;
  charter_status: 'draft' | 'under_review' | 'approved' | 'rejected';
  authorized_by?: string;
  authorization_date?: string;
  high_level_risks?: string;
  key_assumptions?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkBreakdownStructure {
  id: string;
  tenant_id: string;
  project_id: string;
  wbs_code: string;
  parent_wbs_id?: string;
  level_number: number;
  work_package_name: string;
  work_package_description?: string;
  deliverable_description?: string;
  estimated_hours?: number;
  estimated_cost?: number;
  complexity_rating?: number;
  assigned_to?: string;
  responsible_organization?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  completion_percentage: number;
  predecessor_wbs_codes: string[];
  successor_wbs_codes: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectSchedule {
  id: string;
  tenant_id: string;
  project_id: string;
  wbs_id?: string;
  activity_code: string;
  activity_name: string;
  activity_description?: string;
  estimated_duration?: number;
  actual_duration?: number;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  early_start_date?: string;
  early_finish_date?: string;
  late_start_date?: string;
  late_finish_date?: string;
  total_float?: number;
  free_float?: number;
  is_critical_path: boolean;
  predecessor_activities: any[];
  successor_activities: any[];
  dependency_type: 'FS' | 'SS' | 'FF' | 'SF';
  lag_time: number;
  resource_requirements: any[];
  assigned_resources: any[];
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  completion_percentage: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EarnedValueManagement {
  id: string;
  tenant_id: string;
  project_id: string;
  measurement_date: string;
  budget_at_completion?: number;
  planned_value?: number;
  actual_cost?: number;
  earned_value?: number;
  cost_variance?: number;
  schedule_variance?: number;
  cost_performance_index?: number;
  schedule_performance_index?: number;
  estimate_at_completion?: number;
  estimate_to_complete?: number;
  variance_at_completion?: number;
  to_complete_performance_index?: number;
  planned_duration_days?: number;
  actual_duration_days?: number;
  estimated_completion_date?: string;
  performance_status: 'ahead' | 'on_track' | 'at_risk' | 'critical';
  created_by?: string;
  created_at: string;
}

export interface RiskRegister {
  id: string;
  tenant_id: string;
  project_id: string;
  risk_code: string;
  risk_title: string;
  risk_description?: string;
  risk_category?: string;
  risk_source?: string;
  probability_rating?: number;
  impact_rating?: number;
  risk_score?: number;
  risk_level?: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  response_strategy?: 'avoid' | 'mitigate' | 'transfer' | 'accept';
  response_actions?: string;
  contingency_plan?: string;
  risk_owner?: string;
  assigned_to?: string;
  identified_date?: string;
  target_resolution_date?: string;
  actual_resolution_date?: string;
  status: 'identified' | 'analyzed' | 'response_planned' | 'response_implemented' | 'monitored' | 'closed';
  last_review_date?: string;
  next_review_date?: string;
  review_notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface StakeholderRegister {
  id: string;
  tenant_id: string;
  project_id: string;
  stakeholder_code: string;
  stakeholder_name: string;
  stakeholder_title?: string;
  organization?: string;
  email?: string;
  phone?: string;
  address?: string;
  stakeholder_type?: 'internal' | 'external' | 'key' | 'primary' | 'secondary';
  influence_level?: number;
  interest_level?: number;
  power_level?: number;
  attitude?: 'supportive' | 'neutral' | 'resistant' | 'unaware';
  engagement_strategy?: string;
  communication_requirements?: string;
  preferred_communication_method?: string;
  communication_frequency?: string;
  project_role?: string;
  responsibilities?: string;
  authority_level?: string;
  expectations?: string;
  requirements?: string;
  success_criteria?: string;
  engagement_status: 'identified' | 'analyzed' | 'engaged' | 'managed' | 'monitored';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectPerformanceMetrics {
  id: string;
  tenant_id: string;
  project_id: string;
  measurement_date: string;
  initiating_score: number;
  planning_score: number;
  executing_score: number;
  monitoring_controlling_score: number;
  closing_score: number;
  integration_management_score: number;
  scope_management_score: number;
  schedule_management_score: number;
  cost_management_score: number;
  quality_management_score: number;
  resource_management_score: number;
  communications_management_score: number;
  risk_management_score: number;
  procurement_management_score: number;
  stakeholder_management_score: number;
  process_groups_average: number;
  knowledge_areas_average: number;
  overall_pmbok_compliance: number;
  schedule_performance: 'ahead' | 'on_track' | 'at_risk' | 'critical';
  cost_performance: 'under_budget' | 'on_track' | 'at_risk' | 'over_budget';
  quality_performance: 'exceeds' | 'meets' | 'at_risk' | 'below';
  assessed_by?: string;
  assessment_notes?: string;
  created_at: string;
}

// =====================================================
// PMBOK SERVICE CLASS
// =====================================================

export class PMBOKService {
  private supabase;
  private currentTenantId: string;

  constructor(supabaseUrl: string, supabaseKey: string, tenantId: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.currentTenantId = tenantId;
  }

  // =====================================================
  // TENANT MANAGEMENT
  // =====================================================

  async getTenants(): Promise<Tenant[]> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createTenant(tenant: Partial<Tenant>): Promise<Tenant> {
    const { data, error } = await this.supabase
      .from('tenants')
      .insert([tenant])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // =====================================================
  // PROJECT CHARTER MANAGEMENT
  // =====================================================

  async getProjectCharters(): Promise<ProjectCharter[]> {
    const { data, error } = await this.supabase
      .from('project_charters')
      .select('*')
      .eq('tenant_id', this.currentTenantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getProjectCharterById(id: string): Promise<ProjectCharter | null> {
    const { data, error } = await this.supabase
      .from('project_charters')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', this.currentTenantId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createProjectCharter(charter: Partial<ProjectCharter>): Promise<ProjectCharter> {
    const charterData = {
      ...charter,
      tenant_id: this.currentTenantId
    };

    const { data, error } = await this.supabase
      .from('project_charters')
      .insert([charterData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateProjectCharter(id: string, updates: Partial<ProjectCharter>): Promise<ProjectCharter> {
    const { data, error } = await this.supabase
      .from('project_charters')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', this.currentTenantId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // =====================================================
  // WORK BREAKDOWN STRUCTURE MANAGEMENT
  // =====================================================

  async getWBSByProject(projectId: string): Promise<WorkBreakdownStructure[]> {
    const { data, error } = await this.supabase
      .from('work_breakdown_structure')
      .select('*')
      .eq('project_id', projectId)
      .eq('tenant_id', this.currentTenantId)
      .order('wbs_code');
    
    if (error) throw error;
    return data || [];
  }

  async createWBSItem(wbs: Partial<WorkBreakdownStructure>): Promise<WorkBreakdownStructure> {
    const wbsData = {
      ...wbs,
      tenant_id: this.currentTenantId
    };

    const { data, error } = await this.supabase
      .from('work_breakdown_structure')
      .insert([wbsData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateWBSItem(id: string, updates: Partial<WorkBreakdownStructure>): Promise<WorkBreakdownStructure> {
    const { data, error } = await this.supabase
      .from('work_breakdown_structure')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', this.currentTenantId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // =====================================================
  // PROJECT SCHEDULE MANAGEMENT
  // =====================================================

  async getProjectSchedule(projectId: string): Promise<ProjectSchedule[]> {
    const { data, error } = await this.supabase
      .from('project_schedule')
      .select('*')
      .eq('project_id', projectId)
      .eq('tenant_id', this.currentTenantId)
      .order('planned_start_date');
    
    if (error) throw error;
    return data || [];
  }

  async getCriticalPath(projectId: string): Promise<ProjectSchedule[]> {
    const { data, error } = await this.supabase
      .from('project_schedule')
      .select('*')
      .eq('project_id', projectId)
      .eq('tenant_id', this.currentTenantId)
      .eq('is_critical_path', true)
      .order('planned_start_date');
    
    if (error) throw error;
    return data || [];
  }

  async createScheduleActivity(activity: Partial<ProjectSchedule>): Promise<ProjectSchedule> {
    const activityData = {
      ...activity,
      tenant_id: this.currentTenantId
    };

    const { data, error } = await this.supabase
      .from('project_schedule')
      .insert([activityData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // =====================================================
  // EARNED VALUE MANAGEMENT
  // =====================================================

  async getEVMData(projectId: string): Promise<EarnedValueManagement[]> {
    const { data, error } = await this.supabase
      .from('earned_value_management')
      .select('*')
      .eq('project_id', projectId)
      .eq('tenant_id', this.currentTenantId)
      .order('measurement_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getLatestEVMData(projectId: string): Promise<EarnedValueManagement | null> {
    const { data, error } = await this.supabase
      .from('earned_value_management')
      .select('*')
      .eq('project_id', projectId)
      .eq('tenant_id', this.currentTenantId)
      .order('measurement_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createEVMRecord(evm: Partial<EarnedValueManagement>): Promise<EarnedValueManagement> {
    const evmData = {
      ...evm,
      tenant_id: this.currentTenantId
    };

    const { data, error } = await this.supabase
      .from('earned_value_management')
      .insert([evmData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // =====================================================
  // RISK MANAGEMENT
  // =====================================================

  async getRisksByProject(projectId: string): Promise<RiskRegister[]> {
    const { data, error } = await this.supabase
      .from('risk_register')
      .select('*')
      .eq('project_id', projectId)
      .eq('tenant_id', this.currentTenantId)
      .order('risk_score', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getHighRisks(projectId: string): Promise<RiskRegister[]> {
    const { data, error } = await this.supabase
      .from('risk_register')
      .select('*')
      .eq('project_id', projectId)
      .eq('tenant_id', this.currentTenantId)
      .in('risk_level', ['high', 'very_high'])
      .eq('status', 'identified')
      .order('risk_score', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createRisk(risk: Partial<RiskRegister>): Promise<RiskRegister> {
    const riskData = {
      ...risk,
      tenant_id: this.currentTenantId
    };

    const { data, error } = await this.supabase
      .from('risk_register')
      .insert([riskData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateRisk(id: string, updates: Partial<RiskRegister>): Promise<RiskRegister> {
    const { data, error } = await this.supabase
      .from('risk_register')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', this.currentTenantId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // =====================================================
  // STAKEHOLDER MANAGEMENT
  // =====================================================

  async getStakeholdersByProject(projectId: string): Promise<StakeholderRegister[]> {
    const { data, error } = await this.supabase
      .from('stakeholder_register')
      .select('*')
      .eq('project_id', projectId)
      .eq('tenant_id', this.currentTenantId)
      .order('influence_level', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getKeyStakeholders(projectId: string): Promise<StakeholderRegister[]> {
    const { data, error } = await this.supabase
      .from('stakeholder_register')
      .select('*')
      .eq('project_id', projectId)
      .eq('tenant_id', this.currentTenantId)
      .eq('stakeholder_type', 'key')
      .order('influence_level', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createStakeholder(stakeholder: Partial<StakeholderRegister>): Promise<StakeholderRegister> {
    const stakeholderData = {
      ...stakeholder,
      tenant_id: this.currentTenantId
    };

    const { data, error } = await this.supabase
      .from('stakeholder_register')
      .insert([stakeholderData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateStakeholder(id: string, updates: Partial<StakeholderRegister>): Promise<StakeholderRegister> {
    const { data, error } = await this.supabase
      .from('stakeholder_register')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', this.currentTenantId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // =====================================================
  // PROJECT PERFORMANCE METRICS
  // =====================================================

  async getProjectPerformanceMetrics(projectId: string): Promise<ProjectPerformanceMetrics[]> {
    const { data, error } = await this.supabase
      .from('project_performance_metrics')
      .select('*')
      .eq('project_id', projectId)
      .eq('tenant_id', this.currentTenantId)
      .order('measurement_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getLatestPerformanceMetrics(projectId: string): Promise<ProjectPerformanceMetrics | null> {
    const { data, error } = await this.supabase
      .from('project_performance_metrics')
      .select('*')
      .eq('project_id', projectId)
      .eq('tenant_id', this.currentTenantId)
      .order('measurement_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createPerformanceMetrics(metrics: Partial<ProjectPerformanceMetrics>): Promise<ProjectPerformanceMetrics> {
    const metricsData = {
      ...metrics,
      tenant_id: this.currentTenantId
    };

    const { data, error } = await this.supabase
      .from('project_performance_metrics')
      .insert([metricsData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // =====================================================
  // DASHBOARD ANALYTICS
  // =====================================================

  async getProjectPortfolioSummary(): Promise<any> {
    const { data: projects, error: projectsError } = await this.supabase
      .from('project_charters')
      .select('*')
      .eq('tenant_id', this.currentTenantId);
    
    if (projectsError) throw projectsError;

    const { data: risks, error: risksError } = await this.supabase
      .from('risk_register')
      .select('*')
      .eq('tenant_id', this.currentTenantId)
      .in('risk_level', ['high', 'very_high']);
    
    if (risksError) throw risksError;

    const { data: evm, error: evmError } = await this.supabase
      .from('earned_value_management')
      .select('*')
      .eq('tenant_id', this.currentTenantId);
    
    if (evmError) throw evmError;

    return {
      totalProjects: projects?.length || 0,
      activeProjects: projects?.filter(p => p.charter_status === 'approved').length || 0,
      highRisks: risks?.length || 0,
      avgCPI: evm?.reduce((sum, e) => sum + (e.cost_performance_index || 0), 0) / (evm?.length || 1),
      avgSPI: evm?.reduce((sum, e) => sum + (e.schedule_performance_index || 0), 0) / (evm?.length || 1)
    };
  }

  async getPMBOKComplianceScore(projectId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('project_performance_metrics')
      .select('overall_pmbok_compliance')
      .eq('project_id', projectId)
      .eq('tenant_id', this.currentTenantId)
      .order('measurement_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data?.overall_pmbok_compliance || 0;
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  async calculateEVMMetrics(projectId: string, measurementDate: string): Promise<Partial<EarnedValueManagement>> {
    // Get project charter for BAC
    const charter = await this.getProjectCharterById(projectId);
    if (!charter) throw new Error('Project charter not found');

    const BAC = charter.approved_budget || charter.estimated_budget || 0;
    
    // Get WBS data for PV and EV calculations
    const wbsItems = await this.getWBSByProject(projectId);
    
    // Calculate PV (Planned Value) based on schedule
    const PV = wbsItems.reduce((sum, item) => {
      // Simplified calculation - in real implementation, this would be based on schedule
      return sum + (item.estimated_cost || 0) * 0.5; // Assume 50% should be complete by now
    }, 0);

    // Calculate EV (Earned Value) based on actual completion
    const EV = wbsItems.reduce((sum, item) => {
      return sum + (item.estimated_cost || 0) * (item.completion_percentage / 100);
    }, 0);

    // For AC (Actual Cost), we'd need actual cost tracking - using estimated for demo
    const AC = EV * 1.1; // Assume 10% cost overrun for demo

    // Calculate variances and indices
    const CV = EV - AC;
    const SV = EV - PV;
    const CPI = AC > 0 ? EV / AC : 1;
    const SPI = PV > 0 ? EV / PV : 1;
    const EAC = BAC / CPI;
    const ETC = EAC - AC;
    const VAC = BAC - EAC;
    const TCPI = (BAC - EV) / (BAC - AC);

    return {
      budget_at_completion: BAC,
      planned_value: PV,
      actual_cost: AC,
      earned_value: EV,
      cost_variance: CV,
      schedule_variance: SV,
      cost_performance_index: CPI,
      schedule_performance_index: SPI,
      estimate_at_completion: EAC,
      estimate_to_complete: ETC,
      variance_at_completion: VAC,
      to_complete_performance_index: TCPI,
      performance_status: CPI >= 1 && SPI >= 1 ? 'on_track' : 
                         CPI >= 0.9 && SPI >= 0.9 ? 'at_risk' : 'critical'
    };
  }

  async calculateRiskScore(probability: number, impact: number): Promise<{ score: number; level: string }> {
    const score = probability * impact;
    let level: string;
    
    if (score <= 5) level = 'very_low';
    else if (score <= 10) level = 'low';
    else if (score <= 15) level = 'medium';
    else if (score <= 20) level = 'high';
    else level = 'very_high';
    
    return { score, level };
  }
}

// =====================================================
// EXPORT DEFAULT INSTANCE
// =====================================================

// Default service instance (you'll need to configure with your Supabase credentials)
export const pmbok = new PMBOKService(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  'DEMO001' // Default tenant - should be dynamic based on user context
);

// Export individual functions for convenience
export const {
  getTenants,
  getProjectCharters,
  createProjectCharter,
  getWBSByProject,
  createWBSItem,
  getProjectSchedule,
  getCriticalPath,
  getEVMData,
  getLatestEVMData,
  getRisksByProject,
  getHighRisks,
  createRisk,
  getStakeholdersByProject,
  getKeyStakeholders,
  createStakeholder,
  getProjectPerformanceMetrics,
  getProjectPortfolioSummary,
  getPMBOKComplianceScore,
  calculateEVMMetrics
} = pmbok;

