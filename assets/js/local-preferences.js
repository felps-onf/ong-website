const contributionPreferenceKey = "ong-esperanca:contribution-preference:v1";
const allowedContributionValues = new Set(["voluntario", "doador", "ambos"]);

function restoreContributionPreference(root = document) {
    const contributionOptions = [...root.querySelectorAll('input[name="tipo_contribuicao"]')];

    if (!contributionOptions.length) {
        return;
    }

    let savedPreference;

    try {
        const storedValue = window.localStorage.getItem(contributionPreferenceKey);

        if (!storedValue) {
            return;
        }

        savedPreference = JSON.parse(storedValue).contributionType;
    } catch {
        return;
    }

    if (!allowedContributionValues.has(savedPreference)) {
        return;
    }

    const savedOption = contributionOptions.find((option) => option.value === savedPreference);

    if (savedOption) {
        savedOption.checked = true;
    }
}

document.addEventListener("change", (event) => {
    const option = event.target;

    if (
        !(option instanceof HTMLInputElement) ||
        option.type !== "radio" ||
        option.name !== "tipo_contribuicao" ||
        !option.checked ||
        !allowedContributionValues.has(option.value)
    ) {
        return;
    }

    try {
        window.localStorage.setItem(
            contributionPreferenceKey,
            JSON.stringify({ contributionType: option.value })
        );
    } catch {
        // Storage can be unavailable in restricted browser contexts.
    }
});

document.addEventListener("spa:content-updated", (event) => {
    restoreContributionPreference(event.detail?.root ?? document);
});

restoreContributionPreference();