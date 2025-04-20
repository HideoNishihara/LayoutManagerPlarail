//% weight=100 color=#0fbc11 icon="\uf1b9" block="IR Train"
namespace IRTrain {

    let lastCmd = 0
    let lastAddr = 0

    /**
     * IR受信監視を開始する
     */
    //% block="IR信号の受信を開始する"
    export function startReceiving() {
        control.inBackground(() => {
            while (true) {
                let value = IRReceiver.peek()  // 自作関数として想定
                if (value != -1) {
                    let data = value & 0xFF
                    lastCmd = (data >> 1) & 0x07
                    lastAddr = (data >> 4) & 0x0F
                    let parity = data & 0x01
                    if (checkParity(data >> 1, parity)) {
                        control.raiseEvent(3100 + lastAddr, lastCmd)
                    }
                }
                basic.pause(50)
            }
        })
    }

    function checkParity(data: number, parity: number): boolean {
        let count = 0
        for (let i = 0; i < 7; i++) {
            if ((data >> i) & 1) count++
        }
        return (count % 2) == parity
    }

    /**
     * IRコマンドを送信する（将来的にID/方向/速度で）
     */
    //% block="列車ID %id に コマンド %cmd を送信"
    //% id.min=0 id.max=15
    //% cmd.min=0 cmd.max=7
    export function sendCommand(id: number, cmd: number) {
        let data = ((id & 0x0F) << 4) | ((cmd & 0x07) << 1)
        let parity = 0
        for (let i = 1; i < 8; i++) {
            if ((data >> i) & 1) parity ^= 1
        }
        data |= parity
        IRSender.send(data)  // 自作関数として想定
    }

    /**
     * 受信イベントに応じた処理を登録
     */
    //% block="列車ID %id のコマンド %cmd を受信したとき"
    //% id.min=0 id.max=15
    //% cmd.min=0 cmd.max=7
    export function onCommandReceived(id: number, cmd: number, handler: () => void) {
        control.onEvent(3100 + id, cmd, handler)
    }
}
