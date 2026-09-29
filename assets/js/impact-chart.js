(() => {
    let impactChartInstance;
    let chartLibraryPromise;

    function loadChartLibrary() {
        if (window.Chart) {
            return Promise.resolve(window.Chart);
        }

        if (!chartLibraryPromise) {
            chartLibraryPromise = new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.umd.min.js";
                script.async = true;
                script.onload = () => resolve(window.Chart);
                script.onerror = () => reject(new Error("Não foi possível carregar o Chart.js."));
                document.head.append(script);
            }).catch((error) => {
                chartLibraryPromise = undefined;
                throw error;
            });
        }

        return chartLibraryPromise;
    }

    async function renderImpactChart(root = document) {
        impactChartInstance?.destroy();
        impactChartInstance = undefined;

        const canvas = root.querySelector("#impact-chart");
        const dataElement = root.querySelector("#impact-chart-data");

        if (!canvas || !dataElement) {
            return;
        }

        let metrics;

        try {
            metrics = JSON.parse(dataElement.textContent);
            if (
                !Array.isArray(metrics.labels) ||
                !Array.isArray(metrics.values) ||
                !Array.isArray(metrics.units) ||
                metrics.labels.length !== metrics.values.length ||
                metrics.values.length !== metrics.units.length
            ) {
                throw new Error("Os dados do gráfico estão incompletos.");
            }
            await loadChartLibrary();
        } catch (error) {
            canvas.hidden = true;
            console.warn("O gráfico de impacto não pôde ser exibido.", error);
            return;
        }

        if (!canvas.isConnected || !window.Chart) {
            return;
        }

        const designTokens = getComputedStyle(document.documentElement);
        const primaryColor = designTokens.getPropertyValue("--color-primary").trim();
        const secondaryColor = designTokens.getPropertyValue("--color-secondary").trim();

        canvas.hidden = false;
        impactChartInstance = new window.Chart(canvas, {
            type: "bar",
            data: {
                labels: metrics.labels,
                datasets: [{
                    data: metrics.values,
                    backgroundColor: [primaryColor, secondaryColor],
                    borderRadius: 4,
                    borderSkipped: false,
                    barThickness: 28
                }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                const amount = new Intl.NumberFormat("pt-BR").format(context.raw);
                                return `${amount} ${metrics.units[context.dataIndex]}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback(value) {
                                return new Intl.NumberFormat("pt-BR").format(value);
                            }
                        }
                    },
                    y: { grid: { display: false } }
                }
            }
        });
    }

    renderImpactChart();

    document.addEventListener("spa:content-updated", (event) => {
        renderImpactChart(event.detail?.root ?? document);
    });
})();