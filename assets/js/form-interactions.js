function setFormFeedback(form, message, state = "") {
    const feedback = form.querySelector("[data-form-feedback]");

    if (!feedback) {
        return;
    }

    feedback.textContent = message;
    feedback.classList.toggle("form-feedback--error", state === "error");
    form.dataset.feedbackState = state;
}

function getFieldGroup(field, form) {
    if (field.type !== "radio") {
        return [field];
    }

    return [...form.querySelectorAll('input[type="radio"]')]
        .filter((radio) => radio.name === field.name);
}

function getValidationMessage(field) {
    if (field.validity.valueMissing) {
        if (field.type === "radio") {
            return "Selecione uma opção para continuar.";
        }

        if (field instanceof HTMLSelectElement) {
            return "Selecione uma opção da lista.";
        }

        return "Preencha este campo obrigatório.";
    }

    if (field.validity.typeMismatch && field.type === "email") {
        return "Informe um endereço de e-mail válido.";
    }

    if (field.validity.tooShort) {
        return `Digite pelo menos ${field.minLength} caracteres.`;
    }

    if (field.validity.patternMismatch) {
        return field.title || "Confira o formato informado como exemplo.";
    }

    if (field.validity.badInput) {
        return "Confira o valor digitado.";
    }

    return "Verifique o valor deste campo.";
}

function updateFieldFeedback(field, form) {
    if (!field.willValidate) {
        return !field.validity.valid;
    }

    const fieldGroup = getFieldGroup(field, form);
    const invalidField = fieldGroup.find((groupField) => !groupField.validity.valid);
    const messageTarget = field.type === "radio"
        ? field.closest(".contribution-options")
        : field.parentElement;
    let fieldMessage = messageTarget.querySelector(".field-feedback");

    fieldGroup.forEach((groupField) => {
        groupField.setAttribute("aria-invalid", String(Boolean(invalidField)));
    });

    if (invalidField) {
        if (!fieldMessage) {
            fieldMessage = document.createElement("small");
            fieldMessage.className = "field-feedback";
            fieldMessage.id = `${field.id || field.name}-error`;
            messageTarget.append(fieldMessage);
        }

        fieldMessage.textContent = getValidationMessage(invalidField);
        fieldGroup.forEach((groupField) => {
            const descriptionIds = new Set(
                (groupField.getAttribute("aria-describedby") || "")
                    .split(/\s+/)
                    .filter(Boolean)
            );
            descriptionIds.add(fieldMessage.id);
            groupField.setAttribute("aria-describedby", [...descriptionIds].join(" "));
        });
    } else if (fieldMessage) {
        fieldMessage.remove();
        fieldGroup.forEach((groupField) => {
            const descriptionIds = (groupField.getAttribute("aria-describedby") || "")
                .split(/\s+/)
                .filter((id) => id && id !== fieldMessage.id);

            if (descriptionIds.length) {
                groupField.setAttribute("aria-describedby", descriptionIds.join(" "));
            } else {
                groupField.removeAttribute("aria-describedby");
            }
        });
    }

    return Boolean(invalidField);
}

document.addEventListener("input", (event) => {
    const field = event.target;
    const form = field.closest("form[data-interactive-form]");

    if (!form) {
        return;
    }

    updateFieldFeedback(field, form);

    if (form.dataset.feedbackState) {
        setFormFeedback(form, "");
    }
});

document.addEventListener("change", (event) => {
    const field = event.target;
    const form = field.closest("form[data-interactive-form]");

    if (form && field.matches("input, select, textarea")) {
        updateFieldFeedback(field, form);
    }
});

document.addEventListener("submit", (event) => {
    const form = event.target;

    if (!(form instanceof HTMLFormElement) || !form.matches("[data-interactive-form]")) {
        return;
    }

    event.preventDefault();

    const fields = form.querySelectorAll("input, select, textarea");
    const processedRadioGroups = new Set();
    fields.forEach((field) => {
        if (field.type === "radio") {
            if (processedRadioGroups.has(field.name)) {
                return;
            }
            processedRadioGroups.add(field.name);
        }

        updateFieldFeedback(field, form);
    });

    if (!form.checkValidity()) {
        setFormFeedback(form, "Revise os campos destacados antes de continuar.", "error");
        form.reportValidity();
        return;
    }

    setFormFeedback(
        form,
        "Os campos foram validados neste navegador. O envio não foi realizado porque este site ainda não está conectado a um serviço de backend.",
        "notice"
    );
});