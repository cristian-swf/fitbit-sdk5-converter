/*
* K·Pay Integration Library - v3.0.0 - Copyright Kiezel 2020
* Last Modified: 2020-08-07
*
* BECAUSE THE LIBRARY IS LICENSED FREE OF CHARGE, THERE IS NO 
* WARRANTY FOR THE LIBRARY, TO THE EXTENT PERMITTED BY APPLICABLE 
* LAW. EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT 
* HOLDERS AND/OR OTHER PARTIES PROVIDE THE LIBRARY "AS IS" 
* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED, 
* INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF 
* MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE ENTIRE
* RISK AS TO THE QUALITY AND PERFORMANCE OF THE LIBRARY IS WITH YOU.
* SHOULD THE LIBRARY PROVE DEFECTIVE, YOU ASSUME THE COST OF ALL 
* NECESSARY SERVICING, REPAIR OR CORRECTION.
* 
* IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN 
* WRITING WILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MAY 
* MODIFY AND/OR REDISTRIBUTE THE LIBRARY AS PERMITTED ABOVE, BE 
* LIABLE TO YOU FOR DAMAGES, INCLUDING ANY GENERAL, SPECIAL, 
* INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR 
* INABILITY TO USE THE LIBRARY (INCLUDING BUT NOT LIMITED TO LOSS
* OF DATA OR DATA BEING RENDERED INACCURATE OR LOSSES SUSTAINED BY 
* YOU OR THIRD PARTIES OR A FAILURE OF THE LIBRARY TO OPERATE WITH
* ANY OTHER SOFTWARE), EVEN IF SUCH HOLDER OR OTHER PARTY HAS BEEN 
* ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
*/

/*****************************************************************************************/
/*                 GENERATED CODE BELOW THIS LINE - DO NOT MODIFY!                       */
/*****************************************************************************************/

//import { localStorage } from "local-storage"
var localStorageModule = require('local-storage').localStorage;    //because normal import currently doesn't work on Android
import { device } from "peer";
import * as messaging from 'messaging';
import { outbox } from "file-transfer";
import * as cbor from 'cbor';
import * as kcm from '../../../common/kpay/kpay_common.js';
import { me } from "companion";
import * as appClusterStorage from "app-cluster-storage";
var e = "fb3.0.0", n = 3e3, o = 5e3, t = 25e3, s = 1e4, a = 864e5, u = null, f = null, y = null, g = null, m = null, k = null, p = "kpay_nextRecheckTimeLocalstorageKey", P = "kpay_lastStatusResultLocalstorageKey", K = "kpay_flagsLocalstorageKey", h = "kpay_appIdLocalstorageKey", v = "kpay_accountTokenLocalstorageKey", S = null, w = null, T = null, x = !1, b = !1, C = 0, _ = 0, R = !1, N = !1, I = 0, D = null, U = null, O = function() {}, W = ye, E = appClusterStorage.get("ro.stardesigns");

export function initialize() {
    console.log("KPay - initialize()"), ye(), messaging.peerSocket.addEventListener("open", q), 
    messaging.peerSocket.addEventListener("message", z), messaging.peerSocket.addEventListener("error", H), 
    messaging.peerSocket.addEventListener("closed", Q), setTimeout(ee, 6e4);
}

export function setEventHandler(e) {
    O = e;
}

export function setAccountTokenGenerator(e) {
    W = e;
}

export function startPurchase() {
    L(kcm.purchaseMessageFilename, {
        purchase: "start"
    });
}

export function cancelPurchase() {
    L(kcm.purchaseMessageFilename, {
        purchase: "cancel"
    });
}

function L(e, n, o, t) {
    var s = function() {
        o ? o() : console.log('KPay - Successfully sent kpay settings "' + e + '": ' + JSON.stringify(n));
    }, a = function(n) {
        t ? t() : console.log('KPay - Error sending kpay settings "' + e + '": ' + n);
    };
    if ((null == w || M()) && (console.log("KPay - sending message to watch using file transfer..."), 
    outbox.enqueue(e, cbor.encode(n)).then(s).catch(a)), null == w || J()) {
        console.log("KPay - sending message to watch using peersocket...");
        try {
            0 === messaging.peerSocket.readyState ? (messaging.peerSocket.send(n), s()) : a("PeerSocket closed");
        } catch (e) {
            a(e);
        }
    }
}

function M() {
    return !J();
}

function J() {
    return 0 == (64 & w);
}

function A() {
    return 0 != (2 & w);
}

function F() {
    return 0 != (4 & w);
}

function q() {
    console.log("KPay - Connection with watch opened..."), null !== ke() && "licensed" !== ke().status && de();
}

function z(e) {
    var n = e.data;
    if (kcm.isKPayMessage(n)) if (console.log("KPay - Received msg from watch: " + JSON.stringify(n)), 
    G(n)) {
        if (console.log("KPay - Received GETSTATUS msg from watch..."), x && S === n.appId && w === n.flags) {
            var s = new Date().getTime();
            if (R && !N && s - _ < t) return void console.log("KPay - Websocket connected and alive, no need to start new status request...");
            if (s - C < o) return void console.log("KPay - Status checks already running, no need to start new status request...");
        }
        S = n.appId, w = n.flags, null !== ke() && "unlicensed" !== ke().status && de(), 
        V(), f && (clearTimeout(f), f = null), f = setTimeout(Z, 15e3);
    } else j(n) && (console.log("KPay - Received CANCELPURCHASE msg from watch..."), 
    x = !1, de(), u && (clearTimeout(u), u = null), f && (clearTimeout(f), f = null), 
    R && re());
}

function G(e) {
    return kcm.isKPayMessage(e) && 0 === e.type;
}

function j(e) {
    return kcm.isKPayMessage(e) && 3 === e.type;
}

function B(e) {
    return {
        isKpayMsg: !0,
        type: 1,
        serverResponse: e
    };
}

function H(e) {
    console.log("KPay - Connection with watch error: " + e);
}

function Q(e) {
    console.log("KPay - Connection with watch was closed: " + e);
}

function V() {
    console.log("KPay - _statusCheck()"), x = !0;
    var o = new Date().getTime(), t = W(), s = Pe(), a = "https://api.kiezelpay.com/api/v2/status?";
    a += "appid=" + encodeURIComponent(S), a += "&accounttoken=" + encodeURIComponent(t), 
    a += "&platform=fitbit", a += "&device=" + encodeURIComponent(s), A() && (a += "&test=true"), 
    F() && (a += "&skiptrial=true"), a += "&nocache=" + encodeURIComponent(o), a += "&libv=" + encodeURIComponent(e), 
    console.log("KPay - Getting status from server at " + a), fetch(a).then(function(e) {
        return e.json();
    }).then(function(e) {
        console.log("KPay - Got response from server: " + JSON.stringify(e)), b = !1, C = new Date().getTime(), 
        e && e.hasOwnProperty("status") ? X(e) : console.log("KPay - Invalid KPay response received.");
    }).catch(function(e) {
        console.log("KPay - Status request failed: " + e), C = new Date().getTime(), b || !x || null !== ke() && "licensed" === ke().status || (u && (clearTimeout(u), 
        u = null), u = setTimeout(V, n)), b = !1;
    });
}

function X(e) {
    "unlicensed" === e.status && (I = Number(e.paymentCode)), null === ke() || ke().status !== e.status || "unlicensed" === ke().status && (ke().purchaseStatus !== e.purchaseStatus || ke().paymentCode !== e.paymentCode || ke().checksum !== e.checksum) ? L(kcm.statusMessageFilename, B(e), function() {
        if (console.log("KPay - Status msg successfully sent to watch"), "licensed" === e.status) Y(7, null, !1); else if ("trial" === e.status) {
            var n = Math.round(new Date().getTime() / 1e3) + Number(e.trialDurationInSeconds), o = new Date();
            o.setTime(1e3 * n), Y(3, o, !1);
        } else if ("unlicensed" === e.status) {
            var t = Number(e.paymentCode), s = null == ke() || t !== ke().paymentCode;
            "waitForUser" == e.purchaseStatus ? Y(5, t, s) : "inProgress" == e.purchaseStatus && Y(6, t, s);
        }
        ge(e);
    }, function() {
        console.log("KPay - Status msg failed sending to watch");
    }) : console.log("KPay - No status change detected"), "licensed" === e.status || "trial" === e.status ? ("licensed" === e.status ? $(e) : te(), 
    x = !1, f && (clearTimeout(f), f = null), re(), console.log("KPay - Licensed/trial status reached, no more action necesarry.")) : (te(), 
    N || R ? N && (u && (clearTimeout(u), u = null), u = setTimeout(V, n)) : le());
}

function Y(e, n, o) {
    if (U !== e || o) {
        U = e, console.log("KPay - firing event callback for event " + e);
        try {
            O(e, n);
        } catch (e) {}
    }
}

function Z() {
    console.log("KPay - _failSafeStatusCheck()");
    var e = new Date().getTime();
    x && (R && !N && e - _ >= t || (!R || N) && e - C >= 15e3) && (null === ke() || "licensed" !== ke().status && "trial" !== ke().status) && (console.log("KPay - status checks have stopped for some reason, restarting..."), 
    u && (clearTimeout(u), u = null), u = setTimeout(V, 0)), f && (clearTimeout(f), 
    f = null), f = setTimeout(Z, 15e3);
}

function $(e) {
    console.log("KPay - _setPeriodicRechecksForResponse()"), e && "licensed" === e.status && ne(86400 * e.validityPeriodInDays * 1e3, !1);
}

function ee() {
    var e = Ke(p, null);
    console.log("KPay - _checkForStoredRecheck(); nextRecheckTime from ls = " + e), 
    null !== e && ne(e - new Date().getTime(), !0);
}

function ne(e, n) {
    console.log("KPay - _scheduleRecheckWithTimeout(recheckTimeout = " + e + ", isStartupScheduling = " + n + ")"), 
    n || (he(K, w), he(h, S)), e < 0 ? ce() : oe(e);
}

function oe(e) {
    console.log("KPay - _storeScheduledRecheck(recheckTimeout = " + e + ")"), te();
    var n = new Date(), o = e / 1e3;
    n.setSeconds(n.getSeconds() + o), he(p, n.getTime()), console.log("KPay - Scheduling js status recheck for " + o + " seconds from now."), 
    y && (clearTimeout(y), y = null), y = setTimeout(ce, e);
}

function te() {
    console.log("KPay - _removeScheduledRecheck()"), y && (clearTimeout(y), y = null), 
    ve(p);
}

function ce() {
    console.log("KPay - _performRecheck()"), w = Ke(K, w), S = Ke(h, S), oe(a), x || (console.log("KPay - Performing js fallback status recheck..."), 
    b = !0, V());
}

function le() {
    if (console.log("KPay - _beginWebSocketChecks()"), !N && !R && null === D) {
        var n = W(), o = Pe(), s = {
            type: "register.v2",
            purchaseCode: I,
            data: {
                appid: S,
                accounttoken: n,
                platform: "fitbit",
                o: o,
                test: A(),
                t: F(),
                libv: e
            }
        }, a = "wss://socket.kiezelpay.com";
        console.log("KPay - Opening websocket connection to KPay..."), m && (clearTimeout(m), 
        m = null), m = setTimeout(function() {
            R || (console.log("KPay - Opening websocket failed, reverting to normal polling checks..."), 
            N = !0, V(), ae());
        }, 3e3);
        try {
            (D = new WebSocket(a)).onopen = function(e) {
                R = !0, N = !1, console.log("KPay - WebSocket connection opened..."), ie(D, s);
            }, D.onmessage = function(e) {
                if (R) {
                    _ = new Date().getTime(), console.log("KPay - WebSocket message received: " + e.data);
                    var n = JSON.parse(e.data);
                    if (n && "registerReponse" == n.type && n.keepAliveTimeout) t = n.keepAliveTimeout, 
                    g && (clearTimeout(g), g = null), g = setTimeout(function() {
                        se(D);
                    }, t); else if (n && "statusUpdate" == n.type) {
                        if (!n.data || !n.data.hasOwnProperty("status")) return void console.log("KPay - Invalid KPay response received: " + e.data);
                        X(n.data);
                    } else console.log("KPay - Unknown KPay response received: " + e.data);
                } else try {
                    D.close(), console.log("KPay - Closing stray WebSocket...");
                } catch (e) {}
            }, D.onerror = function(e) {
                console.log("KPay - WebSocket error: " + e), R = !1, N = !0;
                try {
                    console.log("KPay - Closing websocket..."), D.close();
                } catch (e) {}
                D = null, ae(), console.log("KPay - Starting polling status checks..."), V();
            }, D.onclose = function(e) {
                if (R) {
                    if (R = !1, null !== D) {
                        console.log("KPay - Closing websocket...");
                        try {
                            console.log("KPay - Closing websocket..."), D.close();
                        } catch (e) {}
                    }
                    D = null, N = !0, ae(), console.log("KPay - WebSocket closed by server: " + e), 
                    console.log("KPay - Starting polling status checks..."), V();
                }
            };
        } catch (e) {
            console.log("KPay - Exception opening websocket: " + e);
        }
    }
}

function se(e) {
    N || (ie(e, {
        type: "keepAlive"
    }), null !== g && (clearTimeout(g), g = null), g = setTimeout(function() {
        se(e);
    }, t));
}

function ae() {
    k && (clearTimeout(k), k = null), console.log("KPay - Scheduling websocket retry..."), 
    k = setTimeout(function() {
        N = !1;
    }, s);
}

function ie(e, n) {
    try {
        if (1 === e.readyState) {
            var o = JSON.stringify(n);
            console.log("KPay - Sending webSocket message: " + o), e.send(o);
        } else console.log("KPay - Error sending webSocket message: readyState !== 1"), 
        ue();
    } catch (e) {
        console.log("KPay - Error sending webSocket message: " + e), ue();
    }
}

function ue() {
    R = !1, N = !0;
    try {
        console.log("KPay - Closing websocket..."), D.close();
    } catch (e) {}
    D = null, ae(), console.log("KPay - Starting polling status checks..."), V();
}

function re() {
    if (console.log("KPay - Cancelling websocket status checking..."), null !== m && (clearTimeout(m), 
    m = null), null !== g && (clearTimeout(g), g = null), R = !1, null !== D) try {
        D.close();
    } catch (e) {}
    D = null, x = !1;
}

function fe(e) {
    for (var n = [], i = 0; i < e.length; i += 2) n.push(parseInt(e.substr(i, 2), 16));
    return n;
}

function ye() {
    var e = null;
    return me.permissions.granted("access_app_cluster_storage") && null !== E && (console.log("KPay - attempting to get stored accounttoken from app storage cluster..."), 
    e = E.getItem(v)), null !== e && void 0 !== e && "undefined" !== e || (console.log("KPay - attempting to get stored accounttoken from localstorage..."), 
    null !== (e = localStorageModule.getItem(v)) && void 0 !== e && "undefined" !== e || (console.log("KPay - generating new accounttoken..."), 
    e = pe(), he(v, e)), me.permissions.granted("access_app_cluster_storage") && null !== E && E.setItem(v, e)), 
    e;
}

function de() {
    T = null, ve(P);
}

function ge(e) {
    T = e, he(P, JSON.stringify(T));
}

function ke() {
    if (null === T) {
        var e = localStorageModule.getItem(P);
        null !== e && void 0 !== e && "undefined" !== e && (T = JSON.parse(e));
    }
    return T;
}

function pe() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = 16 * Math.random() | 0;
        return ("x" == c ? r : 3 & r | 8).toString(16);
    });
}

function Pe() {
    return device.modelName.toLowerCase();
}

function Ke(e, n) {
    var o = localStorageModule.getItem(e);
    if (null !== o && void 0 !== o && "undefined" !== o && !isNaN(o)) {
        var t = Number(o);
        if (!isNaN(t)) return t;
    }
    return n;
}

function he(e, n) {
    null !== n && void 0 !== n && localStorageModule.setItem(e, n.toString());
}

function ve(e) {
    localStorageModule.removeItem(e);
}