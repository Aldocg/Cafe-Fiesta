// --- Supabase ---
const supa = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON);

// --- UI helpers ---
function toast(msg){
  const w = document.createElement('div'); w.className='toast-wrap';
  const b = document.createElement('div'); b.className='toast-box'; b.textContent=msg;
  w.appendChild(b); document.body.appendChild(w);
  setTimeout(()=>{ b.style.opacity='0'; b.style.transform='scale(.95)'; }, 1200);
  setTimeout(()=> w.remove(), 1600);
}
const modal = document.getElementById('orderModal');
const modalTitle = document.getElementById('modalTitle');
const modalSub = document.getElementById('modalSub');
// cerrar
document.getElementById('btnClose').onclick = () => {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
};

// --- Render list ---
const ordersList = document.getElementById('ordersList');

async function fetchOrders(){
  const { data, error } = await supa
    .from('Pedidos')
    .select('id,order_code,status,customer_name,created_at,total,opened_at,time_spent_seconds')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) { console.error(error); toast('Error cargando pedidos'); return []; }
  return data || [];
}

function renderOrders(rows){
  ordersList.innerHTML = '';
  rows.forEach(r=>{
    const st = (r.status||'').toLowerCase();
    const li = document.createElement('li');
    li.className='item flex items-center justify-between gap-3';
    li.dataset.orderId = r.id;

    const left = document.createElement('div');
    left.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-lg font-bold">${r.order_code}</span>
        <span class="badge ${st==='pending'?'text-yellow-300': st==='open'?'text-green-300':'text-gray-300'}">${st}</span>
        ${st==='pending' ? '<span class="star">★</span>' : '<span class="text-green-300">🛠️</span>'}
        <span class="timer text-xs text-gray-300 ml-2"></span>
      </div>
      <div class="text-sm text-gray-300">
        ${new Date(r.created_at).toLocaleString()} · ${r.customer_name||'—'} · $${Number(r.total||0).toFixed(2)}
      </div>
    `;

    // derecha: Open, Stop, Descargar PDF (en ese orden)
    const right = document.createElement('div');
    right.className = 'flex items-center gap-2';

    const btnOpen = document.createElement('button');
    btnOpen.className = 'px-3 py-1 rounded-md font-bold ' +
      (st==='pending' ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-gray-600 text-gray-300 cursor-not-allowed');
    btnOpen.textContent = 'Open';
    btnOpen.disabled = st!=='pending';
    btnOpen.onclick = ()=> openOrder(r.id, r.order_code);   // no se llamará si está disabled

    const btnStop = document.createElement('button');
    btnStop.className = 'px-3 py-1 rounded-md ' +
      (st==='open' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 text-gray-300 cursor-not-allowed');
    btnStop.textContent = 'Stop';
    btnStop.disabled = st!=='open';
    btnStop.onclick = ()=> stopAndPersist(r.id);

    const btnPDF = document.createElement('button');
    btnPDF.className = 'px-3 py-1 rounded-md bg-amber-500 text-black font-bold hover:bg-amber-400';
    btnPDF.textContent = 'PDF';
    btnPDF.onclick = ()=> downloadPdfFor(r.id);

    right.appendChild(btnOpen);
    right.appendChild(btnStop);
    right.appendChild(btnPDF);

    li.appendChild(left);
    li.appendChild(right);
    ordersList.appendChild(li);

    // timers
    const baseSecs = Number(r.time_spent_seconds||0);
    if (st==='open') {
      startTimerFor(r.id, r.opened_at || r.created_at, baseSecs);
    } else if (st==='closed' && baseSecs>0) {
      const t = li.querySelector('.timer'); if (t) t.textContent = fmt(baseSecs);
    }
  });
}


// --- PDF builder (usa detalles) ---
async function buildPdf(order, items){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const fecha = new Date(order.created_at).toLocaleString();
  doc.setFontSize(16); doc.text('Fiesta & Café - Pedido', 14, 18);
  doc.setFontSize(11); doc.text(`Orden: ${order.order_code}`, 14, 26);
  doc.text(`Fecha: ${fecha}`, 14, 32);
  const rows = [];
  let total = 0;
  (items||[]).forEach(it=>{
    const qty = Number(it.qty||0);
    const p = Number(it.unit_price||0);
    const sub = Number(it.subtotal ?? (qty*p));
    total += sub;
    rows.push([ String(qty), it.name||'', (it.note||'').slice(0,120), `$${p.toFixed(2)}`, `$${sub.toFixed(2)}` ]);
  });
  doc.autoTable({
    startY: 38,
    head: [['Cant.','Producto','Nota','Precio','Subtotal']],
    body: rows,
    styles:{ fontSize:10, cellPadding:2 },
    headStyles:{ fillColor:[255,214,10], textColor:0 },
    columnStyles:{ 0:{halign:'center',cellWidth:16}, 3:{halign:'right',cellWidth:24}, 4:{halign:'right',cellWidth:28} }
  });
  const endY = doc.lastAutoTable?.finalY || 38;
  doc.setFontSize(12); doc.text(`Total: $${(order.total ?? total).toFixed(2)}`, 14, endY + 10);
  return doc;
}

// --- Abrir pedido: UPDATE status='open', mostrar modal, botón descargar PDF ---
document.getElementById('btnDownloadPdf').onclick = async ()=>{
  if (!window.__currentPdf) return;
  const { doc, order } = window.__currentPdf;
  const filename = `${order.order_code}.pdf`;
  doc.save(filename);
};

async function openOrder(id, code){
  // si ya está open/closed, no hagas nada
  const row = document.querySelector(`[data-order-id="${id}"]`);
  const badge = row?.querySelector('.badge');
  const current = (badge?.textContent || '').toLowerCase();
  if (current==='open' || current==='closed') return;

  const openedAt = new Date().toISOString();
  await supa.from('Pedidos').update({ status: 'open', opened_at: openedAt }).eq('id', id);

  // UI: deshabilitar Open, habilitar Stop, cambiar badge/icono, arrancar timer
  const btnOpen = row.querySelector('button:nth-child(1)');
  const btnStop = row.querySelector('button:nth-child(2)');
  btnOpen.disabled = true;
  btnOpen.className = 'px-3 py-1 rounded-md font-bold bg-gray-600 text-gray-300 cursor-not-allowed';
  btnStop.disabled = false;
  btnStop.className = 'px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600';
  if (badge) { badge.textContent = 'open'; badge.className = 'badge text-green-300'; }
  startTimerFor(id, openedAt, Number(0));

  // (opcional) abre modal y prepara PDF
  const [{ data: orderRow }, { data: items }] = await Promise.all([
    supa.from('Pedidos').select('id,order_code,created_at,total,customer_name').eq('id', id).single(),
    supa.from('Pedidos_detalle').select('name,note,qty,unit_price,subtotal').eq('order_id', id)
  ]);
  const doc = await buildPdf(orderRow, items);
  modalTitle.textContent = `Pedido ${orderRow.order_code}`;
  modalSub.textContent = `${orderRow.customer_name || '—'} · ${new Date(orderRow.created_at).toLocaleString()}`;
  window.__currentPdf = { doc, order: orderRow };
  modal.classList.remove('hidden'); modal.classList.add('flex');
}

// --- Realtime: alerta cuando llegue un nuevo pedido ---
function bindRealtime(){
  const dot = document.getElementById('rtDot');
  try {
    const ch = supa.channel('rt-pedidos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Pedidos' }, async (payload)=>{
        dot.classList.replace('bg-red-500','bg-green-500');
        toast(`Nuevo pedido: ${payload.new.order_code || payload.new.id}`);
        // refresca lista
        const rows = await fetchOrders(); renderOrders(rows);
        setTimeout(()=> dot.classList.replace('bg-green-500','bg-red-500'), 1200);
      })
      .subscribe((status)=>{
        if (status === 'SUBSCRIBED') dot.classList.replace('bg-red-500','bg-green-500');
      });
    window.__rt = ch;
  } catch(e){ console.error(e); }
}

// --- Init ---
(async function init(){
  const rows = await fetchOrders();
  renderOrders(rows);
  bindRealtime();
})();
// ===== timers =====
const timers = new Map(); // id -> { intId, base, openedAt, el }
function fmt(s){ const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), ss=s%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`; }

function startTimerFor(orderId, openedAtISO, baseSeconds=0){
  stopTimerFor(orderId);
  const li = document.querySelector(`[data-order-id="${orderId}"] .timer`);
  const openedAt = new Date(openedAtISO).getTime();
  const tick = ()=> {
    const now = Date.now();
    const secs = baseSeconds + Math.floor((now - openedAt)/1000);
    if (li) li.textContent = fmt(secs);
  };
  tick();
  const intId = setInterval(tick, 1000);
  timers.set(orderId, { intId, base: baseSeconds, openedAt, el: li });
}
function stopTimerFor(orderId){
  const t = timers.get(orderId);
  if (t){ clearInterval(t.intId); timers.delete(orderId); }
}
document.getElementById('btnStopTimer').onclick = async () => {
  if (!window.__currentPdf) return;
  const { order } = window.__currentPdf;
  // calcula segundos actuales (timer base + transcurrido)
  const li = document.querySelector(`[data-order-id="${order.id}"] .timer`);
  const text = (li?.textContent || '00:00:00');
  const [h,m,s] = text.split(':').map(Number);
  const secs = h*3600 + m*60 + s;

  // guarda y cambia estado (ej. 'paused' o 'done'; usa el que prefieras)
  await supa.from('Pedidos').update({
    time_spent_seconds: secs,
    status: 'open' // o 'paused' si quieres marcarlo; tú decides
  }).eq('id', order.id);

  stopTimerFor(order.id);
  toast('Tiempo detenido');
};
async function stopAndPersist(orderId){
  const row = document.querySelector(`[data-order-id="${orderId}"]`);
  const tEl = row?.querySelector('.timer');
  const text = (tEl?.textContent || '00:00:00');
  const [h,m,s] = text.split(':').map(Number);
  const secs = h*3600 + m*60 + s;

  await supa.from('Pedidos')
    .update({ time_spent_seconds: secs, status: 'closed' })
    .eq('id', orderId);

  stopTimerFor(orderId);
  if (tEl) tEl.textContent = fmt(secs);

  // UI: badge closed, deshabilitar Stop y mantener Open deshabilitado
  const badge = row?.querySelector('.badge');
  if (badge) { badge.textContent = 'closed'; badge.className = 'badge text-gray-300'; }
  const btnOpen = row.querySelector('button:nth-child(1)');
  const btnStop = row.querySelector('button:nth-child(2)');
  if (btnOpen) { btnOpen.disabled = true; btnOpen.className='px-3 py-1 rounded-md font-bold bg-gray-600 text-gray-300 cursor-not-allowed'; }
  if (btnStop) { btnStop.disabled = true; btnStop.className='px-3 py-1 rounded-md bg-gray-600 text-gray-300 cursor-not-allowed'; }

  toast('Orden cerrada');
}
async function downloadPdfFor(orderId){
  const [{ data: orderRow }, { data: items }] = await Promise.all([
    supa.from('Pedidos').select('id,order_code,created_at,total,customer_name').eq('id', orderId).single(),
    supa.from('Pedidos_detalle').select('name,note,qty,unit_price,subtotal').eq('order_id', orderId)
  ]);
  const doc = await buildPdf(orderRow, items);
  doc.save(`${orderRow.order_code}.pdf`);
}

