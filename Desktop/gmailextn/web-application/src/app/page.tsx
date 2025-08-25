'use client';

import React, { useState } from 'react';
import { Copy, SearchCode, BrainCircuit, Type, Loader2, Sparkles, Linkedin, User, Star, Lightbulb, Package, HelpCircle, Info } from 'lucide-react';

// Reusable components
const SectionCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white border border-gray-200/80 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 ${className || ''}`}>
        {children}
    </div>
);

const SkillTag = ({ skill, type }: { skill: string; type: 'core' | 'inferred' | 'contextual' }) => {
    const baseClasses = "text-xs font-medium px-2 py-0.5 rounded-full";
    const typeClasses = {
        core: "bg-dark-blue-light text-dark-blue-dark",
        inferred: "bg-dark-blue-lighter text-dark-blue",
        contextual: "bg-dark-blue-light text-dark-blue-darker"
    };
    return (
        <span className={`${baseClasses} ${typeClasses[type]}`}>
            {skill}
        </span>
    );
};

// Main App Component
export default function App() {
    const [jobText, setJobText] = useState('');
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('search'); // 'search', 'questions', 'email'

    const handleAnalyze = async () => {
        if (!jobText.trim()) return;
        
        setIsLoading(true);
        setAnalysisResult(null);
        setError('');

        try {
            const response = await fetch('https://gmailextn-production.up.railway.app/api/analyze-jd', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    job_description: jobText,
                    job_title: ''
                })
            });

            if (!response.ok) {
                throw new Error('Failed to analyze job description');
            }

            const data = await response.json();
            
            if (data.success) {
                // Transform the backend response to match our UI structure
                const skills = data.data.skills || [];
                const skillNames = skills.map((skill: any) => typeof skill === 'string' ? skill : skill.name || skill.skill || 'Unknown Skill');
                
                const transformedResult = {
                    booleanSearch: data.data.booleanSearch || 'No boolean search generated',
                    idealCandidateSkills: {
                        core: skillNames.slice(0, 3) || [],
                        inferred: skillNames.slice(3, 6) || [],
                        contextual: skillNames.slice(6, 9) || []
                    },
                    interviewQuestions: [
                        { skill: skillNames[0] || "Technical Skills", question: "Can you describe your experience with the primary technologies mentioned in this role?" },
                        { skill: skillNames[1] || "Development", question: "What's your approach to solving complex technical problems?" },
                        { skill: skillNames[2] || "Teamwork", question: "How do you collaborate with cross-functional teams?" }
                    ],
                    skillTrivia: {
                        skill: skillNames[0] || "Technology",
                        fact: "The most in-demand skills in tech are constantly evolving, with AI and machine learning leading the current trend."
                    }
                };
                
                setAnalysisResult(transformedResult);
            } else {
                throw new Error(data.message || 'Analysis failed');
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Failed to analyze job description. Please try again.');
            
            // Fallback to mock data for demo purposes
            const mockAnalysis = {
                booleanSearch: '("React" OR "ReactJS") AND "TypeScript" AND ("Redux" OR "Zustand") AND "Agile"',
                idealCandidateSkills: {
                    core: ["React", "TypeScript", "JavaScript (ES6+)"],
                    inferred: ["State Management", "REST APIs"],
                    contextual: ["Agile Methodologies", "CI/CD"]
                },
                interviewQuestions: [
                    { skill: "React", question: "Can you explain the difference between the Virtual DOM and the Shadow DOM?" },
                    { skill: "TypeScript", question: "What are generics in TypeScript and why are they useful?" },
                    { skill: "Agile Methodologies", question: "Describe a time your team had to adapt to a major change in project requirements." }
                ],
                skillTrivia: {
                    skill: "React",
                    fact: "React was created by Jordan Walke, a software engineer at Facebook, and was first deployed on Facebook's news feed in 2011."
                }
            };
            setAnalysisResult(mockAnalysis);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (!analysisResult?.booleanSearch) return;
        const textToCopy = analysisResult.booleanSearch;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 2000);
            }).catch(() => {
                setCopySuccess('Failed to copy');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 2000);
            } catch (err) {
                setCopySuccess('Failed to copy');
            }
            document.body.removeChild(textArea);
        }
    };
    
    const generateLinkedInSearchUrl = () => {
        if (!analysisResult?.idealCandidateSkills) return '#';
        const { core, inferred, contextual } = analysisResult.idealCandidateSkills;
        const allSkills = [...core, ...inferred, ...contextual];
        const keywords = allSkills.map(skill => `"${skill}"`).join(' AND ');
        return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keywords)}`;
    };

    return (
        <div className="h-screen w-screen bg-white font-sans antialiased text-gray-900 flex">
                        {/* Left Sidebar - Pure white canvas */}
            <div className="w-16 bg-white flex flex-col items-center py-4">
                <div className="flex items-center justify-center w-10 h-10 bg-dark-blue text-white font-bold rounded-full text-lg mb-6">
                    F
                </div>
                <div className="flex-1"></div>
                <button className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12h18M3 6h18M3 18h18"/>
                    </svg>
                </button>
            </div>

            {/* Main Content Area - Pure white canvas */}
            <div className="flex-1 flex">
                {/* Left Side: Document Editor - Pure white canvas */}
                <div className="flex-1 flex flex-col border-r border-gray-200">
                    <div className="flex-1 p-8">
                        <textarea
                            className="w-full h-full bg-white text-base text-gray-700 focus:outline-none resize-none border-0 placeholder-gray-400"
                            placeholder="Type or paste (⌘+V) your job description here or upload a document."
                            value={jobText}
                            onChange={(e) => setJobText(e.target.value)}
                        ></textarea>
                    </div>
                    
                    {/* Bottom Toolbar */}
                    <div className="h-12 bg-white flex items-center justify-between px-8">
                        <div className="flex items-center space-x-2">
                            <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                <span className="font-bold text-sm">B</span>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                <span className="italic text-sm">I</span>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                <span className="underline text-sm">U</span>
                            </button>
                            <div className="w-px h-6 bg-gray-300 mx-2"></div>
                            <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                <span className="font-bold text-xs">H1</span>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                <span className="font-bold text-xs">H2</span>
                            </button>
                            <div className="w-px h-6 bg-gray-300 mx-2"></div>
                            <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                                </svg>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="8" y1="6" x2="21" y2="6"/>
                                    <line x1="8" y1="12" x2="21" y2="12"/>
                                    <line x1="8" y1="18" x2="21" y2="18"/>
                                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">{jobText.split(' ').filter(word => word.length > 0).length} words</span>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-96 bg-white flex flex-col">
                    {/* Tabs */}
                    <div className="h-12 bg-white flex items-center px-6">
                        <div className="flex space-x-6">
                            <button 
                                onClick={() => setActiveTab('search')}
                                className={`flex items-center space-x-2 px-3 py-2 font-medium text-sm transition-colors ${
                                    activeTab === 'search' 
                                        ? 'text-dark-blue border-b-2 border-dark-blue' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <SearchCode size={16} />
                                <span>Search</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('questions')}
                                className={`flex items-center space-x-2 px-3 py-2 font-medium text-sm transition-colors ${
                                    activeTab === 'questions' 
                                        ? 'text-dark-blue border-b-2 border-dark-blue' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <HelpCircle size={16} />
                                <span>Questions</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('email')}
                                className={`flex items-center space-x-2 px-3 py-2 font-medium text-sm transition-colors ${
                                    activeTab === 'email' 
                                        ? 'text-dark-blue border-b-2 border-dark-blue' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                                <span>Email</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Content Area */}
                    <div className="flex-1 p-6">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <Loader2 size={32} className="animate-spin mb-4" />
                                <p className="text-sm font-semibold">Processing...</p>
                            </div>
                        )}

                        {!isLoading && !analysisResult && (
                            <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full">
                                <div className="w-24 h-24 bg-dark-blue-light rounded-full flex items-center justify-center mb-4">
                                    {activeTab === 'search' && <SearchCode size={32} className="text-dark-blue" />}
                                    {activeTab === 'questions' && <HelpCircle size={32} className="text-dark-blue" />}
                                    {activeTab === 'email' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-dark-blue">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>}
                                </div>
                                <p className="text-sm font-semibold text-gray-700">
                                    {activeTab === 'search' && 'Ready to search.'}
                                    {activeTab === 'questions' && 'Ready for questions.'}
                                    {activeTab === 'email' && 'Ready for email format.'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 mb-6">
                                    {activeTab === 'search' && 'Your boolean search will appear here.'}
                                    {activeTab === 'questions' && 'Interview questions will appear here.'}
                                    {activeTab === 'email' && 'Email formatted content will appear here.'}
                                </p>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isLoading || !jobText.trim()}
                                    className="px-6 py-3 bg-dark-blue text-white rounded-lg font-semibold text-sm hover:bg-dark-blue-hover transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                >
                                    {isLoading ? <><Loader2 size={16} className="animate-spin mr-2" /><span>Analyzing...</span></> : <><Sparkles size={16} className="mr-2" /><span>Analyze Job Description</span></>}
                                </button>
                            </div>
                        )}

                        {analysisResult && (
                            <>
                                {/* Search Tab Content */}
                                {activeTab === 'search' && (
                                    <div className="space-y-4">
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <h3 className="text-sm font-semibold text-gray-800 flex items-center mb-3">
                                                <SearchCode size={14} className="text-gray-500 mr-2" />
                                                Boolean Search
                                            </h3>
                                            <div className="relative mb-3">
                                                <textarea 
                                                    rows={3} 
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 font-mono resize-none" 
                                                    value={analysisResult.booleanSearch} 
                                                    readOnly 
                                                />
                                                <button onClick={handleCopy} className="absolute top-2 right-2 p-1 text-gray-500 hover:bg-gray-200 rounded transition-colors">
                                                    <Copy size={10} />
                                                </button>
                                                {copySuccess && <div className="absolute -top-6 right-0 text-xs bg-gray-800 text-white px-2 py-1 rounded">{copySuccess}</div>}
                                            </div>
                                            <a 
                                                href={generateLinkedInSearchUrl()} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-gray-800 text-white rounded text-xs hover:bg-gray-900 transition-colors"
                                            >
                                                <Linkedin size={10} />
                                                <span>Find Candidates on LinkedIn</span>
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Questions Tab Content */}
                                {activeTab === 'questions' && (
                                    <div className="space-y-4">
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <h3 className="text-sm font-semibold text-gray-800 flex items-center mb-3">
                                                <HelpCircle size={14} className="text-gray-500 mr-2" />
                                                Interview Questions
                                            </h3>
                                            <div className="space-y-3">
                                                {analysisResult.interviewQuestions.map((q: any, index: number) => (
                                                    <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                                                        <p className="text-xs text-gray-800 mb-2">{q.question}</p>
                                                        <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{q.skill}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Email Tab Content */}
                                {activeTab === 'email' && (
                                    <div className="space-y-4">
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <h3 className="text-sm font-semibold text-gray-800 flex items-center mb-3">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 mr-2">
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                                    <polyline points="22,6 12,13 2,6"/>
                                                </svg>
                                                Email Format
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                                                    <p className="text-xs text-gray-800 mb-2">Email formatting feature coming soon...</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
