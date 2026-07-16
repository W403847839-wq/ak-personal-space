"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Member = { id: string; name: string };
type Expense = { id: string; title: string; amount: number; payerId: string };

const defaultMembers: Member[] = [
  { id: "m1", name: "小李" },
  { id: "m2", name: "小王" },
  { id: "m3", name: "小陈" },
];

const defaultExpenses: Expense[] = [
  { id: "e1", title: "火锅", amount: 360, payerId: "m1" },
  { id: "e2", title: "打车", amount: 90, payerId: "m2" },
];

const money = (cents: number) => `¥${(cents / 100).toFixed(2)}`;
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function AASplitter() {
  const [members, setMembers] = useState<Member[]>(defaultMembers);
  const [expenses, setExpenses] = useState<Expense[]>(defaultExpenses);
  const [memberName, setMemberName] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState(defaultMembers[0].id);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("ak-aa-splitter");
      if (saved) {
        const data = JSON.parse(saved) as { members?: Member[]; expenses?: Expense[] };
        if (data.members && data.members.length >= 2) {
          setMembers(data.members);
          setExpenses(data.expenses ?? []);
          setPayerId(data.members[0].id);
        }
      }
    } catch {
      // Keep useful defaults when local browser data is unavailable.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("ak-aa-splitter", JSON.stringify({ members, expenses }));
  }, [hydrated, members, expenses]);

  const totals = useMemo(() => {
    const balances = new Map(members.map((member) => [member.id, 0]));
    let totalCents = 0;
    expenses.forEach((expense) => {
      const cents = Math.round(expense.amount * 100);
      totalCents += cents;
      balances.set(expense.payerId, (balances.get(expense.payerId) ?? 0) + cents);
      const baseShare = Math.floor(cents / members.length);
      const remainder = cents - baseShare * members.length;
      members.forEach((member, index) => balances.set(member.id, (balances.get(member.id) ?? 0) - baseShare - (index < remainder ? 1 : 0)));
    });
    const creditors = members.map((member) => ({ ...member, cents: balances.get(member.id) ?? 0 })).filter((item) => item.cents > 0).sort((a, b) => b.cents - a.cents);
    const debtors = members.map((member) => ({ ...member, cents: -(balances.get(member.id) ?? 0) })).filter((item) => item.cents > 0).sort((a, b) => b.cents - a.cents);
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
    return { totalCents, perPerson: Math.round(totalCents / members.length), transfers };
  }, [members, expenses]);

  const addMember = (event: FormEvent) => {
    event.preventDefault();
    const name = memberName.trim();
    if (!name || members.some((member) => member.name === name)) return;
    setMembers((current) => [...current, { id: makeId(), name }]);
    setMemberName("");
  };

  const removeMember = (id: string) => {
    if (members.length <= 2) return;
    const remaining = members.filter((member) => member.id !== id);
    setMembers(remaining);
    setExpenses((current) => current.map((expense) => expense.payerId === id ? { ...expense, payerId: remaining[0].id } : expense));
    if (payerId === id) setPayerId(remaining[0].id);
  };

  const addExpense = (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!title.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    setExpenses((current) => [...current, { id: makeId(), title: title.trim(), amount: parsedAmount, payerId }]);
    setTitle("");
    setAmount("");
  };

  return (
    <section className="splitter" id="splitter" aria-labelledby="splitter-title">
      <div className="splitter-heading">
        <div><p className="section-label">AA SPLITTER / 01</p><h2 id="splitter-title">这顿饭，谁该转给谁？</h2></div>
        <p>所有消费默认由当前成员平均分摊，计算结果会保存在这台设备上。</p>
      </div>
      <div className="splitter-stats" aria-live="polite">
        <div><span>总消费</span><strong>{money(totals.totalCents)}</strong></div>
        <div><span>参与人数</span><strong>{members.length}</strong></div>
        <div><span>人均</span><strong>{money(totals.perPerson)}</strong></div>
      </div>
      <div className="splitter-layout">
        <div className="splitter-column">
          <div className="tool-block">
            <div className="tool-title"><span>01</span><h3>添加成员</h3></div>
            <form className="inline-form" onSubmit={addMember}>
              <label className="sr-only" htmlFor="member-name">成员姓名</label>
              <input id="member-name" value={memberName} onChange={(event) => setMemberName(event.target.value)} placeholder="输入姓名" maxLength={12} />
              <button type="submit">添加</button>
            </form>
            <div className="member-list" aria-label="当前成员">
              {members.map((member) => <span className="member-chip" key={member.id}>{member.name}<button type="button" onClick={() => removeMember(member.id)} disabled={members.length <= 2} aria-label={`移除${member.name}`}>×</button></span>)}
            </div>
          </div>
          <div className="tool-block">
            <div className="tool-title"><span>02</span><h3>记录消费</h3></div>
            <form className="expense-form" onSubmit={addExpense}>
              <label>消费项目<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：晚餐" maxLength={20} /></label>
              <label>金额（元）<input type="number" inputMode="decimal" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></label>
              <label>付款人<select value={payerId} onChange={(event) => setPayerId(event.target.value)}>{members.map((member) => <option value={member.id} key={member.id}>{member.name}</option>)}</select></label>
              <button type="submit">加入账单 <span aria-hidden="true">＋</span></button>
            </form>
          </div>
        </div>
        <div className="splitter-column">
          <div className="tool-block expense-block">
            <div className="tool-title"><span>03</span><h3>消费明细</h3></div>
            <div className="expense-list">
              {expenses.length === 0 ? <p className="empty-state">还没有消费记录。</p> : expenses.map((expense) => (
                <div className="expense-item" key={expense.id}>
                  <div><strong>{expense.title}</strong><span>{members.find((member) => member.id === expense.payerId)?.name ?? "未知"} 付款</span></div>
                  <b>¥{expense.amount.toFixed(2)}</b>
                  <button type="button" onClick={() => setExpenses((current) => current.filter((item) => item.id !== expense.id))} aria-label={`删除${expense.title}`}>×</button>
                </div>
              ))}
            </div>
          </div>
          <div className="settlement" aria-live="polite">
            <div className="tool-title"><span>RESULT</span><h3>最简结算</h3></div>
            {totals.transfers.length === 0 ? <p className="empty-state">账目已经平了，无需转账。</p> : <ol className="transfer-list">{totals.transfers.map((transfer, index) => <li key={`${transfer.from}-${transfer.to}-${index}`}><span><b>{transfer.from}</b> 转给 <b>{transfer.to}</b></span><strong>{money(transfer.cents)}</strong></li>)}</ol>}
          </div>
        </div>
      </div>
    </section>
  );
}
