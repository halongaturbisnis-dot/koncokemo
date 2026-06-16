import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Loader2, BookOpen } from "lucide-react";
import { getEdukasis, Edukasi } from "../lib/edukasi";
import { getYoutubeThumbnail, isYoutubeUrl } from "../lib/videoUtils";
import { SEO } from "../components/SEO";

export function EdukasiList() {
  const [edukasis, setEdukasis] = useState<Edukasi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEdukasi = async () => {
      try {
        const data = await getEdukasis();
        setEdukasis(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEdukasi();
  }, []);

  return (
    <main className="flex-1 w-full max-w-[80rem] mx-auto px-[0.75rem] sm:px-[1.5rem] lg:px-[3rem] pt-[1rem] pb-[2.5rem] md:pt-[2rem] md:pb-[5rem] lg:pt-[2.5rem] lg:pb-[6rem]">
      <SEO 
        title="Edukasi Pasien" 
        description="Dapatkan informasi akurat terpercaya seputar kemoterapi, efek samping, dan tips perawatan dari tenaga medis profesional."
        url="https://koncokemo.com/edukasi"
      />
      <div className="max-w-[48rem] mb-[1.25rem] md:mb-[2rem]">
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[1.5rem] sm:text-[1.875rem] md:text-[2.5rem] font-display font-bold text-gray-900 tracking-tight leading-tight mb-[0.25rem] sm:mb-[0.5rem]"
        >
          Informasi dan Edukasi
        </motion.h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-[3rem] md:py-[5rem] text-gray-500">
          <Loader2 className="w-[2rem] md:w-[2.5rem] h-[2rem] md:h-[2.5rem] animate-spin text-primary-500" />
        </div>
      ) : edukasis.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[1.25rem] sm:rounded-[2rem] p-[1.5rem] sm:p-[3rem] text-center text-gray-500 text-[0.875rem] sm:text-[1rem]">
          Belum ada materi edukasi yang tersedia saat ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1rem] sm:gap-[1.5rem] md:gap-[2rem]">
          {edukasis.map((item, index) => {
            const isVideo = item.media_type === 'video' || isYoutubeUrl(item.media_url);
            const thumbnailUrl = isVideo ? getYoutubeThumbnail(item.media_url) : item.media_url;

            return (
              <motion.article 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col bg-white rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link to={`/edukasi/${item.id}`} className="block relative aspect-[16/9] overflow-hidden bg-gray-100">
                  {thumbnailUrl ? (
                    <img 
                      src={thumbnailUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                       <BookOpen className="w-[2.5rem] h-[2.5rem] text-gray-200" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-[0.75rem] sm:p-[1rem] bg-gradient-to-t from-black/60 to-transparent">
                     <span className="text-white text-[0.625rem] sm:text-[0.7rem] font-bold uppercase tracking-wider bg-primary-600/80 backdrop-blur-md px-[0.625rem] sm:px-[0.75rem] py-[0.1875rem] sm:py-[0.25rem] rounded-full">
                       {isVideo ? 'Video' : 'Artikel'}
                     </span>
                  </div>
                </Link>

                <div className="flex flex-col flex-1 p-[1rem] sm:p-[1.25rem] md:p-[1.5rem]">
                  <div className="mb-[0.5rem] md:mb-[0.75rem] text-[0.65rem] sm:text-[0.7rem] font-semibold text-gray-400 uppercase tracking-widest">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru'}
                  </div>
                  <Link to={`/edukasi/${item.id}`}>
                    <h2 className="text-[1rem] sm:text-[1.125rem] font-bold font-display text-gray-900 leading-tight mb-[0.375rem] sm:mb-[0.5rem] group-hover:text-primary-600 transition-colors line-clamp-2">
                      {item.title}
                    </h2>
                  </Link>
                  <p className="text-gray-500 leading-relaxed mb-[1rem] md:mb-[1.25rem] line-clamp-2 flex-1 text-[0.8125rem] sm:text-[0.875rem]">
                    {item.subtitle}
                  </p>
                  <div className="mt-auto pt-[0.75rem] sm:pt-[1rem] border-t border-gray-50">
                    <Link 
                      to={`/edukasi/${item.id}`}
                      className="inline-flex items-center gap-[0.375rem] text-primary-600 font-bold text-[0.8125rem] sm:text-[0.875rem] hover:text-primary-700 transition-colors group/btn"
                    >
                      Pelajari Selengkapnya
                      <ArrowRight className="w-[0.8125rem] sm:w-[0.875rem] h-[0.8125rem] sm:h-[0.875rem] transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.article>

            );
          })}
        </div>
      )}
    </main>
  );
}
