type ToastLevel = 'error' | 'info';
export type ToastAction = { label: string; onClick: () => void };

function emit(message: string, level: ToastLevel, action?: ToastAction) {
  window.dispatchEvent(new CustomEvent('tga:toast', { detail: { message, level, action } }));
}

const toast = {
  error: (message: string, action?: ToastAction) => emit(message, 'error', action),
  info:  (message: string, action?: ToastAction) => emit(message, 'info',  action),
};

export default toast;
