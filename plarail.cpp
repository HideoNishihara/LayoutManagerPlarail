#include "pxt.h"
#include "plarail.h"

namespace plarail {
    void sendIR(int id, int dir, int speed) {
        // 実装例：IRフォーマット生成＆IR-LED送信（P1接続）
        // 送信タイミングやPWM出力はここに記述
        // ★この関数はMakeCodeから呼び出されます
    }


    // センサーデータの受信（例：P16から読み取ってIDとイベントを返す）
    // 上位4bitがセンサーID（0〜15）、下位4bitがイベント種別（0〜2）

    int receiveIRSensorNative() {
        // 例：P16から受信 → ID:3, イベント:1（明度検出）なら 0x31 を返す
        // 実装はIRプロトコルに応じて記述してください
        // 今は仮に毎回 ID:0, Event:0 を返す（デバッグ用）
        return 0x00;
    }
}
