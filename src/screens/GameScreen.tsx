import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../components/ActionButton';
import { GameCanvas } from '../components/GameCanvas';
import { VirtualJoystick } from '../components/VirtualJoystick';
import { useGameLoop } from '../game/useGameLoop';
import { palette } from '../theme';

export function GameScreen() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [arena, setArena] = useState({ width: screenWidth, height: screenHeight - 82 });
  const { game, setJoystick, setAttacking, start, special } = useGameLoop(arena.width, arena.height);

  useEffect(() => {
    setArena({ width: screenWidth, height: Math.max(220, screenHeight - 82) });
  }, [screenWidth, screenHeight]);

  const playing = game.status === 'playing';
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <View style={styles.stat}><Text style={styles.statLabel}>HP</Text><Text style={styles.statValue}>{Math.ceil(game.player.hp)}</Text></View>
          <Text style={styles.title}>ARENA BRAWL</Text>
          <View style={styles.stat}><Text style={styles.statLabel}>SCORE</Text><Text style={styles.statValue}>{game.score}</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>ENEMIES</Text><Text style={styles.statValue}>{game.enemies.length}</Text></View>
        </View>
        <View style={styles.arena} onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setArena((old) => old.width === width && old.height === height ? old : { width, height });
        }}>
          <GameCanvas game={game} width={arena.width} height={arena.height} />
          {!playing && (
            <View style={styles.overlay}>
              <Text style={styles.overlayTitle}>{game.status === 'won' ? 'VICTORY!' : game.status === 'lost' ? 'DEFEAT' : 'READY TO BRAWL?'}</Text>
              <Text style={styles.overlayText}>{game.status === 'won' ? '모든 적을 물리쳤습니다.' : game.status === 'lost' ? '체력이 모두 소진되었습니다.' : '가상 조이스틱으로 이동하고 공격하세요.'}</Text>
              <Pressable onPress={start} style={styles.startButton}><Text style={styles.startText}>{game.status === 'ready' ? '전투 시작' : '다시 시작'}</Text></Pressable>
            </View>
          )}
        </View>
        <View style={styles.controls}>
          <VirtualJoystick onChange={setJoystick} />
          <View style={styles.actionGroup}>
            <ActionButton label="특수기" color={palette.special} size={66} onPress={special} disabled={!playing || !game.specialReady} />
            <ActionButton label="공격" color={palette.accent} onPressIn={() => setAttacking(true)} onPressOut={() => setAttacking(false)} disabled={!playing} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  root: { flex: 1, backgroundColor: palette.background },
  topBar: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 10 },
  title: { color: palette.text, fontWeight: '900', letterSpacing: 2, fontSize: 16 },
  stat: { minWidth: 48, alignItems: 'center' },
  statLabel: { color: palette.muted, fontSize: 9, fontWeight: '800' },
  statValue: { color: palette.text, fontWeight: '900', fontSize: 15 },
  arena: { flex: 1, overflow: 'hidden', marginHorizontal: 8, borderRadius: 18 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#08111dcc', alignItems: 'center', justifyContent: 'center', padding: 20 },
  overlayTitle: { color: palette.text, fontWeight: '900', fontSize: 28, letterSpacing: 1 },
  overlayText: { color: palette.muted, fontSize: 13, marginTop: 8, marginBottom: 18, textAlign: 'center' },
  startButton: { backgroundColor: palette.accent, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
  startText: { color: '#25170a', fontSize: 16, fontWeight: '900' },
  controls: { height: 128, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 16 },
});