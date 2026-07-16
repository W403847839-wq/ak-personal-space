(() => {
  const storageKey = "rongcheng-family-splitter-v1";
  const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const defaults = {
    families: [{ id: "f1", name: "李家" }, { id: "f2", name: "王家" }, { id: "f3", name: "陈家" }],
    expenses: [
      { id: "e1", title: "海鲜晚餐", amount: 680, payerId: "f1", participantIds: ["f1", "f2", "f3"] },
      { id: "e2", title: "环海路租车", amount: 240, payerId: "f2", participantIds: ["f1", "f2", "f3"] },
      { id: "e3", title: "那香海咖啡", amount: 96, payerId: "f3", participantIds: ["f2", "f3"] },
    ],
  };
  let state = structuredClone(defaults);
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.families) && saved.families.length >= 2 && Array.isArray(saved.expenses)) state = saved;
  } catch (_) { state = structuredClone(defaults); }
  let selectedParticipants = state.families.map((family) => family.id);

  const byId = (id) => document.getElementById(id);
  const familyForm = byId("family-form");
  const familyName = byId("family-name");
  const familyList = byId("family-list");
  const expenseForm = byId("expense-form");
  const expenseTitle = byId("expense-title");
  const expenseAmount = byId("expense-amount");
  const expensePayer = byId("expense-payer");
  const expenseList = byId("expense-list");
  const participantGrid = byId("participant-grid");
  const transferList = byId("transfer-list");
  const balanceStrip = byId("balance-strip");
  const money = (cents) => `¥${(cents / 100).toFixed(2)}`;
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_) {} };

  const calculate = () => {
    const balances = new Map(state.families.map((family) => [family.id, 0]));
    let totalCents = 0;
    state.expenses.forEach((expense) => {
      const cents = Math.round(Number(expense.amount) * 100);
      const participants = expense.participantIds.filter((id) => balances.has(id));
      if (!balances.has(expense.payerId) || participants.length === 0) return;
      totalCents += cents;
      balances.set(expense.payerId, (balances.get(expense.payerId) || 0) + cents);
      const base = Math.floor(cents / participants.length);
      const remainder = cents - base * participants.length;
      participants.forEach((id, index) => balances.set(id, (balances.get(id) || 0) - base - (index < remainder ? 1 : 0)));
    });
    const familyBalances = state.families.map((family) => ({ ...family, cents: balances.get(family.id) || 0 }));
    const creditors = familyBalances.filter((item) => item.cents > 0).map((item) => ({ ...item })).sort((a, b) => b.cents - a.cents);
    const debtors = familyBalances.filter((item) => item.cents < 0).map((item) => ({ ...item, cents: -item.cents })).sort((a, b) => b.cents - a.cents);
    const transfers = [];
    let d = 0, c = 0;
    while (d < debtors.length && c < creditors.length) {
      const cents = Math.min(debtors[d].cents, creditors[c].cents);
      transfers.push({ from: debtors[d].name, to: creditors[c].name, cents });
      debtors[d].cents -= cents; creditors[c].cents -= cents;
      if (debtors[d].cents === 0) d += 1;
      if (creditors[c].cents === 0) c += 1;
    }
    return { totalCents, familyBalances, transfers };
  };

  const removeFamily = (id) => {
    if (state.families.length <= 2) return;
    const remaining = state.families.filter((family) => family.id !== id);
    state.families = remaining;
    state.expenses = state.expenses
      .filter((expense) => expense.participantIds.some((participantId) => participantId !== id))
      .map((expense) => ({ ...expense, payerId: expense.payerId === id ? remaining[0].id : expense.payerId, participantIds: expense.participantIds.filter((participantId) => participantId !== id) }));
    selectedParticipants = selectedParticipants.filter((participantId) => participantId !== id);
    save(); render();
  };

  const renderFamilies = () => {
    familyList.replaceChildren(...state.families.map((family, index) => {
      const chip = document.createElement("span"); chip.className = "member-chip";
      const marker = document.createElement("i"); marker.setAttribute("aria-hidden", "true"); marker.textContent = String(index + 1);
      const button = document.createElement("button"); button.type = "button"; button.textContent = "×"; button.disabled = state.families.length <= 2; button.setAttribute("aria-label", `移除${family.name}`); button.addEventListener("click", () => removeFamily(family.id));
      chip.append(marker, document.createTextNode(family.name), button); return chip;
    }));
    const previousPayer = expensePayer.value;
    expensePayer.replaceChildren(...state.families.map((family) => {
      const option = document.createElement("option"); option.value = family.id; option.textContent = family.name; return option;
    }));
    if (state.families.some((family) => family.id === previousPayer)) expensePayer.value = previousPayer;
  };

  const renderParticipants = () => {
    participantGrid.replaceChildren(...state.families.map((family) => {
      const active = selectedParticipants.includes(family.id);
      const label = document.createElement("label"); label.className = active ? "participant active" : "participant";
      const input = document.createElement("input"); input.type = "checkbox"; input.checked = active;
      input.addEventListener("change", () => {
        if (active && selectedParticipants.length === 1) return;
        selectedParticipants = active ? selectedParticipants.filter((id) => id !== family.id) : [...selectedParticipants, family.id];
        renderParticipants();
      });
      const name = document.createElement("span"); name.textContent = family.name;
      const mark = document.createElement("b"); mark.setAttribute("aria-hidden", "true"); mark.textContent = active ? "✓" : "+";
      label.append(input, name, mark); return label;
    }));
    byId("participant-count").textContent = String(selectedParticipants.length);
  };

  const renderExpenses = () => {
    if (state.expenses.length === 0) {
      const empty = document.createElement("p"); empty.className = "empty-state"; empty.textContent = "还没有消费记录，先记下旅途中的第一笔吧。"; expenseList.replaceChildren(empty); return;
    }
    expenseList.replaceChildren(...state.expenses.map((expense) => {
      const item = document.createElement("div"); item.className = "expense-item";
      const copy = document.createElement("div"); const title = document.createElement("strong"); title.textContent = expense.title;
      const details = document.createElement("span"); const payer = document.createElement("b"); payer.textContent = state.families.find((family) => family.id === expense.payerId)?.name || "未知家庭";
      const participantNames = expense.participantIds.map((id) => state.families.find((family) => family.id === id)?.name).filter(Boolean).join("、"); details.append(payer, document.createTextNode(` 垫付 · ${participantNames} 平分`)); copy.append(title, details);
      const value = document.createElement("b"); value.textContent = `¥${Number(expense.amount).toFixed(2)}`;
      const button = document.createElement("button"); button.type = "button"; button.textContent = "×"; button.setAttribute("aria-label", `删除${expense.title}`); button.addEventListener("click", () => { state.expenses = state.expenses.filter((item) => item.id !== expense.id); save(); render(); });
      item.append(copy, value, button); return item;
    }));
  };

  const renderTotals = () => {
    const totals = calculate();
    byId("total-spend").textContent = money(totals.totalCents); byId("family-count").textContent = String(state.families.length); byId("expense-count").textContent = String(state.expenses.length);
    if (totals.transfers.length === 0) {
      const item = document.createElement("li"); const empty = document.createElement("span"); empty.className = "empty-state"; empty.textContent = "现在账目是平的，无需转账。"; item.append(empty); transferList.replaceChildren(item);
    } else transferList.replaceChildren(...totals.transfers.map((transfer) => {
      const item = document.createElement("li"); const copy = document.createElement("span"); const from = document.createElement("b"); from.textContent = transfer.from; const arrow = document.createElement("i"); arrow.setAttribute("aria-hidden", "true"); arrow.textContent = "→"; const to = document.createElement("b"); to.textContent = transfer.to; copy.append(from, arrow, to); const value = document.createElement("strong"); value.textContent = money(transfer.cents); item.append(copy, value); return item;
    }));
    balanceStrip.replaceChildren(...totals.familyBalances.map((family) => {
      const row = document.createElement("div"); const name = document.createElement("span"); name.textContent = family.name; const value = document.createElement("b"); value.className = family.cents >= 0 ? "positive" : "negative"; value.textContent = `${family.cents >= 0 ? "+" : "−"}${money(Math.abs(family.cents)).slice(1)}`; row.append(name, value); return row;
    }));
  };

  const render = () => { renderFamilies(); renderParticipants(); renderExpenses(); renderTotals(); };

  familyForm.addEventListener("submit", (event) => {
    event.preventDefault(); const name = familyName.value.trim(); if (!name || state.families.some((family) => family.name === name)) return;
    const family = { id: makeId(), name }; state.families.push(family); selectedParticipants.push(family.id); familyName.value = ""; save(); render();
  });
  byId("select-all").addEventListener("click", () => { selectedParticipants = state.families.map((family) => family.id); renderParticipants(); });
  expenseForm.addEventListener("submit", (event) => {
    event.preventDefault(); const amount = Number(expenseAmount.value); if (!expenseTitle.value.trim() || !Number.isFinite(amount) || amount <= 0 || selectedParticipants.length === 0) return;
    state.expenses.push({ id: makeId(), title: expenseTitle.value.trim(), amount, payerId: expensePayer.value, participantIds: [...selectedParticipants] }); expenseTitle.value = ""; expenseAmount.value = ""; save(); render();
  });
  render();
})();
