declare namespace IRReceiver {
    // 受信バッファから1つ読み出す（なければ -1）
    function peek(): number;
}

declare namespace IRSender {
    // データ送信（先頭パルス等含めて）
    function send(data: number): void;
}
