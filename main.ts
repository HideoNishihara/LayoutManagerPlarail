//=========================================================
//	Layout Manager Plarail
//=========================================================

//% block="Layout Manager Plarail"
//% weight=100 color=#0fbc11 icon="\uf239"

namespace plarail {
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
    //% blockId=plarail_start_voltage_monitoring
    //% block="電圧監視を開始する"
    //% weight=90
    export function startVoltageMonitoring() {
		pins.digitalWritePin(BLUE_LED, 1);
		pins.digitalWritePin(RED_LED, 0);


    serial.writeLine("LED 強制点灯実行");

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
//plarail.startVoltageMonitoring();
serial.writeLine("main.ts 末尾まで実行済み");
