document.addEventListener("DOMContentLoaded", () => {
    // Removed the automatic wake-up on reload check.
    // This was causing bugs during browser session restore where Chrome
    // would sometimes evaluate the restore as a 'reload' and try to navigate
    // immediately, resulting in a 'New Tab' being shown instead.

    // 2. Parse URL parameters to restore content
    const urlParams = new URLSearchParams(window.location.search);
    const originalUrl = urlParams.get("url");
    const originalTitle = urlParams.get("title");
    const originalFavicon = urlParams.get("favicon");

    // Elements
    const titleEl = document.getElementById("title");
    const urlEl = document.getElementById("url");
    const faviconEl = document.getElementById("favicon");
    const wakeBtn = document.getElementById("wake-btn");

    // 3. Populate page with original tab data securely
    if (originalTitle) {
        // Browser tab title: show only the first word of the original title (e.g. "Gemini (Sleeping)")
        // On-page title: keep the full original title so the user knows what they slept
        const firstWord = originalTitle.trim().split(/\s+/)[0];
        document.title = `${firstWord} ... (Sleeping)`;
        titleEl.textContent = originalTitle;
    }

    if (originalUrl) {
        urlEl.textContent = originalUrl;
    } else {
        urlEl.textContent = "No URL provided";
        wakeBtn.disabled = true;
    }

    if (originalFavicon && originalFavicon !== "null" && originalFavicon !== "undefined" && originalFavicon.trim() !== "") {
        faviconEl.src = originalFavicon;
        faviconEl.style.display = "block";
        // Update page favicon too
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = originalFavicon;
    }

    // 4. Handle "Wake Up" button click
    wakeBtn.addEventListener("click", wakeUp);

    function wakeUp() {
        const params = new URLSearchParams(window.location.search);
        const urlToRestore = params.get("url");
        if (urlToRestore) {
            window.location.replace(urlToRestore);
        }
    }
});
