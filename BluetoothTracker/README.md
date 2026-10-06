# 블루투스 기기 추적 (Android)

삼성 SmartThings '기기 찾기'처럼, 선택한 블루투스 기기(이어폰, 워치, 차량 등)가
**폰과 연결된 시점·장소**와 **연결이 끊긴 시점·장소**를 자동으로 기록하는 앱입니다.

## 기능
- 페어링된 기기 중 추적할 기기 선택
- 연결/해제 순간 시각 + GPS 위치(정확도 포함) 저장, 주소로 자동 변환
- 기기별 현재 상태(연결됨 / 연결 끊김)와 "여기서 연결이 끊겼어요" 마지막 위치 카드
- 날짜별 타임라인, 기기별 필터
- 기록을 눌러 지도 앱(구글 지도·네이버 지도 등)에서 위치 열기 — API 키 불필요
- 앱이 꺼져 있어도 동작

## 동작 방식
| 단계 | 구현 |
|---|---|
| 연결/해제 감지 | `ACL_CONNECTED` / `ACL_DISCONNECTED` 브로드캐스트를 매니페스트 리시버로 수신 (Android 8+ 암시적 브로드캐스트 제한 예외 항목이라 앱이 꺼져 있어도 수신됨) |
| 위치 | ① 마지막 위치로 즉시 저장 → ② 최대 7초 동안 현재 위치를 새로 측정해 덮어씀 (Fused Location) |
| 저장 | Room(SQLite) |
| 주소 | 앱을 열 때 `Geocoder`로 좌표 → 주소 변환 |
| UI | Jetpack Compose + Material 3 |

```
app/src/main/java/com/example/bttracker/
├── TrackerApp.kt                  Application (DB 보관)
├── data/                          Room 엔티티·DAO·DB
├── tracking/
│   ├── BluetoothEventReceiver.kt  연결/해제 브로드캐스트 수신
│   ├── EventRecorder.kt           이벤트 + 위치 저장
│   ├── LocationProvider.kt        Fused Location 래퍼
│   ├── AddressResolver.kt         역지오코딩
│   └── Permissions.kt
└── ui/                            Compose 화면, ViewModel
```

## 빌드 / 실행
1. Android Studio(Ladybug 이상)에서 `BluetoothTracker` 폴더를 엽니다.
2. Gradle 동기화 후 실제 폰에 실행합니다. (에뮬레이터는 블루투스가 안 됩니다.)

또는 커맨드라인: `./gradlew installDebug`

- minSdk 26 (Android 8.0), targetSdk 35

## 처음 실행할 때 설정
1. **권한 허용**: 근처 기기(블루투스), 위치
2. **위치 권한 '항상 허용'**: 앱이 꺼져 있을 때 위치를 기록하는 데 필요합니다. 앱 안의 안내 배너를 누르면 설정 화면으로 이동합니다.
3. **배터리 '제한 없음'** (삼성 갤럭시 권장): 설정 → 애플리케이션 → 블루투스 기기 추적 → 배터리 → **제한 없음**.
   One UI의 '절전 상태 앱' / '깊은 절전 상태 앱' 목록에 들어가면 브로드캐스트를 받지 못합니다.
4. 기기 탭에서 **기기 추가** → 추적할 기기 선택

## 한계
- 기록은 **폰의 위치**입니다. 연결이 끊긴 순간 폰이 있던 곳 = 기기를 두고 온 곳(대략 블루투스 범위 10m 이내)을 추정하는 방식입니다.
  SmartThings Find처럼 주변 갤럭시 폰 네트워크로 기기를 찾는 기능은 아닙니다.
- 실내나 GPS가 약한 곳에서는 위치 정확도가 떨어지거나, 7초 안에 새 위치를 못 얻으면 마지막 위치가 저장됩니다
  (기록에 "N분 전 측정된 위치"로 표시).
- 블루투스 클래식/BLE의 ACL 연결 기준입니다. 연결을 유지하지 않고 광고만 하는 기기(태그류)는 감지하지 않습니다.
