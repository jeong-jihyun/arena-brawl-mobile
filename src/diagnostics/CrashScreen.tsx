import React from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { CrashReport, buildIssueUrl, buildReportText } from './report';

type Props = { report: CrashReport; onDismiss: () => void };

export function CrashScreen({ report, onDismiss }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>오류가 발생했어요</Text>
      <ScrollView style={styles.box}>
        <Text selectable style={styles.text}>
          {buildReportText(report)}
        </Text>
      </ScrollView>
      <View style={styles.row}>
        <Pressable
          style={styles.btn}
          onPress={() => void Linking.openURL(buildIssueUrl(report))}
        >
          <Text style={styles.btnText}>GitHub 이슈로 보내기</Text>
        </Pressable>
        <Pressable
          style={styles.btn}
          onPress={() => void Share.share({ message: buildReportText(report) })}
        >
          <Text style={styles.btnText}>공유</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={onDismiss}>
          <Text style={styles.btnText}>닫고 계속</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#101827', padding: 16, paddingTop: 32 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  box: { flex: 1, backgroundColor: '#0b1220', borderRadius: 8, padding: 8 },
  text: { color: '#cbd5e1', fontSize: 11 },
  row: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btn: { flex: 1, backgroundColor: '#2563eb', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});
