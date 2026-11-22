(function(root,factory){
 const data=typeof module==='object'&&module.exports?require('./products.js'):products;
 const api=factory(data);
 if(typeof module==='object'&&module.exports)module.exports=api;else root.EcoShop=api;
})(globalThis,function(data){
 const meta={T01:{priceCents:14800,category:'desktop'},T02:{priceCents:9800,category:'carry'},T03:{priceCents:6800,category:'desktop'},T04:{priceCents:12800,category:'carry'}};
 const catalog=data.map(p=>({...p,...meta[p.id],image:`assets/shop-${p.id}.webp`,demo:true,limit:5}));
 function item(id){const p=catalog.find(p=>p.id===id);if(!p)throw Error('没有这款商品，请重新选择。');return p;}
 function quantity(q){if(!Number.isInteger(q))throw Error('数量须为整数。');if(q<1||q>5)throw Error('每款演示数量为1至5件，不代表实际库存。');}
 function list({q='',category='all'}={}){q=q.trim().toLowerCase();return catalog.filter(p=>(category==='all'||p.category===category)&&(!q||[p.id,p.name,p.material,p.use].join(' ').toLowerCase().includes(q)));}
 function add(cart,id,q=1){item(id);quantity(q);const old=cart.find(l=>l.id===id),next=(old?.qty||0)+q;quantity(next);return old?cart.map(l=>l.id===id?{id,qty:next}:{...l}):[...cart.map(l=>({...l})),{id,qty:q}];}
 function setQty(cart,id,q){item(id);quantity(q);return cart.map(l=>l.id===id?{id,qty:q}:{...l});}
 function remove(cart,id){return cart.filter(l=>l.id!==id).map(l=>({...l}));}
 function restore(raw){if(!Array.isArray(raw))return [];let cart=[];for(const l of raw){if(!l||!catalog.some(p=>p.id===l.id)||!Number.isInteger(l.qty)||l.qty<1||l.qty>5)continue;try{cart=add(cart,l.id,l.qty);}catch{}}return cart;}
 function totals(cart){let count=0,subtotal=0;for(const l of cart){const p=item(l.id);quantity(l.qty);count+=l.qty;subtotal+=p.priceCents*l.qty;}return {count,subtotal,shipping:0,total:subtotal};}
 function checkout(cart,options={},stamp=Date.now()){
  if(!cart.length)throw Error('请先选择商品加入购物车。');
  if(!options.demoAccepted)throw Error('请先勾选确认：这是一笔模拟交易，不会扣款。');
  if(options.pickup!=='campus')throw Error('本次演示仅提供校内自取，不安排实际交收。');
  const sum=totals(cart);
  return {id:'DEMO-'+stamp,kind:'simulated_order',paid:false,submitted:false,pickup:'校内自取（演示）',items:cart.map(l=>({id:l.id,name:item(l.id).name,qty:l.qty,priceCents:item(l.id).priceCents})),...sum};
 }
 return {catalog,list,add,setQty,remove,restore,totals,checkout};
});
