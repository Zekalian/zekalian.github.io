import React from 'react';
import { Target, Compass, Sparkles, MapPin, Award, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AboutPageProps {
  onNavigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { settings } = useApp();

  const defaultValues = [
    {
      title: 'Autentisitas Murni',
      desc: 'Kami menolak klise visual generik. Setiap garis desain dan frame video yang kami ciptakan berakar langsung pada DNA dan nilai unik brand Anda.',
    },
    {
      title: 'Disiplin Ketelitian',
      desc: 'Craftsmanship sejati hadir dalam detail mikro: ritme potongan adegan, keselarasan warna, konsistensi grid tipografi, dan tata suara yang harmonis.',
    },
    {
      title: 'Kemitraan Transparan',
      desc: 'Kami bekerja sebagai perpanjangan tim Anda. Bebas biaya tersembunyi, komitmen jadwal yang transparan, dan komunikasi yang lugas.',
    },
  ];

  const valuesList = settings.about_values_list && settings.about_values_list.length > 0
    ? settings.about_values_list
    : defaultValues;

  const icons = [Sparkles, Target, Compass];

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mb-16 sm:mb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#005DDD] text-xs font-bold uppercase tracking-wider mb-4">
          <span>{settings.about_subtitle || 'About Studio'}</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-950 tracking-[-0.03em] leading-tight">
          {settings.about_title_prefix || 'Menghubungkan Brand dan Audiens Melalui Karya Visual yang'}{' '}
          <span className="font-accent-script font-semibold text-[#005DDD]">
            {settings.about_title_accent || 'Jujur.'}
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-[#334155] leading-relaxed">
          {settings.about_desc || 'Zekalian adalah agensi kreatif independen yang berfokus pada perumusan identitas merek, produksi multimedia sinematik, dan strategi visual berorientasi dampak nyata.'}
        </p>
      </div>

      {/* Story & Philosophy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
        <div
          className="lg:col-span-7 space-y-6 text-base text-[#334155] leading-relaxed [&_p]:mb-4"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {settings.about_philosophy_title || 'Filosofi Kerja Kami'}
          </h2>
          <div
            dangerouslySetInnerHTML={{
              __html: settings.about_philosophy_content || '<p>Di tengah derasnya arus konten instan yang seragam dan tak bernyawa, kami meyakini bahwa manusia senantiasa tergerak oleh keaslian.</p>'
            }}
          />
        </div>

        <div className="lg:col-span-5 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[#005DDD]/10 text-[#005DDD] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            {settings.about_vision_title || 'Visi Jangka Panjang'}
          </h3>
          <p className="text-sm text-[#334155] leading-relaxed">
            {settings.about_vision_desc || 'Menjadi katalis utama transformasi identitas visual bagi merek-merek progresif di Indonesia, membuktikan bahwa karya dari talenta kreatif daerah memiliki daya saing dan kedalaman artistik yang tak terbatas.'}
          </p>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500">
            <MapPin className="w-4 h-4 text-[#005DDD] shrink-0" />
            <span>Studio Utama: {settings.studio_address}</span>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="mb-24">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs uppercase font-bold tracking-widest text-[#005DDD] mb-2">
            {settings.about_values_subtitle || 'Fundamental'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {settings.about_values_title || 'Nilai-Nilai Agensi'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {valuesList.map((val, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#005DDD] flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  {val.title}
                </h3>
                <p className="text-sm text-[#334155] leading-relaxed">
                  {val.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meet Team Teaser */}
      <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">
            Kenali Talenta di Balik Setiap Karya
          </h3>
          <p className="mt-2 text-sm text-slate-600 max-w-xl">
            Sutradara, desainer brand, visualist, dan kru produksi kami siap berkolaborasi mewujudkan visi kreatif Anda.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/team')}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-semibold shadow transition-all shrink-0"
        >
          <span>Direktori Tim Lengkap</span>
          <ArrowRight className="w-4 h-4 text-sky-400" />
        </button>
      </div>
    </div>
  );
};
