// Home page: markup and all home styles live in this one file.
const css = `
@keyframes fromLeft  { from { opacity: 0; transform: translateX(-70px) } to { opacity: 1; transform: none } }
@keyframes fromRight { from { opacity: 0; transform: translateX(70px) }  to { opacity: 1; transform: none } }

.hero { overflow-x: hidden }
.hero .tag { animation: fromLeft .7s ease-out both }
.hero h1 .h-l { display: block; animation: fromLeft .8s ease-out .15s both }
.hero h1 .h-r { display: block; animation: fromRight .8s ease-out .3s both }
.hero p { animation: fromLeft .8s ease-out .45s both }
.hero .row a:first-child { animation: fromRight .8s ease-out .6s both }
.hero .row a:last-child { animation: fromLeft .8s ease-out .7s both }

@media (prefers-reduced-motion: reduce) {
  .hero .tag, .hero h1 span, .hero p, .hero .row a { animation: none }
}
`

export default function Home() {
  return <>
    <style>{css}</style>
    <section className="hero" id="home"><div className="wrap">
      <span className="tag">Gardening Services in Coimbatore</span>
      <h1><span className="h-l">Transform Your Space</span> <span className="h-r">into a <em>Green Paradise</em></span></h1>
      <p>Professional gardening solutions for homes, terraces, balconies, and outdoor spaces in Coimbatore</p>
      <div className="row"><a className="btn primary lg" href="#visit-booking">Book a Site Visit</a><a className="btn light lg" href="#services">Explore Our Services</a></div>
    </div></section>
  </>
}
