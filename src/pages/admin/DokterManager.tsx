import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Plus, Edit2, Trash2, User, Loader2, Hospital, MapPin, Search } from "lucide-react";
import { Button } from "../../components/ui/Button";
import Swal from "sweetalert2";
import { getDokters, deleteDokter, Dokter } from "../../lib/dokter";

export default function DokterManager() {
  const [dokters, setDokters] = useState<Dokter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchDoktersData = async () => {
    setLoading(true);
    try {
      const data = await getDokters();
      setDokters(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoktersData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Data dokter ${name} akan dihapus secara permanen!`,
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
        await deleteDokter(id);
        setDokters(dokters.filter((d) => d.id !== id));
        Swal.fire({
          title: "Terhapus!",
          text: "Data dokter telah berhasil dihapus.",
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

  const filteredDokters = dokters.filter((d) => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl">Manajemen Dokter Kemo</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola daftar tenaga medis dan dokter spesialis pendamping.
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/dokter/new")}
          className="flex items-center gap-2 text-sm px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary-200"
        >
          <Plus className="w-4 h-4" /> TAMBAH DOKTER
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari dokter atau spesialisasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all text-sm font-medium"
            />
          </div>
          <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-gray-100">
            {filteredDokters.length} DOKTER TERDAFTAR
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="hidden md:grid grid-cols-[40px_1fr_260px_120px] gap-4 bg-gray-50 border-b border-gray-100 text-[0.7rem] font-black text-gray-400 uppercase tracking-widest p-6 items-center">
            <div className="text-center">#</div>
            <div>BIODATA DOKTER</div>
            <div>LOKASI PRAKTIK UTAMA</div>
            <div className="text-right">AKSI</div>
          </div>
          
          <div className="text-sm">
            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                <p className="font-bold">Memuat data tenaga medis...</p>
              </div>
            ) : filteredDokters.length === 0 ? (
              <div className="p-12 text-center text-gray-500 uppercase tracking-widest text-xs font-bold">
                {searchQuery ? "Tidak ada hasil pencarian." : "Belum ada data dokter."}
              </div>
            ) : (
              <div className="flex flex-col w-full">
                {filteredDokters.map((dokter, idx) => (
                  <motion.div
                    key={dokter.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-[40px_1fr_260px_120px] gap-4 p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 items-center bg-white transition-colors"
                  >
                    <div className="hidden md:flex justify-center text-gray-300 font-mono text-xs font-bold">
                      {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-primary-50 border border-primary-100 shrink-0 flex items-center justify-center text-primary-600 shadow-sm">
                        {dokter.image_url ? (
                          <img
                            src={dokter.image_url}
                            alt={dokter.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 opacity-40" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate uppercase text-sm tracking-tight mb-1">{dokter.name}</p>
                        <p className="text-[11px] font-black text-primary-600/70 uppercase tracking-wider truncate">
                          {dokter.specialization}
                        </p>
                      </div>
                    </div>

                    <div className="text-gray-500 text-xs min-w-0 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-gray-700">
                         <Hospital className="w-3.5 h-3.5 text-gray-400" />
                         <span className="truncate">{dokter.practices[0]?.workplace || "Kosong"}</span>
                      </div>
                      <div className="flex items-start gap-1.5 opacity-80 font-medium">
                         <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                         <span className="line-clamp-1 italic">{dokter.practices[0]?.address || "Alamat belum diatur"}</span>
                      </div>
                      {dokter.practices.length > 1 && (
                        <div className="text-[10px] font-black text-primary-500 bg-primary-50 inline-block px-2.5 py-1 rounded-full">
                           +{dokter.practices.length - 1} LOKASI LAIN
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 md:justify-end">
                      <button
                        onClick={() => navigate(`/admin/dokter/${dokter.id}`)}
                        className="p-3 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(dokter.id, dokter.name)}
                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

