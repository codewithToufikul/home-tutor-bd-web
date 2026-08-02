import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { CATEGORIES_DATA } from '@/src/constants';
import { Link } from 'react-router-dom';

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = CATEGORIES_DATA.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-4xl lg:text-6xl font-display font-bold tracking-tight">
                Explore <span className="text-primary">Categories</span>
              </h1>
              <p className="text-base lg:text-lg text-white/50 max-w-2xl mx-auto font-medium">
                Find the perfect tutor across a wide range of subjects and skills tailored to your needs.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-xl mx-auto relative"
            >
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search for subjects, classes, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-primary/50 outline-none transition-all text-base shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Navigation (Sticky) */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-ink/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center gap-4">
            {/* Scroll Container with Fade Edges */}
            <div className="flex-grow overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
              
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-4">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={cn(
                    "px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2",
                    activeCategory === null 
                      ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105" 
                      : "bg-surface text-ink-muted hover:bg-primary/5 hover:text-primary border border-ink/5"
                  )}
                >
                  All Categories
                  <span className={cn(
                    "px-2 py-0.5 rounded-lg text-[10px] font-black",
                    activeCategory === null ? "bg-white/20 text-white" : "bg-ink/5 text-ink-muted"
                  )}>
                    {CATEGORIES_DATA.length}
                  </span>
                </button>
                
                {CATEGORIES_DATA.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 group",
                      activeCategory === cat.id 
                        ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105" 
                        : "bg-surface text-ink-muted hover:bg-primary/5 hover:text-primary border border-ink/5"
                    )}
                  >
                    <cat.icon size={16} className={cn(
                      "transition-transform duration-300",
                      activeCategory === cat.id ? "scale-110" : "group-hover:scale-110"
                    )} />
                    {cat.title}
                    <span className={cn(
                      "px-2 py-0.5 rounded-lg text-[10px] font-black transition-colors",
                      activeCategory === cat.id ? "bg-white/20 text-white" : "bg-ink/5 text-ink-muted group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      {cat.items.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Search Toggle (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-ink/10">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input 
                  type="text"
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl bg-surface border border-ink/5 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-48 transition-all focus:w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {filteredCategories.map((category, catIdx) => (
          <section 
            key={category.id} 
            id={category.id}
            className={cn(
              "space-y-10 scroll-mt-32",
              activeCategory && activeCategory !== category.id ? "hidden" : "block"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", category.color)}>
                  <category.icon size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-bold text-ink">{category.title}</h2>
                  <p className="text-sm text-ink-muted">{category.items.length} Subjects Available</p>
                </div>
              </div>
              <div className="h-px flex-grow mx-8 bg-ink/5 hidden md:block" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {category.items.map((item, itemIdx) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (itemIdx % 4) * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Link 
                    to={`/jobs?category=${encodeURIComponent(category.title)}`}
                    className="relative h-48 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 block"
                  >
                    <img 
                      src={`${category.image}&sig=${itemIdx}`} 
                      alt={item}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <div className="space-y-2">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white mb-2", category.color)}>
                          <category.icon size={16} />
                        </div>
                        <h3 className="text-white font-bold text-lg leading-tight">
                          {item}
                        </h3>
                        <div className="flex items-center gap-2 text-primary text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                          <span>Find Tutors</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-32 space-y-6">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
              <Search size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold text-ink">No results found</h3>
              <p className="text-ink-muted max-w-xs mx-auto">We couldn't find any subjects matching "{searchQuery}". Try a different keyword.</p>
            </div>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-primary font-bold hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Mobile Sticky Search (Visible on scroll up) */}
      <div className="md:hidden fixed bottom-24 left-4 right-4 z-50">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full bg-ink text-white p-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 font-bold"
        >
          <Search size={20} />
          Search Subjects
        </motion.button>
      </div>
    </div>
  );
}
