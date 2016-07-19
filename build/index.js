var xstream_1 = require('xstream');
var xstream_adapter_1 = require('@cycle/xstream-adapter');
'session' | 'local';
function makeStorageDriver() {
    function httpDriver(write$, runSA) {
        var writeToStorage = function (pair) {
            var storage = pair.target === 'session' ? sessionStorage : localStorage;
            storage.setItem(pair.key, pair.value);
        };
        write$.addListener({
            next: writeToStorage,
            error: function (error) { return console.log(error); },
            complete: function () { }
        });
        var select = function (storage, key) {
            return xstream_1.default.of(storage.getItem(key));
        };
        return {
            local: { select: select.bind(undefined, localStorage) },
            session: { select: select.bind(undefined, sessionStorage) }
        };
    }
    httpDriver.streamAdapter = xstream_adapter_1.default;
    return httpDriver;
}
exports.makeStorageDriver = makeStorageDriver;
//# sourceMappingURL=index.js.map