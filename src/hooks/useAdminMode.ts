import { useState, useEffect } from 'react';

const ADMIN_STORAGE_KEY = 'qgx_is_admin_mode';
const ADMIN_PASSWORD_KEY = 'qgx_admin_pwd';

export const ADMIN_BLOB_TOKEN_KEY = 'qgx_blob_token';

export function getAdminAuthHeaders(): Record<string, string> {
  const pwd = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_PASSWORD_KEY) || sessionStorage.getItem('adminPassword') || '' : '';
  const blobToken = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_BLOB_TOKEN_KEY) || '' : '';
  return {
    'x-admin-password': pwd,
    ...(pwd ? { 'Authorization': `Bearer ${pwd}` } : {}),
    ...(blobToken ? { 'x-blob-token': blobToken } : {})
  };
}

export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const local = localStorage.getItem(ADMIN_STORAGE_KEY);
    const session = sessionStorage.getItem('isAdminMode');
    return local === 'true' || session === 'true';
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleModeChange = () => {
      const local = localStorage.getItem(ADMIN_STORAGE_KEY);
      const session = sessionStorage.getItem('isAdminMode');
      setIsAdmin(local === 'true' || session === 'true');
    };

    window.addEventListener('admin-mode-changed', handleModeChange);
    window.addEventListener('storage', handleModeChange);
    return () => {
      window.removeEventListener('admin-mode-changed', handleModeChange);
      window.removeEventListener('storage', handleModeChange);
    };
  }, []);

  const verifyAdminPassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    const defaultPassword = (import.meta as any).env?.VITE_ADMIN_PASSWORD || '20266Namm$$@';
    
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
          localStorage.setItem(ADMIN_PASSWORD_KEY, password);
          sessionStorage.setItem('isAdminMode', 'true');
          sessionStorage.setItem('adminPassword', password);
          setIsAdmin(true);
          window.dispatchEvent(new Event('admin-mode-changed'));
          showToast('🔓 Đã bật quyền CHỦ QUÁN / Admin thành công!');
          return { success: true };
        } else {
          return { success: false, error: data.error || 'Mật khẩu không chính xác!' };
        }
      }
    } catch (err: any) {
      console.warn('Backend verification API unavailable, switching to client-side verification fallback:', err);
    }

    // Client-side verification fallback for static hostings (such as Vercel)
    if (password === defaultPassword || password === '20266Namm$$@') {
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      localStorage.setItem(ADMIN_PASSWORD_KEY, password);
      sessionStorage.setItem('isAdminMode', 'true');
      sessionStorage.setItem('adminPassword', password);
      setIsAdmin(true);
      window.dispatchEvent(new Event('admin-mode-changed'));
      showToast('🔓 Đã bật quyền CHỦ QUÁN / Admin thành công!');
      return { success: true };
    } else {
      return { success: false, error: 'Mật khẩu Admin không chính xác!' };
    }
  };

  const disableAdmin = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_PASSWORD_KEY);
    sessionStorage.removeItem('isAdminMode');
    sessionStorage.removeItem('adminPassword');
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

