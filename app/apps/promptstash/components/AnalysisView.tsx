"use client";

import React, { useState } from 'react';
import { AnalysisResult, QuizQuestion } from '../types';
import { CheckCircle2, AlertTriangle, Lightbulb, PlayCircle, Award, BarChart2 } from 'lucide-react';

interface AnalysisViewProps {
  analysis: AnalysisResult;
  onCompleteQuiz: () => void;
  isRewriting: boolean;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, onCompleteQuiz, isRewriting }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    setShowExplanation(prev => ({ ...prev, [questionId]: true }));
  };

  const allAnswered = analysis.questions.length > 0 && Object.keys(answers).length === analysis.questions.length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-ide-border bg-ide-panel/50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart2 size={24} className="text-ide-accent" />
            Prompt Analysis
          </h2>
          <p className="text-ide-muted text-sm mt-1">{analysis.summary}</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
             <div className="text-xs text-ide-muted uppercase tracking-wider font-semibold">Prompt Score</div>
             <div className={`text-3xl font-mono font-bold ${
               analysis.score >= 80 ? 'text-ide-success' : analysis.score >= 50 ? 'text-ide-warning' : 'text-red-500'
             }`}>
               {analysis.score}/100
             </div>
           </div>
           <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
              analysis.score >= 80 ? 'border-ide-success' : analysis.score >= 50 ? 'border-ide-warning' : 'border-red-500'
           }`}>
             <Award size={32} className={analysis.score >= 80 ? 'text-ide-success' : analysis.score >= 50 ? 'text-ide-warning' : 'text-red-500'} />
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Feedback Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-ide-panel p-5 rounded-lg border border-ide-border">
            <h3 className="text-ide-success font-semibold flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} /> Strengths
            </h3>
            <ul className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-ide-success rounded-full mt-1.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-ide-panel p-5 rounded-lg border border-ide-border">
            <h3 className="text-ide-warning font-semibold flex items-center gap-2 mb-4">
              <AlertTriangle size={18} /> Improvements Needed
            </h3>
            <ul className="space-y-2">
              {analysis.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-ide-warning rounded-full mt-1.5 flex-shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Interactive Quiz */}
        <div className="border-t border-ide-border pt-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Lightbulb size={20} className="text-yellow-400" />
            Understanding the Issues
          </h3>
          <p className="text-ide-muted mb-6">Answer these questions to unlock the optimized rewrite. This helps you learn how to prompt better.</p>
          
          <div className="space-y-6">
            {analysis.questions.map((q: QuizQuestion) => {
              const answered = answers[q.id] !== undefined;
              const isCorrect = answered && answers[q.id] === q.correctIndex;
              
              return (
                <div key={q.id} className="bg-ide-panel rounded-lg border border-ide-border overflow-hidden">
                  <div className="p-4 bg-ide-bg border-b border-ide-border">
                    <p className="font-medium">{q.question}</p>
                  </div>
                  <div className="p-4 space-y-2">
                    {q.options.map((opt, idx) => {
                      let btnClass = "w-full text-left p-3 rounded text-sm transition-colors border ";
                      
                      if (answered) {
                        if (idx === q.correctIndex) {
                           btnClass += "bg-ide-success/10 border-ide-success text-ide-success";
                        } else if (idx === answers[q.id]) {
                           btnClass += "bg-red-500/10 border-red-500 text-red-400";
                        } else {
                           btnClass += "border-transparent opacity-50";
                        }
                      } else {
                        btnClass += "border-ide-border hover:bg-white/5 hover:border-ide-accent";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => !answered && handleOptionSelect(q.id, idx)}
                          disabled={answered}
                          className={btnClass}
                        >
                          <span className="font-mono text-xs mr-2 opacity-50">[{String.fromCharCode(65 + idx)}]</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {answered && (
                    <div className="p-4 bg-ide-bg/50 border-t border-ide-border text-sm flex gap-3">
                      <div className="mt-0.5">
                         {isCorrect ? <CheckCircle2 size={16} className="text-ide-success" /> : <AlertTriangle size={16} className="text-ide-warning" />}
                      </div>
                      <p className="text-ide-muted italic">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-0 bg-ide-bg/95 backdrop-blur py-4 border-t border-ide-border mt-8 flex justify-end">
           <button
             onClick={onCompleteQuiz}
             disabled={!allAnswered || isRewriting}
             className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
               allAnswered 
                 ? 'bg-ide-accent hover:bg-blue-600 text-white cursor-pointer' 
                 : 'bg-ide-border text-ide-muted cursor-not-allowed'
             }`}
           >
             {isRewriting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Rewriting...
                </>
             ) : (
                <>
                  <PlayCircle size={20} />
                  Optimize Prompt
                </>
             )}
           </button>
        </div>
      </div>
    </div>
  );
};
