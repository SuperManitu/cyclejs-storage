"use strict";
var xstream_1 = require('xstream');
var xstream_adapter_1 = require('@cycle/xstream-adapter');
function specificStorageDriver(storage, write$, runSA) {
    write$.addListener({
        next: function (pair) { return storage.setItem(pair.key, pair.value); },
        error: function (error) { return console.log(error); },
        complete: function () { }
    });
    return {
        getItem: function (key) { return xstream_1.default.of(storage.getItem(key)); }
    };
}
function storageDriver(write$, runSA) {
    return {
        session: specificStorageDriver(sessionStorage, write$.filter(function (pair) { return pair.target === 'session'; }), runSA),
        local: specificStorageDriver(localStorage, write$.filter(function (pair) { return pair.target === 'local'; }), runSA)
    };
}
function bindAdapter(f) {
    f.streamAdapter = xstream_adapter_1.default;
    return f;
}
function makeLocalStorageDriver() {
    return bindAdapter(specificStorageDriver.bind(undefined, localStorage));
}
exports.makeLocalStorageDriver = makeLocalStorageDriver;
function makeSessionStorageDriver() {
    return bindAdapter(specificStorageDriver.bind(undefined, sessionStorage));
}
exports.makeSessionStorageDriver = makeSessionStorageDriver;
function makeStorageDriver() {
    return bindAdapter(storageDriver);
}
exports.makeStorageDriver = makeStorageDriver;
//# sourceMappingURL=index.js.map