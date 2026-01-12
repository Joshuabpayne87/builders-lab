'use client';

import { useState, useEffect } from 'react';
import { Eye, Code2, FileText, Smartphone, Monitor, Rocket, Download, ExternalLink, CheckCircle2, Palette, Wand2 } from 'lucide-react';
import { useFunnel } from '../FunnelContext';
import ReactMarkdown from 'react-markdown';
import DeploymentModal from './DeploymentModal';
import CodeEditor from './CodeEditor';
import ThemeCustomizer from './ThemeCustomizer';

export default function FunnelPreview() {
  const { strategyDoc, generatedCode, isGenerating, funnelId, deployedUrl, deployedSlug, setGeneratedCode } = useFunnel();
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'strategy' | 'customize' | 'ai-edit'>('strategy');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [editedCode, setEditedCode] = useState('');
  const [aiInstruction, setAiInstruction] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (generatedCode) {
      setEditedCode(generatedCode);
    }
  }, [generatedCode]);

  useEffect(() => {
    if (generatedCode && !isGenerating) {
      setActiveTab('preview');
    } else if (strategyDoc && !generatedCode) {
      setActiveTab('strategy');
    }
  }, [strategyDoc, generatedCode, isGenerating]);

  const handleDownload = () => {
    if (!editedCode) return;

    const blob = new Blob([editedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landing-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCodeChange = (newCode: string) => {
    setEditedCode(newCode);
    setGeneratedCode(newCode);
  };

  const handleThemeApply = (updatedHtml: string) => {
    setEditedCode(updatedHtml);
    setGeneratedCode(updatedHtml);
    setActiveTab('preview');
  };

  const handleAiEdit = async () => {
    if (!aiInstruction.trim() || !editedCode) return;

    setIsEditing(true);
    try {
      const response = await fetch('/api/funnels/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlCode: editedCode,
          instruction: aiInstruction,
        }),
      });

      const result = await response.json();

      if (response.ok && result.htmlCode) {
        setEditedCode(result.htmlCode);
        setGeneratedCode(result.htmlCode);
        setAiInstruction('');
        setActiveTab('preview');
      } else {
        alert('Failed to edit code: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('AI edit error:', error);
      alert('Failed to edit code. Please try again.');
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-slate-900/50">
        <div className="h-14 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4">
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('strategy')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'strategy'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Strategy
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'code'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              disabled={!generatedCode}
            >
              <Code2 className="w-3.5 h-3.5" />
              Code
            </button>
            <button
              onClick={() => setActiveTab('customize')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'customize'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              disabled={!generatedCode}
            >
              <Palette className="w-3.5 h-3.5" />
              Customize
            </button>
            <button
              onClick={() => setActiveTab('ai-edit')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'ai-edit'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              disabled={!generatedCode}
            >
              <Wand2 className="w-3.5 h-3.5" />
              AI Edit
            </button>
          </div>

          {activeTab === 'preview' && (
            <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
              <button
                onClick={() => setDevice('desktop')}
                className={`p-1.5 rounded-md transition-colors ${
                  device === 'desktop' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`p-1.5 rounded-md transition-colors ${
                  device === 'mobile' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {generatedCode && (
              <>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>

                {deployedUrl ? (
                  <a
                    href={deployedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    View Live
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <button
                    onClick={() => setShowDeployModal(true)}
                    className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all flex items-center gap-2"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    Deploy
                  </button>
                )}
              </>
            )}

            {isGenerating || isEditing ? (
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-xs font-mono text-indigo-400">
                  {isEditing ? 'Editing...' : 'Generating...'}
                </span>
              </div>
            ) : (
              <span className="text-xs font-mono text-slate-500">Ready</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'strategy' && (
            <div className="h-full overflow-y-auto p-8 bg-slate-900 text-slate-300">
              {strategyDoc ? (
                <div className="prose prose-invert max-w-2xl mx-auto prose-headings:text-indigo-400 prose-p:text-slate-300 prose-li:text-slate-300">
                  <ReactMarkdown>{strategyDoc}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-50">
                  <FileText className="w-12 h-12 mb-4 text-slate-600" />
                  <h3 className="text-lg font-medium text-slate-400">No Strategy Yet</h3>
                  <p className="text-sm text-slate-500 mt-2">Chat with the Sales Architect to generate your funnel strategy.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="h-full flex items-center justify-center bg-slate-950/50 p-8">
              <div className={`transition-all duration-500 bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-800 ${
                device === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full max-w-5xl max-h-[800px]'
              }`}>
                {editedCode ? (
                  <iframe
                    srcDoc={editedCode}
                    className="w-full h-full border-none"
                    title="Preview"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 bg-slate-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="text-sm text-slate-500">Waiting for code generation...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="h-full overflow-hidden">
              {editedCode ? (
                <CodeEditor value={editedCode} onChange={handleCodeChange} />
              ) : (
                <div className="h-full bg-[#1e1e1e] text-blue-100 p-4 font-mono text-xs flex items-center justify-center">
                  <div className="opacity-50">
                    <p className="text-green-400">// Generating project structure...</p>
                    <p className="text-purple-400">const <span className="text-yellow-200">Funnel</span> = () ={'>'} {'{'}</p>
                    <p className="pl-4 text-slate-400">/* Code will stream here once the Strategy is approved */</p>
                    <p className="text-purple-400">{'}'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'customize' && (
            <div className="h-full overflow-y-auto bg-slate-900 p-8">
              {editedCode ? (
                <div className="max-w-2xl mx-auto">
                  <ThemeCustomizer htmlCode={editedCode} onApply={handleThemeApply} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  Generate code first to customize the theme
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai-edit' && (
            <div className="h-full overflow-y-auto bg-slate-900 p-8">
              {editedCode ? (
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">AI-Powered Editing</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Describe what you want to change, and AI will modify your landing page accordingly.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">What would you like to change?</label>
                        <textarea
                          value={aiInstruction}
                          onChange={(e) => setAiInstruction(e.target.value)}
                          placeholder="Example: Change the headline to be more compelling, add a testimonial section, make the CTA button larger..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[120px] resize-y"
                          disabled={isEditing}
                        />
                      </div>

                      <button
                        onClick={handleAiEdit}
                        disabled={!aiInstruction.trim() || isEditing}
                        className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isEditing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Editing...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            Apply AI Edit
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips for better results:</h4>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Be specific about what you want to change</li>
                        <li>Mention exact sections or elements</li>
                        <li>Describe the desired outcome clearly</li>
                        <li>One change at a time works best</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  Generate code first to use AI editing
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <DeploymentModal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
        htmlCode={editedCode}
        funnelId={funnelId}
      />
    </>
  );
}
