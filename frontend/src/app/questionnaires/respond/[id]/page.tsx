'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Clock, 
  User, 
  FileText,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

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
  id: string;
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
  created_by: string;
  created_at: string;
}

interface Response {
  question_id: string;
  value: string | string[] | number;
}

export default function QuestionnaireResponse() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = params.id as string;

  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime] = useState<Date>(new Date());

  // Mock data for demonstration
  useEffect(() => {
    const mockQuestionnaire: QuestionnaireData = {
      id: questionnaireId,
      title: 'Employee Satisfaction Survey 2024',
      description: 'Help us understand your experience and improve our workplace culture. Your responses are confidential and will be used to make positive changes.',
      category: 'HR & Culture',
      target_audience: 'All Employees',
      tags: ['satisfaction', 'culture', 'feedback'],
      status: 'active',
      questions: [
        {
          id: 'q1',
          type: 'single_choice',
          title: 'How satisfied are you with your current role?',
          description: 'Please select the option that best describes your overall job satisfaction.',
          required: true,
          options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
          order: 0
        },
        {
          id: 'q2',
          type: 'rating',
          title: 'Rate your work-life balance',
          description: 'On a scale of 1-5, how would you rate your current work-life balance?',
          required: true,
          min_rating: 1,
          max_rating: 5,
          order: 1
        },
        {
          id: 'q3',
          type: 'multiple_choice',
          title: 'Which benefits are most important to you?',
          description: 'Select all that apply.',
          required: false,
          options: ['Health Insurance', 'Retirement Plan', 'Flexible Hours', 'Remote Work', 'Professional Development', 'Paid Time Off'],
          order: 2
        },
        {
          id: 'q4',
          type: 'textarea',
          title: 'What improvements would you like to see in our workplace?',
          description: 'Please share any suggestions or feedback you have for improving our work environment.',
          required: false,
          placeholder: 'Share your thoughts and suggestions...',
          order: 3
        },
        {
          id: 'q5',
          type: 'text',
          title: 'What is your department?',
          required: true,
          placeholder: 'e.g., Engineering, Marketing, Sales...',
          order: 4
        }
      ],
      settings: {
        allow_anonymous: true,
        require_login: false,
        show_progress: true,
        randomize_questions: false,
        time_limit: 15
      },
      created_by: 'HR Team',
      created_at: '2024-02-15T10:00:00Z'
    };

    setTimeout(() => {
      setQuestionnaire(mockQuestionnaire);
      setLoading(false);
      
      // Set up timer if time limit exists
      if (mockQuestionnaire.settings.time_limit) {
        setTimeRemaining(mockQuestionnaire.settings.time_limit * 60); // Convert to seconds
      }
    }, 1000);
  }, [questionnaireId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get response for a question
  const getResponse = (questionId: string): Response | undefined => {
    return responses.find(r => r.question_id === questionId);
  };

  // Update response
  const updateResponse = (questionId: string, value: string | string[] | number) => {
    setResponses(prev => {
      const existing = prev.find(r => r.question_id === questionId);
      if (existing) {
        return prev.map(r => r.question_id === questionId ? { ...r, value } : r);
      } else {
        return [...prev, { question_id: questionId, value }];
      }
    });

    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  // Validate current question
  const validateQuestion = (question: Question): string | null => {
    const response = getResponse(question.id);

    if (question.required && (!response || !response.value || 
        (Array.isArray(response.value) && response.value.length === 0) ||
        (typeof response.value === 'string' && response.value.trim() === ''))) {
      return 'This question is required';
    }

    if (response && question.validation) {
      const value = response.value;
      
      if (typeof value === 'string') {
        if (question.validation.min_length && value.length < question.validation.min_length) {
          return `Minimum length is ${question.validation.min_length} characters`;
        }
        if (question.validation.max_length && value.length > question.validation.max_length) {
          return `Maximum length is ${question.validation.max_length} characters`;
        }
        if (question.validation.pattern && !new RegExp(question.validation.pattern).test(value)) {
          return 'Invalid format';
        }
      }

      if (typeof value === 'number') {
        if (question.validation.min_value && value < question.validation.min_value) {
          return `Minimum value is ${question.validation.min_value}`;
        }
        if (question.validation.max_value && value > question.validation.max_value) {
          return `Maximum value is ${question.validation.max_value}`;
        }
      }
    }

    return null;
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (!questionnaire) return;

    const currentQuestion = questionnaire.questions[currentQuestionIndex];
    const error = validateQuestion(currentQuestion);
    
    if (error) {
      setErrors(prev => ({ ...prev, [currentQuestion.id]: error }));
      return;
    }

    if (currentQuestionIndex < questionnaire.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navigate to previous question
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit questionnaire
  const handleSubmit = async () => {
    if (!questionnaire) return;

    // Validate all questions
    const newErrors: Record<string, string> = {};
    questionnaire.questions.forEach(question => {
      const error = validateQuestion(question);
      if (error) {
        newErrors[question.id] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Navigate to first question with error
      const firstErrorIndex = questionnaire.questions.findIndex(q => newErrors[q.id]);
      if (firstErrorIndex !== -1) {
        setCurrentQuestionIndex(firstErrorIndex);
      }
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const submissionData = {
        questionnaire_id: questionnaireId,
        responses: responses,
        submitted_at: new Date().toISOString(),
        time_taken: Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
      };

      console.log('Submitting responses:', submissionData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting responses:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Render question input
  const renderQuestionInput = (question: Question) => {
    const response = getResponse(question.id);
    const error = errors[question.id];

    switch (question.type) {
      case 'text':
      case 'email':
        return (
          <div>
            <Input
              type={question.type}
              value={(response?.value as string) || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateResponse(question.id, e.target.value)}
              placeholder={question.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'number':
        return (
          <div>
            <Input
              type="number"
              value={(response?.value as number) || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateResponse(question.id, parseFloat(e.target.value) || 0)}
              placeholder={question.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'date':
        return (
          <div>
            <Input
              type="date"
              value={(response?.value as string) || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateResponse(question.id, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div>
            <textarea
              value={(response?.value as string) || ''}
              onChange={(e) => updateResponse(question.id, e.target.value)}
              placeholder={question.placeholder}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'single_choice':
        return (
          <div>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={(response?.value as string) === option}
                    onChange={(e) => updateResponse(question.id, e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        );

      case 'multiple_choice':
        return (
          <div>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option}
                    checked={((response?.value as string[]) || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = (response?.value as string[]) || [];
                      if (e.target.checked) {
                        updateResponse(question.id, [...currentValues, option]);
                      } else {
                        updateResponse(question.id, currentValues.filter(v => v !== option));
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        );

      case 'rating':
        const minRating = question.min_rating || 1;
        const maxRating = question.max_rating || 5;
        const currentRating = (response?.value as number) || 0;

        return (
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{minRating}</span>
              <div className="flex space-x-1">
                {Array.from({ length: maxRating - minRating + 1 }, (_, i) => {
                  const rating = minRating + i;
                  return (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => updateResponse(question.id, rating)}
                      className={`p-1 rounded ${
                        currentRating >= rating
                          ? 'text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    >
                      <Star className="h-8 w-8 fill-current" />
                    </button>
                  );
                })}
              </div>
              <span className="text-sm text-gray-600">{maxRating}</span>
            </div>
            {currentRating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                You rated: {currentRating} out of {maxRating}
              </p>
            )}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Questionnaire Not Found</h3>
            <p className="text-gray-600">
              The questionnaire you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600 mb-6">
              Your responses have been submitted successfully. We appreciate your feedback.
            </p>
            <Button onClick={() => router.push('/questionnaires')}>
              Back to Questionnaires
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionnaire.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{questionnaire.title}</h1>
              <p className="text-gray-600 mt-2">{questionnaire.description}</p>
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg">{formatTimeRemaining(timeRemaining)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <Badge variant="secondary">{questionnaire.category}</Badge>
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {questionnaire.target_audience}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {questionnaire.questions.length} questions
            </span>
          </div>

          {/* Progress Bar */}
          {questionnaire.settings.show_progress && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestionIndex + 1} of {questionnaire.questions.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-blue-600">
                    Question {currentQuestionIndex + 1}
                  </span>
                  {currentQuestion.required && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentQuestion.title}
                </h2>
                {currentQuestion.description && (
                  <p className="text-gray-600 mt-2">{currentQuestion.description}</p>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderQuestionInput(currentQuestion)}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {questionnaire.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600'
                    : index < currentQuestionIndex
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentQuestionIndex === questionnaire.questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          ) : (
            <Button onClick={nextQuestion}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
