const sections = [
  {
    index: "01",
    title: "关于我",
    body: "喜欢把复杂的事情变简单，也喜欢摄影、旅行和认真生活。",
  },
  {
    index: "02",
    title: "最近在做",
    body: "搭建这个属于自己的互联网角落，之后会慢慢放进更多作品。",
  },
  {
    index: "03",
    title: "保持联系",
    body: "如果你也对创造有兴趣，欢迎来聊聊。",
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
          <a href="#about">关于</a>
          <a href="#now">近况</a>
          <a href="#contact">联系</a>
        </nav>
        <span className="status"><i aria-hidden="true" /> ONLINE</span>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span>HELLO, WORLD</span><span>SHANGHAI · 2026</span></p>
            <h1 id="hero-title">你好，欢迎来到<br />我的小站<span className="title-dot">。</span></h1>
            <p className="intro">记录想法、分享作品，也让远方的朋友知道我最近在做什么。</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#about">认识我 <span aria-hidden="true">↘</span></a>
              <a className="button button-secondary" href="#contact">联系我 <span aria-hidden="true">→</span></a>
            </div>
          </div>

          <div className="orbital" aria-hidden="true">
            <div className="orbit orbit-outer"><span /></div>
            <div className="orbit orbit-inner"><span /></div>
            <div className="orbit-core"><b>AK</b><small>SPACE / 01</small></div>
            <span className="orbit-label orbit-label-top">IDEAS IN MOTION</span>
            <span className="orbit-label orbit-label-bottom">EST. 2026</span>
          </div>
        </section>

        <section className="story-grid" aria-label="个人介绍">
          {sections.map((section, i) => (
            <article className="story-card" id={i === 0 ? "about" : i === 1 ? "now" : "contact"} key={section.title}>
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
