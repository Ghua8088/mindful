function Call(type, data, callback) {
    try {
        if (!API?.runtime?.id) throw new Error("Context invalidated");
        const message = { type, ...data };
        API.runtime.sendMessage(message, (response) => {
            if (API.runtime.lastError) {
                console.warn('Runtime error:', API.runtime.lastError.message);
                location.reload();
            } else {
                callback?.(response);
            }
        });
    } catch (err) {
        console.warn('Caught messaging error:', err.message);
        location.reload();
    }
}
if (typeof window.API === 'undefined') {
  window.API = (typeof browser !== "undefined") ? browser :
            (typeof chrome !== "undefined") ? chrome :
            {};
}
const API = window.API;
window.Call = Call;