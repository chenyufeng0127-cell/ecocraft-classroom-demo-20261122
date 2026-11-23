// Shared by the collection grid, the product detail and the full-size material card.
function campusPlate(work, thumbnail = false) {
  const lines = work.sourceUses.map(line => `<small>${line}</small>`).join('');
  return `<span class="campus-plate" lang="zh-Hant">
    <img src="${work.image}" width="1536" height="1024" alt="${work.name}的原料與成品對照" decoding="async" ${thumbnail ? 'loading="lazy"' : ''}>
    <span class="campus-caption">
      <strong>${work.id} ${work.name}</strong>
      <em>可選回收來源</em>${lines}
    </span>
  </span>`;
}
