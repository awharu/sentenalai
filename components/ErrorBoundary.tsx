import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">System Error</h1>
            <p className="text-slate-400 mb-6">
              The application encountered an unexpected state. This has been logged for review.
            </p>
            <div className="bg-black/50 rounded p-4 mb-6 text-left overflow-auto max-h-32 border border-slate-800">
                <code className="text-red-400 text-xs font-mono">
                    {this.state.error?.message}
                </code>
            </div>
            <Button 
                onClick={() => window.location.reload()} 
                className="w-full flex items-center justify-center gap-2"
            >
                <RefreshCw size={16} />
                Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}