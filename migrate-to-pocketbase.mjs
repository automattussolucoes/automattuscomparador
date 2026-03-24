/**
 * Script de migração: Supabase → PocketBase
 * Executar da raiz do projeto: node migrate-to-pocketbase.mjs
 */

import { createClient } from '@supabase/supabase-js';
import PocketBase from 'pocketbase';

// ── Configuração ─────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://kzcteciteooytqxxphjr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6Y3RlY2l0ZW9veXRxeHhwaGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MTk2NTQsImV4cCI6MjA4OTA5NTY1NH0.Tcjmdk4VEuadNGxIcUBJ5GTT0ZuEpTrxV6c7-406GrA';

const PB_URL   = 'https://automattus.pockethost.io/';
const PB_EMAIL = 'contato@automattus.com.br';
const PB_PASS  = 'Automatus26$';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const pb = new PocketBase(PB_URL);

// Mapeia IDs antigos (UUID Supabase) → novos IDs (PocketBase)
const idMap = {
  product_types: {},
  categories: {},
  specifications: {},
  products: {},
  brands: {},
  faqs: {},
};

async function migrate() {
  console.log('🔐 Autenticando no PocketBase...');
  await pb.admins.authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Autenticado!\n');

  // ── 1. product_types ────────────────────────────────────────────────────
  console.log('📦 Migrando product_types...');
  const { data: types } = await supabase.from('product_types').select('*').order('created_at');
  for (const t of types || []) {
    try {
      const rec = await pb.collection('product_types').create({
        name: t.name,
        slug: t.slug || t.name.toLowerCase().replace(/\s+/g, '-'),
        icon: t.icon,
        description: t.description || '',
        seo_title: t.seo_title || '',
      });
      idMap.product_types[t.id] = rec.id;
      console.log(`  ✓ ${t.name}`);
    } catch (e) {
      console.error(`  ✗ ${t.name}:`, e.message);
    }
  }

  // ── 2. categories ───────────────────────────────────────────────────────
  console.log('\n📦 Migrando categories...');
  const { data: cats } = await supabase.from('categories').select('*').order('created_at');
  for (const c of cats || []) {
    try {
      const rec = await pb.collection('categories').create({
        name: c.name,
        slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
        product_type_id: idMap.product_types[c.product_type_id] || c.product_type_id,
        description: c.description || '',
        seo_title: c.seo_title || '',
      });
      idMap.categories[c.id] = rec.id;
      console.log(`  ✓ ${c.name}`);
    } catch (e) {
      console.error(`  ✗ ${c.name}:`, e.message);
    }
  }

  // ── 3. specifications ───────────────────────────────────────────────────
  console.log('\n📦 Migrando specifications...');
  const { data: specs } = await supabase.from('specifications').select('*').order('order_index');
  for (const s of specs || []) {
    try {
      const rec = await pb.collection('specifications').create({
        name: s.name,
        product_type_id: idMap.product_types[s.product_type_id] || s.product_type_id,
        order_index: s.order_index || 0,
      });
      idMap.specifications[s.id] = rec.id;
      console.log(`  ✓ ${s.name}`);
    } catch (e) {
      console.error(`  ✗ ${s.name}:`, e.message);
    }
  }

  // ── 4. brands ───────────────────────────────────────────────────────────
  console.log('\n📦 Migrando brands...');
  const { data: brands } = await supabase.from('brands').select('*').order('order_index');
  for (const b of brands || []) {
    try {
      const rec = await pb.collection('brands').create({
        name: b.name,
        logo: b.logo,
        order_index: b.order_index || 0,
      });
      idMap.brands[b.id] = rec.id;
      console.log(`  ✓ ${b.name}`);
    } catch (e) {
      console.error(`  ✗ ${b.name}:`, e.message);
    }
  }

  // ── 5. products ─────────────────────────────────────────────────────────
  console.log('\n📦 Migrando products...');
  const { data: prods } = await supabase.from('products').select('*').order('created_at');
  for (const p of prods || []) {
    // Remap spec keys: old Supabase UUID → new PocketBase ID
    const remappedSpecs = {};
    for (const [oldSpecId, val] of Object.entries(p.specs || {})) {
      const newId = idMap.specifications[oldSpecId] || oldSpecId;
      remappedSpecs[newId] = val;
    }

    try {
      const rec = await pb.collection('products').create({
        name: p.name,
        price: p.price,
        image_url: p.image,
        link: p.link,
        category_id: idMap.categories[p.category_id] || p.category_id,
        specs: remappedSpecs,
        badge: p.badge || null,
      });
      idMap.products[p.id] = rec.id;
      console.log(`  ✓ ${p.name}`);
    } catch (e) {
      console.error(`  ✗ ${p.name}:`, e.message);
    }
  }

  // ── 6. faqs ─────────────────────────────────────────────────────────────
  console.log('\n📦 Migrando faqs...');
  const { data: faqs } = await supabase.from('faqs').select('*').order('created_at');
  for (const f of faqs || []) {
    try {
      await pb.collection('faqs').create({
        question: f.question,
        answer: f.answer,
        category_id: f.category_id ? (idMap.categories[f.category_id] || f.category_id) : null,
        product_type_id: f.product_type_id ? (idMap.product_types[f.product_type_id] || f.product_type_id) : null,
      });
      console.log(`  ✓ ${f.question.substring(0, 60)}`);
    } catch (e) {
      console.error(`  ✗ FAQ:`, e.message);
    }
  }

  console.log('\n🎉 Migração concluída!');
  console.log('📊 Resumo:');
  console.log(`  product_types:  ${Object.keys(idMap.product_types).length}`);
  console.log(`  categories:     ${Object.keys(idMap.categories).length}`);
  console.log(`  specifications: ${Object.keys(idMap.specifications).length}`);
  console.log(`  brands:         ${Object.keys(idMap.brands).length}`);
  console.log(`  products:       ${Object.keys(idMap.products).length}`);
  console.log(`  faqs:           ${Object.keys(idMap.faqs).length}`);
}

migrate().catch(console.error);
