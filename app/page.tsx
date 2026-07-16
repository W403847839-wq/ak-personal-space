import { AASplitter } from "./AASplitter";

const sections = [
  { index: "01", icon: "⌂", title: "按家庭建组", body: "把同行人归到家庭名下。结算时以家庭为单位，不再让每个人分别转账。" },
  { index: "02", icon: "◇", title: "记录垫付与参与", body: "选择垫付家庭，再勾选真正参与这笔消费的家庭，聚餐、门票和单独行动都能算。" },
  { index: "03", icon: "→", title: "回程前一次结清", body: "系统自动抵消往来，给出尽量少的家庭间转账步骤，清清爽爽结束旅程。" },
];

export default function Home() {
  return (
    <div className="site-shell">
      <div className="coast-glow" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回首页顶部">
          <span className="brand-mark" aria-hidden="true">RC</span>
          <span className="brand-copy"><b>荣成看海账本</b><small>RONGCHENG · SHANDONG</small></span>
        </a>
        <nav className="site-nav" aria-label="主导航">
          <a href="#splitter">开始记账</a>
          <a href="#guide">怎么使用</a>
        </nav>
        <span className="weather"><i aria-hidden="true">☀</i><span>海风正好<br /><small>一起出发</small></span></span>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span>家庭出游 · AA 分账</span><span>37.15°N / 122.41°E</span></p>
            <h1 id="hero-title">一起去荣成<br />看海<span>，</span>账也算清</h1>
            <p className="intro">一个家庭先买单，大家按实际参与来平分。同行有情分，账目不含糊。</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#splitter">开始记一笔 <span aria-hidden="true">↓</span></a>
              <span className="trip-note"><i aria-hidden="true">◌</i> 无需注册 · 数据留在当前设备</span>
            </div>
          </div>

          <div className="coast-card" aria-label="荣成旅行信息">
            <div className="postcard-sun" aria-hidden="true" />
            <span className="bird bird-one" aria-hidden="true">⌒</span>
            <span className="bird bird-two" aria-hidden="true">⌒</span>
            <div className="postcard-copy"><small>THIS TRIP</small><b>荣成</b><span>海岸线 · 日出 · 好朋友</span></div>
            <div className="wave wave-one" aria-hidden="true" />
            <div className="wave wave-two" aria-hidden="true" />
            <div className="wave wave-three" aria-hidden="true" />
            <div className="route-tag"><span>山东</span><i aria-hidden="true">→</i><b>荣成</b></div>
          </div>
        </section>

        <div className="marquee" aria-hidden="true"><span>成山头</span><i>✦</i><span>那香海</span><i>✦</i><span>环海路</span><i>✦</i><span>海鲜大餐</span><i>✦</i><span>日出海岸</span></div>

        <AASplitter />

        <section className="guide" id="guide" aria-labelledby="guide-title">
          <div className="guide-heading"><p className="section-label">HOW IT WORKS · 02</p><h2 id="guide-title">三步，算清整趟旅行</h2></div>
          <div className="story-grid">
            {sections.map((section) => (
              <article className="story-card" key={section.title}>
                <div className="card-topline"><span>{section.index}</span><b aria-hidden="true">{section.icon}</b></div>
                <h3>{section.title}</h3><p>{section.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer"><p>荣成看海账本 · 愿每次同行都轻松愉快</p><a href="#top">回到岸上 <span aria-hidden="true">↑</span></a></footer>
    </div>
  );
}
