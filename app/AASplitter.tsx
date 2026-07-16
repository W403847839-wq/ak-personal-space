"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Family = { id: string; name: string };
type Expense = { id: string; title: string; amount: number; payerId: string; participantIds: string[] };

const defaultFamilies: Family[] = [
  { id: "f1", name: "李家" },
  { id: "f2", name: "王家" },
  { id: "f3", name: "陈家" },
];

const defaultExpenses: Expense[] = [
  { id: "e1", title: "海鲜晚餐", amount: 680, payerId: "f1", participantIds: ["f1", "f2", "f3"] },
  { id: "e2", title: "环海路租车", amount: 240, payerId: "f2", participantIds: ["f1", "f2", "f3"] },
  { id: "e3", title: "那香海咖啡", amount: 96, payerId: "f3", participantIds: ["f2", "f3"] },
];

const money = (cents: number) => `¥${(cents / 100).toFixed(2)}`;
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function AASplitter() {
  const [families, setFamilies] = useState<Family[]>(defaultFamilies);
  const [expenses, setExpenses] = useState<Expense[]>(defaultExpenses);
  const [familyName, setFamilyName] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState(defaultFamilies[0].id);
  const [participantIds, setParticipantIds] = useState(defaultFamilies.map((family) => family.id));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("rongcheng-family-splitter-v1");
      if (saved) {
        const data = JSON.parse(saved) as { families?: Family[]; expenses?: Expense[] };
        if (data.families && data.families.length >= 2) {
          setFamilies(data.families);
          setExpenses(data.expenses ?? []);
          setPayerId(data.families[0].id);
          setParticipantIds(data.families.map((family) => family.id));
        }
      }
    } catch {
      // Keep the coastal trip example if local browser data is unavailable.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("rongcheng-family-splitter-v1", JSON.stringify({ families, expenses }));
  }, [hydrated, families, expenses]);

  const totals = useMemo(() => {
    const balances = new Map(families.map((family) => [family.id, 0]));
    let totalCents = 0;
    expenses.forEach((expense) => {
      const cents = Math.round(expense.amount * 100);
      const participants = expense.participantIds.filter((id) => balances.has(id));
      if (!balances.has(expense.payerId) || participants.length === 0) return;
      totalCents += cents;
      balances.set(expense.payerId, (balances.get(expense.payerId) ?? 0) + cents);
      const baseShare = Math.floor(cents / participants.length);
      const remainder = cents - baseShare * participants.length;
      participants.forEach((id, index) => {
        balances.set(id, (balances.get(id) ?? 0) - baseShare - (index < remainder ? 1 : 0));
      });
    });

    const familyBalances = families.map((family) => ({ ...family, cents: balances.get(family.id) ?? 0 }));
    const creditors = familyBalances.filter((item) => item.cents > 0).map((item) => ({ ...item })).sort((a, b) => b.cents - a.cents);
    const debtors = familyBalances.filter((item) => item.cents < 0).map((item) => ({ ...item, cents: -item.cents })).sort((a, b) => b.cents - a.cents);
    const transfers: { from: string; to: string; cents: number }[] = [];
    let debtorIndex = 0;
    let creditorIndex = 0;
    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const cents = Math.min(debtors[debtorIndex].cents, creditors[creditorIndex].cents);
      transfers.push({ from: debtors[debtorIndex].name, to: creditors[creditorIndex].name, cents });
      debtors[debtorIndex].cents -= cents;
      creditors[creditorIndex].cents -= cents;
      if (debtors[debtorIndex].cents === 0) debtorIndex += 1;
      if (creditors[creditorIndex].cents === 0) creditorIndex += 1;
    }
    return { totalCents, transfers, familyBalances };
  }, [families, expenses]);

  const addFamily = (event: FormEvent) => {
    event.preventDefault();
    const name = familyName.trim();
    if (!name || families.some((family) => family.name === name)) return;
    const family = { id: makeId(), name };
    setFamilies((current) => [...current, family]);
    setParticipantIds((current) => [...current, family.id]);
    setFamilyName("");
  };

  const removeFamily = (id: string) => {
    if (families.length <= 2) return;
    const remaining = families.filter((family) => family.id !== id);
    setFamilies(remaining);
    setExpenses((current) => current
      .filter((expense) => expense.participantIds.some((participantId) => participantId !== id))
      .map((expense) => ({
        ...expense,
        payerId: expense.payerId === id ? remaining[0].id : expense.payerId,
        participantIds: expense.participantIds.filter((participantId) => participantId !== id),
      })));
    setParticipantIds((current) => current.filter((participantId) => participantId !== id));
    if (payerId === id) setPayerId(remaining[0].id);
  };

  const toggleParticipant = (id: string) => {
    setParticipantIds((current) => current.includes(id)
      ? current.length > 1 ? current.filter((participantId) => participantId !== id) : current
      : [...current, id]);
  };

  const addExpense = (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!title.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0 || participantIds.length === 0) return;
    setExpenses((current) => [...current, {
      id: makeId(),
      title: title.trim(),
      amount: parsedAmount,
      payerId,
      participantIds: [...participantIds],
    }]);
    setTitle("");
    setAmount("");
  };

  return (
    <section className="splitter" id="splitter" aria-labelledby="splitter-title">
      <div className="splitter-heading">
        <div><p className="section-label">FAMILY TRIP LEDGER · 01</p><h2 id="splitter-title">旅途账目，清爽得像海风</h2></div>
        <p>谁先垫付都可以。每笔费用单独选择参与家庭，系统只在这些家庭之间平分并合并转账。</p>
      </div>

      <div className="splitter-stats" aria-live="polite">
        <div><span>旅途总花费</span><strong>{money(totals.totalCents)}</strong></div>
        <div><span>同行家庭</span><strong>{families.length}<small> 组</small></strong></div>
        <div><span>消费记录</span><strong>{expenses.length}<small> 笔</small></strong></div>
      </div>

      <div className="splitter-layout">
        <div className="splitter-column">
          <div className="tool-block family-block">
            <div className="tool-title"><span>01 · 同行家庭</span><h3>这次和谁一起看海？</h3></div>
            <form className="inline-form" onSubmit={addFamily}>
              <label className="sr-only" htmlFor="family-name">家庭名称</label>
              <input id="family-name" value={familyName} onChange={(event) => setFamilyName(event.target.value)} placeholder="例如：张家" maxLength={12} />
              <button type="submit">添加家庭</button>
            </form>
            <div className="member-list" aria-label="同行家庭">
              {families.map((family, index) => (
                <span className="member-chip" key={family.id}><i aria-hidden="true">{index + 1}</i>{family.name}<button type="button" onClick={() => removeFamily(family.id)} disabled={families.length <= 2} aria-label={`移除${family.name}`}>×</button></span>
              ))}
            </div>
          </div>

          <div className="tool-block expense-entry">
            <div className="tool-title"><span>02 · 记一笔</span><h3>谁垫付，谁参与？</h3></div>
            <form className="expense-form" onSubmit={addExpense}>
              <label>消费项目<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：海鲜晚餐" maxLength={20} /></label>
              <label>金额（元）<input type="number" inputMode="decimal" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></label>
              <label>垫付家庭<select value={payerId} onChange={(event) => setPayerId(event.target.value)}>{families.map((family) => <option value={family.id} key={family.id}>{family.name}</option>)}</select></label>
              <fieldset className="participant-field">
                <legend><span>参与分摊的家庭</span><button type="button" onClick={() => setParticipantIds(families.map((family) => family.id))}>全选</button></legend>
                <div className="participant-grid">
                  {families.map((family) => {
                    const checked = participantIds.includes(family.id);
                    return <label className={checked ? "participant active" : "participant"} key={family.id}><input type="checkbox" checked={checked} onChange={() => toggleParticipant(family.id)} /><span>{family.name}</span><b aria-hidden="true">{checked ? "✓" : "+"}</b></label>;
                  })}
                </div>
              </fieldset>
              <div className="split-hint"><span aria-hidden="true">≈</span> 这笔费用将由 <b>{participantIds.length}</b> 个家庭平分</div>
              <button className="add-expense-button" type="submit">记入旅途账本 <span aria-hidden="true">＋</span></button>
            </form>
          </div>
        </div>

        <div className="splitter-column">
          <div className="tool-block expense-block">
            <div className="tool-title"><span>03 · 流水</span><h3>沿途消费</h3></div>
            <div className="expense-list">
              {expenses.length === 0 ? <p className="empty-state">还没有消费记录，先记下旅途中的第一笔吧。</p> : expenses.map((expense) => {
                const payer = families.find((family) => family.id === expense.payerId)?.name ?? "未知家庭";
                const participants = expense.participantIds.map((id) => families.find((family) => family.id === id)?.name).filter(Boolean).join("、");
                return (
                  <div className="expense-item" key={expense.id}>
                    <div><strong>{expense.title}</strong><span><b>{payer}</b> 垫付 · {participants} 平分</span></div>
                    <b>¥{expense.amount.toFixed(2)}</b>
                    <button type="button" onClick={() => setExpenses((current) => current.filter((item) => item.id !== expense.id))} aria-label={`删除${expense.title}`}>×</button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="settlement" aria-live="polite">
            <div className="tool-title"><span>SETTLE · 回家前</span><h3>最简结算</h3></div>
            {totals.transfers.length === 0 ? <p className="empty-state">现在账目是平的，无需转账。</p> : <ol className="transfer-list">{totals.transfers.map((transfer, index) => <li key={`${transfer.from}-${transfer.to}-${index}`}><span><b>{transfer.from}</b><i aria-hidden="true">→</i><b>{transfer.to}</b></span><strong>{money(transfer.cents)}</strong></li>)}</ol>}
            <p className="settlement-note">已自动抵消家庭之间的往来，只保留最少的转账步骤。</p>
          </div>

          <div className="balance-strip" aria-label="各家庭收支状态">
            {totals.familyBalances.map((family) => <div key={family.id}><span>{family.name}</span><b className={family.cents >= 0 ? "positive" : "negative"}>{family.cents >= 0 ? "+" : "−"}{money(Math.abs(family.cents)).slice(1)}</b></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}
