function Call(type, data, callback) {
    try {
        if (!chrome?.runtime?.id) throw new Error("Context invalidated");
        const message = { type, ...data };
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                console.warn('Runtime error:', chrome.runtime.lastError.message);
                location.reload();
            } else {
                callback?.(response);
            }
        });
    } catch (err) {
        console.warn('Caught messaging error:', err.message);
        location.reload();  // optional
    }
}
window.Call = Call;