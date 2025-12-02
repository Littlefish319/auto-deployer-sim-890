import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, 
  Github, 
  Globe, 
  Terminal, 
  Code2, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Settings,
  Play
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Types ---

type StepStatus = 'idle' | 'loading' | 'success' | 'error';

interface Step {
  id: string;
  label: string;
  status: StepStatus;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

// --- Components ---

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const TerminalView = ({ logs }: { logs: LogEntry[] }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-slate-950 rounded-lg border border-slate-800 font-mono text-sm h-64 flex flex-col overflow-hidden shadow-inner">
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
        <Terminal size={14} className="text-slate-400" />
        <span className="text-slate-400 text-xs uppercase tracking-wider">System Output</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {logs.length === 0 && (
          <div className="text-slate-600 italic">Waiting for process to start...</div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
            <span className={cn(
              "break-all",
              log.type === 'info' && "text-slate-300",
              log.type === 'success' && "text-emerald-400",
              log.type === 'error' && "text-red-400",
              log.type === 'warning' && "text-amber-400"
            )}>
              {log.type === 'success' && '✓ '}
              {log.type === 'error' && '✗ '}
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

const StepIndicator = ({ step, index, currentStepIndex }: { step: Step, index: number, currentStepIndex: number }) => {
  const isCompleted = step.status === 'success';
  const isCurrent = step.status === 'loading';
  const isPending = step.status === 'idle';
  const isError = step.status === 'error';

  return (
    <div className="flex items-center gap-4 relative">
      {/* Line connector */}
      {index < 4 && (
        <div className={cn(
          "absolute left-4 top-8 w-0.5 h-8 -ml-px",
          isCompleted ? "bg-emerald-500/30" : "bg-slate-800"
        )} />
      )}
      
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10",
        isCompleted && "bg-emerald-500/10 border-emerald-500 text-emerald-500",
        isCurrent && "bg-blue-500/10 border-blue-500 text-blue-500 animate-pulse",
        isPending && "bg-slate-900 border-slate-700 text-slate-700",
        isError && "bg-red-500/10 border-red-500 text-red-500"
      )}>
        {isCompleted ? <CheckCircle2 size={16} /> : 
         isCurrent ? <Loader2 size={16} className="animate-spin" /> : 
         isError ? <AlertCircle size={16} /> :
         <span className="text-xs font-bold">{index + 1}</span>}
      </div>
      
      <div className="flex flex-col">
        <span className={cn(
          "font-medium text-sm transition-colors",
          isCompleted ? "text-emerald-400" : 
          isCurrent ? "text-blue-400" : 
          isError ? "text-red-400" :
          "text-slate-500"
        )}>
          {step.label}
        </span>
        {isCurrent && <span className="text-xs text-slate-400 animate-pulse">Processing...</span>}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [projectName, setProjectName] = useState('my-awesome-app');
  const [code, setCode] = useState(`import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">Hello World! 🚀</h1>
    </div>
  );
}`);
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const [steps, setSteps] = useState<Step[]>([
    { id: 'validate', label: 'Validate & Bundle Code', status: 'idle' },
    { id: 'github', label: 'Create GitHub Repository', status: 'idle' },
    { id: 'push', label: 'Push to Main Branch', status: 'idle' },
    { id: 'vercel', label: 'Deploy to Vercel', status: 'idle' },
    { id: 'live', label: 'Verify Live URL', status: 'idle' },
  ]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { timestamp: now, message, type }]);
  };

  const updateStep = (id: string, status: StepStatus) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleDeploy = async () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setDeployedUrl(null);
    setLogs([]);
    setSteps(steps.map(s => ({ ...s, status: 'idle' })));

    try {
      // Step 1: Validate
      updateStep('validate', 'loading');
      addLog('Starting deployment process...', 'info');
      await new Promise(r => setTimeout(r, 800));
      addLog('Analyzing dependency tree...', 'info');
      await new Promise(r => setTimeout(r, 800));
      addLog('Code validation successful. Bundle size: 42KB', 'success');
      updateStep('validate', 'success');

      // Step 2: GitHub
      updateStep('github', 'loading');
      addLog(`Connecting to GitHub API...`, 'info');
      await new Promise(r => setTimeout(r, 1000));
      addLog(`Creating repository '${projectName}'...`, 'info');
      await new Promise(r => setTimeout(r, 1200));
      addLog(`Repository created: github.com/user/${projectName}`, 'success');
      updateStep('github', 'success');

      // Step 3: Push
      updateStep('push', 'loading');
      addLog('Initializing git...', 'info');
      await new Promise(r => setTimeout(r, 600));
      addLog('Staging files...', 'info');
      addLog('Committing: "Initial commit"', 'info');
      await new Promise(r => setTimeout(r, 1000));
      addLog('Pushing to origin/main...', 'success');
      updateStep('push', 'success');

      // Step 4: Vercel
      updateStep('vercel', 'loading');
      addLog('Triggering Vercel deployment hook...', 'info');
      await new Promise(r => setTimeout(r, 1500));
      addLog('Build started in container i-0a1b2c...', 'info');
      addLog('Installing dependencies...', 'info');
      await new Promise(r => setTimeout(r, 2000));
      addLog('Build completed in 2.4s', 'success');
      updateStep('vercel', 'success');

      // Step 5: Live
      updateStep('live', 'loading');
      addLog('Assigning domains...', 'info');
      await new Promise(r => setTimeout(r, 800));
      const url = `https://${projectName}.vercel.app`;
      addLog(`Deployment active at ${url}`, 'success');
      updateStep('live', 'success');
      
      setDeployedUrl(url);

    } catch (error) {
      addLog('An unexpected error occurred during deployment.', 'error');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Rocket className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              AutoDeployer
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white" title="Settings">
              <Settings size={20} />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-slate-800" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Project Config */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code2 size={20} className="text-blue-400" />
              Project Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Project Name</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-700 bg-slate-800 text-slate-400 text-sm">
                    github.com/user/
                  </span>
                  <input 
                    type="text" 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="flex-1 block w-full rounded-none rounded-r-md border border-slate-700 bg-slate-950 py-2 px-3 text-sm placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="my-awesome-app"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Application Code (App.tsx)</label>
                <div className="relative">
                  <textarea 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="block w-full h-64 rounded-md border border-slate-700 bg-slate-950 py-3 px-4 font-mono text-sm text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                    spellCheck={false}
                  />
                  <div className="absolute top-2 right-2 text-xs text-slate-600 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    TypeScript / React
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex items-center justify-between bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="text-sm text-slate-400">
              Ready to launch? This will create a repo and deploy it.
            </div>
            <button 
              onClick={handleDeploy}
              disabled={isDeploying}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/20",
                isDeploying 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 active:scale-95"
              )}
            >
              {isDeploying ? (
                <><Loader2 size={18} className="animate-spin" /> Deploying...</>
              ) : (
                <><Rocket size={18} /> Launch Project</>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Status */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Progress Stepper */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Play size={20} className="text-emerald-400" />
              Deployment Pipeline
            </h2>
            <div className="space-y-8 ml-2">
              {steps.map((step, idx) => (
                <StepIndicator 
                  key={step.id} 
                  step={step} 
                  index={idx} 
                  currentStepIndex={steps.findIndex(s => s.status === 'loading')} 
                />
              ))}
            </div>
          </div>

          {/* Terminal */}
          <TerminalView logs={logs} />

          {/* Success Card */}
          {deployedUrl && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-500 p-3 rounded-lg">
                  <Globe className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-400">Deployment Successful!</h3>
                  <p className="text-emerald-200/70 text-sm mt-1 mb-3">
                    Your application is now live on the edge network.
                  </p>
                  <a 
                    href="#" 
                    onClick={(e) => e.preventDefault()} 
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4"
                  >
                    {deployedUrl} <Github size={14} />
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
