//=========================================================
//	Layout Manager Plarail
//=========================================================

//% block="Layout Manager Plarail"
//% weight=100 color=#0fbc11 icon="\uf239"

namespace plarail {
/*
	//================================================
	//	列車の速度レベル（1～6の6段階）
	//================================================
    //% block="Train speed"
    export enum TrainSpeed {
        //% block="Level 1 (Very Slow)"
        Level1 = 1,
        //% block="Level 2 (Slow)"
        Level2 = 2,
        //% block="Level 3 (Slightly Slow)"
        Level3 = 3,
        //% block="Level 4 (Medium)"
        Level4 = 4,
        //% block="Level 5 (Fast)"
        Level5 = 5,
        //% block="Level 6 (Very Fast)"
        Level6 = 6
    }
	//================================================













	//================================================
	//	送信先ID=0 に速度データ（1～6）を送信
	//	@param speed 速度 (1～6)
	//------------------------------------------------
	//% blockId=plarail_send_speed_id0
	//% block="列車Ａに速度 %speed を送信"
	//% speed.min=1 speed.max=6 speed.defl=1
	export function sendSpeedToID0(speed: TrainSpeed): void {
		sendIR(0, speed);
	}
	//================================================

	//================================================
	//	送信先ID=1 に速度データ（1～6）を送信
	//	@param speed 速度 (1～6)
	//------------------------------------------------
	//% blockId=plarail_send_speed_id1
	//% block="列車1に速度 %speed を送信"
	//% speed.min=1 speed.max=6 speed.defl=3
	export function sendSpeedToID1(speed: TrainSpeed): void {
		sendIR(1, speed);
	}
	//================================================

    /**
     * IR送信処理本体（C++側のバインディング）
     * @param id 送信先ID
     * @param speed 速度
     */
    //% shim=plarail::sendIR
    function sendIR(id: number, speed: number): void {
        // C++側で実装される
        return;
    }
	//================================================






    //% blockId=plarail_send_ir
    //% block="send IR command | system id %id | direction %dir | speed %speed"
    //% id.min=0 id.max=15 dir.min=0 dir.max=3 speed.min=0 speed.max=15
    export function sendIR(id: number, dir: number, speed: number): void {
        const cmd = ((id & 0x0F) << 4) | ((dir & 0x03) << 2) | (speed & 0x03);
        sendIRNative(cmd);
    }

    //% blockId=plarail_on_ir_receive
    //% block="on IR received with system id %id do %handler"
    //% draggableParameters
    export function onIRReceive(id: number, handler: (cmd: number) => void): void {
        control.inBackground(function () {
            while (true) {
                const received = receiveIRNative();
                const receivedId = (received >> 4) & 0x0F;
                const payload = received & 0x0F;
                if (receivedId == id) {
                    handler(payload);
                }
                basic.pause(100);
            }
        });
    }

    //% shim=plarail::sendIRNative
    declare function sendIRNative(cmd: number): void;

    //% shim=plarail::receiveIRNative
    declare function receiveIRNative(): number;


*/

	//============================================================
	//	電池電圧の監視
	//		通常電圧時時：	青色LED点灯
	//		電池電圧低下時：赤色LED点灯
	//============================================================
	let voltageCheckInterval = 2000;		// ２秒ごとにチェック
	let voltageThreshold = 2.4;				// 2.4Vx2=4.8Vを下回った場合に、電圧低下と評価

	const BLUE_LED = DigitalPin.P15;		// 青色LEDの接続ポート
	const RED_LED = DigitalPin.P14;			// 赤色LEDの接続ポート

	//-----------------------------------------------------
	//	電圧監視を開始する
	//-----------------------------------------------------
	export function startVoltageMonitoring() {
		pins.digitalWritePin(BLUE_LED, 1);
		pins.digitalWritePin(RED_LED, 0);

		control.inBackground(function () {
			while (true) {
				const adc = pins.analogReadPin(AnalogPin.P2);
				const voltage = (adc * 3.3 / 1023) * 2;

				if (voltage <= voltageThreshold) {
					pins.digitalWritePin(BLUE_LED, 0);
					pins.digitalWritePin(RED_LED, 1);
				} else {
					pins.digitalWritePin(BLUE_LED, 1);
					pins.digitalWritePin(RED_LED, 0);
				}

				basic.pause(voltageCheckInterval);
			}
		});
	}
	//============================================================
}

//============================================================
// 起動直後に電圧監視を開始する
//============================================================
plarail.startVoltageMonitoring();
