(function () {
  const MUSIC_TONES = [
    "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
    "Cm", "C#m", "Dbm", "Dm", "D#m", "Ebm", "Em", "Fm", "F#m", "Gbm", "Gm", "G#m", "Abm", "Am", "A#m", "Bbm", "Bm"
  ];

  function normalize(value = "") {
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function normalizeTone(value = "") {
    return String(value).trim().replace(/\s+/g, "").toLowerCase();
  }

  function readValue(item, field) {
    if (typeof field === "function") return field(item);
    return String(field).split(".").reduce((value, key) => value?.[key], item);
  }

  function createSearch(options = {}) {
    const input = document.querySelector(options.input);
    const clearButton = document.querySelector(options.clearButton);
    const counter = document.querySelector(options.counter);
    const fields = options.fields || [];
    const onChange = typeof options.onChange === "function" ? options.onChange : () => {};
    const filterPredicate = typeof options.filter === "function" ? options.filter : null;
    let source = Array.isArray(options.items) ? options.items : [];
    let filters = { ...(options.filters || {}) };
    let timer = null;

    function matches(item, query) {
      const textMatches = !query || fields.some((field) => normalize(readValue(item, field)).includes(query));
      const filterMatches = !filterPredicate || filterPredicate(item, filters);
      return textMatches && filterMatches;
    }

    function apply() {
      const query = normalize(input?.value || "");
      const result = source.filter((item) => matches(item, query));

      if (clearButton) clearButton.hidden = !query;
      if (counter) {
        counter.textContent = query
          ? `${result.length} de ${source.length} encontrados`
          : `${source.length} registros`;
      }

      onChange(result, { query, total: source.length, filters: { ...filters } });
      return result;
    }

    function schedule() {
      window.clearTimeout(timer);
      timer = window.setTimeout(apply, options.delay ?? 120);
    }

    function setItems(items = []) {
      source = Array.isArray(items) ? items : [];
      return apply();
    }

    function clear() {
      if (input) input.value = "";
      return apply();
    }

    function setFilter(name, value) {
      filters = { ...filters, [name]: value };
      return apply();
    }

    function setFilters(nextFilters = {}) {
      filters = { ...nextFilters };
      return apply();
    }

    function getFilters() {
      return { ...filters };
    }

    if (input) input.addEventListener("input", schedule);
    if (clearButton) clearButton.addEventListener("click", clear);

    apply();

    return {
      apply,
      clear,
      getFilters,
      setFilter,
      setFilters,
      setItems
    };
  }

  function createToneFilter(options = {}) {
    const button = document.querySelector(options.button);
    const menu = document.querySelector(options.menu);
    const optionRoot = menu?.querySelector("[data-tone-options]");
    const clearButton = menu?.querySelector("[data-tone-clear]");
    const onChange = typeof options.onChange === "function" ? options.onChange : () => {};
    let selectedTone = options.value || "";

    if (!button || !menu || !optionRoot) {
      return {
        getValue: () => selectedTone,
        setValue: () => {}
      };
    }

    function updateButtonLabel() {
      const label = button.querySelector("span");
      if (label) label.textContent = selectedTone ? `Tom ${selectedTone}` : "Filtros";
      button.classList.toggle("is-active", Boolean(selectedTone));
    }

    function setExpanded(expanded) {
      menu.hidden = !expanded;
      button.setAttribute("aria-expanded", String(expanded));
    }

    function renderOptions() {
      optionRoot.innerHTML = MUSIC_TONES.map((tone) => `
        <button class="tone-filter-option" type="button" data-tone="${tone}" aria-pressed="${tone === selectedTone}">
          ${tone}
        </button>
      `).join("");
      updateButtonLabel();
    }

    function setValue(value = "") {
      selectedTone = value;
      optionRoot.querySelectorAll("[data-tone]").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.tone === selectedTone);
        item.setAttribute("aria-pressed", String(item.dataset.tone === selectedTone));
      });
      updateButtonLabel();
      onChange(selectedTone);
    }

    button.addEventListener("click", () => {
      setExpanded(menu.hidden);
    });

    optionRoot.addEventListener("click", (event) => {
      const toneButton = event.target.closest("[data-tone]");
      if (!toneButton) return;
      setValue(toneButton.dataset.tone);
      setExpanded(false);
    });

    clearButton?.addEventListener("click", () => {
      setValue("");
      setExpanded(false);
    });

    document.addEventListener("click", (event) => {
      if (menu.hidden || menu.contains(event.target) || button.contains(event.target)) return;
      setExpanded(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setExpanded(false);
    });

    renderOptions();

    return {
      getValue: () => selectedTone,
      setValue
    };
  }

  window.WorshipFlowSearch = {
    create: createSearch,
    createToneFilter,
    normalize,
    normalizeTone,
    tones: MUSIC_TONES
  };
})();
