import express, { Request, Response } from "express";
import noble, { Peripheral } from "@abandonware/noble";

const app = express();
const port = 3000;

const discoveredDevices: Map<
	string,
	{ id: string; name: string; uuid: string }
> = new Map();
let connectedDevice: Peripheral | null = null;

noble.on("stateChange", (state: string) => {
	if (state === "poweredOn") {
		console.log("BLE powered on. Ready to scan.");
	} else {
		console.log("BLE not powered on. Stopping scan.");
		noble.stopScanning();
	}
});

noble.on("discover", (peripheral: Peripheral) => {
	if (!discoveredDevices.has(peripheral.id)) {
		discoveredDevices.set(peripheral.id, {
			id: peripheral.id,
			name: peripheral.advertisement.localName || "Unknown",
			uuid: peripheral.uuid,
		});

		console.log(
			`Discovered device: ${
				peripheral.advertisement.localName || "Unknown"
			} (${peripheral.id})`
		);
	}
});

app.get("/start-scan", (req: Request, res: Response) => {
	noble.startScanning([], true, (err: Error | null | undefined) => {
		if (err) {
			console.error("Error starting scan:", err);
			return res.status(500).json({ error: "Failed to start scan" });
		}
		console.log("Scanning started...");
		res.json({ message: "Scanning started" });
	});
});

app.get("/devices", (req: Request, res: Response) => {
	const devices = Array.from(discoveredDevices.values());
	res.json(devices);
});

app.post("/connect/:deviceId", (req: Request, res: Response) => {
	const { deviceId } = req.params;
	const deviceInfo = discoveredDevices.get(deviceId);

	if (!deviceInfo) {
		return res.status(404).json({ error: "Device not found" });
	}

	const peripheral = Array.from(
		(noble as any)._peripherals.values() as Iterable<Peripheral>
	).find((p) => p.id === String(deviceId));

	if (!peripheral) {
		return res.status(404).json({ error: "Peripheral not found" });
	}

	peripheral.connect((error?: string) => {
		if (error) {
			console.error("Connection error:", error);
			return res.status(500).json({ error: "Failed to connect to device" });
		}

		console.log(`Connected to device: ${deviceInfo.name}`);
		connectedDevice = peripheral;
		res.json({ message: "Connected to device", device: deviceInfo });
	});
});

app.get("/connected-device", (req: Request, res: Response) => {
	if (!connectedDevice) {
		return res.status(404).json({ error: "No device connected" });
	}

	res.json({
		id: connectedDevice.id,
		name: connectedDevice.advertisement.localName || "Unknown",
		uuid: connectedDevice.uuid,
	});
});

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
