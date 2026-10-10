export const SECTIONS = [
  { name: '동물', icon: '🦒', words: ['코끼리', '기린', '펭귄', '캥거루', '거북이', '다람쥐', '공룡', '문어', '고슴도치', '플라밍고'] },
  { name: '음식', icon: '🍕', words: ['피자', '아이스크림', '수박', '떡볶이', '팝콘', '붕어빵', '도넛', '라면', '김밥', '솜사탕'] },
  { name: '사물과 장소', icon: '🎈', words: ['우산', '자전거', '냉장고', '풍선', '망원경', '무지개', '화산', '등대', '놀이공원', '열기구'] },
  { name: '속담', icon: '📜', words: ['누워서 떡 먹기', '우물 안 개구리', '하늘의 별 따기', '소 잃고 외양간 고친다', '원숭이도 나무에서 떨어진다', '등잔 밑이 어둡다', '백지장도 맞들면 낫다', '티끌 모아 태산', '낮말은 새가 듣고 밤말은 쥐가 듣는다', '호랑이도 제 말 하면 온다'] },
  { name: '연예인과 스포츠 스타', icon: '🎤', words: ['아이유', '유재석', '손흥민', '김연아', '방탄소년단', '블랙핑크', '지드래곤', '에스파', '아이브', '뉴진스'] },
  { name: '캐릭터', icon: '🎮', words: ['뽀로로', '핑크퐁 아기상어', '피카츄', '슈퍼마리오', '스폰지밥', '마인크래프트 크리퍼', '도라에몽', '미니언즈', '짱구', '헬로키티'] },
];

export function createGame() { return { version: 1, draws: [], current: null }; }
export function wordId(section, index) { return `${section}:${index}`; }
export function remaining(state, section = null) {
  const used = new Set(state.draws);
  const list = [];
  SECTIONS.forEach((s, si) => s.words.forEach((word, wi) => {
    if (!used.has(wordId(si, wi)) && (section === null || section === si)) list.push({ id: wordId(si, wi), section: si, word });
  }));
  return list;
}
export function randomIndex(max) {
  if (!Number.isInteger(max) || max < 1) throw new Error('뽑을 단어가 없어요.');
  const buffer = new Uint32Array(1), limit = Math.floor(0x100000000 / max) * max;
  do { globalThis.crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
  return buffer[0] % max;
}
export function draw(state, section = null, pick = randomIndex) {
  if (section !== null && (!Number.isInteger(section) || section < 0 || section >= SECTIONS.length)) throw new Error('올바른 섹션을 선택해 주세요.');
  const pool = remaining(state, section);
  if (!pool.length) throw new Error(section === null ? '모든 단어가 나왔어요.' : '이 섹션의 단어는 모두 나왔어요.');
  const index = pick(pool.length);
  if (!Number.isInteger(index) || index < 0 || index >= pool.length) throw new Error('추첨에 실패했어요.');
  const id = pool[index].id;
  return { ...state, draws: [...state.draws, id], current: id };
}
export function undo(state) { return { ...state, draws: state.draws.slice(0, -1), current: null }; }
export function lookup(id) {
  const [s, w] = String(id).split(':').map(Number);
  const section = SECTIONS[s];
  if (!section || !section.words[w]) return null;
  return { section: s, sectionName: section.name, icon: section.icon, word: section.words[w] };
}
export function restore(raw) {
  const saved = JSON.parse(raw);
  if (saved.version !== 1 || !Array.isArray(saved.draws)) throw new Error('저장된 게임 형식을 확인할 수 없어요.');
  const seen = new Set();
  for (const id of saved.draws) {
    if (!lookup(id) || seen.has(id)) throw new Error('추첨 기록이 올바르지 않아요.');
    seen.add(id);
  }
  if (saved.current !== null && saved.current !== saved.draws.at(-1)) throw new Error('현재 단어 기록이 올바르지 않아요.');
  return { version: 1, draws: [...saved.draws], current: saved.current };
}
