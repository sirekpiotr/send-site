/* Dark / light mode.
   Loaded in <head> without defer so the theme is applied before first paint —
   otherwise a dark-mode visitor gets a white flash on every page load. */

(function () {
  var root = document.documentElement;

  // A stored choice wins; otherwise we inherit the system preference via CSS.
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  if (stored === "dark" || stored === "light") {
    root.setAttribute("data-theme", stored);
  }

  function current() {
    var explicit = root.getAttribute("data-theme");
    if (explicit) return explicit;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function label(button) {
    // Name the destination, not the current state.
    button.textContent = current() === "dark" ? "Light" : "Dark";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector(".theme-toggle");
    if (!button) return;

    label(button);

    button.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      label(button);
    });

    // Track the system while the visitor hasn't picked a side.
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      if (!root.getAttribute("data-theme")) label(button);
    });
  });
})();
