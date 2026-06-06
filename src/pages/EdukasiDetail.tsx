import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, Loader2, PlayCircle, Share2, Printer } from "lucide-react";
import { getEdukasiById, Edukasi } from "../lib/edukasi";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { getYoutubeEmbedUrl, isYoutubeUrl } from "../lib/videoUtils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export function EdukasiDetail() {
  const { id } = useParams<{ id: string }>();
  const [edukasi, setEdukasi] = useState<Edukasi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEdukasi = async () => {
      if (!id) return;
      try {
        const data = await getEdukasiById(id);
        setEdukasi(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEdukasi();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-[10rem]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!edukasi) {
    return (
      <div className="flex flex-col justify-center items-center p-6 text-center py-[10rem]">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Materi Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-8">Maaf, materi edukasi yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link to="/edukasi">
          <button className="px-6 py-3 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-700 transition-colors">
            Kembali ke Edukasi
          </button>
        </Link>
      </div>
    );
  }

  const isVideo = edukasi.media_type === 'video' || isYoutubeUrl(edukasi.media_url);
  const embedUrl = isVideo ? getYoutubeEmbedUrl(edukasi.media_url) : null;

  return (
    <div className="w-full bg-white">
      <div className="max-w-[85rem] mx-auto px-[0.75rem] sm:px-[1.5rem] lg:px-[4rem] pt-[1rem] pb-[3rem] md:pt-[3rem] md:pb-[5rem] lg:pt-[4rem] lg:pb-[7rem]">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-[1.5rem] sm:mb-[2rem] md:mb-[3.5rem] overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-[0.75rem] mb-[1.25rem] sm:mb-[2rem] md:mb-[3rem]">
            <Link to="/edukasi" className="inline-flex items-center gap-[0.5rem] text-primary-600 hover:text-primary-800 font-medium text-[0.8125rem] sm:text-[0.875rem] transition-colors group">
              <ArrowLeft className="w-[0.875rem] sm:w-[1rem] h-[0.875rem] sm:h-[1rem] transition-transform group-hover:-translate-x-1" /> Kembali ke Edukasi
            </Link>
          
          </div>
          
          <div className="flex items-center gap-[0.5rem] text-[0.65rem] sm:text-[0.75rem] font-semibold text-primary-600/70 uppercase tracking-[0.1em] mb-[0.75rem] sm:mb-[1rem]">
            <Calendar className="w-[0.75rem] sm:w-[0.875rem] h-[0.75rem] sm:h-[0.875rem]" />
            {edukasi.created_at ? new Date(edukasi.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru'}
            <span className="mx-[0.375rem] sm:mx-2 text-gray-200">•</span>
            <span className="flex items-center gap-[0.25rem]">
               {isVideo ? <PlayCircle className="w-[0.75rem] sm:w-3.5 h-[0.75rem] sm:h-3.5" /> : null}
               {isVideo ? 'Video' : 'Materi Bacaan'}
            </span>
          </div>

          <h1 className="text-[1.75rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] font-display font-bold text-gray-900 leading-[1.1] tracking-tight mb-[1rem] sm:mb-[1.5rem] break-words">
            {edukasi.title}
          </h1>
          
          <div className="relative pl-[0.75rem] sm:pl-[1.5rem] border-l-4 border-primary-100 py-[0.1875rem] sm:py-[0.25rem]">
            <p className="text-[0.9375rem] sm:text-[1.125rem] md:text-[1.25rem] text-gray-500 leading-relaxed font-medium italic break-words">
              {edukasi.subtitle}
            </p>
          </div>
        </motion.div>

        {/* Media Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full aspect-[16/9] bg-gray-100 rounded-[1.25rem] sm:rounded-[2rem] overflow-hidden mb-[2rem] md:mb-[4rem] shadow-2xl shadow-primary-900/5 border border-gray-100 group relative"
        >

          {isVideo && embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={edukasi.title}
            />
          ) : (
            <img 
              src={edukasi.media_url} 
              alt={edukasi.title}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full overflow-hidden"
        >
          <div className="prose prose-sm sm:prose-base md:prose-lg lg:prose-xl prose-gray max-w-none prose-p:text-justify prose-headings:text-left prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary-600 prose-blockquote:border-primary-200 prose-blockquote:bg-primary-50/30 prose-blockquote:py-[0.25rem] prose-blockquote:px-[1rem] sm:prose-blockquote:px-[1.5rem] prose-blockquote:rounded-r-[1rem] prose-pre:bg-gray-900 prose-pre:text-gray-100 flow-root">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {edukasi.content}
            </ReactMarkdown>
          </div>
        </motion.article>

      </div>
    </div>
  );
}
