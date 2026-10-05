'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const STORAGE_KEY = 'logicaSemana21V3';
  const defaultState = {student:{}, quizzes:{}, activity:{}, codeChecks:{}, tests:{}, checklist:{}, theme:'light'};
  let state = loadState();

  function loadState(){
    try { return {...defaultState, ...(JSON.parse(localStorage.getItem(STORAGE_KEY))||{})}; }
    catch { return structuredClone(defaultState); }
  }
  function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); showSaved(); updateProgress(); }
  let saveTimer;
  function showSaved(){ const el=$('#saveStatus'); if(!el) return; el.textContent='✓ Progresso salvo'; el.style.opacity='1'; clearTimeout(saveTimer); saveTimer=setTimeout(()=>el.style.opacity='.65',1200); }
  function escapeHTML(v=''){ return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function normalize(v=''){ return v.toLowerCase().replace(/\s+/g,'').replace(/\(|\)/g,m=>m); }

  // Tema
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
  if(!state.theme) state.theme = prefersDark ? 'dark' : 'light';
  applyTheme();
  $('#themeToggle').addEventListener('click',()=>{ state.theme = state.theme==='dark'?'light':'dark'; applyTheme(); saveState(); });
  function applyTheme(){ document.documentElement.dataset.theme=state.theme; const b=$('#themeToggle'); b.innerHTML=state.theme==='dark'?'☀️ <span>Modo claro</span>':'🌙 <span>Modo escuro</span>'; }

  // Menu móvel
  $('#menuToggle').addEventListener('click',()=>$('#mainNav').classList.toggle('open'));
  $$('#mainNav a').forEach(a=>a.addEventListener('click',()=>$('#mainNav').classList.remove('open')));

  // Identificação
  const studentMap={studentName:'name',studentClass:'class',studentNumber:'number',studentDate:'date'};
  Object.entries(studentMap).forEach(([id,key])=>{ const el=$('#'+id); el.value=state.student[key]||''; el.addEventListener('input',()=>{state.student[key]=el.value; saveState();}); });
  if(!state.student.date){ const d=new Date(); $('#studentDate').value=d.toISOString().slice(0,10); state.student.date=$('#studentDate').value; saveState(); }

  // Revelações
  $$('.reveal-btn').forEach(btn=>btn.addEventListener('click',()=>{ const el=$('#'+btn.dataset.reveal); el.hidden=!el.hidden; }));

  // Fluxo aula 1
  const flowText={
    entrada:'Entrada: o programa recebe um dado do usuário, como uma opção digitada.',
    processamento:'Processamento: o programa usa os dados recebidos para realizar alguma operação.',
    decisao:'Decisão: o programa compara condições e escolhe qual bloco executar.',
    saida:'Saída: o resultado é apresentado ao usuário.',
    repeticao:'Repetição: o fluxo volta ao início para permitir uma nova operação enquanto a condição permitir.'
  };
  $$('.flow-step').forEach(b=>b.addEventListener('click',()=>$('#flowDetail').textContent=flowText[b.dataset.flow]));

  // Simulador de terminal
  let terminalRunning=true;
  function showMenu(extra=''){ $('#terminalOutput').textContent=(extra?extra+'\n\n':'')+'===== PAPELARIA PONTO CERTO =====\n1 - Cadastrar produto\n2 - Consultar produto\n0 - Sair\n\nEscolha uma opção:'; }
  showMenu('Sistema iniciado.');
  $$('[data-terminal]').forEach(btn=>btn.addEventListener('click',()=>{
    if(!terminalRunning){ $('#terminalOutput').textContent+='\n\nO sistema foi encerrado. Clique em Reiniciar.'; return; }
    const op=btn.dataset.terminal;
    if(op==='1') showMenu('→ Opção 1 escolhida\nFunção cadastrar_produto(produtos) seria chamada.\n✓ Depois da operação, o menu aparece novamente.');
    if(op==='2') showMenu('→ Opção 2 escolhida\nFunção consultar_produto(produtos) seria chamada.\n✓ Depois da operação, o menu aparece novamente.');
    if(op==='0'){ terminalRunning=false; $('#terminalOutput').textContent='→ Opção 0 escolhida\nEncerrando...\n\nO laço terminou porque a condição de continuidade deixou de ser verdadeira.'; }
  }));
  $('#resetTerminal').addEventListener('click',()=>{terminalRunning=true;showMenu('Sistema reiniciado.');});

  // Banco de quizzes
  const quizzes={
    lesson1:[
      {q:'Qual etapa representa o dado fornecido pelo usuário ao programa?',o:['Entrada','Saída','Repetição','Função'],a:0,e:'A entrada é o momento em que o programa recebe dados, por exemplo por input().'},
      {q:'Depois de receber uma opção, qual estrutura pode escolher o caminho do programa?',o:['if / elif / else','print()','comentário','import'],a:0,e:'Estruturas condicionais permitem comparar a escolha e executar caminhos diferentes.'},
      {q:'Por que um menu real costuma usar repetição?',o:['Para voltar a oferecer operações até o usuário sair','Para impedir qualquer entrada','Para apagar funções','Para substituir decisões'],a:0,e:'A repetição mantém o sistema ativo e permite várias operações na mesma execução.'},
      {q:'Se a saída é “Encerrando...”, o que ela representa?',o:['Uma informação apresentada ao usuário','Uma entrada','Uma variável booleana','Uma função obrigatoriamente'],a:0,e:'Saída é aquilo que o programa apresenta como resultado ou mensagem.'}
    ],
    lesson2:[
      {q:'Qual é a principal vantagem de dividir o programa em funções?',o:['Organizar responsabilidades e facilitar manutenção','Eliminar qualquer condição','Evitar toda repetição','Fazer o computador executar sem chamadas'],a:0,e:'Funções agrupam tarefas específicas e tornam o programa mais legível e reutilizável.'},
      {q:'Depois de definir uma função, o que é necessário para executar seu código?',o:['Chamála','Renomear o arquivo','Usar somente print','Criar um else'],a:0,e:'Definir cria a função; chamar a função executa sua responsabilidade.'},
      {q:'Para que serve validar uma entrada?',o:['Verificar se ela atende às regras esperadas','Transformar toda entrada em texto','Encerrar sempre o programa','Apagar a opção inválida sem avisar'],a:0,e:'Validação evita que dados inesperados quebrem ou desviem o fluxo previsto.'},
      {q:'Qual analogia combina melhor com uma função?',o:['Um setor com responsabilidade específica','Uma tela sem botões','Um erro de sintaxe','Uma variável sem valor'],a:0,e:'Cada função pode ser entendida como um setor responsável por uma tarefa.'}
    ],
    lesson3:[
      {q:'O que o while faz no menu da Papelaria Ponto Certo?',o:['Mantém o menu em execução enquanto a condição permitir','Executa apenas uma vez','Substitui todas as funções','Impede qualquer saída'],a:0,e:'O while repete o bloco e permite que o menu apareça novamente.'},
      {q:'Se continuar começa como True e muda para False quando o usuário escolhe 0, o que acontece?',o:['O laço termina','O laço fica infinito obrigatoriamente','A lista é apagada','A função mostrar_menu deixa de existir'],a:0,e:'Quando a condição deixa de ser verdadeira, o while termina.'},
      {q:'Qual sequência representa melhor o fluxo do menu?',o:['Mostrar menu → ler opção → decidir → executar → voltar','Sair → cadastrar → apagar → repetir','Consultar → compilar → desligar','Entrada → apagar dados → sair'],a:0,e:'O menu segue esse ciclo até que a condição de continuidade seja encerrada.'},
      {q:'Por que funções e repetição trabalham bem juntas?',o:['O laço controla o fluxo e as funções executam tarefas específicas','Porque funções substituem o laço','Porque repetição impede chamadas','Porque ambas só servem para imprimir texto'],a:0,e:'O laço coordena quando as tarefas serão executadas; as funções realizam cada tarefa.'}
    ],
    lesson4:[
      {q:'Por que validar o preço com repetição?',o:['Para pedir novamente enquanto o valor for inválido','Para aceitar qualquer valor imediatamente','Para remover o menu','Para transformar preço em nome'],a:0,e:'A repetição mantém a solicitação até que a condição de validade seja atendida.'},
      {q:'Na busca, por que verificar “há itens” E “ainda não encontrou”?',o:['Para parar quando a lista acabar ou quando o produto for encontrado','Para repetir para sempre','Para cadastrar dois produtos','Para impedir o uso de índice'],a:0,e:'As duas condições evitam acessar além da lista e evitam continuar procurando depois de encontrar.'},
      {q:'O que a função consultar_produto deve fazer?',o:['Procurar um produto pelo nome e informar o resultado','Cadastrar preços automaticamente','Encerrar o programa sempre','Substituir mostrar_menu'],a:0,e:'A consulta percorre os dados cadastrados em busca do nome informado.'},
      {q:'Qual é a evolução central da Aula 4?',o:['Tornar o sistema mais confiável com validação e consulta','Eliminar o cadastro','Usar somente print','Retirar a repetição'],a:0,e:'A aula amplia o sistema com validação de preço e consulta de produtos.'}
    ],
    general:[
      {q:'Em um programa com menu, o que acontece primeiro: receber a opção ou decidir o caminho?',o:['Receber a opção','Decidir sem dado algum','Consultar sempre','Sair'],a:0,e:'A decisão depende de uma informação de entrada, portanto a escolha precisa ser recebida primeiro.'},
      {q:'Qual estrutura é mais apropriada para manter um menu ativo enquanto o usuário desejar?',o:['while','print','input sozinho','comentário'],a:0,e:'O while repete o menu com base em uma condição de continuidade.'},
      {q:'Qual é o papel de uma função como cadastrar_produto(produtos)?',o:['Encapsular a responsabilidade de cadastrar um produto','Controlar o modo escuro','Substituir a lista','Encerrar o Python'],a:0,e:'A função concentra uma tarefa específica e pode ser chamada pelo menu.'},
      {q:'Um preço -5 deve ser aceito?',o:['Não, a validação deve solicitar novamente','Sim, porque é número','Sim, se estiver em uma lista','Só se o menu estiver fechado'],a:0,e:'O roteiro determina que o preço deve ser maior que zero.'},
      {q:'O que evita procurar além do último produto em uma lista?',o:['Comparar i com len(produtos)','Usar apenas print','Remover a variável i','Definir encontrado como texto'],a:0,e:'A condição de índice garante que ainda exista posição válida para verificar.'},
      {q:'Se um produto já foi encontrado, faz sentido continuar percorrendo a lista nessa atividade?',o:['Não, a busca pode encerrar','Sim, obrigatoriamente até infinito','Sim, porque while ignora condições','Não existe produto encontrado'],a:0,e:'A variável encontrado permite interromper a busca assim que o objetivo for atingido.'},
      {q:'Qual combinação descreve melhor um programa organizado?',o:['Menu + decisão + repetição + funções','Apenas print','Apenas variáveis','Somente comentários'],a:0,e:'Esses elementos trabalham juntos para construir o fluxo interativo.'},
      {q:'Quando uma opção não existe, qual comportamento é mais adequado?',o:['Informar opção inválida e permitir nova tentativa','Finalizar sem mensagem','Apagar todos os dados','Aceitar como opção 1'],a:0,e:'Uma validação clara orienta o usuário e preserva o fluxo do programa.'},
      {q:'O que significa “saída” no fluxo do programa?',o:['Informação apresentada ao usuário','Somente desligar o computador','Um valor digitado pelo usuário','Uma definição de função'],a:0,e:'Saída é qualquer resposta gerada e apresentada pelo programa.'},
      {q:'Qual é a ideia geral da Semana 21?',o:['Evoluir um menu simples para um sistema integrado de cadastro e consulta','Criar somente uma tela gráfica','Eliminar estruturas de repetição','Programar sem decisões'],a:0,e:'As aulas evoluem progressivamente o mesmo sistema até integrar cadastro, validação e consulta.'}
    ]
  };

  function renderQuiz(key, container){
    const body=$('.quiz-body',container); body.innerHTML='';
    quizzes[key].forEach((item,i)=>{
      const saved=state.quizzes[key]?.answers?.[i];
      const div=document.createElement('div'); div.className='question';
      div.innerHTML=`<h4>${i+1}. ${escapeHTML(item.q)}</h4><div class="options">${item.o.map((o,j)=>`<label class="option"><input type="radio" name="${key}-${i}" value="${j}" ${String(saved)===String(j)?'checked':''}> <span>${escapeHTML(o)}</span></label>`).join('')}</div><div class="explanation" hidden></div>`;
      body.appendChild(div);
    });
    const qstate=state.quizzes[key];
    $('.quiz-score',container).textContent=qstate?.completed?`Resultado: ${qstate.score}/${quizzes[key].length} (${qstate.pct}%)`:'';
    if(qstate?.completed) applyQuizFeedback(key,container);
    $$('input[type=radio]',container).forEach(r=>r.addEventListener('change',()=>{
      const answers={...(state.quizzes[key]?.answers||{})};
      const [,idx]=r.name.split('-').slice(-2); answers[Number(idx)]=Number(r.value);
      state.quizzes[key]={...(state.quizzes[key]||{}),answers,completed:false}; saveState();
    }));
  }

  function correctQuiz(key,container){
    const total=quizzes[key].length; const answers={}; let missing=0;
    quizzes[key].forEach((_,i)=>{ const r=$(`input[name="${key}-${i}"]:checked`,container); if(!r) missing++; else answers[i]=Number(r.value); });
    if(missing){ showMessage('warning',`⚠ Responda todas as questões antes de corrigir. Faltam ${missing}.`); return; }
    let score=0; quizzes[key].forEach((q,i)=>{ if(answers[i]===q.a) score++; });
    const pct=Math.round(score/total*100);
    state.quizzes[key]={answers,score,pct,completed:true}; saveState(); applyQuizFeedback(key,container);
    $('.quiz-score',container).textContent=`Resultado: ${score}/${total} (${pct}%)`;
    showMessage('success',`✓ Quiz corrigido: ${score}/${total} (${pct}%).`);
  }

  function applyQuizFeedback(key,container){
    const qs=state.quizzes[key]; if(!qs?.completed) return;
    $$('.question',container).forEach((qEl,i)=>{
      const item=quizzes[key][i]; const selected=qs.answers[i];
      $$('.option',qEl).forEach((op,j)=>{ op.classList.remove('correct','wrong'); if(j===item.a) op.classList.add('correct'); if(j===selected && j!==item.a) op.classList.add('wrong'); });
      const ex=$('.explanation',qEl); ex.hidden=false; ex.textContent=(selected===item.a?'✓ Resposta correta. ':'✕ Resposta incorreta. ')+item.e;
    });
  }

  function retryQuiz(key,container){ state.quizzes[key]={}; saveState(); renderQuiz(key,container); showMessage('info','Quiz reiniciado. As outras respostas foram preservadas.'); }
  $$('.quiz').forEach(container=>{ const key=container.dataset.quiz; renderQuiz(key,container); $('.correct-quiz',container).addEventListener('click',()=>correctQuiz(key,container)); $('.retry-quiz',container).addEventListener('click',()=>retryQuiz(key,container)); });

  // Atividade
  const activityIds=['codePrice','answerPriceWhy','codeConsultCall','answerIntegration','codeSearchWhile','answerSearchWhy','finalReflection'];
  activityIds.forEach(id=>{ const el=$('#'+id); el.value=state.activity[id]||''; el.addEventListener('input',()=>{state.activity[id]=el.value; saveState(); if(id==='finalReflection') updateReflectionCount();}); });
  function updateReflectionCount(){ $('#reflectionCount').textContent=($('#finalReflection').value||'').length+' caracteres'; } updateReflectionCount();
  $$('[data-test]').forEach(el=>{el.checked=!!state.tests[el.dataset.test];el.addEventListener('change',()=>{state.tests[el.dataset.test]=el.checked;saveState();});});
  $$('[data-checklist]').forEach(el=>{el.checked=!!state.checklist[el.dataset.checklist];el.addEventListener('change',()=>{state.checklist[el.dataset.checklist]=el.checked;saveState();});});

  const checks={
    price:v=>['!preco_valido','notpreco_valido','preco_valido==false','preco_validoisfalse'].includes(normalize(v)),
    call:v=>normalize(v)==='consultar_produto(produtos)',
    search:v=>['i<len(produtos)andnotencontrado','(i<len(produtos))andnotencontrado','i<len(produtos)andencontrado==false'].includes(normalize(v))
  };
  const inputFor={price:'codePrice',call:'codeConsultCall',search:'codeSearchWhile'};
  const feedbackFor={price:'feedbackPrice',call:'feedbackCall',search:'feedbackSearch'};
  const hints={price:'Pense na variável booleana que começa como False. O laço continua enquanto ela ainda não indica um preço válido.',call:'A opção 2 precisa chamar a função consultar_produto e enviar a lista produtos como argumento.',search:'A condição precisa combinar duas ideias: ainda existe posição válida na lista E o produto ainda não foi encontrado.'};
  $$('.check-code').forEach(b=>b.addEventListener('click',()=>{ const k=b.dataset.check; const ok=checks[k]($('#'+inputFor[k]).value); state.codeChecks[k]=ok; const f=$('#'+feedbackFor[k]); f.textContent=ok?'✓ Estrutura correta.':'✕ Ainda não. Reveja a condição e tente novamente.'; f.className='inline-feedback '+(ok?'good':'bad'); saveState(); }));
  $$('.hint-btn').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.hint; const f=$('#'+feedbackFor[k]); f.textContent='💡 '+hints[k]; f.className='inline-feedback hint';}));
  $$('.clear-code').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.clear; $('#'+id).value=''; state.activity[id]=''; const k=Object.keys(inputFor).find(x=>inputFor[x]===id); if(k) state.codeChecks[k]=false; saveState(); }));

  function activityComplete(){ return !!(state.codeChecks.price&&state.codeChecks.call&&state.codeChecks.search&&(state.activity.answerPriceWhy||'').trim()&&(state.activity.answerIntegration||'').trim()&&(state.activity.answerSearchWhy||'').trim()&&(state.activity.finalReflection||'').trim()); }
  function getPending(){
    const p=[];
    if(!(state.student.name||'').trim()) p.push('Nome do aluno');
    if(!(state.student.class||'').trim()) p.push('Turma');
    ['lesson1','lesson2','lesson3','lesson4'].forEach((k,i)=>{if(!state.quizzes[k]?.completed)p.push(`Quiz da Aula ${i+1}`);});
    if(!state.codeChecks.price)p.push('Condição de validação do preço');
    if(!(state.activity.answerPriceWhy||'').trim())p.push('Resposta sobre repetição na validação');
    if(!state.codeChecks.call)p.push('Integração da função consultar_produto');
    if(!(state.activity.answerIntegration||'').trim())p.push('Resposta sobre integração da consulta');
    if(!state.codeChecks.search)p.push('Condição da busca de produtos');
    if(!(state.activity.answerSearchWhy||'').trim())p.push('Resposta sobre as duas condições do while');
    if(!(state.activity.finalReflection||'').trim())p.push('Reflexão final');
    if(!state.quizzes.general?.completed)p.push('Quiz final');
    return p;
  }
  function updateProgress(){ const names=['Aula 1','Aula 2','Aula 3','Aula 4','Atividade','Quiz final','Entrega']; const stages=[state.quizzes.lesson1?.completed,state.quizzes.lesson2?.completed,state.quizzes.lesson3?.completed,state.quizzes.lesson4?.completed,activityComplete(),state.quizzes.general?.completed,getPending().length===0]; const done=stages.filter(Boolean).length; const pct=Math.round(done/names.length*100); $('#progressBar').style.width=pct+'%'; $('#progressLabel').textContent=`Progresso: ${pct}%`; $('#progressCount').textContent=`${done} de ${names.length} etapas`; $('#progressChips').innerHTML=names.map((n,i)=>`<span class="${stages[i]?'done':''}">${stages[i]?'✓ ':''}${n}</span>`).join(''); }

  function scoreText(k){ const q=state.quizzes[k]; return q?.completed?`${q.score}/${quizzes[k].length} (${q.pct}%)`:'Não concluído'; }
  function reportHTML(){
    return `<h1>Semana 21 — Lógica de Programação</h1><p><strong>Programando com menu no terminal</strong></p><h2>Identificação</h2><p><strong>Nome:</strong> ${escapeHTML(state.student.name||'—')}<br><strong>Turma:</strong> ${escapeHTML(state.student.class||'—')}<br><strong>Número:</strong> ${escapeHTML(state.student.number||'—')}<br><strong>Data:</strong> ${escapeHTML(state.student.date||'—')}</p><h2>Resultados</h2><p>Aula 1: ${scoreText('lesson1')}<br>Aula 2: ${scoreText('lesson2')}<br>Aula 3: ${scoreText('lesson3')}<br>Aula 4: ${scoreText('lesson4')}<br>Quiz final: ${scoreText('general')}</p><h2>Atividade prática — Papelaria Ponto Certo</h2><h3>Validação do preço</h3><pre>${escapeHTML(state.activity.codePrice||'')}</pre><p>${escapeHTML(state.activity.answerPriceWhy||'')}</p><h3>Integração da consulta</h3><pre>${escapeHTML(state.activity.codeConsultCall||'')}</pre><p>${escapeHTML(state.activity.answerIntegration||'')}</p><h3>Condição da busca</h3><pre>${escapeHTML(state.activity.codeSearchWhile||'')}</pre><p>${escapeHTML(state.activity.answerSearchWhy||'')}</p><h2>Checklist</h2>${Object.entries({price:'Aceita apenas preços maiores que zero',register:'Cadastro realizado corretamente',find:'Consulta localiza produtos existentes',notfound:'Informa produto não encontrado',menu:'Menu continua funcionando'}).map(([k,v])=>`<p>${state.checklist[k]?'☑':'☐'} ${v}</p>`).join('')}<h2>Reflexão final</h2><p>${escapeHTML(state.activity.finalReflection||'').replace(/\n/g,'<br>')}</p>`;
  }
  function showMessage(type,text){ const box=$('#messageBox'); box.hidden=false; box.innerHTML=`<strong>${escapeHTML(text)}</strong>`; box.dataset.type=type; box.scrollIntoView({behavior:'smooth',block:'nearest'}); }
  function validateDelivery(){ const p=getPending(); if(p.length){ $('#messageBox').hidden=false; $('#messageBox').innerHTML=`<h3>⚠ Existem etapas pendentes</h3><p>Conclua antes de gerar o PDF:</p><ul>${p.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul>`; return false; } $('#messageBox').hidden=true; return true; }
  $('#previewBtn').addEventListener('click',()=>{ const p=$('#previewPanel'); p.innerHTML=reportHTML(); p.hidden=!p.hidden; });
  $('#printBtn').addEventListener('click',()=>{ if(!validateDelivery()) return; $('#printReport').innerHTML=reportHTML(); window.print(); });

  function cleanFilename(v='Aluno'){ return v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'').slice(0,40)||'Aluno'; }
  function addWrapped(doc,text,x,y,width,lineHeight=5.5){ const lines=doc.splitTextToSize(String(text||'—'),width); for(const line of lines){ if(y>277){doc.addPage();y=18;} doc.text(line,x,y); y+=lineHeight; } return y; }
  $('#pdfBtn').addEventListener('click',()=>{
    if(!validateDelivery()) return;
    if(!window.jspdf?.jsPDF){ showMessage('warning','A biblioteca de PDF não pôde ser carregada. Use “Imprimir / Salvar como PDF” como alternativa.'); return; }
    try{
      const {jsPDF}=window.jspdf; const doc=new jsPDF({unit:'mm',format:'a4'}); const m=16,w=178; let y=18;
      doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.text('Educação Profissional Paulista',m,y); y+=8; doc.setFontSize(12); doc.text('Técnico em Desenvolvimento de Sistemas',m,y); y+=6; doc.text('Semana 21 — Lógica de Programação',m,y); y+=6; doc.text('Programando com Menu no Terminal',m,y); y+=10;
      const heading=t=>{if(y>265){doc.addPage();y=18;} doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text(t,m,y);y+=7;doc.setFont('helvetica','normal');doc.setFontSize(10);};
      heading('IDENTIFICAÇÃO'); y=addWrapped(doc,`Nome: ${state.student.name}\nTurma: ${state.student.class}\nNúmero: ${state.student.number||'—'}\nData: ${state.student.date||'—'}`,m,y,w); y+=4;
      heading('RESULTADOS'); y=addWrapped(doc,`Aula 1: ${scoreText('lesson1')}\nAula 2: ${scoreText('lesson2')}\nAula 3: ${scoreText('lesson3')}\nAula 4: ${scoreText('lesson4')}\nQuiz final: ${scoreText('general')}`,m,y,w); y+=4;
      heading('ATIVIDADE PRÁTICA — PAPELARIA PONTO CERTO');
      const parts=[['Condição da validação de preço',state.activity.codePrice],['Por que usar repetição?',state.activity.answerPriceWhy],['Chamada da consulta',state.activity.codeConsultCall],['Como a função amplia o sistema?',state.activity.answerIntegration],['Condição da busca',state.activity.codeSearchWhile],['Por que verificar duas situações?',state.activity.answerSearchWhy]];
      for(const [t,v] of parts){ doc.setFont('helvetica','bold'); y=addWrapped(doc,t,m,y,w); doc.setFont('helvetica','normal'); y=addWrapped(doc,v,m+2,y,w-2); y+=3; }
      heading('CHECKLIST'); const labels={price:'Aceita apenas preços maiores que zero',register:'Cadastro realizado corretamente',find:'Consulta localiza produtos existentes',notfound:'Informa quando o produto não é encontrado',menu:'Menu continua funcionando após cada operação'}; for(const [k,v] of Object.entries(labels)){ y=addWrapped(doc,`${state.checklist[k]?'[X]':'[ ]'} ${v}`,m,y,w); }
      y+=4; heading('REFLEXÃO FINAL'); y=addWrapped(doc,state.activity.finalReflection,m,y,w); y+=6; doc.setFont('helvetica','bold'); y=addWrapped(doc,'Atividade concluída — Semana 21',m,y,w);
      doc.save(`Logica_S21_${cleanFilename(state.student.name)}_${cleanFilename(state.student.class)}.pdf`); showMessage('success','✓ PDF gerado com sucesso.');
    }catch(err){ console.error(err); showMessage('warning','Não foi possível gerar o PDF automaticamente. Use “Imprimir / Salvar como PDF”.'); }
  });

  $('#clearProgress').addEventListener('click',()=>{ if(confirm('Deseja apagar todas as respostas e o progresso salvo?')){ localStorage.removeItem(STORAGE_KEY); location.reload(); } });
  updateProgress();
});
