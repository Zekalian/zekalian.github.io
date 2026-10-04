import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Clock, ArrowRight, BookOpen, Tag } from 'lucide-react';

interface ArticlesPageProps {
  onNavigate: (route: string) => void;
}

export const ArticlesPage: React.FC<ArticlesPageProps> = ({ onNavigate }) => {
  const { articles } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const publishedArticles = useMemo(() => {
    return articles.filter((a) => a.status === 'PUBLISHED');
  }, [articles]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    publishedArticles.forEach((a) => {
      if (a.tags) {
        a.tags.split(',').forEach((t) => tagsSet.add(t.trim()));
      }
    });
    return Array.from(tagsSet);
  }, [publishedArticles]);

  const filteredArticles = useMemo(() => {
    return publishedArticles.filter((art) => {
      const matchTag =
        selectedTag === 'all' ||
        (art.tags && art.tags.toLowerCase().includes(selectedTag.toLowerCase()));

      const cleanQuery = searchTerm.toLowerCase().trim();
      const matchSearch =
        !cleanQuery ||
        art.title.toLowerCase().includes(cleanQuery) ||
        art.excerpt.toLowerCase().includes(cleanQuery);

      return matchTag && matchSearch;
    });
  }, [publishedArticles, selectedTag, searchTerm]);

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#005DDD] text-xs font-bold uppercase tracking-wider mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Insights Hub</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-950 tracking-[-0.03em] leading-tight">
          Artikel, Tren &amp; Panduan Visual
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#334155] leading-relaxed">
          Refleksi studio, strategi identitas merek, teknik sinematografi, dan perspektif industri kreatif terkini dari tim Zekalian.
        </p>
      </div>

      {/* Search & Tags */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-12">
        {/* Tag Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedTag === 'all'
                ? 'bg-[#005DDD] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            Semua Topik
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-[#005DDD] text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px] sm:min-w-[300px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari artikel wawasan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#005DDD]"
          />
        </div>
      </div>

      {/* Articles Grid (16:9 ratio, Reading time, 2-line title, 3-line excerpt) */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((art) => (
            <article
              key={art.id}
              onClick={() => onNavigate(`/articles/${art.slug}`)}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#005DDD]/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={art.cover_image_url}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {art.tags && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[#005DDD] text-[11px] font-bold">
                      {art.tags.split(',')[0]}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-3">
                    <span>
                      {new Date(art.published_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      {art.reading_time || '4 min read'}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#005DDD] transition-colors line-clamp-2 mb-2 leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-[#334155] line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#005DDD] group-hover:translate-x-1 transition-transform">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Tidak ada artikel yang cocok dengan filter Anda.</p>
        </div>
      )}
    </div>
  );
};
