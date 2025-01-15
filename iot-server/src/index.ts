import express, { Request, Response } from "express";
import noble, { Peripheral } from "@abandonware/noble";

const app = express();
const port = 3000;

const discoveredDevices: Map<
	string,
	{ name: string; uuid: string; peripheral: Peripheral }
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
			name: peripheral.advertisement.localName || "Unknown",
			uuid: peripheral.uuid,
			peripheral,
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

	if (!deviceInfo || !deviceInfo.peripheral) {
		return res.status(404).json({ error: "Device not found" });
	}

	const { peripheral } = deviceInfo;

	peripheral.connect((error?: string) => {
		if (error) {
			console.error("Connection error:", error);
			return res.status(500).json({ error: "Failed to connect to device" });
		}

		console.log(`Connected to device: ${deviceInfo.name}`);
		connectedDevice = peripheral;
		res.json({
			message: "Connected to device",
			device: deviceInfo.peripheral,
		});
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

app.get(
	"/read-data/:serviceId/:characteristicId",
	async (req: Request, res: Response) => {
		const { serviceId, characteristicId } = req.params;

		if (!connectedDevice) {
			return res.status(404).json({ error: "No device connected" });
		}

		try {
			// Discover services and characteristics
			connectedDevice.discoverSomeServicesAndCharacteristics(
				[serviceId],
				[characteristicId],
				(error, services, characteristics) => {
					if (error) {
						console.error(
							"Error discovering services/characteristics:",
							error
						);
						return res
							.status(500)
							.json({
								error: "Failed to discover services/characteristics",
							});
					}

					if (!characteristics || characteristics.length === 0) {
						return res
							.status(404)
							.json({ error: "Characteristic not found" });
					}

					// Read the first matching characteristic
					const characteristic = characteristics[0];
					characteristic.read((err, data) => {
						if (err) {
							console.error("Error reading characteristic:", err);
							return res
								.status(500)
								.json({ error: "Failed to read characteristic" });
						}

						console.log(
							`Data from characteristic: ${data.toString("hex")}`
						);
						res.json({ data: data.toString("hex") });
					});
				}
			);
		} catch (err) {
			console.error("Unexpected error:", err);
			res.status(500).json({ error: "Unexpected error occurred" });
		}
	}
);

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
