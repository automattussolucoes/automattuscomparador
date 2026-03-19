import { create } from 'zustand';
import { supabase } from './lib/supabase';

export interface ProductType {
  id: string;
  name: string;
  icon: string;
  description?: string;
  seo_title?: string;
}

export interface Category {
  id: string;
  name: string;
  productTypeId: string;
  description?: string;
  seo_title?: string;
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
}

interface AppState {
  productTypes: ProductType[];
  categories: Category[];
  specifications: Specification[];
  products: Product[];
  brands: Brand[];
  isLoading: boolean;

  fetchData: () => Promise<void>;

  addProductType: (pt: Omit<ProductType, 'id'>) => Promise<void>;
  updateProductType: (id: string, pt: Partial<ProductType>) => Promise<void>;
  deleteProductType: (id: string) => Promise<void>;

  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, cat: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addSpecification: (spec: Omit<Specification, 'id' | 'orderIndex'>) => Promise<void>;
  updateSpecification: (id: string, spec: Partial<Specification>) => Promise<void>;
  deleteSpecification: (id: string) => Promise<void>;
  reorderSpecifications: (productTypeId: string, specsId: string[]) => Promise<void>;

  addProduct: (prod: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, prod: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

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

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const [typesRes, catsRes, specsRes, prodsRes, brandsRes] = await Promise.all([
        supabase.from('product_types').select('*').order('created_at', { ascending: true }),
        supabase.from('categories').select('*').order('created_at', { ascending: true }),
        supabase.from('specifications').select('*').order('order_index', { ascending: true }).order('created_at', { ascending: true }),
        supabase.from('products').select('*').order('created_at', { ascending: true }),
        supabase.from('brands').select('*').order('order_index', { ascending: true }).order('created_at', { ascending: true })
      ]);

      if (typesRes.error) throw typesRes.error;
      if (catsRes.error) throw catsRes.error;
      if (specsRes.error) throw specsRes.error;
      if (prodsRes.error) throw prodsRes.error;
      if (brandsRes.error) throw brandsRes.error;

      set({
        productTypes: typesRes.data || [],
        categories: (catsRes.data || []).map(c => ({ id: c.id, name: c.name, productTypeId: c.product_type_id, description: c.description, seo_title: c.seo_title })),
        specifications: (specsRes.data || []).map(s => ({ id: s.id, name: s.name, productTypeId: s.product_type_id, orderIndex: s.order_index })),
        products: (prodsRes.data || []).map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          link: p.link,
          categoryId: p.category_id,
          specs: p.specs || {},
          badge: p.badge || null
        })),
        brands: (brandsRes.data || []).map(b => ({
          id: b.id,
          name: b.name,
          logo: b.logo,
          orderIndex: b.order_index
        }))
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  uploadImage: async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  },

  addProductType: async (pt) => {
    const { data, error } = await supabase.from('product_types').insert([pt]).select().single();
    if (error) console.error('Error adding product type:', error);
    if (!error && data) {
      set((state) => ({ productTypes: [...state.productTypes, data] }));
    }
  },

  updateProductType: async (id, pt) => {
    const { data, error } = await supabase.from('product_types').update(pt).eq('id', id).select().single();
    if (error) console.error('Error updating product type:', error);
    if (!error && data) {
      set((state) => ({
        productTypes: state.productTypes.map(p => p.id === id ? data : p)
      }));
    }
  },

  deleteProductType: async (id) => {
    const { error } = await supabase.from('product_types').delete().eq('id', id);
    if (error) console.error('Error deleting product type:', error);
    if (!error) {
      set((state) => ({
        productTypes: state.productTypes.filter(p => p.id !== id),
        categories: state.categories.filter(c => c.productTypeId !== id),
        specifications: state.specifications.filter(s => s.productTypeId !== id),
        products: state.products.filter(p => {
          const cat = state.categories.find(c => c.id === p.categoryId);
          return cat?.productTypeId !== id;
        })
      }));
    }
  },

  addCategory: async (cat) => {
    const { data, error } = await supabase.from('categories').insert([{
      name: cat.name,
      product_type_id: cat.productTypeId,
      description: cat.description,
      seo_title: cat.seo_title
    }]).select().single();

    if (error) console.error('Error adding category:', error);
    if (!error && data) {
      set((state) => ({
        categories: [...state.categories, { id: data.id, name: data.name, productTypeId: data.product_type_id, description: data.description, seo_title: data.seo_title }]
      }));
    }
  },

  updateCategory: async (id, cat) => {
    const updateData: any = {};
    if (cat.name) updateData.name = cat.name;
    if (cat.productTypeId) updateData.product_type_id = cat.productTypeId;
    if (cat.description !== undefined) updateData.description = cat.description;
    if (cat.seo_title !== undefined) updateData.seo_title = cat.seo_title;

    const { data, error } = await supabase.from('categories').update(updateData).eq('id', id).select().single();
    if (error) console.error('Error updating category:', error);
    if (!error && data) {
      set((state) => ({
        categories: state.categories.map(c => c.id === id ? { id: data.id, name: data.name, productTypeId: data.product_type_id, description: data.description, seo_title: data.seo_title } : c)
      }));
    }
  },

  deleteCategory: async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) console.error('Error deleting category:', error);
    if (!error) {
      set((state) => ({
        categories: state.categories.filter(c => c.id !== id),
        products: state.products.filter(p => p.categoryId !== id)
      }));
    }
  },

  addSpecification: async (spec) => {
    const maxOrder = Math.max(-1, ...get().specifications.filter(s => s.productTypeId === spec.productTypeId).map(s => s.orderIndex));
    const { data, error } = await supabase.from('specifications').insert([{
      name: spec.name,
      product_type_id: spec.productTypeId,
      order_index: maxOrder + 1
    }]).select().single();

    if (error) console.error('Error adding specification:', error);
    if (!error && data) {
      set((state) => ({
        specifications: [...state.specifications, { id: data.id, name: data.name, productTypeId: data.product_type_id, orderIndex: data.order_index }]
      }));
    }
  },

  updateSpecification: async (id, spec) => {
    const updateData: any = {};
    if (spec.name) updateData.name = spec.name;
    if (spec.productTypeId) updateData.product_type_id = spec.productTypeId;

    const { data, error } = await supabase.from('specifications').update(updateData).eq('id', id).select().single();
    if (error) console.error('Error updating specification:', error);
    if (!error && data) {
      set((state) => ({
        specifications: state.specifications.map(s => s.id === id ? { ...s, name: data.name, productTypeId: data.product_type_id } : s)
      }));
    }
  },

  deleteSpecification: async (id) => {
    const { error } = await supabase.from('specifications').delete().eq('id', id);
    if (error) console.error('Error deleting specification:', error);
    if (!error) {
      set((state) => ({
        specifications: state.specifications.filter(s => s.id !== id),
        products: state.products.map(p => {
          const newSpecs = { ...p.specs };
          delete newSpecs[id];
          return { ...p, specs: newSpecs };
        })
      }));
    }
  },

  reorderSpecifications: async (productTypeId, specsId) => {
    set((state) => {
      const otherSpecs = state.specifications.filter(s => s.productTypeId !== productTypeId);
      const updatedList = specsId.map((id, index) => {
        const spec = state.specifications.find(s => s.id === id)!;
        return { ...spec, orderIndex: index };
      });
      return { specifications: [...otherSpecs, ...updatedList] };
    });

    const updates = specsId.map((id, index) => ({ id, order_index: index }));
    for (const update of updates) {
      await supabase.from('specifications').update({ order_index: update.order_index }).eq('id', update.id);
    }
  },

  addProduct: async (prod) => {
    const { data, error } = await supabase.from('products').insert([{
      name: prod.name,
      price: prod.price,
      image: prod.image,
      link: prod.link,
      category_id: prod.categoryId,
      specs: prod.specs,
      badge: prod.badge || null
    }]).select().single();

    if (error) console.error('Error adding product:', error);
    if (!error && data) {
      set((state) => ({
        products: [...state.products, {
          id: data.id,
          name: data.name,
          price: data.price,
          image: data.image,
          link: data.link,
          categoryId: data.category_id,
          specs: data.specs || {},
          badge: data.badge || null
        }]
      }));
    }
  },

  updateProduct: async (id, prod) => {
    const updateData: any = { ...prod };
    if (prod.categoryId) {
      updateData.category_id = prod.categoryId;
      delete updateData.categoryId;
    }

    const { data, error } = await supabase.from('products').update(updateData).eq('id', id).select().single();
    if (error) console.error('Error updating product:', error);
    if (!error && data) {
      set((state) => ({
        products: state.products.map(p => p.id === id ? {
          id: data.id,
          name: data.name,
          price: data.price,
          image: data.image,
          link: data.link,
          categoryId: data.category_id,
          specs: data.specs || {},
          badge: data.badge || null
        } : p)
      }));
    }
  },

  deleteProduct: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) console.error('Error deleting product:', error);
    if (!error) {
      set((state) => ({
        products: state.products.filter(p => p.id !== id)
      }));
    }
  },

  addBrand: async (brand) => {
    const maxOrder = Math.max(-1, ...get().brands.map(b => b.orderIndex));
    const { data, error } = await supabase.from('brands').insert([{
      name: brand.name,
      logo: brand.logo,
      order_index: maxOrder + 1
    }]).select().single();

    if (error) console.error('Error adding brand:', error);
    if (!error && data) {
      set((state) => ({
        brands: [...state.brands, { id: data.id, name: data.name, logo: data.logo, orderIndex: data.order_index }]
      }));
    }
  },

  deleteBrand: async (id) => {
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) console.error('Error deleting brand:', error);
    if (!error) {
      set((state) => ({
        brands: state.brands.filter(b => b.id !== id)
      }));
    }
  },

  reorderBrands: async (brandsId) => {
    set((state) => {
      const updatedList = brandsId.map((id, index) => {
        const brand = state.brands.find(b => b.id === id)!;
        return { ...brand, orderIndex: index };
      });
      return { brands: updatedList };
    });

    const updates = brandsId.map((id, index) => ({ id, order_index: index }));
    for (const update of updates) {
      await supabase.from('brands').update({ order_index: update.order_index }).eq('id', update.id);
    }
  }
}));
