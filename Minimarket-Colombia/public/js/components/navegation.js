const searchInput = document.getElementById("Search-In-Inline") || document.getElementById("search");

let resultsList = document.getElementById("results");

if (searchInput && !resultsList) {
    resultsList = document.createElement("ul");
    resultsList.id = "results";
    resultsList.className = "search-results";
    resultsList.setAttribute("role", "listbox");
    resultsList.setAttribute("aria-label", "Resultados de búsqueda");
    resultsList.hidden = true;

    searchInput.parentElement?.appendChild(resultsList);
}

let controlador = null;
let timeoutId = null;
let opcionActiva = -1;

function abrirLista() {
    if (!resultsList) return;
    resultsList.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
}

function cerrarLista() {
    if (!resultsList) return;
    resultsList.hidden = true;
    resultsList.replaceChildren();
    searchInput.setAttribute("aria-expanded", "false");
    opcionActiva = -1;
}

function crearItem(texto, clase) {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", "false");
    li.textContent = texto;
    if (clase) li.className = clase;
    return li;
}

function marcarActivo(indice) {
    const opciones = [...resultsList.querySelectorAll('li[role="option"]:not(.search-empty):not(.search-error)')];
    if (!opciones.length) return;

    opcionActiva = (indice + opciones.length) % opciones.length;

    opciones.forEach((opcion, i) => {
        const activo = i === opcionActiva;
        opcion.setAttribute("aria-selected", String(activo));
        opcion.classList.toggle("activo", activo);
        if (activo) opcion.scrollIntoView({ block: "nearest" });
    });

    const activa = opciones[opcionActiva];
    searchInput.setAttribute("aria-activedescendant", activa.id);
}

async function buscar(query) {
    controlador?.abort();
    controlador = new AbortController();

    resultsList.replaceChildren(crearItem("Buscando…", "search-loading"));
    abrirLista();

    try {
        const response = await fetch(`/api/products?buscar=${encodeURIComponent(query)}`, {
            signal: controlador.signal,
            headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
        });

        if (!response.ok) throw new Error("La petición falló");

        const data = await response.json();
        const productos = Array.isArray(data) ? data : data.productos || [];

        resultsList.replaceChildren();

        if (!productos.length) {
            resultsList.appendChild(crearItem("Sin resultados", "search-empty"));
            abrirLista();
            return;
        }

        productos.forEach((item, indice) => {
            const nombre = item.nombre || item.name || "Producto";
            const li = crearItem(nombre);
            li.id = `search-option-${indice}`;
            li.addEventListener("click", () => {
                searchInput.value = nombre;
                cerrarLista();
            });
            resultsList.appendChild(li);
        });

        abrirLista();
        marcarActivo(0);
    } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Error en la búsqueda:", error);
        resultsList.replaceChildren(crearItem("Error en la búsqueda", "search-error"));
        abrirLista();
    }
}

if (searchInput && resultsList) {
    searchInput.setAttribute("role", "combobox");
    searchInput.setAttribute("aria-autocomplete", "list");
    searchInput.setAttribute("aria-controls", "results");
    searchInput.setAttribute("aria-expanded", "false");

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.trim();

        clearTimeout(timeoutId);
        controlador?.abort();

        if (query.length < 2) {
            cerrarLista();
            return;
        }

        timeoutId = setTimeout(() => buscar(query), 300);
    });

    searchInput.addEventListener("keydown", (event) => {
        if (resultsList.hidden) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            marcarActivo(opcionActiva + 1);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            marcarActivo(opcionActiva - 1);
        } else if (event.key === "Escape") {
            event.preventDefault();
            cerrarLista();
        } else if (event.key === "Enter" && opcionActiva >= 0) {
            event.preventDefault();
            resultsList.querySelector('li[aria-selected="true"]')?.click();
        }
    });

    searchInput.closest("form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        cerrarLista();
    });

    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !resultsList.contains(e.target)) {
            cerrarLista();
        }
    });
}
