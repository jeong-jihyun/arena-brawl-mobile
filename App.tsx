import React, { useState } from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

type GameScreenComponent = React.ComponentType;

export default function App() {
  const [GameScreen, setGameScreen] = useState<GameScreenComponent | null>(null);
  const [loadError, setLoadError] = useState('');

  const openGame = () => {
    try {
      // Load the Skia-backed game only after the native startup screen is visible.
      const gameModule = require('./src/screens/GameScreen') as {
        GameScreen: GameScreenComponent;
      };
      setGameScreen(() => gameModule.GameScreen);
      setLoadError('');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setLoadError(message);
    }
  };

  if (GameScreen) {
    return <GameScreen />;
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar hidden />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>ARENA BRAWL / STARTUP CHECK</Text>
        <Text style={styles.title}>앱 기본 실행 성공</Text>
        <Text style={styles.description}>
          이 화면은 게임 그래픽 엔진을 불러오기 전의 기본 Android 화면입니다.
          먼저 이 화면이 유지되는지 확인하고, 아래 버튼으로 게임 화면을 별도로 실행합니다.
        </Text>
        <Pressable accessibilityRole="button" onPress={openGame} style={styles.button}>
          <Text style={styles.buttonText}>게임 화면 실행</Text>
        </Pressable>
        {loadError ? (
          <Text selectable style={styles.error}>
            게임 화면 로딩 오류: {loadError}
          </Text>
        ) : null}
        <Text style={styles.note}>
          이 진단 버전은 시작 화면과 게임 렌더링 단계를 분리해 종료 원인을 좁히기 위한 버전입니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#101827' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  eyebrow: { color: '#8da7c5', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 14 },
  title: { color: '#ffffff', fontSize: 27, fontWeight: '900', marginBottom: 14 },
  description: { color: '#d5deea', fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 520 },
  button: { marginTop: 28, backgroundColor: '#ffb347', paddingHorizontal: 28, paddingVertical: 15, borderRadius: 14 },
  buttonText: { color: '#25170a', fontSize: 16, fontWeight: '900' },
  error: { color: '#ff9292', marginTop: 18, textAlign: 'center' },
  note: { color: '#91a0b4', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 28, maxWidth: 520 },
});
