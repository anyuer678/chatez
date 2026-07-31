import { Component, ReactNode } from 'react';
import { AppLayout } from './components/Layout';
import { useTheme } from './hooks/useTheme';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', fontFamily: 'serif', color: '#5a4a3a', background: '#faf6ed', padding: '2rem',
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>书房里出了点状况</h1>
          <p style={{ color: '#8a7a6a', marginBottom: '1rem' }}>
            {this.state.error?.message || '未知错误'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              padding: '0.5rem 1.5rem', border: '1px dashed #b0a090', borderRadius: '8px',
              background: 'transparent', color: '#5a4a3a', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            重新加载
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  useTheme();
  return (
    <ErrorBoundary>
      <AppLayout />
    </ErrorBoundary>
  );
}

export default App;
