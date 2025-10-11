import { api } from "./api";
import {
	BLEDevice,
	ScanResponse,
	ConnectResponse,
	ReadDataResponse,
} from "../types/ble.types";

export const bleService = {
	startScan: () => api.get<ScanResponse>("/ble/start-scan"),

	stopScan: () => api.post<{ message: string }>("/ble/stop-scan"),

	getScanStatus: () => api.get<{ isScanning: boolean }>("/ble/scan-status"),

	getDevices: () => api.get<BLEDevice[]>("/ble/devices"),

	connectToDevice: (deviceId: string) =>
		api.post<ConnectResponse>(`/ble/connect/${deviceId}`),

	getConnectedDevice: () => api.get<BLEDevice>("/ble/connected-device"),

	readData: (serviceId: string, characteristicId: string) =>
		api.get<ReadDataResponse>(
			`/ble/read-data/${serviceId}/${characteristicId}`
		),
};
