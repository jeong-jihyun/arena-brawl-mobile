import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CrashGate } from './src/diagnostics/CrashGate';
import { GameScreen } from './src/screens/GameScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <CrashGate>
        <GameScreen />
      </CrashGate>
    </SafeAreaProvider>
  );
}
