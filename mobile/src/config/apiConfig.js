import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

const STORAGE_KEY_API_URL = '@tms_api_base_url';

export const CURRENT_LAN_IP = '10.131.139.46';
export const DEFAULT_LAN_IP = CURRENT_LAN_IP;
export const DEFAULT_PORT = '5000';

export const detectHostIp = () => {
  // 1. Web browser
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'localhost';
      }
      return window.location.hostname;
    }
  }

  // 2. Expo Go mobile hostUri (e.g. "10.131.139.46:8081" or "10.131.139.46:8082")
  try {
    const hostUri =
      Constants?.expoConfig?.hostUri ||
      Constants?.manifest?.debuggerHost ||
      Constants?.manifest2?.extra?.expoClient?.hostUri;

    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }
  } catch (e) {
    // Ignore error
  }

  // 3. React Native SourceCode scriptURL
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/https?:\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return match[1];
      }
    }
  } catch (e) {
    // Ignore error
  }

  // 4. Default fallback to current detected network IP
  return CURRENT_LAN_IP;
};

export const getDefaultApiUrl = () => {
  const host = detectHostIp();
  return `http://${host}:${DEFAULT_PORT}`;
};

let currentApiUrl = getDefaultApiUrl();

export const getApiBaseUrl = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY_API_URL);
    if (saved) {
      currentApiUrl = saved;
      return saved;
    }
  } catch (e) {
    console.warn('Failed to load saved API URL:', e);
  }
  currentApiUrl = getDefaultApiUrl();
  return currentApiUrl;
};

export const setApiBaseUrl = async (url) => {
  try {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `http://${cleanUrl}`;
    }
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    currentApiUrl = cleanUrl;
    await AsyncStorage.setItem(STORAGE_KEY_API_URL, cleanUrl);
    return cleanUrl;
  } catch (e) {
    console.error('Failed to save API URL:', e);
    return currentApiUrl;
  }
};

export const getCurrentCachedApiUrl = () => {
  return currentApiUrl || getDefaultApiUrl();
};

export const pingServer = async (testUrl) => {
  const target = testUrl || (await getApiBaseUrl());
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${target}/`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: true, message: data.message || 'Connected to TMS Backend' };
    }
    return { success: false, message: `Server replied with HTTP ${res.status}` };
  } catch (err) {
    return { success: false, message: err.message || 'Network request failed' };
  }
};
