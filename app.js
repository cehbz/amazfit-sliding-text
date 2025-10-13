// Shared error logging function
const DEBUG = true;  // Set to false for production

function logError(error, source) {
    if (!DEBUG) return;
    
    console.log(`[Sliding Text] ${source} Error:`, error);
    if (error && error.stack) {
        console.log('error stack:');
        error.stack.split(/\n/).forEach(i => console.log('    ', i));
    }
}

try {
    (() => {
        const __$$app$$__ = __$$hmAppManager$$__.currentApp;
        function getApp() {
            return __$$app$$__.app;
        }
        function getCurrentPage() {
            return __$$app$$__.current && __$$app$$__.current.module;
        }
        __$$app$$__.__globals__ = {
            lang: new DeviceRuntimeCore.HmUtils.Lang(DeviceRuntimeCore.HmUtils.getLanguage()),
            px: DeviceRuntimeCore.HmUtils.getPx(390)  // Fixed: Match Bip 6 designWidth
        };
        const {px} = __$$app$$__.__globals__;
        const languageTable = {};
        __$$app$$__.__globals__.gettext = DeviceRuntimeCore.HmUtils.gettextFactory(languageTable, __$$app$$__.__globals__.lang, 'en-US');
        function getGlobal() {
            if (typeof self !== 'undefined') {
                return self;
            }
            if (typeof window !== 'undefined') {
                return window;
            }
            if (typeof global !== 'undefined') {
                return global;
            }
            if (typeof globalThis !== 'undefined') {
                return globalThis;
            }
            throw new Error('unable to locate global object');
        }
        let globalNS$2 = getGlobal();
        if (!globalNS$2.Logger) {
            if (typeof DeviceRuntimeCore !== 'undefined') {
                globalNS$2.Logger = DeviceRuntimeCore.HmLogger;
            }
        }
        let globalNS$1 = getGlobal();
        if (!globalNS$1.Buffer) {
            if (typeof Buffer !== 'undefined') {
                globalNS$1.Buffer = Buffer;
            } else {
                globalNS$1.Buffer = DeviceRuntimeCore.Buffer;
            }
        }
        function isHmTimerDefined() {
            return typeof timer !== 'undefined';
        }
        let globalNS = getGlobal();
        if (typeof setTimeout === 'undefined' && isHmTimerDefined()) {
            globalNS.clearTimeout = function clearTimeout(timerRef) {
                timerRef && timer.stopTimer(timerRef);
            };
            globalNS.setTimeout = function setTimeout2(func, ns) {
                const timer1 = timer.createTimer(ns || 1, Number.MAX_SAFE_INTEGER, function () {
                    globalNS.clearTimeout(timer1);
                    try {
                        func && func();
                    } catch (e) {
                        logError(e, 'setTimeout');
                    }
                }, {});
                return timer1;
            };
            globalNS.clearImmediate = function clearImmediate(timerRef) {
                timerRef && timer.stopTimer(timerRef);
            };
            globalNS.setImmediate = function setImmediate(func) {
                const timer1 = timer.createTimer(1, Number.MAX_SAFE_INTEGER, function () {
                    globalNS.clearImmediate(timer1);
                    try {
                        func && func();
                    } catch (e) {
                        logError(e, 'setImmediate');
                    }
                }, {});
                return timer1;
            };
            globalNS.clearInterval = function clearInterval(timerRef) {
                timerRef && timer.stopTimer(timerRef);
            };
            globalNS.setInterval = function setInterval(func, ms) {
                const timer1 = timer.createTimer(1, ms, function () {
                    try {
                        func && func();
                    } catch (e) {
                        logError(e, 'setInterval');
                    }
                }, {});
                return timer1;
            };
        }
        __$$app$$__.app = DeviceRuntimeCore.App({
            globalData: {},
            onCreate(options) {
            },
            onDestroy(options) {
            },
            onError(error) {
                logError(error, 'onError');
            },
            onPageNotFound(obj) {
            },
            onUnhandledRejection(obj) {
                logError(obj.reason, 'onUnhandledRejection');
            }
        });
        ;
    })();
} catch (e) {
    logError(e, 'catch');
}