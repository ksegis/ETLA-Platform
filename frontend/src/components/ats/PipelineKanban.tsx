/**
 * ATS Pipeline Kanban Component
 * Features: Drag-and-drop candidate management, stage progression, and analytics
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Users, 
  Clock, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  Star,
  MoreHorizontal,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  MessageSquare,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  User
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  position: string;
  stage: string;
  rating: number;
  appliedDate: string;
  lastActivity: string;
  source: string;
  experience: string;
  salary_expectation?: number;
  notes?: string;
  avatar?: string;
  skills: string[];
  status: 'active' | 'on_hold' | 'rejected' | 'hired';
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  candidates: Candidate[];
  description?: string;
}

interface PipelineKanbanProps {
  jobId?: string;
  onCandidateClick?: (candidate: Candidate) => void;
  onStageChange?: (candidateId: string, newStage: string) => void;
  showFilters?: boolean;
  showAnalytics?: boolean;
}

const DEFAULT_STAGES: Omit<PipelineStage, 'candidates'>[] = [
  { id: 'applied', name: 'Applied', color: 'bg-blue-500', order: 1, description: 'New applications' },
  { id: 'screening', name: 'Screening', color: 'bg-yellow-500', order: 2, description: 'Initial review' },
  { id: 'phone_interview', name: 'Phone Interview', color: 'bg-orange-500', order: 3, description: 'Phone screening' },
  { id: 'technical_interview', name: 'Technical Interview', color: 'bg-purple-500', order: 4, description: 'Technical assessment' },
  { id: 'final_interview', name: 'Final Interview', color: 'bg-indigo-500', order: 5, description: 'Final round' },
  { id: 'offer', name: 'Offer', color: 'bg-green-500', order: 6, description: 'Offer extended' },
  { id: 'hired', name: 'Hired', color: 'bg-emerald-500', order: 7, description: 'Successfully hired' }
];

export default function PipelineKanban({
  jobId,
  onCandidateClick,
  onStageChange,
  showFilters = true,
  showAnalytics = true
}: PipelineKanbanProps) {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Mock data for demonstration
  const mockCandidates: Candidate[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      position: 'Senior Software Engineer',
      stage: 'applied',
      rating: 4,
      appliedDate: '2024-01-15',
      lastActivity: '2024-01-15',
      source: 'LinkedIn',
      experience: '5+ years',
      salary_expectation: 150000,
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Bob Chen',
      email: 'bob.chen@email.com',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      position: 'Senior Software Engineer',
      stage: 'screening',
      rating: 5,
      appliedDate: '2024-01-12',
      lastActivity: '2024-01-16',
      source: 'Indeed',
      experience: '7+ years',
      salary_expectation: 160000,
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
      status: 'active'
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol.davis@email.com',
      location: 'Austin, TX',
      position: 'Senior Software Engineer',
      stage: 'phone_interview',
      rating: 4,
      appliedDate: '2024-01-10',
      lastActivity: '2024-01-17',
      source: 'Referral',
      experience: '6+ years',
      skills: ['Java', 'Spring Boot', 'Kubernetes', 'GCP'],
      status: 'active'
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '+1 (555) 345-6789',
      location: 'Seattle, WA',
      position: 'Senior Software Engineer',
      stage: 'technical_interview',
      rating: 3,
      appliedDate: '2024-01-08',
      lastActivity: '2024-01-18',
      source: 'Company Website',
      experience: '4+ years',
      salary_expectation: 140000,
      skills: ['C#', '.NET', 'Azure', 'SQL Server'],
      status: 'active'
    },
    {
      id: '5',
      name: 'Eva Martinez',
      email: 'eva.martinez@email.com',
      location: 'Los Angeles, CA',
      position: 'Senior Software Engineer',
      stage: 'final_interview',
      rating: 5,
      appliedDate: '2024-01-05',
      lastActivity: '2024-01-19',
      source: 'LinkedIn',
      experience: '8+ years',
      skills: ['Go', 'Microservices', 'Redis', 'MongoDB'],
      status: 'active'
    },
    {
      id: '6',
      name: 'Frank Thompson',
      email: 'frank.thompson@email.com',
      phone: '+1 (555) 456-7890',
      location: 'Chicago, IL',
      position: 'Senior Software Engineer',
      stage: 'offer',
      rating: 4,
      appliedDate: '2024-01-03',
      lastActivity: '2024-01-20',
      source: 'Referral',
      experience: '6+ years',
      salary_expectation: 155000,
      skills: ['Ruby', 'Rails', 'PostgreSQL', 'Heroku'],
      status: 'active'
    }
  ];

  // Initialize stages with candidates
  useEffect(() => {
    const stagesWithCandidates = DEFAULT_STAGES.map(stage => ({
      ...stage,
      candidates: mockCandidates.filter(candidate => candidate.stage === stage.id)
    }));
    
    setStages(stagesWithCandidates);
    setLoading(false);
  }, []);

  // Filter candidates based on search and filters
  const filteredStages = useMemo(() => {
    return stages.map(stage => ({
      ...stage,
      candidates: stage.candidates.filter(candidate => {
        const matchesSearch = searchTerm === '' || 
          candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesSource = selectedSource === 'all' || candidate.source === selectedSource;
        const matchesRating = selectedRating === 'all' || candidate.rating.toString() === selectedRating;
        
        return matchesSearch && matchesSource && matchesRating;
      })
    }));
  }, [stages, searchTerm, selectedSource, selectedRating]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const allCandidates = stages.flatMap(stage => stage.candidates);
    const totalCandidates = allCandidates.length;
    const averageRating = totalCandidates > 0 ? 
      allCandidates.reduce((sum, candidate) => sum + candidate.rating, 0) / totalCandidates : 0;
    
    const conversionRates = stages.slice(0, -1).map((stage, index) => {
      const currentStageCount = stage.candidates.length;
      const nextStageCount = stages[index + 1]?.candidates.length || 0;
      const totalInCurrentAndNext = currentStageCount + nextStageCount;
      return {
        from: stage.name,
        to: stages[index + 1]?.name || 'Hired',
        rate: totalInCurrentAndNext > 0 ? (nextStageCount / totalInCurrentAndNext) * 100 : 0
      };
    });

    return {
      totalCandidates,
      averageRating,
      conversionRates,
      sourceBreakdown: allCandidates.reduce((acc, candidate) => {
        acc[candidate.source] = (acc[candidate.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [stages]);

  // Drag and drop handlers
  const handleDragStart = (candidate: Candidate) => {
    setDraggedCandidate(candidate);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    
    if (!draggedCandidate || draggedCandidate.stage === targetStageId) {
      setDraggedCandidate(null);
      setDragOverStage(null);
      return;
    }

    // Update stages
    const updatedStages = stages.map(stage => {
      if (stage.id === draggedCandidate.stage) {
        return {
          ...stage,
          candidates: stage.candidates.filter(c => c.id !== draggedCandidate.id)
        };
      }
      if (stage.id === targetStageId) {
        return {
          ...stage,
          candidates: [...stage.candidates, { ...draggedCandidate, stage: targetStageId }]
        };
      }
      return stage;
    });

    setStages(updatedStages);
    
    // Notify parent component
    if (onStageChange) {
      onStageChange(draggedCandidate.id, targetStageId);
    }

    setDraggedCandidate(null);
    setDragOverStage(null);
  };

  // Get rating stars
  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="flex gap-4 overflow-x-auto">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-80 h-96 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Total Candidates</div>
                <div className="text-2xl font-bold text-gray-900">{analytics.totalCandidates}</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Avg Rating</div>
                <div className="text-2xl font-bold text-gray-900">{analytics.averageRating.toFixed(1)}</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">In Final Stage</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stages.find(s => s.id === 'final_interview')?.candidates.length || 0}
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Offers Extended</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stages.find(s => s.id === 'offer')?.candidates.length || 0}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
            
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sources</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Indeed">Indeed</option>
              <option value="Referral">Referral</option>
              <option value="Company Website">Company Website</option>
            </select>
            
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>
          </div>
        </Card>
      )}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {filteredStages.map((stage) => (
          <div
            key={stage.id}
            className={`flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4 ${
              dragOverStage === stage.id ? 'bg-blue-50 border-2 border-blue-300' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Stage Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {stage.candidates.length}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {stage.description && (
              <p className="text-xs text-gray-500 mb-4">{stage.description}</p>
            )}

            {/* Candidates */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stage.candidates.map((candidate) => (
                <Card
                  key={candidate.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={() => handleDragStart(candidate)}
                  onClick={() => onCandidateClick?.(candidate)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{candidate.name}</h4>
                        <p className="text-xs text-gray-500">{candidate.position}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      {getRatingStars(candidate.rating)}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{candidate.email}</span>
                    </div>

                    {candidate.location && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{candidate.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>Applied {formatDate(candidate.appliedDate)}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {candidate.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.skills.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className="text-xs">
                        {candidate.source}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Calendar className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {stage.candidates.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No candidates in this stage</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
