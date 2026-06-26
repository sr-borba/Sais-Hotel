# Auditoria de Performance — Agência Roomi (Sais Beach Living Hotel)

**Período do relatório da agência:** 26/05 a 24/06/2026 (Meta Ads + Google Ads, via Windsor.ai)
**Período do CSV de reservas (Booking Engine):** reservas criadas 01/06 a 25/06/2026
**Gerado:** 25/06/2026, a partir de cruzamento entre o relatório oficial da Roomi e o export real de reservas do motor de reservas.

## Gatilho

Vinícius identificou que, na conta Google Ads, `conversion_value` é numericamente
idêntico ao número de conversões em todas as linhas — sinal de que o evento de
conversão dispara com valor fixo `1`, não com o valor real da reserva. Consequência:
nenhum ROAS reportado pela plataforma é confiável, e estratégias de lance por valor
(Target ROAS) não podem ter sido configuradas corretamente nesse período.

## Parâmetros base (inputs verificados)

| Parâmetro | Valor | Fonte |
|---|---|---|
| ADR médio real | R$ 988/noite | CSV reservas |
| LOS médio | 2,7 noites | CSV reservas (65 noites / 24 reservas) |
| Ticket médio | R$ 2.667,60 | ADR × LOS |
| Take rate OTA (Booking) | 18% | Contrato padrão |
| CAC não-mídia | R$ 306/reserva | Fornecido pelo Vinícius (motor de reserva + gateway + atendimento) |

## Números-base

| Métrica | Valor | Fonte |
|---|---|---|
| Gasto total Meta + Google | R$ 7.090,51 (Meta R$ 1.529,10 + Google R$ 5.561,41) | Relatório Roomi |
| Conversões Google reportadas (Search Destino + Institucional) | 390,0 (fracionadas: 218,1 + 171,9) | Relatório Roomi |
| Conversões Google, todas campanhas | ~394,0 (+ PMax 3,0 + DNS26 1,0) | Relatório Roomi |
| Conversões Meta rastreadas | 0 (pixel "Reserva Finalizada" não dispara) | Relatório Roomi |
| Conversões Display Remarketing (Google) | 0, sobre 7.224 cliques pagos (R$ 1.397,63) | Relatório Roomi |
| Reservas reais no Booking Engine (período) | 24 reservas | CSV `Reservas site - GERAL.csv` |
| Receita real dessas 24 reservas | R$ 64.261,85 | CSV |
| Noites totais | 65 | CSV |

## A lógica por trás das fórmulas

Quando o hóspede reserva pela Booking, o hotel paga 18% de comissão.
Quando reserva direto, o hotel economiza esses 18% — mas ainda tem custos
fixos (motor de reserva, gateway, atendimento): o CAC não-mídia de R$ 306/reserva.

A pergunta real: **do que eu economizo não pagando a Booking, quanto sobra pra gastar em anúncio?**

```
Economia por reserva direta = Ticket médio × take_rate
                             = 2.667,60 × 0,18
                             = R$ 480,17

Sobra para mídia = Economia − CAC não-mídia
                 = 480,17 − 306
                 = R$ 174,17/reserva  ← teto de ad spend por reserva
```

## Achado 1 — Discrepância bruta de contagem (independe do bug de valor)

390 conversões reportadas pelo Google (campanhas de Search) vs 24 reservas reais
registradas no motor de reservas, em janelas quase idênticas. Mesmo se TODAS as 24
reservas reais viessem do Google Search, ainda restariam ~366 "conversões" sem
reserva correspondente. Hipóteses: contagem de conversões assistidas/fracionadas em
excesso (o próprio relatório da Roomi já alerta isso na seção 3.3 — "valores como
24,56 e 16,5 sugerem modelo de atribuição fracionada"), ou conversões de busca de
marca (branded) contando como aquisição nova.

## Achado 2 — Canais pagando clique sem nenhuma conversão rastreada

- Meta: R$ 1.529,10 gastos, pixel "Reserva Finalizada" configurado mas sem nenhum
  disparo confirmado no período.
- Google Display Remarketing: R$ 1.397,63 gastos, 7.224 cliques reais (CTR 9,11%),
  zero conversões rastreadas.
- Juntos, **R$ 2.926,73 (41,3% do budget total) operando sem dado de conversão
  utilizável.**

## Achado 3 — ROAS e Spread "sem comissionamento" (teto, não medição)

Como as 24 reservas do CSV são todas canal "Booking Engine" (direto, sem comissão
de OTA), a comparação correta contra o gasto de mídia é direta — sem desconto de
take rate. Mas **não existe UTM/atribuição cruzada neste CSV** que prove quantas
dessas 24 reservas vieram especificamente dos anúncios — pode haver reserva
orgânica, recorrente ou indicação misturada. Os números abaixo são **teto
(melhor caso possível para a agência)**, não ROAS real:

```
ROAS sem comissionamento = Receita real / Gasto total ads
                         = R$ 64.261,85 / R$ 7.090,51
                         = 9,06x  (teto)

Spread sem comissionamento = Receita real − Gasto total ads
                            = R$ 64.261,85 − R$ 7.090,51
                            = R$ 57.171,34  (teto)
```

**Teste de sensibilidade:** uma única reserva (Barbara Garcia, R$ 19.795,50, estadia
de Ano Novo, 4 noites) é 30,8% da receita total das 24 reservas. Removendo-a:

```
23 reservas restantes = R$ 44.466,35
ROAS sem comissionamento (sem outlier) = R$ 44.466,35 / R$ 7.090,51 = 6,27x
```

O teto de 9,06x não é robusto — depende fortemente de uma reserva isolada cuja
origem (ad vs orgânico/recorrente) não está comprovada.

## Achado 4 — CAC não-mídia real (R$ 306/reserva)

```
Ad spend máximo por reserva = Ticket médio × take_rate − CAC não-mídia
                             = R$ 2.667,60 × 0,18 − R$ 306
                             = R$ 480,17 − R$ 306
                             = R$ 174,17/reserva

Target CPA seguro (×0,85) = R$ 148,04/reserva

Ad spend máximo agregado = Receita real × take_rate − (n_reservas × CAC não-mídia)
                          = R$ 64.261,85 × 0,18 − (24 × R$ 306)
                          = R$ 11.567,13 − R$ 7.344,00
                          = R$ 4.223,13

Gasto real de mídia (R$ 7.090,51) excede esse teto em R$ 2.867,38
```

**Custo real por reserva atribuída:**
- Cenário otimista (24/24 vieram de anúncio): R$ 295/reserva → acima do teto de R$ 174
- Cenário realista (12/24 vieram de anúncio): R$ 591/reserva → 3,4× o teto

## Achado 5 — Ticket mínimo de equilíbrio

```
Ticket mínimo de equilíbrio = CAC não-mídia / take_rate
                             = R$ 306 / 0,18
                             = R$ 1.700
```

Das 24 reservas reais, **14 (58%) têm ticket abaixo de R$ 1.700** — para essas,
direto-first não compensa contra a Booking independente de quanto se gaste em mídia:
o CAC não-mídia já consome mais do que a economia de comissão.

Só as **10 reservas com ticket acima de R$ 1.700** têm janela real de spread positivo.

**Implicação:** vale segmentar campanha/orçamento por faixa de ticket esperado
(estadia longa, quarto superior, datas de alta temporada), não tratar o mix inteiro
com a mesma régua.

## As 4 perguntas sênior aplicadas

1. **Gross ou net?** Usamos receita real do hotel (CSV), não o `conversion_value` da plataforma, que está inválido.
2. **Incremental ou branded?** Search Institucional (busca pelo nome do hotel) é 171,9 das 390 conversões reportadas (44%) — parte relevante é demanda que provavelmente viria de qualquer forma.
3. **CAC completo ou só mídia?** Apenas mídia (R$ 7.090,51). O teto cairia mais se somasse motor de reserva, gateway, atendimento — mas esses já estão no CAC não-mídia separado.
4. **Acima ou abaixo do break-even vs OTA?** A comparação aqui não é direto vs OTA (ambos os lados já são diretos), é mídia paga vs receita direta total. O break-even relevante é o ticket mínimo de R$ 1.700.

## Síntese para avaliação da agência

1. `conversion_value` fixo em 1 invalida retroativamente qualquer ROAS que a Roomi já tenha reportado ou usado para decisão de lance.
2. 390 conversões reportadas vs 24 reservas reais é discrepância de ordem de grandeza — sinal de atribuição quebrada, não de canal eficiente.
3. 41,3% do budget (Meta total + Display Remarketing) está em canais sem nenhuma conversão rastreada — operando às cegas há pelo menos um mês.
4. O relatório da Roomi nunca menciona ROAS ou receita — só CPA/CTR/CPC/conversões. Dado o que foi encontrado, essa omissão não é neutra.
5. O gasto real (R$ 7.090) excedeu o teto sustentável (R$ 4.223) em R$ 2.867 — mesmo no cenário mais otimista possível. A situação é "mal gerenciado", não "estruturalmente inviável" — há R$ 174/reserva de margem real para trabalhar.

## Dados brutos — reservas usadas no cálculo

| Hóspede | Reserva | Check-in | Noites | Valor (R$) | Acima de R$1.700? |
|---|---|---|---|---|---|
| Barbara Garcia | RES004828 | 29/12/2026 | 4 | 19.795,50 | ✓ |
| Carlos Germano Junior | RES004712 | 08/06/2026 | 1 | 516,80 | — |
| Cicero Gralha Junior | RES004710 | 20/07/2026 | 1 | 782,29 | — |
| Fabio Rosa | RES005276 | 31/07/2026 | 2 | 1.258,20 | — |
| Fernando Da Silva | RES004954 | 09/06/2026 | 2 | 1.520,00 | — |
| Geisa Maria Brito Batista | RES005255 | 02/09/2026 | 5 | 3.590,32 | ✓ |
| Gleicianne Rodrigues Ferreira | RES005279 | 13/07/2026 | 2 | 1.665,98 | — |
| Hugo Toledo | RES004800 | 12/06/2026 | 1 | 599,00 | — |
| Ilka Almeida | RES004976 | 10/12/2026 | 4 | 4.932,90 | ✓ |
| Ladi Marcon Rampanelli | RES005313 | 25/08/2026 | 7 | 3.603,77 | ✓ |
| Lucas Barbosa de Almeida Silva | RES005075 | 19/06/2026 | 1 | 898,50 | — |
| Lucas Barbosa de Almeida Silva | RES005226 | 24/06/2026 | 2 | 2.355,53 | ✓ |
| Ludmila Carvalho | RES005265 | 07/07/2026 | 1 | 686,25 | — |
| Luise Kosmaliski Melo | RES005176 | 31/07/2026 | 5 | 2.845,00 | ✓ |
| Luzinete Fernandes | RES005303 | 21/06/2026 | 1 | 549,00 | — |
| Maria José Araújo | RES005193 | 29/07/2026 | 8 | 4.492,00 | ✓ |
| Mariana Cerqueira | RES004975 | 13/06/2026 | 1 | 898,50 | — |
| Maricelma Santiago | RES005054 | 12/06/2026 | 1 | 898,50 | — |
| Patricia Wienandts | RES005305 | 18/07/2026 | 4 | 3.437,82 | ✓ |
| Reinaldo Silva Seabra | RES005278 | 13/07/2026 | 2 | 1.851,08 | ✓ |
| Suzan Stefanny Araujo Lobo | RES005277 | 26/06/2026 | 3 | 1.487,76 | — |
| Tamires Cassella | RES004984 | 20/06/2026 | 1 | 619,20 | — |
| Vilmo de Souza | RES005153 | 21/06/2026 | 5 | 3.945,95 | ✓ |
| Wellington Pedro | RES004985 | 12/06/2026 | 1 | 1.032,00 | — |
| **Total** | | | **65 noites** | **R$ 64.261,85** | **10 de 24** |
