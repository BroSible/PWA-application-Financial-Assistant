self.addEventListener('install', function (event) {
    console.log('[ServiceWorker] Установка...');
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    console.log('[ServiceWorker] Активирован');
});

self.addEventListener('fetch', function (event) {
    // Не перехватываем запросы к манифесту, devtools и т.п.
    if (event.request.url.includes('manifest.webmanifest') ||
        event.request.url.includes('browserLinkSignalR') ||
        event.request.mode === 'navigate') {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(err => {
            console.error('[ServiceWorker] Ошибка fetch:', err);
            return new Response('Offline', { status: 503 });
        })
    );
});

