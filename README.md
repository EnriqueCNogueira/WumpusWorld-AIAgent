# Mundo do Wumpus - Fase 1: Ambiente e Motor de Regras

Este projeto consiste em uma simulação robusta e extensível do **Mundo do Wumpus**, desenvolvida em **TypeScript**. [cite_start]A arquitetura foi projetada seguindo rigorosamente os princípios **SOLID** e **Padrões de Projeto** clássicos para garantir que o ambiente seja totalmente isolado e esteja pronto para ser consumido por um Agente de Inteligência Artificial (Fase 2)[cite: 60, 61, 71].

---

## 🛠️ Tecnologias Utilizadas

* [cite_start]**Linguagem:** TypeScript (Strict Mode) [cite: 24, 75]
* [cite_start]**Ambiente de Execução:** Node.js (v24+) [cite: 76, 95]
* [cite_start]**Testes Automatizados:** Jest com ts-jest [cite: 107, 110]
* [cite_start]**Paradigma:** Orientação a Objetos e Programação Funcional [cite: 10]

---

## 🏗️ Arquitetura e Design Patterns

[cite_start]A estrutura do projeto é dividida em camadas para isolar a lógica de domínio da infraestrutura[cite: 72, 73]:

* [cite_start]**Singleton (GameEngine):** Garante um ponto de acesso global e único para o estado do jogo, gerenciando a grade e as entidades em memória[cite: 63, 205].
* [cite_start]**Facade (WumpusWorldAPI):** Atua como a fronteira do sistema, ocultando a complexidade interna e expondo métodos simples (ex: `moveForward`, `getPerceptions`) para o agente externo[cite: 66, 67, 210].
* **Observer (PerceptionSystem):** Desacopla a geração de estímulos sensoriais. [cite_start]O motor publica eventos (brisa, fedor, grito) e os observadores inscritos reagem a eles[cite: 64, 65, 191].
* [cite_start]**Strategy/Service Pattern:** Ações como movimentação (`MovementService`), combate (`ShootingService`) e interação (`InteractionService`) são isoladas em serviços específicos para respeitar o Princípio de Responsabilidade Única (SRP)[cite: 288, 322, 338].

---

## 📁 Estrutura de Diretórios

```text
WumpusWorld/
├── src/
│   ├── application/       # Lógica de aplicação e serviços
│   │   ├── actions/       # Movement, Shooting, Interaction Services
│   │   ├── engine/        # GameEngine (Singleton)
│   │   └── systems/       # PerceptionSystem (Observer), SensoryService
│   ├── domain/            # Core do domínio (Regras e Contratos)
│   │   ├── entities/      # Player, Wumpus, Pit, Gold, Grid
│   │   ├── interfaces/    # IEntity, IObserver, ISubject
│   │   └── types/         # Position, Direction, PerceptionType
│   └── infrastructure/    # Camada de acesso externa
│       └── api/           # WumpusWorldAPI (Facade)
├── tests/                 # Suítes de testes unitários e integração
└── tsconfig.json          # Configuração rigorosa do TypeScript
```
[cite_start][cite: 31, 72, 420, 421]

---

## 🚀 Como Executar

### Configuração Inicial
1.  Instale as dependências:
    ```bash
    npm install
    ```
    [cite_start][cite: 79]

### Executando Testes
A estabilidade do ambiente é garantida por uma cobertura completa de testes unitários:
```bash
# Executar todos os testes
npx jest

# Executar testes específicos (ex: Grade)
npx jest tests/domain/entities/Grid.test.ts
```
[cite_start][cite: 114, 137, 320]

---

## 🎮 Contrato da API (Interface com a IA)

[cite_start]O agente autônomo interage com o mundo exclusivamente através da `WumpusWorldAPI`[cite: 212, 416]:

* `moveForward()`: Move o jogador na direção atual. [cite_start]Gera `BUMP` se houver colisão com a parede[cite: 297, 363].
* [cite_start]`turnLeft()` / `turnRight()`: Altera a orientação do jogador[cite: 292].
* `shoot()`: Dispara uma flecha. [cite_start]Gera `SCREAM` se o Wumpus for atingido[cite: 326, 327].
* [cite_start]`grabGold()`: Coleta o ouro se estiver na mesma posição[cite: 339, 341].
* [cite_start]`getPerceptions()`: Retorna os estímulos atuais (`STENCH`, `BREEZE`, `GLITTER`, `BUMP`, `SCREAM`)[cite: 214, 268].
* [cite_start]`getPlayerState()`: Retorna o status de vida, munição e inventário[cite: 213, 269].

---

## ⚖️ Licença
[cite_start]Uso pessoal e acadêmico conforme diretrizes da Engenharia de Software Moderna[cite: 460, 469].