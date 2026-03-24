# Setup de Novo Cliente

## Objetivo

Esta base foi preparada para voce copiar, personalizar e entregar para outra hamburgueria sem reescrever o sistema.

## Checklist de implantacao

1. Duplicar a base do projeto.
2. Definir o nome da loja, WhatsApp, horario, endereco e senha interna.
3. Ajustar identidade visual da marca.
4. Cadastrar categorias, produtos, tamanhos, opcionais e banners.
5. Testar pedido completo, atendimento e cozinha.
6. Publicar, entregar os links e orientar o cliente.

## O que configurar primeiro

### Loja e marca

- nome da hamburgueria
- nome curto
- logo
- telefone exibido
- WhatsApp
- endereco
- horario de funcionamento
- cores

### Categorias e produtos

- criar categorias e definir a ordem do cardapio
- cadastrar produtos
- definir destaque
- configurar tamanhos
- configurar opcionais
- habilitar observacao do cliente quando fizer sentido

### Promocoes e banners

- subir imagem
- definir texto do botao
- escolher se o banner abre link ou adiciona produto ao carrinho
- informar ordem de exibicao
- informar selo da campanha
- marcar destaque principal quando quiser puxar a promocao para o topo
- usar datas de inicio e fim para campanhas sazonais

## Variaveis por cliente

No ambiente publicado, configure:

- `DATABASE_URL`
- `OWNER_ACCESS_PASSWORD`
- `OWNER_SESSION_SECRET`
- `ALLOW_DEMO_MODE=false`
- `APP_BASE_URL`

## Fluxo operacional entregue

1. Cliente monta o pedido no cardapio.
2. Pedido chega no WhatsApp.
3. Atendimento confirma o pagamento.
4. Pedido liberado entra na cozinha.
5. Cozinha acompanha por colunas ate entregar.

## Testes antes da entrega

1. Criar pedido com item simples.
2. Criar pedido com tamanho e opcionais.
3. Confirmar que a mensagem do WhatsApp saiu formatada.
4. Confirmar que o pedido aparece no atendimento.
5. Marcar como pago.
6. Confirmar entrada na cozinha.
7. Mover ate entregue.
8. Verificar historico no painel.

## Links que voce entrega

- vitrine principal
- login interno
- atendimento
- cozinha
- painel administrativo, se fizer parte do combinado

## Recomendacao comercial

Venda primeiro como:

- cardapio digital personalizado
- pedido via WhatsApp
- atendimento e cozinha organizados

Depois, ofereca como upgrade:

- campanhas sazonais
- troca recorrente de banners
- cadastro mensal de produtos
- publicacao e suporte
