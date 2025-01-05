const noble = require("@abandonware/noble");

// BLE 스캔 시작
noble.on("stateChange", (state) => {
	if (state === "poweredOn") {
		console.log("Starting BLE scan...");
		noble.startScanning();
	} else {
		noble.stopScanning();
	}
});

// 장치 발견 이벤트
noble.on("discover", (peripheral) => {
	console.log(
		`Discovered device: ${peripheral.advertisement.localName || "Unknown"}`
	);
	console.log(`UUID: ${peripheral.uuid}`);
	console.log("---------------------------------");
});
