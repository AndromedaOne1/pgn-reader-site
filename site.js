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
const hints = ['1. e4 — первый шаг к борьбе за центр.','1… e5 — чёрные отвечают симметрично.','2. Nf3 — конь выходит к центру.','2… Nc6 — защита пешки и развитие фигуры.','Слон смотрит на f7. Нажмите на ход, чтобы вернуться назад.'];
const arrows = ['M450 650L450 450','M450 150L450 350','M650 750L550 550','M150 50L250 250','M250 450L550 150'];
function render(index) {
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
  grid.replaceChildren(fragment);
  buttons.forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-pressed',String(i===index));});
  status.textContent=hints[index];arrow.setAttribute('d',arrows[index]);
}
if(grid){buttons.forEach(b=>b.addEventListener('click',()=>render(Number(b.dataset.position))));render(4);}
