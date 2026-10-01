/* fx.js — the hero chat, the guessing game, the rewrite cards, the reveals.

   Every component is in its finished state in the HTML. This file only
   animates towards that state, so a visitor with scripting off or reduced
   motion on reads the same page, just still. */

(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ── Reveal on scroll ─────────────────────────────────────────────── */
  var io = "IntersectionObserver" in window && !still
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px" })
    : null;
  $$(".reveal").forEach(function (el) { io ? io.observe(el) : el.classList.add("in"); });
  $$(".types .pin").forEach(function (p, i) { p.style.setProperty("--i", i); });

  /* ── Marquee: written once, doubled here so the loop has no seam ──── */
  $$(".marquee-row").forEach(function (row) {
    $$(".mq", row).forEach(function (mq) {
      var c = mq.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      row.appendChild(c);
    });
  });

  /* ── The hero chat ────────────────────────────────────────────────── */
  // Typed, judged, fixed, answered. Then again.
  var demo = $(".chat-demo");
  if (demo && !still) {
    var draft = $(".chat-draft", demo);
    var stamp = $(".chat-stamp", demo);
    var chip = $(".chat-chip", demo);
    var reply = $(".chat-reply", demo);
    var tag = $(".style-tag", demo);
    var BAD = "hey sorry to bother you again but i was just wondering if maybe you wanted to grab ramen friday? no rush if you're busy";
    var MARKS = ["sorry to bother", "just wondering if maybe", "no rush if you're busy"];
    var GOOD = "Ramen Friday. I'll book us for 8.";
    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(demo);
    }
    var marked = function (s) {
      var out = esc(s);
      MARKS.forEach(function (m) { out = out.replace(esc(m), '<span class="ph">' + esc(m) + "</span>"); });
      return out;
    };
    var type = async function (text) {
      for (var i = 0; i <= text.length; i++) {
        draft.innerHTML = esc(text.slice(0, i)) + '<span class="caret"></span>';
        await wait(text[i - 1] === " " ? 46 : 28 + Math.random() * 30);
      }
    };
    var setStamp = function (go) {
      stamp.className = "stamp chat-stamp" + (go ? " go" : "");
      stamp.textContent = go ? "SEND IT" : "DON'T SEND";
      void stamp.offsetWidth;
      stamp.classList.add("on");
    };
    var loop = async function () {
      for (;;) {
        while (!visible) await wait(400);
        demo.classList.remove("judged");
        [stamp, chip, reply, tag].forEach(function (el) { el.classList.remove("on"); });
        draft.style.opacity = 1;
        draft.innerHTML = '<span class="caret"></span>';
        await wait(700);
        await type(BAD);
        await wait(500);
        draft.innerHTML = marked(BAD);
        demo.classList.add("judged");
        setStamp(false);
        demo.classList.add("shake");
        setTimeout(function () { demo.classList.remove("shake"); }, 420);
        chip.textContent = "34% desperation";
        chip.classList.add("on");
        await wait(2600);
        stamp.classList.remove("on"); chip.classList.remove("on");
        draft.style.opacity = 0;
        await wait(380);
        demo.classList.remove("judged");
        draft.textContent = GOOD;
        draft.style.opacity = 1;
        tag.classList.add("on");
        await wait(500);
        setStamp(true);
        chip.textContent = "confident · 😤";
        chip.classList.add("on");
        await wait(1500);
        stamp.classList.remove("on"); chip.classList.remove("on");
        reply.classList.add("on");
        await wait(3200);
      }
    };
    loop();
  }

  /* ── Rewrite cards: a copy lands on one, then the next ────────────── */
  var cards = $$(".rw-card");
  if (cards.length && !still) {
    var n = 0;
    setInterval(function () {
      cards.forEach(function (c) { c.classList.remove("hot"); });
      cards[n % cards.length].classList.add("hot");
      n++;
    }, 1700);
  }

  /* ── Would you send it? ───────────────────────────────────────────── */
  var game = $(".game");
  if (game) {
    var ROUNDS = [
      { to: "crush", at: "11:48 pm", text: "hey sorry to bother you again but did you see my last message?", go: false,
        why: "An apology for existing, then a request to explain the silence. Two strikes before hello." },
      { to: "best friend", at: "2:02 pm", text: "saw a dog that looked exactly like you. thriving. call me later?", go: true,
        why: "Light, specific and easy to answer. That's the entire job." },
      { to: "ex", at: "2:13 am", text: "i'm not drunk i just think we should talk", go: false,
        why: "Nobody has ever believed the first four words. It's 2am. Sleep on it." },
      { to: "date", at: "Sun 11:20 am", text: "had a really good time last night. same place next week?", go: true,
        why: "Says it plainly and suggests what's next. Confident without trying." },
      { to: "boss", at: "9:55 pm", text: "Hi!! So sorry, quick question, no rush at all!!! 🙏🙏", go: false,
        why: "Three apologies for one question. Ask it tomorrow at 9, once." }
    ];
    var i = 0, score = 0, results = [];
    var meta = $(".game-meta", game), thread = $(".game-thread", game);
    var buttons = $(".game-buttons", game), result = $(".game-result", game);
    var dots = $(".game-dots", game), play = $(".game-play", game), end = $(".game-end", game);

    var drawDots = function () {
      dots.innerHTML = ROUNDS.map(function (_, k) {
        return "<i class=\"" + (results[k] || (k === i ? "now" : "")) + "\"></i>";
      }).join("");
    };
    var show = function () {
      var r = ROUNDS[i];
      meta.innerHTML = "<span>To: <b>" + esc(r.to) + "</b></span><span>" + esc(r.at) + "</span>";
      thread.innerHTML = '<div class="bub me">' + esc(r.text) + "</div>";
      buttons.hidden = false;
      result.hidden = true;
      drawDots();
    };
    var answer = function (go) {
      var r = ROUNDS[i], right = go === r.go;
      if (right) score++;
      results[i] = right ? "right" : "wrong";
      buttons.hidden = true;
      result.hidden = false;
      result.innerHTML =
        '<span class="stamp sm' + (r.go ? " go" : "") + '">' + (r.go ? "SEND IT" : "DON'T SEND") + "</span>" +
        '<p class="game-why">' + esc(r.why) + "</p>" +
        '<p class="game-you ' + (right ? "right" : "wrong") + '">' + (right ? "You called it." : "Not this time.") + "</p>" +
        '<button class="game-next" type="button">' + (i < ROUNDS.length - 1 ? "Next text →" : "See your score") + "</button>";
      drawDots();
      $(".game-next", result).focus({ preventScroll: true });
    };
    var finish = function () {
      play.hidden = true;
      end.hidden = false;
      $(".score", end).textContent = score + "/" + ROUNDS.length;
      $(".verdict-line", end).textContent =
        score === 5 ? "Flawless. You barely need us. Barely." :
        score >= 3 ? "Good instincts. Now try it at 1am about someone you like." :
        "Respectfully: please run your texts past us first.";
    };
    game.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.classList.contains("game-btn")) answer(b.classList.contains("go"));
      else if (b.classList.contains("game-again")) {
        i = 0; score = 0; results = [];
        end.hidden = true; play.hidden = false; show();
      } else if (b.classList.contains("game-next")) {
        if (i < ROUNDS.length - 1) { i++; show(); } else finish();
      }
    });
    show();
  }
})();
