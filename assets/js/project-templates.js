function renderProjectTemplates(root = document) {
    const dataElement = root.querySelector("#project-data");
    const projectTemplate = root.querySelector("#project-card-template");
    const projectList = root.querySelector("[data-project-list]");

    if (!dataElement || !projectTemplate || !projectList) {
        return;
    }

    let projects;

    try {
        projects = JSON.parse(dataElement.textContent);
    } catch (error) {
        console.error("Não foi possível interpretar os dados dos projetos.", error);
        return;
    }

    const projectCards = document.createDocumentFragment();

    projects.forEach((project) => {
        const projectCard = projectTemplate.content.cloneNode(true);
        const cardSection = projectCard.querySelector(".project-card");
        const title = projectCard.querySelector("[data-project-title]");
        const figure = projectCard.querySelector("[data-project-figure]");
        const image = projectCard.querySelector("[data-project-image]");
        const description = projectCard.querySelector("[data-project-description]");
        const detail = projectCard.querySelector("[data-project-detail]");

        title.id = project.id;
        title.textContent = project.title;
        cardSection.setAttribute("aria-labelledby", project.id);
        description.textContent = project.description;

        if (project.image) {
            image.src = project.image;
            image.alt = project.imageAlt ?? "";
            figure.hidden = false;
        }

        if (project.detail) {
            projectCard.querySelector("[data-project-detail-title]").textContent = project.detail.title;
            projectCard.querySelector("[data-project-detail-description]").textContent = project.detail.description;
            detail.hidden = false;
        }

        projectCards.append(projectCard);
    });

    projectList.replaceChildren(projectCards);
}

renderProjectTemplates();

document.addEventListener("spa:content-updated", (event) => {
    renderProjectTemplates(event.detail?.root ?? document);
});