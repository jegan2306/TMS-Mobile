import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  pingServer,
  CURRENT_LAN_IP,
  DEFAULT_PORT,
  detectHostIp
} from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';

export default function ServerConfigModal({ visible, onClose }) {
  const { checkHealth } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (visible) {
      loadUrl();
      setTestResult(null);
    }
  }, [visible]);

  const loadUrl = async () => {
    const current = await getApiBaseUrl();
    setUrl(current);
  };

  const handleTest = async () => {
    setLoading(true);
    setTestResult(null);
    const res = await pingServer(url);
    setTestResult(res);
    setLoading(false);
  };

  const handleSave = async () => {
    await setApiBaseUrl(url);
    await checkHealth();
    onClose();
  };

  const useWifiDefault = () => {
    const host = detectHostIp() || CURRENT_LAN_IP;
    setUrl(`http://${host}:${DEFAULT_PORT}`);
  };

  const useLocalhost = () => {
    setUrl(`http://localhost:${DEFAULT_PORT}`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="server" size={20} color={colors.primaryLight} />
              <Text style={styles.title}>Backend Connection</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            When scanning via Expo Go on mobile, your phone connects to your PC via Wi-Fi IP address.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>API Server Base URL:</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="http://192.168.x.x:5000"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.presetRow}>
            <TouchableOpacity style={styles.presetChip} onPress={useWifiDefault}>
              <Text style={styles.presetText}>PC Wi-Fi ({CURRENT_LAN_IP})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetChip} onPress={useLocalhost}>
              <Text style={styles.presetText}>Localhost</Text>
            </TouchableOpacity>
          </View>

          {testResult && (
            <View
              style={[
                styles.resultBox,
                { backgroundColor: testResult.success ? '#064E3B' : '#7F1D1D' }
              ]}
            >
              <Ionicons
                name={testResult.success ? 'checkmark-circle' : 'alert-circle'}
                size={18}
                color="#FFF"
              />
              <Text style={styles.resultText}>
                {testResult.success ? 'Connection Successful! ' : 'Connection Failed: '}
                {testResult.message}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.testBtn]}
              onPress={handleTest}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="pulse" size={16} color="#FFF" />
                  <Text style={styles.btnText}>Test Ping</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSave}>
              <Ionicons name="save" size={16} color="#FFF" />
              <Text style={styles.btnText}>Save & Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  presetText: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '500',
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  resultText: {
    color: '#FFF',
    fontSize: 12,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  testBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  saveBtn: {
    backgroundColor: colors.primary,
  },
  btnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
