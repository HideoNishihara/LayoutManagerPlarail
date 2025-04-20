#include "pxt.h"
using namespace pxt;

namespace plarail {
    static uint8_t lastAddr = 0;
    static uint8_t lastCmd = 0;
    static float lowVoltageThreshold = 3.7;

    void sendIRNative(int id, int direction, int speed) {
        // ここにIR送信のネイティブコードを書く（例: P1から38kHzキャリア）
        // 送信後にP14（赤）LEDを50ms点灯
    }

    void setLowVoltageThresholdNative(float voltage) {
        lowVoltageThreshold = voltage;
    }

    int getLastSystemAddressNative() {
        return lastAddr;
    }

    int getLastCommandNative() {
        return lastCmd;
    }

    // この関数はIR受信完了後に呼ばれ、イベントを発火
    void onIRReceived(uint8_t addr, uint8_t cmd) {
        lastAddr = addr;
        lastCmd = cmd;
        MicroBitEvent(3141, 1);
        // 青LED（P15）を50ms点灯
    }

    // バッテリ電圧監視処理はバックグラウンドタスクなどでP2を監視
}
