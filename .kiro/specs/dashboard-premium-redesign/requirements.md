# Requirements Document

## Introduction

Este documento especifica os requisitos para o redesign premium do dashboard da aplicação Straxis SaaS. O objetivo é transformar o layout atual de 6 cards de métricas em linha horizontal para um design mais elegante e profissional, utilizando um grid de 2 colunas com sistema de sombreamento sofisticado e paletas de cores premium para modos claro e escuro.

## Glossary

- **Dashboard**: Página principal que exibe métricas e visualizações de dados da aplicação
- **Metric_Card**: Componente visual que exibe uma métrica individual (Faturamento, Custos, Lucro, Trabalhos, Funcionários, Uso de IA)
- **Grid_System**: Sistema de layout baseado em colunas para organizar os cards de métricas
- **Shadow_System**: Sistema de sombreamento que cria profundidade e elevação visual nos componentes
- **Theme_System**: Sistema que gerencia paletas de cores e estilos para modos claro e escuro
- **Light_Mode**: Modo de visualização com fundo claro e cores apropriadas para ambientes iluminados
- **Dark_Mode**: Modo de visualização com fundo escuro e cores apropriadas para ambientes com pouca luz
- **Responsive_Layout**: Layout que se adapta a diferentes tamanhos de tela mantendo usabilidade
- **Visual_Hierarchy**: Organização visual que guia a atenção do usuário através de tamanho, cor e posicionamento

## Requirements

### Requirement 1: Grid Layout de 2 Colunas

**User Story:** Como usuário do dashboard, eu quero ver os cards de métricas organizados em 2 colunas, para que eu possa visualizar as informações de forma mais equilibrada e elegante.

#### Acceptance Criteria

1. WHEN o dashboard é renderizado em desktop, THE Grid_System SHALL exibir os Metric_Cards em exatamente 2 colunas
2. WHEN o dashboard é renderizado em tablet, THE Grid_System SHALL exibir os Metric_Cards em 2 colunas
3. WHEN o dashboard é renderizado em mobile, THE Grid_System SHALL exibir os Metric_Cards em 1 coluna
4. THE Grid_System SHALL distribuir os 6 Metric_Cards igualmente nas colunas disponíveis
5. THE Grid_System SHALL manter espaçamento consistente entre os cards de 24px

### Requirement 2: Sistema de Sombreamento Premium

**User Story:** Como usuário do dashboard, eu quero ver cards com sombreamento sofisticado, para que a interface tenha profundidade visual e aparência premium.

#### Acceptance Criteria

1. WHEN um Metric_Card está em estado normal, THE Shadow_System SHALL aplicar sombra de elevação nível 1
2. WHEN o usuário posiciona o cursor sobre um Metric_Card, THE Shadow_System SHALL aplicar sombra de elevação nível 2
3. THE Shadow_System SHALL utilizar múltiplas camadas de sombra para criar profundidade realista
4. THE Shadow_System SHALL ajustar a opacidade e blur das sombras de acordo com o tema ativo
5. WHEN em Light_Mode, THE Shadow_System SHALL usar sombras com opacidade entre 0.08 e 0.15
6. WHEN em Dark_Mode, THE Shadow_System SHALL usar sombras com opacidade entre 0.2 e 0.4

### Requirement 3: Paleta de Cores Premium para Light Mode

**User Story:** Como usuário que prefere interfaces claras, eu quero uma paleta de cores profissional e sofisticada no modo claro, para que o dashboard seja agradável visualmente e fácil de ler.

#### Acceptance Criteria

1. WHEN Light_Mode está ativo, THE Theme_System SHALL usar fundo principal com cor #FAFBFC
2. WHEN Light_Mode está ativo, THE Theme_System SHALL usar fundo de cards com cor #FFFFFF
3. WHEN Light_Mode está ativo, THE Theme_System SHALL usar texto primário com cor #1A202C
4. WHEN Light_Mode está ativo, THE Theme_System SHALL usar texto secundário com cor #718096
5. WHEN Light_Mode está ativo, THE Theme_System SHALL usar bordas com cor #E2E8F0
6. THE Theme_System SHALL manter contraste mínimo de 4.5:1 entre texto e fundo para acessibilidade

### Requirement 4: Paleta de Cores Premium para Dark Mode

**User Story:** Como usuário que prefere interfaces escuras, eu quero uma paleta de cores sofisticada no modo escuro, para que o dashboard seja confortável para os olhos em ambientes com pouca luz.

#### Acceptance Criteria

1. WHEN Dark_Mode está ativo, THE Theme_System SHALL usar fundo principal com cor #0F1419
2. WHEN Dark_Mode está ativo, THE Theme_System SHALL usar fundo de cards com cor #1A1F2E
3. WHEN Dark_Mode está ativo, THE Theme_System SHALL usar texto primário com cor #F7FAFC
4. WHEN Dark_Mode está ativo, THE Theme_System SHALL usar texto secundário com cor #A0AEC0
5. WHEN Dark_Mode está ativo, THE Theme_System SHALL usar bordas com cor #2D3748
6. THE Theme_System SHALL manter contraste mínimo de 4.5:1 entre texto e fundo para acessibilidade

### Requirement 5: Cores de Ícones e Indicadores

**User Story:** Como usuário do dashboard, eu quero que os ícones e indicadores de métricas tenham cores distintas e significativas, para que eu possa identificar rapidamente cada tipo de informação.

#### Acceptance Criteria

1. WHEN exibindo métrica de Faturamento, THE Metric_Card SHALL usar cor verde #10B981 para o ícone
2. WHEN exibindo métrica de Custos, THE Metric_Card SHALL usar cor vermelha #EF4444 para o ícone
3. WHEN exibindo métrica de Lucro, THE Metric_Card SHALL usar cor azul #3B82F6 para o ícone
4. WHEN exibindo métrica de Trabalhos, THE Metric_Card SHALL usar cor laranja #F59E0B para o ícone
5. WHEN exibindo métrica de Funcionários, THE Metric_Card SHALL usar cor roxa #8B5CF6 para o ícone
6. WHEN exibindo métrica de Uso de IA, THE Metric_Card SHALL usar cor ciano #06B6D4 para o ícone
7. THE Metric_Card SHALL aplicar fundo com 10% de opacidade da cor do ícone no container do ícone

### Requirement 6: Transições e Animações Suaves

**User Story:** Como usuário do dashboard, eu quero transições suaves entre estados visuais, para que a interface pareça fluida e responsiva.

#### Acceptance Criteria

1. WHEN o usuário posiciona o cursor sobre um Metric_Card, THE Metric_Card SHALL animar a elevação em 300ms com easing ease-out
2. WHEN o usuário posiciona o cursor sobre um Metric_Card, THE Metric_Card SHALL transladar verticalmente -4px
3. WHEN o tema é alterado entre Light_Mode e Dark_Mode, THE Theme_System SHALL animar as cores em 200ms
4. WHEN o dashboard é carregado, THE Metric_Cards SHALL aparecer com animação stagger de 50ms entre cada card
5. THE Dashboard SHALL usar transform para animações de movimento para melhor performance

### Requirement 7: Hierarquia Visual Aprimorada

**User Story:** Como usuário do dashboard, eu quero uma hierarquia visual clara, para que eu possa focar nas informações mais importantes primeiro.

#### Acceptance Criteria

1. THE Metric_Card SHALL exibir o valor da métrica com tamanho de fonte 2rem e peso 700
2. THE Metric_Card SHALL exibir o título da métrica com tamanho de fonte 0.875rem e peso 500
3. THE Metric_Card SHALL exibir a tendência com tamanho de fonte 0.875rem e peso 600
4. THE Metric_Card SHALL usar espaçamento vertical de 16px entre o ícone e o valor
5. THE Metric_Card SHALL usar espaçamento vertical de 8px entre o valor e a tendência
6. THE Metric_Card SHALL aplicar padding interno de 24px em todos os lados

### Requirement 8: Responsividade Mantida

**User Story:** Como usuário que acessa o dashboard em diferentes dispositivos, eu quero que o layout se adapte adequadamente, para que eu tenha uma boa experiência em qualquer tela.

#### Acceptance Criteria

1. WHEN a largura da tela é menor que 640px, THE Responsive_Layout SHALL exibir 1 coluna
2. WHEN a largura da tela está entre 640px e 1024px, THE Responsive_Layout SHALL exibir 2 colunas
3. WHEN a largura da tela é maior que 1024px, THE Responsive_Layout SHALL exibir 2 colunas
4. THE Responsive_Layout SHALL ajustar o padding do container de 16px em mobile para 24px em desktop
5. THE Responsive_Layout SHALL manter a proporção e legibilidade dos cards em todos os breakpoints

### Requirement 9: Bordas e Raios de Borda

**User Story:** Como usuário do dashboard, eu quero que os cards tenham bordas arredondadas suaves, para que o design pareça moderno e acessível.

#### Acceptance Criteria

1. THE Metric_Card SHALL usar raio de borda de 12px
2. THE Metric_Card SHALL ter borda sólida de 1px com cor definida pelo Theme_System
3. WHEN em Light_Mode, THE Metric_Card SHALL usar cor de borda #E2E8F0
4. WHEN em Dark_Mode, THE Metric_Card SHALL usar cor de borda #2D3748
5. THE container de ícone dentro do Metric_Card SHALL usar raio de borda de 10px

### Requirement 10: Acessibilidade e Contraste

**User Story:** Como usuário com necessidades de acessibilidade, eu quero que o dashboard mantenha contraste adequado, para que eu possa ler todas as informações claramente.

#### Acceptance Criteria

1. THE Theme_System SHALL garantir contraste mínimo de 4.5:1 entre texto primário e fundo
2. THE Theme_System SHALL garantir contraste mínimo de 3:1 entre texto secundário e fundo
3. THE Metric_Card SHALL manter contraste adequado entre ícones e seus fundos
4. WHEN o usuário posiciona o cursor sobre um Metric_Card, THE Metric_Card SHALL manter todos os contrastes de acessibilidade
5. THE Dashboard SHALL ser navegável por teclado mantendo indicadores visuais de foco
