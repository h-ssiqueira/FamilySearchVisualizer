import { Component, type ErrorInfo, type ReactNode } from 'react';
import { getLocale, translate } from '@/i18n';

interface State {
  failed: boolean;
}

/** Last line of defence: shows a friendly message and logs only the error class (no personal data). */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, _info: ErrorInfo): void {
    console.error('Unhandled UI error:', error.name);
  }

  override render(): ReactNode {
    if (this.state.failed) {
      return (
        <main className="screen">
          <p role="alert">{translate(getLocale(), 'error.generic')}</p>
        </main>
      );
    }
    return this.props.children;
  }
}
