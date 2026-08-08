import { useState, useEffect } from 'react';

export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const stored = sessionStorage.getItem('isAdminMode');
    return stored === 'true';
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

  const verifyAdminPassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('isAdminMode', 'true');
        setIsAdmin(true);
        window.dispatchEvent(new Event('admin-mode-changed'));
        showToast('🔓 Đã bật quyền CHỦ QUÁN / Admin thành công!');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Mật khẩu không chính xác!' };
      }
    } catch (err: any) {
      console.error('Error verifying admin password:', err);
      return { success: false, error: 'Không thể kết nối đến máy chủ xác thực!' };
    }
  };

  const disableAdmin = () => {
    sessionStorage.setItem('isAdminMode', 'false');
    setIsAdmin(false);
    window.dispatchEvent(new Event('admin-mode-changed'));
    showToast('🔒 Đã thoát chế độ CHỦ QUÁN / Admin.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return {
    isAdmin,
    verifyAdminPassword,
    disableAdmin,
    toastMessage
  };
}

