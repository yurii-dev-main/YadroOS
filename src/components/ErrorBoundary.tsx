/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-200">
          <div className="flex max-w-md flex-col items-center space-y-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl backdrop-blur-xl">
            <div className="rounded-full bg-red-500/20 p-4 text-red-400">
              <AlertTriangle className="h-12 w-12" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-100">Something went wrong</h1>
              <p className="text-sm text-slate-400">
                An unexpected error occurred in the application. We've logged the issue and are
                looking into it.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full rounded-lg bg-slate-950 p-4 text-left overflow-auto max-h-32">
                <p className="font-mono text-xs text-red-400 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button onClick={this.handleReset} className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
              <Button variant="outline" onClick={this.handleGoHome} className="w-full gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
