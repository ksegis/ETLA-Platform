'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import ReactECharts from 'echarts-for-react';

// Types for our reporting data
interface HeadcountData {
  period: string;
  tenant_id: string;
  total_headcount: number;
}

interface StatusDistribution {
  period: string;
  tenant_id: string;
  status: string;
  employee_count: number;
}

interface TerminationAnalysis {
  tenant_id: string;
  termination_type: string;
  termination_reason: string;
  termination_count: number;
}

interface RetentionData {
  period: string;
  tenant_id: string;
  active_employees: number;
  terminated_employees: number;
  turnover_rate_pct: number;
}

interface CurrentSnapshot {
  tenant_id: string;
  employee_code: string;
  employee_name: string;
  status: string;
  last_status_date: string;
  termination_type?: string;
  termination_reason?: string;
}

interface MonthlyChanges {
  period: string;
  tenant_id: string;
  new_hires: number;
  terminations: number;
  status_updates: number;
}

const EmployeeReporting: React.FC = () => {
  const { user } = useAuth();
  const { selectedTenant } = useTenant();
  
  // State for different report data
  const [headcountData, setHeadcountData] = useState<HeadcountData[]>([]);
  const [statusData, setStatusData] = useState<StatusDistribution[]>([]);
  const [terminationData, setTerminationData] = useState<TerminationAnalysis[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionData[]>([]);
  const [currentSnapshot, setCurrentSnapshot] = useState<CurrentSnapshot[]>([]);
  const [monthlyChanges, setMonthlyChanges] = useState<MonthlyChanges[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load all reporting data
  const loadReportingData = async () => {
    if (!selectedTenant?.id) {
      setError('Please select a tenant to view reports');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Loading employee reporting data for tenant:', selectedTenant.id);

      // Load headcount trend data
      const { data: headcount, error: headcountError } = await supabase
        .from('employee_headcount_trend')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('period');

      if (headcountError) {
        console.error('Headcount error:', headcountError);
        throw headcountError;
      }

      // Load status distribution data
      const { data: status, error: statusError } = await supabase
        .from('employee_status_distribution')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('period');

      if (statusError) {
        console.error('Status error:', statusError);
        throw statusError;
      }

      // Load termination analysis data
      const { data: termination, error: terminationError } = await supabase
        .from('termination_reasons_analysis')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('count', { ascending: false });

      if (terminationError) {
        console.error('Termination error:', terminationError);
        // Don't throw - this view might not have data
      }

      // Load retention data
      const { data: retention, error: retentionError } = await supabase
        .from('employee_retention_basic')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('period');

      if (retentionError) {
        console.error('Retention error:', retentionError);
        // Don't throw - this view might not have data
      }

      // Load current employee snapshot
      const { data: snapshot, error: snapshotError } = await supabase
        .from('current_employee_snapshot')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('employee_name');

      if (snapshotError) {
        console.error('Snapshot error:', snapshotError);
        throw snapshotError;
      }

      // Load monthly changes data
      const { data: changes, error: changesError } = await supabase
        .from('monthly_employee_changes')
        .select('*')
        .eq('tenant_id', selectedTenant.id)
        .order('period');

      if (changesError) {
        console.error('Changes error:', changesError);
        // Don't throw - this view might not have data
      }

      // Update state
      setHeadcountData(headcount || []);
      setStatusData(status || []);
      setTerminationData(termination || []);
      setRetentionData(retention || []);
      setCurrentSnapshot(snapshot || []);
      setMonthlyChanges(changes || []);

      console.log('Loaded reporting data:', {
        headcount: headcount?.length,
        status: status?.length,
        termination: termination?.length,
        retention: retention?.length,
        snapshot: snapshot?.length,
        changes: changes?.length
      });

    } catch (err) {
      console.error('Error loading reporting data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reporting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportingData();
  }, [selectedTenant?.id]);

  // Chart configurations
  const getHeadcountChartOption = () => {
    if (!headcountData.length) {
      return {
        title: { text: 'Employee Headcount Trend', left: 'center' },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: { text: 'No data available', fontSize: 16, fill: '#999' }
        }
      };
    }

    const periods = headcountData.map(d => new Date(d.period).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }));
    const counts = headcountData.map(d => d.total_headcount);

    return {
      title: {
        text: 'Employee Headcount Trend',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c} employees'
      },
      xAxis: {
        type: 'category',
        data: periods,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'Headcount'
      },
      series: [{
        data: counts,
        type: 'line',
        smooth: true,
        itemStyle: {
          color: '#3b82f6'
        },
        areaStyle: {
          color: 'rgba(59, 130, 246, 0.1)'
        }
      }]
    };
  };

  const getStatusDistributionChartOption = () => {
    if (!statusData.length) {
      return {
        title: { text: 'Employee Status Distribution', left: 'center' },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: { text: 'No data available', fontSize: 16, fill: '#999' }
        }
      };
    }

    // Get latest period data
    const latestPeriod = statusData.reduce((latest, current) => 
      current.period > latest ? current.period : latest, '');
    
    const latestData = statusData.filter(d => d.period === latestPeriod);
    
    const pieData = latestData.map(d => ({
      name: d.status,
      value: d.employee_count
    }));

    return {
      title: {
        text: 'Current Employee Status Distribution',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [{
        name: 'Employee Status',
        type: 'pie',
        radius: '50%',
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  };

  const getTerminationReasonsChartOption = () => {
    if (!terminationData.length) {
      return {
        title: { text: 'Termination Reasons (Last 12 Months)', left: 'center' },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: { text: 'No termination data available', fontSize: 16, fill: '#999' }
        }
      };
    }

    const reasons = terminationData.map(d => d.termination_reason || 'Unspecified');
    const counts = terminationData.map(d => d.termination_count);

    return {
      title: {
        text: 'Termination Reasons (Last 12 Months)',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: reasons,
        axisLabel: {
          rotate: 45,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        name: 'Count'
      },
      series: [{
        data: counts,
        type: 'bar',
        itemStyle: {
          color: '#ef4444'
        }
      }]
    };
  };

  const getTurnoverRateChartOption = () => {
    if (!retentionData.length) {
      return {
        title: { text: 'Monthly Turnover Rate', left: 'center' },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: { text: 'No retention data available', fontSize: 16, fill: '#999' }
        }
      };
    }

    const periods = retentionData.map(d => new Date(d.period).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }));
    const rates = retentionData.map(d => d.turnover_rate_pct);

    return {
      title: {
        text: 'Monthly Turnover Rate',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}%'
      },
      xAxis: {
        type: 'category',
        data: periods,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'Turnover Rate (%)',
        max: 'dataMax'
      },
      series: [{
        data: rates,
        type: 'line',
        smooth: true,
        itemStyle: {
          color: '#f59e0b'
        },
        lineStyle: {
          width: 3
        }
      }]
    };
  };

  const getHiresVsTerminationsChartOption = () => {
    if (!monthlyChanges.length) {
      return {
        title: { text: 'Monthly Hires vs Terminations', left: 'center' },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: { text: 'No monthly changes data available', fontSize: 16, fill: '#999' }
        }
      };
    }

    const periods = monthlyChanges.map(d => new Date(d.period).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }));
    const hires = monthlyChanges.map(d => d.new_hires);
    const terminations = monthlyChanges.map(d => d.terminations);

    return {
      title: {
        text: 'Monthly Hires vs Terminations',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['New Hires', 'Terminations'],
        top: 30
      },
      xAxis: {
        type: 'category',
        data: periods,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'Count'
      },
      series: [
        {
          name: 'New Hires',
          type: 'bar',
          data: hires,
          itemStyle: {
            color: '#10b981'
          }
        },
        {
          name: 'Terminations',
          type: 'bar',
          data: terminations,
          itemStyle: {
            color: '#ef4444'
          }
        }
      ]
    };
  };

  // Filter current snapshot based on search
  const filteredSnapshot = currentSnapshot.filter(emp =>
    emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary statistics
  const totalEmployees = currentSnapshot.length;
  const activeEmployees = currentSnapshot.filter(emp => emp.status === 'Active').length;
  const terminatedEmployees = currentSnapshot.filter(emp => emp.status === 'Terminated').length;
  const otherStatusEmployees = totalEmployees - activeEmployees - terminatedEmployees;
  const currentTurnoverRate = totalEmployees > 0 ? (terminatedEmployees / totalEmployees * 100).toFixed(1) : '0';

  if (!selectedTenant) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-600">Please select a tenant to view employee reports</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Employee Reporting</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive employee analytics and insights for {selectedTenant.name}
          </p>
        </div>
        <Button onClick={loadReportingData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">⚠️ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalEmployees}</div>
            <p className="text-xs text-blue-600 mt-1">All employee records</p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
            <p className="text-xs text-green-600 mt-1">Currently employed</p>
          </CardContent>
        </Card>
        
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Terminated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{terminatedEmployees}</div>
            <p className="text-xs text-red-600 mt-1">No longer employed</p>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Turnover Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{currentTurnoverRate}%</div>
            <p className="text-xs text-orange-600 mt-1">Historical rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: '📈 Overview', icon: '📈' },
            { id: 'trends', label: '📊 Trends', icon: '📊' },
            { id: 'terminations', label: '🚪 Terminations', icon: '🚪' },
            { id: 'employees', label: '👥 Employee List', icon: '👥' },
            { id: 'analytics', label: '🔍 Analytics', icon: '🔍' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading employee data...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching reports from database...</div>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>📈 Headcount Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts 
                    option={getHeadcountChartOption()} 
                    style={{ height: '300px' }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🥧 Employee Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts 
                    option={getStatusDistributionChartOption()} 
                    style={{ height: '300px' }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Monthly Hires vs Terminations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts 
                    option={getHiresVsTerminationsChartOption()} 
                    style={{ height: '300px' }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📉 Turnover Rate Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts 
                    option={getTurnoverRateChartOption()} 
                    style={{ height: '300px' }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>📈 Employee Headcount Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts 
                    option={getHeadcountChartOption()} 
                    style={{ height: '400px' }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Monthly Employee Changes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts 
                    option={getHiresVsTerminationsChartOption()} 
                    style={{ height: '400px' }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📉 Monthly Turnover Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts 
                    option={getTurnoverRateChartOption()} 
                    style={{ height: '400px' }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Terminations Tab */}
          {activeTab === 'terminations' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>🚪 Termination Reasons Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts 
                    option={getTerminationReasonsChartOption()} 
                    style={{ height: '400px' }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📋 Termination Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {terminationData.length > 0 ? (
                      terminationData.map((term, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{term.termination_reason || 'Unspecified'}</div>
                            <div className="text-sm text-gray-600">Type: {term.termination_type || 'N/A'}</div>
                          </div>
                          <Badge variant="secondary">{term.termination_count} employees</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No termination data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Employee List Tab */}
          {activeTab === 'employees' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>👥 Employee Directory</CardTitle>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                    <Badge variant="outline">{filteredSnapshot.length} employees</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredSnapshot.length > 0 ? (
                      filteredSnapshot.map((employee) => (
                        <div key={employee.employee_code} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                          <div>
                            <div className="font-medium">{employee.employee_name}</div>
                            <div className="text-sm text-gray-600">Code: {employee.employee_code}</div>
                            <div className="text-sm text-gray-600">Last Updated: {new Date(employee.last_status_date).toLocaleDateString()}</div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={employee.status === 'Active' ? 'default' : 'secondary'}
                              className={employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {employee.status}
                            </Badge>
                            {employee.termination_reason && (
                              <div className="text-xs text-gray-500 mt-1">
                                Reason: {employee.termination_reason}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        {searchTerm ? 'No employees found matching your search' : 'No employee data available'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>📊 Status Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Active</span>
                        <span className="font-bold text-green-600">{activeEmployees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Terminated</span>
                        <span className="font-bold text-red-600">{terminatedEmployees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other Status</span>
                        <span className="font-bold text-gray-600">{otherStatusEmployees}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>📈 Growth Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Hires</span>
                        <span className="font-bold text-blue-600">
                          {monthlyChanges.reduce((sum, m) => sum + m.new_hires, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Terms</span>
                        <span className="font-bold text-red-600">
                          {monthlyChanges.reduce((sum, m) => sum + m.terminations, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Growth</span>
                        <span className="font-bold text-green-600">
                          {monthlyChanges.reduce((sum, m) => sum + m.new_hires - m.terminations, 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>🎯 Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>• {activeEmployees} active employees</div>
                      <div>• {currentTurnoverRate}% turnover rate</div>
                      <div>• {terminationData.length} termination reasons tracked</div>
                      <div>• {headcountData.length} months of data</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>📋 Data Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">{headcountData.length}</div>
                      <div className="text-sm text-blue-600">Months of Headcount Data</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">{statusData.length}</div>
                      <div className="text-sm text-green-600">Status Records</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded">
                      <div className="text-2xl font-bold text-red-600">{terminationData.length}</div>
                      <div className="text-sm text-red-600">Termination Categories</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded">
                      <div className="text-2xl font-bold text-orange-600">{retentionData.length}</div>
                      <div className="text-sm text-orange-600">Retention Periods</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeReporting;

