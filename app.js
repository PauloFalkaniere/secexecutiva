(function(){
  "use strict";

  /* ============================================================
     Helpers gerais
     ============================================================ */
  const uid = () => Math.random().toString(36).slice(2, 10);
  const todayISO = () => new Date().toISOString().slice(0, 10);
  function fmtDate(iso){
    if(!iso) return "—";
    try{
      const d = new Date(iso + "T00:00:00");
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString("pt-BR");
    }catch(e){ return iso; }
  }
  function fmtSize(bytes){
    if(bytes == null) return "";
    if(bytes < 1024) return bytes + " B";
    if(bytes < 1024*1024) return (bytes/1024).toFixed(0) + " KB";
    return (bytes/(1024*1024)).toFixed(1) + " MB";
  }
  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    }[c]));
  }
  /* Só aceita imagens embutidas (data URL base64) em formatos raster
     comuns. Os dados de logo/assinatura vêm do banco e são inseridos em
     atributos src/style: sem esta checagem, um valor adulterado (ex.:
     com aspas ou "javascript:") poderia injetar HTML/JS na página. */
  const SAFE_IMG_DATA_URL = /^data:image\/(png|jpe?g|gif|webp);base64,[A-Za-z0-9+\/]+=*$/i;
  function safeImg(url){
    return (typeof url === "string" && SAFE_IMG_DATA_URL.test(url)) ? url : "";
  }

  /* ============================================================
     Ícones (SVG inline, minimalistas)
     ============================================================ */
  const ICONS = {
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v9h4v-5h4v5h4v-9"/>',
    file: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M4 19c0-3 2.4-5 5-5s5 2 5 5"/><circle cx="17" cy="9.3" r="2.2"/><path d="M15.6 14.2c1.9.2 3.6 1.7 4 3.8"/>',
    layers: '<path d="M12 3l8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 16l8 4 8-4"/>',
    user: '<circle cx="12" cy="8.3" r="3.5"/><path d="M5 20c0-4 3-6.3 7-6.3s7 2.3 7 6.3"/>',
    graduation: '<path d="M3 8l9-4 9 4-9 4-9-4z"/><path d="M7 10.3v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4"/><path d="M21 8v6"/>',
    church: '<path d="M12 3l7 5H5z"/><path d="M5 10v9M9 10v9M15 10v9M19 10v9"/><path d="M4 19h16"/>',
    clipboard: '<rect x="6" y="4" width="12" height="17" rx="1.5"/><path d="M9 4V3.3A1.3 1.3 0 0110.3 2h3.4A1.3 1.3 0 0115 3.3V4"/><path d="M9 12.3l2 2 4-4.3"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.3M12 18.7V21M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M3 12h2.3M18.7 12H21M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    chevronDown: '<path d="M6 9l6 6 6-6"/>',
    chevronRight: '<path d="M9 6l6 6-6 6"/>',
    paperclip: '<path d="M8 12.5l6.2-6.2a3 3 0 114.2 4.2l-8.2 8.2a5 5 0 01-7.2-7l8-8"/>',
    download: '<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>',
    printer: '<path d="M7 8V3h10v5"/><rect x="5" y="8" width="14" height="8" rx="1"/><path d="M7 16v5h10v-5"/>',
    pencil: '<path d="M4 20l4-.8 11-11-3.2-3.2-11 11z"/><path d="M13.5 5.5l3 3"/>',
    check: '<path d="M5 12.5l4.5 4.5 9-10"/>',
    upload: '<path d="M12 15V3"/><path d="M7 8l5-5 5 5"/><path d="M5 21h14"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 9.5h17"/><path d="M8 3v4M16 3v4"/>',
    tag: '<path d="M11.5 3h-6a1 1 0 00-1 1v6a1 1 0 00.3.7l9 9a1 1 0 001.4 0l6.6-6.6a1 1 0 000-1.4l-9-9a1 1 0 00-.7-.3z"/><circle cx="7.3" cy="7.3" r="1.3"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.6-4.6"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    stamp: '<path d="M8 4h8v5a3 3 0 003 3H5a3 3 0 003-3z"/><path d="M6 12v4h12v-4"/><path d="M4 20h16"/><path d="M9 20v-2.5M15 20v-2.5"/>',
    sortAsc: '<path d="M7 4v16"/><path d="M4 7l3-3 3 3"/><path d="M13 8h7"/><path d="M13 13h5"/><path d="M13 18h3"/>',
    sortDesc: '<path d="M7 20V4"/><path d="M4 17l3 3 3-3"/><path d="M13 6h3"/><path d="M13 11h5"/><path d="M13 16h7"/>',
    filter: '<path d="M4 5h16l-6.5 7.5v5.5l-3 1.5v-7z"/>',
    shield: '<path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6"/>',
    archive: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/><path d="M10 12h4"/>',
  };
  function icon(name, size){
    size = size || 15;
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
  }

  /* ============================================================
     Download de anexos (capability "downloads" do visualizador)
     ============================================================ */
  let _downloadsNS = null, _downloadsChecked = false;
  async function getDownloads(){
    if (_downloadsChecked) return _downloadsNS;
    _downloadsChecked = true;
    try{
      if (window.claude && typeof window.claude.use === "function"){
        _downloadsNS = await window.claude.use("downloads");
      }
    }catch(e){ _downloadsNS = null; }
    return _downloadsNS;
  }
  /* Fora da pré-visualização do artefato (ex.: sistema hospedado no
     GitHub Pages) não existe window.claude — nesse caso baixamos o
     arquivo do jeito normal do navegador, via link temporário. */
  async function saveFile({ filename, data }){
    const dl = await getDownloads();
    if (dl) return dl.save({ filename, data });
    const blob = data instanceof Blob ? data : new Blob([data]);
    const url = URL.createObjectURL(blob);
    try{
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }
    return { status: "saved" };
  }

  /* ============================================================
     Modal genérico (visualizador de PDF, confirmações e avisos)
     Usamos um modal próprio em vez de confirm()/alert() nativos
     porque essas caixas de diálogo do navegador não funcionam
     dentro da pré-visualização do artefato.
     ============================================================ */
  function fecharModal(){
    const root = document.getElementById("modal-root");
    if (root) root.innerHTML = "";
    if (_modalObjectUrl){ URL.revokeObjectURL(_modalObjectUrl); _modalObjectUrl = null; }
  }
  let _modalObjectUrl = null;

  function confirmModal(message){
    return new Promise(resolve => {
      const root = document.getElementById("modal-root");
      if (!root){ resolve(false); return; }
      let resolvido = false;
      function finalizar(v){ if (resolvido) return; resolvido = true; root.innerHTML = ""; resolve(v); }
      root.innerHTML = `
        <div class="modal-backdrop" id="modal-backdrop">
          <div class="modal-box modal-box-sm" id="modal-box">
            <div class="modal-msg">${esc(message)}</div>
            <div class="modal-actions">
              <button class="btn" id="modal-cancel">Cancelar</button>
              <button class="btn btn-primary" id="modal-confirm">Confirmar</button>
            </div>
          </div>
        </div>
      `;
      document.getElementById("modal-backdrop").addEventListener("click", () => finalizar(false));
      document.getElementById("modal-box").addEventListener("click", e => e.stopPropagation());
      document.getElementById("modal-cancel").addEventListener("click", () => finalizar(false));
      document.getElementById("modal-confirm").addEventListener("click", () => finalizar(true));
    });
  }

  function alertModal(message){
    return new Promise(resolve => {
      const root = document.getElementById("modal-root");
      if (!root){ resolve(); return; }
      function finalizar(){ root.innerHTML = ""; resolve(); }
      root.innerHTML = `
        <div class="modal-backdrop" id="modal-backdrop">
          <div class="modal-box modal-box-sm" id="modal-box">
            <div class="modal-msg">${esc(message)}</div>
            <div class="modal-actions">
              <button class="btn btn-primary" id="modal-ok">OK</button>
            </div>
          </div>
        </div>
      `;
      document.getElementById("modal-backdrop").addEventListener("click", finalizar);
      document.getElementById("modal-box").addEventListener("click", e => e.stopPropagation());
      document.getElementById("modal-ok").addEventListener("click", finalizar);
    });
  }
  async function abrirVisualizadorAnexo(anexo){
    const root = document.getElementById("modal-root");
    if (!root) return;
    const ehPdf = (anexo.tipo === "application/pdf") || /\.pdf$/i.test(anexo.nome || "");
    if (!ehPdf){
      montarVisualizador(root, anexo, `<div class="modal-fallback">Visualização disponível apenas para arquivos PDF.<br>Use o botão de download para abrir este arquivo.</div>`);
      return;
    }
    montarVisualizador(root, anexo, `<div class="modal-fallback">Carregando o arquivo…</div>`);
    let blob = null;
    try{ blob = await obterArquivoAnexo(anexo); }
    catch(e){ console.warn("Falha ao baixar anexo", e); }
    if (!document.getElementById("modal-box")) return; // fechado enquanto carregava
    if (!blob){
      montarVisualizador(root, anexo, `<div class="modal-fallback">${anexoDisponivel(anexo)
        ? "Não foi possível carregar este arquivo agora. Verifique a conexão e tente novamente."
        : "Este arquivo não está mais guardado no sistema. Remova este anexo e anexe o PDF novamente."}</div>`);
      return;
    }
    /* Força o tipo PDF: um arquivo disfarçado (ex.: HTML com nome .pdf)
       nunca é interpretado como página dentro do nosso domínio. */
    _modalObjectUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
    montarVisualizador(root, anexo, `<iframe class="modal-pdf-frame" src="${_modalObjectUrl}" title="${esc(anexo.nome)}"></iframe>`);
  }
  /* Mostra um PDF gerado pelo sistema (ex.: etiquetas) no mesmo
     visualizador dos anexos, com uma dica opcional acima. */
  function abrirPdfNoVisualizador(blob, titulo, dica){
    const root = document.getElementById("modal-root");
    if (!root) return;
    fecharModal();
    _modalObjectUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
    montarVisualizador(root, { nome: titulo },
      `${dica ? `<div class="modal-hint">${icon("printer", 13)} ${esc(dica)}</div>` : ""}<iframe class="modal-pdf-frame" src="${_modalObjectUrl}" title="${esc(titulo)}"></iframe>`);
  }
  function montarVisualizador(root, anexo, corpo){
    root.innerHTML = `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-box modal-box-lg" id="modal-box">
          <div class="modal-head">
            <b>${esc(anexo.nome)}</b>
            <button class="btn-icon" id="modal-close" title="Fechar">${icon("x", 17)}</button>
          </div>
          ${corpo}
        </div>
      </div>
    `;
    document.getElementById("modal-backdrop").addEventListener("click", fecharModal);
    document.getElementById("modal-box").addEventListener("click", e => e.stopPropagation());
    document.getElementById("modal-close").addEventListener("click", fecharModal);
  }

  /* ============================================================
     Carimbo de protocolo em PDF (pdf-lib) e etiquetas em PDF (jsPDF)
     ============================================================ */
  async function carimbarPDF(arrayBuffer, info){
    try{
      if (!window.PDFLib) return null;
      const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const paginas = pdfDoc.getPages();
      if (paginas.length === 0) return null;
      const pagina = paginas[0];
      const { width, height } = pagina.getSize();
      const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const cor = rgb(0.118, 0.165, 0.243);
      const nomeSecretario = info.secretarioNome || info.secretarioCargo || "Secretário Executivo";
      const texto = `Protocolo: nº ${info.numero} - ${info.dataStr} - ${nomeSecretario}`;
      const margem = 14;
      const maxBoxW = Math.min(width - margem * 2, 340);
      let fontSize = 9;
      while (fontSize > 6 && fonte.widthOfTextAtSize(texto, fontSize) > maxBoxW - 16) fontSize -= 0.5;
      const textW = fonte.widthOfTextAtSize(texto, fontSize);
      const boxW = Math.min(maxBoxW, textW + 16);
      const boxH = 20;
      const x = width - boxW - margem;
      const y = height - boxH - margem;
      pagina.drawRectangle({ x, y, width: boxW, height: boxH, borderColor: cor, borderWidth: 1, color: rgb(1, 0.855, 0.235), opacity: 0.94 });
      pagina.drawText(texto, { x: x + 8, y: y + boxH / 2 - fontSize * 0.35, size: fontSize, font: fonte, color: cor });
      const bytes = await pdfDoc.save();
      return new Blob([bytes], { type: "application/pdf" });
    }catch(e){
      console.warn("Não foi possível carimbar o PDF", e);
      return null;
    }
  }

  function logoImageFormat(dataUrl){
    const m = /^data:image\/([a-zA-Z0-9+.-]+);base64,/.exec(dataUrl || "");
    if (!m) return "PNG";
    const t = m[1].toLowerCase();
    if (t.includes("jpeg") || t.includes("jpg")) return "JPEG";
    if (t.includes("webp")) return "WEBP";
    return "PNG";
  }

  /* Gera uma imagem PNG (fundo transparente) com o nome do secretário
     executivo escrito em estilo "letra de mão", para usar como
     assinatura nas etiquetas quando não há uma imagem enviada. Usar
     uma imagem (em vez de uma fonte customizada) faz a mesma assinatura
     funcionar tanto na etiqueta impressa (HTML) quanto na baixada em PDF. */
  async function gerarAssinaturaImagem(nome){
    if (!nome || !nome.trim()) return "";
    try{
      await document.fonts.load('700 64px "Dancing Script"');
      await document.fonts.ready;
    }catch(e){ /* segue mesmo se a fonte não carregar a tempo */ }
    const canvas = document.createElement("canvas");
    canvas.width = 640; canvas.height = 180;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '700 68px "Dancing Script", cursive';
    ctx.fillStyle = "#1E2A3E";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(nome.trim(), canvas.width / 2, canvas.height / 2 + 6);
    return canvas.toDataURL("image/png");
  }

  /* Sentença oficial da etiqueta, dividida em trechos normais e em
     negrito exatamente como no modelo do Word: "Compareceu à **I Reunião
     Extraordinária** do **Presbitério de São Paulo**, realizada no dia
     **26 de abril de 2025**, na **Companhia de Estágios**, como **membro
     efetivo**, conforme **art. 66, alínea “a”** da **CI/IPB**." */
  function montarSegmentosEtiqueta(r, gi){
    const cfg = STATE.config || {};
    const tipoReuniao = r.tipo && r.tipo.trim() ? r.tipo.trim() : "reunião";
    const presbiterio = cfg.nomePresbiterio || "presbitério";
    const segs = [
      { text: "Compareceu à ", bold: false },
      { text: tipoReuniao, bold: true },
      { text: ` do `, bold: false },
      { text: presbiterio, bold: true },
      { text: `, realizada ${diasDaReuniao(r).length > 1 ? "nos dias" : "no dia"} `, bold: false },
      { text: fmtPeriodoExtenso(r) || fmtDate(r.data), bold: true },
    ];
    if (r.local && r.local.trim()){
      segs.push({ text: ", na ", bold: false });
      segs.push({ text: r.local.trim(), bold: true });
    }
    segs.push({ text: ", como ", bold: false });
    segs.push({ text: gi.rotulo, bold: true });
    segs.push({ text: ", conforme ", bold: false });
    segs.push({ text: `art. 66, alínea \u201C${gi.alinea}\u201D`, bold: true });
    segs.push({ text: " da ", bold: false });
    segs.push({ text: "CI/IPB", bold: true });
    segs.push({ text: ".", bold: false });
    return segs;
  }

  /* Comissões (da própria reunião) das quais esta pessoa participou —
     incluindo a função de relator/sub-relator, quando indicada. */
  function participacoesComissoes(r, nomePessoa){
    return (r.comissoes || [])
      .filter(c => (c.membros || []).includes(nomePessoa) || c.relator === nomePessoa || c.subrelator === nomePessoa)
      .map(c => {
        let sufixo = "";
        if (c.relator === nomePessoa) sufixo = " - relator";
        else if (c.subrelator === nomePessoa) sufixo = " - subrelator";
        return `Participou da ${c.nome}${sufixo}`;
      });
  }

  /* Eleições registradas nesta reunião (Comissão Executiva, delegados
     ao Supremo Concílio e ao Sínodo) das quais esta pessoa foi eleita.
     A IPB não tem ordenação feminina, então o texto é sempre no
     masculino ("Eleito"), nunca "Eleito(a)". A eleição para um cargo
     da Comissão Executiva é para servir o presbitério, não a própria
     comissão — daí "Eleito ... do (sigla do presbitério)". */
  function participacoesEleicoes(r, nomePessoa){
    const cfg = STATE.config || {};
    return (r.eleicoes || [])
      .filter(e => e.nome === nomePessoa)
      .map(e => {
        const anos = mandatoAnosEleicao(e.tipo, e.cargo);
        const anoTexto = mandatoAnoTexto(e.ano, anos);
        const sufixoAno = anoTexto ? ` - ${anoTexto}` : "";
        if (e.tipo === "executiva") return `Eleito ${e.cargo} do ${cfg.sigla || cfg.nomePresbiterio || "presbitério"}${sufixoAno}`;
        if (e.tipo === "supremo") return `Eleito ${e.condicao || "delegado"} ao Supremo Concílio${sufixoAno}`;
        if (e.tipo === "sinodo") return `Eleito ${e.condicao || "delegado"} ao ${cfg.siglaSinodo || cfg.nomeSinodo || "Sínodo"}${sufixoAno}`;
        if (e.tipo === "fiscal") return `Eleito membro ${e.condicao || "titular"} do Conselho Fiscal${sufixoAno}`;
        if (e.tipo === "gestor") return `Eleito membro do Comitê Gestor${sufixoAno}`;
        return "";
      }).filter(Boolean);
  }

  /* Nomeações registradas nesta reunião (comissões permanentes,
     especiais e secretarias de causas) das quais esta pessoa
     participou — também sempre no masculino, pelo mesmo motivo. */
  function participacoesNomeacoes(r, nomePessoa){
    return (r.nomeacoes || [])
      .filter(n => n.nome === nomePessoa)
      .map(n => {
        const alvo = n.alvoNome || "—";
        if (n.papel === "relator") return `Nomeado para a ${alvo} - relator`;
        if (n.papel === "subrelator") return `Nomeado para a ${alvo} - subrelator`;
        if (n.papel === "secretario") return `Nomeado secretário da ${alvo}`;
        return `Nomeado para a ${alvo}`;
      });
  }

  /* Designação de campo (só na Reunião Ordinária de dezembro, para o
     ano seguinte). "local" é a igreja ou, conforme a designação, o
     campo de atuação / agência / instituição. */
  function textoDesignacao(d){
    const ano = d.ano ? ` - ${d.ano}` : "";
    const local = (d.local || "").trim();
    if (d.designacao === "Pastor Evangelista") return `Designado Pastor Evangelista${local ? " em " + local : ""}${ano}`;
    if (d.designacao === "Missionário") return `Designado Missionário${local ? " (" + local + ")" : ""}${ano}`;
    if (d.designacao === "Cedido") return `Cedido${local ? " para " + local : ""}${ano}`;
    return `Designado ${d.designacao || "Pastor Efetivo"}${local ? " da " + local : ""}${ano}`;
  }
  function participacoesDesignacoes(r, nomePessoa){
    if (!ehReuniaoDeDesignacoes(r)) return [];
    return (r.designacoes || []).filter(d => d.nome === nomePessoa).map(textoDesignacao);
  }
  /* Registro livre (qualquer outra decisão), exatamente como digitado. */
  function participacoesRegistros(r, nomePessoa){
    return (r.registros || []).filter(x => x.nome === nomePessoa && (x.texto || "").trim()).map(x => x.texto.trim());
  }

  /* Registros da etiqueta no formato do modelo: as comissões da reunião
     vão num bloco "Participou da Comissão:" (só o nome da comissão em
     cada linha); o resto (designação, eleições, nomeações, registro
     livre) vem antes, uma decisão por linha. */
  function registrosEtiqueta(r, nomePessoa){
    const comissoes = (r.comissoes || [])
      .filter(c => (c.membros || []).includes(nomePessoa) || c.relator === nomePessoa || c.subrelator === nomePessoa)
      .map(c => c.nome + (c.relator === nomePessoa ? " - relator" : c.subrelator === nomePessoa ? " - subrelator" : ""));
    return {
      outros: [
        ...participacoesDesignacoes(r, nomePessoa),
        ...participacoesEleicoes(r, nomePessoa),
        ...participacoesNomeacoes(r, nomePessoa),
        ...participacoesRegistros(r, nomePessoa),
      ],
      comissoes,
    };
  }


  /* Escreve um parágrafo com trechos em negrito e normal, quebrando
     linha manualmente e (opcionalmente) justificando — o jsPDF não
     resolve negrito misturado dentro de um único text(). Retorna a
     posição Y logo abaixo da última linha escrita. */
  /* Largura real do texto como ele é desenhado. O getTextWidth do jsPDF
     desconta o "kerning" de pares como "Te", mas o text() não aplica esse
     ajuste — medindo letra por letra a medida bate com o desenho e as
     palavras não encostam umas nas outras. */
  function larguraTexto(doc, t){
    let w = 0;
    for (const ch of String(t)) w += doc.getTextWidth(ch);
    return w;
  }
  function drawJustifiedMixedText(doc, segments, x, y, maxWidth, fontSize, lineHeight, justify, measureOnly, familia, estiloNegrito){
    const fam = familia || "helvetica", negrito = estiloNegrito || "bold";
    doc.setFontSize(fontSize);
    /* Cada "palavra" é uma lista de pedaços (negrito ou não). Um trecho
       que começa sem espaço gruda na palavra anterior — assim a vírgula
       depois de um nome em negrito não ganha um espaço antes dela. */
    const words = [];
    let colar = false;
    segments.forEach(seg => {
      const txt = String(seg.text);
      const partes = txt.split(" ");
      partes.forEach((w, k) => {
        if (!w.length) return;
        const run = { text: w, bold: !!seg.bold };
        if (k === 0 && colar && words.length) words[words.length - 1].push(run);
        else words.push([run]);
      });
      colar = txt.length > 0 && !txt.endsWith(" ");
    });
    function widthOf(w){
      return w.reduce((soma, run) => { doc.setFont(fam, run.bold ? negrito : "normal"); return soma + larguraTexto(doc, run.text); }, 0);
    }
    doc.setFont(fam, "normal");
    const spaceWidth = doc.getTextWidth(" ");
    let line = [], lineWidth = 0, cursorY = y;
    function flushLine(isLast){
      if (line.length === 0) return;
      const totalWordsWidth = line.reduce((soma, w) => soma + widthOf(w), 0);
      const gaps = line.length - 1;
      let gapWidth = spaceWidth;
      if (justify !== false && !isLast && gaps > 0){
        gapWidth = Math.max(spaceWidth * 0.5, (maxWidth - totalWordsWidth) / gaps);
      }
      let cx = x;
      line.forEach((w, i) => {
        w.forEach(run => {
          doc.setFont(fam, run.bold ? negrito : "normal");
          if (!measureOnly) doc.text(run.text, cx, cursorY);
          cx += larguraTexto(doc, run.text);
        });
        if (i < line.length - 1) cx += gapWidth;
      });
      cursorY += lineHeight;
      line = []; lineWidth = 0;
    }
    for (let i = 0; i < words.length; i++){
      const w = words[i];
      const ww = widthOf(w);
      const addWidth = lineWidth === 0 ? ww : lineWidth + spaceWidth + ww;
      if (addWidth > maxWidth && lineWidth > 0){
        flushLine(false);
        lineWidth = ww;
        line.push(w);
      } else {
        lineWidth = addWidth;
        line.push(w);
      }
    }
    flushLine(true);
    return cursorY;
  }

  /* ============================================================
     Etiquetas de presença — reprodução do modelo do Word
     ("Etiquetas - Conciliares - Modelo Geral.docx"):
     - A4 deitada, margens de 12,7 mm, 12 caixas de 63,55 × 53,11 mm
       (4 por linha), alinhadas à esquerda como no Word;
     - borda única verde #213315 de 4 pt, cantos retos (é a guia de corte);
     - margem interna de 2,54 mm nas laterais e 1,27 mm em cima;
     - logotipo, nome da pessoa (acréscimo), texto justificado de 7,5 pt,
       registros, "Participou da Comissão:" (8,5 pt, negrito) e, no pé,
       nome do secretário (7,5 pt) e "Secretário Executivo" (negrito).
     Medidas tiradas do .docx; posições conferidas contra o PDF do modelo.
     ============================================================ */
  const ETQ = {
    w: 63.55, h: 53.11, cols: 4, rows: 3,
    x0: 13.21, y0: 13.20,           // canto da caixa (meio da linha da borda)
    passoX: 68.62, passoY: 57.74,    // distância entre caixas, como no Word
    borda: 1.41, verde: [33, 51, 21],
    insetX: 2.54, insetY: 1.27,
    logoW: 34.4, logoH: 9.86,
    rodapeTopo: 42.27,               // topo da linha do nome do secretário (a partir do topo da caixa)
  };
  const PT = 0.3528; // mm por ponto

  function encaixarImagem(doc, dataUrl, maxW, maxH){
    let w = maxW, h = maxH;
    try{
      const p = doc.getImageProperties(dataUrl);
      const escala = Math.min(maxW / p.width, maxH / p.height);
      w = p.width * escala; h = p.height * escala;
    }catch(e){}
    return { w, h };
  }

  /* Quem recebe etiqueta: presente em pelo menos um dia da reunião.
     Ordem da chamada: ministros, igrejas, depois os demais grupos. */
  function presentesParaEtiqueta(r){
    const ordem = id => { const i = GRUPOS_REUNIAO.findIndex(g => g.id === id); return i < 0 ? 99 : i; };
    return (r.membros || [])
      .filter(m => presencaGeral(m, r) === "Presente")
      .map((m, i) => ({ m, i }))
      .sort((a, b) => ordem(a.m.grupo) - ordem(b.m.grupo) || a.i - b.i)
      .map(x => x.m);
  }

  /* Fonte própria da etiqueta (ex.: ZapfHumnst BT), enviada pelo usuário
     em Configurações gerais. Fica no Storage da conta (ou no navegador,
     no modo local) — nunca no repositório, que é público. */
  async function blobParaBase64(blob){
    const buf = new Uint8Array(await blob.arrayBuffer());
    let s = "";
    for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return btoa(s);
  }
  async function carregarFonteEtiqueta(doc){
    const f = (STATE.config || {}).fonteEtiqueta;
    if (!f || !f.normal) return { familia: "helvetica", temNegrito: true };
    try{
      const normal64 = await blobParaBase64(await obterArquivoAnexo(f.normal));
      doc.addFileToVFS("etiqueta-normal.ttf", normal64);
      doc.addFont("etiqueta-normal.ttf", "Etiqueta", "normal");
      let temNegrito = false;
      if (f.negrito){
        const negrito64 = await blobParaBase64(await obterArquivoAnexo(f.negrito));
        doc.addFileToVFS("etiqueta-negrito.ttf", negrito64);
        doc.addFont("etiqueta-negrito.ttf", "Etiqueta", "bold");
        temNegrito = true;
      }
      doc.setFont("Etiqueta", "normal"); doc.getTextWidth("teste"); // falha aqui se o arquivo for inválido
      return { familia: "Etiqueta", temNegrito };
    }catch(e){
      console.warn("Fonte da etiqueta não pôde ser usada; seguindo com Helvetica", e);
      return { familia: "helvetica", temNegrito: true, falhou: true };
    }
  }

  function desenharEtiqueta(doc, r, m, x, y, fonte){
    const cfg = STATE.config || {};
    const W = ETQ.w, H = ETQ.h;
    const fam = fonte.familia || "helvetica";
    const estiloNegrito = fonte.temNegrito === false ? "normal" : "bold";
    const usar = negrito => doc.setFont(fam, negrito ? estiloNegrito : "normal");

    /* caixa branca com borda verde de 4 pt */
    doc.setDrawColor(...ETQ.verde); doc.setLineWidth(ETQ.borda);
    doc.setFillColor(255, 255, 255);
    doc.rect(x, y, W, H, "FD");

    const left = x + ETQ.insetX, larg = W - 2 * ETQ.insetX, cx = x + W / 2;
    let topo = y + ETQ.insetY;
    doc.setTextColor(0, 0, 0);

    /* 0. logotipo centralizado */
    const logo = safeImg(cfg.logoDataUrl);
    if (logo){
      try{
        const t = encaixarImagem(doc, logo, ETQ.logoW, ETQ.logoH);
        doc.addImage(logo, logoImageFormat(logo), cx - t.w / 2, topo + (ETQ.logoH - t.h) / 2, t.w, t.h);
      }catch(e){}
      topo += ETQ.logoH + 0.35;
    }

    /* rodapé: nome do secretário + "Secretário Executivo", na posição do modelo */
    const rodTopo = y + ETQ.rodapeTopo;
    const passoRod = 7.5 * PT * 1.21;
    let limiteCorpo = rodTopo - 0.6;
    if (cfg.secretarioNome){
      usar(false); doc.setFontSize(7.5);
      doc.text(cfg.secretarioNome, cx, rodTopo + passoRod * 0.78, { align: "center" });
      usar(true);
      doc.text(cfg.secretarioCargo || "Secretário Executivo", cx, rodTopo + passoRod * 1.78, { align: "center" });
      const ass = safeImg(cfg.assinaturaImagemDataUrl);
      if (ass){
        try{
          const t = encaixarImagem(doc, ass, 26, 7.2);
          const yImg = rodTopo - t.h + 2.0; // a imagem tem margem transparente; encosta no nome
          doc.addImage(ass, logoImageFormat(ass), cx - t.w / 2, yImg, t.w, t.h);
          limiteCorpo = yImg + t.h * 0.2;
        }catch(e){}
      }
    }

    /* 1–5. nome, texto oficial, registros e comissões — tamanhos do
       modelo (nome 8,5 pt; texto 7,5 pt; título 8,5 pt), reduzidos juntos
       só se não couberem acima do rodapé. */
    const gi = GRUPOS_REUNIAO.find(g => g.id === m.grupo) || { alinea: "a", rotulo: "membro efetivo" };
    const segs = montarSegmentosEtiqueta(r, gi);
    const { outros, comissoes } = registrosEtiqueta(r, m.nome);
    function bloco(escala, medir){
      const fsNome = 8.5 * escala, fs = 7.5 * escala, fsTit = 8.5 * escala;
      const passo = fs * PT * 1.21, passoTit = fsTit * PT * 1.21;
      let t = topo;
      /* nome da pessoa, negrito, centralizado (até 2 linhas) */
      /* nome da pessoa, negrito, centralizado: diminui até caber numa
         linha (mínimo ~6,8 pt); se ainda não couber, quebra em duas */
      usar(true);
      let fsN = fsNome;
      doc.setFontSize(fsN);
      while (larguraTexto(doc, m.nome) > larg && fsN > 6.8 * escala){ fsN -= 0.1; doc.setFontSize(fsN); }
      const passoN = fsN * PT * 1.21;
      const linhasNome = larguraTexto(doc, m.nome) > larg ? doc.splitTextToSize(m.nome, larg).slice(0, 2) : [m.nome];
      linhasNome.forEach(l => { if (!medir) doc.text(l, cx, t + passoN * 0.78, { align: "center" }); t += passoN; });
      t += 2 * PT; // parágrafo vazio de 2 pt do modelo
      /* texto oficial justificado */
      t = drawJustifiedMixedText(doc, segs, left, t + passo * 0.78, larg, fs, passo, true, medir, fam, estiloNegrito) - passo * 0.78;
      if (outros.length || comissoes.length) t += 1 * PT; // parágrafo vazio de 1 pt
      outros.forEach(linha => {
        t = drawJustifiedMixedText(doc, [{ text: linha, bold: false }], left, t + passo * 0.78, larg, fs, passo, false, medir, fam, estiloNegrito) - passo * 0.78;
      });
      if (comissoes.length){
        usar(true); doc.setFontSize(fsTit);
        if (!medir) doc.text(comissoes.length > 1 ? "Participou das Comissões:" : "Participou da Comissão:", left, t + passoTit * 0.78);
        t += passoTit;
        comissoes.forEach(linha => {
          t = drawJustifiedMixedText(doc, [{ text: linha, bold: false }], left, t + passo * 0.78, larg, fs, passo, false, medir, fam, estiloNegrito) - passo * 0.78;
        });
      }
      return t;
    }
    let escala = 1;
    while (escala > 0.72 && bloco(escala, true) > limiteCorpo) escala -= 0.02;
    doc.setTextColor(0, 0, 0);
    bloco(escala, false);
  }

  async function gerarEtiquetasPDF(r){
    if (!window.jspdf || !r) return null;
    const presentes = presentesParaEtiqueta(r);
    if (presentes.length === 0) return null;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
    const fonte = await carregarFonteEtiqueta(doc);
    const porPagina = ETQ.cols * ETQ.rows;
    presentes.forEach((m, idx) => {
      const pos = idx % porPagina;
      if (idx > 0 && pos === 0) doc.addPage("a4", "landscape");
      const col = pos % ETQ.cols, lin = Math.floor(pos / ETQ.cols);
      desenharEtiqueta(doc, r, m, ETQ.x0 + col * ETQ.passoX, ETQ.y0 + lin * ETQ.passoY, fonte);
    });
    doc.setProperties({ title: `Etiquetas de presença — ${fmtPeriodoCurto(r)}` });
    if (fonte.falhou) showToast("A fonte da etiqueta não pôde ser usada; as etiquetas saíram em Helvetica.", "error");
    return doc;
  }

  function nomeArquivoEtiquetas(r){
    const dias = diasDaReuniao(r);
    return dias.length > 1 ? `etiquetas-${dias[0]}_a_${dias[dias.length - 1]}.pdf` : `etiquetas-${r.data}.pdf`;
  }

  async function baixarEtiquetas(r){
    if (!r) return;
    if (presentesParaEtiqueta(r).length === 0){ await alertModal("Ainda não há presentes registrados nesta reunião."); return; }
    const pdfDoc = await gerarEtiquetasPDF(r);
    if (!pdfDoc){ await alertModal("Não foi possível gerar o PDF das etiquetas agora."); return; }
    const blob = pdfDoc.output("blob");
    try{
      await saveFile({ filename: nomeArquivoEtiquetas(r), data: blob });
    }catch(err){
      const code = err && err.code;
      if (code === "rejected_extension" || code === "extension_not_enabled"){
        await alertModal("Esta pré-visualização não permite baixar arquivos PDF diretamente. Use o botão de impressão como alternativa.");
      } else if (code === "too_large"){
        await alertModal("O arquivo de etiquetas ficou grande demais para baixar (mais de 16 MB).");
      } else if (code === "declined"){
        /* usuário cancelou o download */
      } else {
        await alertModal("Não foi possível baixar as etiquetas agora. Tente novamente.");
      }
    }
  }

  /* Imprimir = abrir o mesmo PDF no visualizador do sistema, de onde se
     imprime com as medidas exatas (escolher "Tamanho real" / 100%). */
  async function imprimirEtiquetas(r){
    if (!r) return;
    if (presentesParaEtiqueta(r).length === 0){ await alertModal("Ainda não há presentes registrados nesta reunião."); return; }
    const pdfDoc = await gerarEtiquetasPDF(r);
    if (!pdfDoc){ await alertModal("Não foi possível gerar as etiquetas agora."); return; }
    abrirPdfNoVisualizador(pdfDoc.output("blob"), `Etiquetas — ${fmtPeriodoCurto(r)}`,
      "Na impressão, escolha papel A4, orientação paisagem e escala \"Tamanho real\" (100%). Recorte pela borda verde.");
  }

  /* ============================================================
     Persistência em nuvem (Supabase) — quando configurado (veja o
     README), cada usuário faz login e só enxerga os próprios
     dados, protegidos por Row Level Security no banco. Sem
     configuração (ex.: pré-visualização do artefato), o sistema
     cai automaticamente no modo local abaixo.
     ============================================================ */
  const SUPA_URL = window.SECEX_SUPABASE_URL || "";
  const SUPA_KEY = window.SECEX_SUPABASE_ANON_KEY || "";
  const CLOUD_ATIVO = !!(SUPA_URL && SUPA_KEY && window.supabase);
  const supa = CLOUD_ATIVO ? window.supabase.createClient(SUPA_URL, SUPA_KEY) : null;
  let CURRENT_USER = null;

  /* ============================================================
     Persistência local (IndexedDB — privada deste navegador).
     Usada quando o Supabase não está configurado.
     ============================================================ */
  const DB_NAME = "secex-db", DB_VERSION = 1, STORE = "kv";
  let dbPromise = null;
  function openDB(){
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) { reject(new Error("sem indexedDB")); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }
  async function dbGet(id){
    try{
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const r = tx.objectStore(STORE).get(id);
        r.onsuccess = () => resolve(r.result ? r.result.value : undefined);
        r.onerror = () => reject(r.error);
      });
    }catch(e){ console.warn("dbGet falhou", id, e); return undefined; }
  }
  async function dbSet(id, value){
    try{
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put({ id, value });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    }catch(e){ console.warn("dbSet falhou", id, e); return false; }
  }

  /* ============================================================
     Dados iniciais
     ============================================================ */
  // Toda conta nova começa vazia: os dados reais do presbitério (pastores,
  // igrejas, documentos históricos, etc.) são carregados pelo script
  // import_inicial.sql direto no banco de dados (Supabase) — veja o
  // README.md — e não ficam mais fixos aqui no código.
  const DEFAULTS = {
    pastores: [],
    igrejas: [],
    candidatos: [],
    documentosEntrada: [],
    documentosSaida: [],
    reunioes: [],
    tarefas: [],
    comissaoExecutiva: [],
    conselhoFiscal: [],
    comiteGestor: { membro1: "", membro2: "" },
    secretariasCausas: [],
    comissoesPermanentes: [],
    comissoesEspeciais: [],
    delegadosSupremo: [],
    delegadosSinodo: [],
    config: { nomePresbiterio: "Secretaria executiva", sigla: "SE", logoDataUrl: "", infoAdicional: "", secretarioNome: "", secretarioCargo: "Secretário Executivo", nomeSinodo: "", siglaSinodo: "", assinaturaTipo: "imagem", assinaturaImagemDataUrl: "" },
  };

  const STATE = {};
  let STORE_READY = false;

  async function loadAll(){
    let legadoDocumentos;
    if (CLOUD_ATIVO){
      const { data: row, error } = await supa
        .from("secex_data")
        .select("data")
        .eq("user_id", CURRENT_USER.id)
        .maybeSingle();
      if (error) console.warn("Falha ao carregar dados da nuvem", error);
      const saved = (row && row.data) || {};
      for (const key of Object.keys(DEFAULTS)){
        STATE[key] = saved[key] !== undefined ? saved[key] : DEFAULTS[key];
      }
      legadoDocumentos = saved.documentos;
      if (migrarDocumentosAntigos(legadoDocumentos)) await persistState();
      else if (!row) await persistState(); // primeiro acesso deste usuário: grava o estado inicial
    } else {
      for (const key of Object.keys(DEFAULTS)){
        const v = await dbGet(key);
        if (v === undefined){
          STATE[key] = DEFAULTS[key];
          dbSet(key, STATE[key]);
        } else {
          STATE[key] = v;
        }
      }
      legadoDocumentos = await dbGet("documentos");
      if (migrarDocumentosAntigos(legadoDocumentos)){
        dbSet("documentosEntrada", STATE.documentosEntrada);
        dbSet("documentosSaida", STATE.documentosSaida);
      }
    }
    migrarReunioesParaDias(); // só em memória; é gravado na próxima alteração
    STORE_READY = true;
  }

  /* Até esta versão, Entrada e Saída viviam juntas em um único array
     "documentos" (com um campo tipo). Agora são dois cadastros separados
     — STATE.documentosEntrada e STATE.documentosSaida — porque Saída não
     precisa de carimbo de PDF nem de vínculo com comissão. Quem já tinha
     dados no formato antigo (ex.: a importação inicial do histórico) tem
     eles migrados automaticamente aqui, uma única vez, na primeira carga
     após esta atualização. Retorna true se alguma migração foi feita. */
  function migrarDocumentosAntigos(legado){
    if (!Array.isArray(legado) || legado.length === 0) return false;
    if ((STATE.documentosEntrada && STATE.documentosEntrada.length) || (STATE.documentosSaida && STATE.documentosSaida.length)) return false;
    const entrada = [], saida = [];
    legado.forEach(d => {
      const { tipo, ...resto } = d;
      if (tipo === "Saída"){
        const { comissaoId, ...semComissao } = resto;
        saida.push({ ...semComissao, tipo: "Saída", etapa: d.etapa === "Recebido" ? "Enviado" : d.etapa, anexos: (d.anexos || []).map(a => ({ ...a, carimbado: false })) });
      } else {
        entrada.push({ ...resto, tipo: "Entrada", comissaoId: resto.comissaoId || "" });
      }
    });
    STATE.documentosEntrada = entrada;
    STATE.documentosSaida = saida;
    return true;
  }

  /* ============================================================
     Arquivos dos anexos
     - Modo nuvem: cada arquivo vai para o bucket privado "anexos" do
       Supabase Storage, na pasta <id do usuário>/. As regras do bucket
       (veja schema.sql) só deixam cada conta ler e apagar a própria
       pasta. Nos dados fica apenas o caminho (anexo.storagePath).
     - Modo local: o arquivo (Blob) fica no IndexedDB junto com os dados.
     ============================================================ */
  const ANEXOS_BUCKET = "anexos";
  const ANEXO_MAX_BYTES = 25 * 1024 * 1024; // mesmo limite do bucket
  const _anexoCache = new Map();

  function anexoDisponivel(anexo){
    return !!(anexo && (anexo.storagePath || anexo.arquivo instanceof Blob));
  }

  async function guardarArquivoAnexo(anexoId, nome, blob){
    if (!CLOUD_ATIVO) return { arquivo: blob };
    const ext = ((/\.([a-z0-9]{1,8})$/i.exec(nome || "") || [])[1] || "bin").toLowerCase();
    const caminho = `${CURRENT_USER.id}/${anexoId}.${ext}`;
    const { error } = await supa.storage.from(ANEXOS_BUCKET).upload(caminho, blob, {
      contentType: blob.type || "application/octet-stream", upsert: false,
    });
    if (error) throw error;
    _anexoCache.set(caminho, blob);
    return { storagePath: caminho };
  }

  async function obterArquivoAnexo(anexo){
    if (!anexo) return null;
    if (anexo.arquivo instanceof Blob) return anexo.arquivo;
    if (!anexo.storagePath || !CLOUD_ATIVO) return null;
    if (_anexoCache.has(anexo.storagePath)) return _anexoCache.get(anexo.storagePath);
    const { data, error } = await supa.storage.from(ANEXOS_BUCKET).download(anexo.storagePath);
    if (error) throw error;
    _anexoCache.set(anexo.storagePath, data);
    return data;
  }

  async function apagarArquivosAnexos(anexos){
    const caminhos = (anexos || []).map(a => a && a.storagePath).filter(Boolean);
    caminhos.forEach(c => _anexoCache.delete(c));
    if (!CLOUD_ATIVO || caminhos.length === 0) return;
    const { error } = await supa.storage.from(ANEXOS_BUCKET).remove(caminhos);
    if (error) console.warn("Não foi possível apagar arquivo(s) do Storage", error);
  }

  /* Grava o STATE inteiro em uma única linha do usuário logado (modo nuvem). */
  async function persistState(){
    if (!CLOUD_ATIVO || !CURRENT_USER) return false;
    /* O conteúdo dos anexos nunca vai para esta linha (ele fica no
       Supabase Storage); aqui só ficam nome, tamanho e caminho. */
    const dados = JSON.parse(JSON.stringify(STATE, (k, v) => k === "arquivo" ? undefined : v));
    const { error } = await supa
      .from("secex_data")
      .upsert({ user_id: CURRENT_USER.id, data: dados, updated_at: new Date().toISOString() });
    if (error) console.warn("Falha ao salvar na nuvem", error);
    return !error;
  }

  /* Mensagem de status (rodapé da tela) confirmando se a alteração foi
     salva ou apontando o erro, mostrada após cada alteração salva no
     armazenamento local deste navegador. */
  let toastTimer = null;
  function showToast(message, tipo){
    const root = document.getElementById("toast-root");
    if (!root) return;
    root.innerHTML = `<div class="toast toast-${tipo}" id="toast-atual">${icon(tipo === "success" ? "check" : "x", 14)} ${esc(message)}</div>`;
    const el = document.getElementById("toast-atual");
    requestAnimationFrame(() => el.classList.add("toast-show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove("toast-show");
      setTimeout(() => { if (root.firstChild === el) root.innerHTML = ""; }, 220);
    }, tipo === "success" ? 2200 : 4500);
  }

  /* Indicador fixo no topo: "Salvando…", "Salvo às 14:32" ou erro.
     Substitui o aviso que aparecia a cada clique; o aviso grande agora
     só aparece quando algo dá errado. */
  let saveState = { status: "idle", at: null }, pendingSaves = 0;
  function renderSaveStatus(){
    const el = document.getElementById("save-status");
    if (!el) return;
    el.className = "save-status" + (saveState.status === "saving" ? " is-saving" : saveState.status === "error" ? " is-error" : "");
    const hora = saveState.at ? saveState.at.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
    const texto = saveState.status === "saving" ? "Salvando…"
      : saveState.status === "error" ? "Não salvo — verifique a conexão"
      : saveState.status === "saved" ? `Salvo às ${hora}`
      : (CLOUD_ATIVO ? "Dados na nuvem" : "Dados neste navegador");
    el.innerHTML = `<span class="save-dot" aria-hidden="true"></span>${esc(texto)}`;
  }
  async function setSlice(key, value){
    STATE[key] = value;
    renderActiveTab();
    pendingSaves++;
    saveState = { status: "saving", at: saveState.at }; renderSaveStatus();
    const ok = CLOUD_ATIVO ? await persistState() : await dbSet(key, value);
    pendingSaves--;
    if (!ok){
      saveState = { status: "error", at: saveState.at };
      showToast("Não foi possível salvar as alterações agora. Elas podem se perder ao recarregar a página.", "error");
    } else if (pendingSaves === 0){
      saveState = { status: "saved", at: new Date() };
    }
    renderSaveStatus();
  }

  /* ============================================================
     Login / cadastro (somente quando o Supabase está configurado)
     ============================================================ */
  let authMode = "login", authError = "", authBusy = false;

  function renderAuthGate(){
    const app = document.getElementById("app");
    app.innerHTML = `
      <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;">
        <div class="section" style="max-width:380px; width:100%;">
          <div style="text-align:center; margin-bottom:18px;">
            <h1 style="font-family:var(--serif); font-size:20px; color:var(--ink); margin:0 0 4px;">Secretaria Executiva</h1>
            <p class="section-sub" style="margin:0;">${authMode === "signup" ? "Crie sua conta para começar" : "Entre para acessar seus dados"}</p>
          </div>
          ${authError ? `<div style="color:var(--seal); background:var(--seal-soft); border:1px solid var(--seal); border-radius:5px; padding:8px 10px; font-size:12.5px; margin-bottom:12px;">${esc(authError)}</div>` : ""}
          <div class="field-row">
            <label class="field-label">E-mail</label>
            <input type="text" id="auth-email" autocomplete="email" placeholder="voce@exemplo.com">
          </div>
          <div class="field-row">
            <label class="field-label">Senha</label>
            <input type="password" id="auth-senha" autocomplete="${authMode === "signup" ? "new-password" : "current-password"}" placeholder="${authMode === "signup" ? "Mínimo 8 caracteres" : "Sua senha"}">
          </div>
          <button class="btn btn-primary" id="auth-submit" style="width:100%; justify-content:center; margin-bottom:10px;" ${authBusy ? "disabled" : ""}>
            ${authBusy ? "Aguarde…" : (authMode === "signup" ? "Criar conta" : "Entrar")}
          </button>
          <div style="display:flex; justify-content:space-between; font-size:12px;">
            <button class="btn-icon" style="text-decoration:underline; padding:0;" id="auth-toggle">${authMode === "signup" ? "Já tenho conta" : "Criar uma conta"}</button>
            ${authMode !== "signup" ? `<button class="btn-icon" style="text-decoration:underline; padding:0;" id="auth-esqueci">Esqueci a senha</button>` : ""}
          </div>
        </div>
      </div>
    `;
    document.getElementById("auth-toggle").addEventListener("click", () => {
      authMode = authMode === "signup" ? "login" : "signup"; authError = ""; renderAuthGate();
    });
    const esqueci = document.getElementById("auth-esqueci");
    if (esqueci) esqueci.addEventListener("click", onEsqueciSenha);
    document.getElementById("auth-submit").addEventListener("click", onAuthSubmit);
    ["auth-email", "auth-senha"].forEach(id => {
      document.getElementById(id).addEventListener("keydown", e => { if (e.key === "Enter") onAuthSubmit(); });
    });
  }

  async function onAuthSubmit(){
    const email = document.getElementById("auth-email").value.trim();
    const senha = document.getElementById("auth-senha").value;
    if (!email || !senha){ authError = "Preencha e-mail e senha."; renderAuthGate(); return; }
    if (authMode === "signup" && senha.length < 8){ authError = "A senha precisa ter pelo menos 8 caracteres."; renderAuthGate(); return; }
    authBusy = true; authError = ""; renderAuthGate();
    const { data, error } = authMode === "signup"
      ? await supa.auth.signUp({ email, password: senha })
      : await supa.auth.signInWithPassword({ email, password: senha });
    authBusy = false;
    if (error){ authError = error.message; renderAuthGate(); return; }
    if (authMode === "signup" && data && !data.session){
      authMode = "login"; authError = "";
      await alertModal("Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.");
      renderAuthGate();
      return;
    }
    // A partir daqui, onAuthStateChange assume: carrega os dados e mostra o sistema.
  }

  async function onEsqueciSenha(){
    const email = document.getElementById("auth-email").value.trim();
    if (!email){ authError = "Digite seu e-mail acima e clique em \"Esqueci a senha\" de novo."; renderAuthGate(); return; }
    const { error } = await supa.auth.resetPasswordForEmail(email);
    await alertModal(error ? "Não foi possível enviar o e-mail de redefinição agora." : "Se este e-mail estiver cadastrado, você vai receber um link para redefinir a senha.");
  }

  async function logout(){
    if (CLOUD_ATIVO) await supa.auth.signOut();
  }

  /* ============================================================
     Etiquetas (pills)
     ============================================================ */
  function pillHtml(label, tone, opts){
    opts = opts || {};
    const wm = (opts.watermark && STATE.config && safeImg(STATE.config.logoDataUrl))
      ? `<span class="pill-wm" style="background-image:url('${safeImg(STATE.config.logoDataUrl)}')"></span>` : "";
    const dot = opts.dot ? '<span class="pill-dot"></span>' : "";
    return `<span class="pill pill-${tone}">${wm}${dot}<span class="pill-label">${esc(label)}</span></span>`;
  }

  /* ============================================================
     Impressão
     ============================================================ */
  function letterheadHtml(){
    const cfg = STATE.config || {};
    const logo = cfg.logoDataUrl
      ? `<img class="ph-logo" src="${safeImg(cfg.logoDataUrl)}" alt="">`
      : `<div class="ph-logo-fallback">${esc(cfg.sigla || "SE")}</div>`;
    return `<div class="print-letterhead">${logo}<div><div class="ph-name">${esc(cfg.nomePresbiterio || "Secretaria executiva")}</div><div class="ph-sub">Documento gerado em ${fmtDate(todayISO())}</div></div></div>`;
  }
  function printDoc(titulo, innerHtml, opts){
    opts = opts || {};
    const area = document.getElementById("print-area");
    const wm = (opts.watermark && STATE.config && STATE.config.logoDataUrl)
      ? `<div class="print-watermark" style="background-image:url('${safeImg(STATE.config.logoDataUrl)}')"></div>` : "";
    area.innerHTML = `${wm}<div class="print-page"><h1 class="print-title">${esc(titulo)}</h1>${letterheadHtml()}<div class="print-body">${innerHtml}</div></div>`;
    window.print();
  }

  /* ============================================================
     Navegação / render
     ============================================================ */
  /* ============================================================
     Constantes de domínio (compartilhadas entre abas)
     ============================================================ */
  /* Documentos de Entrada e Saída são dois cadastros separados
     (STATE.documentosEntrada / STATE.documentosSaida) com necessidades
     diferentes: Saída não passa por carimbo de PDF nem é vinculada a
     comissão, então tem sua própria lista de etapas (sem "Em análise na
     comissão") e etapa inicial ("Enviado" em vez de "Recebido"). */
  const ETAPAS = ["Recebido", "Encaminhado à reunião", "Em análise na comissão", "Resposta emitida", "Arquivado"];
  const ETAPAS_SAIDA = ["Enviado", "Encaminhado à reunião", "Resposta emitida", "Arquivado"];
  const ETAPAS_HOME = ["Recebido", "Enviado", "Encaminhado à reunião", "Em análise na comissão", "Resposta emitida", "Arquivado"];
  const ETAPA_TONE = { "Recebido": "seal", "Enviado": "seal", "Encaminhado à reunião": "gold", "Em análise na comissão": "gold", "Resposta emitida": "green", "Arquivado": "muted" };
  function etapasPorTipo(tipo){ return tipo === "Saída" ? ETAPAS_SAIDA : ETAPAS; }
  const FASES = ["Candidato", "Licenciado", "Ordenado"];
  const FASE_TONE = { "Candidato": "muted", "Licenciado": "gold", "Ordenado": "green" };
  const STATUS_PASTOR = ["Ativo", "Licenciado", "Emérito", "Transferido"];
  const STATUS_TONE = { "Ativo": "green", "Licenciado": "gold", "Emérito": "muted", "Transferido": "seal" };
  const PRESENCA_OPCOES = ["Presente", "Ausente", "Justificado"];
  const PRESENCA_TONE = { "Presente": "green", "Ausente": "seal", "Justificado": "gold" };
  const ANEXO_ACCEPT = ".pdf,application/pdf";

  function origemLabel(doc){ return doc.origemNome || doc.origem || "—"; }

  const DESIGNACOES = ["Pastor Efetivo", "Pastor Auxiliar", "Pastor Evangelista", "Missionário", "Cedido"];
  const DESIGNACAO_INFO = {
    "Pastor Efetivo": { artigo: 'Art. 33, § 1º e Art. 34, "a"' },
    "Pastor Auxiliar": { artigo: 'Art. 33, § 2º' },
    "Pastor Evangelista": { artigo: 'Art. 33, § 3º e Art. 34, "d"', extraField: "campoAtuacao", extraLabel: "Campo de atuação" },
    "Missionário": { artigo: 'Art. 33, § 4º e Art. 34, "e"', extraField: "agenciaMissionaria", extraLabel: "Agência missionária" },
    "Cedido": { artigo: "Art. 37", extraField: "cedidoPara", extraLabel: "Instituição para a qual foi cedido" },
  };

  const GRUPO_EFETIVOS = ["Ministros", "Igrejas"];
  const GRUPOS_REUNIAO = [
    { id: "Ministros", label: "Ministros", categoria: 'Membros Efetivos (Art. 66, "a")', auto: true, alinea: "a", rotulo: "membro efetivo" },
    { id: "Igrejas", label: "Igrejas", categoria: 'Membros Efetivos (Art. 66, "a")', auto: true, alinea: "a", rotulo: "membro efetivo" },
    { id: "ExOfficio", label: 'Membros Ex Officio (Art. 66, "b")', categoria: null, auto: false, alinea: "b", rotulo: "membro ex officio" },
    { id: "Correspondentes", label: 'Membros Correspondentes (Art. 66, "c")', categoria: null, auto: false, alinea: "c", rotulo: "membro correspondente" },
    { id: "Visitantes", label: 'Membros Visitantes (Art. 66, "d")', categoria: null, auto: false, alinea: "d", rotulo: "membro visitante" },
  ];

  function allComissoes(){
    return (STATE.reunioes || []).flatMap(r => (r.comissoes || []).map(c => ({ id: c.id, nome: c.nome, membros: c.membros, reuniaoData: r.data, reuniaoTipo: r.tipo })));
  }

  /* -- membros efetivos, em âmbito geral do presbitério (não apenas de
     uma reunião): pastores cadastrados + presbíteros representantes e
     suplentes das igrejas. Usado para restringir quem pode compor
     comissões permanentes/especiais e para os seletores de eleição e
     nomeação. -- */
  function membrosEfetivosGlobais(){
    const pastoresNomes = (STATE.pastores || []).map(p => p.nome).filter(Boolean);
    const presbiterosNomes = (STATE.igrejas || []).flatMap(i => [i.representante, ...(i.suplentes || [])]).filter(v => v && v.trim());
    return [...new Set([...pastoresNomes, ...presbiterosNomes])];
  }

  /* -- cargos predefinidos da Comissão Executiva. Todos os mandatos são
     anuais, exceto o de Secretário Executivo, que dura três anos. -- */
  const CARGOS_EXECUTIVOS = ["Presidente", "Vice-Presidente", "Secretário Executivo", "1º Secretário", "2º Secretário", "Tesoureiro"];
  function mandatoAnos(cargo){ return cargo === "Secretário Executivo" ? 3 : 1; }

  /* Duração do mandato conforme o tipo de eleição: cargos da Comissão
     Executiva seguem mandatoAnos(cargo); delegados ao Sínodo cumprem
     biênio (2 anos); delegados ao Supremo Concílio cumprem quadriênio
     (4 anos). */
  function mandatoAnosEleicao(tipo, cargo){
    if (tipo === "executiva") return mandatoAnos(cargo);
    if (tipo === "sinodo") return 2;
    if (tipo === "supremo") return 4;
    return 1;
  }
  /* "ano" aqui é sempre o ANO DA ELEIÇÃO — o mandato começa no ano
     seguinte (ex.: eleito em 2025, cumpre o mandato a partir de 2026). */
  function mandatoAnoTexto(anoEleicao, anos){
    const anoEl = Number(anoEleicao) || null;
    if (!anoEl) return "";
    const anoIni = anoEl + 1;
    return anos > 1 ? `${anoIni}–${anoIni + anos}` : `${anoIni}`;
  }

  /* ============================================================
     Reuniões em mais de um dia
     - r.data    = data de início (continua sendo usada para ordenar etc.)
     - r.dataFim = data de término (opcional; vazio = reunião de um dia)
     - m.presencas = { "AAAA-MM-DD": "Presente" | "Ausente" | "Justificado" }
       (chamada por dia); m.presenca guarda o resumo de todos os dias.
     ============================================================ */
  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  function addDiasISO(iso, n){
    const d = new Date(iso + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function diasDaReuniao(r){
    if (!r || !/^\d{4}-\d{2}-\d{2}$/.test(r.data || "")) return [];
    const fim = (r.dataFim && r.dataFim > r.data) ? r.dataFim : r.data;
    const dias = [];
    for (let d = r.data; d <= fim && dias.length < 31; d = addDiasISO(d, 1)) dias.push(d);
    return dias;
  }
  function presencaNoDia(m, dia){ return (m.presencas && m.presencas[dia]) || "Ausente"; }
  /* Presente se esteve em pelo menos um dia; senão Justificado se
     justificou algum; senão Ausente. Só contam os dias da reunião. */
  function presencaGeral(m, r){
    const st = diasDaReuniao(r).map(d => presencaNoDia(m, d));
    if (st.includes("Presente")) return "Presente";
    if (st.includes("Justificado")) return "Justificado";
    return "Ausente";
  }
  function partesData(iso){ const [a, mm, d] = iso.split("-").map(Number); return { a, m: mm, d }; }
  function diaOrdinal(d){ return d === 1 ? "1º" : String(d); }
  function fmtDiaSemana(iso){
    const p = partesData(iso);
    return `${DIAS_SEMANA[new Date(Date.UTC(p.a, p.m - 1, p.d)).getUTCDay()]} ${String(p.d).padStart(2, "0")}/${String(p.m).padStart(2, "0")}`;
  }
  /* Período por extenso, para a etiqueta: "26 de abril de 2025",
     "25 e 26 de abril de 2025", "25 a 27 de abril de 2025",
     "30 de abril e 1º de maio de 2025". */
  function fmtPeriodoExtenso(r){
    const dias = diasDaReuniao(r);
    if (dias.length === 0) return "";
    const i = partesData(dias[0]), f = partesData(dias[dias.length - 1]);
    const ext = p => `${diaOrdinal(p.d)} de ${MESES[p.m - 1]}`;
    if (dias.length === 1) return `${ext(i)} de ${i.a}`;
    const lig = dias.length === 2 ? " e " : " a ";
    if (i.a !== f.a) return `${ext(i)} de ${i.a}${lig}${ext(f)} de ${f.a}`;
    if (i.m !== f.m) return `${ext(i)}${lig}${ext(f)} de ${f.a}`;
    return `${diaOrdinal(i.d)}${lig}${ext(f)} de ${f.a}`;
  }
  /* Período curto, para listas e seletores: "26/04/2025",
     "25 e 26/04/2025", "25 a 27/04/2025", "30/04 a 02/05/2025". */
  function fmtPeriodoCurto(r){
    const dias = diasDaReuniao(r);
    if (dias.length <= 1) return fmtDate(r && r.data);
    const i = partesData(dias[0]), f = partesData(dias[dias.length - 1]);
    const dd = n => String(n).padStart(2, "0");
    const lig = dias.length === 2 ? " e " : " a ";
    if (i.a !== f.a) return `${fmtDate(dias[0])}${lig}${fmtDate(dias[dias.length - 1])}`;
    if (i.m !== f.m) return `${dd(i.d)}/${dd(i.m)}${lig}${dd(f.d)}/${dd(f.m)}/${f.a}`;
    return `${dd(i.d)}${lig}${dd(f.d)}/${dd(f.m)}/${f.a}`;
  }
  /* A designação de campo só é feita na Reunião Ordinária de dezembro
     (vale para o ano seguinte). Detecta automaticamente pelo tipo e mês,
     mas pode ser ligada/desligada à mão em cada reunião. */
  function ehReuniaoDeDesignacoes(r){
    if (!r) return false;
    if (typeof r.ordinariaAnual === "boolean") return r.ordinariaAnual;
    const tipo = r.tipo || "";
    return /ordin[aá]ria/i.test(tipo) && !/extra/i.test(tipo) && /^\d{4}-12-/.test(r.data || "");
  }
  /* Reuniões gravadas antes da chamada por dia: a presença única vira a
     presença do único dia. Retorna true se algo mudou. */
  function migrarReunioesParaDias(){
    let mudou = false;
    STATE.reunioes = (STATE.reunioes || []).map(r => {
      if (!(r.membros || []).some(m => !m.presencas)) return r;
      mudou = true;
      return { ...r, membros: r.membros.map(m => m.presencas ? m : { ...m, presencas: r.data ? { [r.data]: m.presenca || "Ausente" } : {} }) };
    });
    return mudou;
  }

  const TABS = {}; // preenchido abaixo, um bloco por aba

  const NAV = [
    { id: "inicio", label: "Início", icon: "home" },
    { id: "protocolo", label: "Protocolo", icon: "file" },
    { id: "reunioes", label: "Reuniões", icon: "users" },
    { id: "tarefas", label: "Tarefas", icon: "clipboard" },
    { id: "config", label: "Meu presbitério", icon: "church" },
  ];

  let activeTab = "inicio";

  function renderShell(){
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="topbar">
        <div class="topbar-inner">
          <div class="brand">
            <div class="brand-mark" id="brand-mark"></div>
            <div>
              <h1 class="brand-title" id="brand-title">Secretaria executiva</h1>
              <p class="brand-sub">Protocolo, reuniões, comissões, cadastros e decisões do presbitério</p>
            </div>
          </div>
          <div class="topbar-actions">
            <span class="save-status" id="save-status" role="status" aria-live="polite"></span>
            ${CLOUD_ATIVO && CURRENT_USER && CURRENT_USER.email ? `<span class="topbar-email">${esc(CURRENT_USER.email)}</span>` : ""}
            ${CLOUD_ATIVO ? `<button class="btn-topbar" id="btn-logout">Sair</button>` : ""}
          </div>
        </div>
      </div>
      <div class="navbar"><div class="navbar-inner" id="nav-buttons"></div></div>
      <div class="content" id="tab-content"></div>
    `;
    renderNav();
    renderBrand();
    renderActiveTab();
    renderSaveStatus();
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) btnLogout.addEventListener("click", logout);
  }

  function renderBrand(){
    const cfg = STATE.config || {};
    document.getElementById("brand-title").textContent = cfg.nomePresbiterio || "Secretaria executiva";
    const mark = document.getElementById("brand-mark");
    mark.innerHTML = safeImg(cfg.logoDataUrl) ? `<img src="${safeImg(cfg.logoDataUrl)}" alt="">` : esc(cfg.sigla || "SE");
  }

  function renderNav(){
    const wrap = document.getElementById("nav-buttons");
    wrap.innerHTML = NAV.map(t => `
      <button class="nav-btn ${t.id === activeTab ? "active" : ""}" data-nav="${t.id}" ${t.id === activeTab ? 'aria-current="page"' : ""}>
        ${icon(t.icon, 14)} ${esc(t.label)}
      </button>
    `).join("");
    wrap.querySelectorAll("[data-nav]").forEach(btn => {
      btn.addEventListener("click", () => {
        activeTab = btn.getAttribute("data-nav");
        renderNav();
        renderActiveTab();
        window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
      });
    });
  }

  /* Cada alteração redesenha a aba inteira. Para não "perder o lugar",
     guardamos qual campo estava em foco (e a posição do cursor) e a
     rolagem da página, e restauramos tudo depois de redesenhar. */
  function seletorDoElemento(el){
    if (!el || el === document.body) return null;
    if (el.id) return "#" + CSS.escape(el.id);
    for (const at of el.attributes){
      if (at.name.startsWith("data-")) return `${el.tagName.toLowerCase()}[${at.name}="${CSS.escape(at.value)}"]`;
    }
    return null;
  }
  function renderActiveTab(){
    const container = document.getElementById("tab-content");
    if (!container) return;
    const tab = TABS[activeTab];
    if (!tab) { container.innerHTML = ""; return; }
    const ativo = document.activeElement;
    const sel = container.contains(ativo) ? seletorDoElemento(ativo) : null;
    let cursor = null;
    try{ if (sel && typeof ativo.selectionStart === "number") cursor = [ativo.selectionStart, ativo.selectionEnd]; }catch(e){}
    const scrollY = window.scrollY;
    container.innerHTML = "";
    tab.mount(container);
    renderBrand();
    window.scrollTo(0, scrollY);
    if (sel){
      const novo = container.querySelector(sel);
      if (novo && typeof novo.focus === "function"){
        novo.focus({ preventScroll: true });
        if (cursor){ try{ novo.setSelectionRange(cursor[0], cursor[1]); }catch(e){} }
      }
    }
  }

  function sectionShell(container, { icon: ic, title, sub, actions }, bodyBuilder){
    container.innerHTML = `
      <div class="section">
        <div class="section-head">
          <div class="section-head-left">
            <span class="section-icon">${icon(ic, 18)}</span>
            <div>
              <h3 class="section-title">${esc(title)}</h3>
              ${sub ? `<p class="section-sub">${esc(sub)}</p>` : ""}
            </div>
          </div>
          <div class="section-actions">${actions || ""}</div>
        </div>
        <div class="section-body"></div>
      </div>
    `;
    bodyBuilder(container.querySelector(".section-body"));
  }

  /* ---------- INÍCIO (painel/resumo) ---------- */
  TABS.inicio = {
    mount(container){
      const docs = [...(STATE.documentosEntrada || []), ...(STATE.documentosSaida || [])];
      const reunioes = STATE.reunioes || [];
      const tarefas = STATE.tarefas || [];
      const pastores = STATE.pastores || [];
      const igrejas = STATE.igrejas || [];
      const candidatos = STATE.candidatos || [];

      const porEtapa = {};
      ETAPAS_HOME.forEach(e => porEtapa[e] = 0);
      docs.forEach(d => { porEtapa[d.etapa] = (porEtapa[d.etapa] || 0) + 1; });
      const emAndamento = docs.filter(d => d.etapa !== "Arquivado" && d.etapa !== "Resposta emitida").length;

      const hoje = todayISO();
      const futuras = reunioes.filter(r => (r.dataFim || r.data) >= hoje).sort((a,b) => a.data.localeCompare(b.data));
      const proxima = futuras[0];

      const pendentes = tarefas.filter(t => t.status !== "Concluído");
      const atrasadas = pendentes.filter(t => t.prazo && t.prazo < hoje);

      const ativos = pastores.filter(p => p.status === "Ativo").length;

      container.innerHTML = `
        <div class="section">
          <div class="section-head">
            <div class="section-head-left">
              <span class="section-icon">${icon("home", 18)}</span>
              <div>
                <h3 class="section-title">Painel do presbitério</h3>
                <p class="section-sub">Panorama rápido do que está em andamento</p>
              </div>
            </div>
          </div>
          <div class="stat-grid">
            <div class="stat-tile ${emAndamento > 0 ? "tone-gold" : "tone-green"}">
              <div class="stat-num">${emAndamento}</div>
              <div class="stat-label">Documentos em trâmite</div>
              <div class="stat-sub">${porEtapa["Recebido"]} recebido(s) · ${porEtapa["Enviado"]} enviado(s) · ${porEtapa["Em análise na comissão"]} em comissão</div>
            </div>
            <div class="stat-tile ${atrasadas.length > 0 ? "tone-seal" : ""}">
              <div class="stat-num">${pendentes.length}</div>
              <div class="stat-label">Tarefas pendentes</div>
              <div class="stat-sub">${atrasadas.length > 0 ? atrasadas.length + " em atraso" : "nenhuma em atraso"}</div>
            </div>
            <div class="stat-tile ${proxima ? "tone-gold" : ""}">
              <div class="stat-num" style="font-size:18px;">${proxima ? esc(fmtPeriodoCurto(proxima)) : "—"}</div>
              <div class="stat-label">Próxima reunião</div>
              <div class="stat-sub">${proxima ? esc(proxima.local || "local a definir") : (reunioes.length ? "sem reuniões futuras agendadas" : "nenhuma reunião cadastrada")}</div>
            </div>
            <div class="stat-tile tone-green">
              <div class="stat-num">${ativos}<span style="font-size:14px;color:var(--muted);">/${pastores.length}</span></div>
              <div class="stat-label">Ministros ativos</div>
              <div class="stat-sub">${igrejas.length} igreja(s) · ${candidatos.length} candidato(s)</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-head">
            <div class="section-head-left">
              <span class="section-icon">${icon("file", 18)}</span>
              <div><h3 class="section-title">Documentos por etapa</h3></div>
            </div>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${ETAPAS_HOME.map(e => `<div class="row-card" style="flex:1 1 150px; cursor:pointer;" data-etapa-home="${esc(e)}" title="Ver documentos desta etapa"><span>${esc(e)}</span>${pillHtml(String(porEtapa[e]), ETAPA_TONE[e])}</div>`).join("")}
          </div>
          ${docs.length === 0 ? '<p class="empty-note">Nenhum documento protocolado ainda.</p>' : ""}
        </div>

        <div class="section">
          <div class="section-head">
            <div class="section-head-left">
              <span class="section-icon">${icon("clipboard", 18)}</span>
              <div><h3 class="section-title">Tarefas em atraso</h3></div>
            </div>
          </div>
          ${atrasadas.length === 0
            ? '<p class="empty-note">Nenhuma tarefa em atraso — tudo em dia.</p>'
            : `<div class="list-col">${atrasadas.map(t => `
                <div class="row-card">
                  <span>${esc(t.titulo)}</span>
                  <span style="display:flex; gap:10px; align-items:center;">
                    <span style="color:var(--muted); font-size:12px;">${esc(t.responsavel || "sem responsável")}</span>
                    ${pillHtml("prazo " + fmtDate(t.prazo), "seal")}
                  </span>
                </div>`).join("")}</div>`
          }
        </div>
      `;

      container.querySelectorAll("[data-etapa-home]").forEach(el => el.addEventListener("click", () => {
        if (TABS.protocolo && TABS.protocolo.abrirDocsEtapaModal) TABS.protocolo.abrirDocsEtapaModal(el.getAttribute("data-etapa-home"));
      }));
    }
  };

  /* @@TAB_INICIO@@ */

  TABS.protocolo = (function(){
    let subTab = "Entrada";
    let aberto = null;
    let form = { assunto: "", origemNome: "" };
    let filtro = { origem: "", assunto: "", ano: "" };
    let filtrosAbertos = false;
    let ordemCrescente = false;
    let selecionados = new Set();
    let bulkEtapa = "", bulkReuniao = "", bulkComissao = "";
    const notaDraft = {};
    const respostaDraft = {};

    /* Entrada e Saída viraram duas sub-abas dentro do Protocolo — trocar de
       sub-aba reinicia os estados de tela (documento aberto, filtros,
       seleção em massa) para não misturar contexto de um tipo com o outro. */
    function trocarSubTab(novo){
      if (subTab === novo) return;
      subTab = novo;
      aberto = null;
      form = { assunto: "", origemNome: "" };
      filtro = { origem: "", assunto: "", ano: "" };
      filtrosAbertos = false;
      selecionados = new Set();
      bulkEtapa = ""; bulkReuniao = ""; bulkComissao = "";
      renderActiveTab();
    }

    /* Documentos de Saída usam vocabulário diferente dos de Entrada: o que
       seria "Recebido"/"Origem" vira "Enviado"/"Destinatário". O valor
       gravado no campo etapa continua sendo sempre "Recebido" internamente
       (só a etiqueta exibida muda) para não duplicar a lógica de filtros,
       arquivamento etc. */
    function rotulosPorTipo(tipo){
      const isSaida = tipo === "Saída";
      return {
        isSaida,
        tituloAba: isSaida ? "Documentos de Saída" : "Documentos de Entrada",
        origemPalavra: isSaida ? "Destinatário" : "Origem",
        origemPlaceholderForm: isSaida ? "Destinatário — digite ou busque um pastor/igreja" : "Origem / remetente — digite ou busque um pastor/igreja",
        origemPlaceholderFiltro: isSaida ? "Filtrar por destinatário" : "Filtrar por origem/remetente",
        dataPalavra: isSaida ? "Enviado em" : "Recebido em",
        verboProtocolo: isSaida ? "enviado" : "recebido",
        subSub: isSaida ? "Do envio à resposta: acompanhe cada etapa do trâmite" : "Do recebimento à resposta: acompanhe cada etapa do trâmite",
      };
    }

    /* O ano de um documento é sempre o ano de recebimento/emissão
       (dataRecebimento), não a data de hoje — é ele que define tanto
       em qual ano o número do protocolo foi contado quanto o filtro
       por ano. */
    function anoDoDoc(doc){ return (doc.dataRecebimento || "").slice(0, 4); }

    function anosDisponiveis(){
      const anos = new Set(docs().map(anoDoDoc).filter(Boolean));
      return Array.from(anos).sort((a, b) => b.localeCompare(a));
    }

    /* Exibição sempre pelo número do protocolo — primeiro pelo ano,
       depois pelo número dentro daquele ano — na direção escolhida
       em ordemCrescente (botão de ordenação). */
    function ordenarPorNumero(lista){
      const sinal = ordemCrescente ? 1 : -1;
      return [...lista].sort((a, b) => {
        const anoA = parseInt(anoDoDoc(a) || "0", 10), anoB = parseInt(anoDoDoc(b) || "0", 10);
        if (anoA !== anoB) return (anoA - anoB) * sinal;
        const numA = parseInt((a.numero || "").split("/")[0] || "0", 10);
        const numB = parseInt((b.numero || "").split("/")[0] || "0", 10);
        return (numA - numB) * sinal;
      });
    }

    /* Usada pelos popups de consulta (arquivados / por etapa), que sempre
       mostram do mais novo para o mais antigo independente do botão de
       ordenação da lista principal. */
    function ordenarPorNumeroDesc(lista){
      return [...lista].sort((a, b) => {
        const anoA = parseInt(anoDoDoc(a) || "0", 10), anoB = parseInt(anoDoDoc(b) || "0", 10);
        if (anoA !== anoB) return anoB - anoA;
        const numA = parseInt((a.numero || "").split("/")[0] || "0", 10);
        const numB = parseInt((b.numero || "").split("/")[0] || "0", 10);
        return numB - numA;
      });
    }

    /* Entrada e Saída são dois cadastros separados no banco de dados
       (STATE.documentosEntrada / STATE.documentosSaida) — Saída não tem
       carimbo de PDF nem vínculo com comissão, então cada um tem seu
       próprio array em vez de compartilhar uma lista com um campo "tipo"
       de filtro. Cada documento ainda guarda um campo tipo (só para saber
       em qual dos dois arrays gravá-lo de volta), mas nunca é usado para
       misturar os dois cadastros numa mesma lista. */
    function arrayKey(tipo){ return tipo === "Saída" ? "documentosSaida" : "documentosEntrada"; }
    function docsDe(tipo){ return STATE[arrayKey(tipo)] || []; }
    function docs(){ return docsDe(subTab); }
    function docsTodos(){ return [...docsDe("Entrada"), ...docsDe("Saída")]; }

    function docsArquivados(tipo){ return docsDe(tipo).filter(d => d.etapa === "Arquivado"); }
    /* Documentos arquivados ficam ocultos da lista padrão — só se acessa por
       eles pelo botão "Arquivados" (popup de consulta). Exceção: se o
       documento aberto (expandido) no momento for um arquivado — por ter
       sido acessado a partir do popup — ele continua aparecendo, senão o
       clique no popup abriria um card que some da lista na hora. */
    function docsFiltrados(){
      const origemBusca = filtro.origem.trim().toLowerCase();
      const assuntoBusca = filtro.assunto.trim().toLowerCase();
      const filtrados = docs().filter(d => {
        if (d.id === aberto) return true;
        if (d.etapa === "Arquivado") return false;
        if (filtro.ano && anoDoDoc(d) !== filtro.ano) return false;
        if (origemBusca && !origemLabel(d).toLowerCase().includes(origemBusca)) return false;
        if (assuntoBusca && !(d.assunto || "").toLowerCase().includes(assuntoBusca)) return false;
        return true;
      });
      return ordenarPorNumero(filtrados);
    }
    function filtroAtivo(){ return !!(filtro.origem.trim() || filtro.ano || filtro.assunto.trim()); }

    function update(doc){ const key = arrayKey(doc.tipo); setSlice(key, docsDe(doc.tipo).map(d => d.id === doc.id ? doc : d)); }
    async function remove(id){
      if(!(await confirmModal("Excluir este documento do protocolo?"))) return;
      const doc = docs().find(d => d.id === id);
      if (doc) apagarArquivosAnexos(doc.anexos);
      setSlice(arrayKey(subTab), docs().filter(d => d.id !== id));
    }

    function logar(doc, texto, patch){
      update({ ...doc, ...(patch || {}), historico: [...doc.historico, { data: todayISO(), texto }] });
    }

    /* Cada cadastro (Entrada/Saída) tem sua própria contagem de número, e
       essa contagem recomeça a cada ano (é sequencial só dentro do
       ano — 001/2025, 002/2025... e no ano seguinte volta pro 001).
       Usamos o maior número já existente naquele cadastro+ano (e não
       apenas a quantidade de documentos) para nunca repetir um
       número depois de uma exclusão ou de uma importação com
       números não sequenciais. */
    function proximoNumero(tipo, ano){
      const doTipoAno = docsDe(tipo).filter(d => anoDoDoc(d) === ano);
      const maior = doTipoAno.reduce((m, d) => {
        const match = /^(\d+)\//.exec(d.numero || "");
        const n = match ? parseInt(match[1], 10) : 0;
        return Math.max(m, n);
      }, 0);
      return `${String(maior + 1).padStart(3, "0")}/${ano}`;
    }

    function add(){
      if (!form.assunto.trim()) return;
      const dataRecebimento = todayISO();
      const numero = proximoNumero(subTab, anoDoDoc({ dataRecebimento }));
      const rot = rotulosPorTipo(subTab);
      const novo = {
        id: uid(), tipo: subTab, numero,
        etapa: rot.isSaida ? "Enviado" : "Recebido",
        reuniaoId: "",
        ...(rot.isSaida ? {} : { comissaoId: "" }),
        respostaTexto: "", respostaData: "",
        anexos: [],
        historico: [{ data: dataRecebimento, texto: `Documento ${rot.verboProtocolo} e protocolado pela secretaria executiva` }],
        dataRecebimento,
        assunto: form.assunto, origemNome: form.origemNome,
      };
      setSlice(arrayKey(subTab), [novo, ...docs()]);
      form = { assunto: "", origemNome: "" };
      renderActiveTab();
    }

    async function downloadAnexo(anexo){
      if (!anexoDisponivel(anexo)){
        await alertModal(`"${anexo.nome}" não está mais guardado no sistema. Remova este anexo e anexe o arquivo novamente.`);
        return;
      }
      try{
        const blob = await obterArquivoAnexo(anexo);
        if (!blob) throw new Error("arquivo indisponível");
        await saveFile({ filename: anexo.nome, data: blob });
      }catch(err){
        const code = err && err.code;
        if (code === "rejected_extension" || code === "extension_not_enabled"){
          await alertModal(`Esta pré-visualização não permite baixar arquivos PDF diretamente. O arquivo continua guardado aqui.`);
        } else if (code === "too_large"){
          await alertModal(`"${anexo.nome}" passa de 16 MB e não pode ser baixado por aqui.`);
        } else if (code === "declined"){
          /* usuário cancelou o download, nada a fazer */
        } else {
          await alertModal(`Não foi possível baixar "${anexo.nome}" agora. Tente novamente.`);
        }
      }
    }

    /* Documentos de Saída não passam por carimbo (o carimbo do protocolo só
       faz sentido para algo que chegou e precisa de comprovação de
       recebimento), então também não ficam restritos a PDF — qualquer
       arquivo pode ser anexado. Só documentos de Entrada exigem PDF e
       recebem o carimbo automático. */
    async function anexarArquivos(doc, fileList){
      const isSaida = doc.tipo === "Saída";
      const arquivos = Array.from(fileList);
      const invalidos = [];
      const validos = [];
      const falhas = [];
      const grandes = [];
      for (const f of arquivos){
        if (f.size > ANEXO_MAX_BYTES){ grandes.push(f.name); continue; }
        if (!isSaida){
          const ehPdf = f.type === "application/pdf" || /\.pdf$/i.test(f.name);
          if (!ehPdf){ invalidos.push(f.name); continue; }
        }
        let arquivoFinal = f, carimbado = false;
        if (!isSaida){
          try{
            const buf = await f.arrayBuffer();
            const cfgAtual = STATE.config || {};
            const numeroAtual = doc.numero;
            const stamped = await carimbarPDF(buf, {
              numero: numeroAtual,
              dataStr: fmtDate(todayISO()),
              secretarioNome: cfgAtual.secretarioNome,
              secretarioCargo: cfgAtual.secretarioCargo,
            });
            if (stamped){ arquivoFinal = stamped; carimbado = true; }
          }catch(e){ console.warn("Não foi possível carimbar o anexo, mantendo o arquivo original", e); }
        }
        const id = uid();
        try{
          if (CLOUD_ATIVO) showToast(`Enviando "${f.name}"…`, "success");
          const guardado = await guardarArquivoAnexo(id, f.name, arquivoFinal);
          validos.push({ id, nome: f.name, tipo: f.type || "application/octet-stream", tamanho: arquivoFinal.size, carimbado, ...guardado });
        }catch(e){
          console.warn("Falha ao enviar anexo", e);
          falhas.push(f.name);
        }
      }
      if (grandes.length){
        await alertModal(`Arquivo(s) maior(es) que 25 MB não foram anexados: ${grandes.join(", ")}`);
      }
      if (falhas.length){
        await alertModal(`Não foi possível enviar: ${falhas.join(", ")}. Verifique a conexão e tente novamente.`);
      }
      if (invalidos.length){
        await alertModal(`Só é possível anexar arquivos em PDF, para que o carimbo do protocolo seja aplicado automaticamente. Não anexado(s): ${invalidos.join(", ")}`);
      }
      if (validos.length === 0) return;
      const nomes = validos.map(n => n.nome).join(", ");
      const doc2 = docs().find(d => d.id === doc.id) || doc;
      logar(doc2, `${validos.length > 1 ? validos.length + " anexos adicionados" : "Anexo adicionado"}: ${nomes}`, { anexos: [...(doc2.anexos || []), ...validos] });
    }
    function removerAnexo(doc, anexoId){
      const anexo = (doc.anexos || []).find(a => a.id === anexoId);
      if (anexo) apagarArquivosAnexos([anexo]);
      logar(doc, `Anexo removido: ${anexo ? anexo.nome : ""}`, { anexos: (doc.anexos || []).filter(a => a.id !== anexoId) });
    }

    function printList(){
      const base = docsFiltrados();
      const rot = rotulosPorTipo(subTab);
      const rows = base.map(d => `
        <tr>
          <td>${esc(d.numero)}</td><td>${esc(d.assunto)}</td><td>${esc(origemLabel(d))}</td>
          <td>${esc(d.etapa)}</td><td>${fmtDate(d.dataRecebimento)}</td>
        </tr>`).join("");
      printDoc(`Relação de ${rot.tituloAba.toLowerCase()}${filtroAtivo() ? " (filtrada)" : ""}`, `
        <table class="print-table"><thead><tr><th>Nº</th><th>Assunto</th><th>${esc(rot.origemPalavra)}</th><th>Etapa</th><th>${esc(rot.dataPalavra)}</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="5">Nenhum documento protocolado.</td></tr>`}</tbody></table>
      `);
    }

    /* tipoFiltro é opcional: quando vem do botão "Arquivados" dentro de uma
       sub-aba, restringe ao tipo daquela sub-aba; quando vem do painel
       inicial ("Documentos por etapa"), mostra Entrada e Saída juntos. */
    function abrirDocsEtapaModal(etapa, tipoFiltro){
      const root = document.getElementById("modal-root");
      if (!root) return;
      let base = (tipoFiltro ? docsDe(tipoFiltro) : docsTodos()).filter(d => d.etapa === etapa);
      const lista = ordenarPorNumeroDesc(base);
      const tituloTexto = tipoFiltro ? `${etapa} — ${rotulosPorTipo(tipoFiltro).tituloAba}` : etapa;
      const linhas = lista.map(d => `
        <div class="row-card" data-abrir-doc-modal="${d.id}" style="cursor:pointer;">
          <div style="display:flex; align-items:center; gap:10px; min-width:0;">
            <code class="doc-num">${esc(d.numero)}</code>
            <span style="font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(d.assunto)}</span>
            <span style="color:var(--muted); font-size:11.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(origemLabel(d))}</span>
          </div>
          <span style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
            <span style="color:var(--muted); font-size:11.5px;">${fmtDate(d.dataRecebimento)}</span>
            ${icon("chevronRight", 14)}
          </span>
        </div>
      `).join("");
      root.innerHTML = `
        <div class="modal-backdrop" id="modal-backdrop">
          <div class="modal-box" id="modal-box">
            <div class="modal-head">
              <b>${esc(tituloTexto)} (${lista.length})</b>
              <button class="btn-icon" id="modal-close" title="Fechar">${icon("x", 17)}</button>
            </div>
            <div style="overflow:auto; padding:14px; display:flex; flex-direction:column; gap:6px;">
              ${lista.length === 0 ? `<p class="empty-note">Nenhum documento nesta etapa.</p>` : linhas}
            </div>
          </div>
        </div>
      `;
      document.getElementById("modal-backdrop").addEventListener("click", fecharModal);
      document.getElementById("modal-box").addEventListener("click", e => e.stopPropagation());
      document.getElementById("modal-close").addEventListener("click", fecharModal);
      root.querySelectorAll("[data-abrir-doc-modal]").forEach(el => el.addEventListener("click", () => {
        const id = el.getAttribute("data-abrir-doc-modal");
        const doc = base.find(d => d.id === id);
        fecharModal();
        if (doc) subTab = doc.tipo === "Saída" ? "Saída" : "Entrada";
        aberto = id;
        activeTab = "protocolo";
        renderNav();
        renderActiveTab();
      }));
    }

    function cardHtml(doc, reunioes, comissoesTodas){
      const isOpen = aberto === doc.id;
      const rot = rotulosPorTipo(doc.tipo);
      return `
        <div class="acc-card" data-doc="${doc.id}">
          <div class="acc-head" data-toggle="${doc.id}">
            <div style="display:flex; align-items:center; gap:10px; min-width:0;">
              <input type="checkbox" data-select-doc="${doc.id}" ${selecionados.has(doc.id) ? "checked" : ""} title="Selecionar para ação em massa" style="width:auto; margin:0; flex-shrink:0;">
              ${icon(isOpen ? "chevronDown" : "chevronRight", 14)}
              <code class="doc-num">${esc(doc.numero)}</code>
              <span style="font-size:13.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(doc.assunto)}</span>
              <span style="color:var(--muted); font-size:11.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex-shrink:1;">${esc(origemLabel(doc))}</span>
              ${(doc.anexos && doc.anexos.length) ? `<span style="color:var(--muted); display:inline-flex; align-items:center; gap:3px; font-size:11.5px; flex-shrink:0;">${icon("paperclip", 12)} ${doc.anexos.length}</span>` : ""}
            </div>
            <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
              ${pillHtml(doc.etapa, ETAPA_TONE[doc.etapa])}
              <button class="btn-icon" data-remove="${doc.id}" title="Excluir">${icon("trash", 14)}</button>
            </div>
          </div>
          ${isOpen ? `
          <div class="acc-body">
            <div style="display:flex; gap:16px; margin:12px 0; font-size:12.5px; color:var(--muted); flex-wrap:wrap;">
              <span>${esc(rot.origemPalavra)}: <b style="color:var(--ink);">${esc(origemLabel(doc))}</b></span>
              <span>Tipo: <b style="color:var(--ink);">${esc(doc.tipo)}</b></span>
              <span>${esc(rot.dataPalavra)}: <b style="color:var(--ink);">${fmtDate(doc.dataRecebimento)}</b></span>
              ${doc.reuniaoRef ? `<span>Reunião (histórico): <b style="color:var(--ink);">${esc(doc.reuniaoRef)}</b></span>` : ""}
            </div>

            <div style="display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">
              <span style="font-size:12.5px; color:var(--muted);">Etapa:</span>
              <select style="width:auto;" data-etapa="${doc.id}">
                ${etapasPorTipo(doc.tipo).map(et => `<option value="${esc(et)}" ${et === doc.etapa ? "selected" : ""}>${esc(et)}</option>`).join("")}
              </select>
              <select style="width:auto;" data-reuniao="${doc.id}">
                <option value="">Vincular reunião...</option>
                ${reunioes.map(r => `<option value="${r.id}" ${doc.reuniaoId === r.id ? "selected" : ""}>Reunião ${esc(fmtPeriodoCurto(r))}</option>`).join("")}
              </select>
              ${doc.tipo !== "Saída" ? `
              <select style="width:auto;" data-comissao="${doc.id}">
                <option value="">Vincular comissão...</option>
                ${comissoesTodas.map(c => `<option value="${c.id}" ${doc.comissaoId === c.id ? "selected" : ""}>${esc(c.nome)} — ${fmtDate(c.reuniaoData)}</option>`).join("")}
              </select>` : ""}
            </div>

            <div style="margin-bottom:14px;">
              <p style="font-size:12px; color:var(--muted); margin:0 0 6px; font-weight:600;">Anexos</p>
              <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
                ${(doc.anexos || []).length === 0 ? '<span class="empty-note" style="margin:0;">Nenhum arquivo anexado.</span>' : (doc.anexos || []).map(a => `
                  <span class="attach-chip">
                    ${icon("file", 13)}
                    <a href="#" data-download="${doc.id}:${a.id}">${esc(a.nome)}</a>
                    <span class="attach-size">${fmtSize(a.tamanho)}</span>
                    ${a.carimbado ? `<span title="Carimbado com o protocolo">${icon("stamp", 12)}</span>` : ""}
                    ${anexoDisponivel(a) ? "" : `<span class="attach-lost" title="O arquivo se perdeu numa versão anterior do sistema. Remova e anexe de novo.">arquivo perdido — anexe novamente</span>`}
                    <button class="btn-icon" style="padding:0;" data-visualizar-anexo="${doc.id}:${a.id}" title="Visualizar">${icon("eye", 13)}</button>
                    <button class="btn-icon" style="padding:0;" data-remove-anexo="${doc.id}:${a.id}" title="Remover anexo">${icon("x", 12)}</button>
                  </span>
                `).join("")}
              </div>
              <label class="btn btn-sm" style="cursor:pointer;">
                ${doc.tipo === "Saída" ? `${icon("upload", 13)} Anexar arquivo` : `${icon("upload", 13)} Anexar PDF (recebe o carimbo do protocolo)`}
                <input type="file" multiple ${doc.tipo === "Saída" ? "" : `accept="${ANEXO_ACCEPT}"`} data-anexar="${doc.id}" style="display:none;">
              </label>
            </div>

            ${doc.respostaTexto ? `
              <div style="background:var(--green-soft); border:1px solid var(--green); border-radius:5px; padding:10px; margin-bottom:12px; font-size:13px;">
                <b style="color:var(--green);">Resposta (${fmtDate(doc.respostaData)}):</b> ${esc(doc.respostaTexto)}
              </div>
            ` : `
              <div style="display:flex; gap:8px; margin-bottom:12px;">
                <input placeholder="Redigir resposta ao documento..." data-resposta-input="${doc.id}" value="${esc(respostaDraft[doc.id] || "")}">
                <button class="btn btn-sm" data-emitir="${doc.id}">Emitir resposta</button>
              </div>
            `}

            <div>
              <p style="font-size:12px; color:var(--muted); margin:0 0 6px; font-weight:600;">Histórico de andamento</p>
              <div class="list-col" style="margin-bottom:8px;">
                ${doc.historico.map(h => `<div style="font-size:12.5px; color:var(--ink-soft); display:flex; gap:8px;"><span style="color:var(--muted); min-width:78px;">${fmtDate(h.data)}</span><span>${esc(h.texto)}</span></div>`).join("")}
              </div>
              <div style="display:flex; gap:8px;">
                <input placeholder="Registrar observação de andamento" data-nota-input="${doc.id}" value="${esc(notaDraft[doc.id] || "")}">
                <button class="btn btn-sm" data-anotar="${doc.id}">${icon("plus", 13)} Anotar</button>
              </div>
            </div>
          </div>` : ""}
        </div>
      `;
    }

    function aplicarEtapaEmMassa(etapa){
      if (!etapa || selecionados.size === 0) return;
      selecionados.forEach(id => {
        const doc = docs().find(d => d.id === id);
        if (doc && doc.etapa !== etapa) logar(doc, `Etapa alterada para "${etapa}" (ação em massa)`, { etapa });
      });
      renderActiveTab();
    }
    function aplicarReuniaoEmMassa(reuniaoId){
      if (!reuniaoId || selecionados.size === 0) return;
      const r = (STATE.reunioes || []).find(x => x.id === reuniaoId);
      selecionados.forEach(id => {
        const doc = docs().find(d => d.id === id);
        if (doc) logar(doc, `Encaminhado à reunião de ${r ? fmtPeriodoCurto(r) : "—"} (ação em massa)`, { reuniaoId });
      });
      renderActiveTab();
    }
    function aplicarComissaoEmMassa(comissaoId){
      if (!comissaoId || selecionados.size === 0) return;
      const c = allComissoes().find(x => x.id === comissaoId);
      selecionados.forEach(id => {
        const doc = docs().find(d => d.id === id);
        if (doc) logar(doc, `Encaminhado à ${c ? c.nome : "comissão"} para análise (ação em massa)`, { comissaoId });
      });
      renderActiveTab();
    }

    return {
      mount(container){
        const list = docsFiltrados();
        const rot = rotulosPorTipo(subTab);
        const arquivados = docsArquivados(subTab);
        const totalDocs = docs().filter(d => d.etapa !== "Arquivado").length;
        const totalEntrada = docsDe("Entrada").filter(d => d.etapa !== "Arquivado").length;
        const totalSaida = docsDe("Saída").filter(d => d.etapa !== "Arquivado").length;
        const reunioes = STATE.reunioes || [];
        const comissoesTodas = allComissoes();
        const pastores = STATE.pastores || [];
        const igrejas = STATE.igrejas || [];
        // remove da seleção qualquer documento que não esteja mais na lista
        // visível (ex.: depois de mudar a etapa dele para "Arquivado")
        const idsVisiveis = new Set(list.map(d => d.id));
        Array.from(selecionados).forEach(id => { if (!idsVisiveis.has(id)) selecionados.delete(id); });
        const todosVisiveisSelecionados = list.length > 0 && list.every(d => selecionados.has(d.id));

        container.innerHTML = `
          <div class="section">
            <div class="section-head">
              <div class="section-head-left">
                <span class="section-icon">${icon("file", 18)}</span>
                <div>
                  <h3 class="section-title">Protocolo de documentos</h3>
                  <p class="section-sub">${esc(rot.subSub)}</p>
                </div>
              </div>
              <div class="section-actions">
                <button class="btn" id="btn-arquivados">${icon("archive", 13)} Arquivados (${arquivados.length})</button>
                <button class="btn" id="btn-ordenar" title="${ordemCrescente ? "Ordem crescente" : "Ordem decrescente"}">${icon(ordemCrescente ? "sortAsc" : "sortDesc", 13)} ${ordemCrescente ? "Crescente" : "Decrescente"}</button>
                <button class="btn ${filtrosAbertos || filtroAtivo() ? "btn-primary" : ""}" id="btn-toggle-filtros">${icon("filter", 13)} Filtros</button>
                <button class="btn" id="btn-print-docs">${icon("printer", 13)} Imprimir relação</button>
              </div>
            </div>

            <div style="display:flex; gap:6px; margin-bottom:16px;">
              <button class="btn btn-sm ${subTab === "Entrada" ? "btn-primary" : ""}" data-subtab-protocolo="Entrada">${icon("download", 13)} Documentos de Entrada (${totalEntrada})</button>
              <button class="btn btn-sm ${subTab === "Saída" ? "btn-primary" : ""}" data-subtab-protocolo="Saída">${icon("upload", 13)} Documentos de Saída (${totalSaida})</button>
            </div>

            <div style="display:grid; grid-template-columns:1.6fr 1.3fr auto; gap:8px; margin-bottom:14px;">
              <input placeholder="Assunto do documento" id="in-assunto" value="${esc(form.assunto)}">
              <span style="position:relative;">
                <input placeholder="${esc(rot.origemPlaceholderForm)}" id="in-origem" list="origem-datalist" value="${esc(form.origemNome)}" style="padding-left:28px;">
                <span style="position:absolute; left:8px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none;">${icon("search", 13)}</span>
                <datalist id="origem-datalist">
                  ${pastores.map(p => `<option value="${esc(p.nome)}">`).join("")}
                  ${igrejas.map(i => `<option value="${esc(i.nome)}">`).join("")}
                </datalist>
              </span>
              <button class="btn btn-primary" id="btn-add-doc">${icon("plus", 14)} Protocolar</button>
            </div>

            ${(filtrosAbertos || filtroAtivo()) ? `
            <div style="display:grid; grid-template-columns:1.2fr 0.8fr 1.2fr auto; gap:8px; margin-bottom:14px; padding:10px; background:var(--parchment-card); border:1px solid var(--line); border-radius:6px;">
              <span style="position:relative;">
                ${icon("search", 12)}
                <input placeholder="${esc(rot.origemPlaceholderFiltro)}" id="filtro-origem" style="padding-left:26px;" value="${esc(filtro.origem)}">
                <span style="position:absolute; left:8px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none;">${icon("search", 12)}</span>
              </span>
              <select id="filtro-ano">
                <option value="" ${filtro.ano===""?"selected":""}>Todo período</option>
                ${anosDisponiveis().map(a => `<option value="${a}" ${filtro.ano===a?"selected":""}>${a}</option>`).join("")}
              </select>
              <input placeholder="Filtrar por ementa / título" id="filtro-assunto" value="${esc(filtro.assunto)}">
              <button class="btn btn-sm" id="filtro-limpar" ${filtroAtivo() ? "" : "disabled"}>${icon("x", 12)} Limpar filtro</button>
            </div>` : ""}

            ${filtroAtivo() ? `<p class="empty-note" style="margin:-6px 0 10px;">${list.length} de ${totalDocs} documento(s) — filtro ativo.</p>` : ""}

            ${list.length > 0 ? `
            <label style="display:flex; align-items:center; gap:6px; font-size:12px; color:var(--muted); margin-bottom:8px; cursor:pointer; width:fit-content;">
              <input type="checkbox" id="chk-selecionar-todos" style="width:auto; margin:0;" ${todosVisiveisSelecionados ? "checked" : ""}>
              Selecionar todos visíveis
            </label>` : ""}

            ${selecionados.size > 0 ? `
            <div style="display:flex; flex-wrap:wrap; align-items:center; gap:10px; padding:10px; margin-bottom:12px; background:var(--parchment-card); border:1px solid var(--line); border-radius:6px;">
              <b style="font-size:12.5px;">${selecionados.size} selecionado(s)</b>
              <span style="display:flex; align-items:center; gap:5px;">
                <select style="width:auto;" id="bulk-etapa">
                  <option value="">Mudar etapa...</option>
                  ${etapasPorTipo(subTab).map(et => `<option value="${esc(et)}" ${bulkEtapa===et?"selected":""}>${esc(et)}</option>`).join("")}
                </select>
                <button class="btn btn-sm" id="bulk-etapa-aplicar" ${bulkEtapa?"":"disabled"}>Aplicar</button>
              </span>
              <span style="display:flex; align-items:center; gap:5px;">
                <select style="width:auto;" id="bulk-reuniao">
                  <option value="">Vincular reunião...</option>
                  ${reunioes.map(r => `<option value="${r.id}" ${bulkReuniao===r.id?"selected":""}>Reunião ${esc(fmtPeriodoCurto(r))}</option>`).join("")}
                </select>
                <button class="btn btn-sm" id="bulk-reuniao-aplicar" ${bulkReuniao?"":"disabled"}>Aplicar</button>
              </span>
              ${rot.isSaida ? "" : `
              <span style="display:flex; align-items:center; gap:5px;">
                <select style="width:auto;" id="bulk-comissao">
                  <option value="">Vincular comissão...</option>
                  ${comissoesTodas.map(c => `<option value="${c.id}" ${bulkComissao===c.id?"selected":""}>${esc(c.nome)} — ${fmtDate(c.reuniaoData)}</option>`).join("")}
                </select>
                <button class="btn btn-sm" id="bulk-comissao-aplicar" ${bulkComissao?"":"disabled"}>Aplicar</button>
              </span>`}
              <button class="btn btn-sm" id="bulk-limpar" style="margin-left:auto;">${icon("x", 12)} Limpar seleção</button>
            </div>` : ""}

            ${list.length === 0 ? `<p class="empty-note">${totalDocs === 0 ? "Nenhum documento protocolado ainda." : "Nenhum documento corresponde ao filtro."}</p>` : ""}
            <div class="list-col">${list.map(d => cardHtml(d, reunioes, comissoesTodas)).join("")}</div>
          </div>
        `;

        container.querySelectorAll("[data-subtab-protocolo]").forEach(el => el.addEventListener("click", () => trocarSubTab(el.getAttribute("data-subtab-protocolo"))));
        container.querySelector("#in-assunto").addEventListener("input", e => form.assunto = e.target.value);
        container.querySelector("#in-origem").addEventListener("input", e => form.origemNome = e.target.value);
        container.querySelector("#btn-add-doc").addEventListener("click", add);
        container.querySelector("#btn-print-docs").addEventListener("click", printList);
        container.querySelector("#btn-ordenar").addEventListener("click", () => { ordemCrescente = !ordemCrescente; renderActiveTab(); });
        container.querySelector("#btn-toggle-filtros").addEventListener("click", () => { filtrosAbertos = !filtrosAbertos; renderActiveTab(); });
        container.querySelector("#btn-arquivados").addEventListener("click", () => abrirDocsEtapaModal("Arquivado", subTab));

        const chkTodos = container.querySelector("#chk-selecionar-todos");
        if (chkTodos) chkTodos.addEventListener("change", e => {
          if (e.target.checked) list.forEach(d => selecionados.add(d.id));
          else list.forEach(d => selecionados.delete(d.id));
          renderActiveTab();
        });
        container.querySelectorAll("[data-select-doc]").forEach(el => {
          el.addEventListener("click", e => e.stopPropagation());
          el.addEventListener("change", e => {
            const id = el.getAttribute("data-select-doc");
            if (e.target.checked) selecionados.add(id); else selecionados.delete(id);
            renderActiveTab();
          });
        });
        const bulkEtapaSel = container.querySelector("#bulk-etapa");
        if (bulkEtapaSel) bulkEtapaSel.addEventListener("change", e => { bulkEtapa = e.target.value; renderActiveTab(); });
        const bulkEtapaBtn = container.querySelector("#bulk-etapa-aplicar");
        if (bulkEtapaBtn) bulkEtapaBtn.addEventListener("click", () => aplicarEtapaEmMassa(bulkEtapa));
        const bulkReuniaoSel = container.querySelector("#bulk-reuniao");
        if (bulkReuniaoSel) bulkReuniaoSel.addEventListener("change", e => { bulkReuniao = e.target.value; renderActiveTab(); });
        const bulkReuniaoBtn = container.querySelector("#bulk-reuniao-aplicar");
        if (bulkReuniaoBtn) bulkReuniaoBtn.addEventListener("click", () => aplicarReuniaoEmMassa(bulkReuniao));
        const bulkComissaoSel = container.querySelector("#bulk-comissao");
        if (bulkComissaoSel) bulkComissaoSel.addEventListener("change", e => { bulkComissao = e.target.value; renderActiveTab(); });
        const bulkComissaoBtn = container.querySelector("#bulk-comissao-aplicar");
        if (bulkComissaoBtn) bulkComissaoBtn.addEventListener("click", () => aplicarComissaoEmMassa(bulkComissao));
        const bulkLimpar = container.querySelector("#bulk-limpar");
        if (bulkLimpar) bulkLimpar.addEventListener("click", () => { selecionados.clear(); bulkEtapa = ""; bulkReuniao = ""; bulkComissao = ""; renderActiveTab(); });
        const aplicarFiltroOrigem = e => { filtro.origem = e.target.value; renderActiveTab(); };
        const aplicarFiltroAssunto = e => { filtro.assunto = e.target.value; renderActiveTab(); };
        const elFiltroOrigem = container.querySelector("#filtro-origem");
        if (elFiltroOrigem){
          elFiltroOrigem.addEventListener("change", aplicarFiltroOrigem);
          elFiltroOrigem.addEventListener("keydown", e => { if (e.key === "Enter") e.target.blur(); });
        }
        const elFiltroAno = container.querySelector("#filtro-ano");
        if (elFiltroAno) elFiltroAno.addEventListener("change", e => { filtro.ano = e.target.value; renderActiveTab(); });
        const elFiltroAssunto = container.querySelector("#filtro-assunto");
        if (elFiltroAssunto){
          elFiltroAssunto.addEventListener("change", aplicarFiltroAssunto);
          elFiltroAssunto.addEventListener("keydown", e => { if (e.key === "Enter") e.target.blur(); });
        }
        const elFiltroLimpar = container.querySelector("#filtro-limpar");
        if (elFiltroLimpar) elFiltroLimpar.addEventListener("click", () => { filtro = { origem: "", assunto: "", ano: "" }; renderActiveTab(); });

        container.querySelectorAll("[data-toggle]").forEach(el => el.addEventListener("click", () => {
          const id = el.getAttribute("data-toggle");
          aberto = aberto === id ? null : id;
          renderActiveTab();
        }));
        container.querySelectorAll("[data-remove]").forEach(el => el.addEventListener("click", (e) => { e.stopPropagation(); remove(el.getAttribute("data-remove")); }));
        container.querySelectorAll("[data-etapa]").forEach(el => el.addEventListener("click", e => e.stopPropagation()));
        container.querySelectorAll("[data-etapa]").forEach(el => el.addEventListener("change", e => {
          const doc = docs().find(d => d.id === el.getAttribute("data-etapa"));
          const etapa = e.target.value;
          let texto = `Etapa alterada para "${etapa}"`;
          if (etapa === "Encaminhado à reunião" && doc.reuniaoId){ const r = reunioes.find(x=>x.id===doc.reuniaoId); if(r) texto += ` (reunião de ${fmtPeriodoCurto(r)})`; }
          if (etapa === "Em análise na comissão" && doc.comissaoId){ const c = comissoesTodas.find(x=>x.id===doc.comissaoId); if(c) texto += ` (${c.nome})`; }
          logar(doc, texto, { etapa });
        }));
        container.querySelectorAll("[data-reuniao]").forEach(el => el.addEventListener("change", e => {
          const doc = docs().find(d => d.id === el.getAttribute("data-reuniao"));
          const r = reunioes.find(x => x.id === e.target.value);
          logar(doc, `Encaminhado à reunião de ${r ? fmtPeriodoCurto(r) : "—"}`, { reuniaoId: e.target.value });
        }));
        container.querySelectorAll("[data-comissao]").forEach(el => el.addEventListener("change", e => {
          const doc = docs().find(d => d.id === el.getAttribute("data-comissao"));
          const c = comissoesTodas.find(x => x.id === e.target.value);
          logar(doc, `Encaminhado à ${c ? c.nome : "comissão"} para análise`, { comissaoId: e.target.value });
        }));
        container.querySelectorAll("[data-resposta-input]").forEach(el => el.addEventListener("input", e => respostaDraft[el.getAttribute("data-resposta-input")] = e.target.value));
        container.querySelectorAll("[data-emitir]").forEach(el => el.addEventListener("click", () => {
          const id = el.getAttribute("data-emitir");
          const texto = (respostaDraft[id] || "").trim();
          if (!texto) return;
          const doc = docs().find(d => d.id === id);
          delete respostaDraft[id];
          logar(doc, "Resposta emitida e registrada", { etapa: "Resposta emitida", respostaTexto: texto, respostaData: todayISO() });
        }));
        container.querySelectorAll("[data-nota-input]").forEach(el => el.addEventListener("input", e => notaDraft[el.getAttribute("data-nota-input")] = e.target.value));
        container.querySelectorAll("[data-anotar]").forEach(el => el.addEventListener("click", () => {
          const id = el.getAttribute("data-anotar");
          const texto = (notaDraft[id] || "").trim();
          if (!texto) return;
          delete notaDraft[id];
          logar(docs().find(d => d.id === id), texto, {});
        }));
        container.querySelectorAll("[data-anexar]").forEach(el => el.addEventListener("change", e => {
          const doc = docs().find(d => d.id === el.getAttribute("data-anexar"));
          const files = e.target.files;
          anexarArquivos(doc, files);
          e.target.value = "";
        }));
        container.querySelectorAll("[data-remove-anexo]").forEach(el => el.addEventListener("click", e => {
          e.preventDefault();
          const [docId, anexoId] = el.getAttribute("data-remove-anexo").split(":");
          removerAnexo(docs().find(d => d.id === docId), anexoId);
        }));
        container.querySelectorAll("[data-download]").forEach(el => el.addEventListener("click", e => {
          e.preventDefault();
          const [docId, anexoId] = el.getAttribute("data-download").split(":");
          const doc = docs().find(d => d.id === docId);
          const anexo = doc && (doc.anexos || []).find(a => a.id === anexoId);
          if (anexo) downloadAnexo(anexo);
        }));
        container.querySelectorAll("[data-visualizar-anexo]").forEach(el => el.addEventListener("click", e => {
          e.preventDefault();
          const [docId, anexoId] = el.getAttribute("data-visualizar-anexo").split(":");
          const doc = docs().find(d => d.id === docId);
          const anexo = doc && (doc.anexos || []).find(a => a.id === anexoId);
          if (anexo) abrirVisualizadorAnexo(anexo);
        }));
      },
      abrirDocsEtapaModal
    };
  })();

  /* @@TAB_PROTOCOLO@@ */

  /* ---------- REUNIÕES ---------- */
  TABS.reunioes = (function(){
    let novaData = "", novaDataFim = "", novoLocal = "", novoTipo = "";
    let ativa = null;
    const diaSelecionado = {};   // reunião -> dia da chamada em edição
    const designacaoDraft = {};
    const registroDraft = {};
    const extraDraft = {};
    const comissaoNomeDraft = {};
    const comissaoMembroDraft = {};
    const subTabReuniao = {};
    const eleicaoDraft = {};
    const nomeacaoDraft = {};

    function reunioes(){ return STATE.reunioes || []; }
    function save(next){ setSlice("reunioes", next); }
    function getReuniao(id){ return reunioes().find(r => r.id === id); }

    function criar(){
      if (!novaData) return;
      const pastores = STATE.pastores || [], igrejas = STATE.igrejas || [];
      const membros = [
        ...pastores.map(p => ({ id: uid(), nome: p.nome, grupo: "Ministros", presenca: "Ausente", presencas: {} })),
        ...igrejas.map(i => ({ id: uid(), nome: (i.representante && i.representante.trim()) ? i.representante.trim() : i.nome, grupo: "Igrejas", presenca: "Ausente", presencas: {}, igrejaId: i.id })),
      ];
      const dataFim = novaDataFim && novaDataFim > novaData ? novaDataFim : "";
      const r = { id: uid(), data: novaData, dataFim, local: novoLocal, tipo: novoTipo, membros, comissoes: [], eleicoes: [], nomeacoes: [], designacoes: [], registros: [] };
      save([r, ...reunioes()]);
      ativa = r.id;
      novaData = ""; novaDataFim = ""; novoLocal = ""; novoTipo = "";
      renderActiveTab();
    }
    /* Dia da chamada sendo editado nesta reunião (o 1º, se nenhum). */
    function diaAtual(r){
      const dias = diasDaReuniao(r);
      return dias.includes(diaSelecionado[r.id]) ? diaSelecionado[r.id] : dias[0];
    }
    /* Recalcula o resumo de presença de cada membro (usado nas
       contagens, comissões e etiquetas). */
    function comPresencaGeral(r){
      return { ...r, membros: r.membros.map(m => ({ ...m, presenca: presencaGeral(m, r) })) };
    }
    async function setDatasReuniao(reuniaoId, campo, valor){
      const r = getReuniao(reuniaoId);
      if (!r) return;
      let data = campo === "data" ? valor : r.data;
      let dataFim = campo === "dataFim" ? valor : (r.dataFim || "");
      if (!data){ await alertModal("A reunião precisa de uma data de início."); renderActiveTab(); return; }
      if (dataFim && dataFim <= data) dataFim = "";
      if (dataFim && diasDaReuniao({ data, dataFim }).length >= 31){ await alertModal("Uma reunião pode ter no máximo 30 dias."); renderActiveTab(); return; }
      save(reunioes().map(x => x.id === reuniaoId ? comPresencaGeral({ ...x, data, dataFim }) : x));
    }
    function setOrdinariaAnual(reuniaoId, valor){
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, ordinariaAnual: !!valor } : r));
    }
    function addExtra(reuniaoId, grupo){
      const nome = (extraDraft[reuniaoId + grupo] || "").trim();
      if (!nome) return;
      extraDraft[reuniaoId + grupo] = "";
      save(reunioes().map(r => r.id === reuniaoId ? comPresencaGeral({ ...r, membros: [...r.membros, { id: uid(), nome, grupo, presencas: { [diaAtual(r)]: "Presente" } }] }) : r));
    }
    function removeMembro(reuniaoId, membroId){
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, membros: r.membros.filter(m => m.id !== membroId) } : r));
    }
    function setPresenca(reuniaoId, membroId, presenca, dia){
      save(reunioes().map(r => {
        if (r.id !== reuniaoId) return r;
        const d = dia || diaAtual(r);
        return comPresencaGeral({ ...r, membros: r.membros.map(m => m.id === membroId ? { ...m, presencas: { ...(m.presencas || {}), [d]: presenca } } : m) });
      }));
    }
    function setNomeMembro(reuniaoId, membroId, nome){
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, membros: r.membros.map(m => m.id === membroId ? { ...m, nome } : m) } : r));
    }
    async function removeReuniao(id){
      if (!(await confirmModal("Excluir esta reunião e sua lista de presença?"))) return;
      save(reunioes().filter(r => r.id !== id));
    }

    /* -- comissões da reunião (formam-se e se dissolvem na própria reunião) -- */
    function criarComissao(reuniaoId){
      const nome = (comissaoNomeDraft[reuniaoId] || "").trim();
      if (!nome) return;
      comissaoNomeDraft[reuniaoId] = "";
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, comissoes: [{ id: uid(), nome, membros: [], relator: "", subrelator: "" }, ...(r.comissoes || [])] } : r));
    }
    async function removeComissao(reuniaoId, comissaoId){
      if (!(await confirmModal("Excluir esta comissão?"))) return;
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, comissoes: (r.comissoes || []).filter(c => c.id !== comissaoId) } : r));
    }
    function addMembroComissao(reuniaoId, comissaoId){
      const nome = comissaoMembroDraft[comissaoId];
      if (!nome) return;
      comissaoMembroDraft[comissaoId] = "";
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, comissoes: (r.comissoes || []).map(c => c.id === comissaoId ? { ...c, membros: [...c.membros, nome] } : c) } : r));
    }
    function removeMembroComissao(reuniaoId, comissaoId, idx){
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, comissoes: (r.comissoes || []).map(c => {
        if (c.id !== comissaoId) return c;
        const removido = c.membros[idx];
        const membros = c.membros.filter((_, i) => i !== idx);
        return { ...c, membros, relator: c.relator === removido ? "" : c.relator, subrelator: c.subrelator === removido ? "" : c.subrelator };
      }) } : r));
    }
    function setRelatorComissao(reuniaoId, comissaoId, nome){
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, comissoes: (r.comissoes || []).map(c => c.id === comissaoId ? { ...c, relator: nome } : c) } : r));
    }
    function setSubrelatorComissao(reuniaoId, comissaoId, nome){
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, comissoes: (r.comissoes || []).map(c => c.id === comissaoId ? { ...c, subrelator: nome } : c) } : r));
    }

    /* -- eleição (Comissão Executiva, delegados ao Supremo Concílio e ao Sínodo) -- */
    function eleicaoAno(reuniaoId){
      const r = getReuniao(reuniaoId);
      return (r && r.data) ? r.data.slice(0, 4) : String(new Date().getFullYear());
    }
    function addEleicao(reuniaoId){
      const draft = eleicaoDraft[reuniaoId];
      if (!draft || !draft.nome || !draft.nome.trim()) return;
      const nome = draft.nome.trim();
      const tipo = draft.tipo || "executiva";
      const ano = draft.ano || eleicaoAno(reuniaoId);
      const registro = { id: uid(), tipo, nome, ano };
      if (tipo === "executiva"){
        registro.cargo = draft.cargo || CARGOS_EXECUTIVOS[0];
        setSlice("comissaoExecutiva", [...(STATE.comissaoExecutiva || []).filter(m => m.cargo !== registro.cargo), { id: uid(), cargo: registro.cargo, nome, ano }]);
      } else if (tipo === "fiscal"){
        registro.condicao = draft.condicao || "titular";
        setSlice("conselhoFiscal", [...(STATE.conselhoFiscal || []), { id: uid(), condicao: registro.condicao, nome, ano }]);
      } else if (tipo === "gestor"){
        /* O Comitê Gestor tem 2 membros eleitos (Presidente e Tesoureiro
           vêm da Comissão Executiva): ocupa a vaga escolhida. */
        registro.vaga = draft.vaga === "membro2" ? "membro2" : "membro1";
        setSlice("comiteGestor", { ...(STATE.comiteGestor || { membro1: "", membro2: "" }), [registro.vaga]: nome });
      } else {
        registro.condicao = draft.condicao || "titular";
        const chave = tipo === "supremo" ? "delegadosSupremo" : "delegadosSinodo";
        setSlice(chave, [...(STATE[chave] || []), { id: uid(), nome, ano, condicao: registro.condicao }]);
      }
      eleicaoDraft[reuniaoId] = { tipo, cargo: draft.cargo, condicao: draft.condicao, vaga: draft.vaga, ano, nome: "" };
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, eleicoes: [registro, ...(r.eleicoes || [])] } : r));
    }
    async function removeEleicao(reuniaoId, eleicaoId){
      if (!(await confirmModal("Excluir este registro de eleição desta reunião?"))) return;
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, eleicoes: (r.eleicoes || []).filter(e => e.id !== eleicaoId) } : r));
    }

    /* -- nomeação (comissões permanentes/especiais e secretarias de causas) -- */
    function alvosNomeacao(destino){
      if (destino === "permanente") return STATE.comissoesPermanentes || [];
      if (destino === "especial") return STATE.comissoesEspeciais || [];
      return STATE.secretariasCausas || [];
    }
    function aplicarNomeacao(destino, alvoId, papel, nome){
      if (destino === "secretaria"){
        setSlice("secretariasCausas", (STATE.secretariasCausas || []).map(s => s.id === alvoId ? { ...s, responsavel: nome } : s));
        return;
      }
      const chave = destino === "permanente" ? "comissoesPermanentes" : "comissoesEspeciais";
      setSlice(chave, (STATE[chave] || []).map(c => {
        if (c.id !== alvoId) return c;
        const membros = c.membros.includes(nome) ? c.membros : [...c.membros, nome];
        const patch = { membros };
        if (papel === "relator") patch.relator = nome;
        if (papel === "subrelator") patch.subrelator = nome;
        return { ...c, ...patch };
      }));
    }
    function addNomeacao(reuniaoId){
      const draft = nomeacaoDraft[reuniaoId];
      if (!draft || !draft.alvoId || !draft.nome || !draft.nome.trim()) return;
      const nome = draft.nome.trim();
      const destino = draft.destino || "permanente";
      const papel = destino === "secretaria" ? "secretario" : (draft.papel || "membro");
      const alvo = alvosNomeacao(destino).find(a => a.id === draft.alvoId);
      if (!alvo) return;
      aplicarNomeacao(destino, draft.alvoId, papel, nome);
      const registro = { id: uid(), destino, alvoId: draft.alvoId, alvoNome: alvo.nome, papel, nome };
      nomeacaoDraft[reuniaoId] = { destino, alvoId: draft.alvoId, papel: draft.papel, nome: "" };
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, nomeacoes: [registro, ...(r.nomeacoes || [])] } : r));
    }
    async function removeNomeacao(reuniaoId, nomeacaoId){
      if (!(await confirmModal("Excluir este registro de nomeação desta reunião?"))) return;
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, nomeacoes: (r.nomeacoes || []).filter(n => n.id !== nomeacaoId) } : r));
    }

    /* -- designação de campo (só na Reunião Ordinária de dezembro; vale
       para o ano seguinte). Também atualiza o cadastro do pastor. -- */
    function anoDesignacao(r){ return String(((r && r.data) ? Number(r.data.slice(0, 4)) : new Date().getFullYear()) + 1); }
    function localDesignacaoInfo(designacao){
      const info = DESIGNACAO_INFO[designacao] || {};
      if (info.extraField) return { campo: info.extraField, rotulo: info.extraLabel };
      return { campo: "igreja", rotulo: "Igreja" };
    }
    function addDesignacao(reuniaoId){
      const r = getReuniao(reuniaoId);
      const draft = designacaoDraft[reuniaoId];
      if (!r || !draft || !(draft.nome || "").trim()) return;
      const nome = draft.nome.trim();
      const designacao = draft.designacao || DESIGNACOES[0];
      const local = (draft.local || "").trim();
      const ano = draft.ano || anoDesignacao(r);
      const pastor = (STATE.pastores || []).find(p => p.nome === nome);
      if (pastor){
        const { campo } = localDesignacaoInfo(designacao);
        setSlice("pastores", (STATE.pastores || []).map(p => p.id === pastor.id ? { ...p, designacao, [campo]: local } : p));
      }
      designacaoDraft[reuniaoId] = { designacao, ano, nome: "", local: "" };
      save(reunioes().map(x => x.id === reuniaoId ? { ...x, designacoes: [{ id: uid(), nome, designacao, local, ano }, ...(x.designacoes || [])] } : x));
    }
    async function removeDesignacao(reuniaoId, id){
      if (!(await confirmModal("Excluir este registro de designação? O cadastro do pastor não é alterado."))) return;
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, designacoes: (r.designacoes || []).filter(d => d.id !== id) } : r));
    }

    /* -- registro livre (qualquer outra decisão que deva sair na etiqueta) -- */
    function addRegistro(reuniaoId){
      const draft = registroDraft[reuniaoId] || {};
      const nome = (draft.nome || "").trim(), texto = (draft.texto || "").trim();
      if (!nome || !texto) return;
      registroDraft[reuniaoId] = { nome: "", texto: "" };
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, registros: [{ id: uid(), nome, texto }, ...(r.registros || [])] } : r));
    }
    async function removeRegistro(reuniaoId, id){
      if (!(await confirmModal("Excluir este registro?"))) return;
      save(reunioes().map(r => r.id === reuniaoId ? { ...r, registros: (r.registros || []).filter(x => x.id !== id) } : r));
    }

    /* Lista de presença impressa: uma coluna por dia da reunião. */
    function printAttendance(r){
      const dias = diasDaReuniao(r);
      const varios = dias.length > 1;
      const grupoLabel = m => { const g = GRUPOS_REUNIAO.find(x => x.id === m.grupo); return g ? g.label : m.grupo; };
      const rows = r.membros.map(m => `<tr><td>${esc(m.nome)}</td><td>${esc(grupoLabel(m))}</td>${dias.map(d => `<td>${esc(presencaNoDia(m, d))}</td>`).join("")}</tr>`).join("");
      const cab = varios ? dias.map(d => `<th>${esc(fmtDiaSemana(d))}</th>`).join("") : "<th>Presença</th>";
      printDoc(`Lista de presença — reunião de ${fmtPeriodoCurto(r)}`, `
        ${r.tipo ? `<p style="font-size:12px;margin:-8px 0 4px;"><b>${esc(r.tipo)}</b></p>` : ""}
        ${r.local ? `<p style="font-size:12px;color:#6B6350;margin:0 0 12px;">${esc(r.local)}</p>` : ""}
        <table class="print-table"><thead><tr><th>Nome</th><th>Categoria</th>${cab}</tr></thead><tbody>${rows}</tbody></table>
      `, { watermark: true });
    }

    function membrosEfetivosPresentes(r){
      return r.membros.filter(m => {
        const g = GRUPOS_REUNIAO.find(x => x.id === m.grupo);
        return g && g.categoria && m.presenca === "Presente";
      }).map(m => m.nome);
    }

    function comissoesHtml(r){
      const list = r.comissoes || [];
      const elegiveis = membrosEfetivosPresentes(r);
      return `
        <div>
          <p class="empty-note" style="margin:0 0 10px;">Todos os membros efetivos presentes (ministros e presbíteros) podem compor uma comissão.</p>
          <div style="display:flex; gap:8px; margin-bottom:10px;">
            <input style="font-size:12.5px;" placeholder="Nome da comissão (ex.: Comissão de Educação Teológica)" data-comissao-nome="${r.id}" value="${esc(comissaoNomeDraft[r.id] || "")}">
            <button class="btn btn-sm" data-comissao-criar="${r.id}">${icon("plus", 13)} Criar</button>
          </div>
          ${list.length === 0 ? '<p class="empty-note" style="margin:0 0 4px;">Nenhuma comissão formada nesta reunião.</p>' : `
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px;">
            ${list.map(c => `
              <div style="border:1px solid var(--line); border-radius:5px; background:#fff; padding:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:7px;">
                  <b style="font-size:13px;">${esc(c.nome)}</b>
                  <button class="btn-icon" data-comissao-remove="${r.id}:${c.id}">${icon("trash", 13)}</button>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:7px;">
                  ${c.membros.map((m, i) => `
                    <span style="display:inline-flex; align-items:center; gap:4px; font-size:11.5px; background:var(--green-soft); color:var(--green); padding:3px 7px; border-radius:999px;">
                      ${esc(m)}${c.relator===m?" (relator)":c.subrelator===m?" (subrelator)":""} <span style="cursor:pointer;" data-comissao-membro-remove="${r.id}:${c.id}:${i}">${icon("x", 10)}</span>
                    </span>
                  `).join("")}
                  ${c.membros.length === 0 ? '<span class="empty-note" style="margin:0;">Nenhum membro ainda.</span>' : ""}
                </div>
                <select style="font-size:11.5px; margin-bottom:6px;" data-comissao-membro-select="${r.id}:${c.id}">
                  <option value="">Selecionar membro efetivo presente...</option>
                  ${elegiveis.map(nome => `<option value="${esc(nome)}">${esc(nome)}</option>`).join("")}
                </select>
                <button class="btn btn-sm" style="width:100%; justify-content:center; margin-bottom:8px;" data-comissao-membro-add="${r.id}:${c.id}">${icon("plus", 12)} Adicionar</button>
                ${c.membros.length > 0 ? `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                  <select style="font-size:11px;" data-comissao-relator="${r.id}:${c.id}">
                    <option value="">Relator...</option>
                    ${c.membros.map(m => `<option value="${esc(m)}" ${c.relator===m?"selected":""}>${esc(m)}</option>`).join("")}
                  </select>
                  <select style="font-size:11px;" data-comissao-subrelator="${r.id}:${c.id}">
                    <option value="">Sub-relator...</option>
                    ${c.membros.map(m => `<option value="${esc(m)}" ${c.subrelator===m?"selected":""}>${esc(m)}</option>`).join("")}
                  </select>
                </div>` : ""}
              </div>
            `).join("")}
          </div>`}
        </div>
      `;
    }

    function eleicaoHtml(r){
      const list = r.eleicoes || [];
      const cfg = STATE.config || {};
      const draft = eleicaoDraft[r.id] || (eleicaoDraft[r.id] = { tipo: "executiva", cargo: CARGOS_EXECUTIVOS[0], condicao: "titular", ano: eleicaoAno(r.id), nome: "" });
      const nomeSinodo = cfg.siglaSinodo || cfg.nomeSinodo || "Sínodo";
      return `
        <div>
          <p class="empty-note" style="margin:0 0 10px;">Registre aqui as eleições desta reunião: Comissão Executiva, Conselho Fiscal, Comitê Gestor e delegados ao Supremo Concílio e ao ${esc(nomeSinodo)}. O resultado aparece na etiqueta de presença do eleito e atualiza Meu presbitério. O campo de ano é o ano da eleição — o mandato começa no ano seguinte.</p>
          <div style="display:grid; grid-template-columns:1.3fr 1fr 90px 1.4fr auto; gap:8px; margin-bottom:10px; align-items:center;">
            <select data-eleicao-tipo="${r.id}">
              <option value="executiva" ${draft.tipo==="executiva"?"selected":""}>Comissão Executiva</option>
              <option value="fiscal" ${draft.tipo==="fiscal"?"selected":""}>Conselho Fiscal</option>
              <option value="gestor" ${draft.tipo==="gestor"?"selected":""}>Comitê Gestor</option>
              <option value="supremo" ${draft.tipo==="supremo"?"selected":""}>Delegado ao Supremo Concílio</option>
              <option value="sinodo" ${draft.tipo==="sinodo"?"selected":""}>Delegado ao ${esc(nomeSinodo)}</option>
            </select>
            ${draft.tipo === "executiva" ? `
              <select data-eleicao-cargo="${r.id}">${CARGOS_EXECUTIVOS.map(c => `<option ${draft.cargo===c?"selected":""}>${esc(c)}</option>`).join("")}</select>
            ` : draft.tipo === "gestor" ? `
              <select data-eleicao-vaga="${r.id}">
                <option value="membro1" ${draft.vaga!=="membro2"?"selected":""}>1ª vaga</option>
                <option value="membro2" ${draft.vaga==="membro2"?"selected":""}>2ª vaga</option>
              </select>
            ` : `
              <select data-eleicao-condicao="${r.id}">
                <option value="titular" ${draft.condicao==="titular"?"selected":""}>Titular</option>
                <option value="suplente" ${draft.condicao==="suplente"?"selected":""}>Suplente</option>
              </select>
            `}
            <input type="number" style="font-size:12.5px;" data-eleicao-ano="${r.id}" value="${esc(draft.ano)}">
            <span style="position:relative;">
              <input placeholder="Nome do eleito — digite ou busque" list="eleicao-datalist-${r.id}" style="padding-left:28px;" data-eleicao-nome="${r.id}" value="${esc(draft.nome)}">
              <span style="position:absolute; left:8px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none;">${icon("search", 13)}</span>
              <datalist id="eleicao-datalist-${r.id}">${membrosEfetivosGlobais().map(nm => `<option value="${esc(nm)}">`).join("")}</datalist>
            </span>
            <button class="btn btn-sm" data-eleicao-add="${r.id}">${icon("plus", 13)} Registrar</button>
          </div>
          ${list.length === 0 ? '<p class="empty-note" style="margin:0;">Nenhuma eleição registrada nesta reunião.</p>' : `
          <div class="list-col">
            ${list.map(e => `
              <div class="row-card">
                <span style="display:flex; gap:10px; align-items:center; font-size:13px;">
                  ${e.tipo === "executiva" ? pillHtml(e.cargo, "gold")
                    : e.tipo === "fiscal" ? pillHtml("Conselho Fiscal", "green")
                    : e.tipo === "gestor" ? pillHtml("Comitê Gestor", "green")
                    : pillHtml(e.tipo === "supremo" ? "Supremo Concílio" : nomeSinodo, "seal")}
                  <b>${esc(e.nome)}</b>
                  <span style="color:var(--muted); font-size:12px;">${(e.tipo === "fiscal" || e.tipo === "supremo" || e.tipo === "sinodo") ? esc(e.condicao) + " · " : ""}${e.tipo === "sinodo" ? "biênio " : e.tipo === "supremo" ? "quadriênio " : "mandato "}${esc(mandatoAnoTexto(e.ano, mandatoAnosEleicao(e.tipo, e.cargo)))}</span>
                </span>
                <button class="btn-icon" data-eleicao-remove="${r.id}:${e.id}">${icon("trash", 14)}</button>
              </div>
            `).join("")}
          </div>`}
        </div>
      `;
    }

    function nomeacoesHtml(r){
      const list = r.nomeacoes || [];
      const draft = nomeacaoDraft[r.id] || (nomeacaoDraft[r.id] = { destino: "permanente", alvoId: "", papel: "membro", nome: "" });
      const alvos = alvosNomeacao(draft.destino);
      if (!draft.alvoId && alvos.length) draft.alvoId = alvos[0].id;
      return `
        <div>
          <p class="empty-note" style="margin:0 0 10px;">Registre aqui a nomeação de membros das comissões permanentes, especiais e das secretarias de causas ocorrida nesta reunião. A nomeação aparece na etiqueta de presença do nomeado.</p>
          <div style="display:grid; grid-template-columns:1.2fr 1.3fr 1fr 1.3fr auto; gap:8px; margin-bottom:10px; align-items:center;">
            <select data-nomeacao-destino="${r.id}">
              <option value="permanente" ${draft.destino==="permanente"?"selected":""}>Comissão permanente</option>
              <option value="especial" ${draft.destino==="especial"?"selected":""}>Comissão especial</option>
              <option value="secretaria" ${draft.destino==="secretaria"?"selected":""}>Secretaria de causa</option>
            </select>
            <select data-nomeacao-alvo="${r.id}">
              ${alvos.length === 0 ? '<option value="">Nenhuma cadastrada em Meu Presbitério</option>' : alvos.map(a => `<option value="${a.id}" ${draft.alvoId===a.id?"selected":""}>${esc(a.nome)}</option>`).join("")}
            </select>
            ${draft.destino === "secretaria" ? `<select disabled><option>Secretário(a)</option></select>` : `
              <select data-nomeacao-papel="${r.id}">
                <option value="membro" ${draft.papel==="membro"?"selected":""}>Membro</option>
                <option value="relator" ${draft.papel==="relator"?"selected":""}>Relator</option>
                <option value="subrelator" ${draft.papel==="subrelator"?"selected":""}>Sub-relator</option>
              </select>
            `}
            <span style="position:relative;">
              <input placeholder="Nome do nomeado — digite ou busque" list="nomeacao-datalist-${r.id}" style="padding-left:28px;" data-nomeacao-nome="${r.id}" value="${esc(draft.nome)}">
              <span style="position:absolute; left:8px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none;">${icon("search", 13)}</span>
              <datalist id="nomeacao-datalist-${r.id}">${membrosEfetivosGlobais().map(nm => `<option value="${esc(nm)}">`).join("")}</datalist>
            </span>
            <button class="btn btn-sm" data-nomeacao-add="${r.id}" ${alvos.length===0?"disabled":""}>${icon("plus", 13)} Registrar</button>
          </div>
          ${list.length === 0 ? '<p class="empty-note" style="margin:0;">Nenhuma nomeação registrada nesta reunião.</p>' : `
          <div class="list-col">
            ${list.map(n => `
              <div class="row-card">
                <span style="display:flex; gap:10px; align-items:center; font-size:13px;">
                  ${pillHtml(n.alvoNome, "green")}
                  <b>${esc(n.nome)}</b>
                  ${n.papel !== "membro" ? `<span style="color:var(--muted); font-size:12px;">${n.papel === "secretario" ? "secretário" : n.papel}</span>` : ""}
                </span>
                <button class="btn-icon" data-nomeacao-remove="${r.id}:${n.id}">${icon("trash", 14)}</button>
              </div>
            `).join("")}
          </div>`}
        </div>
      `;
    }

    function designacoesHtml(r){
      const list = r.designacoes || [];
      const draft = designacaoDraft[r.id] || (designacaoDraft[r.id] = { designacao: DESIGNACOES[0], ano: anoDesignacao(r), nome: "", local: "" });
      const { campo, rotulo } = localDesignacaoInfo(draft.designacao);
      const pastoresNomes = (STATE.pastores || []).map(p => p.nome).filter(Boolean);
      const opcoesLocal = campo === "igreja" ? (STATE.igrejas || []).map(i => i.nome).filter(Boolean) : [];
      return `
        <div>
          <p class="empty-note" style="margin:0 0 10px;">Designações de campo feitas nesta Reunião Ordinária de dezembro, valendo para o ano seguinte. Cada designação sai na etiqueta do pastor e atualiza a designação no cadastro de Pastores.</p>
          <div style="display:grid; grid-template-columns:1.4fr 1fr 1.4fr 80px auto; gap:8px; margin-bottom:10px; align-items:center;">
            <span style="position:relative;">
              <input placeholder="Pastor — digite ou busque" list="desig-pastores-${r.id}" style="padding-left:28px;" data-desig-nome="${r.id}" value="${esc(draft.nome)}">
              <span style="position:absolute; left:8px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none;">${icon("search", 13)}</span>
              <datalist id="desig-pastores-${r.id}">${pastoresNomes.map(nm => `<option value="${esc(nm)}">`).join("")}</datalist>
            </span>
            <select data-desig-tipo="${r.id}">${DESIGNACOES.map(d => `<option ${draft.designacao===d?"selected":""}>${esc(d)}</option>`).join("")}</select>
            <span>
              <input placeholder="${esc(rotulo)}" ${opcoesLocal.length ? `list="desig-local-${r.id}"` : ""} data-desig-local="${r.id}" value="${esc(draft.local)}">
              ${opcoesLocal.length ? `<datalist id="desig-local-${r.id}">${opcoesLocal.map(nm => `<option value="${esc(nm)}">`).join("")}</datalist>` : ""}
            </span>
            <input type="number" title="Ano da designação" data-desig-ano="${r.id}" value="${esc(draft.ano)}">
            <button class="btn btn-sm" data-desig-add="${r.id}">${icon("plus", 13)} Registrar</button>
          </div>
          ${list.length === 0 ? '<p class="empty-note" style="margin:0;">Nenhuma designação registrada nesta reunião.</p>' : `
          <div class="list-col">
            ${list.map(d => `
              <div class="row-card">
                <span style="display:flex; gap:10px; align-items:center; font-size:13px; flex-wrap:wrap;">
                  ${pillHtml(d.designacao, "gold")}
                  <b>${esc(d.nome)}</b>
                  <span style="color:var(--muted); font-size:12px;">${esc(textoDesignacao(d))}</span>
                </span>
                <button class="btn-icon" data-desig-remove="${r.id}:${d.id}" title="Excluir">${icon("trash", 14)}</button>
              </div>
            `).join("")}
          </div>`}
        </div>
      `;
    }

    function registrosHtml(r){
      const list = r.registros || [];
      const draft = registroDraft[r.id] || (registroDraft[r.id] = { nome: "", texto: "" });
      const nomes = [...new Set(r.membros.map(m => m.nome).filter(Boolean))];
      return `
        <div>
          <p class="empty-note" style="margin:0 0 10px;">Qualquer outra decisão desta reunião que deva constar na etiqueta de uma pessoa (ex.: "Recebido por transferência do PPSP", "Concedida licença"). O texto sai exatamente como digitado.</p>
          <div style="display:grid; grid-template-columns:1.2fr 2fr auto; gap:8px; margin-bottom:10px; align-items:center;">
            <span style="position:relative;">
              <input placeholder="Pessoa — digite ou busque" list="reg-nomes-${r.id}" style="padding-left:28px;" data-reg-nome="${r.id}" value="${esc(draft.nome)}">
              <span style="position:absolute; left:8px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none;">${icon("search", 13)}</span>
              <datalist id="reg-nomes-${r.id}">${nomes.map(nm => `<option value="${esc(nm)}">`).join("")}</datalist>
            </span>
            <input placeholder="Texto que sairá na etiqueta" maxlength="140" data-reg-texto="${r.id}" value="${esc(draft.texto)}">
            <button class="btn btn-sm" data-reg-add="${r.id}">${icon("plus", 13)} Registrar</button>
          </div>
          ${list.length === 0 ? '<p class="empty-note" style="margin:0;">Nenhum registro livre nesta reunião.</p>' : `
          <div class="list-col">
            ${list.map(x => `
              <div class="row-card">
                <span style="display:flex; gap:10px; align-items:center; font-size:13px; flex-wrap:wrap;"><b>${esc(x.nome)}</b> <span style="color:var(--ink-soft);">${esc(x.texto)}</span></span>
                <button class="btn-icon" data-reg-remove="${r.id}:${x.id}" title="Excluir">${icon("trash", 14)}</button>
              </div>
            `).join("")}
          </div>`}
        </div>
      `;
    }

    function presencaHtml(r){
      const dias = diasDaReuniao(r);
      const dia = diaAtual(r);
      const varios = dias.length > 1;
      const tabsDias = varios ? `
        <div class="dia-tabs" role="tablist" aria-label="Dia da chamada">
          <span class="dia-label">Chamada do dia:</span>
          ${dias.map(d => `<button class="btn btn-sm ${d===dia?"btn-primary":""}" role="tab" aria-selected="${d===dia}" data-dia-r="${r.id}|${d}">${esc(fmtDiaSemana(d))}</button>`).join("")}
        </div>` : "";
      const blocos = [];
      const vistos = new Set();
      GRUPOS_REUNIAO.forEach(g => {
        const chave = g.categoria || g.id;
        if (vistos.has(chave)) return;
        vistos.add(chave);
        blocos.push({ categoria: g.categoria, grupos: GRUPOS_REUNIAO.filter(x => (x.categoria || x.id) === chave) });
      });
      return tabsDias + blocos.map(bloco => `
        <div style="margin-top:14px;">
          ${bloco.categoria ? `<p style="font-size:12px; font-weight:700; color:var(--ink); margin:0 0 8px;">${esc(bloco.categoria)}</p>` : ""}
          ${bloco.grupos.map(g => {
            const membrosGrupo = r.membros.filter(m => m.grupo === g.id);
            return `
              <div style="margin-bottom:10px; padding-left:4px;">
                <p style="font-size:11px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:var(--muted); margin:0 0 6px;">${esc(g.label)}</p>
                <div class="list-col">
                  ${membrosGrupo.map(m => {
                    const igrejaCtx = m.igrejaId ? (STATE.igrejas || []).find(x => x.id === m.igrejaId) : null;
                    const opcoes = igrejaCtx ? [igrejaCtx.representante, ...(igrejaCtx.suplentes || [])].filter(v => v && v.trim()) : [];
                    const nomeCampo = igrejaCtx
                      ? `<b>${esc(igrejaCtx.nome)}</b> `
                        + (opcoes.length === 0
                          ? `<span style="color:var(--muted); font-size:11.5px;">(sem presbítero representante definido)</span>`
                          : `<select style="font-size:12.5px; padding:3px 6px; width:auto; display:inline-block;" data-membro-select="${r.id}:${m.id}">${opcoes.map(nm => `<option value="${esc(nm)}" ${m.nome===nm?"selected":""}>${esc(nm)}</option>`).join("")}</select>`)
                      : `<span>${esc(m.nome)}</span>`;
                    return `
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; padding:3px 2px; gap:8px;">
                      <span style="min-width:0;">${nomeCampo}${varios ? `<span class="dia-resumo" title="${esc(dias.map(d => fmtDiaSemana(d) + ": " + presencaNoDia(m, d)).join(" · "))}">${dias.map(d => { const st = presencaNoDia(m, d); return `<i class="${st === "Presente" ? "p" : st === "Justificado" ? "j" : "a"}"></i>`; }).join("")}</span>` : ""}</span>
                      <div style="display:flex; gap:5px; align-items:center; flex-shrink:0;">
                        ${PRESENCA_OPCOES.map(op => `
                          <button class="pill-btn" data-presenca="${r.id}:${m.id}:${op}:${dia}" aria-pressed="${presencaNoDia(m, dia)===op}" style="opacity:${presencaNoDia(m, dia)===op?1:.35};">
                            ${pillHtml(op, PRESENCA_TONE[op], { dot: true, watermark: true })}
                          </button>
                        `).join("")}
                        ${!g.auto ? `<button class="btn-icon" style="padding:2px;" data-membro-remove="${r.id}:${m.id}" title="Remover">${icon("x", 12)}</button>` : ""}
                      </div>
                    </div>
                  `;
                  }).join("")}
                  ${membrosGrupo.length === 0 ? `<p class="empty-note" style="margin:0;">Ninguém cadastrado nesta categoria para esta reunião.</p>` : ""}
                </div>
                <div style="display:flex; gap:8px; margin-top:8px;">
                  <input style="font-size:12px;" placeholder="Adicionar avulso" data-extra-input="${r.id}:${g.id}" value="${esc(extraDraft[r.id+g.id] || "")}">
                  <button class="btn btn-sm" data-extra-add="${r.id}:${g.id}">${icon("plus", 13)}</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `).join("");
    }

    function documentosHtml(r){
      const docs = [...(STATE.documentosEntrada || []), ...(STATE.documentosSaida || [])].filter(d => d.reuniaoId === r.id);
      return `
        <div style="margin-top:12px;">
          <p class="empty-note" style="margin:0 0 10px;">Documentos vinculados a esta reunião pela aba Protocolo.</p>
          ${docs.length === 0 ? '<p class="empty-note">Nenhum documento vinculado ainda.</p>' : `
          <div class="list-col">
            ${docs.map(d => `
              <div class="row-card">
                <span style="display:flex; align-items:center; gap:10px; min-width:0;">
                  <code class="doc-num">${esc(d.numero)}</code>
                  <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(d.assunto)}</span>
                </span>
                ${pillHtml(d.etapa, ETAPA_TONE[d.etapa])}
              </div>
            `).join("")}
          </div>`}
        </div>
      `;
    }

    const SUB_REUNIAO = [
      { id: "presenca", label: "Presença" },
      { id: "documentos", label: "Documentos" },
      { id: "comissoes", label: "Comissões" },
      { id: "eleicao", label: "Eleição" },
      { id: "nomeacoes", label: "Nomeações" },
      { id: "designacoes", label: "Designações de campo", so: ehReuniaoDeDesignacoes },
      { id: "registros", label: "Outros registros" },
    ];
    function subAbasDa(r){ return SUB_REUNIAO.filter(s => !s.so || s.so(r)); }

    function reuniaoCard(r){
      const aberta = ativa === r.id;
      const presentes = r.membros.filter(m => presencaGeral(m, r) === "Presente").length;
      const abas = subAbasDa(r);
      const sub = abas.some(s => s.id === subTabReuniao[r.id]) ? subTabReuniao[r.id] : "presenca";
      const nDias = diasDaReuniao(r).length;
      const numDocs = [...(STATE.documentosEntrada || []), ...(STATE.documentosSaida || [])].filter(d => d.reuniaoId === r.id).length;
      const numComissoes = (r.comissoes || []).length;
      const numEleicoes = (r.eleicoes || []).length;
      const numNomeacoes = (r.nomeacoes || []).length;
      const contagem = { presenca: null, documentos: numDocs || null, comissoes: numComissoes || null, eleicao: numEleicoes || null, nomeacoes: numNomeacoes || null,
        designacoes: (r.designacoes || []).length || null, registros: (r.registros || []).length || null };
      return `
        <div class="acc-card">
          <div class="acc-head" data-toggle-r="${r.id}">
            <div style="font-size:13.5px;">
              <b>${esc(fmtPeriodoCurto(r))}</b>${nDias > 1 ? ` <span style="color:var(--muted); font-size:12px;">(${nDias} dias)</span>` : ""} ${r.tipo ? `<span style="color:var(--muted);">· ${esc(r.tipo)}</span>` : ""} ${r.local ? `<span style="color:var(--muted);">· ${esc(r.local)}</span>` : ""}
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:12px; color:var(--muted);">${presentes}/${r.membros.length} presentes${nDias > 1 ? " (em algum dia)" : ""}</span>
              <button class="btn-icon" data-baixar-etiquetas-r="${r.id}" title="Baixar etiquetas de presença em PDF">${icon("download", 14)}</button>
              <button class="btn-icon" data-print-badges-r="${r.id}" title="Ver e imprimir etiquetas de presença (para a carteira)">${icon("tag", 14)}</button>
              <button class="btn-icon" data-print-r="${r.id}" title="Imprimir lista de presença">${icon("printer", 14)}</button>
              <button class="btn-icon" data-remove-r="${r.id}" title="Excluir">${icon("trash", 14)}</button>
            </div>
          </div>
          ${aberta ? `
          <div class="acc-body">
            <div class="reuniao-datas">
              <label>Início <input type="date" data-r-data="${r.id}" value="${esc(r.data || "")}"></label>
              <label>Término <input type="date" data-r-datafim="${r.id}" min="${esc(r.data || "")}" value="${esc(r.dataFim || "")}" title="Deixe vazio se a reunião for de um dia só"></label>
              <label class="check"><input type="checkbox" data-r-ordinaria="${r.id}" ${ehReuniaoDeDesignacoes(r) ? "checked" : ""}> Reunião Ordinária de dezembro (designações de campo)</label>
            </div>
            <div style="display:flex; gap:6px; margin-top:12px; flex-wrap:wrap;">
              ${abas.map(s => `<button class="btn btn-sm ${sub===s.id?"btn-primary":""}" data-subtab-r="${r.id}:${s.id}">${esc(s.label)}${contagem[s.id] ? ` (${contagem[s.id]})` : ""}</button>`).join("")}
            </div>
            ${sub === "presenca" ? presencaHtml(r) : ""}
            ${sub === "documentos" ? documentosHtml(r) : ""}
            ${sub === "comissoes" ? `<div style="margin-top:12px;">${comissoesHtml(r)}</div>` : ""}
            ${sub === "eleicao" ? `<div style="margin-top:12px;">${eleicaoHtml(r)}</div>` : ""}
            ${sub === "nomeacoes" ? `<div style="margin-top:12px;">${nomeacoesHtml(r)}</div>` : ""}
            ${sub === "designacoes" ? `<div style="margin-top:12px;">${designacoesHtml(r)}</div>` : ""}
            ${sub === "registros" ? `<div style="margin-top:12px;">${registrosHtml(r)}</div>` : ""}
          </div>` : ""}
        </div>
      `;
    }

    return {
      mount(container){
        const list = reunioes();
        const pastores = STATE.pastores || [], igrejas = STATE.igrejas || [];
        container.innerHTML = `
          <div class="section">
            <div class="section-head">
              <div class="section-head-left">
                <span class="section-icon">${icon("users", 18)}</span>
                <div>
                  <h3 class="section-title">Reuniões</h3>
                  <p class="section-sub">Chamada, comissões formadas na própria reunião e etiquetas de presença</p>
                </div>
              </div>
            </div>
            <div style="display:grid; grid-template-columns:150px 150px 1fr; gap:8px; margin-bottom:8px; align-items:end;">
              <label class="field-label" style="margin:0;">Início<input type="date" id="in-data" value="${esc(novaData)}" style="margin-top:4px;"></label>
              <label class="field-label" style="margin:0;">Término (opcional)<input type="date" id="in-data-fim" value="${esc(novaDataFim)}" style="margin-top:4px;" title="Deixe vazio se a reunião for de um dia só"></label>
              <input placeholder="Tipo da reunião (ex.: IV Reunião Extraordinária)" id="in-reuniao-tipo" value="${esc(novoTipo)}">
            </div>
            <div style="display:grid; grid-template-columns:1fr auto; gap:8px; margin-bottom:16px;">
              <input placeholder="Local / pauta (endereço, ou link online)" id="in-local" value="${esc(novoLocal)}">
              <button class="btn btn-primary" id="btn-nova-reuniao">${icon("plus", 14)} Nova reunião</button>
            </div>
            ${(pastores.length === 0 && igrejas.length === 0) ? '<p class="empty-note" style="margin-bottom:12px;">Cadastre pastores e igrejas na aba Cadastros para que a chamada seja gerada automaticamente.</p>' : ""}
            ${list.length === 0 ? '<p class="empty-note">Nenhuma reunião cadastrada ainda.</p>' : ""}
            <div class="list-col">${list.map(reuniaoCard).join("")}</div>
          </div>
        `;
        container.querySelector("#in-data").addEventListener("input", e => novaData = e.target.value);
        container.querySelector("#in-data-fim").addEventListener("input", e => novaDataFim = e.target.value);
        container.querySelectorAll("[data-r-data]").forEach(el => el.addEventListener("change", e => setDatasReuniao(el.getAttribute("data-r-data"), "data", e.target.value)));
        container.querySelectorAll("[data-r-datafim]").forEach(el => el.addEventListener("change", e => setDatasReuniao(el.getAttribute("data-r-datafim"), "dataFim", e.target.value)));
        container.querySelectorAll("[data-r-ordinaria]").forEach(el => el.addEventListener("change", e => setOrdinariaAnual(el.getAttribute("data-r-ordinaria"), e.target.checked)));
        container.querySelectorAll("[data-dia-r]").forEach(el => el.addEventListener("click", () => {
          const [rid, dia] = el.getAttribute("data-dia-r").split("|");
          diaSelecionado[rid] = dia;
          renderActiveTab();
        }));
        container.querySelectorAll("[data-desig-nome]").forEach(el => el.addEventListener("input", e => { designacaoDraft[el.getAttribute("data-desig-nome")].nome = e.target.value; }));
        container.querySelectorAll("[data-desig-local]").forEach(el => el.addEventListener("input", e => { designacaoDraft[el.getAttribute("data-desig-local")].local = e.target.value; }));
        container.querySelectorAll("[data-desig-ano]").forEach(el => el.addEventListener("input", e => { designacaoDraft[el.getAttribute("data-desig-ano")].ano = e.target.value; }));
        container.querySelectorAll("[data-desig-tipo]").forEach(el => el.addEventListener("change", e => {
          const rid = el.getAttribute("data-desig-tipo");
          designacaoDraft[rid] = { ...designacaoDraft[rid], designacao: e.target.value, local: "" };
          renderActiveTab();
        }));
        container.querySelectorAll("[data-desig-add]").forEach(el => el.addEventListener("click", () => addDesignacao(el.getAttribute("data-desig-add"))));
        container.querySelectorAll("[data-desig-remove]").forEach(el => el.addEventListener("click", () => {
          const [rid, id] = el.getAttribute("data-desig-remove").split(":");
          removeDesignacao(rid, id);
        }));
        container.querySelectorAll("[data-reg-nome]").forEach(el => el.addEventListener("input", e => { registroDraft[el.getAttribute("data-reg-nome")].nome = e.target.value; }));
        container.querySelectorAll("[data-reg-texto]").forEach(el => el.addEventListener("input", e => { registroDraft[el.getAttribute("data-reg-texto")].texto = e.target.value; }));
        container.querySelectorAll("[data-reg-texto]").forEach(el => el.addEventListener("keydown", e => { if (e.key === "Enter") addRegistro(el.getAttribute("data-reg-texto")); }));
        container.querySelectorAll("[data-reg-add]").forEach(el => el.addEventListener("click", () => addRegistro(el.getAttribute("data-reg-add"))));
        container.querySelectorAll("[data-reg-remove]").forEach(el => el.addEventListener("click", () => {
          const [rid, id] = el.getAttribute("data-reg-remove").split(":");
          removeRegistro(rid, id);
        }));
        container.querySelectorAll("[data-eleicao-vaga]").forEach(el => el.addEventListener("change", e => {
          const rid = el.getAttribute("data-eleicao-vaga");
          eleicaoDraft[rid] = { ...(eleicaoDraft[rid] || {}), vaga: e.target.value };
        }));
        container.querySelector("#in-local").addEventListener("input", e => novoLocal = e.target.value);
        container.querySelector("#in-reuniao-tipo").addEventListener("input", e => novoTipo = e.target.value);
        container.querySelector("#btn-nova-reuniao").addEventListener("click", criar);
        container.querySelectorAll("[data-toggle-r]").forEach(el => el.addEventListener("click", () => {
          const id = el.getAttribute("data-toggle-r");
          ativa = ativa === id ? null : id;
          renderActiveTab();
        }));
        container.querySelectorAll("[data-subtab-r]").forEach(el => el.addEventListener("click", () => {
          const [rid, sub] = el.getAttribute("data-subtab-r").split(":");
          subTabReuniao[rid] = sub;
          renderActiveTab();
        }));
        container.querySelectorAll("[data-remove-r]").forEach(el => el.addEventListener("click", e => { e.stopPropagation(); removeReuniao(el.getAttribute("data-remove-r")); }));
        container.querySelectorAll("[data-print-r]").forEach(el => el.addEventListener("click", e => { e.stopPropagation(); printAttendance(list.find(r => r.id === el.getAttribute("data-print-r"))); }));
        container.querySelectorAll("[data-print-badges-r]").forEach(el => el.addEventListener("click", e => { e.stopPropagation(); imprimirEtiquetas(list.find(r => r.id === el.getAttribute("data-print-badges-r"))); }));
        container.querySelectorAll("[data-baixar-etiquetas-r]").forEach(el => el.addEventListener("click", e => { e.stopPropagation(); baixarEtiquetas(list.find(r => r.id === el.getAttribute("data-baixar-etiquetas-r"))); }));
        container.querySelectorAll("[data-presenca]").forEach(el => el.addEventListener("click", () => {
          const [rid, mid, op, dia] = el.getAttribute("data-presenca").split(":");
          setPresenca(rid, mid, op, dia);
        }));
        container.querySelectorAll("[data-membro-select]").forEach(el => el.addEventListener("change", e => {
          const [rid, mid] = el.getAttribute("data-membro-select").split(":");
          setNomeMembro(rid, mid, e.target.value);
        }));
        container.querySelectorAll("[data-membro-remove]").forEach(el => el.addEventListener("click", () => {
          const [rid, mid] = el.getAttribute("data-membro-remove").split(":");
          removeMembro(rid, mid);
        }));
        container.querySelectorAll("[data-extra-input]").forEach(el => el.addEventListener("input", e => extraDraft[el.getAttribute("data-extra-input").replace(":", "")] = e.target.value));
        container.querySelectorAll("[data-extra-add]").forEach(el => el.addEventListener("click", () => {
          const [rid, grupo] = el.getAttribute("data-extra-add").split(":");
          addExtra(rid, grupo);
        }));
        container.querySelectorAll("[data-comissao-nome]").forEach(el => el.addEventListener("input", e => comissaoNomeDraft[el.getAttribute("data-comissao-nome")] = e.target.value));
        container.querySelectorAll("[data-comissao-criar]").forEach(el => el.addEventListener("click", () => criarComissao(el.getAttribute("data-comissao-criar"))));
        container.querySelectorAll("[data-comissao-remove]").forEach(el => el.addEventListener("click", () => {
          const [rid, cid] = el.getAttribute("data-comissao-remove").split(":");
          removeComissao(rid, cid);
        }));
        container.querySelectorAll("[data-comissao-membro-select]").forEach(el => el.addEventListener("change", e => {
          const [, cid] = el.getAttribute("data-comissao-membro-select").split(":");
          comissaoMembroDraft[cid] = e.target.value;
        }));
        container.querySelectorAll("[data-comissao-membro-add]").forEach(el => el.addEventListener("click", () => {
          const [rid, cid] = el.getAttribute("data-comissao-membro-add").split(":");
          addMembroComissao(rid, cid);
        }));
        container.querySelectorAll("[data-comissao-membro-remove]").forEach(el => el.addEventListener("click", () => {
          const [rid, cid, idx] = el.getAttribute("data-comissao-membro-remove").split(":");
          removeMembroComissao(rid, cid, Number(idx));
        }));
        container.querySelectorAll("[data-comissao-relator]").forEach(el => el.addEventListener("change", e => {
          const [rid, cid] = el.getAttribute("data-comissao-relator").split(":");
          setRelatorComissao(rid, cid, e.target.value);
        }));
        container.querySelectorAll("[data-comissao-subrelator]").forEach(el => el.addEventListener("change", e => {
          const [rid, cid] = el.getAttribute("data-comissao-subrelator").split(":");
          setSubrelatorComissao(rid, cid, e.target.value);
        }));
        container.querySelectorAll("[data-eleicao-tipo]").forEach(el => el.addEventListener("change", e => {
          const rid = el.getAttribute("data-eleicao-tipo");
          eleicaoDraft[rid] = { ...(eleicaoDraft[rid] || {}), tipo: e.target.value };
          renderActiveTab();
        }));
        container.querySelectorAll("[data-eleicao-cargo]").forEach(el => el.addEventListener("change", e => {
          const rid = el.getAttribute("data-eleicao-cargo");
          eleicaoDraft[rid] = { ...(eleicaoDraft[rid] || {}), cargo: e.target.value };
        }));
        container.querySelectorAll("[data-eleicao-condicao]").forEach(el => el.addEventListener("change", e => {
          const rid = el.getAttribute("data-eleicao-condicao");
          eleicaoDraft[rid] = { ...(eleicaoDraft[rid] || {}), condicao: e.target.value };
        }));
        container.querySelectorAll("[data-eleicao-ano]").forEach(el => el.addEventListener("input", e => {
          const rid = el.getAttribute("data-eleicao-ano");
          eleicaoDraft[rid] = { ...(eleicaoDraft[rid] || {}), ano: e.target.value };
        }));
        container.querySelectorAll("[data-eleicao-nome]").forEach(el => el.addEventListener("input", e => {
          const rid = el.getAttribute("data-eleicao-nome");
          eleicaoDraft[rid] = { ...(eleicaoDraft[rid] || {}), nome: e.target.value };
        }));
        container.querySelectorAll("[data-eleicao-add]").forEach(el => el.addEventListener("click", () => addEleicao(el.getAttribute("data-eleicao-add"))));
        container.querySelectorAll("[data-eleicao-remove]").forEach(el => el.addEventListener("click", () => {
          const [rid, eid] = el.getAttribute("data-eleicao-remove").split(":");
          removeEleicao(rid, eid);
        }));
        container.querySelectorAll("[data-nomeacao-destino]").forEach(el => el.addEventListener("change", e => {
          const rid = el.getAttribute("data-nomeacao-destino");
          nomeacaoDraft[rid] = { ...(nomeacaoDraft[rid] || {}), destino: e.target.value, alvoId: "" };
          renderActiveTab();
        }));
        container.querySelectorAll("[data-nomeacao-alvo]").forEach(el => el.addEventListener("change", e => {
          const rid = el.getAttribute("data-nomeacao-alvo");
          nomeacaoDraft[rid] = { ...(nomeacaoDraft[rid] || {}), alvoId: e.target.value };
        }));
        container.querySelectorAll("[data-nomeacao-papel]").forEach(el => el.addEventListener("change", e => {
          const rid = el.getAttribute("data-nomeacao-papel");
          nomeacaoDraft[rid] = { ...(nomeacaoDraft[rid] || {}), papel: e.target.value };
        }));
        container.querySelectorAll("[data-nomeacao-nome]").forEach(el => el.addEventListener("input", e => {
          const rid = el.getAttribute("data-nomeacao-nome");
          nomeacaoDraft[rid] = { ...(nomeacaoDraft[rid] || {}), nome: e.target.value };
        }));
        container.querySelectorAll("[data-nomeacao-add]").forEach(el => el.addEventListener("click", () => addNomeacao(el.getAttribute("data-nomeacao-add"))));
        container.querySelectorAll("[data-nomeacao-remove]").forEach(el => el.addEventListener("click", () => {
          const [rid, nid] = el.getAttribute("data-nomeacao-remove").split(":");
          removeNomeacao(rid, nid);
        }));
      }
    };
  })();

  /* @@TAB_REUNIOES@@ */

  /* As comissões passaram a existir dentro de cada reunião (elas se
     formam e se dissolvem ali) — ver TABS.reunioes mais abaixo. */

  /* ---------- TAREFAS ---------- */
  TABS.tarefas = (function(){
    let form = { titulo: "", responsavel: "", prazo: "" };
    const tarefas = () => STATE.tarefas || [];

    function add(){ if(!form.titulo.trim()) return; setSlice("tarefas", [{ id: uid(), status: "Pendente", ...form }, ...tarefas()]); form = { titulo:"", responsavel:"", prazo:"" }; renderActiveTab(); }
    function setStatus(id, status){ setSlice("tarefas", tarefas().map(t => t.id === id ? { ...t, status } : t)); }
    async function remove(id){ if(await confirmModal("Excluir esta tarefa?")) setSlice("tarefas", tarefas().filter(t => t.id !== id)); }

    function printList(){
      const hoje = todayISO();
      const rows = tarefas().map(t => `
        <tr>
          <td>${esc(t.titulo)}</td><td>${esc(t.responsavel || "—")}</td>
          <td>${t.prazo ? fmtDate(t.prazo) : "sem prazo"}${(t.prazo && t.prazo < hoje && t.status !== "Concluído") ? " (atrasada)" : ""}</td>
          <td>${esc(t.status)}</td>
        </tr>`).join("");
      printDoc("Tarefas e decisões", `
        <table class="print-table"><thead><tr><th>Tarefa</th><th>Responsável</th><th>Prazo</th><th>Status</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="4">Nenhuma tarefa registrada.</td></tr>`}</tbody></table>
      `);
    }

    return {
      mount(container){
        const list = tarefas();
        const hoje = todayISO();
        container.innerHTML = `
          <div class="section">
            <div class="section-head">
              <div class="section-head-left">
                <span class="section-icon">${icon("clipboard", 18)}</span>
                <div>
                  <h3 class="section-title">Tarefas e decisões</h3>
                  <p class="section-sub">Acompanhamento do que foi decidido e encaminhado</p>
                </div>
              </div>
              <div class="section-actions"><button class="btn" id="btn-print-tarefas">${icon("printer", 13)} Imprimir</button></div>
            </div>
            <div style="display:grid; grid-template-columns:2fr 1.2fr 130px auto; gap:8px; margin-bottom:14px;">
              <input placeholder="Tarefa ou decisão" id="t-titulo" value="${esc(form.titulo)}">
              <input placeholder="Responsável" id="t-responsavel" value="${esc(form.responsavel)}">
              <input type="date" id="t-prazo" value="${esc(form.prazo)}">
              <button class="btn btn-primary" id="t-add">${icon("plus", 14)} Adicionar</button>
            </div>
            ${list.length === 0 ? '<p class="empty-note">Nenhuma tarefa registrada ainda.</p>' : ""}
            <div class="list-col">
              ${list.map(t => `
                <div class="row-card" style="display:grid; grid-template-columns:1fr 130px 100px 150px auto; align-items:center; gap:8px;">
                  <span>${esc(t.titulo)}</span>
                  <span style="color:var(--muted); font-size:12px;">${esc(t.responsavel) || "—"}</span>
                  <span style="color:${(t.prazo && t.prazo<hoje && t.status!=="Concluído")?"var(--seal)":"var(--muted)"}; font-size:12px;">${t.prazo ? fmtDate(t.prazo) : "sem prazo"}</span>
                  <select style="padding:4px 6px;" data-status-tarefa="${t.id}"><option ${t.status==="Pendente"?"selected":""}>Pendente</option><option ${t.status==="Em andamento"?"selected":""}>Em andamento</option><option ${t.status==="Concluído"?"selected":""}>Concluído</option></select>
                  <button class="btn-icon" data-remove-tarefa="${t.id}">${icon("trash", 15)}</button>
                </div>
              `).join("")}
            </div>
          </div>
        `;
        container.querySelector("#t-titulo").addEventListener("input", e => form.titulo = e.target.value);
        container.querySelector("#t-responsavel").addEventListener("input", e => form.responsavel = e.target.value);
        container.querySelector("#t-prazo").addEventListener("input", e => form.prazo = e.target.value);
        container.querySelector("#t-add").addEventListener("click", add);
        container.querySelector("#btn-print-tarefas").addEventListener("click", printList);
        container.querySelectorAll("[data-status-tarefa]").forEach(el => el.addEventListener("change", e => setStatus(el.getAttribute("data-status-tarefa"), e.target.value)));
        container.querySelectorAll("[data-remove-tarefa]").forEach(el => el.addEventListener("click", () => remove(el.getAttribute("data-remove-tarefa"))));
      }
    };
  })();

  /* @@TAB_TAREFAS@@ */

  /* ---------- MEU PRESBITÉRIO (configurações, membros e comissões) ---------- */
  TABS.config = (function(){

    let formPastor = { nome: "", igreja: "", status: "Ativo", designacao: "Pastor Efetivo", campoAtuacao: "", agenciaMissionaria: "", cedidoPara: "" };
    let editingPastorId = null, editDraftPastor = {};
    let formIgreja = { nome: "", cidade: "" };
    let editingIgrejaId = null, editDraftIgreja = {};
    let expandedIgrejaId = null;
    const suplenteDraft = {};
    let formCandidato = { nome: "", igreja: "", fase: "Candidato", tutor: "" };
    let editingCandidatoId = null, editDraftCandidato = {};

    const pastores = () => STATE.pastores || [];
    const igrejas = () => STATE.igrejas || [];
    const candidatos = () => STATE.candidatos || [];

    /* -- pastores -- */
    function addPastor(){ if(!formPastor.nome.trim()) return; setSlice("pastores", [...pastores(), { id: uid(), ...formPastor }]); formPastor = { nome:"", igreja:"", status:"Ativo", designacao:"Pastor Efetivo", campoAtuacao:"", agenciaMissionaria:"", cedidoPara:"" }; renderActiveTab(); }
    async function removePastor(id){ if(await confirmModal("Excluir este pastor do cadastro?")) setSlice("pastores", pastores().filter(p => p.id !== id)); }
    function setStatusPastor(id, status){ setSlice("pastores", pastores().map(p => p.id === id ? { ...p, status } : p)); }
    function startEditPastor(p){ editingPastorId = p.id; editDraftPastor = { nome:p.nome, igreja:p.igreja, designacao:p.designacao||"Pastor Efetivo", campoAtuacao:p.campoAtuacao||"", agenciaMissionaria:p.agenciaMissionaria||"", cedidoPara:p.cedidoPara||"" }; renderActiveTab(); }
    function saveEditPastor(){ const id = editingPastorId; editingPastorId = null; setSlice("pastores", pastores().map(p => p.id === id ? { ...p, ...editDraftPastor } : p)); }
    function cancelEditPastor(){ editingPastorId = null; renderActiveTab(); }

    /* -- igrejas -- */
    // O pastor responsável de uma igreja não é mais um campo próprio dela:
    // é derivado do cadastro de ministros — os pastores efetivos vinculados
    // àquela igreja (campo "igreja" do pastor + designação "Pastor Efetivo").
    function pastoresEfetivosDaIgreja(nomeIgreja){ return pastores().filter(p => p.igreja === nomeIgreja && (p.designacao || "Pastor Efetivo") === "Pastor Efetivo"); }
    function addIgreja(){ if(!formIgreja.nome.trim()) return; setSlice("igrejas", [...igrejas(), { id: uid(), representante: "", suplentes: [], ...formIgreja }]); formIgreja = { nome:"", cidade:"" }; renderActiveTab(); }
    async function removeIgreja(id){ if(await confirmModal("Excluir esta igreja do cadastro?")) setSlice("igrejas", igrejas().filter(i => i.id !== id)); }
    function startEditIgreja(i){ editingIgrejaId = i.id; editDraftIgreja = { nome:i.nome, cidade:i.cidade }; renderActiveTab(); }
    function saveEditIgreja(){ const id = editingIgrejaId; editingIgrejaId = null; setSlice("igrejas", igrejas().map(i => i.id === id ? { ...i, ...editDraftIgreja } : i)); }
    function cancelEditIgreja(){ editingIgrejaId = null; renderActiveTab(); }
    function setRepresentante(id, nome){ setSlice("igrejas", igrejas().map(i => i.id === id ? { ...i, representante: nome } : i)); }
    function addSuplente(id){
      const nome = suplenteDraft[id];
      if (!nome) return;
      suplenteDraft[id] = "";
      setSlice("igrejas", igrejas().map(i => i.id === id ? { ...i, suplentes: [...new Set([...(i.suplentes||[]), nome])] } : i));
    }
    function removeSuplente(id, idx){ setSlice("igrejas", igrejas().map(i => i.id === id ? { ...i, suplentes: (i.suplentes||[]).filter((_,ix)=>ix!==idx) } : i)); }

    /* -- candidatos -- */
    function addCandidato(){ if(!formCandidato.nome.trim()) return; setSlice("candidatos", [...candidatos(), { id: uid(), ...formCandidato }]); formCandidato = { nome:"", igreja:"", fase:"Candidato", tutor:"" }; renderActiveTab(); }
    async function removeCandidato(id){ if(await confirmModal("Excluir este candidato do cadastro?")) setSlice("candidatos", candidatos().filter(c => c.id !== id)); }
    async function setFaseCandidato(id, fase){
      const cand = candidatos().find(c => c.id === id);
      if (fase === "Ordenado" && cand){
        const ok = await confirmModal(`Ao marcar ${cand.nome} como Ordenado, ele será incluído automaticamente na lista de membros efetivos (pastores) e removido da lista de candidatos. Deseja continuar?`);
        if (!ok){ renderActiveTab(); return; }
        await setSlice("pastores", [...pastores(), { id: uid(), nome: cand.nome, igreja: cand.igreja || "", status: "Ativo", designacao: "Pastor Efetivo", campoAtuacao: "", agenciaMissionaria: "", cedidoPara: "" }]);
        setSlice("candidatos", candidatos().filter(c => c.id !== id));
        return;
      }
      setSlice("candidatos", candidatos().map(c => c.id === id ? { ...c, fase } : c));
    }
    function startEditCandidato(c){ editingCandidatoId = c.id; editDraftCandidato = { nome:c.nome, igreja:c.igreja, tutor: c.tutor || "" }; renderActiveTab(); }
    function saveEditCandidato(){ const id = editingCandidatoId; editingCandidatoId = null; setSlice("candidatos", candidatos().map(c => c.id === id ? { ...c, ...editDraftCandidato } : c)); }
    function cancelEditCandidato(){ editingCandidatoId = null; renderActiveTab(); }

    function designacaoExtraFieldHtml(designacao, values, prefix){
      const info = DESIGNACAO_INFO[designacao];
      if (!info || !info.extraField) return "";
      return `<input style="margin-top:8px;" placeholder="${esc(info.extraLabel)}" data-${prefix}-extra="${info.extraField}" value="${esc(values[info.extraField] || "")}">`;
    }

    function renderPastores(container){
      const list = pastores(); const igr = igrejas();
      container.innerHTML = `
        <div style="margin-bottom:14px;">
          <div style="display:grid; grid-template-columns:1.8fr 1.3fr 1fr 1.3fr auto; gap:8px;">
            <input placeholder="Nome do pastor (ex.: Rev. Fulano de Tal)" id="p-nome" value="${esc(formPastor.nome)}">
            <select id="p-igreja"><option value="">Igreja em que atua</option>${igr.map(i => `<option value="${esc(i.nome)}" ${formPastor.igreja===i.nome?"selected":""}>${esc(i.nome)}</option>`).join("")}</select>
            <select id="p-status">${STATUS_PASTOR.map(s => `<option ${formPastor.status===s?"selected":""}>${s}</option>`).join("")}</select>
            <select id="p-designacao">${DESIGNACOES.map(d => `<option ${formPastor.designacao===d?"selected":""}>${esc(d)}</option>`).join("")}</select>
            <button class="btn btn-primary" id="p-add">${icon("plus", 14)} Cadastrar</button>
          </div>
          <div id="p-extra-slot">${designacaoExtraFieldHtml(formPastor.designacao, formPastor, "form")}</div>
        </div>
        ${list.length === 0 ? '<p class="empty-note">Nenhum pastor cadastrado ainda.</p>' : ""}
        <div class="list-col">
          ${list.map((p, idx) => editingPastorId === p.id ? `
            <div class="row-card" style="display:block;">
              <div style="display:grid; grid-template-columns:26px 1.4fr 1fr 1.2fr auto; align-items:center; gap:8px;">
                <span style="color:var(--muted); font-size:12px;">${String(idx+1).padStart(2,"0")}</span>
                <input data-edit-field="nome" value="${esc(editDraftPastor.nome)}">
                <select data-edit-field="igreja"><option value="">—</option>${igr.map(i => `<option value="${esc(i.nome)}" ${editDraftPastor.igreja===i.nome?"selected":""}>${esc(i.nome)}</option>`).join("")}</select>
                <select data-edit-field="designacao">${DESIGNACOES.map(d => `<option ${editDraftPastor.designacao===d?"selected":""}>${esc(d)}</option>`).join("")}</select>
                <span style="display:flex; gap:4px;">
                  <button class="btn-icon" id="p-save-${p.id}" title="Salvar">${icon("check", 15)}</button>
                  <button class="btn-icon" id="p-cancel-${p.id}" title="Cancelar">${icon("x", 15)}</button>
                </span>
              </div>
              <div data-edit-extra-slot="${p.id}" style="margin-top:8px;">${designacaoExtraFieldHtml(editDraftPastor.designacao, editDraftPastor, "edit")}</div>
            </div>
          ` : `
            <div class="row-card" style="display:block;">
              <div style="display:grid; grid-template-columns:26px 1.6fr 1.2fr 130px auto; align-items:center; gap:8px;">
                <span style="color:var(--muted); font-size:12px;">${String(idx+1).padStart(2,"0")}</span>
                <span>${esc(p.nome)}</span>
                <span style="color:var(--muted); font-size:12px;">${esc(p.igreja) || "—"}</span>
                <select style="padding:4px 6px;" data-status-pastor="${p.id}">${STATUS_PASTOR.map(s => `<option ${p.status===s?"selected":""}>${s}</option>`).join("")}</select>
                <span style="display:flex; gap:2px;">
                  <button class="btn-icon" data-edit-pastor="${p.id}" title="Editar">${icon("pencil", 14)}</button>
                  <button class="btn-icon" data-remove-pastor="${p.id}" title="Excluir">${icon("trash", 15)}</button>
                </span>
              </div>
              <div style="padding-left:34px; margin-top:5px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                ${pillHtml(p.designacao || "Pastor Efetivo", "muted")}
                ${(DESIGNACAO_INFO[p.designacao] && DESIGNACAO_INFO[p.designacao].extraField && p[DESIGNACAO_INFO[p.designacao].extraField]) ? `<span style="font-size:11.5px; color:var(--muted);">${esc(DESIGNACAO_INFO[p.designacao].extraLabel)}: <b style="color:var(--ink-soft);">${esc(p[DESIGNACAO_INFO[p.designacao].extraField])}</b></span>` : ""}
              </div>
            </div>
          `).join("")}
        </div>
      `;
      container.querySelector("#p-nome").addEventListener("input", e => formPastor.nome = e.target.value);
      container.querySelector("#p-igreja").addEventListener("change", e => formPastor.igreja = e.target.value);
      container.querySelector("#p-status").addEventListener("change", e => formPastor.status = e.target.value);
      container.querySelector("#p-designacao").addEventListener("change", e => { formPastor.designacao = e.target.value; renderActiveTab(); });
      const formExtra = container.querySelector('[data-form-extra]');
      if (formExtra) formExtra.addEventListener("input", e => formPastor[e.target.getAttribute("data-form-extra")] = e.target.value);
      container.querySelector("#p-add").addEventListener("click", addPastor);
      container.querySelectorAll("[data-status-pastor]").forEach(el => el.addEventListener("change", e => setStatusPastor(el.getAttribute("data-status-pastor"), e.target.value)));
      container.querySelectorAll("[data-remove-pastor]").forEach(el => el.addEventListener("click", () => removePastor(el.getAttribute("data-remove-pastor"))));
      container.querySelectorAll("[data-edit-pastor]").forEach(el => el.addEventListener("click", () => startEditPastor(list.find(p => p.id === el.getAttribute("data-edit-pastor")))));
      list.forEach(p => {
        if (editingPastorId !== p.id) return;
        const row = container.querySelector(`#p-save-${p.id}`).closest(".row-card");
        row.querySelector('[data-edit-field="nome"]').addEventListener("input", e => editDraftPastor.nome = e.target.value);
        row.querySelector('[data-edit-field="igreja"]').addEventListener("change", e => editDraftPastor.igreja = e.target.value);
        row.querySelector('[data-edit-field="designacao"]').addEventListener("change", e => { editDraftPastor.designacao = e.target.value; renderActiveTab(); });
        const editExtra = row.querySelector('[data-edit-extra]');
        if (editExtra) editExtra.addEventListener("input", e => editDraftPastor[e.target.getAttribute("data-edit-extra")] = e.target.value);
        container.querySelector(`#p-save-${p.id}`).addEventListener("click", saveEditPastor);
        container.querySelector(`#p-cancel-${p.id}`).addEventListener("click", cancelEditPastor);
      });
    }

    function renderIgrejas(container){
      const list = igrejas(); const past = pastores();
      container.innerHTML = `
        <div style="display:grid; grid-template-columns:2fr 1fr auto; gap:8px; margin-bottom:14px;">
          <input placeholder="Nome da igreja (ex.: IP de...)" id="i-nome" value="${esc(formIgreja.nome)}">
          <input placeholder="Cidade" id="i-cidade" value="${esc(formIgreja.cidade)}">
          <button class="btn btn-primary" id="i-add">${icon("plus", 14)} Cadastrar</button>
        </div>
        <p class="section-sub" style="margin:-8px 0 14px;">O pastor responsável é definido no cadastro de Pastores (campo "Igreja em que atua" + designação "Pastor Efetivo") — não é preciso informar aqui.</p>
        ${list.length === 0 ? '<p class="empty-note">Nenhuma igreja cadastrada ainda.</p>' : ""}
        <div class="list-col">
          ${list.map((i, idx) => {
            const efetivos = pastoresEfetivosDaIgreja(i.nome).map(p => p.nome);
            const auxiliares = past.filter(p => p.igreja === i.nome && p.designacao === "Pastor Auxiliar").map(p => p.nome);
            if (editingIgrejaId === i.id) return `
            <div class="row-card" style="display:grid; grid-template-columns:26px 1.6fr 1fr auto; align-items:center; gap:8px;">
              <span style="color:var(--muted); font-size:12px;">${String(idx+1).padStart(2,"0")}</span>
              <input data-edit-field="nome" value="${esc(editDraftIgreja.nome)}">
              <input data-edit-field="cidade" value="${esc(editDraftIgreja.cidade)}">
              <span style="display:flex; gap:4px;">
                <button class="btn-icon" id="i-save-${i.id}" title="Salvar">${icon("check", 15)}</button>
                <button class="btn-icon" id="i-cancel-${i.id}" title="Cancelar">${icon("x", 15)}</button>
              </span>
            </div>
          `;
            const expanded = expandedIgrejaId === i.id;
            return `
            <div class="acc-card">
              <div class="acc-head" data-toggle-igreja="${i.id}" style="padding:9px 12px;">
                <div style="display:flex; align-items:center; gap:8px; min-width:0; font-size:13px;">
                  ${icon(expanded ? "chevronDown" : "chevronRight", 13)}
                  <span style="color:var(--muted); font-size:12px;">${String(idx+1).padStart(2,"0")}</span>
                  <span>${esc(i.nome)}</span>
                  <span style="color:var(--muted); font-size:12px;">${esc(i.cidade) || "—"}</span>
                </div>
                <span style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
                  <span style="color:var(--muted); font-size:12px;">${efetivos.length ? esc(efetivos.join(", ")) : "sem pastor efetivo vinculado"}</span>
                  <button class="btn-icon" data-edit-igreja="${i.id}" title="Editar">${icon("pencil", 14)}</button>
                  <button class="btn-icon" data-remove-igreja="${i.id}" title="Excluir">${icon("trash", 15)}</button>
                </span>
              </div>
              ${auxiliares.length ? `<div style="padding:0 12px 8px 33px; font-size:11.5px; color:var(--muted);">Pastores auxiliares: <b style="color:var(--ink-soft);">${auxiliares.map(esc).join(", ")}</b></div>` : ""}
              ${expanded ? `
                <div class="acc-body" style="padding-top:12px;">
                  <label class="field-label">Presbítero representante (nas reuniões do presbitério)</label>
                  <input data-representante="${i.id}" style="margin-bottom:12px;" placeholder="Nome do presbítero representante" value="${esc(i.representante || "")}">
                  <label class="field-label">Suplentes (outros presbíteros)</label>
                  <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
                    ${(i.suplentes||[]).length === 0 ? '<span class="empty-note" style="margin:0;">Nenhum suplente indicado.</span>' : (i.suplentes||[]).map((s, sidx) => `
                      <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; background:var(--gold-soft); color:var(--gold); padding:3px 8px; border-radius:999px;">
                        ${esc(s)} <span style="cursor:pointer;" data-suplente-remove="${i.id}:${sidx}">${icon("x", 11)}</span>
                      </span>
                    `).join("")}
                  </div>
                  <div style="display:flex; gap:8px;">
                    <input data-suplente-input="${i.id}" placeholder="Nome do presbítero suplente" value="${esc(suplenteDraft[i.id] || "")}">
                    <button class="btn btn-sm" data-suplente-add="${i.id}">${icon("plus", 13)} Adicionar suplente</button>
                  </div>
                </div>
              ` : ""}
            </div>
          `;
          }).join("")}
        </div>
      `;
      container.querySelector("#i-nome").addEventListener("input", e => formIgreja.nome = e.target.value);
      container.querySelector("#i-cidade").addEventListener("input", e => formIgreja.cidade = e.target.value);
      container.querySelector("#i-add").addEventListener("click", addIgreja);
      container.querySelectorAll("[data-remove-igreja]").forEach(el => el.addEventListener("click", e => { e.stopPropagation(); removeIgreja(el.getAttribute("data-remove-igreja")); }));
      container.querySelectorAll("[data-edit-igreja]").forEach(el => el.addEventListener("click", e => { e.stopPropagation(); startEditIgreja(list.find(i => i.id === el.getAttribute("data-edit-igreja"))); }));
      container.querySelectorAll("[data-toggle-igreja]").forEach(el => el.addEventListener("click", () => {
        const id = el.getAttribute("data-toggle-igreja");
        expandedIgrejaId = expandedIgrejaId === id ? null : id;
        renderActiveTab();
      }));
      container.querySelectorAll("[data-representante]").forEach(el => {
        el.addEventListener("change", e => setRepresentante(el.getAttribute("data-representante"), e.target.value));
        el.addEventListener("keydown", e => { if (e.key === "Enter") e.target.blur(); });
      });
      container.querySelectorAll("[data-suplente-input]").forEach(el => {
        el.addEventListener("input", e => suplenteDraft[el.getAttribute("data-suplente-input")] = e.target.value);
        el.addEventListener("keydown", e => { if (e.key === "Enter") addSuplente(el.getAttribute("data-suplente-input")); });
      });
      container.querySelectorAll("[data-suplente-add]").forEach(el => el.addEventListener("click", () => addSuplente(el.getAttribute("data-suplente-add"))));
      container.querySelectorAll("[data-suplente-remove]").forEach(el => el.addEventListener("click", () => {
        const [id, idx] = el.getAttribute("data-suplente-remove").split(":");
        removeSuplente(id, Number(idx));
      }));
      list.forEach(i => {
        if (editingIgrejaId !== i.id) return;
        const row = container.querySelector(`#i-save-${i.id}`).closest(".row-card");
        row.querySelector('[data-edit-field="nome"]').addEventListener("input", e => editDraftIgreja.nome = e.target.value);
        row.querySelector('[data-edit-field="cidade"]').addEventListener("input", e => editDraftIgreja.cidade = e.target.value);
        container.querySelector(`#i-save-${i.id}`).addEventListener("click", saveEditIgreja);
        container.querySelector(`#i-cancel-${i.id}`).addEventListener("click", cancelEditIgreja);
      });
    }

    function renderCandidatos(container){
      const list = candidatos(); const igr = igrejas();
      const pastoresNomes = pastores().map(p => p.nome);
      container.innerHTML = `
        <div style="display:grid; grid-template-columns:1.6fr 1.3fr 1.3fr 1fr auto; gap:8px; margin-bottom:14px;">
          <input placeholder="Nome do candidato" id="c-nome" value="${esc(formCandidato.nome)}">
          <select id="c-igreja"><option value="">Igreja de origem</option>${igr.map(i => `<option value="${esc(i.nome)}" ${formCandidato.igreja===i.nome?"selected":""}>${esc(i.nome)}</option>`).join("")}</select>
          <span style="position:relative;">
            <input placeholder="Tutor eclesiástico — digite ou busque" id="c-tutor" list="c-tutor-datalist" style="padding-left:28px;" value="${esc(formCandidato.tutor)}">
            <span style="position:absolute; left:8px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none;">${icon("search", 13)}</span>
            <datalist id="c-tutor-datalist">${pastoresNomes.map(nm => `<option value="${esc(nm)}">`).join("")}</datalist>
          </span>
          <select id="c-fase">${FASES.map(f => `<option ${formCandidato.fase===f?"selected":""}>${f}</option>`).join("")}</select>
          <button class="btn btn-primary" id="c-add">${icon("plus", 14)} Cadastrar</button>
        </div>
        ${list.length === 0 ? '<p class="empty-note">Nenhum candidato cadastrado ainda.</p>' : ""}
        <div class="list-col">
          ${list.map(c => editingCandidatoId === c.id ? `
            <div class="row-card" style="display:grid; grid-template-columns:1.4fr 1.1fr 1.1fr auto; align-items:center; gap:8px;">
              <input data-edit-field="nome" value="${esc(editDraftCandidato.nome)}">
              <select data-edit-field="igreja"><option value="">—</option>${igr.map(i => `<option value="${esc(i.nome)}" ${editDraftCandidato.igreja===i.nome?"selected":""}>${esc(i.nome)}</option>`).join("")}</select>
              <span style="position:relative;">
                <input data-edit-field="tutor" placeholder="Tutor eclesiástico" list="c-tutor-edit-datalist" style="padding-left:26px;" value="${esc(editDraftCandidato.tutor)}">
                <span style="position:absolute; left:7px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none;">${icon("search", 11)}</span>
                <datalist id="c-tutor-edit-datalist">${pastoresNomes.map(nm => `<option value="${esc(nm)}">`).join("")}</datalist>
              </span>
              <span style="display:flex; gap:4px;">
                <button class="btn-icon" id="c-save-${c.id}" title="Salvar">${icon("check", 15)}</button>
                <button class="btn-icon" id="c-cancel-${c.id}" title="Cancelar">${icon("x", 15)}</button>
              </span>
            </div>
          ` : `
            <div class="row-card" style="display:block;">
              <div style="display:grid; grid-template-columns:1.6fr 1.2fr 150px auto; align-items:center; gap:8px;">
                <span>${esc(c.nome)}</span>
                <span style="color:var(--muted); font-size:12px;">${esc(c.igreja) || "—"}</span>
                <select style="padding:4px 6px;" data-fase-candidato="${c.id}">${FASES.map(f => `<option ${c.fase===f?"selected":""}>${f}</option>`).join("")}</select>
                <span style="display:flex; gap:2px;">
                  <button class="btn-icon" data-edit-candidato="${c.id}" title="Editar">${icon("pencil", 14)}</button>
                  <button class="btn-icon" data-remove-candidato="${c.id}" title="Excluir">${icon("trash", 15)}</button>
                </span>
              </div>
              ${c.tutor ? `<div style="padding-left:2px; margin-top:4px; font-size:11.5px; color:var(--muted);">Tutor eclesiástico: <b style="color:var(--ink-soft);">${esc(c.tutor)}</b></div>` : ""}
            </div>
          `).join("")}
        </div>
      `;
      container.querySelector("#c-nome").addEventListener("input", e => formCandidato.nome = e.target.value);
      container.querySelector("#c-igreja").addEventListener("change", e => formCandidato.igreja = e.target.value);
      container.querySelector("#c-tutor").addEventListener("input", e => formCandidato.tutor = e.target.value);
      container.querySelector("#c-fase").addEventListener("change", e => formCandidato.fase = e.target.value);
      container.querySelector("#c-add").addEventListener("click", addCandidato);
      container.querySelectorAll("[data-fase-candidato]").forEach(el => el.addEventListener("change", e => setFaseCandidato(el.getAttribute("data-fase-candidato"), e.target.value)));
      container.querySelectorAll("[data-remove-candidato]").forEach(el => el.addEventListener("click", () => removeCandidato(el.getAttribute("data-remove-candidato"))));
      container.querySelectorAll("[data-edit-candidato]").forEach(el => el.addEventListener("click", () => startEditCandidato(list.find(c => c.id === el.getAttribute("data-edit-candidato")))));
      list.forEach(c => {
        if (editingCandidatoId !== c.id) return;
        const row = container.querySelector(`#c-save-${c.id}`).closest(".row-card");
        row.querySelector('[data-edit-field="nome"]').addEventListener("input", e => editDraftCandidato.nome = e.target.value);
        row.querySelector('[data-edit-field="igreja"]').addEventListener("change", e => editDraftCandidato.igreja = e.target.value);
        row.querySelector('[data-edit-field="tutor"]').addEventListener("input", e => editDraftCandidato.tutor = e.target.value);
        container.querySelector(`#c-save-${c.id}`).addEventListener("click", saveEditCandidato);
        container.querySelector(`#c-cancel-${c.id}`).addEventListener("click", cancelEditCandidato);
      });
    }


    /* -- configurações gerais -- */
    let draft = null; // inicializado no mount a partir do STATE

    function cfg(){ return STATE.config || DEFAULTS.config; }

    function salvarConfig(){
      setSlice("config", { ...cfg(), ...draft });
    }

    function onLogoFile(file){
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        if (!safeImg(reader.result)){ await alertModal("Envie uma imagem PNG, JPG, GIF ou WEBP."); return; }
        draft.logoDataUrl = reader.result;
        setSlice("config", { ...cfg(), ...draft });
      };
      reader.readAsDataURL(file);
    }
    function removerLogo(){
      draft.logoDataUrl = "";
      setSlice("config", { ...cfg(), ...draft });
    }

    /* Fonte própria da etiqueta (ex.: ZapfHumnst BT, do modelo do Word).
       O arquivo vai para o Storage privado da conta (ou fica no navegador,
       no modo local) — nunca para o repositório, que é público. */
    async function onFonteEtiquetaFile(estilo, file){
      if (!file) return;
      if (!/\.ttf$/i.test(file.name)){ await alertModal("Envie o arquivo da fonte no formato .ttf (TrueType)."); return; }
      if (file.size > 2 * 1024 * 1024){ await alertModal("O arquivo da fonte passa de 2 MB."); return; }
      try{
        const { jsPDF } = window.jspdf;
        const teste = new jsPDF();
        teste.addFileToVFS("t.ttf", await blobParaBase64(file));
        teste.addFont("t.ttf", "T", "normal"); teste.setFont("T", "normal"); teste.getTextWidth("Compareceu à reunião");
      }catch(e){ await alertModal("Este arquivo não pôde ser lido como fonte TrueType. Verifique se é o .ttf correto."); return; }
      const atual = cfg().fonteEtiqueta || {};
      const antigo = atual[estilo];
      let guardado;
      try{ guardado = await guardarArquivoAnexo(`fonte-etiqueta-${estilo}-${uid()}`, file.name, file); }
      catch(e){ await alertModal("Não foi possível enviar o arquivo da fonte agora. Tente novamente."); return; }
      if (antigo) apagarArquivosAnexos([antigo]);
      const fonteEtiqueta = { ...atual, [estilo]: { id: uid(), nome: file.name, tamanho: file.size, ...guardado } };
      await setSlice("config", { ...cfg(), ...draft, fonteEtiqueta });
    }
    async function removerFonteEtiqueta(){
      const atual = cfg().fonteEtiqueta;
      if (!atual) return;
      if (!(await confirmModal("Remover a fonte da etiqueta? As etiquetas voltam a sair em Helvetica."))) return;
      apagarArquivosAnexos([atual.normal, atual.negrito].filter(Boolean));
      const { fonteEtiqueta, ...resto } = cfg();
      await setSlice("config", { ...resto, ...draft });
    }

    function onAssinaturaFile(file){
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        if (!safeImg(reader.result)){ await alertModal("Envie uma imagem PNG para a assinatura."); return; }
        draft.assinaturaImagemDataUrl = reader.result;
        draft.assinaturaTipo = "imagem";
        setSlice("config", { ...cfg(), ...draft });
      };
      reader.readAsDataURL(file);
    }
    function removerAssinatura(){
      draft.assinaturaImagemDataUrl = "";
      setSlice("config", { ...cfg(), ...draft });
    }
    async function gerarAssinaturaAutomatica(){
      const nome = (draft.secretarioNome || "").trim();
      if (!nome){ await alertModal("Informe o nome de quem assina, logo acima, antes de gerar a assinatura."); return; }
      const dataUrl = await gerarAssinaturaImagem(nome);
      draft.assinaturaImagemDataUrl = dataUrl;
      draft.assinaturaTipo = "gerada";
      await setSlice("config", { ...cfg(), ...draft });
    }

    function renderGeral(container){
      const c = cfg();
      if (!draft) draft = { nomePresbiterio: c.nomePresbiterio, sigla: c.sigla, infoAdicional: c.infoAdicional, logoDataUrl: c.logoDataUrl, secretarioNome: c.secretarioNome || "", secretarioCargo: c.secretarioCargo || "Secretário Executivo", nomeSinodo: c.nomeSinodo || "", siglaSinodo: c.siglaSinodo || "", assinaturaTipo: c.assinaturaTipo || "imagem", assinaturaImagemDataUrl: c.assinaturaImagemDataUrl || "" };

      container.innerHTML = `
        <p class="section-sub" style="margin:-4px 0 14px;">Identidade do presbitério usada no cabeçalho, nas impressões e na marca d'água das etiquetas de presença.</p>

        <div style="display:flex; gap:18px; align-items:flex-start; flex-wrap:wrap;">
          <div>
            <label class="field-label">Logo do presbitério</label>
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="logo-preview">${safeImg(draft.logoDataUrl) ? `<img src="${safeImg(draft.logoDataUrl)}" alt="Logo">` : `<span style="color:var(--muted); font-size:11px;">sem logo</span>`}</div>
              <div style="display:flex; flex-direction:column; gap:6px;">
                <label class="btn btn-sm" style="cursor:pointer; width:fit-content;">${icon("upload", 13)} Enviar imagem<input type="file" accept="image/*" id="cfg-logo-file" style="display:none;"></label>
                ${draft.logoDataUrl ? `<button class="btn btn-sm" id="cfg-logo-remove">${icon("x", 12)} Remover logo</button>` : ""}
              </div>
            </div>
          </div>

          <div style="flex:1; min-width:240px; display:flex; flex-direction:column; gap:12px;">
            <div>
              <label class="field-label">Nome do presbitério</label>
              <input id="cfg-nome" value="${esc(draft.nomePresbiterio)}" placeholder="Ex.: Presbitério de São Paulo">
            </div>
            <div style="max-width:120px;">
              <label class="field-label">Sigla</label>
              <input id="cfg-sigla" value="${esc(draft.sigla)}" placeholder="SE" maxlength="4">
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1.4fr 1fr; gap:12px; margin-top:14px;">
          <div>
            <label class="field-label">Nome de quem assina as etiquetas de presença e o carimbo do protocolo</label>
            <input id="cfg-secretario-nome" value="${esc(draft.secretarioNome)}" placeholder="Ex.: Rev. Fulano de Tal">
          </div>
          <div>
            <label class="field-label">Cargo</label>
            <input id="cfg-secretario-cargo" value="${esc(draft.secretarioCargo)}" placeholder="Secretário Executivo">
          </div>
        </div>

        <div style="margin-top:14px;">
          <label class="field-label">Assinatura do secretário executivo (aparece nas etiquetas de presença)</label>
          <div style="display:flex; gap:6px; margin-bottom:10px;">
            <button type="button" class="btn btn-sm ${draft.assinaturaTipo!=="gerada"?"btn-primary":""}" id="assinatura-modo-imagem">${icon("upload", 13)} Enviar imagem (PNG)</button>
            <button type="button" class="btn btn-sm ${draft.assinaturaTipo==="gerada"?"btn-primary":""}" id="assinatura-modo-gerada">${icon("pencil", 13)} Gerar a partir do nome</button>
          </div>
          ${draft.assinaturaTipo === "gerada" ? `
            <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
              <div style="border:1px solid var(--line); border-radius:6px; background:#fff; padding:6px 16px; min-height:56px; display:flex; align-items:center;">
                ${safeImg(draft.assinaturaImagemDataUrl) ? `<img src="${safeImg(draft.assinaturaImagemDataUrl)}" alt="Assinatura gerada" style="height:48px;">` : `<span style="color:var(--muted); font-size:12px;">Nenhuma assinatura gerada ainda.</span>`}
              </div>
              <button class="btn btn-sm" id="assinatura-gerar">${icon("check", 13)} Gerar/atualizar assinatura</button>
              ${draft.assinaturaImagemDataUrl ? `<button class="btn btn-sm" id="cfg-assinatura-remove">${icon("x", 12)} Remover</button>` : ""}
            </div>
          ` : `
            <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
              <div style="border:1px solid var(--line); border-radius:6px; background:#fff; padding:6px 16px; min-height:56px; display:flex; align-items:center;">
                ${safeImg(draft.assinaturaImagemDataUrl) ? `<img src="${safeImg(draft.assinaturaImagemDataUrl)}" alt="Assinatura enviada" style="height:48px;">` : `<span style="color:var(--muted); font-size:12px;">Nenhuma imagem enviada ainda.</span>`}
              </div>
              <label class="btn btn-sm" style="cursor:pointer;">${icon("upload", 13)} Enviar PNG (sem fundo)<input type="file" accept="image/png" id="cfg-assinatura-file" style="display:none;"></label>
              ${draft.assinaturaImagemDataUrl ? `<button class="btn btn-sm" id="cfg-assinatura-remove">${icon("x", 12)} Remover</button>` : ""}
            </div>
          `}
        </div>

        <div style="margin-top:14px;">
          <label class="field-label">Fonte das etiquetas de presença (opcional)</label>
          <p class="section-sub" style="margin:0 0 8px;">Para as etiquetas saírem na mesma letra do seu modelo do Word (ex.: ZapfHumnst BT), envie os arquivos .ttf da fonte normal e da negrito. Eles ficam guardados só na sua conta. Sem fonte enviada, as etiquetas saem em Helvetica.</p>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            ${["normal", "negrito"].map(estilo => {
              const f = (cfg().fonteEtiqueta || {})[estilo];
              return `<label class="btn btn-sm" style="cursor:pointer;">${icon(f ? "check" : "upload", 13)} ${estilo === "normal" ? "Normal" : "Negrito"}: ${f ? esc(f.nome) : "enviar .ttf"}<input type="file" accept=".ttf,font/ttf" data-fonte-etiqueta="${estilo}" style="display:none;"></label>`;
            }).join("")}
            ${cfg().fonteEtiqueta ? `<button class="btn btn-sm" id="cfg-fonte-remove">${icon("x", 12)} Remover fonte</button>` : ""}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1.6fr 120px; gap:12px; margin-top:14px;">
          <div>
            <label class="field-label">Nome do Sínodo ao qual este presbitério pertence</label>
            <input id="cfg-sinodo-nome" value="${esc(draft.nomeSinodo)}" placeholder="Ex.: Sínodo de São Paulo">
          </div>
          <div>
            <label class="field-label">Sigla do Sínodo</label>
            <input id="cfg-sinodo-sigla" value="${esc(draft.siglaSinodo)}" placeholder="SSP" maxlength="10">
          </div>
        </div>

        <div style="margin-top:14px;">
          <label class="field-label">Informações adicionais</label>
          <textarea id="cfg-info" placeholder="Endereço, contato, etc.">${esc(draft.infoAdicional)}</textarea>
        </div>

        <div style="margin-top:16px;">
          <button class="btn btn-primary" id="cfg-salvar">${icon("check", 14)} Salvar configurações</button>
        </div>
      `;

      container.querySelector("#cfg-nome").addEventListener("input", e => draft.nomePresbiterio = e.target.value);
      container.querySelector("#cfg-sigla").addEventListener("input", e => draft.sigla = e.target.value);
      container.querySelector("#cfg-sinodo-nome").addEventListener("input", e => draft.nomeSinodo = e.target.value);
      container.querySelector("#cfg-sinodo-sigla").addEventListener("input", e => draft.siglaSinodo = e.target.value);
      container.querySelector("#cfg-info").addEventListener("input", e => draft.infoAdicional = e.target.value);
      container.querySelector("#cfg-secretario-nome").addEventListener("input", e => draft.secretarioNome = e.target.value);
      container.querySelector("#cfg-secretario-cargo").addEventListener("input", e => draft.secretarioCargo = e.target.value);
      container.querySelector("#cfg-logo-file").addEventListener("change", e => onLogoFile(e.target.files[0]));
      const removeBtn = container.querySelector("#cfg-logo-remove");
      if (removeBtn) removeBtn.addEventListener("click", removerLogo);
      container.querySelector("#assinatura-modo-imagem").addEventListener("click", () => { draft.assinaturaTipo = "imagem"; renderActiveTab(); });
      container.querySelector("#assinatura-modo-gerada").addEventListener("click", () => { draft.assinaturaTipo = "gerada"; renderActiveTab(); });
      const assinaturaFile = container.querySelector("#cfg-assinatura-file");
      if (assinaturaFile) assinaturaFile.addEventListener("change", e => onAssinaturaFile(e.target.files[0]));
      const assinaturaRemove = container.querySelector("#cfg-assinatura-remove");
      if (assinaturaRemove) assinaturaRemove.addEventListener("click", removerAssinatura);
      container.querySelectorAll("[data-fonte-etiqueta]").forEach(el => el.addEventListener("change", e => onFonteEtiquetaFile(el.getAttribute("data-fonte-etiqueta"), e.target.files[0])));
      const fonteRemove = container.querySelector("#cfg-fonte-remove");
      if (fonteRemove) fonteRemove.addEventListener("click", removerFonteEtiqueta);
      const assinaturaGerar = container.querySelector("#assinatura-gerar");
      if (assinaturaGerar) assinaturaGerar.addEventListener("click", gerarAssinaturaAutomatica);
      container.querySelector("#cfg-salvar").addEventListener("click", salvarConfig);
    }

    /* -- membros efetivos (pastores + presbíteros) -- */
    let membrosSub = "pastores";
    const MEMBROS_SUBS = [
      { id: "pastores", label: "Pastores", icon: "user", render: renderPastores },
      { id: "presbiteros", label: "Igrejas", icon: "church", render: renderIgrejas },
    ];
    function renderMembrosEfetivos(container){
      container.innerHTML = `
        <p class="section-sub" style="margin:-4px 0 14px;">Membros efetivos do presbitério, conforme art. 66, alínea "a" da CI/IPB: os pastores e os presbíteros que representam as igrejas (cadastrados aqui a partir da igreja que representam).</p>
        <div style="display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap;">
          ${MEMBROS_SUBS.map(s => `<button class="btn btn-sm ${membrosSub===s.id?"btn-primary":""}" data-membros-sub="${s.id}">${icon(s.icon, 13)} ${esc(s.label)}</button>`).join("")}
        </div>
        <div id="membros-sub-body"></div>
      `;
      container.querySelectorAll("[data-membros-sub]").forEach(el => el.addEventListener("click", () => { membrosSub = el.getAttribute("data-membros-sub"); renderActiveTab(); }));
      MEMBROS_SUBS.find(s => s.id === membrosSub).render(container.querySelector("#membros-sub-body"));
    }

    /* -- comissão executiva -- */
    let formExecutiva = { cargo: CARGOS_EXECUTIVOS[0], nome: "", ano: String(new Date().getFullYear()) };
    const execList = () => STATE.comissaoExecutiva || [];
    function addExecutiva(){ if(!formExecutiva.nome.trim()) return; setSlice("comissaoExecutiva", [...execList(), { id: uid(), ...formExecutiva }]); formExecutiva = { cargo: CARGOS_EXECUTIVOS[0], nome: "", ano: String(new Date().getFullYear()) }; renderActiveTab(); }
    async function removeExecutiva(id){ if(await confirmModal("Remover este membro da comissão executiva?")) setSlice("comissaoExecutiva", execList().filter(m => m.id !== id)); }
    function renderExecutiva(container){
      const list = execList();
      container.innerHTML = `
        <p class="section-sub" style="margin:-4px 0 14px;">A Comissão Executiva atua em nome do presbitério nos intervalos entre as reuniões plenárias. Os mandatos são anuais, exceto o de Secretário Executivo, que dura três anos, e começam no ano seguinte ao da eleição (eleito em 2025, cumpre o mandato a partir de 2026). Eleições também podem ser registradas diretamente na sub-aba "Eleição" de cada reunião.</p>
        <div style="display:grid; grid-template-columns:1.2fr 1.6fr 90px auto; gap:8px; margin-bottom:14px;">
          <select id="ex-cargo">${CARGOS_EXECUTIVOS.map(c => `<option ${formExecutiva.cargo===c?"selected":""}>${esc(c)}</option>`).join("")}</select>
          <select id="ex-nome"><option value="">Selecionar membro efetivo...</option>${membrosEfetivosGlobais().map(nm => `<option value="${esc(nm)}" ${formExecutiva.nome===nm?"selected":""}>${esc(nm)}</option>`).join("")}</select>
          <input type="number" placeholder="Ano da eleição" title="Ano em que a pessoa foi eleita — o mandato começa no ano seguinte" id="ex-ano" value="${esc(formExecutiva.ano)}">
          <button class="btn btn-primary" id="ex-add">${icon("plus", 14)} Adicionar</button>
        </div>
        ${list.length === 0 ? '<p class="empty-note">Nenhum membro cadastrado ainda.</p>' : ""}
        <div class="list-col">
          ${list.map(m => {
            const anos = mandatoAnos(m.cargo);
            const anoTexto = mandatoAnoTexto(m.ano, anos);
            const mandatoTexto = anoTexto ? `Mandato ${anoTexto} (${anos} ano${anos>1?"s":""})` : `Mandato de ${anos} ano${anos>1?"s":""}`;
            return `
            <div class="row-card">
              <span style="display:flex; gap:10px; align-items:center;">${pillHtml(m.cargo || "—", "gold")} <b>${esc(m.nome)}</b> <span style="color:var(--muted); font-size:11.5px;">${mandatoTexto}</span></span>
              <button class="btn-icon" data-remove-exec="${m.id}">${icon("trash", 15)}</button>
            </div>
          `;
          }).join("")}
        </div>
      `;
      container.querySelector("#ex-cargo").addEventListener("change", e => formExecutiva.cargo = e.target.value);
      container.querySelector("#ex-nome").addEventListener("change", e => formExecutiva.nome = e.target.value);
      container.querySelector("#ex-ano").addEventListener("input", e => formExecutiva.ano = e.target.value);
      container.querySelector("#ex-add").addEventListener("click", addExecutiva);
      container.querySelectorAll("[data-remove-exec]").forEach(el => el.addEventListener("click", () => removeExecutiva(el.getAttribute("data-remove-exec"))));
    }

    /* Quem ocupa hoje um cargo da Comissão Executiva: entre os registros
       daquele cargo, o de ano (de eleição) mais recente. */
    function execAtual(cargo){
      const candidatos = execList().filter(m => m.cargo === cargo);
      return candidatos.reduce((best, m) => (!best || Number(m.ano) >= Number(best.ano)) ? m : best, null);
    }

    /* -- conselho fiscal: 3 titulares e 3 suplentes, mesmo padrão de
       seleção e mandato (ano da eleição) da Comissão Executiva -- */
    let formFiscal = { condicao: "titular", nome: "", ano: String(new Date().getFullYear()) };
    const fiscalList = () => STATE.conselhoFiscal || [];
    function addFiscal(){ if(!formFiscal.nome.trim()) return; setSlice("conselhoFiscal", [...fiscalList(), { id: uid(), ...formFiscal }]); formFiscal = { condicao: formFiscal.condicao, nome: "", ano: formFiscal.ano }; renderActiveTab(); }
    async function removeFiscal(id){ if(await confirmModal("Remover este membro do conselho fiscal?")) setSlice("conselhoFiscal", fiscalList().filter(m => m.id !== id)); }
    function renderFiscal(container){
      const list = fiscalList();
      const titulares = list.filter(m => m.condicao === "titular");
      const suplentes = list.filter(m => m.condicao === "suplente");
      const grupoHtml = (titulo, membros) => `
        <div style="margin-bottom:12px;">
          <p class="field-label" style="margin-bottom:6px;">${titulo} (${membros.length})</p>
          ${membros.length === 0 ? '<p class="empty-note" style="margin:0;">Nenhum membro cadastrado ainda.</p>' : `
            <div class="list-col">
              ${membros.map(m => {
                const anoTexto = mandatoAnoTexto(m.ano, 1);
                return `
                <div class="row-card">
                  <span style="display:flex; gap:10px; align-items:center;"><b>${esc(m.nome)}</b>${anoTexto ? `<span style="color:var(--muted); font-size:11.5px;">Mandato ${anoTexto}</span>` : ""}</span>
                  <button class="btn-icon" data-remove-fiscal="${m.id}">${icon("trash", 15)}</button>
                </div>
              `;
              }).join("")}
            </div>
          `}
        </div>
      `;
      container.innerHTML = `
        <p class="section-sub" style="margin:-4px 0 14px;">O Conselho Fiscal é composto por 3 membros titulares e 3 suplentes, eleitos pelo presbitério. O mandato começa no ano seguinte ao da eleição (eleito em 2025, cumpre o mandato a partir de 2026).</p>
        <div style="display:grid; grid-template-columns:1fr 1.6fr 110px auto; gap:8px; margin-bottom:14px;">
          <select id="cf-condicao">
            <option value="titular" ${formFiscal.condicao==="titular"?"selected":""}>Titular</option>
            <option value="suplente" ${formFiscal.condicao==="suplente"?"selected":""}>Suplente</option>
          </select>
          <select id="cf-nome"><option value="">Selecionar membro efetivo...</option>${membrosEfetivosGlobais().map(nm => `<option value="${esc(nm)}" ${formFiscal.nome===nm?"selected":""}>${esc(nm)}</option>`).join("")}</select>
          <input type="number" placeholder="Ano da eleição" title="Ano em que a pessoa foi eleita — o mandato começa no ano seguinte" id="cf-ano" value="${esc(formFiscal.ano)}">
          <button class="btn btn-primary" id="cf-add">${icon("plus", 14)} Adicionar</button>
        </div>
        ${grupoHtml("Titulares", titulares)}
        ${grupoHtml("Suplentes", suplentes)}
      `;
      container.querySelector("#cf-condicao").addEventListener("change", e => formFiscal.condicao = e.target.value);
      container.querySelector("#cf-nome").addEventListener("change", e => formFiscal.nome = e.target.value);
      container.querySelector("#cf-ano").addEventListener("input", e => formFiscal.ano = e.target.value);
      container.querySelector("#cf-add").addEventListener("click", addFiscal);
      container.querySelectorAll("[data-remove-fiscal]").forEach(el => el.addEventListener("click", () => removeFiscal(el.getAttribute("data-remove-fiscal"))));
    }

    /* -- comitê gestor: sempre o presidente e o tesoureiro atuais da
       Comissão Executiva (derivados automaticamente, nunca digitados
       aqui) + 2 membros extras escolhidos entre os membros efetivos -- */
    function renderGestor(container){
      const cg = STATE.comiteGestor || { membro1: "", membro2: "" };
      const presidente = execAtual("Presidente");
      const tesoureiro = execAtual("Tesoureiro");
      const membros = membrosEfetivosGlobais();
      const linhaFixa = (label, m) => `
        <div class="row-card">
          <span style="display:flex; gap:10px; align-items:center;">${pillHtml(label, "gold")} ${m ? `<b>${esc(m.nome)}</b>` : `<span style="color:var(--muted); font-style:italic;">a definir</span>`}</span>
          <span style="color:var(--muted); font-size:11px;">${m ? "definido pela Comissão Executiva" : "cadastre em Comissão executiva"}</span>
        </div>
      `;
      container.innerHTML = `
        <p class="section-sub" style="margin:-4px 0 14px;">O Comitê Gestor é composto sempre pelo Presidente e pelo Tesoureiro do presbitério (os mesmos da Comissão Executiva, atualizados automaticamente de lá) e mais 2 membros.</p>
        <div class="list-col" style="margin-bottom:14px;">
          ${linhaFixa("Presidente", presidente)}
          ${linhaFixa("Tesoureiro", tesoureiro)}
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div>
            <label class="field-label">Membro</label>
            <select id="cg-membro1"><option value="">Selecionar membro efetivo...</option>${membros.map(nm => `<option value="${esc(nm)}" ${cg.membro1===nm?"selected":""}>${esc(nm)}</option>`).join("")}</select>
          </div>
          <div>
            <label class="field-label">Membro</label>
            <select id="cg-membro2"><option value="">Selecionar membro efetivo...</option>${membros.map(nm => `<option value="${esc(nm)}" ${cg.membro2===nm?"selected":""}>${esc(nm)}</option>`).join("")}</select>
          </div>
        </div>
      `;
      container.querySelector("#cg-membro1").addEventListener("change", e => setSlice("comiteGestor", { ...(STATE.comiteGestor || {}), membro1: e.target.value }));
      container.querySelector("#cg-membro2").addEventListener("change", e => setSlice("comiteGestor", { ...(STATE.comiteGestor || {}), membro2: e.target.value }));
    }

    /* -- secretarias de causas (apenas o secretário responsável, sem
       composição de membros) -- */
    let formSecretaria = { nome: "", responsavel: "" };
    const secList = () => STATE.secretariasCausas || [];
    function addSecretaria(){ if(!formSecretaria.nome.trim()) return; setSlice("secretariasCausas", [...secList(), { id: uid(), ...formSecretaria }]); formSecretaria = { nome: "", responsavel: "" }; renderActiveTab(); }
    async function removeSecretaria(id){ if(await confirmModal("Excluir esta secretaria?")) setSlice("secretariasCausas", secList().filter(s => s.id !== id)); }
    function setResponsavelSecretaria(id, responsavel){ setSlice("secretariasCausas", secList().map(s => s.id === id ? { ...s, responsavel } : s)); }
    function renderSecretarias(container){
      const list = secList();
      const nomesDisponiveis = [...(STATE.pastores || []).map(p => p.nome), ...(STATE.igrejas || []).map(i => i.nome)];
      container.innerHTML = `
        <p class="section-sub" style="margin:-4px 0 14px;">Secretarias que cuidam de causas específicas do presbitério (ex.: Educação Cristã, Missões, Ação Social). Cada secretaria tem apenas um secretário responsável.</p>
        <div style="display:grid; grid-template-columns:1.4fr 1.2fr auto; gap:8px; margin-bottom:14px;">
          <input placeholder="Nome da secretaria (ex.: Secretaria de Missões)" id="sec-nome" value="${esc(formSecretaria.nome)}">
          <span style="position:relative;">
            <input placeholder="Secretário responsável — digite ou busque" id="sec-responsavel" list="sec-responsavel-datalist" value="${esc(formSecretaria.responsavel)}" style="padding-left:28px;">
            <span style="position:absolute; left:8px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none;">${icon("search", 13)}</span>
            <datalist id="sec-responsavel-datalist">${nomesDisponiveis.map(nm => `<option value="${esc(nm)}">`).join("")}</datalist>
          </span>
          <button class="btn btn-primary" id="sec-add">${icon("plus", 14)} Cadastrar</button>
        </div>
        ${list.length === 0 ? '<p class="empty-note">Nenhuma secretaria cadastrada ainda.</p>' : ""}
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:10px;">
          ${list.map(s => `
            <div style="border:1px solid var(--line); border-radius:5px; background:#fff; padding:10px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:7px;">
                <b style="font-size:13px;">${esc(s.nome)}</b>
                <button class="btn-icon" data-remove-sec="${s.id}">${icon("trash", 13)}</button>
              </div>
              <span style="position:relative; display:block;">
                <input style="font-size:11.5px; padding-left:26px;" placeholder="Secretário responsável" list="sec-resp-edit-datalist-${s.id}" data-sec-responsavel="${s.id}" value="${esc(s.responsavel || "")}">
                <span style="position:absolute; left:7px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none;">${icon("search", 11)}</span>
                <datalist id="sec-resp-edit-datalist-${s.id}">${nomesDisponiveis.map(nm => `<option value="${esc(nm)}">`).join("")}</datalist>
              </span>
            </div>
          `).join("")}
        </div>
      `;
      container.querySelector("#sec-nome").addEventListener("input", e => formSecretaria.nome = e.target.value);
      container.querySelector("#sec-responsavel").addEventListener("input", e => formSecretaria.responsavel = e.target.value);
      container.querySelector("#sec-add").addEventListener("click", addSecretaria);
      container.querySelectorAll("[data-remove-sec]").forEach(el => el.addEventListener("click", () => removeSecretaria(el.getAttribute("data-remove-sec"))));
      container.querySelectorAll("[data-sec-responsavel]").forEach(el => el.addEventListener("change", e => setResponsavelSecretaria(el.getAttribute("data-sec-responsavel"), e.target.value)));
    }

    /* -- comissões permanentes -- */
    let formPermanente = { nome: "" };
    const permMembroDraft = {};
    const permList = () => STATE.comissoesPermanentes || [];
    function addPermanente(){ if(!formPermanente.nome.trim()) return; setSlice("comissoesPermanentes", [...permList(), { id: uid(), membros: [], observacoes: "", status: "Em andamento", relator: "", subrelator: "", ...formPermanente }]); formPermanente = { nome: "" }; renderActiveTab(); }
    async function removePermanente(id){ if(await confirmModal("Excluir esta comissão permanente?")) setSlice("comissoesPermanentes", permList().filter(c => c.id !== id)); }
    function addMembroPermanente(id){ const nome = (permMembroDraft[id] || "").trim(); if (!nome) return; permMembroDraft[id] = ""; setSlice("comissoesPermanentes", permList().map(c => c.id === id ? { ...c, membros: [...c.membros, nome] } : c)); }
    function removeMembroPermanente(id, idx){
      setSlice("comissoesPermanentes", permList().map(c => {
        if (c.id !== id) return c;
        const removido = c.membros[idx];
        const membros = c.membros.filter((_, i) => i !== idx);
        return { ...c, membros, relator: c.relator === removido ? "" : c.relator, subrelator: c.subrelator === removido ? "" : c.subrelator };
      }));
    }
    function setStatusPermanente(id, status){ setSlice("comissoesPermanentes", permList().map(c => c.id === id ? { ...c, status } : c)); }
    function setObservacoesPermanente(id, observacoes){ setSlice("comissoesPermanentes", permList().map(c => c.id === id ? { ...c, observacoes } : c)); }
    function setRelatorPermanente(id, nome){ setSlice("comissoesPermanentes", permList().map(c => c.id === id ? { ...c, relator: nome } : c)); }
    function setSubrelatorPermanente(id, nome){ setSlice("comissoesPermanentes", permList().map(c => c.id === id ? { ...c, subrelator: nome } : c)); }
    function renderPermanentes(container){
      const list = permList();
      const elegiveis = membrosEfetivosGlobais();
      container.innerHTML = `
        <p class="section-sub" style="margin:-4px 0 14px;">São aquelas que atuam durante os interregnos (período entre as reuniões do presbitério) para tratar de assuntos que lhes sejam entregues pelo Plenário. O mandato dessas comissões se extingue na reunião ordinária seguinte do concílio, ocasião em que deverão apresentar o seu relatório. Apenas membros efetivos do presbitério podem compor comissões.</p>
        <div style="display:flex; gap:8px; margin-bottom:14px;">
          <input placeholder="Nome da comissão permanente" id="perm-nome" value="${esc(formPermanente.nome)}">
          <button class="btn btn-primary" id="perm-add">${icon("plus", 14)} Criar</button>
        </div>
        ${list.length === 0 ? '<p class="empty-note">Nenhuma comissão permanente cadastrada ainda.</p>' : ""}
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:10px;">
          ${list.map(c => `
            <div style="border:1px solid var(--line); border-radius:5px; background:#fff; padding:10px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:7px; gap:8px;">
                <b style="font-size:13px;">${esc(c.nome)}</b>
                <span style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                  <select style="font-size:11px; padding:3px 5px; width:auto;" data-perm-status="${c.id}">
                    <option ${c.status==="Em andamento"?"selected":""}>Em andamento</option>
                    <option ${c.status==="Relatório entregue"?"selected":""}>Relatório entregue</option>
                  </select>
                  <button class="btn-icon" data-remove-perm="${c.id}">${icon("trash", 13)}</button>
                </span>
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:7px;">
                ${c.membros.map((m, i) => `<span style="display:inline-flex; align-items:center; gap:4px; font-size:11.5px; background:var(--green-soft); color:var(--green); padding:3px 7px; border-radius:999px;">${esc(m)}${c.relator===m?" (relator)":c.subrelator===m?" (subrelator)":""} <span style="cursor:pointer;" data-perm-membro-remove="${c.id}:${i}">${icon("x", 10)}</span></span>`).join("")}
                ${c.membros.length === 0 ? '<span class="empty-note" style="margin:0;">Nenhum membro ainda.</span>' : ""}
              </div>
              <div style="display:flex; gap:6px; margin-bottom:8px;">
                <select style="font-size:11.5px;" data-perm-membro-select="${c.id}">
                  <option value="">Selecionar membro efetivo...</option>
                  ${elegiveis.map(nm => `<option value="${esc(nm)}">${esc(nm)}</option>`).join("")}
                </select>
                <button class="btn btn-sm" data-perm-membro-add="${c.id}">${icon("plus", 12)}</button>
              </div>
              ${c.membros.length > 0 ? `
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px;">
                <select style="font-size:11px;" data-perm-relator="${c.id}">
                  <option value="">Relator...</option>
                  ${c.membros.map(m => `<option value="${esc(m)}" ${c.relator===m?"selected":""}>${esc(m)}</option>`).join("")}
                </select>
                <select style="font-size:11px;" data-perm-subrelator="${c.id}">
                  <option value="">Sub-relator...</option>
                  ${c.membros.map(m => `<option value="${esc(m)}" ${c.subrelator===m?"selected":""}>${esc(m)}</option>`).join("")}
                </select>
              </div>` : ""}
              <input style="font-size:11.5px;" placeholder="Observações (assunto entregue pelo plenário, prazo, etc.)" data-perm-obs="${c.id}" value="${esc(c.observacoes || "")}">
            </div>
          `).join("")}
        </div>
      `;
      container.querySelector("#perm-nome").addEventListener("input", e => formPermanente.nome = e.target.value);
      container.querySelector("#perm-add").addEventListener("click", addPermanente);
      container.querySelectorAll("[data-remove-perm]").forEach(el => el.addEventListener("click", () => removePermanente(el.getAttribute("data-remove-perm"))));
      container.querySelectorAll("[data-perm-status]").forEach(el => el.addEventListener("change", e => setStatusPermanente(el.getAttribute("data-perm-status"), e.target.value)));
      container.querySelectorAll("[data-perm-membro-select]").forEach(el => el.addEventListener("change", e => permMembroDraft[el.getAttribute("data-perm-membro-select")] = e.target.value));
      container.querySelectorAll("[data-perm-membro-add]").forEach(el => el.addEventListener("click", () => addMembroPermanente(el.getAttribute("data-perm-membro-add"))));
      container.querySelectorAll("[data-perm-membro-remove]").forEach(el => el.addEventListener("click", () => {
        const [id, idx] = el.getAttribute("data-perm-membro-remove").split(":");
        removeMembroPermanente(id, Number(idx));
      }));
      container.querySelectorAll("[data-perm-relator]").forEach(el => el.addEventListener("change", e => setRelatorPermanente(el.getAttribute("data-perm-relator"), e.target.value)));
      container.querySelectorAll("[data-perm-subrelator]").forEach(el => el.addEventListener("change", e => setSubrelatorPermanente(el.getAttribute("data-perm-subrelator"), e.target.value)));
      container.querySelectorAll("[data-perm-obs]").forEach(el => el.addEventListener("change", e => setObservacoesPermanente(el.getAttribute("data-perm-obs"), e.target.value)));
    }

    /* -- comissões temporárias (somente leitura — nascem e se dissolvem dentro das reuniões) -- */
    function renderTemporarias(container){
      const list = allComissoes().sort((a, b) => (b.reuniaoData || "").localeCompare(a.reuniaoData || ""));
      container.innerHTML = `
        <p class="section-sub" style="margin:-4px 0 14px;">São aquelas que funcionam exclusivamente durante as reuniões ordinárias ou extraordinárias do concílio. Para criar uma, abra a reunião na aba Reuniões e use a sub-aba Comissões.</p>
        ${list.length === 0 ? '<p class="empty-note">Nenhuma comissão temporária formada até agora.</p>' : ""}
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:10px;">
          ${list.map(c => `
            <div style="border:1px solid var(--line); border-radius:5px; background:#fff; padding:10px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; gap:8px;">
                <b style="font-size:13px;">${esc(c.nome)}</b>
                <span style="font-size:11px; color:var(--muted); flex-shrink:0;">${fmtDate(c.reuniaoData)}${c.reuniaoTipo ? " · " + esc(c.reuniaoTipo) : ""}</span>
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:5px;">
                ${(c.membros || []).map(m => `<span style="font-size:11.5px; background:var(--green-soft); color:var(--green); padding:3px 7px; border-radius:999px;">${esc(m)}</span>`).join("")}
                ${(c.membros || []).length === 0 ? '<span class="empty-note" style="margin:0;">Nenhum membro registrado.</span>' : ""}
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }

    /* -- comissões especiais -- */
    let formEspecial = { nome: "" };
    const espMembroDraft = {};
    const espList = () => STATE.comissoesEspeciais || [];
    function addEspecial(){ if(!formEspecial.nome.trim()) return; setSlice("comissoesEspeciais", [...espList(), { id: uid(), membros: [], atribuicao: "", status: "Em andamento", relator: "", subrelator: "", ...formEspecial }]); formEspecial = { nome: "" }; renderActiveTab(); }
    async function removeEspecial(id){ if(await confirmModal("Excluir esta comissão especial?")) setSlice("comissoesEspeciais", espList().filter(c => c.id !== id)); }
    function addMembroEspecial(id){ const nome = (espMembroDraft[id] || "").trim(); if (!nome) return; espMembroDraft[id] = ""; setSlice("comissoesEspeciais", espList().map(c => c.id === id ? { ...c, membros: [...c.membros, nome] } : c)); }
    function removeMembroEspecial(id, idx){
      setSlice("comissoesEspeciais", espList().map(c => {
        if (c.id !== id) return c;
        const removido = c.membros[idx];
        const membros = c.membros.filter((_, i) => i !== idx);
        return { ...c, membros, relator: c.relator === removido ? "" : c.relator, subrelator: c.subrelator === removido ? "" : c.subrelator };
      }));
    }
    function setStatusEspecial(id, status){ setSlice("comissoesEspeciais", espList().map(c => c.id === id ? { ...c, status } : c)); }
    function setAtribuicaoEspecial(id, atribuicao){ setSlice("comissoesEspeciais", espList().map(c => c.id === id ? { ...c, atribuicao } : c)); }
    function setRelatorEspecial(id, nome){ setSlice("comissoesEspeciais", espList().map(c => c.id === id ? { ...c, relator: nome } : c)); }
    function setSubrelatorEspecial(id, nome){ setSlice("comissoesEspeciais", espList().map(c => c.id === id ? { ...c, subrelator: nome } : c)); }
    function renderEspeciais(container){
      const list = espList();
      const elegiveis = membrosEfetivosGlobais();
      container.innerHTML = `
        <p class="section-sub" style="margin:-4px 0 14px;">São formadas para receber poderes específicos e tratar, em definitivo, de determinados assuntos. O mandato de uma comissão especial termina apenas quando ela apresenta o seu relatório final. Como regra, elas devem ser constituídas por, pelo menos, três ministros e dois presbíteros. Apenas membros efetivos do presbitério podem compor comissões.</p>
        <div style="display:flex; gap:8px; margin-bottom:14px;">
          <input placeholder="Nome da comissão especial" id="esp-nome" value="${esc(formEspecial.nome)}">
          <button class="btn btn-primary" id="esp-add">${icon("plus", 14)} Criar</button>
        </div>
        ${list.length === 0 ? '<p class="empty-note">Nenhuma comissão especial cadastrada ainda.</p>' : ""}
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:10px;">
          ${list.map(c => `
            <div style="border:1px solid var(--line); border-radius:5px; background:#fff; padding:10px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:7px; gap:8px;">
                <b style="font-size:13px;">${esc(c.nome)}</b>
                <span style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                  <select style="font-size:11px; padding:3px 5px; width:auto;" data-esp-status="${c.id}">
                    <option ${c.status==="Em andamento"?"selected":""}>Em andamento</option>
                    <option ${c.status==="Concluída"?"selected":""}>Concluída</option>
                  </select>
                  <button class="btn-icon" data-remove-esp="${c.id}">${icon("trash", 13)}</button>
                </span>
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:7px;">
                ${c.membros.map((m, i) => `<span style="display:inline-flex; align-items:center; gap:4px; font-size:11.5px; background:var(--green-soft); color:var(--green); padding:3px 7px; border-radius:999px;">${esc(m)}${c.relator===m?" (relator)":c.subrelator===m?" (subrelator)":""} <span style="cursor:pointer;" data-esp-membro-remove="${c.id}:${i}">${icon("x", 10)}</span></span>`).join("")}
                ${c.membros.length === 0 ? '<span class="empty-note" style="margin:0;">Nenhum membro ainda (mín. 3 ministros e 2 presbíteros).</span>' : ""}
              </div>
              <div style="display:flex; gap:6px; margin-bottom:8px;">
                <select style="font-size:11.5px;" data-esp-membro-select="${c.id}">
                  <option value="">Selecionar membro efetivo...</option>
                  ${elegiveis.map(nm => `<option value="${esc(nm)}">${esc(nm)}</option>`).join("")}
                </select>
                <button class="btn btn-sm" data-esp-membro-add="${c.id}">${icon("plus", 12)}</button>
              </div>
              ${c.membros.length > 0 ? `
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px;">
                <select style="font-size:11px;" data-esp-relator="${c.id}">
                  <option value="">Relator...</option>
                  ${c.membros.map(m => `<option value="${esc(m)}" ${c.relator===m?"selected":""}>${esc(m)}</option>`).join("")}
                </select>
                <select style="font-size:11px;" data-esp-subrelator="${c.id}">
                  <option value="">Sub-relator...</option>
                  ${c.membros.map(m => `<option value="${esc(m)}" ${c.subrelator===m?"selected":""}>${esc(m)}</option>`).join("")}
                </select>
              </div>` : ""}
              <input style="font-size:11.5px;" placeholder="Poderes / assunto a tratar em definitivo" data-esp-atrib="${c.id}" value="${esc(c.atribuicao || "")}">
            </div>
          `).join("")}
        </div>
      `;
      container.querySelector("#esp-nome").addEventListener("input", e => formEspecial.nome = e.target.value);
      container.querySelector("#esp-add").addEventListener("click", addEspecial);
      container.querySelectorAll("[data-remove-esp]").forEach(el => el.addEventListener("click", () => removeEspecial(el.getAttribute("data-remove-esp"))));
      container.querySelectorAll("[data-esp-status]").forEach(el => el.addEventListener("change", e => setStatusEspecial(el.getAttribute("data-esp-status"), e.target.value)));
      container.querySelectorAll("[data-esp-membro-select]").forEach(el => el.addEventListener("change", e => espMembroDraft[el.getAttribute("data-esp-membro-select")] = e.target.value));
      container.querySelectorAll("[data-esp-membro-add]").forEach(el => el.addEventListener("click", () => addMembroEspecial(el.getAttribute("data-esp-membro-add"))));
      container.querySelectorAll("[data-esp-membro-remove]").forEach(el => el.addEventListener("click", () => {
        const [id, idx] = el.getAttribute("data-esp-membro-remove").split(":");
        removeMembroEspecial(id, Number(idx));
      }));
      container.querySelectorAll("[data-esp-relator]").forEach(el => el.addEventListener("change", e => setRelatorEspecial(el.getAttribute("data-esp-relator"), e.target.value)));
      container.querySelectorAll("[data-esp-subrelator]").forEach(el => el.addEventListener("change", e => setSubrelatorEspecial(el.getAttribute("data-esp-subrelator"), e.target.value)));
      container.querySelectorAll("[data-esp-atrib]").forEach(el => el.addEventListener("change", e => setAtribuicaoEspecial(el.getAttribute("data-esp-atrib"), e.target.value)));
    }

    let subTab = "geral";
    /* Agrupados por assunto, para a lista lateral ficar mais fácil de ler. */
    const CONFIG_SUBS = [
      { grupo: "Presbitério", id: "geral", label: "Configurações gerais", icon: "gear", render: renderGeral },
      { grupo: "Pessoas", id: "membros", label: "Membros efetivos", icon: "users", render: renderMembrosEfetivos },
      { grupo: "Pessoas", id: "candidatos", label: "Candidatos", icon: "graduation", render: renderCandidatos },
      { grupo: "Órgãos", id: "executiva", label: "Comissão executiva", icon: "user", render: renderExecutiva },
      { grupo: "Órgãos", id: "fiscal", label: "Conselho fiscal", icon: "shield", render: renderFiscal },
      { grupo: "Órgãos", id: "gestor", label: "Comitê gestor", icon: "target", render: renderGestor },
      { grupo: "Comissões e secretarias", id: "secretarias", label: "Secretarias de causas", icon: "clipboard", render: renderSecretarias },
      { grupo: "Comissões e secretarias", id: "permanentes", label: "Comissões permanentes", icon: "layers", render: renderPermanentes },
      { grupo: "Comissões e secretarias", id: "temporarias", label: "Comissões temporárias", icon: "layers", render: renderTemporarias },
      { grupo: "Comissões e secretarias", id: "especiais", label: "Comissões especiais", icon: "layers", render: renderEspeciais },
    ];

    return {
      mount(container){
        container.innerHTML = `
          <div class="section">
            <div class="section-head">
              <div class="section-head-left">
                <span class="section-icon">${icon("church", 18)}</span>
                <div>
                  <h3 class="section-title">Meu presbitério</h3>
                  <p class="section-sub">Identidade, membros e comissões do presbitério</p>
                </div>
              </div>
            </div>
            <div class="presb-layout">
              <div class="presb-sidebar">
                ${CONFIG_SUBS.map((s, i) => `${i === 0 || CONFIG_SUBS[i-1].grupo !== s.grupo ? `<div class="presb-sidebar-group">${esc(s.grupo)}</div>` : ""}<button class="presb-sidebar-btn ${subTab===s.id?"active":""}" data-config-sub="${s.id}" ${subTab===s.id?'aria-current="page"':""}>${icon(s.icon, 14)} ${esc(s.label)}</button>`).join("")}
              </div>
              <div class="presb-content" id="config-sub-body"></div>
            </div>
          </div>
        `;
        container.querySelectorAll("[data-config-sub]").forEach(el => el.addEventListener("click", () => { subTab = el.getAttribute("data-config-sub"); renderActiveTab(); }));
        CONFIG_SUBS.find(s => s.id === subTab).render(container.querySelector("#config-sub-body"));
      }
    };
  })();

  /* @@TAB_CONFIG@@ */

  /* ============================================================
     Boot
     ============================================================ */
  /* Botões que só mostram um ícone (lápis, lixeira, olho…) já têm um
     "title"; copiamos para aria-label para leitores de tela anunciarem
     o nome do botão. Vale para tudo que for desenhado depois. */
  function nomearBotoesDeIcone(raiz){
    raiz.querySelectorAll("button[title]:not([aria-label]), a[title]:not([aria-label])").forEach(el => el.setAttribute("aria-label", el.getAttribute("title")));
  }
  new MutationObserver(muts => {
    for (const m of muts) m.addedNodes.forEach(n => { if (n.nodeType === 1) nomearBotoesDeIcone(n); });
  }).observe(document.body, { childList: true, subtree: true });

  async function init(){
    if (!CLOUD_ATIVO){
      await loadAll();
      renderShell();
      return;
    }
    document.getElementById("app").innerHTML = `<div style="min-height:100vh; display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:13px;">Carregando…</div>`;
    let authInitialized = false;
    supa.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session ? session.user : null;
      const wasLoggedIn = !!CURRENT_USER;
      const isLoggedIn = !!newUser;
      CURRENT_USER = newUser;
      if (!authInitialized){
        authInitialized = true;
        if (isLoggedIn){ await loadAll(); renderShell(); } else { renderAuthGate(); }
        return;
      }
      if (isLoggedIn && !wasLoggedIn){ await loadAll(); renderShell(); }
      else if (!isLoggedIn && wasLoggedIn){ STORE_READY = false; authMode = "login"; authError = ""; renderAuthGate(); }
      /* mesmo usuário (ex.: renovação de token em segundo plano): não recarrega a tela */
    });
  }
  init();
})();
