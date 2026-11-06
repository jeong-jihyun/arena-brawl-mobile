# Arena Brawl — React Native 기본 실행 검증

현재 브랜치는 기존 미완성 게임 구현을 분리하고, **React Native 기본 화면이 Android에서 실행되는지 확인하기 위한 최소 프로젝트**입니다.

## 현재 구성
- Expo SDK 54
- React 19
- React Native 0.81
- TypeScript
- Android applicationId: `com.jeongjihyun.arenabrawl`

## 실행
```bash
npm install
npm run typecheck
npx expo start
```

Android 네이티브 프로젝트 실행:
```bash
npx expo prebuild --platform android
npm run android
```

## 기본 화면 확인
앱이 실행되면 다음 문구가 표시됩니다.
- ARENA BRAWL
- 앱이 정상 실행되었습니다
- React Native 기본 화면입니다.
- ANDROID RUNTIME OK

## Android 빌드 및 에뮬레이터 검증
GitHub Actions의 **Android app build** 워크플로가 다음을 수행합니다.
1. Expo 설정 및 Android JavaScript 번들 검증
2. Android 네이티브 프로젝트 생성
3. Release APK 빌드
4. Android 에뮬레이터에 APK 설치 및 앱 실행
5. 앱 프로세스 확인 및 화면 캡처
6. APK, 화면 캡처, logcat을 하나의 artifact로 업로드

빌드 산출물은 GitHub Actions 실행 페이지 하단의 **Artifacts**에서 다운로드합니다.

## 현재 범위와 제한
이 브랜치는 게임 플레이 구현이 아니라 **기본 React Native 화면의 빌드·실행 검증용**입니다. 게임 엔진, 화면 컴포넌트, 테스트 코드 등 현재 앱 진입점에서 사용하지 않는 기존 소스는 제거했습니다.

에뮬레이터 검증은 실제 삼성 휴대폰에서의 설치·실행 검증과는 별개입니다.
