'use strict';
// This small, fixed-position preview belongs to the website; it doesn't load application code or process user PGNs.
const positions = [
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR',
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR',
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R',
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R',
  'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R'
];
const names = {p:'пешка',n:'конь',b:'слон',r:'ладья',q:'ферзь',k:'король'};
const grid = document.querySelector('#board-grid');
const buttons = [...document.querySelectorAll('[data-position]')];
const status = document.querySelector('#demo-status');
const arrow = document.querySelector('#demo-arrow');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let boardTransition = null;
const hints = ['1. e4 — первый шаг к борьбе за центр.','1… e5 — чёрные отвечают симметрично.','2. Nf3 — конь выходит к центру.','2… Nc6 — защита пешки и развитие фигуры.','Слон смотрит на f7. Нажмите на ход, чтобы вернуться назад.'];
const arrows = ['M450 650L450 450','M450 150L450 350','M650 750L550 550','M150 50L250 250','M250 450L550 150'];
function render(index, animate = true) {
  const fragment = document.createDocumentFragment();
  const squares = positions[index].split('/').flatMap(row => [...row].flatMap(char => /[1-8]/.test(char) ? Array(Number(char)).fill(null) : [char]));
  squares.forEach((piece,i) => {
    const row = Math.floor(i/8), file = i%8, square = document.createElement('div');
    square.className = 'square'+((row+file)%2?' dark':'');
    if(piece) {
      const img=document.createElement('img');
      img.className='piece';img.src='assets/pieces/'+(piece===piece.toUpperCase()?'w':'b')+piece.toUpperCase()+'.svg';
      img.alt=(piece===piece.toUpperCase()?'Белые: ':'Чёрные: ')+names[piece.toLowerCase()];img.width=60;img.height=60;
      square.append(img);
    }
    if(file===0){const label=document.createElement('span');label.className='coord';label.textContent=8-row;square.append(label);}
    if(row===7){const label=document.createElement('span');label.className='coord file';label.textContent=String.fromCharCode(97+file);square.append(label);}
    fragment.append(square);
  });
  boardTransition?.cancel();
  grid.replaceChildren(fragment);
  if (animate && !reducedMotion.matches && grid.animate) boardTransition = grid.animate(
    [{ opacity: .55, transform: 'scale(.985)' }, { opacity: 1, transform: 'scale(1)' }],
    { duration: 220, easing: 'cubic-bezier(.2,.75,.25,1)' });
  buttons.forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-pressed',String(i===index));});
  status.textContent=hints[index];arrow.setAttribute('d',arrows[index]);
}
if(grid){buttons.forEach(b=>b.addEventListener('click',()=>render(Number(b.dataset.position))));render(4, false);}


// Keep the gallery usable with pointer, keyboard and reduced-motion preferences.
const galleryTabs = [...document.querySelectorAll('.gallery-tab')];
const galleryPanels = galleryTabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
const galleryCaption = document.querySelector('#gallery-caption');
const galleryCaptions = [
  'Доска, ходы и линии анализа — всё перед глазами.',
  'Подсветите поле. Покажите идею. Продолжайте разбор.',
  'Комментарии и оценки помогают сохранить ход мысли.'
];
let galleryTransition = null;
function selectGallery(index, focus = false) {
  galleryTransition?.cancel();
  galleryTabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    galleryPanels[i].hidden = !selected;
  });
  galleryCaption.textContent = galleryCaptions[index];
  if (focus) galleryTabs[index].focus();
  const panel = galleryPanels[index];
  if (!reducedMotion.matches && panel.animate) galleryTransition = panel.animate([
    { opacity: .15, transform: 'translateY(12px) scale(.99)' },
    { opacity: 1, transform: 'translateY(0) scale(1)' }
  ], { duration: 380, easing: 'cubic-bezier(.2,.75,.25,1)' });
}
galleryTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    if (tab.getAttribute('aria-selected') !== 'true') selectGallery(index);
  });
  tab.addEventListener('keydown', event => {
    const targets = { ArrowRight: (index + 1) % galleryTabs.length,
      ArrowLeft: (index + galleryTabs.length - 1) % galleryTabs.length, Home: 0, End: galleryTabs.length - 1 };
    if (Object.prototype.hasOwnProperty.call(targets, event.key)) {
      event.preventDefault(); selectGallery(targets[event.key], true);
    }
  });
});

// Animate height rather than abruptly removing the answer. Rapid clicks reverse
// from the current height; the final native <details> state always stays correct.
const faqControllers = [];
for (const details of document.querySelectorAll('.faq-list details')) {
  const summary = details.querySelector('summary');
  let expanded = details.open;
  let transition = null;
  const finish = () => {
    details.open = expanded;
    transition?.cancel(); transition = null;
    details.style.overflow = '';
  };
  summary.addEventListener('click', event => {
    event.preventDefault();
    const startHeight = details.getBoundingClientRect().height;
    expanded = !expanded;
    transition?.cancel(); transition = null;
    if (reducedMotion.matches || !details.animate) { finish(); return; }
    details.open = true;
    const endHeight = expanded ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + 1;
    details.style.overflow = 'hidden';
    const animation = details.animate([{ height: startHeight + 'px' }, { height: endHeight + 'px' }],
      { duration: expanded ? 340 : 240, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'both' });
    transition = animation;
    animation.onfinish = () => { if (transition === animation) finish(); };
  });
  faqControllers.push(finish);
}

// Subtle one-time entrance for content below the fold. Without JavaScript or
// IntersectionObserver the complete page remains visible.
const revealTargets = document.querySelectorAll('.feature, .inside-heading, .details-copy, .detail-image, .faq > div:first-child');
let revealObserver = null;
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .08 });
  revealTargets.forEach((target, index) => {
    target.classList.add('reveal');
    target.style.setProperty('--reveal-delay', (target.classList.contains('feature') ? index % 3 * 65 : 0) + 'ms');
    revealObserver.observe(target);
  });
}
function motionPreferenceChanged() {
  if (!reducedMotion.matches) return;
  boardTransition?.cancel(); galleryTransition?.cancel();
  faqControllers.forEach(finish => finish());
  revealObserver?.disconnect();
  revealTargets.forEach(target => target.classList.add('is-visible'));
}
if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', motionPreferenceChanged);
else if (reducedMotion.addListener) reducedMotion.addListener(motionPreferenceChanged);
