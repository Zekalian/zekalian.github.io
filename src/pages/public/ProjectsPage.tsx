import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, ArrowUpRight, Video, Image as ImageIcon, SlidersHorizontal } from 'lucide-react';

interface ProjectsPageProps {
  onNavigate: (route: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate }) => {
  const { projects, categories } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const publishedProjects = useMemo(() => {
    return projects.filter((p) => p.status === 'PUBLISHED');
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return publishedProjects.filter((p) => {
      const matchCategory =
        selectedCategory === 'all' || p.category_id === selectedCategory;

      const cleanQuery = searchTerm.toLowerCase().trim();
      const matchSearch =
        !cleanQuery ||
        p.title.toLowerCase().includes(cleanQuery) ||
        p.client_name.toLowerCase().includes(cleanQuery) ||
        p.description.toLowerCase().includes(cleanQuery);

      return matchCategory && matchSearch;
    });
  }, [publishedProjects, selectedCategory, searchTerm]);

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#005DDD] text-xs font-bold uppercase tracking-wider mb-4">
          <span>Portfolio Catalog</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-950 tracking-[-0.03em] leading-tight">
          Karya &amp; Dokumentasi Produksi
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#334155] leading-relaxed">
          Katalog komprehensif identitas visual, produksi sinematik, dan kampanye digital yang dirancang untuk memperkuat posisi merek klien kami.
        </p>
      </div>

      {/* Filter Pill Tabs & Instant Search Box (PRD 4.3) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-12">
        {/* Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#005DDD] text-white shadow-md shadow-[#005DDD]/20'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            All Works ({publishedProjects.length})
          </button>

          {categories.map((cat) => {
            const count = publishedProjects.filter((p) => p.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#005DDD] text-white shadow-md shadow-[#005DDD]/20'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Debounced / Instant Search input */}
        <div className="relative min-w-[260px] sm:min-w-[320px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari proyek atau nama klien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#005DDD] focus:ring-2 focus:ring-[#005DDD]/10 shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid (16:10 Ratio, Category Badge, Zoom, Title Color Change) */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => {
            const thumbnail =
              project.media?.[0]?.image_url ||
              'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80';

            const categoryName =
              categories.find((c) => c.id === project.category_id)?.name || 'Creative Production';

            return (
              <div
                key={project.id}
                onClick={() => onNavigate(`/projects/${project.slug}`)}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#005DDD]/40 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* 16:10 Aspect Ratio Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src={thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Frosted Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[#005DDD] text-xs font-bold shadow-sm">
                    {project.client_name}
                  </div>

                  {/* Format icon badge */}
                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-slate-950/70 backdrop-blur-sm text-white flex items-center justify-center">
                    {project.media_type === 'VIDEO' ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {categoryName}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#005DDD] transition-colors leading-snug line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-xs text-[#334155] line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>
                      {project.media_type === 'VIDEO'
                        ? project.video_aspect_ratio === '9:16'
                          ? 'Vertical (9:16)'
                          : 'Cinema (16:9)'
                        : 'Visual Collage'}
                    </span>
                    <span className="text-[#005DDD] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Detail Kasus <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8">
          <SlidersHorizontal className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">
            Tidak ada proyek yang sesuai
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Coba gunakan kata kunci pencarian yang berbeda atau pilih kategori lain.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchTerm('');
            }}
            className="mt-5 px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      )}
    </div>
  );
};
