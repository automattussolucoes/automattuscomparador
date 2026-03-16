import React, { useState, useEffect } from 'react';
import { Lock, Camera, Lightbulb, Thermometer, Power, Cpu, BarChart, Megaphone, AtSign, X, Box, Speaker, Tv, Shield, Zap, Wifi, Video, Smartphone, Home, Settings, Monitor, Router, Plug, Instagram, MessageCircle } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from './store';

// Helper to map string icon names to Lucide components
export const iconMap: Record<string, React.ElementType> = {
  Lock, Camera, Lightbulb, Thermometer, Power, Box, Speaker, Tv, Shield, Zap, Wifi, Video, Smartphone, Home, Settings, Monitor, Router, Plug
};

export default function App() {
  const navigate = useNavigate();
  const { productTypes, categories, specifications, products, brands, fetchData, isLoading } = useAppStore();

  const [activeType, setActiveType] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('contato@automattus.com.br');
  const [password, setPassword] = useState('Automatus26$');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set initial active type if not set
  useEffect(() => {
    if (!activeType && productTypes.length > 0) {
      setActiveType(productTypes[0].id);
    }
  }, [productTypes, activeType]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError(error.message);
    } else {
      setLoginSuccess(true);
      setTimeout(() => {
        setShowLogin(false);
        setLoginSuccess(false);
        navigate('/admin');
      }, 1000);
    }
  };

  const handleSignUp = async () => {
    setLoginError('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoginError(error.message);
    } else {
      setLoginSuccess(true);
      alert('Usuário criado com sucesso no Supabase! Verifique o e-mail se necessário.');
      setTimeout(() => {
        setShowLogin(false);
        setLoginSuccess(false);
        navigate('/admin');
      }, 1000);
    }
  };

  // Filter categories based on active product type
  const activeCategories = categories.filter(c => c.productTypeId === activeType);

  // Filter products based on active type and category
  const filteredProducts = products.filter(p => {
    const cat = categories.find(c => c.id === p.categoryId);
    if (cat?.productTypeId !== activeType) return false;
    if (activeCategory && p.categoryId !== activeCategory) return false;
    return true;
  });

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-center border-b border-solid border-[#020617] bg-[#020617] px-4 md:px-20 py-4">
        <div className="relative flex items-center justify-center max-w-6xl w-full">
          <img src="/logo.png" alt="Automattus" className="h-4 md:h-6" />
          <a
            href="https://www.instagram.com/automatushome"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-0 text-slate-400 hover:text-white transition-colors"
          >
            <Instagram className="w-4 h-4" />
          </a>
        </div>
      </header>

      <main className="flex flex-col items-center px-4 md:px-20 py-10 grow">
        <div className="max-w-6xl w-full">
          {/* Title Section */}
          <div className="text-center mb-10">
            <h1 className="text-slate-900 dark:text-slate-100 tracking-tight font-bold leading-tight mb-4 text-xl md:text-2xl">
              Comparador de Produtos de Automação Residencial e Empresarial
            </h1>
          </div>

          {/* Filters Section */}
          <div className="flex flex-col items-center gap-6 mb-12">
            {/* Product Type Row */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                TIPO DE PRODUTO
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {productTypes.map(pt => {
                  const IconComponent = iconMap[pt.icon] || Box;
                  return (
                    <button
                      key={pt.id}
                      onClick={() => {
                        setActiveType(pt.id);
                        setActiveCategory('');
                      }}
                      className={`flex h-8 items-center justify-center rounded-lg border px-3 text-xs font-medium transition-all ${activeType === pt.id
                        ? 'bg-primary border-primary text-white'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary'
                        }`}
                    >
                      <IconComponent className="w-3.5 h-3.5 mr-1.5" /> {pt.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Row */}
            {activeCategories.length > 0 && (
              <div className="flex flex-col items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  CATEGORIA
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setActiveCategory('')}
                    className={`flex h-8 items-center justify-center rounded-lg border px-3 text-xs font-medium transition-all ${activeCategory === ''
                      ? 'bg-slate-800 border-slate-800 text-white dark:bg-slate-200 dark:border-slate-200 dark:text-slate-900'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                  >
                    Todas
                  </button>
                  {activeCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex h-8 items-center justify-center rounded-lg border px-3 text-xs font-medium transition-all ${activeCategory === cat.id
                        ? 'bg-slate-800 border-slate-800 text-white dark:bg-slate-200 dark:border-slate-200 dark:text-slate-900'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 hover:ring-1 hover:ring-primary/20 transition-all duration-300"
              >
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 group-hover:bg-primary/5 dark:group-hover:bg-primary/10 transition-colors duration-300">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-square object-cover rounded-lg mb-4"
                      referrerPolicy="no-referrer"
                    />
                    {product.badge === 'melhor_compra' && (
                      <span className="absolute top-2 right-2 flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-extrabold px-2 py-1 rounded-full shadow-md leading-none uppercase tracking-wide">
                        ⭐ Melhor Compra
                      </span>
                    )}
                    {product.badge === 'melhor_custo_beneficio' && (
                      <span className="absolute top-2 right-2 flex items-center gap-1 bg-violet-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-full shadow-md leading-none uppercase tracking-wide">
                        💎 Custo-Benefício
                      </span>
                    )}
                  </div>
                  <h3 className="text-slate-900 dark:text-slate-100 font-bold text-lg mb-4">
                    {product.name}
                  </h3>
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center h-10 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
                  >
                    Comprar Agora
                  </a>
                </div>

                <div className="p-4 flex flex-col gap-5 grow">
                  {specifications
                    .filter(s => s.productTypeId === activeType)
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map(specDef => {
                      const value = product.specs[specDef.id];
                      if (!value) return null;
                      return (
                        <div key={specDef.id} className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">
                            {specDef.name}
                          </p>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {value}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                Nenhum produto encontrado para esta categoria.
              </div>
            )}
          </div>

          {/* Brands Highlights section (Instagram style) */}
          {brands && brands.length > 0 && (
            <div className="w-full overflow-x-auto scrollbar-hide mt-16 mb-6 pb-4">
              <div className="flex items-center justify-start md:justify-center gap-6 md:gap-8 min-w-max px-2">
                {[...brands].sort((a, b) => a.orderIndex - b.orderIndex).map(brand => (
                  <div key={brand.id} className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[2px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shadow-sm">
                      <div className="w-full h-full rounded-full border-[1.5px] border-white dark:border-slate-900 bg-white overflow-hidden p-[6px] md:p-2 group-hover:scale-[0.97] transition-transform duration-300">
                        <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <span className="text-[10px] md:text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[80px] text-center truncate px-1">
                      {brand.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp CTA */}
          <div className="mt-12 w-full flex justify-center px-4">
            <a
              href="#"
              title="Link ainda não gerado"
              className="group flex flex-col md:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 pr-6 w-full max-w-3xl hover:border-[#25D366]/50 hover:bg-[#25D366]/5 transition-all duration-300"
            >
              <div className="bg-[#25D366]/10 p-3 rounded-full shrink-0 group-hover:bg-[#25D366]/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-[#25D366]" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base">
                  Grupo de Promoções de Automação
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-0.5">
                  Receba ofertas e cupons exclusivos todo dia no seu WhatsApp.
                </p>
              </div>
              <span className="shrink-0 bg-[#25D366] text-white text-xs font-bold px-4 py-2 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity">
                Participar
              </span>
            </a>
          </div>

          <div className="text-center mt-16">
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-xs md:text-sm font-normal">
              Casa Inteligente . Tendências de Automação . Automatize sua Casa . Smart Home<br />
              Seleção de Produtos . Melhores Ofertas . Achadinhos . Promoções . Melhores Preços
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-auto px-6 md:px-20 py-10 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              © 2026 Automattus
            </p>
          </div>
          <div className="flex gap-8">
            <a href="https://www.automattus.com.br/projetos" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 text-xs font-medium hover:text-primary">
              Projeto de Automação
            </a>
            <a href="https://loja.automattus.com.br/servicos/" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 text-xs font-medium hover:text-primary">
              Serviços de Instalação
            </a>
            <a href="https://loja.automattus.com.br" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 text-xs font-medium hover:text-primary">
              Loja Automattus
            </a>
            <button onClick={() => setShowLogin(true)} className="text-slate-500 dark:text-slate-400 text-xs font-medium hover:text-primary cursor-pointer">
              Painel Admin
            </button>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Login Admin</h2>

            {loginSuccess ? (
              <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-lg text-center font-medium">
                Autenticado com sucesso! Redirecionando...
              </div>
            ) : (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    required
                  />
                </div>

                {loginError && (
                  <p className="text-red-500 text-sm">{loginError}</p>
                )}

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    type="submit"
                    className="w-full h-10 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
                  >
                    Entrar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}