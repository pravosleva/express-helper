import DeviceDetector from 'device-detector-js'

const deviceDetector = new DeviceDetector()

export const getParsedUserAgent = (socket: any): DeviceDetector.DeviceDetectorResult => deviceDetector.parse(socket.handshake.headers['user-agent'])