import { SECTIONS, createGame, draw, undo, remaining, lookup, restore } from './game.js';

const KEY = 'telestrations.game.v1';
const app = document.querySelector('#app'), modal = document.querySelector('#modal');
const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
let state = createGame(), revealed = false, toastTimer;
try { const saved = localStorage.getItem(KEY); if (saved) state = restore(saved); } catch { state = createGame(); }

function toast(msg) {
  const t = document.querySelector('#toast'); t.textContent = msg; t.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('visible'), 3500);
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { toast('자동 저장이 안 되고 있어요. 창을 닫지 마세요.'); } }
function commit(next) { state = next; save(); render(); }

function render() {
  const left = remaining(state).length;
  app.innerHTML = `<div class="shell">
    <header><div><h1>🎨 텔레스트레이션 단어 카드</h1><p class="sub">섹션을 고르면 단어가 한 개 나와요. 나온 단어는 다시 안 나옵니다.</p></div>
    <div class="total">${left} / 60<small>남은 단어</small></div></header>
    <section class="grid" aria-label="섹션 선택">${SECTIONS.map((s, i) => {
      const n = remaining(state, i).length;
      return `<button class="topic c${i}" data-action="draw" data-section="${i}" ${n ? '' : 'disabled'} aria-label="${esc(s.name)}, 남은 단어 ${n}개">
        <div class="top"><span class="icon" aria-hidden="true">${s.icon}</span><span class="count">${n ? `남은 ${n}개` : '모두 나왔어요'}</span></div>
        <h2>${esc(s.name)}</h2><div class="dots" aria-hidden="true">${Array.from({ length: 10 }, (_, k) => `<i class="${k < n ? 'on' : ''}"></i>`).join('')}</div></button>`;
    }).join('')}</section>
    <section class="random"><div><strong>🎲 올랜덤</strong><span>모든 섹션에서 아무거나 한 개!</span></div>
      <button class="primary" data-action="random" ${left ? '' : 'disabled'}>${left ? '아무거나 뽑기' : '모두 나왔어요'}</button></section>
    <footer><span>이 브라우저에 자동 저장됩니다</span><div>
      <button class="quiet" data-action="history">나온 단어 ${state.draws.length}개 보기</button>
      ${state.draws.length ? '<button class="quiet" data-action="undo">마지막 뽑기 취소</button>' : ''}
      <button class="quiet" data-action="reset">새 게임</button></div></footer></div>`;
}

function open(html) { if (modal.open) modal.close(); modal.innerHTML = html; modal.showModal(); }
function showCard() {
  const w = lookup(state.current);
  open(`<div class="dlg"><h2 id="modal-title">${w.icon} ${esc(w.sectionName)}</h2>
    <button class="flip c${w.section}" data-action="flip" aria-live="polite">${revealed
      ? `<span class="big">${esc(w.word)}</span><span class="hint">그림으로만 설명해요! (말·글자 금지)</span>`
      : `<span class="big">🙈</span><span class="hint">그리는 친구만 탭해서 단어를 확인하세요</span>`}</button>
    <div class="row">${revealed ? '<button class="secondary" data-action="flip">다시 가리기</button>' : ''}
      <button class="primary" data-action="done">다 봤어요</button></div></div>`);
}
function doDraw(section) {
  try { revealed = false; commit(draw(state, section)); showCard(); } catch (e) { toast(e.message); }
}
function historyDialog() {
  const used = new Set(state.draws);
  open(`<div class="dlg"><h2 id="modal-title">나온 단어 ${used.size} / 60</h2><div class="hist">${SECTIONS.map((s, i) => {
    const words = s.words.filter((_, j) => used.has(`${i}:${j}`));
    return `<section class="c${i}"><h3>${s.icon} ${esc(s.name)} (${words.length}/10)</h3>${words.length ? words.map(w => `<span>${esc(w)}</span>`).join('') : '<small>아직 없어요</small>'}</section>`;
  }).join('')}</div><div class="row"><button class="primary" data-action="close">닫기</button></div></div>`);
}
function confirmDialog(kind) {
  const undoing = kind === 'undo';
  open(`<div class="dlg"><h2 id="modal-title">${undoing ? '마지막 뽑기를 취소할까요?' : '새 게임을 시작할까요?'}</h2>
    <p>${undoing ? '마지막에 나온 단어가 다시 뽑기 목록에 들어가요.' : '나온 단어 기록을 모두 지우고 60개를 되돌려요.'}</p>
    <div class="row"><button class="secondary" data-action="close">돌아가기</button><button class="primary" data-action="confirm-${kind}">${undoing ? '취소하기' : '새 게임'}</button></div></div>`);
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-action]'); if (!b || b.disabled) return;
  const a = b.dataset.action;
  if (a === 'draw') doDraw(Number(b.dataset.section));
  else if (a === 'random') doDraw(null);
  else if (a === 'flip') { revealed = !revealed; showCard(); }
  else if (a === 'done') { revealed = false; modal.close(); }
  else if (a === 'close') modal.close();
  else if (a === 'history') historyDialog();
  else if (a === 'undo' || a === 'reset') confirmDialog(a);
  else if (a === 'confirm-undo') { commit(undo(state)); modal.close(); toast('마지막 뽑기를 취소했어요.'); }
  else if (a === 'confirm-reset') { commit(createGame()); modal.close(); }
});
modal.addEventListener('close', () => { revealed = false; });
render();
