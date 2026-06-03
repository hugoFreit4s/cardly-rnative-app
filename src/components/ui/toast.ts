import Toast from 'react-native-toast-message';

type ToastConfig = {
  type: 'success' | 'error' | 'info';
  message: string;
  subtitle?: string;
  visibilityTime?: number;
  onPress?: () => void;
};

function showToast(config: ToastConfig): void {
  Toast.hide();
  Toast.show({
    type: config.type,
    text1: config.message,
    text2: config.subtitle,
    position: 'bottom',
    visibilityTime: config.visibilityTime,
    onPress: config.onPress,
  });
}

export function showSuccess(message: string, subtitle?: string): void {
  showToast({ type: 'success', message, subtitle });
}

export function showSuccessAction(message: string, actionLabel: string, onPress: () => void): void {
  showToast({ type: 'success', message, subtitle: actionLabel, visibilityTime: 5000, onPress });
}

export function showError(message: string, subtitle?: string): void {
  showToast({ type: 'error', message, subtitle });
}

export function showWarning(message: string, subtitle?: string): void {
  showToast({ type: 'info', message, subtitle });
}
