/**
 * useAppNotification - Global snackbar for API errors and success messages.
 */
export interface AppNotification {
  message: string;
  color: 'error' | 'success' | 'warning' | 'info';
}

export function useAppNotification() {
  const notification = useState<AppNotification | null>('app-notification', () => null);

  const show = (message: string, color: AppNotification['color'] = 'error'): void => {
    notification.value = { message, color };
  };

  const showError = (message: string): void => {
    show(message, 'error');
  };

  const showSuccess = (message: string): void => {
    show(message, 'success');
  };

  const clear = (): void => {
    notification.value = null;
  };

  return {
    notification,
    show,
    showError,
    showSuccess,
    clear,
  };
}
