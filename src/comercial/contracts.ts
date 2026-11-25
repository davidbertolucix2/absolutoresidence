import {
  ADDRESS,
  BUILDER,
  DELIVERY,
  formatArea,
  formatBRL,
  getUnit,
  KIND_LABEL,
  LOFT_FLOOR,
  MATRICULAS,
  MOTO_BOX_PRICE,
  TABLE_LABEL,
  WORK_START,
  type Unit,
} from '../data/units';
import { computeFlow, FLOW_PRESETS, type FlowResult } from '../data/payment';
import type { Client, CompanyInfo, ContractRecord, MaritalStatus, RepProfile } from './types';
import { formatDate } from './format';
import { contractCommission } from './commission';
import { DEFAULT_COMPANY } from './seed';

export type ContractDoc = {
  record: ContractRecord;
  title: string;
  unit: Unit;
  flow: FlowResult;
  client: Client;
  rep: RepProfile;
  company: CompanyInfo;
  commission: number;
  clauses: { heading: string; body: string }[];
};

const MARITAL: Record<MaritalStatus, string> = {
  solteiro: 'solteiro(a)',
  casado: 'casado(a)',
  uniao_estavel: 'em união estável',
  divorciado: 'divorciado(a)',
  viuvo: 'viúvo(a)',
};

const blank = (value: string | undefined, fallback = '____________') => (value && value.trim() ? value.trim() : fallback);

function extenso(n: number): string {
  // número de parcelas por extenso (1–72), para reforçar o instrumento
  const u = ['zero', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const d = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta'];
  if (n < 20) return u[n];
  const t = Math.floor(n / 10);
  const r = n % 10;
  return r === 0 ? d[t] : `${d[t]} e ${u[r]}`;
}

function paymentClause(flow: FlowResult, record: ContractRecord): string {
  const parts: string[] = [];
  parts.push(
    `O preço certo e ajustado para a aquisição é de ${formatBRL(flow.total, 2)}, composto pelo preço de tabela da unidade (${formatBRL(flow.tablePrice, 2)}, ${TABLE_LABEL})` +
      (flow.motoBox ? `, acrescido de box para motocicleta (${formatBRL(MOTO_BOX_PRICE, 2)})` : '') +
      (flow.discount > 0 ? `, deduzido desconto comercial de ${formatBRL(flow.discount, 2)} (${record.flow.discountPct}%)` : '') +
      `, a ser pago na modalidade “${FLOW_PRESETS[record.flow.kind].label}”, da seguinte forma:`,
  );
  flow.lines.forEach((line, index) => {
    const letter = String.fromCharCode(97 + index);
    const count = line.count > 1 ? `${line.count} (${extenso(line.count)}) parcelas de ${formatBRL(line.each, 2)}` : `1 (uma) parcela de ${formatBRL(line.each, 2)}`;
    parts.push(`${letter}) ${line.label}: ${count}, totalizando ${formatBRL(line.total, 2)}, com vencimento ${line.when};`);
  });
  if (record.flow.kind === 'avista') {
    parts.push('Parágrafo único. Quitado o preço, fica a PROMITENTE VENDEDORA obrigada a outorgar a escritura definitiva após a averbação da construção e a individualização da matrícula.');
  } else {
    parts.push(
      'Parágrafo primeiro. As parcelas são pagas diretamente à PROMITENTE VENDEDORA, em boletos ou Pix por ela indicados, e o saldo não poderá exceder 72 (setenta e duas) parcelas mensais, conforme tabela vigente.',
    );
    parts.push(
      'Parágrafo segundo. Todas as parcelas vincendas serão corrigidas monetariamente, desde a data deste instrumento até o efetivo pagamento, pela variação do CUB/SC (Custo Unitário Básico da Construção Civil — Sinduscon/SC), aplicada mensalmente.',
    );
    parts.push(
      'Parágrafo terceiro. O atraso no pagamento de qualquer parcela sujeitará o PROMISSÁRIO COMPRADOR a multa de 2% (dois por cento), juros de mora de 1% (um por cento) ao mês pro rata die e correção monetária, sem prejuízo das demais disposições deste contrato.',
    );
  }
  return parts.join('\n');
}

export function buildContract(
  record: ContractRecord,
  client: Client,
  rep: RepProfile,
  company: CompanyInfo = DEFAULT_COMPANY,
): ContractDoc | null {
  const unit = getUnit(record.unitId);
  if (!unit) return null;
  const flow = computeFlow(record.unitPrice, record.flow);
  const isLoft = unit.floor === LOFT_FLOOR;
  const buyerAddress = [client.address, client.city, client.state].filter(Boolean).join(', ');
  const spouse =
    (client.maritalStatus === 'casado' || client.maritalStatus === 'uniao_estavel') && client.spouseName.trim()
      ? `, ${client.maritalStatus === 'casado' ? 'casado(a) com' : 'em união estável com'} ${client.spouseName.trim()}`
      : `, ${MARITAL[client.maritalStatus]}`;

  const clauses = [
    {
      heading: '1. Das partes',
      body:
        `PROMITENTE VENDEDORA: ${blank(company.legalName, BUILDER)}, inscrita no CNPJ sob nº ${blank(company.cnpj)}, com sede em ${blank(company.address)}` +
        `${company.email ? `, e-mail ${company.email}` : ''}, incorporadora e construtora do empreendimento ABSOLUTO RESIDENCE.\n\n` +
        `PROMISSÁRIO(A) COMPRADOR(A): ${blank(client.name)}, ${blank(client.nationality, 'brasileiro(a)')}${spouse}, ${blank(client.profession, 'profissão ____________')}, ` +
        `portador(a) do RG nº ${blank(client.rg)} e inscrito(a) no CPF sob nº ${blank(client.cpf)}, nascido(a) em ${client.birthDate ? formatDate(client.birthDate) : '___/___/____'}, ` +
        `residente em ${blank(buyerAddress)}, e-mail ${blank(client.email)}, telefone ${blank(client.whatsapp)}.`,
    },
    {
      heading: '2. Do empreendimento',
      body:
        `O ABSOLUTO RESIDENCE, edifício residencial em estilo neoclássico, está sendo erguido na ${ADDRESS}, sobre o terreno objeto das ${MATRICULAS}, ` +
        'sob o regime da incorporação imobiliária (Lei nº 4.591/1964). Os projetos encontram-se em aprovação junto aos órgãos competentes.',
    },
    {
      heading: '3. Do objeto',
      body:
        `Pelo presente instrumento, a PROMITENTE VENDEDORA promete vender ao PROMISSÁRIO COMPRADOR, e este promete comprar, a unidade autônoma nº ${unit.id}, ` +
        `localizada no ${unit.floor}º pavimento, tipologia ${KIND_LABEL[unit.kind]}${isLoft ? ' (com mezanino)' : ''}, com área privativa aproximada de ${formatArea(unit.area)}, ` +
        `${unit.bedrooms} ${unit.bedrooms > 1 ? 'dormitórios' : 'dormitório'}, vinculada ao box de garagem ${unit.box}` +
        `${flow.motoBox ? ', e um box para motocicleta de aproximadamente 2 m², a ser indicado pela PROMITENTE VENDEDORA' : ''}, com a correspondente fração ideal de terreno e das áreas comuns.\n\n` +
        'Parágrafo único. As áreas e frações ideais poderão sofrer pequena variação em virtude do desmembramento e da individualização das matrículas, o que o PROMISSÁRIO COMPRADOR declara conhecer e aceitar, nos limites legais.',
    },
    { heading: '4. Do preço e da forma de pagamento', body: paymentClause(flow, record) },
    {
      heading: '5. Do prazo de obra e da entrega',
      body:
        `O início das obras está previsto para ${WORK_START}, e a entrega da unidade está prevista para ${DELIVERY}, admitida a tolerância de 180 (cento e oitenta) dias corridos, ` +
        'nos termos do art. 43-A da Lei nº 4.591/1964. A posse será transmitida mediante a expedição do habite-se e a quitação das parcelas vencidas até a data da entrega.',
    },
    {
      heading: '6. Do padrão construtivo',
      body:
        'A unidade será entregue conforme o Memorial Descritivo do empreendimento, parte integrante deste contrato. Imagens, maquetes e plantas humanizadas são ilustrativas: mobiliário, decoração e paisagismo não fazem parte da entrega, salvo quando constarem do memorial.',
    },
    {
      heading: '7. Das áreas de lazer',
      body:
        'O condomínio contará com as áreas comuns descritas no memorial e no material de vendas, entre elas: piscina adulto com raia integrada, piscina infantil, prainha, bar molhado, bangalôs, deck solarium, academia, salão de festas, gourmet externo, pizza wine bar, fireplace, coworking, smart market, brinquedoteca, lavanderia e pet place.',
    },
    {
      heading: '8. Da cessão',
      body: 'A cessão dos direitos deste contrato a terceiros depende de anuência prévia e por escrito da PROMITENTE VENDEDORA e da quitação das parcelas vencidas.',
    },
    {
      heading: '9. Do desfazimento',
      body:
        'Na hipótese de desfazimento por iniciativa ou inadimplemento do PROMISSÁRIO COMPRADOR, aplicam-se as regras da Lei nº 13.786/2018 (art. 67-A da Lei nº 4.591/1964), inclusive quanto à retenção da comissão de corretagem e da pena convencional ali previstas.',
    },
    {
      heading: '10. Da intermediação',
      body:
        `A venda foi intermediada por ${blank(rep.fullName)}${rep.creci ? `, CRECI ${rep.creci}` : ''}, corretor(a) credenciado(a) ao programa comercial do Absoluto Residence. ` +
        `A remuneração da intermediação é de responsabilidade da PROMITENTE VENDEDORA, correspondendo a ${formatBRL(contractCommission(record), 2)} (8% do valor de venda), conforme política comercial vigente.`,
    },
    {
      heading: '11. Da proteção de dados',
      body: 'As partes tratarão os dados pessoais aqui informados exclusivamente para a execução deste contrato e das obrigações legais correlatas, nos termos da Lei nº 13.709/2018 (LGPD).',
    },
    {
      heading: '12. Do foro',
      body: 'As partes elegem o foro da Comarca de Porto Belo/SC para dirimir quaisquer questões oriundas deste instrumento, com renúncia a qualquer outro, por mais privilegiado que seja.',
    },
  ];

  return {
    record,
    title: `Proposta e instrumento particular de promessa de compra e venda — Unidade ${unit.id}`,
    unit,
    flow,
    client,
    rep,
    company,
    commission: contractCommission(record),
    clauses,
  };
}
