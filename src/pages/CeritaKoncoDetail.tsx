import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Loader2, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getCeritaKoncoById, CeritaKonco } from "../lib/ceritaKonco";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

export function CeritaKoncoDetail() {
  const { id } = useParams<{ id: string }>();
  const [cerita, setCerita] = useState<CeritaKonco | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCeritaDetail = async () => {
      if (!id) return;
      try {
        const data = await getCeritaKoncoById(id);
        setCerita(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCeritaDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-[10rem]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!cerita) {
    return (
      <div className="flex flex-col justify-center items-center text-center p-6 py-[10rem]">
        <h1 className="text-2xl font-bold font-display text-gray-900 mb-4">Cerita Tidak Ditemukan</h1>
        <p className="text-gray-500 mb-8">Maaf, cerita yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link to="/cerita-konco" className="text-primary-600 font-medium hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Cerita
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <div className="max-w-[85rem] mx-auto px-[0.75rem] sm:px-[1.5rem] lg:px-[4rem] pt-[1rem] pb-[3rem] md:pt-[3rem] md:pb-[5rem] lg:pt-[4rem] lg:pb-[7rem]">
        {/* Header Section with Portrait Image */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.8fr] gap-[1.5rem] sm:gap-[2rem] md:gap-[4rem] mb-[2.5rem] md:mb-[5rem] items-start">
          {/* Left: Portrait Image (3:4 Ratio) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full"
          >
            <Link to="/cerita-konco" className="inline-flex items-center gap-[0.5rem] text-primary-600 hover:text-primary-800 font-medium text-[0.8125rem] sm:text-[0.875rem] mb-[1.25rem] sm:mb-[2rem] transition-colors group">
              <ArrowLeft className="w-[0.875rem] sm:w-[1rem] h-[0.875rem] sm:h-[1rem] transition-transform group-hover:-translate-x-1" /> Kembali ke Daftar
            </Link>

            {cerita.thumbnail_image && (
              <div className="relative aspect-[3/4] bg-gray-100 rounded-[1.25rem] sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-primary-900/10 border border-gray-100 max-w-[20rem] md:max-w-none mx-auto sm:mx-0">
                <img 
                  src={cerita.thumbnail_image} 
                  alt={cerita.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Decorative overlay for patient name (optional mobile accent) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none md:hidden" />
              </div>
            )}
          </motion.div>

          {/* Right: Title and Subtitle */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col h-full pt-2 md:pt-[4.5rem]"
          >
            <div className="flex items-center gap-[0.5rem] text-[0.65rem] sm:text-[0.75rem] font-bold text-primary-600/70 uppercase tracking-[0.15em] mb-[0.75rem] md:mb-[1.5rem]">
              <Calendar className="w-[0.875rem] h-[0.875rem]" />
              {cerita.created_at ? new Date(cerita.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Kisah Baru'}
            </div>

            <h1 className="text-[1.75rem] sm:text-[2.25rem] md:text-[3.5rem] lg:text-[4.5rem] font-display font-bold text-gray-900 leading-[1.1] tracking-tight mb-[1rem] md:mb-[2rem] break-words">
              {cerita.title}
            </h1>
            
            <div className="relative pl-[1rem] sm:pl-[1.5rem] border-l-4 border-primary-200 py-[0.25rem] sm:py-[0.5rem] mb-[1.5rem] md:mb-auto">
              <p className="text-[0.9375rem] sm:text-[1.125rem] md:text-[1.375rem] text-gray-500/90 leading-relaxed font-medium italic break-words">
                {cerita.subtitle_hook}
              </p>
            </div>

            {/* Patient Name - Right Aligned at Bottom */}
            {cerita.patient_name && (
              <div className="mt-[1rem] md:mt-[4rem] text-left md:text-right">
                                <p className="text-[1.125rem] sm:text-[1.5rem] md:text-[1.75rem] font-display font-bold text-primary-900">
                  {cerita.patient_name}
                </p>
                <div className="inline-block w-8 h-1 sm:w-12 sm:h-1.5 bg-primary-500 rounded-full mt-1 sm:mt-2" />
              </div>
            )}
          </motion.div>
        </div>

        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full overflow-hidden"
        >
          <div className="prose prose-sm sm:prose-base md:prose-lg lg:prose-xl prose-gray max-w-none prose-p:text-justify prose-headings:text-left prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary-600 prose-blockquote:border-primary-200 prose-blockquote:bg-primary-50/30 prose-blockquote:py-[0.25rem] prose-blockquote:px-[1.25rem] sm:prose-blockquote:px-[1.5rem] prose-blockquote:rounded-r-[1rem] prose-pre:bg-gray-900 prose-pre:text-gray-100 flow-root">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {cerita.content}
            </ReactMarkdown>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
