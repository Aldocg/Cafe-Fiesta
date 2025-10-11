// sw.js
self.addEventListener('install', (e)=> self.skipWaiting());
self.addEventListener('activate', (e)=> self.clients.claim());

// (Opcional) canal simple para futuras extensiones
self.addEventListener('message', (event)=>{
  const { type, title, body, options } = event.data || {};
  if (type === 'notify') {
    self.registration.showNotification(title || 'Aviso', { body, ...options });
  }
});
