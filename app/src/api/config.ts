import { Platform } from 'react-native';

/**
 * Where the app finds the Rupsuhana server.
 *
 * - iOS simulator: localhost works directly.
 * - Android emulator: 10.0.2.2 is the emulator's alias for your computer.
 * - Real phone: set DEV_HOST to your computer's Wi-Fi IP (e.g. "192.168.0.105")
 *   and make sure the phone is on the same network.
 * - Release builds: set PRODUCTION_URL to your deployed HTTPS server.
 */
const DEV_HOST: string | null = null;
const DEV_PORT = 3000;
const PRODUCTION_URL = 'https://api.rupsuhana.com';

const devHost =
  DEV_HOST ?? (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

export const SERVER_URL = __DEV__
  ? `http://${devHost}:${DEV_PORT}`
  : PRODUCTION_URL;

export const API_URL = `${SERVER_URL}/api`;

/** Turns an image path from the API ("/uploads/x.jpg") into a full URL. */
export const imageUri = (path: string) =>
  /^https?:\/\//.test(path) ? path : `${SERVER_URL}${path}`;
