import { Component, ErrorInfo, ReactNode } from 'react';
import { EmptyState } from './EmptyState';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in AuraStore Client:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px 20px' }}>
          <EmptyState
            type="error"
            title="A rendering error occurred"
            description="Our engine encountered an unexpected layout rendering issue. Please reload the page."
            actionText="Refresh App"
            actionPath="/"
          />
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
