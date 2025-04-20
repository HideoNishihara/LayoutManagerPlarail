// infrared.ts
// 自作IR送受信関数の実装（micro:bit用）

namespace IRReceiver {
    let lastValue = -1
    let receiving = false

    // 受信バッファから1バイト読み取る関数（疑似）
    export function peek(): number {
        if (receiving) return -1

        let value = receiveIR()
        if (value != -1) {
            lastValue = value
            return value
        }
        return -1
    }

    // 実際の受信処理（簡易実装）
    function receiveIR(): number {
        // ここで P16 をポーリングして信号のON/OFF長さを読み取り
        // NECフォーマットに基づくデコード処理を実装

        // ★以下はテスト用に適当な値を返しているだけです★
        // 38kHzキャリアでエンコードされた信号を適切に復調する必要があります
        return -1  // 何も受信していないとき
    }
}


namespace IRSender {
    const IR_PIN = DigitalPin.P0

    // キャリア送信ON（38kHz）
    function markMicros(microseconds: number) {
        const period = 26 // 約38kHz = 26us周期
        const pulseWidth = 13
        const count = microseconds / period
        for (let i = 0; i < count; i++) {
            pins.digitalWritePin(IR_PIN, 1)
            control.waitMicros(pulseWidth)
            pins.digitalWritePin(IR_PIN, 0)
            control.waitMicros(period - pulseWidth)
        }
    }

    // スペース（LOWレベル保持）
    function spaceMicros(microseconds: number) {
        pins.digitalWritePin(IR_PIN, 0)
        control.waitMicros(microseconds)
    }

    // 1ビット送信（0 or 1）
    function sendBit(bit: number) {
        markMicros(560)
        if (bit) {
            spaceMicros(1690)
        } else {
            spaceMicros(560)
        }
    }

    // 8bit送信
    function sendByte(data: number) {
        for (let i = 0; i < 8; i++) {
            sendBit((data >> (7 - i)) & 0x01)
        }
    }

    // リーダー（先頭）
    function sendLeader() {
        markMicros(9000)
        spaceMicros(4500)
    }

    // 公開関数
    export function send(data: number): void {
        sendLeader()
        sendByte(data)
    }
}
