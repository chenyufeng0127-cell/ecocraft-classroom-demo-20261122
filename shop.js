(()=>{
 const S=EcoShop,$=s=>document.querySelector(s),money=c=>'HK$'+(c/100).toFixed(0);
 const storageKey='ecocraft_demo_cart_r6';
 let cart=[],current=S.catalog[0],category='all',toastTimer;
 try{cart=S.restore(JSON.parse(sessionStorage.getItem(storageKey)||'[]'));}catch{}
 function toast(text){clearTimeout(toastTimer);const t=$('#shop-toast');(document.querySelector('dialog[open]')||document.body).append(t);t.textContent=text;t.classList.add('show');toastTimer=setTimeout(()=>t.classList.remove('show'),4000);}
 function blocked(button,off,reason){button.setAttribute('aria-disabled',String(off));button.dataset.reason=reason;}
 function save(){try{sessionStorage.setItem(storageKey,JSON.stringify(cart));}catch{}renderCart();}
 function attempt(fn){try{fn();}catch(e){toast(e.message);}}
 function product(id){return S.catalog.find(p=>p.id===id);}
 function openDialog(id){document.querySelectorAll('dialog[open]').forEach(d=>d.close());$('#'+id).showModal();}
 function renderCatalog(){
  const found=S.list({q:$('#search').value,category});
  $('#results-count').textContent=found.length+'款商品';
  $('#empty-results').hidden=found.length>0;
  $('#catalog-grid').innerHTML=found.map(p=>`<article class="product-card"><button class="photo-button" data-detail="${p.id}" aria-label="查看${p.name}"><img src="${p.image}" alt="${p.name}的AI概念图，尚未打样" width="1100" height="733" loading="lazy"></button><div class="product-info"><h3><button data-detail="${p.id}">${p.name}</button></h3><div class="card-bottom"><div><strong>${money(p.priceCents)}</strong><span>演示价</span></div><button class="compact-button" data-add="${p.id}" aria-label="加入购物车：${p.name}">加入购物车</button></div></div></article>`).join('');
  document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));
 }
 function add(id,q=1){attempt(()=>{cart=S.add(cart,id,q);save();toast('已加入演示购物车。');});}
 function detail(id){
  current=product(id);if(!current)return;
  const p=current;$('#detail-title').textContent=p.name;$('#detail-img').src=p.image;$('#detail-img').alt=p.name+'的AI概念图，尚未打样';$('#detail-material').textContent=p.material;$('#detail-use').textContent=p.use;$('#detail-price').textContent=money(p.priceCents);$('#detail-size').textContent=p.size+'（拟议）';$('#detail-raw').textContent=p.raw;$('#detail-care').textContent=p.check;$('#detail-qty').value=1;$('#detail-template').href='studio.html#product-'+p.id;
  openDialog('product-dialog');
 }
 function renderCart(){
  const sum=S.totals(cart);document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=sum.count);
  $('#cart-title').textContent='购物车'+(sum.count?'（'+sum.count+'件）':'');
  $('#cart-lines').innerHTML=cart.length?cart.map(l=>{const p=product(l.id);return `<li class="cart-line"><img src="${p.image}" alt="${p.name}的AI概念图"><div class="cart-line-info"><h3>${p.name}</h3><p>${money(p.priceCents)} <span>演示价／件</span></p><div class="line-actions"><div class="quantity"><button data-delta="-1" data-id="${p.id}" aria-label="减少${p.name}数量" aria-disabled="${l.qty<=1}" data-reason="最少选择1件；不需要时请点移除。">−</button><output aria-label="${p.name}数量">${l.qty}</output><button data-delta="1" data-id="${p.id}" aria-label="增加${p.name}数量" aria-disabled="${l.qty>=5}" data-reason="每款最多5件，只是演示限制，不代表库存。">+</button></div><button class="plain-button" data-remove="${p.id}">移除</button></div></div><strong>${money(p.priceCents*l.qty)}</strong></li>`}).join(''):'<li class="cart-empty"><span class="empty-symbol" aria-hidden="true">＋</span><h3>先选一件，试试它的新用途。</h3><p>四款二创小物，都可以加入演示购物车。</p><button class="button primary" data-close="cart-dialog">去逛商品</button></li>';
  $('#cart-summary').hidden=!cart.length;$('#cart-total').textContent=money(sum.total);blocked($('#to-checkout'),!cart.length,'请先选择商品加入购物车。');
 }
 function showCheckout(){
  if(!cart.length){toast('请先选择商品加入购物车。');return;}
  $('#checkout-items').innerHTML=cart.map(l=>`<li><span>${product(l.id).name} × ${l.qty}</span><strong>${money(product(l.id).priceCents*l.qty)}</strong></li>`).join('');
  $('#checkout-total').textContent=money(S.totals(cart).total);$('#demo-accept').checked=false;blocked($('#place-order'),true,'请先勾选确认：这是模拟交易，不会扣款。');openDialog('checkout-dialog');
 }
 function receipt(r){
  $('#receipt-id').textContent=r.id;$('#receipt-total').textContent=money(r.total);$('#receipt-items').innerHTML=r.items.map(l=>`<li><span>${l.name} × ${l.qty}</span><strong>${money(l.priceCents*l.qty)}</strong></li>`).join('');
  $('#receipt-dialog').dataset.orderId=r.id;openDialog('receipt-dialog');
 }
 document.addEventListener('click',e=>{
  const unavailable=e.target.closest('[aria-disabled="true"]');if(unavailable){e.preventDefault();toast(unavailable.dataset.reason||'请先完成上一步。');return;}
  const b=e.target.closest('button,a');if(!b)return;
  if(b.dataset.detail)detail(b.dataset.detail);
  if(b.dataset.add)add(b.dataset.add);
  if(b.hasAttribute('data-open-cart')){renderCart();openDialog('cart-dialog');}
  if(b.dataset.close)$('#'+b.dataset.close).close();
  if(b.dataset.category){category=b.dataset.category;renderCatalog();}
  if(b.dataset.remove){cart=S.remove(cart,b.dataset.remove);save();}
  if(b.dataset.delta)attempt(()=>{const l=cart.find(l=>l.id===b.dataset.id);cart=S.setQty(cart,l.id,l.qty+Number(b.dataset.delta));save();});
 });
 $('#detail-add').addEventListener('click',()=>add(current.id,Number($('#detail-qty').value)));
 $('#detail-buy').addEventListener('click',()=>attempt(()=>{cart=S.add(cart,current.id,Number($('#detail-qty').value));save();showCheckout();}));
 $('#search-form').addEventListener('submit',e=>{e.preventDefault();renderCatalog();});$('#search').addEventListener('input',renderCatalog);
 $('#reset-search').addEventListener('click',()=>{$('#search').value='';category='all';renderCatalog();$('#search').focus();});
 $('#to-checkout').addEventListener('click',showCheckout);$('#back-cart').addEventListener('click',()=>openDialog('cart-dialog'));
 $('#demo-accept').addEventListener('change',()=>blocked($('#place-order'),!$('#demo-accept').checked,'请先勾选确认：这是模拟交易，不会扣款。'));
 $('#checkout-form').addEventListener('submit',e=>{
  e.preventDefault();attempt(()=>{const r=S.checkout(cart,{pickup:'campus',demoAccepted:$('#demo-accept').checked});cart=[];save();receipt(r);});
 });
 document.querySelectorAll('dialog').forEach(d=>{let outside=false;d.addEventListener('pointerdown',e=>{outside=e.target===d;});d.addEventListener('click',e=>{if(outside&&e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}outside=false;});});
 renderCatalog();renderCart();
})();
