
#include "pxt.h"
using namespace pxt;

namespace plarail {
    //% shim=plarail::sendIRNative
    void sendIRNative(int data) {
        // P1にIR信号送信（ユーザー定義のプロトコルに合わせて実装）
        // 仮実装：ピンのトグルでプレースホルダ
        auto pin = LOOKUP_PIN(P1);
        for (int i = 0; i < 16; ++i) {
            pin->setDigitalValue(1);
            wait_us(200);
            pin->setDigitalValue(0);
            wait_us(200);
        }
    }

    //% shim=plarail::receiveIRNative
    int receiveIRNative() {
        // 実際のIR受信処理をここに記述（割り込み/タイミング取得など）
        return -1; // 仮: 受信なし
    }
}
