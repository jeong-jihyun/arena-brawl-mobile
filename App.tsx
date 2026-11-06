import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function App() {
  return (
    <View style={styles.screen}>
      <StatusBar hidden />
      <View style={styles.panel}>
        <Text style={styles.kicker}>ARENA BRAWL</Text>
        <Text style={styles.title}>앱이 정상 실행되었습니다</Text>
        <Text style={styles.message}>
          React Native 기본 화면입니다.
        </Text>
        <View style={styles.status}>
          <View style={styles.dot} />
          <Text style={styles.statusText}>ANDROID RUNTIME OK</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101827',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  panel: {
    width: '100%',
    maxWidth: 640,
    minHeight: 260,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#34445d',
    backgroundColor: '#1b2940',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  kicker: {
    color: '#ffbd59',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 18,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    color: '#c4d0e0',
    fontSize: 17,
    marginTop: 14,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: '#123c35',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#43e0a1',
    marginRight: 10,
  },
  statusText: {
    color: '#8af0c6',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
