const works = [...products, ...campusProducts];
const findWork = id => works.find(work => work.id === id);
const isCampus = work => campusProducts.includes(work);
const workStatus = work => isCampus(work) ? '成品展示 · 模板待實測' : '候選構想 · 模板未啟用';
const $ = selector => document.querySelector(selector);
let current = products[0];
let selected = [];

for (const [group, items] of [['#daily-tabs', products], ['#campus-tabs', campusProducts]]) {
  $(group).innerHTML = items.map(work => `
    <button class="product-tab" type="button" data-product="${work.id}" aria-label="查看${work.name}" aria-pressed="false">
      <img src="${work.image}" alt="" loading="lazy" decoding="async">
    </button>`).join('');
  $(group).addEventListener('click', event => {
    const button = event.target.closest('[data-product]');
    if (button) showWork(button.dataset.product);
  });
}

function renderProduct(id) {
  current = findWork(id) || products[0];
  const campus = isCampus(current);
  const values = {
    '#product-number': (campus ? '校園系列' : '日常系列') + ' · ' + current.id,
    '#product-image-label': campus ? '成品展示' : 'AI 概念圖 · 尚未打樣',
    '#material': current.material,
    '#product-name': current.name,
    '#product-short': current.short,
    '#product-use': current.use,
    '#product-size': current.size,
    '#product-status': workStatus(current),
    '#price': current.price || '',
    '#price-note': current.priceNote || '',
    '#material-strip': current.material,
    '#raw-title': current.material,
    '#raw-text': current.raw,
    '#story-content': current.story
      ? current.story + '，製成' + current.name + '。'
      : current.material + '經檢查、整理與製作，成為' + current.name + '。',
  };
  for (const [selector, value] of Object.entries(values)) $(selector).textContent = value;
  const image = $('#product-image');
  image.src = current.image;
  image.alt = current.name + (campus ? '的成品圖' : '的 AI 概念圖');
  $('#product-details').classList.toggle('campus-details', campus);
  $('#product-full-image').hidden = !campus;
  $('#product-full-image').href = current.image;
  $('#price-block').hidden = campus;
  $('#steps').innerHTML = current.process.map(step => `<li>${step}</li>`).join('');
  document.querySelectorAll('[data-product]').forEach(button => {
    const active = !$('#product-details').hidden && button.dataset.product === current.id;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function showWork(id) {
  const details = $('#product-details');
  details.hidden = false;
  $('#transform').open = false;
  renderProduct(id);
  details.focus({ preventScroll: true });
  details.scrollIntoView();
}

$('#close-work').addEventListener('click', () => {
  const selectedCard = $(`[data-product="${current.id}"]`);
  selectedCard.classList.remove('active');
  selectedCard.setAttribute('aria-pressed', 'false');
  $('#product-details').hidden = true;
  if (location.hash.startsWith('#product-') || location.hash === '#transform') {
    const series = isCampus(current) ? '#campus-collection' : '#daily-collection';
    history.replaceState(history.state, '', series);
  }
  selectedCard.focus();
});

function openWorkFromLink() {
  if (location.hash === '#transform') {
    showWork(current.id);
    $('#transform').open = true;
    $('#transform').scrollIntoView();
  } else if (location.hash.startsWith('#product-')) {
    const work = findWork(location.hash.slice('#product-'.length));
    if (work) showWork(work.id);
  }
}

let toastTimer;
function toast(text) {
  const message = $('.toast');
  clearTimeout(toastTimer);
  message.textContent = text;
  message.classList.add('visible');
  toastTimer = setTimeout(() => message.classList.remove('visible'), 2600);
}

$('#open-template').addEventListener('click', () => {
  $('#template-title').textContent = current.id + ' · ' + current.name;
  $('#template-label').textContent = isCampus(current) ? '製作模板參考 · 待實測' : '候選製作模板 · 未啟用';
  $('#template-body').innerHTML = `
    <h3>用途與參考尺寸</h3><p>${current.use} ${current.size}。製作時按實物核對。</p>
    <h3>材料條件</h3><p>${current.raw}</p>
    <h3>輔料與工具</h3><p>${current.parts}</p><p>${current.tools}</p>
    <h3>製作步驟</h3><ol>${current.process.map(step => `<li>${step}</li>`).join('')}</ol>
    <h3>完工檢查</h3><p>${current.check}</p>
    <h3>規格確認</h3><p>${current.gate}</p>`;
  $('#template-dialog').showModal();
});

for (const dialog of document.querySelectorAll('dialog')) {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.dialog-done')?.addEventListener('click', () => dialog.close());
}

function renderList() {
  $('#count').textContent = selected.length;
  $('#selection-list').innerHTML = selected.length ? selected.map(id => {
    const work = findWork(id);
    return `<li><span>${id} · ${work.name}<br><small>${workStatus(work)}${work.price ? ' · ' + work.price : ''}</small></span><button data-remove="${id}">移除</button></li>`;
  }).join('') : '<li>尚未選擇作品。</li>';
  setUnavailable($('#download-list'), !selected.length, '請先選擇一款作品，再下載本地選擇記錄。');
}

$('#select-product').addEventListener('click', () => {
  if (selected.includes(current.id)) {
    toast('這款已在選擇單中。');
    return;
  }
  selected.push(current.id);
  renderList();
  toast('已加入本地演示選擇單。');
});
$('#open-list').addEventListener('click', () => {
  renderList();
  $('#list-dialog').showModal();
});
$('#selection-list').addEventListener('click', event => {
  const id = event.target.dataset.remove;
  if (id) {
    selected = selected.filter(item => item !== id);
    renderList();
  }
});
$('#clear-list').addEventListener('click', () => {
  selected = [];
  renderList();
});
$('#download-list').addEventListener('click', () => {
  const data = {
    type: 'local_demo_selection_not_order',
    notice: '个人演示选择，不是实付、订单、销量或市场调查结果',
    products: selected.map(id => {
      const work = findWork(id);
      return { id, name: work.name, status: workStatus(work), priceStatus: work.price || '成品展示' };
    }),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'EcoCraft_本地演示选择_非订单.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

$('#match-form').addEventListener('submit',e=>{
 e.preventDefault(); const state=$('#condition').value,material=$('#fabric').value; let title,text,ids=[];
 if(state==='intact') {title='B类：优先直接重用';text='旧裤子、旧外套、收纳盒或可继续包装的纸盒，先核清洁、功能与公布清单，优先交换／捐赠；不为二创拆掉仍可原样使用的物品。';}
 else if(state==='unknown') {title='先待核，不匹配制作模板';text='污染须隔离；不把清洁能力不明的物品转给创客。未知材质、尺寸、结构与强度需人工核实，不能自动归C。';}
 else if(material==='storage') {title='破损塑料收纳盒：先待核';text='可參考校園系列的中庭硬筆盒；實際處理前先確認材質、銳邊及工作坊接收條件；接收方确认相应塑料后才可归C，未确认前不开放相应接收。';}
 else if(material==='jacket') {title='旧外套：先确认还能否直接穿';text='若仍清洁完整、功能合格，优先B。若已不宜穿，须核面料、涂层与可用尺寸；不能因为是衣物就自动套用牛仔布或棉T恤模板。无匹配模板或可靠去向先待核。';}
 else if(material==='other') {title='材料信息不足，先核实';text='不能靠照片猜材质或临时编工艺。没有启用模板和可靠去向前，不开放相应接收。';}
 else {ids=material==='denim'?['T01','T02','T04']:material==='cotton'?['T03']:['T01'];title='A类候选材料：尚未批准制作';text=material==='cardboard'?'先看纸板能否继续包装；不能直接用时，才核T01的尺寸与强度，且需配齐布料和辅料。不匹配模板时，只有下游确认接收才归C；未确认则不开收。':'还需量可用尺寸、检查强度、清洁与辅料。以下仅供参考，候选模板目前均未启用，须实物打样与复做通过。';}
 $('#match-title').textContent=title;$('#match-text').textContent=text;$('#match-candidates').innerHTML=ids.map(id=>`<button class="candidate-chip" data-match-product="${id}">${id} ${products.find(p=>p.id===id).name}</button>`).join('');
});
$('#match-candidates').addEventListener('click',e=>{const id=e.target.dataset.matchProduct;if(id)showWork(id)});
$('#present').addEventListener('click',()=>{const on=document.body.classList.toggle('present');$('#present').setAttribute('aria-pressed',on);$('#present').textContent=on?'退出演示模式':'演示模式';toast(on?'演示模式已开启，可逐款切换讲解。':'已返回完整展厅。')});
const sections=[...document.querySelectorAll('section[id]')];const links=[...document.querySelectorAll('.progress a')];function updateNav(){let active='materials';for(const s of sections)if(s.getBoundingClientRect().top<innerHeight*.42)active=s.id;if(active==='home')active='materials';for(const a of links){const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')}}window.addEventListener('scroll',updateNav,{passive:true});
renderProduct('T01');
renderList();
updateNav();
openWorkFromLink();
window.addEventListener('hashchange', openWorkFromLink);
