export interface BLEDevice {
	id: string;
	name: string;
	uuid: string;
	address?: string;
	addressType?: string;
	connectable?: boolean;
	rssi?: number;
	txPowerLevel?: number;
	serviceUuids?: string[];
	manufacturerData?: string;
}

export interface ScanResponse {
	message: string;
}

export interface ConnectResponse {
	message: string;
}

export interface ReadDataResponse {
	data: string;
}
