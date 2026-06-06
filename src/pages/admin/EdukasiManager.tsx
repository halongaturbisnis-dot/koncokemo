import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, Reorder } from "motion/react";
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader2, GripVertical, FileVideo, BookOpen } from "lucide-react";
import { Button } from "../../components/ui/Button";
import Swal from "sweetalert2";
import {
  getEdukasis,
  deleteEdukasi,
  updateEdukasiOrder,
  Edukasi,
} from "../../lib/edukasi";
import { isYoutubeUrl, getYoutubeThumbnail } from "../../lib/videoUtils";

export function EdukasiManager() {
  const [edukasis, setEdukasis] = useState<Edukasi[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEdukasi = async () => {
    setLoading(true);
    try {
      const data = await getEdukasis();
      setEdukasis(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEdukasi();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Materi ini akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      scrollbarPadding: false,
      heightAuto: false
    });

    if (result.isConfirmed) {
      try {
        await deleteEdukasi(id);
        const updated = edukasis.filter((e) => e.id !== id);
        setEdukasis(updated);
        Swal.fire({
          title: "Terhapus!",
          text: "Materi telah berhasil dihapus.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          heightAuto: false
        });
      } catch (error) {
        console.error("Gagal menghapus", error);
        Swal.fire({
          title: "Error!",
          text: "Gagal menghapus data.",
          icon: "error",
          heightAuto: false
        });
      }
    }
  };

  const handleReorder = (newEdukasis: Edukasi[]) => {
    setEdukasis(newEdukasis);
  };

  const handleDragEnd = async () => {
    try {
      await updateEdukasiOrder(edukasis.map(e => e.id));
    } catch (error) {
      console.error("Gagal menyimpan urutan baru", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl">Manajemen Edukasi</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola materi literasi, panduan medis, dan video edukasi.
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/edukasi/new")}
          className="flex items-center gap-2 text-sm px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary-200"
        >
          <Plus className="w-4 h-4" /> TAMBAH MATERI
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-hidden">
          <div className="hidden md:grid grid-cols-[40px_120px_1fr_120px] gap-4 bg-gray-50 border-b border-gray-100 text-[0.7rem] font-black uppercase tracking-widest text-gray-400 p-6 items-center">
            <div>URUT</div>
            <div>MEDIA</div>
            <div>DETAIL MATERI</div>
            <div className="text-right">AKSI</div>
          </div>
          
          <div className="text-sm">
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                <p className="font-bold">Memuat data...</p>
              </div>
            ) : edukasis.length === 0 ? (
              <div className="p-12 text-center text-gray-500 uppercase tracking-widest text-xs font-bold">
                Belum ada materi edukasi. Silakan tambah materi baru.
              </div>
            ) : (
              <Reorder.Group 
                values={edukasis} 
                onReorder={handleReorder}
                className="flex flex-col w-full"
              >
                {edukasis.map((item) => {
                   const isVideo = item.media_type === 'video' || isYoutubeUrl(item.media_url);
                   const thumbnail = isVideo ? getYoutubeThumbnail(item.media_url) : item.media_url;

                   return (
                    <Reorder.Item
                      key={item.id}
                      value={item}
                      onDragEnd={handleDragEnd}
                      className="grid grid-cols-1 md:grid-cols-[40px_120px_1fr_120px] gap-4 p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 items-center bg-white cursor-grab active:cursor-grabbing relative z-10 transition-colors"
                    >
                      <div className="hidden md:flex justify-center text-gray-300 group-hover:text-primary-400 transition-colors">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <div className="relative group/media">
                        {thumbnail ? (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-md">
                            <img
                              src={thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            {isVideo && (
                               <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <FileVideo className="w-6 h-6 text-white" />
                               </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                            <BookOpen className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="font-bold text-gray-900 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 ${isVideo ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                             {isVideo ? 'Video' : 'Artikel'}
                           </span>
                           <p className="text-[1.1rem] line-clamp-1 text-primary-900" title={item.title}>{item.title}</p>
                        </div>
                        <p className="text-sm text-gray-400 font-medium line-clamp-1 italic">
                          {item.subtitle}
                        </p>
                      </div>

                      <div className="flex justify-end gap-3 md:justify-end shrink-0">
                        <button
                          onClick={() => navigate(`/admin/edukasi/${item.id}`)}
                          className="p-3 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Reorder.Item>
                   );
                })}
              </Reorder.Group>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
