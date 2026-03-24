import PocketBase from 'pocketbase';

const PB_URL   = 'https://automattus.pockethost.io/';
const PB_EMAIL = 'contato@automattus.com.br';
const PB_PASS  = 'Automatus26$';

const pb = new PocketBase(PB_URL);

async function run() {
  await pb.admins.authWithPassword(PB_EMAIL, PB_PASS);
  try {
    const coll = await pb.collections.getOne('faqs');
    if (coll) {
      await pb.collections.delete('faqs');
      console.log('✅ Coleção faqs excluída com sucesso.');
    }
  } catch (err) {
    if (err.status === 404) {
      console.log('⚠️ Coleção faqs não existe mais, já foi deletada.');
    } else {
      console.error('❌ Erro ao deletar faqs:', err);
    }
  }
}

run().catch(console.error);
