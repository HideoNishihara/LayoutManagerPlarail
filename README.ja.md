# レイアウトマネージャー プラレール

**micro:bit と赤外線通信で、プラレールの列車やセンサーを制御・監視する拡張機能です。**

📄 [English version here](README.md)

## 主な機能

- プラレールの列車に赤外線コマンドを送信
- センサーユニットからの列車信号受信
- 列車ID（0〜1）の個別指定
- 進行方向・速度（停止＋７段階）の指定
- 電池電圧の監視（赤LEDで警告）
- ブロックは日本語・英語の両対応

## 使用できるブロック

### 🟦 列車制御

- **列車にコマンドを送信**  
  指定した列車の進行方向や速度を制御します。

- **進行方向の反転**  
  指定した列車の列車の進行方向を逆にします。

- **すべての列車を停止**  
  すべての列車を即座に停止します。

### 🟪 センサー受信イベント

- **センサーIDを指定してセンサー情報を受信**  
  センサーが列車の到着／離脱を検出したときに処理を実行します。

## ハードウェア構成

- **IR送信**：P1 → IR LED  
- **IR受信**：P16 ← IR受信モジュール（SPS-440 など）  
- **電池電圧監視**：P2（1/2に分圧されたアナログ入力）  
- **LED接続**：  
  - 赤LED（P14）：送信時・電圧低下時に点灯  
  - 青LED（P15）：IR信号を受信したときに点灯

## 詳細情報

プロジェクトページと詳細情報は以下にて公開：  
👉 [https://github.com/yourname/layout-manager-plarail](https://github.com/yourname/layout-manager-plarail)

---
