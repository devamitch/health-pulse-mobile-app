// components/subscription/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from './colors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, stackTrace: ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to your analytics service
    console.error(
      `Error in ${this.props.componentName || 'component'}:`,
      error,
      errorInfo,
    );
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.resetError}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.error || '#e53e3e',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#4A5568',
  },
  button: {
    backgroundColor: COLORS.primary || '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
