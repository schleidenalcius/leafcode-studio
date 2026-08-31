// variables nécessaires pour le menu buger
const burgerBtn = document.getElementById("burger");
const nav = document.getElementById("nav");
const overlay = document.getElementById("overlay");
let personnages = document.querySelectorAll(".unPersonnage");
let personnageSelectionne = document.querySelector("#personnageSelectionne");
let nomPersonnageJeuUn = document.querySelector("#nomPersonnageJeuUn");
let descriptionPersonnageJeuUn = document.querySelector(
  "#descriptionPersonnageJeuUn",
);
let pBanniereAccueilSelectionne = document.querySelector(
  "#pBanniereAccueilSelectionne",
);
let bannieres = document.querySelectorAll(".imgQuiChangeP");
//variables nécessaires pour la liste de jeu dans la page d'accueil
/*let */

burgerBtn.addEventListener("click", () => {
  toggle();
});
overlay.addEventListener("click", () => {
  toggle();
});

function toggle() {
  burgerBtn.classList.toggle("is-open");
  nav.classList.toggle("is-open");
  overlay.classList.toggle("is-open");
}

function donnerEvenement() {
  personnages.forEach((personnage) => {
    personnage.addEventListener("click", (event) => {
      let idPersonnage = event.target.id;
      console.log(idPersonnage);
      switch (idPersonnage) {
        case "FALL":
          personnageSelectionne.src = "Images/jeuUn-F-Incomplet.png";
          nomPersonnageJeuUn.textContent = idPersonnage;
          descriptionPersonnageJeuUn.textContent = personnage.alt;
          break;
        case "Frieden":
          personnageSelectionne.src = "Images/jeuUn-Fr-Incomplet.png";
          nomPersonnageJeuUn.textContent = idPersonnage;
          descriptionPersonnageJeuUn.textContent = personnage.alt;
          break;
        case "Leo":
          personnageSelectionne.src = "Images/jeuUn-L-Incomplet.png";
          nomPersonnageJeuUn.textContent = idPersonnage;
          descriptionPersonnageJeuUn.textContent = personnage.alt;
          break;
        case "Coisabafe":
          personnageSelectionne.src = "Images/jeuUn-C-Incomplet.png";
          nomPersonnageJeuUn.textContent = idPersonnage;
          descriptionPersonnageJeuUn.textContent = personnage.alt;
          break;
      }
    });
  });
}

function changerTexteBanniereAccueil() {
  bannieres.forEach((banniere) => {
    banniere.addEventListener("click", () => {
      pBanniereAccueilSelectionne.textContent = banniere.alt;
    });
  });
}

donnerEvenement();
changerTexteBanniereAccueil();

// Jeu de lecture — L'univers d'Altius (jeuUn.html uniquement)
(() => {
  "use strict";
  const bookDataElement = document.getElementById("bookData");
  if (!bookDataElement) return;
  const book = JSON.parse(bookDataElement.textContent).book,
    $ = (id) => document.getElementById(id),
    K = {
      pos: "altiusReadingPosition",
      notes: "altiusReadingNotes",
      done: "completedChapters",
      xp: "altiusReadingXp",
      sessions: "readingSessions",
      rest: "altiusRestStartedAt",
    },
    REST = 900000;
  const state = {
    chapter: 0,
    paragraph: 0,
    word: 0,
    energy: 100,
    active: false,
    locked: false,
    start: 0,
    last: 0,
    pauseCounted: false,
    pauses: 0,
    notesTaken: 0,
    read: new Set(),
    samples: [],
    lastCount: 0,
    sampledMinute: 0,
    sessionChapters: new Set(),
    xpEarned: 0,
  };
  const readJSON = (k, f) => {
      try {
        return JSON.parse(localStorage.getItem(k)) ?? f;
      } catch {
        return f;
      }
    },
    saveJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  let notes = readJSON(K.notes, []),
    done = readJSON(K.done, []),
    sessions = readJSON(K.sessions, []),
    xp = Number(localStorage.getItem(K.xp)) || done.length * 10,
    tick,
    toastTimer;
  const tokenize = (t) =>
      [...t.matchAll(/\S+/gu)].map((m) => ({
        text: m[0],
        start: m.index,
        end: m.index + m[0].length,
      })),
    chapter = () => book.chapters[state.chapter],
    paragraph = () => chapter().paragraphs[state.paragraph],
    words = () => tokenize(paragraph()),
    clean = (w) => w.replace(/^[«“"'([{]+|[»”"')\]},.;:!?…]+$/gu, "") || w,
    wordId = () => `${chapter().id}-${state.paragraph}-${state.word}`;
  const esc = (v) => {
      const d = document.createElement("div");
      d.textContent = v;
      return d.innerHTML;
    },
    fmt = (s) =>
      `${String(Math.floor(Math.max(0, s) / 60)).padStart(2, "0")}:${String(Math.floor(Math.max(0, s)) % 60).padStart(2, "0")}`;
  const total = book.chapters.reduce(
    (a, c) => a + c.paragraphs.reduce((b, p) => b + tokenize(p).length, 0),
    0,
  );
  function offset() {
    let n = 0;
    book.chapters.forEach((c, ci) =>
      c.paragraphs.forEach((p, pi) => {
        if (
          ci < state.chapter ||
          (ci === state.chapter && pi < state.paragraph)
        )
          n += tokenize(p).length;
      }),
    );
    return n + state.word + 1;
  }
  function populate() {
    $("chapterSelect").innerHTML = book.chapters
      .map(
        (c, i) =>
          `<option value="${i}">Chapitre ${i + 1} — ${esc(
            c.title,
          )}${done.includes(c.id) ? " ✓" : ""}</option>`,
      )
      .join("");
  }
  function render() {
    const w = words();
    state.word = Math.min(state.word, Math.max(0, w.length - 1));
    $("chapterNumber").textContent = `Chapitre ${state.chapter + 1}`;
    $("chapterTitle").textContent = chapter().title;
    $("paragraphCount").textContent = `Paragraphe ${
      state.paragraph + 1
    } / ${chapter().paragraphs.length}`;
    $("chapterSelect").value = state.chapter;
    $("readingText").innerHTML = w
      .map(
        (x, i) =>
          `<span class="reading-word${i === state.word ? " current" : ""}">${esc(x.text)}</span>`,
      )
      .join(" ");
    $("currentWord").textContent = clean(w[state.word]?.text || "—");
    const p = Math.round((offset() / total) * 100);
    $("bookProgressLabel").textContent = `Livre : ${p} %`;
    $("bookProgressBar").style.width = p + "%";
    $("completionLabel").textContent =
      `${done.length} / ${book.chapters.length} chapitres terminés`;
    $("xpValue").textContent = xp + " XP";
    $("levelValue").textContent = `Niveau ${Math.floor(done.length / 5) + 1}`;
    saveJSON(K.pos, {
      chapter: state.chapter,
      paragraph: state.paragraph,
      word: state.word,
    });
  }
  function readWord() {
    if (state.active && !state.locked) state.read.add(wordId());
  }
  function activity() {
    if (state.active && !state.locked) {
      state.last = Date.now();
      state.pauseCounted = false;
    }
  }
  function complete(id) {
    if (done.includes(id)) {
      toast("Chapitre déjà terminé — mode relecture");
      return;
    }
    done.push(id);
    state.sessionChapters.add(id);
    xp += 10;
    state.xpEarned += 10;
    saveJSON(K.done, done);
    localStorage.setItem(K.xp, xp);
    populate();
    toast("Chapitre terminé ! +10 XP");
  }
  function move(dir) {
    if (!state.active || state.locked) return;
    activity();
    if (dir > 0) {
      if (state.word < words().length - 1) state.word++;
      else if (state.paragraph < chapter().paragraphs.length - 1) {
        state.paragraph++;
        state.word = 0;
      } else {
        complete(chapter().id);
        if (state.chapter < book.chapters.length - 1) {
          state.chapter++;
          state.paragraph = 0;
          state.word = 0;
        } else toast("Livre terminé !");
      }
    } else if (state.word > 0) state.word--;
    else if (state.paragraph > 0) {
      state.paragraph--;
      state.word = tokenize(chapter().paragraphs[state.paragraph]).length - 1;
    } else if (state.chapter > 0) {
      state.chapter--;
      state.paragraph = chapter().paragraphs.length - 1;
      state.word = words().length - 1;
    }
    readWord();
    render();
  }
  function sentence() {
    const p = paragraph(),
      t = words()[state.word];
    return (
      [...p.matchAll(/[^.!?…]+[.!?…]?/gu)].find(
        (m) => t.start >= m.index && t.start < m.index + m[0].length,
      )?.[0] || p
    ).trim();
  }
  function addNote(type) {
    if (!state.active || state.locked) return;
    activity();
    const content =
      type === "Mot" ? clean(words()[state.word].text) : sentence();
    notes.unshift({
      type,
      content,
      chapter: chapter().title,
      paragraph: state.paragraph + 1,
      date: new Date().toISOString(),
    });
    notes = notes.slice(0, 200);
    state.notesTaken++;
    saveJSON(K.notes, notes);
    renderNotes();
    toast(type + " ajouté au carnet");
  }
  function renderNotes() {
    $("notesList").innerHTML = notes.length
      ? notes
          .map(
            (n) =>
              `<li><strong>${esc(n.type)} : ${esc(
                n.content,
              )}</strong><br>Chapitre : ${esc(n.chapter)} · § ${n.paragraph}</li>`,
          )
          .join("")
      : '<li class="empty-note">Aucune note pour le moment.</li>';
  }
  function download() {
    const text = notes.length
      ? notes
          .map(
            (n) =>
              `Chapitre : ${n.chapter}\nParagraphe : ${n.paragraph}\n${n.type} : ${n.content}\n`,
          )
          .join("\n---\n\n")
      : "Aucune note.";
    const u = URL.createObjectURL(
        new Blob([text], { type: "text/plain;charset=utf-8" }),
      ),
      a = document.createElement("a");
    a.href = u;
    a.download = "carnet-philosophie.txt";
    a.click();
    URL.revokeObjectURL(u);
  }
  function energy() {
    $("energyValue").textContent = state.energy + " %";
    $("energyBar").style.width = state.energy + "%";
    $("energyBar").style.background =
      state.energy <= 25 ? "#db5555" : "linear-gradient(90deg,#e9b847,#7ddd7a)";
  }
  function controls(v) {
    document
      .querySelectorAll(".reading-control")
      .forEach((b) => (b.disabled = v));
    $("chapterSelect").disabled = v;
  }
  function chart() {
    const v = state.samples.slice(-8),
      max = Math.max(1, ...v);
    $("wpmChart").innerHTML = v.length
      ? v
          .map(
            (x, i) =>
              `<div class="wpm-bar" style="height:${Math.max(5, (x / max) * 100)}%" title="${x} mots"></div>`,
          )
          .join("")
      : '<small class="empty-note">Première mesure après 60 s.</small>';
  }
  function update() {
    updateRest();
    if (!state.active || state.locked) return;
    const elapsed = (Date.now() - state.start) / 1000;
    if (Date.now() - state.last > 3000 && !state.pauseCounted) {
      state.pauseCounted = true;
      state.pauses++;
      state.energy = Math.max(0, state.energy - 3);
      energy();
      if (state.energy === 0) {
        beginRest();
        return;
      }
    }
    const m = Math.floor(elapsed / 60);
    if (m > state.sampledMinute) {
      state.samples.push(state.read.size - state.lastCount);
      state.lastCount = state.read.size;
      state.sampledMinute = m;
      chart();
    }
    $("sessionTime").textContent = fmt(elapsed);
    $("sessionWords").textContent = state.read.size;
    $("sessionWpm").textContent = elapsed
      ? Math.round(state.read.size / (elapsed / 60))
      : 0;
    $("sessionPauses").textContent = state.pauses;
  }
  function start() {
    if (remaining() > 0) {
      restModal();
      return;
    }
    const p = readJSON(K.pos, {
      chapter: 0,
      paragraph: 0,
      word: 0,
    });
    Object.assign(state, {
      chapter: Math.min(book.chapters.length - 1, Math.max(0, p.chapter || 0)),
      paragraph: Math.max(0, p.paragraph || 0),
      word: Math.max(0, p.word || 0),
      energy: 100,
      active: true,
      locked: false,
      start: Date.now(),
      last: Date.now(),
      pauseCounted: false,
      pauses: 0,
      notesTaken: 0,
      read: new Set(),
      samples: [],
      lastCount: 0,
      sampledMinute: 0,
      sessionChapters: new Set(),
      xpEarned: 0,
    });
    $("readingGame").hidden = false;
    controls(false);
    energy();
    readWord();
    populate();
    render();
    chart();
    clearInterval(tick);
    tick = setInterval(update, 250);
    $("readingGame").scrollIntoView({ behavior: "smooth" });
    $("nextWord").focus();
  }
  function end(exhausted = false) {
    if (!state.active) {
      if (exhausted) restModal();
      return;
    }
    const duration = Math.max(1, Math.floor((Date.now() - state.start) / 1000));
    state.active = false;
    state.locked = exhausted;
    controls(exhausted);
    const s = {
      date: new Date().toISOString(),
      duration,
      wordsRead: state.read.size,
      averageWpm: Math.round(state.read.size / (duration / 60)),
      pauses: state.pauses,
      energyRemaining: state.energy,
      notesTaken: state.notesTaken,
      chaptersCompleted: state.sessionChapters.size,
      xpEarned: state.xpEarned,
    };
    sessions.unshift(s);
    sessions = sessions.slice(0, 20);
    saveJSON(K.sessions, sessions);
    history();
    summary(s, exhausted);
  }
  function summary(s, exhausted) {
    $("modalTitle").textContent = "SESSION TERMINÉE";
    $("modalContent").innerHTML =
      `<div class="summary-grid"><div><small>Temps de lecture</small><strong>${fmt(
        s.duration,
      )}</strong></div><div><small>Mots lus</small><strong>${s.wordsRead}</strong></div><div><small>Vitesse moyenne</small><strong>${s.averageWpm} mots/min</strong></div><div><small>Pauses</small><strong>${s.pauses}</strong></div><div><small>Énergie restante</small><strong>${s.energyRemaining} %</strong></div><div><small>Notes prises</small><strong>${s.notesTaken}</strong></div><div><small>Chapitres terminés</small><strong>${s.chaptersCompleted}</strong></div><div><small>XP gagné</small><strong>${s.xpEarned} XP</strong></div></div>${exhausted ? restHTML() : ""}`;
    $("closeModal").textContent = exhausted ? "Consulter le carnet" : "Fermer";
    $("gameModal").hidden = false;
  }
  function history() {
    $("historyList").innerHTML = sessions.length
      ? sessions
          .slice(0, 5)
          .map(
            (s) =>
              `<li><strong>${new Date(s.date).toLocaleDateString("fr-CA")}</strong> · ${fmt(s.duration)}<br>${s.wordsRead} mots · ${s.averageWpm} mots/min · ${s.xpEarned} XP</li>`,
          )
          .join("")
      : '<li class="empty-note">Aucune session terminée.</li>';
  }
  function beginRest() {
    localStorage.setItem(K.rest, Date.now());
    end(true);
    updateRest();
  }
  function remaining() {
    const t = Number(localStorage.getItem(K.rest));
    if (!t) return 0;
    const r = REST - (Date.now() - t);
    if (r <= 0) {
      localStorage.removeItem(K.rest);
      return 0;
    }
    return r;
  }
  function restHTML() {
    return `<div class="rest-box"><strong>ÉNERGIE ÉPUISÉE</strong><p>Tu as beaucoup lu. Repose-toi 15 minutes avant de recommencer.</p><span>Temps restant :</span><span class="rest-time" id="modalRestTime">${fmt(remaining() / 1000)}</span></div>`;
  }
  function restModal() {
    $("modalTitle").textContent = "Repos nécessaire";
    $("modalContent").innerHTML = restHTML();
    $("closeModal").textContent = "Consulter le carnet";
    $("gameModal").hidden = false;
    state.locked = true;
    controls(true);
  }
  function updateRest() {
    const r = remaining(),
      msg = $("launchRestMessage");
    if (r > 0) {
      msg.hidden = false;
      msg.textContent = `Repos nécessaire : ${fmt(r / 1000)} restantes`;
      $("launchGame").disabled = true;
      $("readingGame").hidden = false;
      state.energy = 0;
      state.locked = true;
      energy();
      controls(true);
      if ($("modalRestTime")) $("modalRestTime").textContent = fmt(r / 1000);
    } else {
      msg.hidden = true;
      $("launchGame").disabled = false;
      if (!state.active) state.locked = false;
    }
  }
  function toast(m) {
    $("gameToast").textContent = m;
    $("gameToast").classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => $("gameToast").classList.remove("show"),
      2400,
    );
  }
  $("launchGame").onclick = start;
  $("previousWord").onclick = () => move(-1);
  $("nextWord").onclick = () => move(1);
  $("saveWord").onclick = () => addNote("Mot");
  $("saveSentence").onclick = () => addNote("Phrase");
  $("downloadNotes").onclick = download;
  $("endSession").onclick = () => end(false);
  $("closeModal").onclick = () => {
    $("gameModal").hidden = true;
    if (!state.active && !state.locked) $("readingGame").hidden = true;
  };
  $("chapterSelect").onchange = (e) => {
    if (!state.active || state.locked) return;
    activity();
    state.chapter = Number(e.target.value);
    state.paragraph = state.word = 0;
    readWord();
    render();
    if (done.includes(chapter().id))
      toast("Mode relecture — aucun XP supplémentaire");
  };
  document.addEventListener("keydown", (e) => {
    if (
      !state.active ||
      state.locked ||
      !$("gameModal").hidden ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
    )
      return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      move(-1);
    } else if (e.key.toLowerCase() === "m") {
      e.preventDefault();
      addNote("Mot");
    } else if (e.code === "Space") {
      e.preventDefault();
      addNote("Phrase");
    }
  });
  const saved = readJSON(K.pos, { chapter: 0, paragraph: 0, word: 0 });
  state.chapter = Math.min(
    book.chapters.length - 1,
    Math.max(0, saved.chapter || 0),
  );
  state.paragraph = Math.min(
    chapter().paragraphs.length - 1,
    Math.max(0, saved.paragraph || 0),
  );
  state.word = Math.max(0, saved.word || 0);
  populate();
  render();
  renderNotes();
  history();
  chart();
  updateRest();
  setInterval(updateRest, 1000);
})();

// Jeu de dactylographie — LexiBall (jeuDeux.html uniquement)
(() => {
  "use strict";

  const canvas = document.getElementById("lexiCanvas");
  if (!canvas) return;

  const $ = (id) => document.getElementById(id);
  const ctx = canvas.getContext("2d");
  const wpmCanvas = $("lexiWpmCanvas");
  const wpmCtx = wpmCanvas.getContext("2d");
  const STORAGE_KEY = "lexiballProgress";
  const NOTEBOOK_KEY = "lexiballNotebook";

  const vocabularyData = [
    ["parcimonie", "Économie poussée parfois jusqu'à l'excès."],
    [
      "conjecture",
      "Opinion fondée sur des probabilités plutôt que sur des certitudes.",
    ],
    ["prépondérant", "Qui exerce une influence ou un poids supérieur."],
    [
      "péremptoire",
      "Exprimé d'une manière catégorique qui n'admet pas la discussion.",
    ],
    ["circonspect", "Qui agit avec prudence et réflexion."],
    ["exacerber", "Rendre plus intense ou plus aigu."],
    ["tacite", "Qui est compris sans être exprimé ouvertement."],
    [
      "ambiguïté",
      "Caractère de ce qui peut recevoir plusieurs interprétations.",
    ],
    ["prérogative", "Avantage ou droit particulier attaché à une fonction."],
    ["corroborer", "Confirmer un fait ou une affirmation par des preuves."],
    [
      "velléité",
      "Intention faible qui ne conduit généralement pas à l'action.",
    ],
    ["fastidieux", "Qui rebute par sa longueur ou sa monotonie."],
    ["sagacité", "Finesse d'esprit permettant de comprendre rapidement."],
    ["éluder", "Éviter avec adresse une difficulté ou une question."],
    ["probant", "Qui constitue une preuve convaincante."],
    ["abnégation", "Sacrifice volontaire de son intérêt personnel."],
    ["abscons", "Très difficile à comprendre en raison de son obscurité."],
    ["acerbe", "Qui manifeste une dureté mordante dans ses propos."],
    ["acuité", "Finesse et pénétration d'une perception ou d'un jugement."],
    ["admonester", "Réprimander quelqu'un avec sévérité."],
    ["adversité", "Ensemble de circonstances difficiles ou malheureuses."],
    ["affable", "Qui accueille et écoute avec bienveillance."],
    ["alacrité", "Vivacité joyeuse et pleine d'entrain."],
    [
      "allégorie",
      "Représentation d'une idée abstraite par une image concrète.",
    ],
    ["altruisme", "Disposition à se préoccuper du bien d'autrui."],
    ["anachronique", "Qui ne correspond pas à l'époque considérée."],
    ["antinomie", "Contradiction entre deux principes également défendables."],
    ["apocryphe", "Dont l'authenticité est douteuse ou non reconnue."],
    ["aporie", "Difficulté logique apparemment sans issue."],
    ["arbitraire", "Qui dépend d'une décision sans justification rationnelle."],
    ["ascendant", "Influence dominante exercée sur quelqu'un."],
    ["ataraxie", "Tranquillité profonde de l'âme."],
    ["atypique", "Qui s'écarte du type habituel."],
    ["aversion", "Sentiment de répulsion très marqué."],
    ["belliqueux", "Qui recherche volontiers le conflit."],
    ["caustique", "Qui critique avec une ironie mordante."],
    ["circonvenir", "Amener quelqu'un à agir par des manœuvres habiles."],
    ["coercitif", "Qui contraint par la force ou par la pression."],
    ["commensurable", "Qui peut être comparé selon une mesure commune."],
    ["concomitant", "Qui se produit en même temps qu'un autre fait."],
    ["consubstantiel", "Qui appartient à la nature même de quelque chose."],
    ["contingent", "Qui peut se produire ou non sans nécessité."],
    ["crépusculaire", "Qui évoque la lumière incertaine du crépuscule."],
    ["déférence", "Respect marqué envers une personne ou une autorité."],
    ["délétère", "Qui nuit gravement à la santé ou à une situation."],
    ["désinvolte", "Qui manifeste une liberté parfois excessive."],
    ["dichotomie", "Division d'un ensemble en deux parties opposées."],
    ["disparate", "Composé d'éléments qui manquent d'harmonie."],
    ["dispendieux", "Qui occasionne des dépenses importantes."],
    ["dogmatique", "Qui affirme des idées sans accepter leur discussion."],
    ["éclectique", "Qui choisit dans plusieurs systèmes ce qui lui convient."],
    ["efficience", "Capacité à produire un résultat avec peu de moyens."],
    ["empirique", "Qui se fonde sur l'expérience et l'observation."],
    ["endémique", "Qui demeure habituellement limité à une région."],
    ["épistémologie", "Étude critique des sciences et de la connaissance."],
    ["équivoque", "Qui peut être compris de plusieurs façons."],
    ["exhaustif", "Qui traite un sujet aussi complètement que possible."],
    ["exogène", "Qui provient de l'extérieur d'un système."],
    ["fallacieux", "Qui cherche à tromper sous une apparence logique."],
    ["flegmatique", "Qui conserve son calme en toute circonstance."],
    ["fortuit", "Qui survient par hasard."],
    ["galvauder", "Déprécier une notion en l'employant sans discernement."],
    ["hermétique", "Très difficile à comprendre ou fermé aux influences."],
    ["heuristique", "Qui aide à découvrir et à résoudre un problème."],
    ["iconoclaste", "Qui s'attaque aux traditions et aux idées établies."],
    ["idiosyncrasie", "Manière particulière de réagir propre à un individu."],
    ["immanent", "Qui réside dans la nature même d'un être."],
    ["impérieux", "Qui commande avec autorité ou présente une urgence."],
    ["implicite", "Qui est contenu dans une expression sans être formulé."],
    ["inéluctable", "À quoi il est impossible d'échapper."],
    ["inextricable", "Si compliqué qu'il paraît impossible à démêler."],
    ["inférer", "Tirer une conclusion à partir de faits ou de prémisses."],
    ["inhiber", "Freiner ou empêcher une action ou un comportement."],
    ["insidieux", "Qui agit progressivement et de manière cachée."],
    ["intrinsèque", "Qui appartient en propre à la nature d'une chose."],
    ["irréfragable", "Qu'il est impossible de contredire ou de réfuter."],
    ["lacunaire", "Qui présente des manques ou des insuffisances."],
    ["laconique", "Qui s'exprime en très peu de mots."],
    ["latent", "Qui existe sans se manifester encore clairement."],
    ["liminaire", "Qui se trouve au commencement d'un ouvrage."],
    ["magnanime", "Qui pardonne généreusement les offenses."],
    ["manichéen", "Qui réduit une situation à l'opposition du bien et du mal."],
    ["méticuleux", "Qui apporte un soin extrême aux détails."],
    ["mitiger", "Atténuer la rigueur ou l'intensité de quelque chose."],
    ["nébuleux", "Qui manque de clarté et reste difficile à saisir."],
    ["obédience", "Fidélité à une autorité, une doctrine ou une organisation."],
    ["obsolète", "Qui n'est plus adapté aux usages actuels."],
    ["ostensible", "Qui est montré avec l'intention d'être remarqué."],
    ["paradigme", "Modèle de pensée servant de référence."],
    [
      "paradoxe",
      "Idée contraire à l'opinion commune mais potentiellement vraie.",
    ],
    ["partialité", "Manque d'objectivité en faveur d'une partie."],
    ["perspicace", "Qui comprend rapidement ce qui est difficile à percevoir."],
    ["pléthorique", "Qui existe en quantité excessive."],
    ["pragmatique", "Qui privilégie l'action et les résultats concrets."],
    ["prégnant", "Qui s'impose fortement à l'esprit."],
    ["prolixe", "Qui s'exprime avec une longueur excessive."],
    ["résilience", "Capacité à surmonter une épreuve et à se reconstruire."],
    ["réticent", "Qui manifeste de la réserve ou de l'hésitation."],
    ["sibyllin", "Mystérieux et difficile à interpréter."],
    ["subséquent", "Qui vient après dans le temps ou dans un raisonnement."],
    ["subversif", "Qui cherche à renverser l'ordre établi."],
    ["syncrétique", "Qui combine plusieurs doctrines ou traditions."],
    ["tangible", "Que l'on peut percevoir ou constater clairement."],
    ["transcendant", "Qui dépasse un ordre de réalité donné."],
    ["ubiquité", "Capacité d'être présent en plusieurs lieux à la fois."],
    ["univoque", "Qui ne peut recevoir qu'une seule interprétation."],
    ["véhément", "Qui s'exprime avec une force passionnée."],
    ["vernaculaire", "Propre à une région ou à une communauté linguistique."],
    ["volubile", "Qui parle beaucoup, rapidement et avec aisance."],
    ["acception", "Sens particulier dans lequel un mot est employé."],
    ["acrimonie", "Agressivité et aigreur dans la manière de s'exprimer."],
    ["démiurge", "Créateur ou organisateur puissant d'une œuvre."],
    ["exégèse", "Interprétation approfondie d'un texte difficile."],
    ["ontologie", "Étude philosophique de l'être et de l'existence."],
    ["prosaïque", "Qui manque d'idéal ou relève du quotidien banal."],
    [
      "solipsisme",
      "Doctrine selon laquelle seul le sujet pensant est certain.",
    ],
    ["téléologie", "Étude d'un phénomène selon sa finalité."],
    ["tempérance", "Modération volontaire dans ses désirs et ses actes."],
    ["vindicatif", "Porté à la vengeance et au ressentiment."],
  ].map(([mot, definition]) => ({ mot, definition }));

  class VocabularyManager {
    constructor(data) {
      this.data = data;
    }
    available(displayed, level) {
      const maxLength = level === 1 ? 10 : level === 2 ? 12 : 99;
      let pool = this.data.filter(
        (item) => item.mot.length <= maxLength && !displayed.has(item.mot),
      );
      if (!pool.length)
        pool = this.data.filter((item) => !displayed.has(item.mot));
      return pool;
    }
    pick(displayed, level) {
      const pool = this.available(displayed, level);
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }

  class Notebook {
    constructor() {
      this.entries = this.load();
      this.render();
    }
    load() {
      try {
        return JSON.parse(localStorage.getItem(NOTEBOOK_KEY)) || [];
      } catch {
        return [];
      }
    }
    add(item) {
      if (!item || this.entries.some((entry) => entry.mot === item.mot))
        return false;
      this.entries.unshift({ ...item, date: new Date().toISOString() });
      localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(this.entries));
      this.render();
      return true;
    }
    reset() {
      this.entries = [];
      localStorage.removeItem(NOTEBOOK_KEY);
      this.render();
    }
    render() {
      $("lexiNotebookCount").textContent =
        `${this.entries.length} mot${this.entries.length > 1 ? "s" : ""} enregistré${this.entries.length > 1 ? "s" : ""}`;
      $("lexiNotebookList").innerHTML = this.entries.length
        ? this.entries
            .map(
              (entry) =>
                `<article class="lexi-note-entry"><strong>${escapeHtml(entry.mot)}</strong><p>${escapeHtml(entry.definition)}</p></article>`,
            )
            .join("")
        : '<p class="lexi-empty">Approche un mot et appuie sur Espace pour le conserver ici.</p>';
    }
  }

  class StatsManager {
    constructor() {
      const saved = this.load();
      this.xp = saved.xp || 0;
      this.totalCorrect = saved.totalCorrect || 0;
      this.bestWpm = saved.bestWpm || 0;
      this.wpmHistory = Array.isArray(saved.wpmHistory)
        ? saved.wpmHistory.slice(-10)
        : [];
      this.minuteCorrect = 0;
      this.minuteElapsed = 0;
    }
    load() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      } catch {
        return {};
      }
    }
    save() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          xp: this.xp,
          totalCorrect: this.totalCorrect,
          bestWpm: this.bestWpm,
          wpmHistory: this.wpmHistory,
        }),
      );
    }
    get level() {
      return Math.floor(this.xp / 100) + 1;
    }
    correctWord() {
      const previousLevel = this.level;
      this.xp += 5;
      this.totalCorrect += 1;
      this.minuteCorrect += 1;
      this.save();
      this.render();
      return this.level > previousLevel;
    }
    update(deltaMs) {
      this.minuteElapsed += deltaMs;
      if (this.minuteElapsed >= 60000) {
        this.wpmHistory.push(this.minuteCorrect);
        this.wpmHistory = this.wpmHistory.slice(-10);
        this.bestWpm = Math.max(this.bestWpm, this.minuteCorrect);
        this.minuteCorrect = 0;
        this.minuteElapsed -= 60000;
        this.save();
        this.drawChart();
      }
      $("lexiCurrentWpm").textContent =
        this.minuteElapsed > 1000
          ? Math.round(this.minuteCorrect / (this.minuteElapsed / 60000))
          : this.minuteCorrect;
    }
    render() {
      const xpInLevel = this.xp % 100;
      const wordsInLevel = this.totalCorrect % 20;
      $("lexiLevel").textContent = this.level;
      $("lexiXpText").textContent = `${xpInLevel} / 100 XP`;
      $("lexiXpBar").style.width = `${xpInLevel}%`;
      $("lexiWordsText").textContent = `${wordsInLevel} / 20`;
      $("lexiWordsBar").style.width = `${wordsInLevel * 5}%`;
      $("lexiBestWpm").textContent = this.bestWpm;
      this.drawChart();
    }
    drawChart() {
      const values = this.wpmHistory.length ? this.wpmHistory : [0];
      const width = wpmCanvas.width,
        height = wpmCanvas.height,
        max = Math.max(5, ...values);
      wpmCtx.clearRect(0, 0, width, height);
      wpmCtx.strokeStyle = "#315e4d";
      wpmCtx.beginPath();
      wpmCtx.moveTo(0, height - 1);
      wpmCtx.lineTo(width, height - 1);
      wpmCtx.stroke();
      const gap = 4,
        barWidth = (width - gap * (values.length - 1)) / values.length;
      values.forEach((value, index) => {
        const barHeight = Math.max(2, (value / max) * (height - 8));
        const gradient = wpmCtx.createLinearGradient(
          0,
          height - barHeight,
          0,
          height,
        );
        gradient.addColorStop(0, "#8cf0bd");
        gradient.addColorStop(1, "#36a97b");
        wpmCtx.fillStyle = gradient;
        wpmCtx.fillRect(
          index * (barWidth + gap),
          height - barHeight,
          barWidth,
          barHeight,
        );
      });
    }
    reset() {
      this.xp = 0;
      this.totalCorrect = 0;
      this.bestWpm = 0;
      this.wpmHistory = [];
      this.minuteCorrect = 0;
      this.minuteElapsed = 0;
      localStorage.removeItem(STORAGE_KEY);
      this.render();
    }
  }

  class Player {
    constructor() {
      this.radius = 18;
      this.reset();
    }
    reset() {
      this.x = 70;
      this.y = 470;
      this.vx = 0;
      this.vy = 0;
      this.grounded = false;
      this.onPlatform = null;
    }
    jump() {
      if (this.grounded) {
        this.vy = -11.5;
        this.grounded = false;
        this.onPlatform = null;
      }
    }
    update(keys, scale, platforms, words, slowed) {
      const acceleration = slowed ? 0.35 : 0.68,
        maxSpeed = slowed ? 2.4 : 5.4;
      if (keys.ArrowLeft)
        this.vx = Math.max(-maxSpeed, this.vx - acceleration * scale);
      if (keys.ArrowRight)
        this.vx = Math.min(maxSpeed, this.vx + acceleration * scale);
      if (!keys.ArrowLeft && !keys.ArrowRight) this.vx *= Math.pow(0.82, scale);
      if (keys.ArrowDown && !this.grounded) this.vy += 0.38 * scale;
      const previousBottom = this.y + this.radius;
      this.vy += 0.58 * scale;
      this.x += this.vx * scale;
      this.y += this.vy * scale;
      this.x = Math.max(
        this.radius,
        Math.min(canvas.width - this.radius, this.x),
      );
      this.grounded = false;
      this.onPlatform = null;
      const surfaces = [
        ...platforms,
        ...words
          .filter((word) => word.isPlatform)
          .map((word) => word.surface()),
      ];
      for (const surface of surfaces) {
        const nowBottom = this.y + this.radius;
        if (
          this.vy >= 0 &&
          previousBottom <= surface.y + 5 &&
          nowBottom >= surface.y &&
          this.x + this.radius > surface.x &&
          this.x - this.radius < surface.x + surface.width
        ) {
          this.y = surface.y - this.radius;
          this.vy = 0;
          this.grounded = true;
          this.onPlatform = surface.owner || null;
          if (surface.owner && surface.owner.lastDx)
            this.x += surface.owner.lastDx * scale;
          break;
        }
      }
      const floor = canvas.height - 30;
      if (this.y + this.radius >= floor) {
        this.y = floor - this.radius;
        this.vy = 0;
        this.grounded = true;
        this.onPlatform = null;
      }
    }
    draw(context) {
      const gradient = context.createRadialGradient(
        this.x - 6,
        this.y - 8,
        3,
        this.x,
        this.y,
        this.radius,
      );
      gradient.addColorStop(0, "#ecfff6");
      gradient.addColorStop(0.25, "#81ecc0");
      gradient.addColorStop(1, "#168a63");
      context.shadowColor = "#62e7ae";
      context.shadowBlur = 18;
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
      context.fillStyle = "#0a3b2c";
      context.beginPath();
      context.arc(this.x - 6, this.y - 3, 2.3, 0, Math.PI * 2);
      context.arc(this.x + 6, this.y - 3, 2.3, 0, Math.PI * 2);
      context.fill();
    }
  }

  class WorldWord {
    constructor(data, x, y, type, context) {
      this.data = data;
      this.text = data.mot;
      this.x = x;
      this.y = y;
      this.baseY = y;
      this.type = type;
      this.height = 30;
      this.width = Math.max(76, context.measureText(this.text).width + 24);
      this.vx =
        type === "moving" || type === "movingPlatform"
          ? (Math.random() < 0.5 ? -1 : 1) * 0.55
          : 0;
      this.vy = 0;
      this.phase = Math.random() * Math.PI * 2;
      this.amplitude = 10 + Math.random() * 8;
      this.falling = false;
      this.spawnTime = performance.now();
      this.active = false;
      this.lastDx = 0;
    }
    get isPlatform() {
      return this.type === "platform" || this.type === "movingPlatform";
    }
    surface() {
      return {
        x: this.x - this.width / 2,
        y: this.y + 5,
        width: this.width,
        owner: this,
      };
    }
    update(time, scale, player, platforms) {
      this.lastDx = 0;
      if (this.active) return;
      if (this.type === "floating")
        this.y =
          this.baseY + Math.sin(time * 0.0012 + this.phase) * this.amplitude;
      if (this.type === "moving" || this.type === "movingPlatform") {
        this.lastDx = this.vx;
        if (
          this.x - this.width / 2 < 25 ||
          this.x + this.width / 2 > canvas.width - 25
        )
          this.vx *= -1;
        this.x += this.vx * scale;
      }
      if (this.type === "falling") {
        if (
          !this.falling &&
          (time - this.spawnTime > 3500 ||
            (Math.abs(player.x - this.x) < 70 && player.y > this.y))
        )
          this.falling = true;
        if (this.falling) {
          const previousBottom = this.y + this.height / 2;
          this.vy += 0.28 * scale;
          this.y += this.vy * scale;
          const landing = platforms.find(
            (surface) =>
              this.vy >= 0 &&
              previousBottom <= surface.y &&
              this.y + this.height / 2 >= surface.y &&
              this.x + this.width / 2 > surface.x &&
              this.x - this.width / 2 < surface.x + surface.width,
          );
          const floor = canvas.height - 46;
          if (landing) {
            this.y = landing.y - this.height / 2;
            this.vy = 0;
            this.falling = false;
            this.type = "static";
          } else if (this.y + this.height / 2 >= floor) {
            this.y = floor - this.height / 2;
            this.vy = 0;
            this.falling = false;
            this.type = "static";
          }
        }
      }
    }
    collides(player) {
      const nearestX = Math.max(
          this.x - this.width / 2,
          Math.min(player.x, this.x + this.width / 2),
        ),
        nearestY = Math.max(
          this.y - this.height / 2,
          Math.min(player.y, this.y + this.height / 2),
        );
      return (
        Math.hypot(player.x - nearestX, player.y - nearestY) < player.radius + 3
      );
    }
    draw(context) {
      const x = this.x - this.width / 2,
        y = this.y - this.height / 2;
      context.save();
      context.font = "700 18px system-ui";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = this.active
        ? "#f5d56f"
        : this.isPlatform
          ? "#173f34dd"
          : "#102d26dc";
      context.strokeStyle = this.active
        ? "#fff0a8"
        : this.isPlatform
          ? "#72d8aa"
          : "#4a9b7b";
      context.lineWidth = this.active ? 3 : 1.5;
      context.shadowColor = this.active ? "#ffe27a" : "transparent";
      context.shadowBlur = this.active ? 22 : 0;
      roundRect(context, x, y, this.width, this.height, 8);
      context.fill();
      context.stroke();
      context.shadowBlur = 0;
      context.fillStyle = this.active ? "#153128" : "#effff7";
      context.fillText(this.text, this.x, this.y + 1);
      if (this.type === "floating") {
        context.fillStyle = "#79dbae";
        context.font = "11px system-ui";
        context.fillText("↕", this.x + this.width / 2 + 9, this.y);
      }
      if (this.type === "moving" || this.type === "movingPlatform") {
        context.fillStyle = "#79dbae";
        context.font = "11px system-ui";
        context.fillText("↔", this.x + this.width / 2 + 10, this.y);
      }
      context.restore();
    }
  }

  class Game {
    constructor() {
      this.vocabulary = new VocabularyManager(vocabularyData);
      this.notebook = new Notebook();
      this.stats = new StatsManager();
      this.player = new Player();
      this.words = [];
      this.keys = {};
      this.platforms = [
        { x: 190, y: 430, width: 170 },
        { x: 430, y: 345, width: 180 },
        { x: 690, y: 255, width: 170 },
        { x: 120, y: 190, width: 150 },
      ];
      this.activeWord = null;
      this.typed = "";
      this.energy = 100;
      this.running = false;
      this.paused = false;
      this.gameOver = false;
      this.lastTime = performance.now();
      this.activeLastContact = 0;
      this.feedbackTimer = 0;
      this.sessionElapsed = 0;
      this.sessionCorrect = 0;
      this.sessionXp = 0;
      this.bind();
      this.stats.render();
      this.updateHud();
      this.renderTyping();
      this.spawnSet();
      requestAnimationFrame((time) => this.loop(time));
    }
    bind() {
      $("launchLexiBall").onclick = () => {
        $("lexiBallGame").hidden = false;
        $("lexiBallGame").scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        $("lexiStartScreen").hidden = false;
      };
      $("lexiPlay").onclick = () => this.startSession();
      $("lexiPauseButton").onclick = () => this.togglePause();
      $("lexiEndSession").onclick = () => this.endSession();
      $("lexiResume").onclick = () => this.togglePause(false);
      $("lexiRestart").onclick = () => this.startSession();
      $("lexiCloseSession").onclick = () => this.closeSession();
      $("lexiNotebookToggle").onclick = () => this.toggleNotebook();
      $("lexiNotebookClose").onclick = () => this.toggleNotebook(false);
      $("lexiMenuNotebook").onclick = () => this.toggleNotebook();
      $("lexiReset").onclick = () => {
        if (
          confirm("Réinitialiser toute la progression LexiBall et le carnet ?")
        ) {
          this.stats.reset();
          this.notebook.reset();
          this.energy = 100;
          this.updateHud();
          this.showFeedback("Progression réinitialisée");
        }
      };
      document.addEventListener("keydown", (event) => this.keyDown(event));
      document.addEventListener("keyup", (event) => {
        if (event.key.startsWith("Arrow")) {
          event.preventDefault();
          this.keys[event.key] = false;
        }
      });
      window.addEventListener("blur", () => {
        if (this.running && !this.paused) this.togglePause(true);
      });
    }
    startSession() {
      this.energy = 100;
      this.running = true;
      this.paused = false;
      this.gameOver = false;
      this.typed = "";
      this.activeWord = null;
      this.sessionElapsed = 0;
      this.sessionCorrect = 0;
      this.sessionXp = 0;
      this.player.reset();
      this.words = [];
      this.spawnSet();
      this.stats.minuteCorrect = 0;
      this.stats.minuteElapsed = 0;
      $("lexiStartScreen").hidden = true;
      $("lexiPauseScreen").hidden = true;
      $("lexiSessionSummary").hidden = true;
      $("lexiCloseSession").hidden = true;
      $("lexiRestart").hidden = true;
      $("lexiResume").hidden = false;
      this.lastTime = performance.now();
      this.updateHud();
      this.renderTyping();
      this.showFeedback("C’EST PARTI !");
    }
    togglePause(force) {
      if (!this.running || this.gameOver) return;
      this.paused = typeof force === "boolean" ? force : !this.paused;
      $("lexiPauseScreen").hidden = !this.paused;
      $("lexiPauseTitle").textContent = "PAUSE";
      $("lexiPauseText").textContent = "Appuie sur P pour reprendre.";
      $("lexiResume").hidden = false;
      $("lexiRestart").hidden = true;
      this.lastTime = performance.now();
    }
    toggleNotebook(force) {
      const open =
        typeof force === "boolean"
          ? force
          : !$("lexiBody").classList.contains("notebook-open");
      $("lexiBody").classList.toggle("notebook-open", open);
      $("lexiNotebookToggle").setAttribute("aria-expanded", String(open));
      if (open) this.notebook.render();
    }
    keyDown(event) {
      if (
        $("lexiBallGame").hidden ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
      )
        return;
      if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        this.keys[event.key] = true;
        if (
          event.key === "ArrowUp" &&
          !event.repeat &&
          this.running &&
          !this.paused
        )
          this.player.jump();
        return;
      }
      if (
        (event.key === "p" || event.key === "P") &&
        (!this.activeWord || event.shiftKey)
      ) {
        event.preventDefault();
        if (this.running) this.togglePause();
        return;
      }
      if (!this.running || this.paused || this.gameOver) return;
      if (event.code === "Space") {
        event.preventDefault();
        if (this.activeWord) {
          const added = this.notebook.add(this.activeWord.data);
          this.showFeedback(
            added ? "Mot ajouté au carnet" : "Déjà dans le carnet",
          );
        }
      } else if (event.key === "Backspace") {
        event.preventDefault();
        if (!event.repeat) {
          this.typed = this.typed.slice(0, -1);
          this.renderTyping();
        }
      } else if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.repeat &&
        this.activeWord
      ) {
        event.preventDefault();
        this.typeCharacter(event.key);
      }
    }
    typeCharacter(character) {
      const expected = this.activeWord.text[this.typed.length];
      this.typed += character.toLocaleLowerCase("fr");
      if (character.toLocaleLowerCase("fr") !== expected) {
        this.energy = Math.max(0, this.energy - 1);
        this.hitEnergy();
        if (this.energy === 0) {
          this.endByEnergy();
          return;
        }
      }
      this.renderTyping();
      if (this.typed === this.activeWord.text) this.completeWord();
    }
    hitEnergy() {
      this.updateHud();
      $("lexiStage").classList.remove("energy-hit");
      void $("lexiStage").offsetWidth;
      $("lexiStage").classList.add("energy-hit");
    }
    completeWord() {
      const completed = this.activeWord,
        levelUp = this.stats.correctWord();
      this.sessionCorrect++;
      this.sessionXp += 5;
      this.words = this.words.filter((word) => word !== completed);
      this.activeWord = null;
      this.typed = "";
      this.spawnWord();
      this.updateHud();
      this.renderTyping();
      this.showFeedback(levelUp ? "NIVEAU SUPÉRIEUR !" : " +5 XP ");
    }
    endSession() {
      if (!this.running || this.gameOver) return;
      this.running = false;
      this.paused = true;
      this.keys = {};
      const seconds = Math.max(1, Math.floor(this.sessionElapsed / 1000));
      const average = Math.round(this.sessionCorrect / (seconds / 60));
      $("lexiPauseScreen").hidden = false;
      $("lexiPauseTitle").textContent = "SESSION TERMINÉE";
      $("lexiPauseText").textContent = "Ta progression a été sauvegardée.";
      $("lexiSessionSummary").innerHTML =
        `<div><small>Temps de jeu</small><strong>${formatLexiTime(seconds)}</strong></div><div><small>Mots réussis</small><strong>${this.sessionCorrect}</strong></div><div><small>MPM moyen</small><strong>${average}</strong></div><div><small>Énergie restante</small><strong>${this.energy} %</strong></div><div><small>XP gagné</small><strong>${this.sessionXp} XP</strong></div><div><small>Niveau actuel</small><strong>${this.stats.level}</strong></div>`;
      $("lexiSessionSummary").hidden = false;
      $("lexiResume").hidden = true;
      $("lexiRestart").hidden = false;
      $("lexiCloseSession").hidden = false;
    }
    closeSession() {
      $("lexiBallGame").hidden = true;
      $("lexiPauseScreen").hidden = true;
      this.running = false;
      this.paused = false;
      this.keys = {};
      $("lexiLaunchZone").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    endByEnergy() {
      this.running = false;
      this.gameOver = true;
      this.paused = true;
      $("lexiPauseScreen").hidden = false;
      $("lexiPauseTitle").textContent = "ÉNERGIE ÉPUISÉE";
      $("lexiPauseText").textContent =
        "Tes progrès sont sauvegardés. Reprends avec une nouvelle session.";
      $("lexiSessionSummary").hidden = true;
      $("lexiResume").hidden = true;
      $("lexiRestart").hidden = false;
      $("lexiCloseSession").hidden = false;
      this.showFeedback("0 % ÉNERGIE");
    }
    chooseType(index) {
      const level = this.stats.level;
      if (index === 0) return level === 1 ? "static" : "platform";
      const roll = Math.random();
      if (level === 1) return roll < 0.62 ? "static" : "platform";
      if (level === 2)
        return roll < 0.48 ? "static" : roll < 0.78 ? "platform" : "floating";
      if (level === 3)
        return roll < 0.4
          ? "static"
          : roll < 0.65
            ? "platform"
            : roll < 0.83
              ? "floating"
              : "moving";
      if (level === 4)
        return roll < 0.38
          ? "static"
          : roll < 0.62
            ? "platform"
            : roll < 0.76
              ? "floating"
              : roll < 0.9
                ? "moving"
                : "falling";
      return roll < 0.35
        ? "static"
        : roll < 0.6
          ? "platform"
          : roll < 0.75
            ? "floating"
            : roll < 0.85
              ? "moving"
              : roll < 0.95
                ? "falling"
                : "movingPlatform";
    }
    spawnSet() {
      const count = Math.min(8, 5 + Math.floor((this.stats.level - 1) / 2));
      for (let i = 0; i < count; i++) this.spawnWord(i);
    }
    spawnWord(index = this.words.length) {
      const shown = new Set(this.words.map((word) => word.text)),
        data = this.vocabulary.pick(shown, this.stats.level);
      if (!data) return;
      const type = this.chooseType(index),
        tiers = [465, 400, 315, 225, 155];
      let x,
        y,
        width,
        attempt = 0;
      ctx.font = "700 18px system-ui";
      width = Math.max(76, ctx.measureText(data.mot).width + 24);
      do {
        x = 45 + width / 2 + Math.random() * (canvas.width - width - 90);
        y = tiers[Math.floor(Math.random() * tiers.length)];
        attempt++;
      } while (
        attempt < 40 &&
        this.words.some(
          (word) =>
            Math.abs(word.x - x) < (word.width + width) / 2 + 24 &&
            Math.abs(word.y - y) < 48,
        )
      );
      if (index === 0) {
        x = 170;
        y = 465;
      }
      this.words.push(new WorldWord(data, x, y, type, ctx));
    }
    activate(word, time) {
      if (this.activeWord === word) {
        this.activeLastContact = time;
        return;
      }
      if (this.activeWord) this.activeWord.active = false;
      this.activeWord = word;
      word.active = true;
      this.typed = "";
      this.activeLastContact = time;
      this.renderTyping();
      this.showFeedback(word.text.toUpperCase());
    }
    checkWordCollisions(time) {
      for (const word of this.words) {
        if (word.collides(this.player)) {
          this.activate(word, time);
          break;
        }
      }
      if (
        this.activeWord &&
        !this.activeWord.collides(this.player) &&
        time - this.activeLastContact > 4500 &&
        Math.hypot(
          this.player.x - this.activeWord.x,
          this.player.y - this.activeWord.y,
        ) > 210
      ) {
        this.activeWord.active = false;
        this.activeWord = null;
        this.typed = "";
        this.renderTyping();
      }
    }
    update(delta, time) {
      this.sessionElapsed += delta;
      const scale = Math.min(2, delta / 16.667);
      this.words.forEach((word) =>
        word.update(time, scale, this.player, this.platforms),
      );
      this.player.update(
        this.keys,
        scale,
        this.platforms,
        this.words,
        Boolean(this.activeWord),
      );
      this.checkWordCollisions(time);
      this.stats.update(delta);
    }
    updateHud() {
      $("lexiEnergyText").textContent = `${this.energy} %`;
      $("lexiEnergyBar").style.width = `${this.energy}%`;
      const bar = $("lexiEnergyBar");
      bar.style.background =
        this.energy > 60
          ? "linear-gradient(90deg,#4ed293,#9bf0bf)"
          : this.energy > 25
            ? "linear-gradient(90deg,#e1a83e,#f3d478)"
            : "linear-gradient(90deg,#d94343,#ff7777)";
      this.stats.render();
    }
    renderTyping() {
      if (!this.activeWord) {
        $("lexiTargetWord").textContent = "Trouve un mot dans le monde";
        $("lexiTypedWord").textContent = "_";
        $("lexiDefinition").textContent =
          "Entre en contact avec un mot pour découvrir sa définition.";
        return;
      }
      $("lexiTargetWord").textContent = this.activeWord.text;
      $("lexiDefinition").textContent = this.activeWord.data.definition;
      $("lexiTypedWord").innerHTML = [...this.activeWord.text]
        .map((char, index) =>
          index < this.typed.length
            ? `<span class="${
                this.typed[index] === char
                  ? "lexi-char-correct"
                  : "lexi-char-wrong"
              }">${escapeHtml(this.typed[index])}</span>`
            : `<span class="lexi-char-pending">${
                index === this.typed.length ? "_" : escapeHtml(char)
              }</span>`,
        )
        .join("");
    }
    showFeedback(text) {
      const element = $("lexiFloatMessage");
      element.textContent = text;
      element.classList.remove("show");
      void element.offsetWidth;
      element.classList.add("show");
    }
    drawBackground() {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0b3129");
      gradient.addColorStop(0.62, "#155442");
      gradient.addColorStop(1, "#0d2d25");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff08";
      for (let i = 0; i < 28; i++) {
        const x = (i * 139) % canvas.width,
          y = (i * 83) % 430;
        ctx.beginPath();
        ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#163e32";
      ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
      ctx.fillStyle = "#61b78f";
      ctx.fillRect(0, canvas.height - 31, canvas.width, 3);
      for (const p of this.platforms) {
        ctx.fillStyle = "#214e3f";
        ctx.strokeStyle = "#58ae87";
        ctx.lineWidth = 2;
        roundRect(ctx, p.x, p.y, p.width, 14, 7);
        ctx.fill();
        ctx.stroke();
      }
    }
    draw() {
      this.drawBackground();
      this.words.forEach((word) => word.draw(ctx));
      this.player.draw(ctx);
      if (!this.running && $("lexiStartScreen").hidden) {
        ctx.fillStyle = "#05191466";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    loop(time) {
      const delta = Math.min(40, time - this.lastTime || 16);
      this.lastTime = time;
      if (this.running && !this.paused) this.update(delta, time);
      this.draw();
      requestAnimationFrame((next) => this.loop(next));
    }
  }

  function roundRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }
  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  }
  function formatLexiTime(seconds) {
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }

  new Game();
})();
