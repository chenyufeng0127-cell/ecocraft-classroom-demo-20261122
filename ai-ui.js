(()=>{
 const el=id=>document.getElementById(id);
 const scenarios={
  jeans:{title:'破膝旧牛仔裤',image:'assets/AI_JEANS.png',summary:'外观疑似牛仔布；左侧膝部有可见破洞。背面、纤维成分、强度和可用裁片尺寸仍需补充。',source:'预置观察，不是实时识别；标框由本演示预先设置。',hole:true,fill:{fabric:'denim',basis:'manual',width:25,height:18,panels:2,wearable:'no',clean:true,cardboard:false}},
  jacket:{title:'完好旧外套',image:'assets/AI_JACKET.png',summary:'图中未见明显破洞，拉链与轮廓看起来完整；能否继续穿、清洁和功能仍由人确认。',source:'预置观察；“未见明显破损”不等于检查了所有隐藏部位。',hole:false,fill:{fabric:'unknown',basis:'unknown',width:'',height:'',panels:1,wearable:'yes',clean:true,cardboard:false}},
  textile: {
   title: '重度破損舊外套',
   image: 'assets/c-damaged-jacket.webp',
   summary: '袖口、肩膀和前襟都有大面積破洞，這件外套已無法再穿。案例設定亦確認布面不足以用於現有二創模板。',
   source: 'C 級回收情境。交收前由人員核對纖維、潔淨程度及紡織回收方的接收條件。',
   destination: {
    heading: 'C 級 · 材料回收',
    preparation: '已無法重用或二創的衣物，可依物料種類核對對應的回收渠道。',
    title: 'C 級去向：紡織原料回收',
    text: '確認回收方接收這類織物及其狀態後，按對方要求交收。'
   }
  }
 };
 let scene='jeans',observed=false,result=null,chosen=null;
 const labels={observation:'先查看预置观察',clean:'核对清洁状态',wearable:'确认能否继续原样使用',material:'补面料类别与信息依据',dimensions:'补连续可用布面长宽及片数'};
 function snapshot(){return {observed,fabric:el('ai-fabric').value,basis:el('ai-basis').value,width:el('ai-width').value,height:el('ai-height').value,panels:el('ai-panels').value,wearable:el('ai-wearable').value,clean:el('ai-clean').checked,cardboard:el('ai-cardboard').checked};}
 function clearReview(){el('ai-review').hidden=true;el('ai-review-message').textContent='';el('ai-review-form').reset();setUnavailable(el('ai-review-pass'),true,'请先勾选三项人工检查，再记录模拟通过。');}
 function invalidate(){result=null;chosen=null;clearReview();el('ai-template-grid').innerHTML='';el('ai-route-title').textContent='资料已修改，请重新匹配';el('ai-route-text').textContent='修改材料、尺寸或使用状态后，旧匹配与复核记录已清空。';el('ai-missing').innerHTML='';setUnavailable(el('ai-request-review'),true,'请先补资料并完成匹配，选择条件通过的候选；完好物品可按B类复核。');el('ai-request-info').hidden=true;el('ai-step-state').textContent=observed?'补充资料后查看分流与匹配':'先查看预置观察';}
 function setScene(id){
  scene = id;
  observed = false;
  const scenario = scenarios[id];
  const destination = scenario.destination;
  el('ai-form').reset();
  el('ai-observation').hidden = true;
  el('ai-hole').hidden = true;
  el('ai-mark').checked = false;
  setUnavailable(el('ai-mark'), true, '先查看預置觀察。破膝牛仔褲示例提供破損標框。');
  el('ai-photo').src = scenario.image;
  el('ai-photo').alt = scenario.title + '的預置示意圖';
  el('ai-scene-title').textContent = scenario.title;
  el('ai-fill-note').textContent = '洗標與測量尚待補充。';
  el('ai-form').hidden = Boolean(destination);
  el('ai-flow-guide').hidden = Boolean(destination);
  el('ai-review-entry').hidden = Boolean(destination);
  el('ai-photo-controls').hidden = Boolean(destination);
  el('ai-material-route').hidden = !destination;
  el('ai-show-destination').disabled = true;
  document.querySelectorAll('[data-ai-scene]').forEach(button => {
   const active = button.dataset.aiScene === id;
   button.classList.toggle('active', active);
   button.setAttribute('aria-pressed', String(active));
  });
  invalidate();
  el('ai-route-title').textContent = destination ? destination.heading : '等待查看示例与补充资料';
  el('ai-route-text').textContent = destination ? destination.preparation : '当前为预置课堂情形；没有模型调用或图片上传。';
  if (destination) {
   el('ai-material-route-heading').textContent = destination.heading;
   el('ai-material-route-detail').textContent = destination.preparation;
  }
 }

 function updateReviewButton(){const eligible=result&&(result.route==='B'||result.matches.some(t=>t.id===chosen&&t.fit));setUnavailable(el('ai-request-review'),!eligible,'请先匹配并选择条件通过的模板；未匹配时不能进入人工确认。');}
 function renderResult(){
  result=EcoAI.evaluate(snapshot());chosen=null;clearReview();el('ai-template-grid').innerHTML='';el('ai-missing').innerHTML='';
  if(result.route==='hold'){el('ai-route-title').textContent='先补资料，暂不推荐制作';el('ai-route-text').textContent='条件不足时停止匹配；不会把未知项补成一个看似完整的方案。';el('ai-missing').innerHTML=result.missing.map(k=>`<li>${labels[k]}</li>`).join('');el('ai-request-info').hidden=false;el('ai-step-state').textContent='信息不足，停在补充资料';}
  else if(result.route==='B'){el('ai-route-title').textContent='B类建议：优先直接重用';el('ai-route-text').textContent='根据你确认的清洁与可继续使用状态，先检查交换／捐赠安排；不为了二创剪坏好物。';el('ai-request-info').hidden=true;el('ai-step-state').textContent='直接重用，交创客／运营复核';}
  else {el('ai-route-title').textContent=result.matches.some(t=>t.fit)?'A类候选：有条件匹配，尚未批准制作':'A类材料候选：现有条件没有匹配通过';el('ai-route-text').textContent='以下裁片数字仅是演示规则，尚非正式打样规格。当前所有模板未启用；条件通过也不等于能直接生产。';el('ai-request-info').hidden=true;el('ai-step-state').textContent='比较模板条件，再模拟人工复核';
   el('ai-template-grid').innerHTML=result.matches.map(t=>{const p=products.find(p=>p.id===t.id);return `<article class="ai-template ${t.fit?'fits':'does-not-fit'}"><div class="ai-template-top"><img src="${p.image}" alt="${p.name}的AI概念图"><div><span class="ai-fit-tag">${t.fit?'演示条件通过':'尚不符合／缺项'}</span><h4>${t.id} ${p.name}</h4></div></div><p class="small">模板状态：未启用 · 不允许真实生产</p>${t.fit?`<label class="ai-radio"><input type="radio" name="ai-template" value="${t.id}">选择这款继续演示复核</label>`:`<button type="button" class="ai-ineligible" aria-disabled="true" data-tip="材料或裁片条件不符；请补资料或选择条件通过的模板。">暂不可选：材料条件不足</button>`}<details class="ai-disclosure"><summary>匹配条件与判断依据</summary><p>${t.requirement}</p><p>${t.reason}</p></details></article>`}).join('');
  }updateReviewButton();el('ai-route-title').scrollIntoView({behavior:'smooth',block:'start'});
 }
 document.querySelectorAll('[data-ai-scene]').forEach(b=>b.addEventListener('click',()=>setScene(b.dataset.aiScene)));
 el('ai-reset').addEventListener('click',()=>setScene(scene));
 el('ai-observe').addEventListener('click',()=>{
  observed=true;
  const observation=el('ai-observation');
  observation.hidden=false;
  el('ai-observation-text').textContent=scenarios[scene].summary;
  el('ai-observation-source').textContent=scenarios[scene].source;
  const scenario = scenarios[scene];
  if (scenario.destination) {
   el('ai-show-destination').disabled = false;
   el('ai-step-state').textContent = '查看物料去向';
  } else {
   setUnavailable(el('ai-mark'), !scenario.hole, '破膝牛仔褲示例提供破損標框。');
   el('ai-mark').checked = scenario.hole;
   el('ai-hole').hidden = !scenario.hole;
   invalidate();
  }
  observation.scrollIntoView({block:'nearest'});
 });
 el('ai-show-destination').addEventListener('click', () => {
  const destination = scenarios[scene].destination;
  if (!observed || !destination) return;
  el('ai-route-title').textContent = destination.title;
  el('ai-route-text').textContent = destination.text;
  el('ai-step-state').textContent = '已顯示物料去向';
  el('ai-route-title').scrollIntoView({block:'start'});
 });
 el('ai-mark').addEventListener('change',()=>{el('ai-hole').hidden=!el('ai-mark').checked});
 el('ai-fill').addEventListener('click',()=>{const p=scenarios[scene].fill;if(!p)return;for(const id of ['fabric','basis','width','height','panels','wearable'])el('ai-'+id).value=p[id];for(const id of ['clean','cardboard'])el('ai-'+id).checked=p[id];el('ai-fill-note').textContent=scene==='jeans'?'预置补充：人工按牛仔类登记；两片连续可用布面各25×18cm。不是本图AI测量，也不是实物核验。':'预置补充：模拟确认清洁且功能完整、可继续穿；不需要凭外观猜纤维比例。';invalidate();});
 el('ai-form').addEventListener('input',invalidate);el('ai-form').addEventListener('change',invalidate);el('ai-form').addEventListener('submit',e=>{e.preventDefault();renderResult()});
 el('ai-template-grid').addEventListener('change',e=>{if(e.target.name==='ai-template'){if(e.target.getAttribute('aria-disabled')==='true'){e.target.checked=false;updateReviewButton();return;}chosen=e.target.value;clearReview();updateReviewButton()}});
 el('ai-request-info').addEventListener('click',()=>{el('ai-route-text').textContent='已展示补充清单（本地演示，未向任何人发送）。需要清楚的洗标、可用布面测量与使用状态，资料补全后再匹配。';});
 el('ai-request-review').addEventListener('click',()=>{updateReviewButton();if(el('ai-request-review').getAttribute('aria-disabled')==='true')return;clearReview();el('ai-review').hidden=false;el('ai-review-target').textContent=result.route==='B'?'模拟复核：B类直接重用安排':`模拟复核：${chosen}候选模板`;el('ai-step-state').textContent='人工复核演示，不是实物审核';el('ai-review').scrollIntoView({behavior:'smooth',block:'start'});});
 el('ai-review-form').addEventListener('change',()=>{setUnavailable(el('ai-review-pass'),[...el('ai-review-form').querySelectorAll('input[type="checkbox"]')].some(i=>!i.checked),'请先完成三项人工检查。')});
 function recordReview(outcome){const checks=[...el('ai-review-form').querySelectorAll('input[type="checkbox"]')].map(i=>i.checked);const r=EcoAI.review(snapshot(),chosen,checks,outcome);el('ai-review-message').textContent=r.status==='returned'?'已记录“退回补资料”（演示）。没有提交任务或改变真实物料状态。':r.status==='recorded_demo'?(r.route==='B'?'模拟复核已记录：可继续核实直接重用安排。并未实际交付或确认接收。':'模拟复核已记录；该模板仍未打样启用，下一步是验证，不是直接生产。'):'条件不足，不能记录复核通过。';el('ai-step-state').textContent=r.status==='recorded_demo'?'流程演示结束 · 无真实生产批准':'人工要求补资料（演示）';}
 el('ai-review-pass').addEventListener('click',()=>recordReview('pass'));el('ai-review-return').addEventListener('click',()=>recordReview('return'));
 setScene('jeans');
})();
