(() => {
  const byId = id => document.getElementById(id);
  const dialog = byId('reuse-dialog');
  const dialogTitle = byId('reuse-dialog-title');
  const form = byId('reuse-form');
  const slot = byId('reuse-slot');
  const receipt = byId('reuse-receipt');
  const toast = byId('reuse-toast');
  const slots = new Map([...slot.options].filter(option => option.value)
    .map(option => [option.value, option.textContent]));
  const items = new Map([...document.querySelectorAll('[data-reuse-item]')]
    .map(card => [card.dataset.reuseItem, {
      name: card.querySelector('h3').textContent,
      status: card.querySelector('.reuse-status'),
      button: card.querySelector('button'),
    }]));
  const storageKey = 'ecocraft-reuse-preview-v1';
  const reservations = new Map();
  let selected = null;
  let toastTimer;

  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? '{}');
    for (const id of items.keys()) {
      if (slots.has(saved?.[id])) reservations.set(id, saved[id]);
    }
  } catch {
    // The preview still works when a browser restricts local storage.
  }

  function updateCard(id) {
    const { name, status, button } = items.get(id);
    const reserved = reservations.has(id);
    status.textContent = reserved ? '已預約 · 演示' : '可預約 · 演示';
    button.textContent = reserved ? '查看預約' : '免費預約';
    button.setAttribute('aria-label', `${button.textContent}：${name}`);
  }

  function saveReservation(id, value) {
    if (value) reservations.set(id, value);
    else reservations.delete(id);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(reservations)));
    } catch {
      // In-memory state remains available for this page.
    }
    updateCard(id);
  }

  function showReservation() {
    const value = reservations.get(selected);
    dialogTitle.textContent = value ? '演示預約已確認' : '確認免費預約';
    byId('reuse-chosen-item').textContent = items.get(selected).name;
    form.hidden = Boolean(value);
    receipt.hidden = !value;
    slot.value = value ?? '';
    byId('reuse-confirmed-slot').textContent = slots.get(value) ?? '';
  }

  function announce(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  for (const [id, item] of items) {
    updateCard(id);
    item.button.addEventListener('click', () => {
      selected = id;
      showReservation();
      dialog.showModal();
      dialogTitle.focus();
    });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!selected || !slots.has(slot.value)) return;
    saveReservation(selected, slot.value);
    showReservation();
    dialogTitle.focus();
  });

  byId('cancel-reuse').addEventListener('click', () => {
    saveReservation(selected, null);
    dialog.close();
    announce('已取消演示預約。');
  });

  byId('keep-browsing').addEventListener('click', () => dialog.close());
  byId('close-reuse-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    items.get(selected)?.button.focus();
    selected = null;
  });
})();
