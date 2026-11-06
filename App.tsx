import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { GameScreen } from './src/screens/GameScreen';

type BoundaryState = { error: Error | null };

class AppErrorBoundary extends React.Component<React.PropsWithChildren, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ArenaBrawl] React render failure:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.errorScreen}>
          <Text style={styles.errorTitle}>ARENA BRAWL 시작 오류</Text>
          <Text style={styles.errorMessage}>
            화면을 표시하는 중 오류가 발생했습니다. 아래 내용을 지원팀에 전달해 주세요.
          </Text>
          <Text selectable style={styles.errorDetails}>
            {this.state.error.name}: {this.state.error.message}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <AppErrorBoundary>
        <GameScreen />
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorScreen: {
    flex: 1,
    backgroundColor: '#101827',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  errorTitle: {
    color: '#ffad42',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
  },
  errorMessage: {
    color: '#f4f7fb',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorDetails: {
    color: '#ff9b9b',
    fontSize: 12,
    textAlign: 'center',
  },
});
