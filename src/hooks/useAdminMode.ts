import { useState, useEffect } from 'react';

export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('isAdminMode') === 'true';
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleModeChange = () => {
      setIsAdmin(sessionStorage.getItem('isAdminMode') === 'true');
    };
    window.addEventListener('admin-mode-changed', handleModeChange);
    return () => {
      window.removeEventListener('admin-mode-changed', handleModeChange);
    };
  }, []);

  const enableAdmin = () => {
    sessionStorage.setItem('isAdminMode', 'true');
    setIsAdmin(true);
    window.dispatchEvent(new Event('admin-mode-changed'));
    showToast('🔓 Đã bật chế độ Admin! Bạn có thể upload/thay đổi ảnh.');
  };

  const disableAdmin = () => {
    sessionStorage.setItem('isAdminMode', 'false');
    setIsAdmin(false);
    window.dispatchEvent(new Event('admin-mode-changed'));
    showToast('🔒 Đã thoát chế độ Admin.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    let keyBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept keypresses when user is typing inside text inputs
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check Ctrl+Shift+A or Cmd+Shift+A shortcut
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        const currentIsAdmin = sessionStorage.getItem('isAdminMode') === 'true';
        if (currentIsAdmin) {
          disableAdmin();
        } else {
          const pin = prompt('Xác thực Admin Mode (Nhập "1234" hoặc "admin123"):');
          if (pin === '1234' || pin === 'admin123' || pin === 'admin') {
            enableAdmin();
          } else if (pin !== null) {
            alert('Mã xác thực không chính xác!');
          }
        }
        return;
      }

      // Sequence detector (e.g., typing "admin123")
      const now = Date.now();
      if (now - lastKeyTime > 2000) {
        keyBuffer = '';
      }
      lastKeyTime = now;

      if (e.key.length === 1) {
        keyBuffer += e.key.toLowerCase();
        if (keyBuffer.length > 20) {
          keyBuffer = keyBuffer.slice(-20);
        }

        if (keyBuffer.endsWith('admin123') || keyBuffer.endsWith('admin')) {
          keyBuffer = '';
          enableAdmin();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    isAdmin,
    enableAdmin,
    disableAdmin,
    toastMessage
  };
}
