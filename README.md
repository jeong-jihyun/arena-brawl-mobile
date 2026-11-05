# Arena Brawl — React Native

기존 브라우저 HTML 데모를 대체하는 **React Native + TypeScript + Expo + Shopify Skia** Android 게임 프로젝트입니다. 오리지널 아레나 슈터 프로토타입이며 기존 게임의 캐릭터/아트/상표를 복제하지 않습니다.

## 기술 스택
- Expo SDK 54 / React Native 0.81 / React 19
- TypeScript strict mode
- Shopify React Native Skia Canvas 렌더링
- PanResponder 가상 조이스틱
- Android applicationId: `com.jeongjihyun.arenabrawl`

## 구조
```
App.tsx, index.ts, app.json, package.json, tsconfig.json
src/components/{ActionButton,GameCanvas,VirtualJoystick}.tsx
src/game/{engine,types,useGameLoop}.ts
src/screens/GameScreen.tsx
src/theme.ts
```

## 실행
Node.js LTS와 Android Studio / Android SDK가 필요합니다.
```bash
npm install
npx expo install --check
npm run typecheck
npx expo start
```
Android 기기/에뮬레이터:
```bash
npm run android
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug
```
APK 출력: `android/app/build/outputs/apk/debug/app-debug.apk`

## 구현 기능
- 가로 화면 아레나 및 Skia 렌더링
- 가상 조이스틱 이동, 공격 버튼 연속 발사
- 적 추적 AI 및 원거리 공격
- 장애물 충돌, 투사체, HP/점수
- 범위형 특수 공격과 쿨다운
- 승리/패배 및 재시작

## 아직 구현하지 않은 범위
온라인 멀티플레이, 계정/매치메이킹, 캐릭터 선택/성장, 정식 아트/사운드, 스토어 배포 서명은 미포함입니다. 서버와 별도 에셋/릴리스 파이프라인이 필요합니다.