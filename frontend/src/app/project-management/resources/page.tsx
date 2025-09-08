'use client'

import { useState } from 'react'
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Calendar,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Award,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  phone: string
  avatar?: string
  skills: string[]
  availability: 'available' | 'busy' | 'vacation' | 'sick'
  currentProjects: Array<{
    id: string
    title: string
    hoursAllocated: number
    hoursCompleted: number
    endDate: string
  }>
  weeklyCapacity: number
  currentWorkload: number
  utilizationRate: number
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Senior Consultant',
    email: 'sarah.johnson@etla.com',
    phone: '+1 (555) 123-4567',
    skills: ['Benefits Administration', 'HRIS Integration', 'Compliance', 'Project Management'],
    availability: 'busy',
    currentProjects: [
      {
        id: '1',
        title: 'Payroll System Integration',
        hoursAllocated: 40,
        hoursCompleted: 24,
        endDate: '2024-08-30'
      }
    ],
    weeklyCapacity: 40,
    currentWorkload: 35,
    utilizationRate: 87.5
  },
  {
    id: '2',
    name: 'Mike Chen',
    role: 'Technical Lead',
    email: 'mike.chen@etla.com',
    phone: '+1 (555) 234-5678',
    skills: ['System Integration', 'Data Migration', 'API Development', 'Database Design'],
    availability: 'busy',
    currentProjects: [
      {
        id: '4',
        title: 'Data Migration Project',
        hoursAllocated: 80,
        hoursCompleted: 0,
        endDate: '2024-09-10'
      }
    ],
    weeklyCapacity: 40,
    currentWorkload: 40,
    utilizationRate: 100
  },
  {
    id: '3',
    name: 'Lisa Wang',
    role: 'Project Manager',
    email: 'lisa.wang@etla.com',
    phone: '+1 (555) 345-6789',
    skills: ['Project Management', 'Client Relations', 'Reporting', 'Process Optimization'],
    availability: 'available',
    currentProjects: [
      {
        id: '5',
        title: 'Custom Reporting Dashboard',
        hoursAllocated: 50,
        hoursCompleted: 0,
        endDate: '2024-09-15'
      }
    ],
    weeklyCapacity: 40,
    currentWorkload: 25,
    utilizationRate: 62.5
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Developer',
    email: 'david.kim@etla.com',
    phone: '+1 (555) 456-7890',
    skills: ['Frontend Development', 'UI/UX Design', 'Workflow Automation', 'Testing'],
    availability: 'available',
    currentProjects: [
      {
        id: '6',
        title: 'Benefits Configuration',
        hoursAllocated: 20,
        hoursCompleted: 0,
        endDate: '2024-09-12'
      }
    ],
    weeklyCapacity: 40,
    currentWorkload: 20,
    utilizationRate: 50
  },
  {
    id: '5',
    name: 'Emily Rodriguez',
    role: 'Compliance Specialist',
    email: 'emily.rodriguez@etla.com',
    phone: '+1 (555) 567-8901',
    skills: ['Compliance Auditing', 'Regulatory Requirements', 'Documentation', 'Risk Assessment'],
    availability: 'vacation',
    currentProjects: [],
    weeklyCapacity: 40,
    currentWorkload: 0,
    utilizationRate: 0
  },
  {
    id: '6',
    name: 'James Wilson',
    role: 'Data Analyst',
    email: 'james.wilson@etla.com',
    phone: '+1 (555) 678-9012',
    skills: ['Data Analysis', 'Reporting', 'SQL', 'Business Intelligence'],
    availability: 'available',
    currentProjects: [],
    weeklyCapacity: 40,
    currentWorkload: 10,
    utilizationRate: 25
  }
]

const availabilityConfig = {
  available: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  busy: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
  vacation: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
  sick: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle }
}

export default function TeamResourcesPage() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [filterAvailability, setFilterAvailability] = useState('all')
  const [filterSkill, setFilterSkill] = useState('all')

  const filteredMembers = mockTeamMembers.filter((member: any: any) => {
    const matchesAvailability = filterAvailability === 'all' || member.availability === filterAvailability
    const matchesSkill = filterSkill === 'all' || member.skills.some((skill: any: any) => 
      skill.toLowerCase().includes(filterSkill.toLowerCase())
    )
    return matchesAvailability && matchesSkill
  })

  const allSkills = Array.from(new Set(mockTeamMembers.flatMap((member: any) => member.skills)))

  const getTeamStats = () => {
    const totalCapacity = mockTeamMembers.reduce((sum: any, member: any) => sum + member.weeklyCapacity, 0)
    const totalWorkload = mockTeamMembers.reduce((sum: any, member: any) => sum + member.currentWorkload, 0)
    const availableMembers = mockTeamMembers.filter((member: any: any) => member.availability === 'available').length
    const avgUtilization = mockTeamMembers.reduce((sum: any, member: any) => sum + member.utilizationRate, 0) / mockTeamMembers.length

    return { totalCapacity, totalWorkload, availableMembers, avgUtilization }
  }

  const stats = getTeamStats()

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600'
    if (rate >= 75) return 'text-orange-600'
    if (rate >= 50) return 'text-blue-600'
    return 'text-green-600'
  }

  const getUtilizationBg = (rate: number) => {
    if (rate >= 90) return 'bg-red-500'
    if (rate >= 75) return 'bg-orange-500'
    if (rate >= 50) return 'bg-blue-500'
    return 'bg-green-500'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/project-management'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Resources</h1>
            <p className="text-gray-600">Manage team capacity and workload allocation</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => window.location.href = '/project-management/schedule'}
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule View
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">{mockTeamMembers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableMembers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Workload</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalWorkload}h</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgUtilization.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={filterAvailability}
            onChange={(e: any) => setFilterAvailability(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="vacation">On Vacation</option>
            <option value="sick">Sick Leave</option>
          </select>
          
          <select
            value={filterSkill}
            onChange={(e: any) => setFilterSkill(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Skills</option>
            {allSkills.map((skill: any: any) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Members List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredMembers.map((member: any: any) => {
                const AvailabilityIcon = availabilityConfig[member.availability as keyof typeof availabilityConfig as keyof typeof availabilityConfig as keyof typeof availabilityConfig].icon
                return (
                  <div 
                    key={member.id} 
                    className={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${
                      selectedMember?.id === member.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.role}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${availabilityConfig[member.availability as keyof typeof availabilityConfig as keyof typeof availabilityConfig as keyof typeof availabilityConfig].color}`}>
                              <AvailabilityIcon className="h-3 w-3 mr-1" />
                              {member.availability.charAt(0).toUpperCase() + member.availability.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-600">Utilization:</span>
                          <span className={`text-sm font-semibold ${getUtilizationColor(member.utilizationRate)}`}>
                            {member.utilizationRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getUtilizationBg(member.utilizationRate)}`}
                            style={{ width: `${Math.min(member.utilizationRate, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {member.currentWorkload}h / {member.weeklyCapacity}h
                        </div>
                      </div>
                    </div>
                    
                    {/* Skills */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {member.skills.slice(0, 4).map((skill: any: any) => (
                        <span key={skill} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 4 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          +{member.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Member Details Sidebar */}
        <div className="space-y-6">
          {selectedMember ? (
            <>
              {/* Contact Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{selectedMember.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{selectedMember.phone}</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <Award className="h-5 w-5 inline mr-2" />
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.skills.map((skill: any: any) => (
                    <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Projects */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Projects</h3>
                {selectedMember.currentProjects.length === 0 ? (
                  <p className="text-gray-500 text-sm">No active projects</p>
                ) : (
                  <div className="space-y-4">
                    {selectedMember.currentProjects.map((project: any: any) => (
                      <div key={project.id} className="border rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 mb-2">{project.title}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-900">
                              {project.hoursCompleted}h / {project.hoursAllocated}h
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min((project.hoursCompleted / project.hoursAllocated) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Due: {new Date(project.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Workload Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <BarChart3 className="h-5 w-5 inline mr-2" />
                  Workload Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Weekly Capacity</span>
                    <span className="text-sm font-medium text-gray-900">{selectedMember.weeklyCapacity}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Workload</span>
                    <span className="text-sm font-medium text-gray-900">{selectedMember.currentWorkload}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Available Hours</span>
                    <span className="text-sm font-medium text-green-600">
                      {selectedMember.weeklyCapacity - selectedMember.currentWorkload}h
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Utilization Rate</span>
                    <span className={`text-sm font-medium ${getUtilizationColor(selectedMember.utilizationRate)}`}>
                      {selectedMember.utilizationRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Team Member</h3>
              <p className="text-gray-600">Click on a team member to view their details and current workload.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

