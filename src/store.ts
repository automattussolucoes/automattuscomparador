import { create } from 'zustand';
import { pb, getFileUrl } from './lib/pocketbase';

export interface ProductType {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  seo_title?: string;
  orderIndex: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  productTypeId: string;
  description?: string;
  seo_title?: string;
  orderIndex: number;
}

export interface Specification {
  id: string;
  name: string;
  productTypeId: string;
  orderIndex: number;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  orderIndex: number;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  link: string;
  categoryId: string;
  specs: Record<string, string>;
  badge: 'melhor_compra' | 'melhor_custo_beneficio' | null;
  orderIndex: number;
}

// ─── Helpers: map raw PocketBase records to typed interfaces ────────────────

function mapProductType(r: any): ProductType {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    icon: r.icon,
    description: r.description,
    seo_title: r.seo_title,
    orderIndex: r.order_index ?? 0,
  };
}

function mapCategory(r: any): Category {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    productTypeId: Array.isArray(r.product_type_id) ? r.product_type_id[0] : r.product_type_id,
    description: r.description,
    seo_title: r.seo_title,
    orderIndex: r.order_index ?? 0,
  };
}

function mapSpecification(r: any): Specification {
  return {
    id: r.id,
    name: r.name,
    productTypeId: Array.isArray(r.product_type_id) ? r.product_type_id[0] : r.product_type_id,
    orderIndex: r.order_index ?? 0,
  };
}

function mapProduct(r: any): Product {
  // image may be a filename stored in PocketBase file field
  const imageUrl = r.image_url
    ? r.image_url
    : r.image && !r.image.startsWith('http')
    ? getFileUrl('products', r.id, r.image)
    : r.image;

  return {
    id: r.id,
    name: r.name,
    price: r.price,
    image: imageUrl,
    link: r.link,
    categoryId: Array.isArray(r.category_id) ? r.category_id[0] : r.category_id,
    specs: r.specs ? (typeof r.specs === 'string' ? JSON.parse(r.specs) : r.specs) : {},
    badge: r.badge || null,
    orderIndex: r.order_index ?? 0,
  };
}

function mapBrand(r: any): Brand {
  const logoUrl = r.logo && !r.logo.startsWith('http')
    ? getFileUrl('brands', r.id, r.logo)
    : r.logo;

  return {
    id: r.id,
    name: r.name,
    logo: logoUrl,
    orderIndex: r.order_index ?? 0,
  };
}

// ─── Store ──────────────────────────────────────────────────────────────────

interface AppState {
  productTypes: ProductType[];
  categories: Category[];
  specifications: Specification[];
  products: Product[];
  brands: Brand[];
  isLoading: boolean;

  fetchData: () => Promise<void>;

  addProductType: (pt: Omit<ProductType, 'id' | 'orderIndex'>) => Promise<void>;
  updateProductType: (id: string, pt: Partial<ProductType>) => Promise<void>;
  deleteProductType: (id: string) => Promise<void>;
  reorderProductTypes: (productTypesId: string[]) => Promise<void>;

  addCategory: (cat: Omit<Category, 'id' | 'orderIndex'>) => Promise<void>;
  updateCategory: (id: string, cat: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categoriesId: string[]) => Promise<void>;

  addSpecification: (spec: Omit<Specification, 'id' | 'orderIndex'>) => Promise<void>;
  updateSpecification: (id: string, spec: Partial<Specification>) => Promise<void>;
  deleteSpecification: (id: string) => Promise<void>;
  reorderSpecifications: (productTypeId: string, specsId: string[]) => Promise<void>;

  addProduct: (prod: Omit<Product, 'id' | 'orderIndex'>) => Promise<void>;
  updateProduct: (id: string, prod: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  reorderProducts: (productsId: string[]) => Promise<void>;

  addBrand: (brand: Omit<Brand, 'id' | 'orderIndex'>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  reorderBrands: (brandsId: string[]) => Promise<void>;

  uploadImage: (file: File) => Promise<string | null>;
}

export const useAppStore = create<AppState>((set, get) => ({
  productTypes: [],
  categories: [],
  specifications: [],
  products: [],
  brands: [],
  isLoading: false,

  // ── Fetch all data ────────────────────────────────────────────────────────
  fetchData: async () => {
    set({ isLoading: true });
    try {
      const [types, cats, specs, prods, brands] = await Promise.all([
        pb.collection('product_types').getFullList({ sort: 'order_index,created' }),
        pb.collection('categories').getFullList({ sort: 'order_index,created' }),
        pb.collection('specifications').getFullList({ sort: 'order_index,created' }),
        pb.collection('products').getFullList({ sort: 'order_index,created' }),
        pb.collection('brands').getFullList({ sort: 'order_index,created' }),
      ]);

      set({
        productTypes: types.map(mapProductType),
        categories: cats.map(mapCategory),
        specifications: specs.map(mapSpecification),
        products: prods.map(mapProduct),
        brands: brands.map(mapBrand),
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Upload image ──────────────────────────────────────────────────────────
  // Images are stored in a dedicated `images` collection with a `file` field.
  uploadImage: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const record = await pb.collection('images').create(formData);
      return getFileUrl('images', record.id, record.file as string);
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  },

  // ── Product Types ─────────────────────────────────────────────────────────
  addProductType: async (pt) => {
    const maxOrder = Math.max(-1, ...get().productTypes.map(p => p.orderIndex));
    try {
      const data = await pb.collection('product_types').create({
        ...pt,
        order_index: maxOrder + 1,
      });
      set((state) => ({ productTypes: [...state.productTypes, mapProductType(data)] }));
    } catch (e) { console.error('Error adding product type:', e); }
  },

  updateProductType: async (id, pt) => {
    try {
      const data = await pb.collection('product_types').update(id, pt);
      set((state) => ({
        productTypes: state.productTypes.map(p => p.id === id ? mapProductType(data) : p),
      }));
    } catch (e) { console.error('Error updating product type:', e); }
  },

  deleteProductType: async (id) => {
    try {
      await pb.collection('product_types').delete(id);
      set((state) => ({
        productTypes: state.productTypes.filter(p => p.id !== id),
        categories: state.categories.filter(c => c.productTypeId !== id),
        specifications: state.specifications.filter(s => s.productTypeId !== id),
        products: state.products.filter(p => {
          const cat = state.categories.find(c => c.id === p.categoryId);
          return cat?.productTypeId !== id;
        }),
      }));
    } catch (e) { console.error('Error deleting product type:', e); }
  },

  reorderProductTypes: async (productTypesId) => {
    set((state) => {
      const reordered = productTypesId.map((id, index) => {
        const pt = state.productTypes.find(p => p.id === id)!;
        return { ...pt, orderIndex: index };
      });
      return { productTypes: reordered };
    });
    for (const [index, id] of productTypesId.entries()) {
      await pb.collection('product_types').update(id, { order_index: index });
    }
  },

  // ── Categories ────────────────────────────────────────────────────────────
  addCategory: async (cat) => {
    const maxOrder = Math.max(-1, ...get().categories.filter(c => c.productTypeId === cat.productTypeId).map(c => c.orderIndex));
    try {
      const data = await pb.collection('categories').create({
        name: cat.name,
        slug: cat.slug,
        product_type_id: cat.productTypeId,
        description: cat.description,
        seo_title: cat.seo_title,
        order_index: maxOrder + 1,
      });
      set((state) => ({ categories: [...state.categories, mapCategory(data)] }));
    } catch (e) { console.error('Error adding category:', e); }
  },

  updateCategory: async (id, cat) => {
    const updateData: Record<string, any> = {};
    if (cat.name !== undefined) updateData.name = cat.name;
    if (cat.slug !== undefined) updateData.slug = cat.slug;
    if (cat.productTypeId !== undefined) updateData.product_type_id = cat.productTypeId;
    if (cat.description !== undefined) updateData.description = cat.description;
    if (cat.seo_title !== undefined) updateData.seo_title = cat.seo_title;
    try {
      const data = await pb.collection('categories').update(id, updateData);
      set((state) => ({
        categories: state.categories.map(c => c.id === id ? mapCategory(data) : c),
      }));
    } catch (e) { console.error('Error updating category:', e); }
  },

  deleteCategory: async (id) => {
    try {
      await pb.collection('categories').delete(id);
      set((state) => ({
        categories: state.categories.filter(c => c.id !== id),
        products: state.products.filter(p => p.categoryId !== id),
      }));
    } catch (e) { console.error('Error deleting category:', e); }
  },

  reorderCategories: async (categoriesId) => {
    set((state) => {
      const reordered = categoriesId.map((id, index) => {
        const cat = state.categories.find(c => c.id === id)!;
        return { ...cat, orderIndex: index };
      });
      const otherCategories = state.categories.filter(c => !categoriesId.includes(c.id));
      return { categories: [...otherCategories, ...reordered] };
    });
    for (const [index, id] of categoriesId.entries()) {
      await pb.collection('categories').update(id, { order_index: index });
    }
  },

  // ── Specifications ────────────────────────────────────────────────────────
  addSpecification: async (spec) => {
    const maxOrder = Math.max(-1, ...get().specifications.filter(s => s.productTypeId === spec.productTypeId).map(s => s.orderIndex));
    try {
      const data = await pb.collection('specifications').create({
        name: spec.name,
        product_type_id: spec.productTypeId,
        order_index: maxOrder + 1,
      });
      set((state) => ({ specifications: [...state.specifications, mapSpecification(data)] }));
    } catch (e) { console.error('Error adding specification:', e); }
  },

  updateSpecification: async (id, spec) => {
    const updateData: Record<string, any> = {};
    if (spec.name !== undefined) updateData.name = spec.name;
    if (spec.productTypeId !== undefined) updateData.product_type_id = spec.productTypeId;
    try {
      const data = await pb.collection('specifications').update(id, updateData);
      set((state) => ({
        specifications: state.specifications.map(s => s.id === id ? mapSpecification(data) : s),
      }));
    } catch (e) { console.error('Error updating specification:', e); }
  },

  deleteSpecification: async (id) => {
    try {
      await pb.collection('specifications').delete(id);
      set((state) => ({
        specifications: state.specifications.filter(s => s.id !== id),
        products: state.products.map(p => {
          const newSpecs = { ...p.specs };
          delete newSpecs[id];
          return { ...p, specs: newSpecs };
        }),
      }));
    } catch (e) { console.error('Error deleting specification:', e); }
  },

  reorderSpecifications: async (productTypeId, specsId) => {
    set((state) => {
      const others = state.specifications.filter(s => s.productTypeId !== productTypeId);
      const reordered = specsId.map((id, index) => {
        const spec = state.specifications.find(s => s.id === id)!;
        return { ...spec, orderIndex: index };
      });
      return { specifications: [...others, ...reordered] };
    });
    for (const [index, id] of specsId.entries()) {
      await pb.collection('specifications').update(id, { order_index: index });
    }
  },

  // ── Products ──────────────────────────────────────────────────────────────
  addProduct: async (prod) => {
    const maxOrder = Math.max(-1, ...get().products.filter(p => p.categoryId === prod.categoryId).map(p => p.orderIndex));
    try {
      const data = await pb.collection('products').create({
        name: prod.name,
        price: prod.price,
        image_url: prod.image,
        link: prod.link,
        category_id: prod.categoryId,
        specs: prod.specs,
        badge: prod.badge || null,
        order_index: maxOrder + 1,
      });
      set((state) => ({ products: [...state.products, mapProduct(data)] }));
    } catch (e) { console.error('Error adding product:', e); }
  },

  updateProduct: async (id, prod) => {
    const updateData: Record<string, any> = {};
    if (prod.name !== undefined) updateData.name = prod.name;
    if (prod.price !== undefined) updateData.price = prod.price;
    if (prod.image !== undefined) updateData.image_url = prod.image;
    if (prod.link !== undefined) updateData.link = prod.link;
    if (prod.categoryId !== undefined) updateData.category_id = prod.categoryId;
    if (prod.specs !== undefined) updateData.specs = prod.specs;
    if (prod.badge !== undefined) updateData.badge = prod.badge;
    try {
      const data = await pb.collection('products').update(id, updateData);
      set((state) => ({
        products: state.products.map(p => p.id === id ? mapProduct(data) : p),
      }));
    } catch (e) { console.error('Error updating product:', e); }
  },

  deleteProduct: async (id) => {
    try {
      await pb.collection('products').delete(id);
      set((state) => ({ products: state.products.filter(p => p.id !== id) }));
    } catch (e) { console.error('Error deleting product:', e); }
  },

  reorderProducts: async (productsId) => {
    set((state) => {
      const reordered = productsId.map((id, index) => {
        const p = state.products.find(prod => prod.id === id)!;
        return { ...p, orderIndex: index };
      });
      const otherProducts = state.products.filter(p => !productsId.includes(p.id));
      return { products: [...otherProducts, ...reordered] };
    });
    for (const [index, id] of productsId.entries()) {
      await pb.collection('products').update(id, { order_index: index });
    }
  },

  // ── Brands ────────────────────────────────────────────────────────────────
  addBrand: async (brand) => {
    const maxOrder = Math.max(-1, ...get().brands.map(b => b.orderIndex));
    try {
      const data = await pb.collection('brands').create({
        name: brand.name,
        logo: brand.logo,
        order_index: maxOrder + 1,
      });
      set((state) => ({ brands: [...state.brands, mapBrand(data)] }));
    } catch (e) { console.error('Error adding brand:', e); }
  },

  deleteBrand: async (id) => {
    try {
      await pb.collection('brands').delete(id);
      set((state) => ({ brands: state.brands.filter(b => b.id !== id) }));
    } catch (e) { console.error('Error deleting brand:', e); }
  },

  reorderBrands: async (brandsId) => {
    set((state) => {
      const reordered = brandsId.map((id, index) => {
        const brand = state.brands.find(b => b.id === id)!;
        return { ...brand, orderIndex: index };
      });
      return { brands: reordered };
    });
    for (const [index, id] of brandsId.entries()) {
      await pb.collection('brands').update(id, { order_index: index });
    }
  },
}));
