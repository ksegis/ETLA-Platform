'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  RefreshCw, 
  Search, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Target,
  Briefcase,
  Activity,
  Shield,
  UserCheck,
  Award
} from 'lucide-react';
import { pmbok, ProjectCharter, RiskRegister, StakeholderRegister, EarnedValueManagement } from '@/services/pmbok_service';

interface ProjectPortfolioSummary {
  totalProjects: number;
  activeProjects: number;
  highRisks: number;
  avgCPI: number;
  avgSPI: number;
}

export default function ProjectManagement() {
  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(true);
  const [portfolioSummary, setPortfolioSummary] = useState<ProjectPortfolioSummary | null>(null);
  const [projectCharters, setProjectCharters] = useState<ProjectCharter[]>([]);
  const [risks, setRisks] = useState<RiskRegister[]>([]);
  const [stakeholders, setStakeholderRegister] = useState<StakeholderRegister[]>([]);
  const [evmData, setEvmData] = useState<EarnedValueManagement[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load portfolio summary
      const summary = await pmbok.getProjectPortfolioSummary();
      setPortfolioSummary(summary);
      
      // Load project charters
      const charters = await pmbok.getProjectCharters();
      setProjectCharters(charters);
      
      // Load high risks across all projects
      if (charters.length > 0) {
        const allRisks = await Promise.all(
          charters.map(charter => pmbok.getRisksByProject(charter.id))
        );
        setRisks(allRisks.flat());
        
        // Load stakeholders for first project
        if (charters[0]) {
          const stakeholderData = await pmbok.getStakeholdersByProject(charters[0].id);
          setStakeholderRegister(stakeholderData);
        }
        
        // Load EVM data for first project
        if (charters[0]) {
          const evm = await pmbok.getEVMData(charters[0].id);
          setEvmData(evm);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'charter', label: 'Charter', icon: FileText },
    { id: 'wbs', label: 'WBS', icon: BarChart3 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'evm', label: 'EVM', icon: TrendingUp },
    { id: 'risks', label: 'Risks', icon: AlertTriangle },
    { id: 'stakeholders', label: 'Stakeholders', icon: Users },
    { id: 'compliance', label: 'Compliance', icon: Award }
  ];

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Loading PMBOK data...</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{portfolioSummary?.totalProjects || 0}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-green-600">{portfolioSummary?.activeProjects || 0}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg CPI</p>
                    <p className="text-2xl font-bold text-blue-600">{(portfolioSummary?.avgCPI || 0).toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">High Risks</p>
                    <p className="text-2xl font-bold text-red-600">{portfolioSummary?.highRisks || 0}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Project Portfolio</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projectCharters.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.project_name}</div>
                            <div className="text-sm text-gray-500">{project.project_code}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.project_manager || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            project.charter_status === 'approved' ? 'bg-green-100 text-green-800' :
                            project.charter_status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                            project.charter_status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {project.charter_status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(project.approved_budget || project.estimated_budget || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.planned_start_date && project.planned_end_date ? 
                            `${new Date(project.planned_start_date).toLocaleDateString()} - ${new Date(project.planned_end_date).toLocaleDateString()}` :
                            'TBD'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-purple-600 hover:text-purple-900 mr-3">View</button>
                          <button className="text-gray-600 hover:text-gray-900">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'charter':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Charters</h3>
              <div className="space-y-4">
                {projectCharters.map((charter) => (
                  <div key={charter.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{charter.project_name}</h4>
                        <p className="text-sm text-gray-600">{charter.project_code}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        charter.charter_status === 'approved' ? 'bg-green-100 text-green-800' :
                        charter.charter_status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {charter.charter_status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Sponsor</p>
                        <p className="text-sm text-gray-600">{charter.project_sponsor || 'TBD'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Manager</p>
                        <p className="text-sm text-gray-600">{charter.project_manager || 'TBD'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Budget</p>
                        <p className="text-sm text-gray-600">${(charter.approved_budget || charter.estimated_budget || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Timeline</p>
                        <p className="text-sm text-gray-600">
                          {charter.planned_start_date && charter.planned_end_date ? 
                            `${new Date(charter.planned_start_date).toLocaleDateString()} - ${new Date(charter.planned_end_date).toLocaleDateString()}` :
                            'TBD'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {charter.business_case && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700">Business Case</p>
                        <p className="text-sm text-gray-600">{charter.business_case}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                        View Details
                      </button>
                      <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                        Edit Charter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'evm':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {evmData.slice(0, 1).map((evm) => (
                <React.Fragment key={evm.id}>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Cost Performance Index</p>
                        <p className={`text-2xl font-bold ${(evm.cost_performance_index || 0) >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                          {(evm.cost_performance_index || 0).toFixed(3)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Schedule Performance Index</p>
                        <p className={`text-2xl font-bold ${(evm.schedule_performance_index || 0) >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                          {(evm.schedule_performance_index || 0).toFixed(3)}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Estimate at Completion</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${(evm.estimate_at_completion || 0).toLocaleString()}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Performance Status</p>
                        <p className={`text-lg font-bold ${
                          evm.performance_status === 'on_track' ? 'text-green-600' :
                          evm.performance_status === 'at_risk' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {evm.performance_status.replace('_', ' ')}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Earned Value Analysis</h3>
              </div>
              <div className="p-6">
                {evmData.length > 0 ? (
                  <div className="space-y-4">
                    {evmData.map((evm) => (
                      <div key={evm.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Measurement Date</p>
                          <p className="text-sm text-gray-600">{new Date(evm.measurement_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Planned Value (PV)</p>
                          <p className="text-sm text-gray-600">${(evm.planned_value || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Earned Value (EV)</p>
                          <p className="text-sm text-gray-600">${(evm.earned_value || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Actual Cost (AC)</p>
                          <p className="text-sm text-gray-600">${(evm.actual_cost || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Cost Variance</p>
                          <p className={`text-sm font-medium ${(evm.cost_variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${(evm.cost_variance || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Schedule Variance</p>
                          <p className={`text-sm font-medium ${(evm.schedule_variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${(evm.schedule_variance || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No EVM data available. Create project measurements to track earned value.</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'risks':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Risk Register</h3>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Risk
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {risks.map((risk) => (
                      <tr key={risk.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{risk.risk_title}</div>
                            <div className="text-sm text-gray-500">{risk.risk_code}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {risk.risk_category || 'General'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {risk.probability_rating || 'N/A'}/5
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {risk.impact_rating || 'N/A'}/5
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            risk.risk_level === 'very_high' ? 'bg-red-100 text-red-800' :
                            risk.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                            risk.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {risk.risk_level?.replace('_', ' ') || 'unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {risk.risk_owner || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {risk.status.replace('_', ' ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'stakeholders':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Stakeholder Register</h3>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stakeholder
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stakeholder</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Influence</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attitude</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stakeholders.map((stakeholder) => (
                      <tr key={stakeholder.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{stakeholder.stakeholder_name}</div>
                            <div className="text-sm text-gray-500">{stakeholder.stakeholder_title}</div>
                            <div className="text-sm text-gray-500">{stakeholder.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stakeholder.project_role || 'TBD'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            stakeholder.stakeholder_type === 'key' ? 'bg-purple-100 text-purple-800' :
                            stakeholder.stakeholder_type === 'primary' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {stakeholder.stakeholder_type || 'general'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stakeholder.influence_level || 'N/A'}/5
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stakeholder.interest_level || 'N/A'}/5
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            stakeholder.attitude === 'supportive' ? 'bg-green-100 text-green-800' :
                            stakeholder.attitude === 'neutral' ? 'bg-yellow-100 text-yellow-800' :
                            stakeholder.attitude === 'resistant' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {stakeholder.attitude || 'unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stakeholder.engagement_status.replace('_', ' ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'wbs':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Breakdown Structure</h3>
              <p className="text-gray-600 mb-4">Interactive WBS builder coming soon. This will allow hierarchical decomposition of project work into manageable components.</p>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Create WBS
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Import Template
                </button>
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Schedule & Critical Path</h3>
              <p className="text-gray-600 mb-4">CPM scheduling with critical path analysis coming soon. This will provide Gantt charts, dependency management, and resource allocation.</p>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Create Schedule
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  View Critical Path
                </button>
              </div>
            </div>
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">PMBOK Compliance Dashboard</h3>
              <p className="text-gray-600 mb-4">PMBOK 7th Edition compliance scoring and assessment tools coming soon. This will track adherence to the 5 Process Groups and 10 Knowledge Areas.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Process Groups</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Initiating</li>
                    <li>• Planning</li>
                    <li>• Executing</li>
                    <li>• Monitoring & Controlling</li>
                    <li>• Closing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Knowledge Areas</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Integration Management</li>
                    <li>• Scope Management</li>
                    <li>• Schedule Management</li>
                    <li>• Cost Management</li>
                    <li>• Quality Management</li>
                    <li>• Resource Management</li>
                    <li>• Communications Management</li>
                    <li>• Risk Management</li>
                    <li>• Procurement Management</li>
                    <li>• Stakeholder Management</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
            <p className="text-gray-600">This PMBOK feature is under development and will be available soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600">PMBOK 7th Edition compliant project management for enterprise teams</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}

