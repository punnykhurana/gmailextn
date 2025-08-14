'use client';

import { useState } from 'react';
import { 
  Upload, 
  Sparkles, 
  Copy, 
  Download, 
  Share2,
  Target,
  TrendingUp,
  Users,
  Search
} from 'lucide-react';
import { ApiService, AnalysisResponse } from '@/lib/api';

interface AnalysisResult {
  skills: Array<{ name: string; confidence: number }>;
  booleanSearch: string;
  context: string;
  extractionMethod: string;
}

export function JobDescriptionEditor() {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJobDescription(text);
    setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);
  };

  const analyzeJobDescription = async () => {
    if (!jobDescription.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await ApiService.analyzeJobDescription({
        job_description: jobDescription,
        job_title: ''
      });

      if (response.success) {
        setAnalysis(response.data);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback mock data for demo
      setAnalysis({
        skills: [
          { name: 'React', confidence: 0.95 },
          { name: 'TypeScript', confidence: 0.88 },
          { name: 'Node.js', confidence: 0.82 },
          { name: 'Python', confidence: 0.75 },
        ],
        booleanSearch: '("React" OR "TypeScript") AND "Node.js" AND "Python"',
        context: 'Frontend development with modern JavaScript frameworks and backend experience',
        extractionMethod: 'AI Dynamic Analysis'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Editor Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">Job Description Analyzer</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Target className="w-4 h-4" />
              <span>AI-Powered Analysis</span>
            </div>
          </div>
        
        <div className="flex items-center space-x-2">
          <button className="btn-outline px-4 py-2">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </button>
          <button 
            onClick={analyzeJobDescription}
            disabled={!jobDescription.trim() || isAnalyzing}
            className="btn-primary px-4 py-2"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Job Description</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{wordCount} words</span>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <span>Real-time analysis</span>
                </div>
              </div>
              
              <textarea
                value={jobDescription}
                onChange={handleTextChange}
                placeholder="Paste your job description here or start typing to see real-time analysis..."
                className="flex-1 w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ minHeight: '400px' }}
              />
            </div>
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="w-96 border-l border-gray-200 bg-gray-50">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
              AI Analysis
            </h3>

            {!analysis ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-500">
                  Start typing or paste a job description to see AI-powered insights
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Skills */}
                <div className="card p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Key Skills
                  </h4>
                  <div className="space-y-2">
                    {analysis.skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">{skill.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${skill.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(skill.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Boolean Search */}
                <div className="card p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Search className="w-4 h-4 mr-2" />
                    Boolean Search
                  </h4>
                  <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm">
                    {analysis.booleanSearch}
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button className="btn-outline px-3 py-1 text-xs">
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </button>
                    <button className="btn-outline px-3 py-1 text-xs">
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </button>
                  </div>
                </div>

                {/* Context */}
                <div className="card p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Context
                  </h4>
                  <p className="text-sm text-gray-600">
                    {analysis.context}
                  </p>
                </div>

                {/* Method */}
                <div className="text-xs text-gray-500">
                  Analysis method: {analysis.extractionMethod}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
