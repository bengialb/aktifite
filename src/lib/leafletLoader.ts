/* eslint-disable */
// @ts-nocheck

const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

const ensureCssInjected = () => {
  if (typeof document === 'undefined') return;
  const exists = Array.from(document.styleSheets || []).some((sheet: any) => {
    try {
      return sheet.href && sheet.href.includes('leaflet');
    } catch (error) {
      return false;
    }
  });

  if (!exists && !document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS;
    link.crossOrigin = '';
    document.head.appendChild(link);
  }
};

export const ensureLeaflet = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Leaflet sadece tarayıcıda yüklenebilir.'));
  }

  // @ts-ignore
  if (window.L) {
    // @ts-ignore
    return Promise.resolve(window.L);
  }

  ensureCssInjected();

  // @ts-ignore
  if (window.__leafletLoaderPromise) {
    // @ts-ignore
    return window.__leafletLoaderPromise;
  }

  // @ts-ignore
  window.__leafletLoaderPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${LEAFLET_JS}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        // @ts-ignore
        resolve(window.L);
      });
      existingScript.addEventListener('error', () => {
        reject(new Error('Leaflet betiği yüklenemedi.'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.L) {
        // @ts-ignore
        resolve(window.L);
      } else {
        reject(new Error('Leaflet beklenmedik bir hata nedeniyle yüklenemedi.'));
      }
    };
    script.onerror = () => {
      reject(new Error('Leaflet betiği yüklenirken bir hata oluştu.'));
    };
    document.body.appendChild(script);
  });

  // @ts-ignore
  return window.__leafletLoaderPromise;
};
