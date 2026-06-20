(function () {
  function normalize(value = "") {
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
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
    let source = Array.isArray(options.items) ? options.items : [];
    let timer = null;

    function matches(item, query) {
      if (!query) return true;
      return fields.some((field) => normalize(readValue(item, field)).includes(query));
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

      onChange(result, { query, total: source.length });
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

    if (input) input.addEventListener("input", schedule);
    if (clearButton) clearButton.addEventListener("click", clear);

    apply();

    return {
      apply,
      clear,
      setItems
    };
  }

  window.WorshipFlowSearch = {
    create: createSearch,
    normalize
  };
})();
