#include "pxt.h"
using namespace pxt;

namespace IR {
    void send(uint8_t address, uint8_t command) {
        // 実際のIR送信処理をここに記述（GPIOなど）
    }

    void startReceive() {
        // 受信割り込みなどの初期化処理
    }
}
