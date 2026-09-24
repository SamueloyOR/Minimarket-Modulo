// barra de navegacion, productos, clientes o ordenes

const searchInput = document.getElementById("Search-In-Inline") || document.getElementById("search");
let resultsList = document.getElementById("results");

if (!resultsList) {
    resultsList = document.createElement("ul");
    resultsList.id = "results";
    resultsList.className = "search-results";
    resultsList.setAttribute("aria-live", "polite");
    resultsList.style.display = "none";

    if (searchInput && searchInput.parentElement) {
        searchInput.parentElement.appendChild(resultsList);
    }
}

let timeoutId;

if (searchInput && resultsList) {
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.trim();

        clearTimeout(timeoutId);

        if (query.length < 2) {
            resultsList.innerHTML = "";
            resultsList.style.display = "none";
            return;
        }

        timeoutId = setTimeout(async () => {
            try {
                const response = await fetch(`/api/products?buscar=${encodeURIComponent(query)}`);

                if (!response.ok) {
                    throw new Error("La petición falló");
                }

                const data = await response.json();
                resultsList.innerHTML = "";

                if (Array.isArray(data) && data.length > 0) {
                    data.forEach((item) => {
                        const li = document.createElement("li");
                        li.textContent = item.nombre || item.name || "Producto";
                        li.style.cursor = "pointer";

                        li.addEventListener("click", () => {
                            searchInput.value = item.nombre || item.name || "";
                            resultsList.style.display = "none";
                        });

                        resultsList.appendChild(li);
                    });

                    resultsList.style.display = "block";
                    return;
                }

                resultsList.innerHTML = "<li>Sin resultados</li>";
                resultsList.style.display = "block";
            } catch (error) {
                console.error("Error en la búsqueda:", error);
                resultsList.innerHTML = "<li>Error en la búsqueda</li>";
                resultsList.style.display = "block";
            }
        }, 300);
    });

    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !resultsList.contains(e.target)) {
            resultsList.style.display = "none";
        }
    });
}