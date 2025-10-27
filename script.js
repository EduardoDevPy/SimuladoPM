const TOTAL_QUESTOES = 60;
let questaoAtual = 0;
let respostaUsuario = [];
let todasQuestoes = [];
let questoesSorteadas = [];

// Elementos da DOM

const telas = {
  inicial: document.getElementById("tela__inicial"),
  simulado: document.getElementById("tela__simulado"),
  resultados: document.getElementById("tela__resultado"),
};

const botoes = {
  iniciar: document.getElementById("btn__iniciar"),
  anterior: document.getElementById("btn__anterior"),
  proxima: document.getElementById("btn__proxima"),
  finalizar: document.getElementById("btn__finalizar"),
  novoSimulado: document.getElementById("btn__novo__simulado"),
};

const elementos = {
  contadorQuestao: document.getElementById("contador__questao"),
  progressoBarra: document.getElementById("progresso__barra"),
  questaoAtual: document.getElementById("questao__atual"),
  resultadoInfo: document.getElementById("resultado__info"),
  gabaritoCompleto: document.getElementById("gabarito__completo"),
};

// BANCO DE DADOS DAS QUESTÕES

let bancoQuestoes = [];

// Função para carregar questões do arquivo JSON
async function carregarQuestoes() {
  try {
    const response = await fetch("questoes.json");
    if (!response.ok) {
      throw new Error("Erro ao carregar questões");
    }
    bancoQuestoes = await response.json();
    console.log(`${bancoQuestoes.length} questões carregadas com sucesso!`);
    return bancoQuestoes;
  } catch (error) {
    console.error("Erro ao carregar questões:", error);
    // Questões de fallback caso o arquivo não carregue
    bancoQuestoes = [
      {
        id: 1,
        enunciado:
          "Erro ao carregar questões do arquivo. Verifique se o arquivo questoes.json está no local correto.",
        alternativas: {
          A: "Opção A",
          B: "Opção B",
          C: "Opção C",
          D: "Opção D",
        },
        resposta_correta: "A",
        materia: "Erro",
        ano: 2024,
        banca: "Sistema",
      },
    ];
    return bancoQuestoes;
  }
}

// função para sortear questões aleatórias

function sortearQuestoes() {
  // Embaralha as questões
  const questaoEmbaralhadas = [...bancoQuestoes].sort(
    () => Math.random() - 0.5
  );
  // Pega as primeiras TOTAL_QUESTOES questõe
  return questaoEmbaralhadas.slice(0, TOTAL_QUESTOES);
}

// Função para mostrar uma tela específica
function mostrarTela(tela) {
  // Esconde todas as telas
  Object.values(telas).forEach((elemento) =>
    elemento.classList.remove("tela__ativa")
  );
  // Mostra a tela solicitada
  tela.classList.add("tela__ativa");
}

// Função para atualizar a barra de progresso
function atualizarProgresso() {
  const progresso = ((questaoAtual + 1) / TOTAL_QUESTOES) * 100;
  elementos.progressoBarra.style.width = `${progresso}%`;
  elementos.contadorQuestao.textContent = `Questão ${
    questaoAtual + 1
  }/${TOTAL_QUESTOES}`;
}

// Função para renderizar a questão atual
function renderizarQuestao() {
  if (questaoAtual >= questoesSorteadas.length) return;

  const questao = questoesSorteadas[questaoAtual];

  let html = `
        <div class="questao-info">
            <span class="materia">${questao.materia}</span>
            <span class="banca">${questao.banca} - ${questao.ano}</span>
        </div>
        <div class="enunciado">${questao.enunciado}</div>
        <div class="alternativas">
    `;

  // Adiciona as alternativas
  for (const [letra, texto] of Object.entries(questao.alternativas)) {
    const respostaAtual = respostasUsuario[questaoAtual];
    const selecionada = respostaAtual === letra ? "selecionada" : "";

    html += `
            <div class="alternativa ${selecionada}" data-letra="${letra}">
                <strong>${letra})</strong> ${texto}
            </div>
        `;
  }

  html += `</div>`;
  elementos.questaoAtual.innerHTML = html;

  // Adiciona eventos às alternativas
  document.querySelectorAll(".alternativa").forEach((alt) => {
    alt.addEventListener("click", () =>
      selecionarAlternativa(alt.dataset.letra)
    );
  });

  // Atualiza navegação
  atualizarNavegacao();
  atualizarProgresso();
}

// Função para selecionar uma alternativa
function selecionarAlternativa(letra) {
  // Remove seleção de todas as alternativas
  document.querySelectorAll(".alternativa").forEach((alt) => {
    alt.classList.remove("selecionada");
  });

  // Seleciona a alternativa clicada
  document
    .querySelector(`.alternativa[data-letra="${letra}"]`)
    .classList.add("selecionada");

  // Salva a resposta
  respostasUsuario[questaoAtual] = letra;
}

// Função para atualizar os botões de navegação
function atualizarNavegacao() {
  botoes.anterior.disabled = questaoAtual === 0;
  botoes.proxima.textContent =
    questaoAtual === TOTAL_QUESTOES - 1 ? "Concluir" : "Próxima";
}

// Função para navegar entre questões
function navegarQuestao(direcao) {
  // Salva a resposta atual antes de navegar
  const alternativaSelecionada = document.querySelector(
    ".alternativa.selecionada"
  );
  if (alternativaSelecionada) {
    respostasUsuario[questaoAtual] = alternativaSelecionada.dataset.letra;
  }

  // Navega
  questaoAtual += direcao;

  // Limites
  if (questaoAtual < 0) questaoAtual = 0;
  if (questaoAtual >= TOTAL_QUESTOES) questaoAtual = TOTAL_QUESTOES - 1;

  renderizarQuestao();
}

// Função para calcular o resultado
function calcularResultado() {
  let acertos = 0;
  const resultados = [];

  for (let i = 0; i < questoesSorteadas.length; i++) {
    const questao = questoesSorteadas[i];
    const respostaUsuario = respostasUsuario[i];
    const correta = questao.resposta_correta;
    const acertou = respostaUsuario === correta;

    if (acertou) acertos++;

    resultados.push({
      questao: questao,
      respostaUsuario: respostaUsuario,
      acertou: acertou,
    });
  }

  return { acertos, total: TOTAL_QUESTOES, resultados };
}

// Função para mostrar resultados
function mostrarResultados() {
  const resultado = calcularResultado();
  const percentual = ((resultado.acertos / resultado.total) * 100).toFixed(1);

  // Info principal
  elementos.resultadoInfo.innerHTML = `
        <div class="resultado-principal">
            <h3>📊 Resultado do Simulado</h3>
            <div class="pontuacao">
                <div class="acertos">${resultado.acertos} acertos</div>
                <div class="erros">${
                  resultado.total - resultado.acertos
                } erros</div>
                <div class="percentual">${percentual}% de aproveitamento</div>
            </div>
        </div>
    `;

  // Gabarito completo
  let gabaritoHTML =
    '<div class="gabarito-detalhado"><h4>📝 Gabarito Detalhado</h4>';

  resultado.resultados.forEach((item, index) => {
    const status = item.acertou ? "✅" : "❌";
    const classe = item.acertou ? "acerto" : "erro";

    gabaritoHTML += `
            <div class="item-gabarito ${classe}">
                <div class="questao-header">
                    <span>Questão ${index + 1} ${status}</span>
                    <span class="materia-pequena">${item.questao.materia}</span>
                </div>
                <div class="enunciado-pequeno">${item.questao.enunciado}</div>
                <div class="respostas-comparacao">
                    <span class="sua-resposta">Sua resposta: ${
                      item.respostaUsuario || "N/A"
                    }</span>
                    <span class="resposta-correta">Gabarito: ${
                      item.questao.resposta_correta
                    }</span>
                </div>
            </div>
        `;
  });

  gabaritoHTML += "</div>";
  elementos.gabaritoCompleto.innerHTML = gabaritoHTML;

  mostrarTela(telas.resultados);
}

// Função para reiniciar o simulado
async function reiniciarSimulado() {
  questaoAtual = 0;
  respostasUsuario = [];

  // Garante que as questões estejam carregadas
  if (bancoQuestoes.length === 0) {
    await carregarQuestoes();
  }

  mostrarTela(telas.inicial);
}

// =============================================
// EVENT LISTENERS
// =============================================

// Botão iniciar
botoes.iniciar.addEventListener("click", async () => {
  // Mostra loading enquanto carrega as questões
  botoes.iniciar.textContent = "Carregando questões...";
  botoes.iniciar.disabled = true;

  try {
    // Carrega as questões do arquivo JSON
    await carregarQuestoes();

    // Inicia o simulado com as questões carregadas
    questoesSorteadas = sortearQuestoes();
    respostasUsuario = new Array(TOTAL_QUESTOES);
    questaoAtual = 0;

    mostrarTela(telas.simulado);
    renderizarQuestao();
  } catch (error) {
    console.error("Erro ao iniciar simulado:", error);
    alert(
      "Erro ao carregar as questões. Verifique se o arquivo questoes.json existe."
    );
  } finally {
    // Restaura o botão
    botoes.iniciar.textContent = "Iniciar Simulado";
    botoes.iniciar.disabled = false;
  }
});

// Botão anterior
botoes.anterior.addEventListener("click", () => navegarQuestao(-1));

// Botão próxima
botoes.proxima.addEventListener("click", () => {
  if (questaoAtual === TOTAL_QUESTOES - 1) {
    mostrarResultados();
  } else {
    navegarQuestao(1);
  }
});

// Botão finalizar
botoes.finalizar.addEventListener("click", () => {
  if (confirm("Tem certeza que deseja finalizar o simulado?")) {
    mostrarResultados();
  }
});

// Botão novo simulado
botoes.novoSimulado.addEventListener("click", reiniciarSimulado);

// INICIALIZAÇÃO

// CSS adicional para resultados
const estiloAdicional = `
    .resultado-principal {
        text-align: center;
        margin-bottom: 30px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 10px;
    }
    
    .pontuacao {
        display: flex;
        justify-content: center;
        gap: 30px;
        margin-top: 20px;
        flex-wrap: wrap;
    }
    
    .acertos, .erros, .percentual {
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 18px;
    }
    
    .acertos { background: #d4edda; color: #155724; }
    .erros { background: #f8d7da; color: #721c24; }
    .percentual { background: #cce7ff; color: #004085; }
    
    .gabarito-detalhado {
        max-height: 500px;
        overflow-y: auto;
        margin-top: 20px;
    }
    
    .item-gabarito {
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 8px;
        border-left: 5px solid;
    }
    
    .item-gabarito.acerto {
        background: #d4edda;
        border-left-color: #28a745;
    }
    
    .item-gabarito.erro {
        background: #f8d7da;
        border-left-color: #dc3545;
    }
    
    .questao-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-weight: bold;
    }
    
    .materia-pequena {
        font-size: 12px;
        color: #666;
    }
    
    .enunciado-pequeno {
        font-size: 14px;
        margin-bottom: 10px;
        color: #333;
    }
    
    .respostas-comparacao {
        display: flex;
        gap: 20px;
        font-size: 14px;
    }
    
    .sua-resposta, .resposta-correta {
        padding: 5px 10px;
        border-radius: 4px;
    }
    
    .sua-resposta { background: #fff3cd; }
    .resposta-correta { background: #d1ecf1; }
    
    .questao-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        font-size: 14px;
        color: #666;
    }
`;

// Adiciona CSS dinâmico
const styleSheet = document.createElement("style");
styleSheet.textContent = estiloAdicional;
document.head.appendChild(styleSheet);

// Inicializa na tela inicial
mostrarTela(telas.inicial);

// Pré-carrega as questões quando a página carrega
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚔 Simulador PM carregando...");
  await carregarQuestoes();
  console.log("🚔 Simulador PM carregado com sucesso!");
});
