#include "pxt.h"
using namespace pxt;

namespace plarail {
	void sendIR(int id, int speed) {
		// 実際の赤外線送信ロジックを書く
		// ここではデバッグ出力の例：
		DMESG("Send IR to ID=%d, speed=%d", id, speed);
	}
}
