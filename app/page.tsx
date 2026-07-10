"use client";

import { useMemo, useRef, useState } from "react";

type Section = { id: number; eyebrow: string; title: string; body: string };
type SpeechResultEvent = { results: ArrayLike<{ 0: { transcript: string } }> };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

const SAMPLE = `A Asten ajuda empresas a transformar processos complexos em experiências simples. Criamos soluções de tecnologia que conectam pessoas, dados e resultados. Nosso diferencial é unir conhecimento de negócio, inovação e execução. Atendemos projetos de ERP, automação, integração e inteligência artificial. Fale com nosso time para descobrir como acelerar a transformação da sua empresa.`;

const START_SECTIONS: Section[] = [
  { id: 1, eyebrow: "Sobre nós", title: "Tecnologia que transforma ideias em resultados", body: "A Asten conecta estratégia, tecnologia e execução para simplificar processos e acelerar negócios." },
  { id: 2, eyebrow: "O que fazemos", title: "Soluções pensadas para o seu negócio", body: "Projetos de ERP, automação, integração e inteligência artificial construídos ao redor dos seus desafios." },
  { id: 3, eyebrow: "Próximo passo", title: "Vamos construir o futuro juntos?", body: "Converse com nosso time e descubra como transformar seu próximo desafio em uma solução concreta." },
];

function Brand({ inverse = false }: { inverse?: boolean }) {
  return <div className={`brand ${inverse ? "brand-inverse" : ""}`}><span className="brand-mark">A</span><span>ASTEN</span><small>by AVMB GROUP</small></div>;
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [transcript, setTranscript] = useState("");
  const [projectName, setProjectName] = useState("Novo site Asten");
  const [siteTitle, setSiteTitle] = useState("Transformamos tecnologia em crescimento");
  const [siteSubtitle, setSiteSubtitle] = useState("Conte sua ideia. A Asten transforma em uma experiência digital clara, humana e pronta para evoluir.");
  const [sections, setSections] = useState<Section[]>(START_SECTIONS);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("Pronto para ouvir sua ideia");
  const [mobile, setMobile] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const wordCount = useMemo(() => transcript.trim() ? transcript.trim().split(/\s+/).length : 0, [transcript]);

  function toggleRecording() {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      setStatus("Áudio capturado. Revise o roteiro abaixo.");
      return;
    }
    const speechWindow = window as SpeechWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Seu navegador não oferece transcrição ao vivo. Digite ou cole o roteiro abaixo.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: SpeechResultEvent) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript + " ";
      setTranscript(text.trim());
    };
    recognition.onerror = () => { setRecording(false); setStatus("Não consegui acessar o microfone. Você pode escrever o roteiro."); };
    recognition.onend = () => setRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
    setStatus("Ouvindo… fale naturalmente sobre empresa, oferta e chamada final.");
  }

  function loadExample() {
    setTranscript(SAMPLE);
    setStatus("Exemplo carregado. Agora você pode gerar o site.");
  }

  function generateSite() {
    const sentences = transcript.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    if (!sentences.length) { setStatus("Grave ou escreva um roteiro antes de gerar."); return; }
    setSiteTitle(sentences[0].length < 75 ? sentences[0] : "Tecnologia que transforma negócios");
    setSiteSubtitle(sentences[1] || "Soluções digitais que conectam estratégia, pessoas e resultados.");
    const chunks = [sentences.slice(2,4), sentences.slice(4,6), sentences.slice(6)];
    setSections(START_SECTIONS.map((section, index) => ({ ...section, body: chunks[index].join(". ") || section.body })));
    setStep(2);
    setStatus("Site gerado. Edite os textos e acompanhe a prévia.");
  }

  function updateSection(id: number, key: "title" | "body", value: string) {
    setSections(current => current.map(s => s.id === id ? { ...s, [key]: value } : s));
  }

  function exportHtml() {
    const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${siteTitle}</title><style>body{margin:0;font-family:Arial;color:#174a78}header,section{padding:8vw}header{min-height:65vh;display:grid;place-content:center;background:#fff}h1{font-size:clamp(42px,7vw,88px);max-width:900px}p{font-size:20px;line-height:1.6;max-width:780px}.accent{height:18px;background:#ff7611}.dark{background:#073f63;color:white}</style><div class="accent"></div><header><small>ASTEN</small><h1>${siteTitle}</h1><p>${siteSubtitle}</p></header>${sections.map((s,i)=>`<section class="${i%2?'dark':''}"><small>${s.eyebrow}</small><h2>${s.title}</h2><p>${s.body}</p></section>`).join("")}</html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const link = document.createElement("a"); link.href = url; link.download = "site-asten.html"; link.click(); URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Brand />
        <div className="project"><span>Projeto</span><input aria-label="Nome do projeto" value={projectName} onChange={e=>setProjectName(e.target.value)} /></div>
        <button className="ghost-button" onClick={exportHtml}>Exportar site <span>↗</span></button>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="step-title"><span>0{step}</span><div><small>ETAPA ATUAL</small><strong>{step === 1 ? "Conte sua ideia" : "Edite seu site"}</strong></div></div>
          <div className="step-line"><i className="active"/><i className={step === 2 ? "active" : ""}/><i/></div>
          <nav>
            <button className={step === 1 ? "nav-active" : ""} onClick={()=>setStep(1)}><span>◉</span> Roteiro por áudio</button>
            <button className={step === 2 ? "nav-active" : ""} onClick={()=>setStep(2)}><span>✦</span> Conteúdo do site</button>
            <button onClick={()=>setStatus("Publicação será conectada na próxima evolução do MVP.")}><span>↗</span> Publicação</button>
          </nav>
          <div className="tip"><strong>Uma boa história começa simples.</strong><p>Fale sobre quem você é, o que oferece e o que quer que o visitante faça.</p></div>
        </aside>

        <section className="editor-panel">
          {step === 1 ? <>
            <div className="panel-heading"><div><p className="eyebrow">COMECE POR AQUI</p><h1>Transforme sua voz<br/>em um site.</h1><p>Grave um áudio contando sua ideia. Nós organizamos a narrativa e criamos a primeira versão para você.</p></div><div className="mini-shapes"><i/><i/><i/></div></div>
            <div className={`recorder ${recording ? "is-recording" : ""}`}>
              <button className="record-button" onClick={toggleRecording} aria-label={recording ? "Parar gravação" : "Iniciar gravação"}><span>{recording ? "■" : "●"}</span></button>
              <div><strong>{recording ? "Gravando agora" : "Gravar minha ideia"}</strong><p>{status}</p></div>
              <div className="waves">{[1,2,3,4,5,6,7,8,9,10,11,12].map(i=><i key={i}/>)}</div>
            </div>
            <div className="or"><span/>ou<span/></div>
            <label className="script-label"><span>ROTEIRO TRANSCRITO</span><button onClick={loadExample}>Usar um exemplo</button></label>
            <textarea value={transcript} onChange={e=>setTranscript(e.target.value)} placeholder="Sua transcrição aparecerá aqui. Você também pode digitar ou colar o roteiro…" />
            <div className="editor-footer"><span>{wordCount} palavras</span><button className="primary-button" onClick={generateSite}>Gerar meu site <b>→</b></button></div>
          </> : <>
            <div className="edit-heading"><p className="eyebrow">CONTEÚDO GERADO</p><h1>Ajuste a sua história.</h1><p>Edite cada bloco. A prévia é atualizada instantaneamente.</p></div>
            <label className="field"><span>Título principal</span><textarea value={siteTitle} onChange={e=>setSiteTitle(e.target.value)} /></label>
            <label className="field"><span>Texto de abertura</span><textarea value={siteSubtitle} onChange={e=>setSiteSubtitle(e.target.value)} /></label>
            {sections.map(section=><div className="section-editor" key={section.id}><small>{section.eyebrow}</small><input value={section.title} onChange={e=>updateSection(section.id,"title",e.target.value)} /><textarea value={section.body} onChange={e=>updateSection(section.id,"body",e.target.value)} /></div>)}
          </>}
        </section>

        <section className="preview-panel">
          <div className="preview-toolbar"><div><span className="status-dot"/> PRÉVIA AO VIVO</div><div className="view-toggle"><button className={!mobile ? "selected" : ""} onClick={()=>setMobile(false)}>▣</button><button className={mobile ? "selected" : ""} onClick={()=>setMobile(true)}>▯</button></div></div>
          <div className={`site-frame ${mobile ? "mobile" : ""}`}>
            <div className="mock-site">
              <header><Brand/><button>Fale com a gente</button></header>
              <section className="hero"><div className="hero-copy"><small>TECNOLOGIA • ESTRATÉGIA • RESULTADOS</small><h2>{siteTitle}</h2><p>{siteSubtitle}</p><a>Conheça nossas soluções <b>→</b></a></div><div className="brand-shapes"><i/><i/><i/></div></section>
              {sections.map((section,index)=><section className={`content-section ${index === 1 ? "dark-section" : ""}`} key={section.id}><small>{section.eyebrow}</small><h3>{section.title}</h3><p>{section.body}</p></section>)}
              <footer><Brand inverse/><span>ASTENSUITE.COM.BR</span></footer>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
