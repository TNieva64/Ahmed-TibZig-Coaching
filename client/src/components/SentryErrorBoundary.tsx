/**
 * ErrorBoundary Sentry — Capture les erreurs React
 */

import { Component, ReactNode } from 'react';
import { captureException, captureMessage } from './lib/sentry';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SentryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Capturer l'erreur dans Sentry
    captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI personnalisé
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-md w-full p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Oups ! Une erreur est survenue
              </h1>
              <p className="text-gray-600 mb-6">
                L'équipe a été notifiée et nous travaillons sur une solution.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Retour à l'accueil
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Réessayer
                </Button>
              </div>
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Détails techniques
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {this.state.error?.stack}
                </pre>
              </details>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
