'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

export class PublicErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[public-shell] Render crash captured by boundary.', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="container-padding mx-auto max-w-3xl py-14 text-center">
          <h2 className="font-heading text-3xl">Something went wrong</h2>
          <p className="mt-3 text-sm text-muted">
            We hit a temporary display issue. Please refresh the page. If it continues, contact support.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
