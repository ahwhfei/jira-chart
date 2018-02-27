'use strict';

window.Cookies = window.Cookies || (function() {
    var _getDomain = function () {
        var host = location.host,
            parts = host.split('.'),
            partsLength = parts.length;

        return '.' + parts[partsLength - 2] + '.' + parts[partsLength - 1].replace(/:.*/i, '');
    }, _isLocalHost = function () {
        return _getDomain().indexOf('localhost') !== -1;
    }, _getCookie = function (name) {
        var key = name + '=';
        var value = document.cookie.split(';');
        for(var i = 0; i < value.length; i++) {
            var cookie = value[i];

            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length);
            }

            if (cookie.indexOf(key) === 0) {
                return cookie.substring(key.length, cookie.length);
            }
        }
        return null;
    }, _setCookie = function (name, value, expirationDate) {
        var domain = _getDomain();
        if (_isLocalHost()) {
            // If we don't have more than two parts, we are probably running with localhost domain. We can't set cookies on domain=localhost.
            document.cookie = name + '=' + value + '; path=/; expires=' + expirationDate.toGMTString() + ';';
        } else {
            // Set the domain to '.ctxwsdev.net', '.cloud.com', etc ...
            document.cookie = name + '=' + value + '; path=/; domain=' + domain + '; expires=' + expirationDate.toGMTString() + ';';
        }
    };

    return {
        put: function (name, value, expirationDate) {
            var currentDate = new Date();

            if (value != null && typeof value === 'object') {
                value = JSON.stringify(value);
            }

            if (!expirationDate || !(expirationDate instanceof Date)) {
                expirationDate = currentDate;
                // Set expiration date to tomorrow
                expirationDate.setDate(currentDate.getDate() + 1);
            }

            _setCookie(name, value, expirationDate);
        },

        get: _getCookie,

        setPersistentCookie: function (name, value) {
            var expirationDate = new Date();
            // The cookie for transferring language should last long enough
            expirationDate.setFullYear(expirationDate.getFullYear() + 10);

            _setCookie(name, value, expirationDate);
        },

        remove: function(name) {
            var domain = _getDomain();
            document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            document.cookie = name + '=; path=/; domain=' + domain + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        },

        //except: list of elements that should not be excluded
        clear: function(except) {
            var cookies = document.cookie.split(';');

            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i];
                var index = cookie.indexOf('=');
                var name = index > -1 ? cookie.substr(0, index) : cookie;

                //if name is in the exception list skip removing
                if (except && except.indexOf && except.indexOf(name.trim()) !== -1){
                  continue;
                }

                this.remove(name);
            }
        }
    }
})();