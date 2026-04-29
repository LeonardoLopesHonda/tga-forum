type ToastLevel = 'error' | 'info';

function emit(message: string, level: ToastLevel) {
  window.dispatchEvent(new CustomEvent('tga:toast', { detail: { message, level } }));
}

const toast = {
  error: (message: string) => emit(message, 'error'),
  info:  (message: string) => emit(message, 'info'),
};

export default toast;
