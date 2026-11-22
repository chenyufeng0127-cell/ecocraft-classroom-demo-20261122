let current=products[0],view='use',selected=[];
const $=s=>document.querySelector(s);
const tabs=$('.product-tabs');
tabs.innerHTML=products.map(p=>`<button class="product-tab" data-product="${p.id}" aria-pressed="false"><img src="${p.image}" alt="${p.name}的AI概念图，尚未打样"><span>${p.id} · ${p.priority}</span><b>${p.name}</b></button>`).join('');
function renderStory(){ $('#story-content').innerHTML=view==='use'?`<p>${current.use}</p>`:`<p><b>${current.material}</b>，经检查、整理与制作，成为${current.name}。正式销售须展示本批真实材料与成品记录。</p>`; document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',b.dataset.view===view)});}
function renderProduct(id){current=products.find(p=>p.id===id)||products[0];for(const [sel,value] of Object.entries({'#product-number':current.id,'#material':current.material,'#product-name':current.name,'#product-short':current.short,'#product-use':current.use,'#product-size':current.size,'#product-status':current.priority+' · 候选模板未启用','#price':current.price,'#price-note':current.priceNote,'#raw-title':current.material,'#raw-text':current.raw,'#after-title':current.name,'#after-text':current.use}))$(sel).textContent=value;
 const img=$('#product-image');img.src=current.image;img.alt=`AI生成概念：${current.name}，尚未打样`;
 $('#material-strip').innerHTML=`<div class="material-strip"><b>${current.material}</b><span>完整物品优先直接重用</span></div>`;
 $('#steps').innerHTML=current.process.map(s=>`<li>${s}</li>`).join('');
 document.querySelectorAll('[data-product]').forEach(b=>{const active=b.dataset.product===current.id;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active)});renderStory();}
tabs.addEventListener('click',e=>{const b=e.target.closest('[data-product]');if(b)renderProduct(b.dataset.product)});
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;renderStory()}));
function toast(text){$('.toast').textContent=text;$('.toast').classList.add('visible');setTimeout(()=>$('.toast').classList.remove('visible'),2600)}
$('#open-template').addEventListener('click',()=>{$('#template-title').textContent=current.id+' · '+current.name;$('#template-body').innerHTML=`<h3>用途与拟议尺寸</h3><p>${current.use} ${current.size}，尺寸未实测。</p><h3>材料条件</h3><p>${current.raw}</p><h3>新增辅料与工具</h3><p>${current.parts}</p><p>${current.tools}</p><h3>拟议工序</h3><ol>${current.process.map(s=>`<li>${s}</li>`).join('')}</ol><h3>打样检查</h3><p>${current.check}</p><h3>启用条件</h3><p>${current.gate} 所有图均为AI概念，不能据此认定结构已验证。</p>`;$('#template-dialog').showModal()});
for(const d of document.querySelectorAll('dialog')){d.querySelector('.dialog-close').addEventListener('click',()=>d.close());d.querySelector('.dialog-done')?.addEventListener('click',()=>d.close());}
function renderList(){$('#count').textContent=selected.length;$('#selection-list').innerHTML=selected.length?selected.map(id=>{const p=products.find(p=>p.id===id);return `<li><span>${p.id} · ${p.name}<br><small>${p.price} · 尚不可购买</small></span><button data-remove="${id}">移除</button></li>`}).join(''):'<li>尚未选择候选产品。</li>';setUnavailable($('#download-list'),!selected.length,'请先选择一款候选产品，再下载本地选择记录。');}
$('#select-product').addEventListener('click',()=>{if(!selected.includes(current.id)){selected.push(current.id);renderList();toast('已加入本地演示选择单，未提交订单。')}else toast('这款已在选择单中。')});
$('#open-list').addEventListener('click',()=>{renderList();$('#list-dialog').showModal()});
$('#selection-list').addEventListener('click',e=>{if(e.target.dataset.remove){selected=selected.filter(id=>id!==e.target.dataset.remove);renderList()}});
$('#clear-list').addEventListener('click',()=>{selected=[];renderList()});
$('#download-list').addEventListener('click',()=>{const data={type:'local_demo_selection_not_order',notice:'个人演示选择，不是实付、订单、销量或市场调查结果',products:selected.map(id=>{const p=products.find(p=>p.id===id);return {id,name:p.name,status:'概念未打样',priceStatus:p.price}})};const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='EcoCraft_本地演示选择_非订单.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)});
$('#match-form').addEventListener('submit',e=>{
 e.preventDefault(); const state=$('#condition').value,material=$('#fabric').value; let title,text,ids=[];
 if(state==='intact') {title='B类：优先直接重用';text='旧裤子、旧外套、收纳盒或可继续包装的纸盒，先核清洁、功能与公布清单，优先交换／捐赠；不为二创拆掉仍可原样使用的物品。';}
 else if(state==='unknown') {title='先待核，不匹配制作模板';text='污染须隔离；不把清洁能力不明的物品转给创客。未知材质、尺寸、结构与强度需人工核实，不能自动归C。';}
 else if(material==='storage') {title='破损塑料收纳盒：先待核';text='现有候选没有塑料箱改造模板。先检查材质、锐边与可靠接收去向；接收方确认相应塑料后才可归C，未确认前不开放相应接收。';}
 else if(material==='jacket') {title='旧外套：先确认还能否直接穿';text='若仍清洁完整、功能合格，优先B。若已不宜穿，须核面料、涂层与可用尺寸；不能因为是衣物就自动套用牛仔布或棉T恤模板。无匹配模板或可靠去向先待核。';}
 else if(material==='other') {title='材料信息不足，先核实';text='不能靠照片猜材质或临时编工艺。没有启用模板和可靠去向前，不开放相应接收。';}
 else {ids=material==='denim'?['T01','T02','T04']:material==='cotton'?['T03']:['T01'];title='A类候选材料：尚未批准制作';text=material==='cardboard'?'先看纸板能否继续包装；不能直接用时，才核T01的尺寸与强度，且需配齐布料和辅料。不匹配模板时，只有下游确认接收才归C；未确认则不开收。':'还需量可用尺寸、检查强度、清洁与辅料。以下仅供参考，候选模板目前均未启用，须实物打样与复做通过。';}
 $('#match-title').textContent=title;$('#match-text').textContent=text;$('#match-candidates').innerHTML=ids.map(id=>`<button class="candidate-chip" data-match-product="${id}">${id} ${products.find(p=>p.id===id).name}</button>`).join('');
});
$('#match-candidates').addEventListener('click',e=>{const id=e.target.dataset.matchProduct;if(id){renderProduct(id);$('#works').scrollIntoView({behavior:'smooth'})}});
$('#present').addEventListener('click',()=>{const on=document.body.classList.toggle('present');$('#present').setAttribute('aria-pressed',on);$('#present').textContent=on?'退出演示模式':'演示模式';toast(on?'演示模式已开启，可逐款切换讲解。':'已返回完整展厅。')});
const sections=[...document.querySelectorAll('section[id]')];const links=[...document.querySelectorAll('.progress a')];function updateNav(){let active='materials';for(const s of sections)if(s.getBoundingClientRect().top<innerHeight*.42)active=s.id;if(active==='home'||active==='why')active='materials';for(const a of links){const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')}}window.addEventListener('scroll',updateNav,{passive:true});
renderProduct('T01');renderList();updateNav();
