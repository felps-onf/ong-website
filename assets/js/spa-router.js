const spaRoutes = new Set([
    "index.html",
    "projetos.html",
    "contato.html",
    "cadastro.html"
]);

let latestRouteRequest = 0;
let activeRouteController;
let lastSuccessfulUrl = window.location.href;

function showRouteError() {
    const main = document.querySelector("main");

    if (!main) {
        return;
    }

    let errorMessage = main.querySelector("[data-route-error]");

    if (!errorMessage) {
        errorMessage = document.createElement("p");
        errorMessage.className = "spa-route-error";
        errorMessage.dataset.routeError = "";
        errorMessage.setAttribute("role", "alert");
        main.prepend(errorMessage);
    }

    errorMessage.textContent = "Não foi possível carregar a página. Verifique sua conexão e tente novamente.";
}

async function renderRoute(destination, updateHistory, requestId) {
    const routeController = new AbortController();
    activeRouteController?.abort();
    activeRouteController = routeController;

    try {
        const response = await fetch(destination.pathname, { signal: routeController.signal });

        if (requestId !== latestRouteRequest) {
            return;
        }

        if (!response.ok) {
            throw new Error(`Falha ao carregar a rota: ${response.status}`);
        }

        const pageMarkup = await response.text();

        if (requestId !== latestRouteRequest) {
            return;
        }

        const parsedPage = new DOMParser().parseFromString(pageMarkup, "text/html");
        const nextMain = parsedPage.querySelector("main");
        const currentMain = document.querySelector("main");

        if (!nextMain || !currentMain) {
            throw new Error("A página solicitada não contém a área principal.");
        }

        currentMain.replaceWith(document.importNode(nextMain, true));
        document.title = parsedPage.title;
        document.dispatchEvent(new CustomEvent("spa:content-updated", {
            detail: { root: document.querySelector("main") }
        }));

        document.querySelectorAll("header nav a[aria-current='page']")
            .forEach((link) => link.removeAttribute("aria-current"));

        const currentPageLink = [...document.querySelectorAll("header nav a[href]")]
            .find((link) => {
                const linkUrl = new URL(link.href, window.location.href);
                return linkUrl.pathname === destination.pathname && !linkUrl.hash;
            });

        currentPageLink?.setAttribute("aria-current", "page");

        if (updateHistory) {
            const nextUrl = `${destination.pathname}${destination.search}${destination.hash}`;
            window.history.pushState({}, "", nextUrl);
        }

        lastSuccessfulUrl = window.location.href;

        window.requestAnimationFrame(() => {
            const updatedMain = document.querySelector("main");
            updatedMain.setAttribute("tabindex", "-1");
            updatedMain.focus({ preventScroll: true });

            if (destination.hash) {
                const targetId = decodeURIComponent(destination.hash.slice(1));
                document.getElementById(targetId)?.scrollIntoView();
            } else {
                window.scrollTo(0, 0);
            }
        });
    } catch (error) {
        if (routeController.signal.aborted || requestId !== latestRouteRequest) {
            return;
        }

        throw error;
    } finally {
        if (activeRouteController === routeController) {
            activeRouteController = undefined;
        }
    }
}

document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");

    if (
        !link ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
    ) {
        return;
    }

    const destination = new URL(link.href, window.location.href);
    const destinationFile = destination.pathname.split("/").pop();

    if (destination.origin !== window.location.origin || !spaRoutes.has(destinationFile)) {
        return;
    }

    if (destination.pathname === window.location.pathname && !destination.hash) {
        event.preventDefault();

        if (activeRouteController) {
            activeRouteController.abort();
            activeRouteController = undefined;
            latestRouteRequest += 1;
            document.querySelector("[data-route-error]")?.remove();
        }

        return;
    }

    if (destination.pathname === window.location.pathname && destination.hash) {
        return;
    }

    event.preventDefault();
    const requestId = ++latestRouteRequest;
    renderRoute(destination, true, requestId).catch((error) => {
        if (requestId === latestRouteRequest) {
            console.warn("Falha na navegação SPA.", error);
            showRouteError();
        }
    });
});

window.addEventListener("popstate", () => {
    const requestId = ++latestRouteRequest;
    renderRoute(new URL(window.location.href), false, requestId).catch((error) => {
        if (requestId === latestRouteRequest) {
            window.history.replaceState(window.history.state, "", lastSuccessfulUrl);
            console.warn("Falha ao restaurar a rota pelo histórico.", error);
            showRouteError();
        }
    });
});