#include "pxt.h"
#include "plarail.h"

#define IR_PIN MICROBIT_PIN_P1

namespace plarail {
/*
    // 38kHzキャリアを指定時間だけ出力（PWM）
    void sendMark(int duration_us) {
        IR_PIN->setAnalogPeriodUs(26);    // 約38.5kHz
        IR_PIN->setAnalogValue(512);      // 約50% duty

        wait_us(duration_us);

        IR_PIN->setAnalogValue(0);        // 停止
    }

    // 無信号時間（LOW）
    void sendSpace(int duration_us) {
        IR_PIN->setAnalogValue(0);
        wait_us(duration_us);
    }

    void sendBit(bool bit) {
        sendMark(562);
        if (bit)
            sendSpace(1687);
        else
            sendSpace(562);
    }

    void sendByte(uint8_t data) {
        for (int i = 0; i < 8; i++) {
            sendBit(data & 0x80);
            data <<= 1;
        }
    }
*/



    void sendIR(int id, int dir, int speed) {
/*
        // データ作成：下位4bit + 上位反転4bit（合計8bit）
        uint8_t data = ((id & 0x0F) << 4) | ((dir & 0x03) << 2) | (speed & 0x03);
        uint8_t d = data & 0x0F;
        uint8_t dInv = ~d & 0x0F;
        uint8_t payload = d | (dInv << 4);


        //payload = 0b10010110;
        payload = 0x96;



        sendMark(9000);   // 9ms
        sendSpace(4500);  // 4.5ms

        sendByte(payload);

        sendMark(562);    // 終了ビット
        sendSpace(0);
*/
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