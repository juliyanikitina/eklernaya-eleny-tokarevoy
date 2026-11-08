'use strict';

(() => {
  const toggle = document.querySelector('#music-toggle');
  const label = document.querySelector('#music-label');
  const volumeControl = document.querySelector('#music-volume-control');
  const volume = document.querySelector('#music-volume');
  const status = document.querySelector('#music-status');
  const audio = document.querySelector('#ambience-audio');
  let wanted = false;
  let pending = false;
  audio.volume = Number(volume.value) / 100;

  function render() {
    const playing = !audio.paused && !audio.ended;
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? 'Выключить музыку' : 'Включить музыку Франции');
    label.textContent = playing ? 'Музыка звучит' : 'Музыка Франции';
    volumeControl.hidden = !wanted;
  }

  async function start() {
    if (pending || !wanted || document.hidden) return;
    if (!audio.getAttribute('src')) audio.src = './assets/french-patisserie.mp3';
    pending = true;
    try {
      await audio.play();
      if (!wanted || document.hidden) audio.pause();
      status.textContent = wanted ? 'Играет инструментальный французский вальс' : 'Музыка выключена';
    } catch {
      wanted = false;
      status.textContent = 'Не удалось включить музыку. Нажмите, чтобы попробовать ещё раз.';
    } finally {
      pending = false;
      render();
    }
  }

  toggle.addEventListener('click', () => {
    wanted = !wanted;
    if (wanted) start();
    else {
      audio.pause();
      status.textContent = 'Музыка выключена';
      render();
    }
  });
  volume.addEventListener('input', () => { audio.volume = Number(volume.value) / 100; });
  audio.addEventListener('play', render);
  audio.addEventListener('pause', render);
  audio.addEventListener('error', () => {
    wanted = false;
    status.textContent = 'Музыка временно недоступна';
    audio.removeAttribute('src');
    render();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) audio.pause();
    else if (wanted) start();
  });
  window.addEventListener('pagehide', () => { audio.pause(); });
  render();
})();
