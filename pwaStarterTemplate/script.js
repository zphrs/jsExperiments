if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
            let refreshing = false;
            navigator.serviceWorker.addEventListener("controllerchange", function(e) {
                if (refreshing) {
                    return;
                }
                refreshing = true;
                window.location.reload();
            })
        }, function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
