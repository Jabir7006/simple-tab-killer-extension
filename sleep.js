document.addEventListener("DOMContentLoaded", () => {
    // 1. Check if the user clicked the browser's reload button
    // The PerformanceNavigationTiming API tells us how the page was loaded
    const perfEntries = performance.getEntriesByType("navigation");
    if (perfEntries.length > 0 && perfEntries[0].type === "reload") {
        wakeUp();
        return; // Stop further execution, we are redirecting
    }

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
        document.title = `${originalTitle} (Sleeping)`;
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
