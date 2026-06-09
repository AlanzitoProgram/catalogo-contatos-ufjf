# Catálogo de Contatos UFJF

Projeto estático pronto para publicação no GitHub Pages.

## Recursos incluídos

- Busca instantânea por setor, subsetor, telefone, e-mail e site.
- Filtro por setor.
- Filtros: somente com telefone, somente com e-mail, somente com site e favoritos.
- Visual em cartões e tabela.
- Responsivo para celular.
- Tema claro/escuro.
- Favoritos salvos no navegador.
- Botão de copiar telefone/e-mail.
- Link de ligação (`tel:`), e-mail (`mailto:`) e WhatsApp para celulares.
- Exportação dos resultados filtrados em CSV.
- Dados separados em `data/contatos.json`, facilitando manutenção.

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub, por exemplo: `catalogo-contatos-ufjf`.
2. Envie estes arquivos para o repositório.
3. No GitHub, vá em **Settings > Pages**.
4. Em **Build and deployment**, escolha:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Salve e aguarde o GitHub gerar o link.

## Como atualizar contatos

Edite o arquivo:

```text
data/contatos.json
```

Cada contato segue este formato:

```json
{
  "id": 1,
  "setor": "NOME DO SETOR",
  "subsetor": "Nome do subsetor",
  "site": "https://exemplo.com.br",
  "telefones": [{ "label": "(32) 2102-0000", "digits": "553221020000" }],
  "emails": ["email@ufjf.br"],
  "observacoes": ""
}
```

## Observações importantes

- Durante a conversão, links com `https://https://` foram corrigidos automaticamente.
- Links que pareciam textos informativos, e não sites reais, foram removidos do campo `site`.
- O catálogo tem 582 registros nesta versão.
