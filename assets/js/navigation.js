document.querySelectorAll("header nav").forEach((nav) => {
    const menuToggle = nav.querySelector(".nav-toggle");
    const navList = nav.querySelector(".nav-list");
    const dropdownItems = nav.querySelectorAll(".has-dropdown");
    const mobileBreakpoint = window.matchMedia("(max-width: 767px)");

    const closeDropdowns = () => {
        dropdownItems.forEach((item) => {
            item.classList.remove("is-open");
            const dropdownToggle = item.querySelector(".dropdown-toggle");
            dropdownToggle.setAttribute("aria-expanded", "false");
            dropdownToggle.setAttribute("aria-label", "Abrir submenu de Projetos Sociais");
        });
    };

    const closeMenu = () => {
        navList.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menu de navegação");
    };

    menuToggle.addEventListener("click", () => {
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isExpanded));
        menuToggle.setAttribute(
            "aria-label",
            isExpanded ? "Abrir menu de navegação" : "Fechar menu de navegação"
        );
        navList.classList.toggle("is-open", !isExpanded);

        if (isExpanded) {
            closeDropdowns();
        }
    });

    dropdownItems.forEach((item) => {
        const dropdownToggle = item.querySelector(".dropdown-toggle");

        dropdownToggle.addEventListener("click", () => {
            const isExpanded = dropdownToggle.getAttribute("aria-expanded") === "true";
            closeDropdowns();

            if (!isExpanded) {
                item.classList.add("is-open");
                dropdownToggle.setAttribute("aria-expanded", "true");
                dropdownToggle.setAttribute("aria-label", "Fechar submenu de Projetos Sociais");
            }
        });
    });

    navList.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            closeMenu();
            closeDropdowns();
        }
    });

    nav.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
            closeDropdowns();
            const focusTarget = mobileBreakpoint.matches
                ? menuToggle
                : nav.querySelector(".dropdown-toggle");
            focusTarget?.focus();
        }
    });

    document.addEventListener("click", (event) => {
        if (!nav.contains(event.target)) {
            closeMenu();
            closeDropdowns();
        }
    });

    mobileBreakpoint.addEventListener("change", () => {
        closeMenu();
        closeDropdowns();
    });
});

document.addEventListener("click", (event) => {
    const skipLink = event.target.closest(".skip-link[href^='#']");

    if (!skipLink) {
        return;
    }

    const target = document.querySelector(skipLink.getAttribute("href"));

    if (!target) {
        return;
    }

    event.preventDefault();
    window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}${skipLink.hash}`
    );
    target.focus({ preventScroll: true });
    target.scrollIntoView();
});