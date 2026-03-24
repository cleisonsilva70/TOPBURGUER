# Publicacao Final e Operacao

## Objetivo

Usar este roteiro sempre que uma nova versao for para producao ou quando uma nova hamburgueria receber a entrega.

## 1. Redeploy na Vercel

1. Abrir o projeto na Vercel.
2. Ir em `Deployments`.
3. Confirmar que o commit mais novo esta publicado.
4. Se necessario, usar `Redeploy`.

## 2. Trocar a senha final do cliente

Na Vercel, em `Settings > Environment Variables`, atualizar:

- `OWNER_ACCESS_PASSWORD`
- `OWNER_SESSION_SECRET`

### Recomendacao

- usar uma senha forte e exclusiva por cliente
- nao reutilizar a senha de teste
- trocar o `OWNER_SESSION_SECRET` sempre que trocar a senha

## 3. Checklist de links

Confirmar se todos abrem:

- `/`
- `/acesso-cozinha`
- `/atendimento`
- `/cozinha`
- `/painel`

## 4. Teste completo do fluxo

1. Abrir a vitrine.
2. Adicionar um produto simples.
3. Adicionar um produto com tamanho ou opcionais.
4. Preencher checkout.
5. Confirmar envio para o WhatsApp.
6. Verificar a mensagem formatada.
7. Abrir atendimento.
8. Confirmar o pedido como pago.
9. Abrir cozinha.
10. Mover o pedido entre as colunas.
11. Confirmar se o historico aparece no painel.

## 5. Revisao visual publicada

Conferir em:

- celular
- tablet
- desktop

### Pontos visuais

- cardapio carregando corretamente
- banners com imagem e botao funcionando
- categorias aparecendo na ordem correta
- carrinho funcionando bem no celular
- botao principal visivel no checkout
- cozinha legivel em tablet

## 6. Entrega para o cliente

Passar:

- link da vitrine
- link do login interno
- senha final
- orientacao curta do fluxo

Usar como base o arquivo:

- `docs/entrega-cliente.md`

## 7. Pos-entrega

Depois da entrega:

- fazer um pedido real assistido
- confirmar com o cliente se a equipe entendeu atendimento e cozinha
- revisar banners e destaques da primeira semana
