//% weight=100 color=#0fbc11 icon="" block="IR"
namespace IR {
    //% block="IR 送信 アドレス %addr コマンド %cmd"
    //% shim=IR::send
    export function sendIR(addr: number, cmd: number): void {
        // shimでC++に処理を委譲
    }

    //% block="IR 受信処理開始"
    //% shim=IR::startReceive
    export function startReceive(): void {
        // shimでC++に処理を委譲
    }
}
