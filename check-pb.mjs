import PocketBase from 'pocketbase';

const pb = new PocketBase('https://automattus.pockethost.io/');

async function check() {
  await pb.admins.authWithPassword('contato@automattus.com.br', 'Automatus26$');
  const prods = await pb.collection('products').getList(1, 1);
  const cats = await pb.collection('categories').getList(1, 1);
  const pt = await pb.collection('product_types').getList(1, 1);
  
  console.log("Product:", prods.items[0]);
  console.log("Category:", cats.items[0]);
  console.log("Product Type:", pt.items[0]);
}

check().catch(console.error);
