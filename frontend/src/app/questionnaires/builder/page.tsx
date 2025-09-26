'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Plus, 
  Save, 
  Eye, 
  Settings,
  Trash2,
  GripVertical,
  Type,
  CheckSquare,
  Circle,
  Star,
  Hash,
  Calendar,
  FileText,
  ArrowLeft,
  Copy,
  Move
} from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'multiple_choice' | 'single_choice' | 'rating' | 'number' | 'date' | 'email';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  min_rating?: number;
  max_rating?: number;
  placeholder?: string;
  validation?: {
    min_length?: number;
    max_length?: number;
    min_value?: number;
    max_value?: number;
    pattern?: string;
  };
  order: number;
}

interface QuestionnaireData {
  id?: string;
  title: string;
  description: string;
  category: string;
  target_audience: string;
  tags: string[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  questions: Question[];
  settings: {
    allow_anonymous: boolean;
    require_login: boolean;
    show_progress: boolean;
    randomize_questions: boolean;
    time_limit?: number;
    response_limit?: number;
    start_date?: string;
    end_date?: string;
  };
}

export default function QuestionnaireBuilder() {
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>({
    title: '',
    description: '',
    category: '',
    target_audience: '',
    tags: [],
    status: 'draft',
    questions: [],
    settings: {
      allow_anonymous: false,
      require_login: true,
      show_progress: true,
      randomize_questions: false
    }
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'questions' | 'settings'>('basic');
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);
  const [newTag, setNewTag] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Question type configurations
  const questionTypes = [
    { type: 'text', label: 'Short Text', icon: Type, description: 'Single line text input' },
    { type: 'textarea', label: 'Long Text', icon: FileText, description: 'Multi-line text area' },
    { type: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquare, description: 'Select multiple options' },
    { type: 'single_choice', label: 'Single Choice', icon: Circle, description: 'Select one option' },
    { type: 'rating', label: 'Rating Scale', icon: Star, description: 'Rate on a scale' },
    { type: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
    { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
    { type: 'email', label: 'Email', icon: Type, description: 'Email address input' }
  ];

  // Add new question
  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type,
      title: `New ${questionTypes.find(qt => qt.type === type)?.label} Question`,
      required: false,
      order: questionnaire.questions.length,
      ...(type === 'multiple_choice' || type === 'single_choice' ? { options: ['Option 1', 'Option 2'] } : {}),
      ...(type === 'rating' ? { min_rating: 1, max_rating: 5 } : {})
    };

    setQuestionnaire(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  // Update question
  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  // Delete question
  const deleteQuestion = (questionId: string) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
        .map((q, index) => ({ ...q, order: index }))
    }));
  };

  // Duplicate question
  const duplicateQuestion = (questionId: string) => {
    const question = questionnaire.questions.find(q => q.id === questionId);
    if (question) {
      const duplicated: Question = {
        ...question,
        id: `q_${Date.now()}`,
        title: `${question.title} (Copy)`,
        order: questionnaire.questions.length
      };
      setQuestionnaire(prev => ({
        ...prev,
        questions: [...prev.questions, duplicated]
      }));
    }
  };

  // Handle drag and drop
  const handleDragStart = (questionId: string) => {
    setDraggedQuestion(questionId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetQuestionId: string) => {
    e.preventDefault();
    if (!draggedQuestion || draggedQuestion === targetQuestionId) return;

    const draggedIndex = questionnaire.questions.findIndex(q => q.id === draggedQuestion);
    const targetIndex = questionnaire.questions.findIndex(q => q.id === targetQuestionId);

    const newQuestions = [...questionnaire.questions];
    const [draggedItem] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(targetIndex, 0, draggedItem);

    // Update order
    const reorderedQuestions = newQuestions.map((q, index) => ({ ...q, order: index }));

    setQuestionnaire(prev => ({
      ...prev,
      questions: reorderedQuestions
    }));

    setDraggedQuestion(null);
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !questionnaire.tags.includes(newTag.trim())) {
      setQuestionnaire(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setQuestionnaire(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Save questionnaire
  const saveQuestionnaire = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving questionnaire:', questionnaire);
      // In real implementation, make API call here
    } catch (error) {
      console.error('Error saving questionnaire:', error);
    } finally {
      setSaving(false);
    }
  };

  // Render question editor
  const renderQuestionEditor = (question: Question) => {
    return (
      <Card key={question.id} className="mb-4">
        <CardHeader 
          className="cursor-move"
          draggable
          onDragStart={() => handleDragStart(question.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, question.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GripVertical className="h-5 w-5 text-gray-400" />
              <div>
                <CardTitle className="text-lg">Question {question.order + 1}</CardTitle>
                <p className="text-sm text-gray-600">
                  {questionTypes.find(qt => qt.type === question.type)?.label}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => duplicateQuestion(question.id)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => deleteQuestion(question.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Title *
            </label>
            <Input
              value={question.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                updateQuestion(question.id, { title: e.target.value })
              }
              placeholder="Enter your question..."
            />
          </div>

          {/* Question Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={question.description || ''}
              onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
              placeholder="Add additional context or instructions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          {/* Question-specific options */}
          {(question.type === 'multiple_choice' || question.type === 'single_choice') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
              <div className="space-y-2">
                {question.options?.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newOptions = [...(question.options || [])];
                        newOptions[index] = e.target.value;
                        updateQuestion(question.id, { options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = question.options?.filter((_, i) => i !== index);
                        updateQuestion(question.id, { options: newOptions });
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
                    updateQuestion(question.id, { options: newOptions });
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {question.type === 'rating' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
                <Input
                  type="number"
                  value={question.min_rating || 1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateQuestion(question.id, { min_rating: parseInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Rating</label>
                <Input
                  type="number"
                  value={question.max_rating || 5}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateQuestion(question.id, { max_rating: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
          )}

          {(question.type === 'text' || question.type === 'textarea') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
              <Input
                value={question.placeholder || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  updateQuestion(question.id, { placeholder: e.target.value })
                }
                placeholder="Enter placeholder text..."
              />
            </div>
          )}

          {/* Required toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${question.id}`}
              checked={question.required}
              onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`required-${question.id}`} className="text-sm text-gray-700">
              Required question
            </label>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/questionnaires">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questionnaires
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Questionnaire Builder</h1>
            <p className="text-gray-600">Create and customize your questionnaire</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={saveQuestionnaire} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'questions', label: 'Questions' },
            { id: 'settings', label: 'Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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
      {activeTab === 'basic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <Input
                  value={questionnaire.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setQuestionnaire(prev => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter questionnaire title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={questionnaire.description}
                  onChange={(e) => setQuestionnaire(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose and context of this questionnaire..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={questionnaire.category}
                  onChange={(e) => setQuestionnaire(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category...</option>
                  <option value="HR & Culture">HR & Culture</option>
                  <option value="Training">Training</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Operations">Operations</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Customer Feedback">Customer Feedback</option>
                  <option value="Product Research">Product Research</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <Input
                  value={questionnaire.target_audience}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setQuestionnaire(prev => ({ ...prev, target_audience: e.target.value }))
                  }
                  placeholder="e.g., All Employees, New Hires, Managers..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {questionnaire.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={questionnaire.status}
                  onChange={(e) => setQuestionnaire(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Types Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Add Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {questionTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.type}
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => addQuestion(type.type as Question['type'])}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 mt-0.5 text-blue-600" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Questions Editor */}
          <div className="lg:col-span-3">
            {questionnaire.questions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No questions yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start building your questionnaire by adding questions from the sidebar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {questionnaire.questions
                  .sort((a, b) => a.order - b.order)
                  .map(question => renderQuestionEditor(question))
                }
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Access & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700">Allow Anonymous Responses</label>
                  <p className="text-sm text-gray-600">Allow users to respond without logging in</p>
                </div>
                <input
                  type="checkbox"
                  checked={questionnaire.settings.allow_anonymous}
                  onChange={(e) => setQuestionnaire(prev => ({
                    ...prev,
                    settings: { ...prev.settings, allow_anonymous: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700">Require Login</label>
                  <p className="text-sm text-gray-600">Users must be logged in to respond</p>
                </div>
                <input
                  type="checkbox"
                  checked={questionnaire.settings.require_login}
                  onChange={(e) => setQuestionnaire(prev => ({
                    ...prev,
                    settings: { ...prev.settings, require_login: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700">Show Progress Bar</label>
                  <p className="text-sm text-gray-600">Display completion progress to users</p>
                </div>
                <input
                  type="checkbox"
                  checked={questionnaire.settings.show_progress}
                  onChange={(e) => setQuestionnaire(prev => ({
                    ...prev,
                    settings: { ...prev.settings, show_progress: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700">Randomize Questions</label>
                  <p className="text-sm text-gray-600">Show questions in random order</p>
                </div>
                <input
                  type="checkbox"
                  checked={questionnaire.settings.randomize_questions}
                  onChange={(e) => setQuestionnaire(prev => ({
                    ...prev,
                    settings: { ...prev.settings, randomize_questions: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limits & Timing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                <Input
                  type="number"
                  value={questionnaire.settings.time_limit || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setQuestionnaire(prev => ({
                      ...prev,
                      settings: { ...prev.settings, time_limit: e.target.value ? parseInt(e.target.value) : undefined }
                    }))
                  }
                  placeholder="No time limit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Response Limit</label>
                <Input
                  type="number"
                  value={questionnaire.settings.response_limit || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setQuestionnaire(prev => ({
                      ...prev,
                      settings: { ...prev.settings, response_limit: e.target.value ? parseInt(e.target.value) : undefined }
                    }))
                  }
                  placeholder="No response limit"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Input
                  type="datetime-local"
                  value={questionnaire.settings.start_date || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setQuestionnaire(prev => ({
                      ...prev,
                      settings: { ...prev.settings, start_date: e.target.value }
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <Input
                  type="datetime-local"
                  value={questionnaire.settings.end_date || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setQuestionnaire(prev => ({
                      ...prev,
                      settings: { ...prev.settings, end_date: e.target.value }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
