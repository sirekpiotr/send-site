/* The mobile menu.

   Its own file rather than a line in theme.js, because theme.js runs in the
   head before first paint and this needs the document. And deliberately not
   folded into anything that bails out under prefers-reduced-motion: a menu that
   stops opening for somebody who asked for less animation is a bug, not a
   preference.

   It degrades to something sane without JS. The links are plain anchors in the
   document, so with scripting off the CSS shows them all rather than hiding a
   menu nothing can open. */

(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  var nav = document.querySelector("nav");

  if (!toggle || !links || !nav) return;

  var open = false;

  function setOpen(next) {
    open = next;
    nav.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", function () {
    setOpen(!open);
  });

  // Every link here is a same-page anchor, so the document never reloads and
  // the panel would otherwise sit over the section it just jumped to.
  links.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && open) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Anywhere outside the bar dismisses it, the way a menu should.
  document.addEventListener("click", function (event) {
    if (open && !nav.contains(event.target)) setOpen(false);
  });

  // Rotating to landscape leaves the panel's styles behind but its state
  // stale, so reset rather than leave the aria lying about what is on screen.
  var wide = window.matchMedia("(min-width: 761px)");
  var onChange = function (event) { if (event.matches && open) setOpen(false); };
  if (wide.addEventListener) wide.addEventListener("change", onChange);
  else if (wide.addListener) wide.addListener(onChange);
})();
