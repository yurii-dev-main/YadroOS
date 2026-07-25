import { Component, ErrorInfo, ReactNode } from 'react';

interface CRMErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface CRMErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class CRMErrorBoundary extends Component<CRMErrorBoundaryProps, CRMErrorBoundaryState> {
  state: CRMErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): CRMErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('CRM module error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-lg border border-danger/20 bg-danger/10 p-6 text-danger-foreground">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm opacity-80">Please refresh the page or contact your administrator.</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
