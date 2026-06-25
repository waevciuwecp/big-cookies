// ── Big Cookies — URL helper for root/subdirectory deployments ──
// Must be loaded before ui.js and nav.js
(function() {
    function getBasePath() {
        var path = window.location.pathname;
        // Strip filename so /big-cookies/about.html -> /big-cookies/
        if (path.endsWith('/')) return path;
        var slash = path.lastIndexOf('/');
        return slash >= 0 ? path.slice(0, slash + 1) : '/';
    }

    var basePath = getBasePath();

    window.BigCookiesURL = {
        basePath: basePath,

        // Homepage with optional hash: home() -> /big-cookies/  or  home('build') -> /big-cookies/#build
        home: function(hash) {
            return basePath + (hash ? '#' + hash.replace(/^#/, '') : '');
        },

        // Relative page link (passthrough — already relative)
        page: function(path) {
            return path;
        }
    };
})();
