(() => {
  const storageKey = "ak-aa-splitter";
  const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const defaults = {
    members: [{ id: "m1", name: "小李" }, { id: "m2", name: "小王" }, { id: "m3", name: "小陈" }],
    expenses: [{ id: "e1", title: "火锅", amount: 360, payerId: "m1" }, { id: "e2", title: "打车", amount: 90, payerId: "m2" }],
  };
  let state = defaults;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.members) && saved.members.length >= 2 && Array.isArray(saved.expenses)) state = saved;
  } catch (_) { state = defaults; }

  const byId = (id) => document.getElementById(id);
  const memberForm = byId("member-form");
  const memberName = byId("member-name");
  const memberList = byId("member-list");
  const expenseForm = byId("expense-form");
  const expenseTitle = byId("expense-title");
  const expenseAmount = byId("expense-amount");
  const expensePayer = byId("expense-payer");
  const expenseList = byId("expense-list");
  const transferList = byId("transfer-list");
  const money = (cents) => `¥${(cents / 100).toFixed(2)}`;
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_) {} };

  const calculate = () => {
    const balances = new Map(state.members.map((member) => [member.id, 0]));
    let totalCents = 0;
    state.expenses.forEach((expense) => {
      const cents = Math.round(expense.amount * 100);
      totalCents += cents;
      balances.set(expense.payerId, (balances.get(expense.payerId) || 0) + cents);
      const base = Math.floor(cents / state.members.length);
      const remainder = cents - base * state.members.length;
      state.members.forEach((member, index) => balances.set(member.id, (balances.get(member.id) || 0) - base - (index < remainder ? 1 : 0)));
    });
    const creditors = state.members.map((member) => ({ ...member, cents: balances.get(member.id) || 0 })).filter((item) => item.cents > 0).sort((a, b) => b.cents - a.cents);
    const debtors = state.members.map((member) => ({ ...member, cents: -(balances.get(member.id) || 0) })).filter((item) => item.cents > 0).sort((a, b) => b.cents - a.cents);
    const transfers = [];
    let d = 0, c = 0;
    while (d < debtors.length && c < creditors.length) {
      const cents = Math.min(debtors[d].cents, creditors[c].cents);
      transfers.push({ from: debtors[d].name, to: creditors[c].name, cents });
      debtors[d].cents -= cents;
      creditors[c].cents -= cents;
      if (debtors[d].cents === 0) d += 1;
      if (creditors[c].cents === 0) c += 1;
    }
    return { totalCents, perPerson: Math.round(totalCents / state.members.length), transfers };
  };

  const removeMember = (id) => {
    if (state.members.length <= 2) return;
    const remaining = state.members.filter((member) => member.id !== id);
    state.members = remaining;
    state.expenses = state.expenses.map((expense) => expense.payerId === id ? { ...expense, payerId: remaining[0].id } : expense);
    save(); render();
  };

  const render = () => {
    memberList.replaceChildren(...state.members.map((member) => {
      const chip = document.createElement("span");
      chip.className = "member-chip";
      chip.append(document.createTextNode(member.name));
      const button = document.createElement("button");
      button.type = "button"; button.textContent = "×"; button.disabled = state.members.length <= 2;
      button.setAttribute("aria-label", `移除${member.name}`);
      button.addEventListener("click", () => removeMember(member.id));
      chip.append(button); return chip;
    }));
    const selected = expensePayer.value;
    expensePayer.replaceChildren(...state.members.map((member) => {
      const option = document.createElement("option"); option.value = member.id; option.textContent = member.name; return option;
    }));
    if (state.members.some((member) => member.id === selected)) expensePayer.value = selected;
    if (state.expenses.length === 0) expenseList.innerHTML = '<p class="empty-state">还没有消费记录。</p>';
    else expenseList.replaceChildren(...state.expenses.map((expense) => {
      const item = document.createElement("div"); item.className = "expense-item";
      const copy = document.createElement("div");
      const title = document.createElement("strong"); title.textContent = expense.title;
      const payer = document.createElement("span"); payer.textContent = `${state.members.find((member) => member.id === expense.payerId)?.name || "未知"} 付款`;
      copy.append(title, payer);
      const value = document.createElement("b"); value.textContent = `¥${Number(expense.amount).toFixed(2)}`;
      const button = document.createElement("button"); button.type = "button"; button.textContent = "×"; button.setAttribute("aria-label", `删除${expense.title}`);
      button.addEventListener("click", () => { state.expenses = state.expenses.filter((item) => item.id !== expense.id); save(); render(); });
      item.append(copy, value, button); return item;
    }));
    const totals = calculate();
    byId("total-spend").textContent = money(totals.totalCents);
    byId("member-count").textContent = String(state.members.length);
    byId("per-person").textContent = money(totals.perPerson);
    if (totals.transfers.length === 0) transferList.innerHTML = '<li><span class="empty-state">账目已经平了，无需转账。</span></li>';
    else transferList.replaceChildren(...totals.transfers.map((transfer) => {
      const item = document.createElement("li");
      const copy = document.createElement("span");
      const from = document.createElement("b"); from.textContent = transfer.from;
      const to = document.createElement("b"); to.textContent = transfer.to;
      copy.append(from, document.createTextNode(" 转给 "), to);
      const value = document.createElement("strong"); value.textContent = money(transfer.cents);
      item.append(copy, value); return item;
    }));
  };

  memberForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = memberName.value.trim();
    if (!name || state.members.some((member) => member.name === name)) return;
    state.members.push({ id: makeId(), name }); memberName.value = ""; save(); render();
  });
  expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const amount = Number(expenseAmount.value);
    if (!expenseTitle.value.trim() || !Number.isFinite(amount) || amount <= 0) return;
    state.expenses.push({ id: makeId(), title: expenseTitle.value.trim(), amount, payerId: expensePayer.value });
    expenseTitle.value = ""; expenseAmount.value = ""; save(); render();
  });
  render();
})();
