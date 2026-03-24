import PocketBase from 'pocketbase';

const PB_URL   = 'https://automattus.pockethost.io/';
const PB_EMAIL = 'contato@automattus.com.br';
const PB_PASS  = 'Automatus26$';

const pb = new PocketBase(PB_URL);

async function run() {
  await pb.admins.authWithPassword(PB_EMAIL, PB_PASS);

  const collections = ['product_types', 'categories', 'products'];
  
  for (const collName of collections) {
    try {
      const coll = await pb.collections.getOne(collName);
      
      const hasOrderIndex = coll.schema.find(f => f.name === 'order_index');
      if (!hasOrderIndex) {
        coll.schema.push({
          system: false,
          id: 'order_idx_' + Math.random().toString(36).substring(2, 6),
          name: 'order_index',
          type: 'number',
          required: false,
          presentable: false,
          unique: false,
          options: {}
        });
        
        await pb.collections.update(coll.id, coll);
        console.log(`✅ Adicionado 'order_index' em '${collName}'`);
      } else {
        console.log(`ℹ️ '${collName}' já possui 'order_index'`);
      }
    } catch (err) {
      console.error(`❌ Erro em '${collName}':`, err.message);
    }
  }
}

run().catch(console.error);
