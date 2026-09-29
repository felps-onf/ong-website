/**
 * theme-toggle.js — Toggle manual de tema claro/escuro
 *
 * Estratégia:
 *  - Sem preferência guardada → segue a media query do sistema (prefers-color-scheme).
 *  - Com preferência guardada → aplica data-theme="dark"|"light" em <html>,
 *    que sobrepõe a media query via selectores CSS de maior especificidade.
 *  - Sincroniza aria-pressed, aria-label e ícones em todos os botões .theme-toggle
 *    da página (incluindo após navegação SPA).
 */

const THEME_KEY = "ong-esperanca:color-theme:v1";
const ALLOWED = new Set(["dark", "light"]);

// --------------------------------------------------------------------------
// Persistência
// --------------------------------------------------------------------------

function readStoredTheme() {
    try {
        const raw = localStorage.getItem(THEME_KEY);
        if (!raw) return null;
        const { theme } = JSON.parse(raw);
        return ALLOWED.has(theme) ? theme : null;
    } catch {
        return null;
    }
}

function saveTheme(theme) {
    try {
        if (theme === null) {
            localStorage.removeItem(THEME_KEY);
        } else {
            localStorage.setItem(THEME_KEY, JSON.stringify({ theme }));
        }
    } catch {
        // localStorage pode estar indisponível em contextos restritos.
    }
}

// --------------------------------------------------------------------------
// Resolução do tema efectivo
// --------------------------------------------------------------------------

/** Retorna o tema efectivamente activo (considerando sistema + override). */
function resolveTheme(stored) {
    if (stored && ALLOWED.has(stored)) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// --------------------------------------------------------------------------
// Aplicação ao DOM
// --------------------------------------------------------------------------

function applyTheme(stored) {
    const root = document.documentElement;

    // Atributo data-theme — ausente = seguir sistema; presente = override manual.
    if (stored) {
        root.setAttribute("data-theme", stored);
    } else {
        root.removeAttribute("data-theme");
    }

    const isDark = resolveTheme(stored) === "dark";

    // Actualiza todos os botões de toggle na página.
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(isDark));
        btn.setAttribute(
            "aria-label",
            isDark ? "Activar modo claro" : "Activar modo escuro"
        );
        btn.querySelector(".theme-icon-sun")?.classList.toggle("theme-icon--hidden", !isDark);
        btn.querySelector(".theme-icon-moon")?.classList.toggle("theme-icon--hidden", isDark);
    });
}

// --------------------------------------------------------------------------
// Inicialização e listeners
// --------------------------------------------------------------------------

let currentStored = readStoredTheme();
applyTheme(currentStored);

// Reaplica após navegação SPA (conteúdo actualizado mas botões são re-renderizados).
document.addEventListener("spa:content-updated", () => applyTheme(currentStored));

// Responde a mudanças na preferência do sistema quando não há override manual.
window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
        if (!currentStored) applyTheme(null);
    });

// Delegação de cliques — funciona mesmo com botões adicionados dinamicamente.
document.addEventListener("click", (event) => {
    const btn = event.target.closest(".theme-toggle");
    if (!btn) return;

    const isDark = resolveTheme(currentStored) === "dark";
    const next = isDark ? "light" : "dark";

    currentStored = next;
    saveTheme(next);
    applyTheme(next);
});
