/**
 * ROM Questionnaire Builder Component
 * Features: Drag-and-drop question builder, templates, conditional logic, and preview
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Plus,
  Save,
  Eye,
  Copy,
  Trash2,
  Settings,
  Move,
  ChevronUp,
  ChevronDown,
  Type,
  List,
  CheckSquare,
  Circle,
  Star,
  Calendar,
  Hash,
  FileText,
  Image,
  Video,
  Link,
  BarChart3,
  Zap,
  Layout,
  Palette,
  Globe,
  Users,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  Edit,
  Download,
  Upload
} from 'lucide-react';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'multiple_choice' | 'checkbox' | 'rating' | 'date' | 'number' | 'email' | 'phone' | 'file' | 'image' | 'video' | 'url' | 'matrix' | 'ranking';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  conditional?: {
    dependsOn: string;
    condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: string | number;
  };
  settings?: {
    placeholder?: string;
    allowOther?: boolean;
    randomizeOptions?: boolean;
    maxSelections?: number;
    scale?: { min: number; max: number; labels?: string[] };
  };
}

interface Questionnaire {
  id?: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  questions: Question[];
  settings: {
    allowAnonymous: boolean;
    requireLogin: boolean;
    multipleSubmissions: boolean;
    showProgressBar: boolean;
    randomizeQuestions: boolean;
    autoSave: boolean;
    theme: string;
    language: string;
    timeLimit?: number;
    startDate?: string;
    endDate?: string;
  };
  branding?: {
    logo?: string;
    primaryColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
  };
}

interface QuestionnaireBuilderProps {
  initialQuestionnaire?: Questionnaire;
  onSave?: (questionnaire: Questionnaire) => void;
  onPreview?: (questionnaire: Questionnaire) => void;
  onPublish?: (questionnaire: Questionnaire) => void;
  templates?: Questionnaire[];
}

const QUESTION_TYPES = [
  { type: 'text', label: 'Short Text', icon: Type, description: 'Single line text input' },
  { type: 'textarea', label: 'Long Text', icon: FileText, description: 'Multi-line text area' },
  { type: 'multiple_choice', label: 'Multiple Choice', icon: Circle, description: 'Single selection from options' },
  { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare, description: 'Multiple selections allowed' },
  { type: 'rating', label: 'Rating Scale', icon: Star, description: 'Star or numeric rating' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { type: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
  { type: 'email', label: 'Email', icon: Type, description: 'Email address validation' },
  { type: 'phone', label: 'Phone', icon: Type, description: 'Phone number input' },
  { type: 'file', label: 'File Upload', icon: Upload, description: 'File attachment' },
  { type: 'image', label: 'Image Upload', icon: Image, description: 'Image file upload' },
  { type: 'url', label: 'Website URL', icon: Link, description: 'URL validation' },
  { type: 'matrix', label: 'Matrix/Grid', icon: Layout, description: 'Grid of questions' },
  { type: 'ranking', label: 'Ranking', icon: List, description: 'Drag to rank items' }
];

const QUESTIONNAIRE_TEMPLATES = [
  {
    name: 'Employee Satisfaction Survey',
    category: 'HR',
    description: 'Comprehensive employee satisfaction and engagement survey',
    questions: 15
  },
  {
    name: 'Customer Feedback Form',
    category: 'Customer Service',
    description: 'Collect customer feedback and satisfaction ratings',
    questions: 10
  },
  {
    name: 'Training Evaluation',
    category: 'Training',
    description: 'Evaluate training program effectiveness',
    questions: 12
  },
  {
    name: 'Exit Interview',
    category: 'HR',
    description: 'Structured exit interview questionnaire',
    questions: 18
  },
  {
    name: 'Performance Review',
    category: 'Performance',
    description: 'Employee performance evaluation form',
    questions: 20
  }
];

export default function QuestionnaireBuilder({
  initialQuestionnaire,
  onSave,
  onPreview,
  onPublish,
  templates = QUESTIONNAIRE_TEMPLATES
}: QuestionnaireBuilderProps) {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>({
    title: 'New Questionnaire',
    description: '',
    category: 'General',
    status: 'draft',
    questions: [],
    settings: {
      allowAnonymous: true,
      requireLogin: false,
      multipleSubmissions: false,
      showProgressBar: true,
      randomizeQuestions: false,
      autoSave: true,
      theme: 'default',
      language: 'en'
    }
  });

  const [activeTab, setActiveTab] = useState<'build' | 'settings' | 'preview'>('build');
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Initialize with provided questionnaire
  useEffect(() => {
    if (initialQuestionnaire) {
      setQuestionnaire(initialQuestionnaire);
    }
  }, [initialQuestionnaire]);

  // Auto-save functionality
  useEffect(() => {
    if (questionnaire.settings.autoSave && unsavedChanges) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [questionnaire, unsavedChanges]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleQuestionnaireChange = (updates: Partial<Questionnaire>) => {
    setQuestionnaire(prev => ({ ...prev, ...updates }));
    setUnsavedChanges(true);
  };

  const handleAddQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: generateId(),
      type,
      title: `New ${QUESTION_TYPES.find(qt => qt.type === type)?.label || 'Question'}`,
      required: false,
      options: ['multiple_choice', 'checkbox', 'matrix', 'ranking'].includes(type) 
        ? ['Option 1', 'Option 2', 'Option 3'] 
        : undefined,
      settings: type === 'rating' 
        ? { scale: { min: 1, max: 5, labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] } }
        : {}
    };

    setQuestionnaire(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setSelectedQuestion(newQuestion.id);
    setUnsavedChanges(true);
  };

  const handleUpdateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
    setUnsavedChanges(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
    if (selectedQuestion === questionId) {
      setSelectedQuestion(null);
    }
    setUnsavedChanges(true);
  };

  const handleDuplicateQuestion = (questionId: string) => {
    const question = questionnaire.questions.find(q => q.id === questionId);
    if (question) {
      const duplicatedQuestion = {
        ...question,
        id: generateId(),
        title: `${question.title} (Copy)`
      };
      
      const questionIndex = questionnaire.questions.findIndex(q => q.id === questionId);
      const newQuestions = [...questionnaire.questions];
      newQuestions.splice(questionIndex + 1, 0, duplicatedQuestion);
      
      setQuestionnaire(prev => ({
        ...prev,
        questions: newQuestions
      }));
      setUnsavedChanges(true);
    }
  };

  const handleMoveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const questions = [...questionnaire.questions];
    const currentIndex = questions.findIndex(q => q.id === questionId);
    
    if (direction === 'up' && currentIndex > 0) {
      [questions[currentIndex], questions[currentIndex - 1]] = [questions[currentIndex - 1], questions[currentIndex]];
    } else if (direction === 'down' && currentIndex < questions.length - 1) {
      [questions[currentIndex], questions[currentIndex + 1]] = [questions[currentIndex + 1], questions[currentIndex]];
    }
    
    setQuestionnaire(prev => ({ ...prev, questions }));
    setUnsavedChanges(true);
  };

  const handleDragStart = (questionId: string) => {
    setDraggedQuestion(questionId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetQuestionId: string) => {
    e.preventDefault();
    
    if (!draggedQuestion || draggedQuestion === targetQuestionId) {
      setDraggedQuestion(null);
      return;
    }

    const questions = [...questionnaire.questions];
    const draggedIndex = questions.findIndex(q => q.id === draggedQuestion);
    const targetIndex = questions.findIndex(q => q.id === targetQuestionId);
    
    const [draggedItem] = questions.splice(draggedIndex, 1);
    questions.splice(targetIndex, 0, draggedItem);
    
    setQuestionnaire(prev => ({ ...prev, questions }));
    setDraggedQuestion(null);
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(questionnaire);
    }
    setUnsavedChanges(false);
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(questionnaire);
    }
  };

  const handlePublish = () => {
    if (onPublish) {
      const publishedQuestionnaire = {
        ...questionnaire,
        status: 'published' as const
      };
      onPublish(publishedQuestionnaire);
      setQuestionnaire(publishedQuestionnaire);
    }
    setUnsavedChanges(false);
  };

  const handleLoadTemplate = (template: any) => {
    // In a real implementation, this would load the full template
    setQuestionnaire(prev => ({
      ...prev,
      title: template.name,
      description: template.description,
      category: template.category
    }));
    setShowTemplates(false);
    setUnsavedChanges(true);
  };

  const selectedQuestionData = questionnaire.questions.find(q => q.id === selectedQuestion);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Question Types */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Question Types</h2>
          <p className="text-sm text-gray-600 mt-1">Drag or click to add questions</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {QUESTION_TYPES.map((questionType) => (
              <Card
                key={questionType.type}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                onClick={() => handleAddQuestion(questionType.type)}
              >
                <div className="flex items-center gap-3">
                  <questionType.icon className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">{questionType.label}</div>
                    <div className="text-xs text-gray-500">{questionType.description}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowTemplates(true)}
              className="w-full flex items-center gap-2"
            >
              <Layout className="h-4 w-4" />
              Load Template
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                value={questionnaire.title}
                onChange={(e) => handleQuestionnaireChange({ title: e.target.value })}
                className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 p-0"
                placeholder="Questionnaire Title"
              />
              <input
                type="text"
                value={questionnaire.description}
                onChange={(e) => handleQuestionnaireChange({ description: e.target.value })}
                className="text-gray-600 bg-transparent border-none outline-none focus:ring-0 p-0 mt-1 w-full"
                placeholder="Add a description..."
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant={questionnaire.status === 'published' ? 'default' : 'secondary'}>
                {questionnaire.status}
              </Badge>
              {unsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Unsaved Changes
                </Badge>
              )}
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={handlePublish}>
                <Globe className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-6 mt-6">
            <button
              onClick={() => setActiveTab('build')}
              className={`pb-2 border-b-2 font-medium text-sm ${
                activeTab === 'build'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Build
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-2 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`pb-2 border-b-2 font-medium text-sm ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'build' && (
            <div className="flex h-full">
              {/* Questions List */}
              <div className="flex-1 overflow-y-auto p-6">
                {questionnaire.questions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                    <p className="text-gray-600 mb-4">Start building your questionnaire by adding questions from the sidebar.</p>
                    <Button onClick={() => handleAddQuestion('text')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Question
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questionnaire.questions.map((question, index) => (
                      <Card
                        key={question.id}
                        className={`p-6 cursor-pointer transition-all ${
                          selectedQuestion === question.id
                            ? 'ring-2 ring-blue-500 shadow-md'
                            : 'hover:shadow-md'
                        }`}
                        draggable
                        onDragStart={() => handleDragStart(question.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, question.id)}
                        onClick={() => setSelectedQuestion(question.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-gray-500">
                                Q{index + 1}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {QUESTION_TYPES.find(qt => qt.type === question.type)?.label}
                              </Badge>
                              {question.required && (
                                <Badge variant="outline" className="text-xs text-red-600 border-red-600">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{question.title}</h4>
                            {question.description && (
                              <p className="text-sm text-gray-600 mb-2">{question.description}</p>
                            )}
                            
                            {/* Question Preview */}
                            <div className="mt-3">
                              {question.type === 'multiple_choice' && question.options && (
                                <div className="space-y-1">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2 text-sm text-gray-600">
                                      <Circle className="h-3 w-3" />
                                      {option}
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {question.type === 'checkbox' && question.options && (
                                <div className="space-y-1">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2 text-sm text-gray-600">
                                      <CheckSquare className="h-3 w-3" />
                                      {option}
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {question.type === 'rating' && question.settings?.scale && (
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: question.settings.scale.max - question.settings.scale.min + 1 }, (_, i) => (
                                    <Star key={i} className="h-4 w-4 text-gray-300" />
                                  ))}
                                </div>
                              )}
                              
                              {['text', 'textarea', 'email', 'phone', 'number', 'url'].includes(question.type) && (
                                <div className="text-sm text-gray-400 italic">
                                  {question.settings?.placeholder || `${question.type} input field`}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveQuestion(question.id, 'up');
                              }}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveQuestion(question.id, 'down');
                              }}
                              disabled={index === questionnaire.questions.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateQuestion(question.id);
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuestion(question.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Question Editor */}
              {selectedQuestionData && (
                <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Question</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedQuestion(null)}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Question Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Title
                      </label>
                      <input
                        type="text"
                        value={selectedQuestionData.title}
                        onChange={(e) => handleUpdateQuestion(selectedQuestionData.id, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* Question Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        value={selectedQuestionData.description || ''}
                        onChange={(e) => handleUpdateQuestion(selectedQuestionData.id, { description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    
                    {/* Required Toggle */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="required"
                        checked={selectedQuestionData.required}
                        onChange={(e) => handleUpdateQuestion(selectedQuestionData.id, { required: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="required" className="text-sm font-medium text-gray-700">
                        Required Question
                      </label>
                    </div>
                    
                    {/* Options for Multiple Choice/Checkbox */}
                    {['multiple_choice', 'checkbox', 'ranking'].includes(selectedQuestionData.type) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options
                        </label>
                        <div className="space-y-2">
                          {selectedQuestionData.options?.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(selectedQuestionData.options || [])];
                                  newOptions[index] = e.target.value;
                                  handleUpdateQuestion(selectedQuestionData.id, { options: newOptions });
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newOptions = selectedQuestionData.options?.filter((_, i) => i !== index);
                                  handleUpdateQuestion(selectedQuestionData.id, { options: newOptions });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = [...(selectedQuestionData.options || []), `Option ${(selectedQuestionData.options?.length || 0) + 1}`];
                              handleUpdateQuestion(selectedQuestionData.id, { options: newOptions });
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Rating Scale Settings */}
                    {selectedQuestionData.type === 'rating' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating Scale
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Min</label>
                            <input
                              type="number"
                              value={selectedQuestionData.settings?.scale?.min || 1}
                              onChange={(e) => {
                                const scale = { 
                                  ...(selectedQuestionData.settings?.scale || {}), 
                                  min: parseInt(e.target.value) 
                                };
                                handleUpdateQuestion(selectedQuestionData.id, { 
                                  settings: { ...selectedQuestionData.settings, scale } 
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Max</label>
                            <input
                              type="number"
                              value={selectedQuestionData.settings?.scale?.max || 5}
                              onChange={(e) => {
                                const scale = { 
                                  ...(selectedQuestionData.settings?.scale || {}), 
                                  max: parseInt(e.target.value) 
                                };
                                handleUpdateQuestion(selectedQuestionData.id, { 
                                  settings: { ...selectedQuestionData.settings, scale } 
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Placeholder for Text Inputs */}
                    {['text', 'textarea', 'email', 'phone', 'number', 'url'].includes(selectedQuestionData.type) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Placeholder Text
                        </label>
                        <input
                          type="text"
                          value={selectedQuestionData.settings?.placeholder || ''}
                          onChange={(e) => handleUpdateQuestion(selectedQuestionData.id, { 
                            settings: { ...selectedQuestionData.settings, placeholder: e.target.value } 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto space-y-8">
                {/* General Settings */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={questionnaire.category}
                        onChange={(e) => handleQuestionnaireChange({ category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="General">General</option>
                        <option value="HR">Human Resources</option>
                        <option value="Customer Service">Customer Service</option>
                        <option value="Training">Training</option>
                        <option value="Performance">Performance</option>
                        <option value="Feedback">Feedback</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={questionnaire.settings.language}
                        onChange={(e) => handleQuestionnaireChange({ 
                          settings: { ...questionnaire.settings, language: e.target.value } 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                      </select>
                    </div>
                  </div>
                </Card>

                {/* Access Settings */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Access & Security</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="allowAnonymous"
                        checked={questionnaire.settings.allowAnonymous}
                        onChange={(e) => handleQuestionnaireChange({
                          settings: { ...questionnaire.settings, allowAnonymous: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="allowAnonymous" className="text-sm font-medium text-gray-700">
                        Allow anonymous responses
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="requireLogin"
                        checked={questionnaire.settings.requireLogin}
                        onChange={(e) => handleQuestionnaireChange({
                          settings: { ...questionnaire.settings, requireLogin: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="requireLogin" className="text-sm font-medium text-gray-700">
                        Require login to respond
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="multipleSubmissions"
                        checked={questionnaire.settings.multipleSubmissions}
                        onChange={(e) => handleQuestionnaireChange({
                          settings: { ...questionnaire.settings, multipleSubmissions: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="multipleSubmissions" className="text-sm font-medium text-gray-700">
                        Allow multiple submissions per user
                      </label>
                    </div>
                  </div>
                </Card>

                {/* Display Settings */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Options</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="showProgressBar"
                        checked={questionnaire.settings.showProgressBar}
                        onChange={(e) => handleQuestionnaireChange({
                          settings: { ...questionnaire.settings, showProgressBar: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="showProgressBar" className="text-sm font-medium text-gray-700">
                        Show progress bar
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="randomizeQuestions"
                        checked={questionnaire.settings.randomizeQuestions}
                        onChange={(e) => handleQuestionnaireChange({
                          settings: { ...questionnaire.settings, randomizeQuestions: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="randomizeQuestions" className="text-sm font-medium text-gray-700">
                        Randomize question order
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="autoSave"
                        checked={questionnaire.settings.autoSave}
                        onChange={(e) => handleQuestionnaireChange({
                          settings: { ...questionnaire.settings, autoSave: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="autoSave" className="text-sm font-medium text-gray-700">
                        Auto-save responses
                      </label>
                    </div>
                  </div>
                </Card>

                {/* Timing Settings */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Timing & Schedule</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Limit (minutes, optional)
                      </label>
                      <input
                        type="number"
                        value={questionnaire.settings.timeLimit || ''}
                        onChange={(e) => handleQuestionnaireChange({
                          settings: { 
                            ...questionnaire.settings, 
                            timeLimit: e.target.value ? parseInt(e.target.value) : undefined 
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="No time limit"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date (optional)
                        </label>
                        <input
                          type="datetime-local"
                          value={questionnaire.settings.startDate || ''}
                          onChange={(e) => handleQuestionnaireChange({
                            settings: { ...questionnaire.settings, startDate: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date (optional)
                        </label>
                        <input
                          type="datetime-local"
                          value={questionnaire.settings.endDate || ''}
                          onChange={(e) => handleQuestionnaireChange({
                            settings: { ...questionnaire.settings, endDate: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="p-6 bg-gray-50 overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <Card className="p-8">
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {questionnaire.title}
                    </h1>
                    {questionnaire.description && (
                      <p className="text-gray-600">{questionnaire.description}</p>
                    )}
                  </div>
                  
                  {questionnaire.settings.showProgressBar && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>0 of {questionnaire.questions.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-8">
                    {questionnaire.questions.map((question, index) => (
                      <div key={question.id} className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-gray-500 mt-1">
                            {index + 1}.
                          </span>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {question.title}
                              {question.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </h3>
                            {question.description && (
                              <p className="text-sm text-gray-600 mt-1">{question.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-6">
                          {/* Render different question types */}
                          {question.type === 'text' && (
                            <input
                              type="text"
                              placeholder={question.settings?.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              disabled
                            />
                          )}
                          
                          {question.type === 'textarea' && (
                            <textarea
                              placeholder={question.settings?.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              rows={4}
                              disabled
                            />
                          )}
                          
                          {question.type === 'multiple_choice' && question.options && (
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <input type="radio" name={question.id} disabled />
                                  <label className="text-sm text-gray-700">{option}</label>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {question.type === 'checkbox' && question.options && (
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <input type="checkbox" disabled />
                                  <label className="text-sm text-gray-700">{option}</label>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {question.type === 'rating' && question.settings?.scale && (
                            <div className="flex items-center gap-2">
                              {Array.from({ 
                                length: question.settings.scale.max - question.settings.scale.min + 1 
                              }, (_, i) => (
                                <button key={i} className="p-1" disabled>
                                  <Star className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {question.type === 'date' && (
                            <input
                              type="date"
                              className="px-3 py-2 border border-gray-300 rounded-md"
                              disabled
                            />
                          )}
                          
                          {question.type === 'number' && (
                            <input
                              type="number"
                              placeholder={question.settings?.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              disabled
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <Button className="w-full" disabled>
                      Submit Response
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Choose a Template</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowTemplates(false)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <Card
                    key={template.name}
                    className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleLoadTemplate(template)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{template.category}</Badge>
                        <span className="text-sm text-gray-500">{template.questions} questions</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Use Template
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
