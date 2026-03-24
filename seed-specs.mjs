import PocketBase from 'pocketbase';

const PB_URL   = 'https://automattus.pockethost.io/';
const PB_EMAIL = 'contato@automattus.com.br';
const PB_PASS  = 'Automatus26$';

const pb = new PocketBase(PB_URL);

const specsData = {
  "Fechaduras": [
    "Tipo de Abertura (senha, biometria, cartão, app, chave)",
    "Capacidade de Senhas (quantidade)",
    "Usuários Cadastráveis",
    "Alimentação (pilha, bateria)",
    "Autonomia da Bateria",
    "Tipo de Instalação (embutir, sobrepor)",
    "Compatibilidade de Porta (espessura)",
    "Resistência (IP) (para externas)",
    "Registro de Acesso (logs)",
    "Integração com automação"
  ],
  "Interruptores": [
    "Número de Botões (1, 2, 3…)",
    "Tipo (touch, físico)",
    "Necessita Neutro (sim/não)",
    "Potência Máxima (W)",
    "Tipo de Carga (LED, incandescente, ventilador)",
    "Compatibilidade com lâmpadas",
    "Material (vidro, plástico)",
    "Instalação (embutido)"
  ],
  "Tomadas": [
    "Potência Máxima (W)",
    "Corrente Máxima (A)",
    "Voltagem (110/220)",
    "Monitoramento de Consumo (sim/não)",
    "Tipo de Plug (padrão BR)",
    "Número de Saídas",
    "Proteção (sobrecarga)"
  ],
  "Lâmpadas": [
    "Potência (W)",
    "Fluxo Luminoso (lumens)",
    "Temperatura de Cor (K)",
    "RGB (sim/não)",
    "Tipo de Soquete (E27, GU10)",
    "Vida Útil (horas)",
    "Dimerizável (sim/não)"
  ],
  "Controles": [
    "Tipo (IR, RF)",
    "Alcance (metros)",
    "Compatibilidade (TV, ar-condicionado, etc.)",
    "Base de Dispositivos (quantidade)",
    "Necessita Linha de Visão (sim/não)",
    "Integração com assistentes"
  ],
  "Sensores": [
    "Tipo de Sensor (movimento, abertura, temperatura, fumaça, etc.)",
    "Alcance (metros)",
    "Ângulo de Detecção",
    "Tempo de Resposta",
    "Alimentação (pilha)",
    "Autonomia",
    "Tipo de Comunicação (Zigbee, Wi-Fi)",
    "Notificações (sim/não)"
  ],
  "Roteadores": [
    "Velocidade (Mbps ou Gbps)",
    "Padrão Wi-Fi (Wi-Fi 5, Wi-Fi 6)",
    "Frequência (2.4GHz / 5GHz)",
    "Número de Antenas",
    "Cobertura (m²)",
    "Número de Dispositivos Suportados",
    "Portas (LAN/WAN)",
    "Mesh (sim/não)"
  ],
  "Hubs": [
    "Protocolos (Zigbee, Z-Wave, Wi-Fi, Bluetooth)",
    "Quantidade de Dispositivos Suportados",
    "Integrações (Alexa, Google, etc.)",
    "Automação Local (sim/não)",
    "Armazenamento (se houver)",
    "Latência / Resposta"
  ],
  "Assistentes": [
    "Assistente (Alexa, Google)",
    "Qualidade de Áudio",
    "Microfones (quantidade)",
    "Alcance de Voz",
    "Tela (se tiver)",
    "Conectividade",
    "Integração com dispositivos"
  ]
};

async function run() {
  console.log('Autenticando...');
  await pb.admins.authWithPassword(PB_EMAIL, PB_PASS);

  console.log('Buscando Tipos de Produto...');
  const pts = await pb.collection('product_types').getFullList();
  
  if (pts.length === 0) {
    console.log("Nenhum 'product_type' encontrado no banco de dados.");
    return;
  }

  // Verificar quais especificações já existem para não duplicar
  const existingSpecs = await pb.collection('specifications').getFullList();
  
  for (const [ptName, specsList] of Object.entries(specsData)) {
    const pt = pts.find(p => p.name.toLowerCase() === ptName.toLowerCase());
    
    if (!pt) {
      console.log(`⚠️ Tipo de Produto "${ptName}" não encontrado no banco.`);
      continue;
    }
    
    console.log(`\n📦 Inserindo em "${pt.name}":`);
    
    // Obter index atual
    const specsForPt = existingSpecs.filter(s => {
      const pId = Array.isArray(s.product_type_id) ? s.product_type_id[0] : s.product_type_id;
      return pId === pt.id;
    });
    
    let maxOrder = specsForPt.reduce((max, s) => Math.max(max, s.order_index || 0), -1);

    for (const specName of specsList) {
      // Evitar duplicações exatas
      const exists = specsForPt.find(s => s.name === specName);
      if (exists) {
        console.log(`  - Pulo: "${specName}" já existe.`);
        continue;
      }

      maxOrder++;
      try {
        await pb.collection('specifications').create({
          name: specName,
          product_type_id: pt.id,
          order_index: maxOrder
        });
        console.log(`  ✓ Adicionado: "${specName}"`);
      } catch (err) {
        console.error(`  ✗ Falha ao adicionar "${specName}":`, err.message);
      }
    }
  }
  
  console.log('\n🎉 Cadastro finalizado!');
}

run().catch(console.error);
