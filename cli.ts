import * as readline from 'readline';
import { WorldFactory } from './src/infrastructure/factories/WorldFactory';
import { WumpusWorldAPI } from './src/infrastructure/api/WumpusWorldAPI';
import { GameEngine } from './src/application/engine/GameEngine';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 1. INICIALIZAÇÃO OBRIGATÓRIA DO MOTOR ESPACIAL
// Utilizamos a fábrica para gerar a topografia (aqui usando o mapa fixo para garantia de estabilidade inicial).
const worldConfig = WorldFactory.createFixedWorld();

// Injetamos as instâncias geradas no Motor Singleton do Jogo
GameEngine.getInstance().initialize(
    worldConfig.gridSize, 
    worldConfig.player, 
    worldConfig.entities
);

// 2. INICIALIZAÇÃO DA API E TRANCEPTOR
const gameAPI = new WumpusWorldAPI();

console.log("\n================================================");
console.log("STATUS: Módulo de Interface Ativo. Conexão Estável.");
console.log("MISSÃO TÁTICA: Sobreviver, coletar o Ouro e retornar à base.");
console.log("COMANDOS DE NAVEGAÇÃO: [W] Cima | [A] Esquerda | [S] Baixo | [D] Direita");
console.log("COMANDOS DE AÇÃO: [F] Atirar Flecha | [P] Pegar Ouro | [E] Sair da Caverna | [Q] Abortar Missão");
console.log("================================================\n");

function loopExploracao() {
    // Processamento do pacote de telemetria atual
    const estadoSensorial = gameAPI.getPerceptions(); 
    const playerState = gameAPI.getPlayerState();
    const { x: X, y: Y } = playerState.position;

    console.log(`\nPOSIÇÃO ATUAL: [${X}, ${Y}]`);
    console.log(`SENSORES: ${estadoSensorial.length > 0 ? estadoSensorial.join(', ') : 'Nenhuma anomalia (Seguro)'}`);
    console.log(`INVENTÁRIO: Ouro [${playerState.hasGold ? 'COLETADO' : 'VAZIO'}] | Flechas [${playerState.arrows}]`);
    console.log("------------------------------------------------");
    
    rl.question('INFORME DIRETRIZ DE AÇÃO: ', (input) => {
        const comando = input.trim().toUpperCase();

        switch (comando) {
            case 'W': gameAPI.move('up'); break;
            case 'S': gameAPI.move('down'); break;
            case 'A': gameAPI.move('left'); break;
            case 'D': gameAPI.move('right'); break;
            case 'F':
                if (playerState.arrows <= 0) {
                    console.log("ALERTA: Munição esgotada.");
                    verificarEstadoJogo();
                    return;
                }
                rl.question('DIREÇÃO DO DISPARO (W/A/S/D): ', (dirInput) => {
                    atirarFlecha(dirInput.trim().toUpperCase());
                });
                return; // Interrompe a recursão para aguardar o vetor de disparo
            case 'P': 
                gameAPI.grabGold(); 
                console.log("LOG: Tentativa de coleta executada.");
                break;
            case 'E':
                gameAPI.exitCavern();
                console.log("LOG: Tentativa de extração solicitada. Subindo...");
                break;
            case 'Q':
                console.log("ENCERRANDO: Missão abortada pelo comando de base.");
                rl.close();
                process.exit(0);
                break;
            default:
                console.log("ERRO: Diretriz não reconhecida. Operação anulada.");
        }

        verificarEstadoJogo();
    });
}

function atirarFlecha(direcaoInput: string) {
    const mapaTiro: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        'W': 'up',
        'S': 'down',
        'A': 'left',
        'D': 'right'
    };

    const alvo = mapaTiro[direcaoInput];
    if (alvo) {
        gameAPI.shoot(alvo); 
        console.log(`LOG: Projétil disparado na coordenada relativa [${alvo}].`);
    } else {
        console.log("ERRO: Vetor de disparo inválido.");
    }
    verificarEstadoJogo();
}

function verificarEstadoJogo() {
    const playerState = gameAPI.getPlayerState();
    
    if (playerState.isWinner) {
        console.log("\nFIM DE JOGO: Missão concluída com êxito. Ouro garantido e extração segura confirmada.");
        rl.close();
        process.exit(0);
    } else if (!playerState.isAlive) {
        console.log("\nFIM DE JOGO: Sinais vitais perdidos. Agente morto em ação.");
        rl.close();
        process.exit(0);
    } else {
        // Sistemas nominais. Avançar para a próxima iteração.
        loopExploracao();
    }
}

// Inicializa a escuta de ações
loopExploracao();