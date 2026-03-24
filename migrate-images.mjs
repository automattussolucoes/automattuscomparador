
import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://kzcteciteooytqxxphjr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6Y3RlY2l0ZW9veXRxeHhwaGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MTk2NTQsImV4cCI6MjA4OTA5NTY1NH0.Tcjmdk4VEuadNGxIcUBJ5GTT0ZuEpTrxV6c7-406GrA';

const PB_URL   = 'https://automattus.pockethost.io/';
const PB_EMAIL = 'contato@automattus.com.br';
const PB_PASS  = 'Automatus26$';

const pb = new PocketBase(PB_URL);

// Helper to download an image as a Blob
async function downloadImage(url) {
  if (!url || !url.startsWith('http')) return null;
  
  // if already pocketbase, skip
  if (url.includes('pockethost.io')) return null;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.blob();
  } catch (err) {
    console.error("Erro ao baixar:", url, err.message);
    return null;
  }
}

async function uploadToPocketBaseImages(blob, filename) {
  const formData = new FormData();
  formData.append('file', blob, filename);
  try {
    const record = await pb.collection('images').create(formData);
    // URL format used in store.ts:
    return `${PB_URL}api/files/images/${record.id}/${record.file}`;
  } catch (err) {
    console.error("Erro ao subir para PB:", filename, err.message);
    return null;
  }
}

async function migrateImages() {
  console.log('🔐 Autenticando...');
  await pb.admins.authWithPassword(PB_EMAIL, PB_PASS);

  // 1. Processar Products
  console.log('\\n📦 Processando produtos...');
  const products = await pb.collection('products').getFullList();
  for (const p of products) {
    if (p.image_url && p.image_url.includes('supabase.co')) {
      console.log(`Baixando imagem de produto: ${p.name}`);
      const ext = path.extname(new URL(p.image_url).pathname) || '.jpg';
      const filename = `${p.id}${ext}`;
      
      const blob = await downloadImage(p.image_url);
      if (blob) {
        const newUrl = await uploadToPocketBaseImages(blob, filename);
        if (newUrl) {
          await pb.collection('products').update(p.id, { image_url: newUrl });
          console.log(`  ✓ Atualizado para: ${newUrl}`);
        }
      }
    }
  }

  // 2. Processar Brands
  console.log('\\n📦 Processando marcas...');
  const brands = await pb.collection('brands').getFullList();
  for (const b of brands) {
    if (b.logo && b.logo.includes('supabase.co')) {
      console.log(`Baixando logo da marca: ${b.name}`);
      const ext = path.extname(new URL(b.logo).pathname) || '.png';
      const filename = `${b.id}${ext}`;
      
      const blob = await downloadImage(b.logo);
      if (blob) {
        const newUrl = await uploadToPocketBaseImages(blob, filename);
        if (newUrl) {
          await pb.collection('brands').update(b.id, { logo: newUrl });
          console.log(`  ✓ Atualizado para: ${newUrl}`);
        }
      }
    }
  }
  
  console.log('\\n🎉 Migração de imagens concluída!');
}

migrateImages().catch(console.error);
