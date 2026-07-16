import { AASplitter } from "./AASplitter";

const sections = [
  {
    index: "01",
    title: "添加成员",
    body: "先写下参与分账的朋友，至少保留两个人。",
  },
  {
    index: "02",
    title: "记录消费",
    body: "输入每笔消费、金额和付款人，默认大家平均分摊。",
  },
  {
    index: "03",
    title: "一键结算",
    body: "系统自动合并债务，给出尽量少的转账步骤。",
  },
];

export default function Home() {
  return (
    <div className="site-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回首页顶部">
          <span className="brand-mark" aria-hidden="true">AK</span>
          <span className="brand-copy">PERSONAL SPACE</span>
        </a>
        <nav className="site-nav" aria-label="主导航">
          <a href="#splitter">开始分账</a>
          <a href="#guide">使用说明</a>
          <a href="#contact">联系</a>
        </nav>
        <span className="status"><i aria-hidden="true" /> ONLINE</span>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span>FAIR SHARE</span><span>FRIENDS · 2026</span></p>
            <h1 id="hero-title">AA 分账，算得<br />清清楚楚<span className="title-dot">。</span></h1>
            <p className="intro">记下谁付了钱，自动算出谁该转给谁。无需注册，打开就能用。</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#splitter">开始分账 <span aria-hidden="true">↘</span></a>
              <a className="button button-secondary" href="#guide">使用说明 <span aria-hidden="true">→</span></a>
            </div>
          </div>

          <div className="orbital" aria-hidden="true">
            <div className="orbit orbit-outer"><span /></div>
            <div className="orbit orbit-inner"><span /></div>
            <div className="orbit-core"><b>AA</b><small>FAIR / SHARE</small></div>
            <span className="orbit-label orbit-label-top">BALANCE IN MOTION</span>
            <span className="orbit-label orbit-label-bottom">SETTLE FAIRLY</span>
          </div>
        </section>

        <AASplitter />
        <section className="story-grid" id="guide" aria-label="使用说明">
          {sections.map((section, i) => (
            <article className="story-card" key={section.title}>
              <div className="card-topline"><span>{section.index}</span><span aria-hidden="true">↗</span></div>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              <div className="card-signal" aria-hidden="true"><i /><i /><i /><i /></div>
            </article>
          ))}
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 AK · Made with curiosity</p>
        <a href="#top">回到顶部 <span aria-hidden="true">↑</span></a>
      </footer>
    </div>
  );
}
