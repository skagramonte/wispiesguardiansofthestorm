document.addEventListener("DOMContentLoaded", () => {
  // wispies en popups
  const wispieElements = document.querySelectorAll(".wispie");
  const popup = document.getElementById("popup");
  const popupImage = document.getElementById("popupWispieImage");

  // buttons
  const feedBtn = document.getElementById("feedBtn");
  const playBtn = document.getElementById("playBtn");
  const trainBtn = document.getElementById("trainBtn");
  const releaseBtn = document.getElementById("releaseBtn");
  const closePopupBtn = document.getElementById("closePopupBtn");

  // stats
  const hungerStat = document.getElementById("hungerStat");
  const funStat = document.getElementById("funStat");
  const strengthStat = document.getElementById("strengthStat");

  // schermlagen
  const overlay = document.getElementById("overlay");
  const startScreen = document.getElementById("startScreen");
  const startButton = document.getElementById("startButton");
  const game = document.getElementById("game");

  // storm dingen
  const stormOverlay = document.getElementById("stormOverlay");
  const stormPopup = document.getElementById("stormPopup");
  const weatherReport = document.getElementById("weatherReport");

  // Nieuwe storm message popups
  const stormMessagePopupRemoved = document.getElementById("stormMessagePopupRemoved");
  const stormMessagePopupSafe = document.getElementById("stormMessagePopupSafe");

  // Close buttons van storm message popups
  const stormMessageCloseBtnRemoved = document.getElementById("stormMessageCloseBtnRemoved");
  const stormMessageCloseBtnSafe = document.getElementById("stormMessageCloseBtnSafe");

  // Sounds 
  //bronnen: 
  // https://youtu.be/UQA5jG-yh78?feature=shared 
  // https://youtu.be/hn7MhPt24L4?feature=shared
  const bgMusic = document.getElementById('bgMusic');
  const stormMusic = document.getElementById('stormMusic');
  const wispieSound = document.getElementById('wispieSound');
  const grafsteenSound = document.getElementById('grafsteenSound');

  // data wispie
  const wispieData = [
    { id: 1, mood: "happy", stats: { hunger: 100, fun: 100, strength: 100 }, removed: false },
    { id: 2, mood: "happy", stats: { hunger: 100, fun: 100, strength: 100 }, removed: false },
    { id: 3, mood: "happy", stats: { hunger: 100, fun: 100, strength: 100 }, removed: false },
    { id: 4, mood: "happy", stats: { hunger: 100, fun: 100, strength: 100 }, removed: false },
    { id: 5, mood: "happy", stats: { hunger: 100, fun: 100, strength: 100 }, removed: false }
  ];

  // Bron: Enzo Raggani 
  wispieData[0].stats.hunger = 50;
  wispieData[0].stats.fun = 45;
  wispieData[0].stats.strength = 60;

  wispieData[3].stats.hunger = 65;
  wispieData[3].stats.fun = 40;
  wispieData[3].stats.strength = 45;

  let currentIndex = null;
  let isStormActive = false;
  let lastStormTime = 0; // Alleen gebruikt voor storms getriggered door verdrietige wispies

  // Animatie
  function updateWispieAnimation(index) {
    const element = wispieElements[index];
    const wispie = wispieData[index];
    
    element.classList.remove("happy", "sad", "verysad", "storm");
    
    if (wispie.removed) {
      // Toon grafsteen afbeelding
      element.src = "images/grafsteen.png";
      element.style.opacity = 0.7;
      return;
    } else {
      element.style.opacity = 1;
    }
    
    if (isStormActive) {
      element.classList.add("storm");
    } else {
      if (wispie.mood === "happy") {
        element.classList.add("happy");
      } else if (wispie.mood === "sad") {
        element.classList.add("sad");
      } else if (wispie.mood === "verysad") {
        element.classList.add("verysad");
      }
    }
  }

  // Wispie pop-up
  function showPopup(index) {
    if (wispieData[index].removed) return; // Geen popup voor grafsteen
    currentIndex = index;
    updatePopupImage(index);
    updateStatsUI();
    popup.classList.remove("hidden");
    overlay.classList.remove("hidden");

    // Speel wispie geluid af bij klikken op wispie
    wispieSound.currentTime = 0;
    wispieSound.play();
  }

  function updatePopupImage(index) {
    const wispie = wispieData[index];
    if (wispie.removed) {
      popupImage.src = "images/grafsteen.png";
    } else {
      popupImage.src = `images/wispie${wispie.id}${wispie.mood}.png`;
    }
  }

  function updateMainImage(index) {
    const wispie = wispieData[index];
    if (wispie.removed) {
      wispieElements[index].src = "images/grafsteen.png";
      wispieElements[index].style.opacity = 0.7;
    } else {
      wispieElements[index].src = `images/wispie${wispie.id}${wispie.mood}.png`;
      wispieElements[index].style.opacity = 1;
    }
  }

  function updateStatsUI() {
    const stats = wispieData[currentIndex].stats;
    hungerStat.textContent = stats.hunger;
    funStat.textContent = stats.fun;
    strengthStat.textContent = stats.strength;
  }

  // Mood update
  function updateMood(index) {
    const w = wispieData[index];
    if (w.removed) return;
    const s = w.stats;
    const lowStats = [s.hunger, s.fun, s.strength];
    const below40 = lowStats.filter(val => val < 40).length;
    const below50 = lowStats.filter(val => val < 50).length;

    if (below40 >= 2) w.mood = "verysad";
    else if (below50 >= 1) w.mood = "sad";
    else w.mood = "happy";

    updateWispieAnimation(index);
  }
  

  // Random stats afname en storm check
  function randomStatDecrease() {
    if (!isStormActive) {
      wispieData.forEach((wispie, index) => {
        if (wispie.removed) return;
        const stats = wispie.stats;
        if (Math.random() < 0.5) stats.hunger = Math.max(stats.hunger - 1, 0);
        if (Math.random() < 0.5) stats.fun = Math.max(stats.fun - 1, 0);
        if (Math.random() < 0.5) stats.strength = Math.max(stats.strength - 1, 0);
        updateMood(index);
        updateMainImage(index);
        if (index === currentIndex) {
          updateStatsUI();
          updatePopupImage(index);
        }
      });
    }

    checkForStorm();

    setTimeout(randomStatDecrease, Math.random() * 2000 + 500);
  }


  // Weather report
  function updateWeatherReport(status) {
    weatherReport.classList.remove("warning", "storm");

    if (status === "calm") {
      weatherReport.textContent = "Weather: calm";
    } else if (status === "warning") {
      weatherReport.textContent = "!Storm approaching!";
      weatherReport.classList.add("warning");
    } else if (status === "storm") {
      weatherReport.textContent = "🌩️ Storm in progress!";
      weatherReport.classList.add("storm");
    }
  }


  // Verwijder wispie als stats laag zijn 
  function removeOneWispieIfNeeded() {
    const candidates = wispieData.filter(w => !w.removed && (
      w.stats.hunger < 20 || w.stats.fun < 20 || w.stats.strength < 20
    ));

    if (candidates.length > 0) {
      const toRemove = candidates[Math.floor(Math.random() * candidates.length)];
      toRemove.removed = true;

      // Update afbeelding naar grafsteen
      const index = wispieData.indexOf(toRemove);
      updateMainImage(index);
      updateWispieAnimation(index);

      // Speel grafsteen geluid af als een wispie sterft
      grafsteenSound.currentTime = 0;
      grafsteenSound.play();

      // Als popup open is en deze wispie wordt verwijderd, sluit popup
      if (currentIndex === index) {
        popup.classList.add("hidden");
        overlay.classList.add("hidden");
      }

      return true;
    }
    return false;
  }

  //Storm-check 
  function checkForStorm() {
    const now = Date.now();

    const sadWispies = wispieData.filter(w => !w.removed && (w.mood === "sad" || w.mood === "verysad"));

    if (sadWispies.length >= 2 && !isStormActive) {
      updateWeatherReport("warning");
    } else if (!isStormActive) {
      updateWeatherReport("calm");
    }

    // Storm door verdrietige wispies & cooldown 
    if (sadWispies.length >= 3 && !isStormActive && (now - lastStormTime > 30000)) {
      lastStormTime = now;
      startStorm();
      return;
    }

    // Random storm — altijd toegestaan, zonder cooldown
    if (Math.random() < 0.01 && !isStormActive) {
      startStorm();
      return;
    }
  }

  function showStormMessagePopup(wispieRemoved) {
    stormMessagePopupRemoved.classList.remove("visible");
    stormMessagePopupSafe.classList.remove("visible");
    overlay.classList.remove("hidden");

    if (wispieRemoved) {
      stormMessagePopupRemoved.classList.add("visible");
    } else {
      stormMessagePopupSafe.classList.add("visible");
    }
  }

  // Storm
  function startStorm() {
    if (isStormActive) return;

    isStormActive = true;
    updateWeatherReport("storm");
    stormOverlay.classList.remove("hidden");

    // Stop achtergrondmuziek en start stormmuziek
    bgMusic.pause();
    stormMusic.currentTime = 0;
    stormMusic.volume = 0.3;
    stormMusic.play();

    wispieData.forEach((_, i) => updateWispieAnimation(i));

    // Storm duur
    const stormDuration = Math.random() * 5000 + 5000;

    setTimeout(() => {
      const wispieRemoved = removeOneWispieIfNeeded();

      updateWeatherReport("calm");
      stormOverlay.classList.add("hidden");
      isStormActive = false;

      wispieData.forEach((_, i) => updateWispieAnimation(i));

      showStormMessagePopup(wispieRemoved);

      // Stop stormmuziek en start achtergrondmuziek weer
      stormMusic.pause();
      bgMusic.currentTime = 0;
      bgMusic.volume = 0.3;
      bgMusic.play();

    }, stormDuration);
  }

  // Buttons
  feedBtn.addEventListener("click", () => {
    if (isStormActive) return;
    const s = wispieData[currentIndex].stats;
    s.hunger = Math.min(s.hunger + 10, 100);
    updateMood(currentIndex);
    updatePopupImage(currentIndex);
    updateMainImage(currentIndex);
    updateStatsUI();
  });

  playBtn.addEventListener("click", () => {
    if (isStormActive) return;
    const s = wispieData[currentIndex].stats;
    s.fun = Math.min(s.fun + 10, 100);
    updateMood(currentIndex);
    updatePopupImage(currentIndex);
    updateMainImage(currentIndex);
    updateStatsUI();
  });

  trainBtn.addEventListener("click", () => {
    if (isStormActive) return;
    const s = wispieData[currentIndex].stats;
    s.strength = Math.min(s.strength + 10, 100);
    updateMood(currentIndex);
    updatePopupImage(currentIndex);
    updateMainImage(currentIndex);
    updateStatsUI();
  });


  closePopupBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
    overlay.classList.add("hidden");
  });

  stormMessageCloseBtnRemoved.addEventListener("click", (event) => {
    event.stopPropagation();
    stormMessagePopupRemoved.classList.remove("visible");
    overlay.classList.add("hidden");
  });

  stormMessageCloseBtnSafe.addEventListener("click", (event) => {
    event.stopPropagation();
    stormMessagePopupSafe.classList.remove("visible");
    overlay.classList.add("hidden");
  });

  overlay.addEventListener("click", () => {
    stormMessagePopupRemoved.classList.remove("visible");
    stormMessagePopupSafe.classList.remove("visible");
    if (!popup.classList.contains("hidden")) return;
    overlay.classList.add("hidden");
  });

  startButton.addEventListener("click", () => {
    startScreen.style.display = "none";
    game.style.display = "block";

    //bg sound
    bgMusic.volume = 0.3;
    bgMusic.play();

  });

  randomStatDecrease();

  // Voeg event listener toe voor wispie clicks om geluid af te spelen (al gedaan in showPopup)
  wispieElements.forEach((el, i) => {
    el.addEventListener("click", () => showPopup(i));
  });
});
