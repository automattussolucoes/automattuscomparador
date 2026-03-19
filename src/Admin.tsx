import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from './store';
import { Plus, Edit, Trash2, ArrowLeft, Image as ImageIcon, Link as LinkIcon, X, ArrowUp, ArrowDown } from 'lucide-react';
import { iconMap } from './App';

export default function Admin() {
  const location = useLocation();
  const { fetchData } = useAppStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 flex flex-col">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#00123F] bg-[#00123F] px-6 md:px-20 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Automattus" className="h-4 md:h-6" />
            <span className="text-slate-400 font-normal text-base">Admin</span>
          </div>
        </div>
        <Link to="/" className="text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Site
        </Link>
      </header>

      <div className="flex grow">
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col gap-2">
          <NavLink to="/admin" current={location.pathname === '/admin'}>Produtos</NavLink>
          <NavLink to="/admin/tipos" current={location.pathname === '/admin/tipos'}>Tipos de Produto</NavLink>
          <NavLink to="/admin/categorias" current={location.pathname === '/admin/categorias'}>Categorias</NavLink>
          <NavLink to="/admin/especificacoes" current={location.pathname === '/admin/especificacoes'}>Especificações</NavLink>
          <NavLink to="/admin/marcas" current={location.pathname === '/admin/marcas'}>Marcas</NavLink>
        </aside>
        <main className="flex-1 p-8 bg-slate-50 dark:bg-slate-900/50">
          <Routes>
            <Route path="/" element={<ProductsAdmin />} />
            <Route path="/tipos" element={<ProductTypesAdmin />} />
            <Route path="/categorias" element={<CategoriesAdmin />} />
            <Route path="/especificacoes" element={<SpecificationsAdmin />} />
            <Route path="/marcas" element={<BrandsAdmin />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function NavLink({ to, current, children }: { to: string, current: boolean, children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${current
        ? 'bg-primary text-white'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
    >
      {children}
    </Link>
  );
}

function ProductTypesAdmin() {
  const { productTypes, addProductType, updateProductType, deleteProductType } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Box');
  const [seoTitle, setSeoTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Por favor, preencha o nome do tipo de produto.');
      return;
    }

    if (editingTypeId) {
      await updateProductType(editingTypeId, { name, icon, seo_title: seoTitle, description });
    } else {
      await addProductType({ name, icon, seo_title: seoTitle, description });
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setIcon('Box');
    setSeoTitle('');
    setDescription('');
    setEditingTypeId(null);
    setIsModalOpen(false);
  };

  const openEditModal = (pt: any) => {
    setEditingTypeId(pt.id);
    setName(pt.name);
    setIcon(pt.icon || 'Box');
    setSeoTitle(pt.seo_title || '');
    setDescription(pt.description || '');
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tipos de Produto</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="h-10 px-6 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Cadastrar Tipo
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-lg">{editingTypeId ? 'Editar Tipo de Produto' : 'Novo Tipo de Produto'}</h3>
              <button
                onClick={resetForm}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">NOME DO TIPO DE PRODUTO</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ex: Fechaduras"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">TÍTULO SEO (Aba do Navegador)</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                  placeholder="ex: Comparar Fechaduras Inteligentes para Casa"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">TEXTO INTRODUTÓRIO (SEO/Blog)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="ex: Veja as melhores fechaduras digitais..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">ÍCONE</label>
                <div className="grid grid-cols-6 gap-2">
                  {Object.entries(iconMap).map(([iconName, IconComponent]) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setIcon(iconName)}
                      className={`flex items-center justify-center h-12 rounded-lg border transition-all ${icon === iconName
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      title={iconName}
                    >
                      <IconComponent className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-10 px-6 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Cancelar
                </button>
                <button type="submit" className="h-10 px-8 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 flex items-center gap-2">
                  {editingTypeId ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingTypeId ? 'Atualizar Tipo' : 'Salvar Tipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {productTypes.map(pt => {
          const IconComponent = iconMap[pt.icon] || iconMap['Box'];
          return (
            <div key={pt.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="font-medium">{pt.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEditModal(pt)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => deleteProductType(pt.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {productTypes.length === 0 && (
          <div className="p-8 text-center text-slate-500">Nenhum tipo de produto cadastrado.</div>
        )}
      </div>
    </div>
  );
}

function CategoriesAdmin() {
  const { categories, productTypes, addCategory, updateCategory, deleteCategory } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [productTypeId, setProductTypeId] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filterProductTypeId, setFilterProductTypeId] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !productTypeId) {
      alert('Por favor, preencha o nome e selecione o tipo de produto.');
      return;
    }

    if (editingCategoryId) {
      await updateCategory(editingCategoryId, { name, productTypeId, seo_title: seoTitle, description });
    } else {
      await addCategory({ name, productTypeId, seo_title: seoTitle, description });
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setProductTypeId('');
    setSeoTitle('');
    setDescription('');
    setEditingCategoryId(null);
    setIsModalOpen(false);
  };

  const openEditModal = (cat: any) => {
    setEditingCategoryId(cat.id);
    setName(cat.name);
    setProductTypeId(cat.productTypeId);
    setSeoTitle(cat.seo_title || '');
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const displayedCategories = filterProductTypeId
    ? categories.filter(c => c.productTypeId === filterProductTypeId)
    : categories;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="h-10 px-6 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Cadastrar Categoria
        </button>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm font-medium text-slate-500">Filtrar por Tipo:</span>
        <select
          value={filterProductTypeId}
          onChange={e => setFilterProductTypeId(e.target.value)}
          className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos os Tipos</option>
          {productTypes.map(pt => (
            <option key={pt.id} value={pt.id}>{pt.name}</option>
          ))}
        </select>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-lg">{editingCategoryId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button
                onClick={resetForm}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">TIPO DE PRODUTO</label>
                <select
                  value={productTypeId}
                  onChange={e => setProductTypeId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione o Tipo de Produto</option>
                  {productTypes.map(pt => (
                    <option key={pt.id} value={pt.id}>{pt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">NOME DA CATEGORIA</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ex: Wi-Fi"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">TÍTULO SEO (Aba do Navegador)</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                  placeholder="ex: Fechaduras Inteligentes Wi-Fi para Casa"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">TEXTO INTRODUTÓRIO (SEO/Blog)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="ex: Modelos Wi-Fi se conectam direto ao roteador..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary resize-y"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-10 px-6 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Cancelar
                </button>
                <button type="submit" className="h-10 px-8 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 flex items-center gap-2">
                  {editingCategoryId ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingCategoryId ? 'Atualizar Categoria' : 'Salvar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {displayedCategories.map(cat => {
          const pt = productTypes.find(p => p.id === cat.productTypeId);
          return (
            <div key={cat.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
              <div>
                <span className="font-medium mr-2">{cat.name}</span>
                <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-500 dark:text-slate-400">{pt?.name || 'Desconhecido'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEditModal(cat)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => deleteCategory(cat.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {displayedCategories.length === 0 && (
          <div className="p-8 text-center text-slate-500">Nenhuma categoria encontrada.</div>
        )}
      </div>
    </div>
  );
}

function BrandsAdmin() {
  const { brands, addBrand, deleteBrand, reorderBrands, uploadImage } = useAppStore();
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const url = await uploadImage(e.target.files[0]);
      if (url) {
        setLogo(url);
      } else {
        alert('Erro ao fazer upload da logomarca.');
      }
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !logo) {
      alert('Por favor, preencha o nome e faça o upload da logomarca.');
      return;
    }
    await addBrand({ name, logo });
    setName('');
    setLogo('');
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const sortedBrands = [...brands].sort((a, b) => a.orderIndex - b.orderIndex);
    if (direction === 'up' && index > 0) {
      const temp = sortedBrands[index];
      sortedBrands[index] = sortedBrands[index - 1];
      sortedBrands[index - 1] = temp;
      await reorderBrands(sortedBrands.map(b => b.id));
    } else if (direction === 'down' && index < sortedBrands.length - 1) {
      const temp = sortedBrands[index];
      sortedBrands[index] = sortedBrands[index + 1];
      sortedBrands[index + 1] = temp;
      await reorderBrands(sortedBrands.map(b => b.id));
    }
  };

  const displayedBrands = [...brands].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Marcas de Automação</h1>

      <form onSubmit={handleAdd} className="flex flex-col gap-4 mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome da Marca (ex: Sonoff, Tuya)"
            className="flex-1 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex-1">
            {logo ? (
              <div className="flex items-center gap-4 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900">
                <img src={logo} alt="Logo preview" className="h-10 w-10 object-contain rounded-md bg-white p-1 border border-slate-100 dark:border-slate-800" />
                <span className="text-sm font-medium flex-1 truncate text-slate-600 dark:text-slate-400">Imagem carregada</span>
                <button type="button" onClick={() => setLogo('')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className={`flex items-center justify-center gap-2 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {isUploading ? 'Fazendo upload...' : 'Fazer Upload da Logo'}
                </span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
          <button type="submit" className="h-10 px-6 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 flex items-center gap-2 justify-center">
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
      </form>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {displayedBrands.map((brand, index) => (
          <div key={brand.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden bg-white p-1">
                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
              </div>
              <span className="font-medium">{brand.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col mr-2">
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="text-slate-400 hover:text-blue-500 disabled:opacity-30 disabled:hover:text-slate-400 p-0.5"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === displayedBrands.length - 1}
                  className="text-slate-400 hover:text-blue-500 disabled:opacity-30 disabled:hover:text-slate-400 p-0.5"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <button onClick={() => deleteBrand(brand.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {displayedBrands.length === 0 && (
          <div className="p-8 text-center text-slate-500">Nenhuma marca cadastrada.</div>
        )}
      </div>
    </div>
  );
}

function SpecificationsAdmin() {
  const { specifications, productTypes, addSpecification, deleteSpecification, reorderSpecifications } = useAppStore();
  const [name, setName] = useState('');
  const [productTypeId, setProductTypeId] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !productTypeId) {
      alert('Por favor, preencha o nome e selecione o tipo de produto.');
      return;
    }
    await addSpecification({ name, productTypeId });
    setName('');
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!productTypeId) return;

    // Sort items by orderIndex before trying to move them
    const specs = specifications
      .filter(s => s.productTypeId === productTypeId)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    if (direction === 'up' && index > 0) {
      const targetSpecs = [...specs];
      const temp = targetSpecs[index];
      targetSpecs[index] = targetSpecs[index - 1];
      targetSpecs[index - 1] = temp;
      await reorderSpecifications(productTypeId, targetSpecs.map(s => s.id));
    } else if (direction === 'down' && index < specs.length - 1) {
      const targetSpecs = [...specs];
      const temp = targetSpecs[index];
      targetSpecs[index] = targetSpecs[index + 1];
      targetSpecs[index + 1] = temp;
      await reorderSpecifications(productTypeId, targetSpecs.map(s => s.id));
    }
  };

  const displayedSpecs = productTypeId
    ? specifications.filter(s => s.productTypeId === productTypeId).sort((a, b) => a.orderIndex - b.orderIndex)
    : specifications.sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Especificações</h1>

      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 mb-8 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <select
          value={productTypeId}
          onChange={e => setProductTypeId(e.target.value)}
          className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Selecione o Tipo de Produto</option>
          {productTypes.map(pt => (
            <option key={pt.id} value={pt.id}>{pt.name}</option>
          ))}
        </select>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome da Especificação (ex: Botões)"
          className="flex-1 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary"
        />
        <button type="submit" className="h-10 px-6 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 flex items-center gap-2 justify-center">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </form>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {displayedSpecs.map((spec, index) => {
          const pt = productTypes.find(p => p.id === spec.productTypeId);
          return (
            <div key={spec.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
              <div>
                <span className="font-medium mr-2">{spec.name}</span>
                <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-500 dark:text-slate-400">{pt?.name || 'Desconhecido'}</span>
              </div>
              <div className="flex items-center gap-2">
                {productTypeId && (
                  <div className="flex flex-col mr-2">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="text-slate-400 hover:text-blue-500 disabled:opacity-30 disabled:hover:text-slate-400 p-0.5"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === displayedSpecs.length - 1}
                      className="text-slate-400 hover:text-blue-500 disabled:opacity-30 disabled:hover:text-slate-400 p-0.5"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <button onClick={() => deleteSpecification(spec.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {displayedSpecs.length === 0 && (
          <div className="p-8 text-center text-slate-500">Nenhuma especificação encontrada.</div>
        )}
      </div>
    </div>
  );
}

function ProductsAdmin() {
  const { products, productTypes, categories, specifications, addProduct, updateProduct, deleteProduct, uploadImage } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [link, setLink] = useState('');
  const [productTypeId, setProductTypeId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [badge, setBadge] = useState<'melhor_compra' | 'melhor_custo_beneficio' | ''>('');

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const url = await uploadImage(e.target.files[0]);
      if (url) {
        setImage(url);
      } else {
        alert('Erro ao fazer upload da imagem.');
      }
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };
  const filteredCategories = categories.filter(c => c.productTypeId === productTypeId);
  const filteredSpecs = specifications
    .filter(s => s.productTypeId === productTypeId)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId) {
      alert('Por favor, preencha o Nome e a Categoria do produto.');
      return;
    }

    if (editingProductId) {
      await updateProduct(editingProductId, {
        name,
        image: image || 'https://picsum.photos/seed/smart/400/400',
        link: link || '#',
        categoryId,
        specs,
        badge: badge || null
      });
    } else {
      await addProduct({
        name,
        price: '',
        image: image || 'https://picsum.photos/seed/smart/400/400',
        link: link || '#',
        categoryId,
        specs,
        badge: badge || null
      });
    }

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setImage('');
    setLink('');
    setProductTypeId('');
    setCategoryId('');
    setSpecs({});
    setBadge('');
    setEditingProductId(null);
    setIsModalOpen(false);
  };

  const openEditModal = (prod: any) => {
    const cat = categories.find(c => c.id === prod.categoryId);
    if (cat) {
      setProductTypeId(cat.productTypeId);
    }
    setEditingProductId(prod.id);
    setName(prod.name);
    setImage(prod.image);
    setLink(prod.link);
    setCategoryId(prod.categoryId);
    setSpecs(prod.specs || {});
    setBadge(prod.badge || '');
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="h-10 px-6 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Cadastrar Produto
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-lg">{editingProductId ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button
                onClick={resetForm}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">TIPO DE PRODUTO</label>
                  <select
                    value={productTypeId}
                    onChange={e => {
                      setProductTypeId(e.target.value);
                      setCategoryId('');
                      setSpecs({});
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Selecione...</option>
                    {productTypes.map(pt => (
                      <option key={pt.id} value={pt.id}>{pt.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">CATEGORIA</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    disabled={!productTypeId}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  >
                    <option value="">Selecione...</option>
                    {filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">NOME DO PRODUTO</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">IMAGEM DO PRODUTO</label>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <ImageIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isUploading}
                        className="w-full h-10 pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary text-sm shadow-sm cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 disabled:opacity-50"
                      />
                    </div>
                  </div>
                  {isUploading && <p className="text-xs text-primary mt-1 font-medium">Enviando imagem...</p>}
                  {image && (
                    <div className="mt-2 relative inline-block">
                      <img src={image} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">LINK DE COMPRA</label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="url"
                      value={link}
                      onChange={e => setLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">SELO / DESTAQUE</label>
                  <select
                    value={badge}
                    onChange={e => setBadge(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Nenhum</option>
                    <option value="melhor_compra">Melhor Compra</option>
                    <option value="melhor_custo_beneficio">Melhor Custo-Benefício</option>
                  </select>
                </div>
              </div>

              {productTypeId && filteredSpecs.length > 0 && (
                <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 className="font-bold text-sm mb-3">Especificações do Produto</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSpecs.map(spec => (
                      <div key={spec.id}>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{spec.name}</label>
                        <input
                          type="text"
                          value={specs[spec.id] || ''}
                          onChange={e => setSpecs({ ...specs, [spec.id]: e.target.value })}
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-10 px-6 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Cancelar
                </button>
                <button type="submit" className="h-10 px-8 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 flex items-center gap-2">
                  {editingProductId ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingProductId ? 'Atualizar Produto' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {products.map(prod => {
          const cat = categories.find(c => c.id === prod.categoryId);
          const pt = productTypes.find(p => p.id === cat?.productTypeId);

          return (
            <div key={prod.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
              <div className="flex items-center gap-4">
                <img src={prod.image} alt={prod.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                <div>
                  <div className="font-medium">{prod.name}</div>
                  <div className="text-xs text-slate-500 flex gap-2 mt-1">
                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{pt?.name}</span>
                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{cat?.name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEditModal(prod)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => deleteProduct(prod.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <div className="p-8 text-center text-slate-500">Nenhum produto cadastrado.</div>
        )}
      </div>
    </div>
  );
}
