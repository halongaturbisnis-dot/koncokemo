import { useState } from "react";
import { Input } from "../components/ui/Input";
import { jsPDF } from "jspdf";

export function CekMandiriPage() {
  return (
    <div className="pt-[0.75rem] md:pt-[1.5rem] pb-[3rem] md:pb-[5rem]">
      <CekMandiri />
    </div>
  );
}

function CekMandiri() {
  const [nama, setNama] = useState<string>("");
  const [redFlags, setRedFlags] = useState<Record<string, boolean>>({});
  
  const [mualMuntah, setMualMuntah] = useState<number>(0);
  const [diare, setDiare] = useState<number>(0);
  
  const [nyeriSkala, setNyeriSkala] = useState<number>(0);
  const [nyeriTidur, setNyeriTidur] = useState<boolean>(false);
  const [nyeriAktivitas, setNyeriAktivitas] = useState<boolean>(false);
  
  const [mukositis, setMukositis] = useState<number>(0);
  
  const [dehidrasi, setDehidrasi] = useState<Record<string, boolean>>({});
  
  const [sesak, setSesak] = useState<number>(0);
  const [pucat, setPucat] = useState<Record<string, boolean>>({});
  
  const [leukopenia, setLeukopenia] = useState<number>(0);
  
  const [usia, setUsia] = useState<number>(0);
  const [hariKemo, setHariKemo] = useState<number>(0);
  const [ecog, setEcog] = useState<number>(0);

  const calculateScore = () => {
    // Check direct red flags
    const hasDirectRedFlag = Object.values(redFlags).some((val) => val === true);
    
    // Check implicit red flags from selections
    const isSesakRedFlag = sesak === 999;
    const isLeukopeniaRedFlag = leukopenia === 999;
    const isEmergency = hasDirectRedFlag || isSesakRedFlag || isLeukopeniaRedFlag;

    let total = 0;
    
    // Symptom Scoring
    total += mualMuntah;
    total += diare;
    
    total += nyeriSkala;
    if (nyeriSkala > 0 || nyeriTidur || nyeriAktivitas) {
       if (nyeriTidur) total += 2;
       if (nyeriAktivitas) total += 2;
    }

    total += mukositis;
    
    if (dehidrasi["haus"]) total += 1;
    if (dehidrasi["mulutKering"]) total += 1;
    if (dehidrasi["bakBerkurang"]) total += 3;
    if (dehidrasi["pusingBerdri"]) total += 3;

    if (sesak === 999) {
      total += 10;
    } else {
      total += sesak;
    }

    if (pucat["pucat"]) total += 1;
    if (pucat["lelah"]) total += 2;
    if (pucat["berdebar"]) total += 4;

    if (leukopenia === 999) {
      total += 10;
    } else {
      total += leukopenia;
    }

    // Modifiers
    total += usia;
    total += hariKemo;
    total += ecog;

    let riskLevel = "";
    let actionLevel = "";
    let colorClass = "";

    if (isEmergency) {
      riskLevel = "SANGAT TINGGI (DARURAT)";
      actionLevel = "Segera kunjungi Rumah Sakit / IGD terdekat.";
      colorClass = "bg-red-100 text-red-800 border-red-300";
    } else if (total <= 4) {
      riskLevel = "RISIKO RENDAH";
      actionLevel = "Observasi mandiri di rumah. Tetap jaga pola makan dan istirahat.";
      colorClass = "bg-green-100 text-green-800 border-green-300";
    } else if (total <= 9) {
      riskLevel = "RISIKO RINGAN";
      actionLevel = "Konsultasi dengan Dokter Umum atau melalui Layanan Telemedisin.";
      colorClass = "bg-yellow-100 text-yellow-800 border-yellow-300";
    } else if (total <= 14) {
      riskLevel = "RISIKO SEDANG";
      actionLevel = "Segera hubungi Dokter Spesialis Penyakit Dalam Anda.";
      colorClass = "bg-orange-100 text-orange-800 border-orange-300";
    } else if (total <= 19) {
      riskLevel = "RISIKO TINGGI";
      actionLevel = "Periksa ke dokter Spesialis Hematologi-Onkologi dalam waktu <= 24 jam.";
      colorClass = "bg-rose-100 text-rose-800 border-rose-300";
    } else {
      riskLevel = "RISIKO SANGAT TINGGI";
      actionLevel = "Segera kunjungi Rumah Sakit / IGD terdekat.";
      colorClass = "bg-red-100 text-red-800 border-red-300";
    }

    return { score: total, isEmergency, risk: riskLevel, action: actionLevel, color: colorClass };
  };

  const result = calculateScore();

  const downloadPDF = async () => {
    const doc = new jsPDF();
    
    // Attempt to load transparent logo
    let logoBase64 = "";
    try {
      const response = await fetch("/logo-transparent.png");
      if (response.ok) {
        const blob = await response.blob();
        logoBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } catch (e) {
      console.warn("Failed to convert logo to base64", e);
    }

    doc.setProperties({
      title: `Hasil Cek Mandiri - ${nama || "Pasien"}`,
      subject: "KoncoKemo - Pusat Informasi Pasien Kemoterapi",
      author: "KoncoKemo App",
      creator: "KoncoKemo PDF Creator"
    });

    const marginX = 20;
    let currentY = 15;

    // --- REPORT HEADER ---
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", marginX, currentY, 14, 14, undefined, "FAST");
    }

    doc.setTextColor(92, 53, 143);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("KONCOKEMO", marginX + 18, currentY + 5);

    doc.setTextColor(110, 110, 110);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Pusat Informasi Pasien Kemoterapi", marginX + 18, currentY + 11);

    doc.setTextColor(40, 40, 40);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text("LAPORAN HASIL CEK MANDIRI", 190, currentY + 5, { align: "right" });

    doc.setTextColor(120, 120, 120);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 190, currentY + 11, { align: "right" });

    currentY += 18;
    doc.setDrawColor(214, 202, 236);
    doc.setLineWidth(0.6);
    doc.line(marginX, currentY, 190, currentY);

    currentY += 12;
    doc.setFillColor(245, 243, 250);
    doc.rect(marginX, currentY - 5, 170, 16, "F");
    
    doc.setTextColor(92, 53, 143);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("IDENTITAS PASIEN", marginX + 5, currentY + 1);

    doc.setTextColor(40, 40, 40);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Nama Lengkap   :  ${nama.trim() || "Pasien"}`, marginX + 55, currentY + 1);

    currentY += 21;
    doc.setTextColor(40, 40, 40);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("KESIMPULAN & REKOMENDASI MEDIS", marginX, currentY);

    currentY += 5;
    const isEmergency = result.isEmergency;
    
    let fillRGB = [245, 243, 250];
    let borderRGB = [214, 202, 236];
    let textRGB = [92, 53, 143];

    if (isEmergency) {
      fillRGB = [254, 241, 242]; 
      borderRGB = [244, 63, 94]; 
      textRGB = [159, 18, 57]; 
    } else if (result.score <= 4) {
      fillRGB = [240, 253, 244]; 
      borderRGB = [34, 197, 94]; 
      textRGB = [21, 128, 61]; 
    } else if (result.score <= 9) {
      fillRGB = [254, 252, 232]; 
      borderRGB = [234, 179, 8]; 
      textRGB = [161, 98, 7]; 
    } else if (result.score <= 14) {
      fillRGB = [255, 247, 237]; 
      borderRGB = [249, 115, 22]; 
      textRGB = [194, 65, 12]; 
    } else {
      fillRGB = [255, 241, 242]; 
      borderRGB = [244, 63, 94]; 
      textRGB = [159, 18, 57]; 
    }

    doc.setFillColor(fillRGB[0], fillRGB[1], fillRGB[2]);
    doc.setDrawColor(borderRGB[0], borderRGB[1], borderRGB[2]);
    doc.setLineWidth(0.8);
    doc.rect(marginX, currentY, 170, 28, "FD");

    doc.setTextColor(textRGB[0], textRGB[1], textRGB[2]);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text(isEmergency ? "TINDAKAN DARURAT:" : "REKOMENDASI TINDAKAN:", marginX + 6, currentY + 8);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9.5);
    const actionTextLines = doc.splitTextToSize(result.action, 120);
    doc.text(actionTextLines, marginX + 6, currentY + 14);

    doc.setTextColor(textRGB[0], textRGB[1], textRGB[2]);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(26);
    doc.text(`${result.score}`, 180, currentY + 15, { align: "right" });

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text("Skor Risiko", 180, currentY + 20, { align: "right" });

    currentY += 38;

    doc.setTextColor(40, 40, 40);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("RINCIAN PEMANTAUAN GEJALA", marginX, currentY);

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(marginX, currentY + 3, 190, currentY + 3);

    currentY += 10;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);

    const symptomRecords: string[] = [];
    
    const activeRedFlags = Object.entries(redFlags)
      .filter(([_, val]) => val === true)
      .map(([key]) => {
        const labels: Record<string, string> = {
          demam: "Demam >= 38°C dan riwayat leukosites rendah",
          sesakIstirahat: "Sesak saat beristirahat",
          tidakJalan: "Tidak mampu berjalan +-20 meter karena sesak",
          tidakMinum: "Tidak bisa minum selama >12 jam",
          tidakBAK: "Tidak buang air kecil selama >12 jam",
          muntahTerus: "Muntah terus-menerus hingga tidak bisa makan/minum",
          muntahDarah: "Muntah berdarah",
          babHitam: "Buang air besar hitam (melena)",
          mimisan: "Mimisan yang tidak berhenti",
          penurunanKesadaran: "Sangat lemas, linglung atau penurunan kesadaran"
        };
        return labels[key] || key;
      });

    if (activeRedFlags.length > 0) {
      symptomRecords.push(`Tanda Bahaya (Red Flags): ${activeRedFlags.join(", ")}`);
    } else {
      symptomRecords.push("Tanda Bahaya (Red Flags): Tidak ada yang terdeteksi");
    }

    const mualLabel = mualMuntah === 0 ? "Tidak ada" :
                      mualMuntah === 1 ? "Mual ringan" :
                      mualMuntah === 2 ? "Mual berat" :
                      mualMuntah === 3 ? "Muntah 1-3x sehari" :
                      mualMuntah === 5 ? "Muntah 4-6x sehari" : "Muntah >6x sehari";

    const diareLabel = diare === 0 ? "Tidak ada" :
                       diare === 2 ? "1-3x lebih banyak" :
                       diare === 4 ? "4-6x lebih banyak" : "Lebih dari 6x sehari";

    const nyeriLabel = nyeriSkala === 0 ? "Tidak ada" :
                       nyeriSkala === 1 ? "Nyeri ringan (Skala 1-3)" :
                       nyeriSkala === 3 ? "Nyeri sedang (Skala 4-6)" : "Nyeri hebat (Skala 7-10)";
    let nyeriDetail = "";
    if (nyeriTidur) nyeriDetail += " [Mengganggu Tidur]";
    if (nyeriAktivitas) nyeriDetail += " [Mengganggu Aktivitas]";

    const sariawanLabel = mukositis === 0 ? "Tidak ada" :
                          mukositis === 1 ? "Kemerahan ringan" :
                          mukositis === 3 ? "Luka sariawan ringan" :
                          mukositis === 5 ? "Luka menyulitkan makan" : "Tidak bisa makan/minum";

    const activeDehidrasi = Object.entries(dehidrasi)
      .filter(([_, val]) => val === true)
      .map(([key]) => {
        const labels: Record<string, string> = {
          haus: "Haus terus-menerus",
          mulutKering: "Mulut/bibir kering",
          bakBerkurang: "BAK berkurang drastis",
          pusingBerdri: "Pusing saat berdiri"
        };
        return labels[key] || key;
      });

    const sesakLabel = sesak === 0 ? "Tidak ada" :
                       sesak === 2 ? "Sesak aktivitas berat" :
                       sesak === 5 ? "Sesak aktivitas ringan" : "Sesak saat beristirahat";

    const activePucat = Object.entries(pucat)
      .filter(([_, val]) => val === true)
      .map(([key]) => {
        const labels: Record<string, string> = {
          pucat: "Kulit pucat",
          lelah: "Lekas lelah",
          berdebar: "Jantung berdebar"
        };
        return labels[key] || key;
      });

    const leukoLabel = leukopenia === 0 ? "Normal / Tidak Tahu" :
                       leukopenia === 3 ? "Rendah tanpa gejala" :
                       leukopenia === 4 ? "Rendah disertai sariawan/diare" : "Rendah + DEMAM";

    const usiaLabel = usia === 0 ? "Dibawah 65 Tahun" : "65 Tahun ke atas";

    const kemoLabel = hariKemo === 0 ? "1 - 3 hari yang lalu" :
                      hariKemo === 1 ? "4 - 7 hari atau >14 hari yang lalu" : "8 - 14 hari yang lalu";

    const ecogLabel = ecog === 0 ? "Aktivitas normal" :
                      ecog === 2 ? "Banyak duduk/berbaring" : "Membutuhkan bantuan penuh";

    symptomRecords.push(`Mual & Muntah: ${mualLabel} (Skor: ${mualMuntah})`);
    symptomRecords.push(`Diare: ${diareLabel} (Skor: ${diare})`);
    symptomRecords.push(`Nyeri Badan: ${nyeriLabel}${nyeriDetail} (Skor: ${nyeriSkala + (nyeriTidur ? 2 : 0) + (nyeriAktivitas ? 2 : 0)})`);
    symptomRecords.push(`Sariawan / Luka Mulut: ${sariawanLabel} (Skor: ${mukositis})`);
    symptomRecords.push(`Gejala Dehidrasi: ${activeDehidrasi.length > 0 ? activeDehidrasi.join(", ") : "Tidak ada"}`);
    symptomRecords.push(`Sesak Napas: ${sesakLabel} (Skor: ${sesak === 999 ? "RED FLAG" : sesak})`);
    symptomRecords.push(`Kondisi Anemia (Pucat & Lelah): ${activePucat.length > 0 ? activePucat.join(", ") : "Tidak ada"}`);
    symptomRecords.push(`Status Sel Darah Putih (Leukopenia): ${leukoLabel} (Skor: ${leukopenia === 999 ? "RED FLAG" : leukopenia})`);
    symptomRecords.push(`Usia Pasien: ${usiaLabel} (Skor: ${usia})`);
    symptomRecords.push(`Jarak Kemo Terakhir: ${kemoLabel}`);
    symptomRecords.push(`Kemampuan Fisik Harian (ECOG): ${ecogLabel} (Skor: ${ecog})`);

    symptomRecords.forEach((record) => {
      if (currentY > 262) {
        doc.addPage();
        currentY = 20;

        doc.setFont("Helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(150, 150, 150);
        doc.text("Laporan Cek Mandiri Pasien Kemoterapi - KoncoKemo", marginX, 12);
        doc.setLineWidth(0.1);
        doc.setDrawColor(220, 220, 220);
        doc.line(marginX, 14, 190, 14);
        currentY = 22;
      }

      const colonIndex = record.indexOf(":");
      if (colonIndex !== -1) {
        const key = record.substring(0, colonIndex + 1);
        const value = record.substring(colonIndex + 1);

        doc.setFont("Helvetica", "bold");
        doc.text(key, marginX, currentY);
        
        doc.setFont("Helvetica", "normal");
        const wrappedValue = doc.splitTextToSize(value, 115);
        doc.text(wrappedValue, marginX + 55, currentY);

        currentY += 5.5 * wrappedValue.length + 1;
      } else {
        doc.setFont("Helvetica", "normal");
        const wrappedLine = doc.splitTextToSize(record, 170);
        doc.text(wrappedLine, marginX, currentY);
        currentY += 5.5 * wrappedLine.length + 1;
      }
    });

    currentY += 12;
    if (currentY > 260) {
      doc.addPage();
      currentY = 25;
    }

    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.setLineWidth(0.15);
    doc.setDrawColor(210, 210, 210);
    doc.line(marginX, currentY, 190, currentY);
    
    currentY += 4.5;
    doc.text("Pernyataan Sanggahan (Disclaimer):", marginX, currentY);
    currentY += 4;
    doc.text("1. Laporan hasil cek risiko mandiri ini disusun oleh sistem berdasarkan isian data subjektif dari pasien.", marginX, currentY);
    currentY += 4;
    doc.text("2. Pengukuran ini bersifat sebagai skrining deteksi dini dan sama sekali bukan pengganti anjuran diagnosis atau perawatan medis oleh dokter.", marginX, currentY);
    currentY += 4;
    doc.text("3. Apabila pasien merasakan keluhan medis yang berkepanjangan, memburuk, atau darurat, harap segera kunjungi IGD rumah sakit terdekat.", marginX, currentY);

    const slug = (nama.trim() || "Pasien").replace(/\s+/g, "_");
    doc.save(`Skrining_CekMandiri_${slug}.pdf`);
  };

  return (    <div className="max-w-7xl mx-auto px-[0.5rem] sm:px-[1rem] md:px-[2rem] lg:px-[3rem]">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-[1rem] sm:p-[1.5rem] md:p-[2rem]">
        
        {/* Judul & Deskripsi Utama */}
        <div className="mb-[1.5rem] md:mb-[2.5rem] pb-[1rem] border-b border-gray-100">
          <h1 className="text-[1.5rem] sm:text-[1.75rem] md:text-[2.25rem] font-display font-bold text-primary-900 mb-[0.25rem]">
          Cek Risiko Mandiri
          </h1>
          <p className="text-[0.875rem] sm:text-[1rem] text-gray-600 max-w-3xl leading-relaxed">
            Membantu mengukur tingkat risiko kondisi pasca kemoterapi Anda secara mandiri. 
          </p>
        </div>

        {/* Input Nama Langsung (Tanpa Card Section) */}
        <div className="mb-[2rem] md:mb-[2.5rem]">
           <div className="max-w-md">
              <Input
                label="Nama Lengkap Pasien"
                placeholder="Masukkan nama lengkap pasien..."
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
           </div>
        </div>

        <form className="space-y-[2rem] sm:space-y-[2.5rem] md:space-y-[3rem]">
          
          {/* TAHAP 1 - RED FLAG */}
          <section>
             <h2 className="text-[1.125rem] sm:text-[1.25rem] font-bold text-red-600 mb-[0.75rem] flex items-center gap-[0.5rem]">
               <span className="w-[1.75rem] h-[1.75rem] sm:w-[2rem] sm:h-[2rem] rounded-full bg-red-100 flex items-center justify-center text-red-600 text-[0.875rem]">1</span>
               Tahap 1: Tanda Bahaya / Darurat (Red Flags)
             </h2>
             <p className="text-[0.75rem] text-gray-500 mb-[1rem] ml-[0.25rem] sm:ml-[1.5rem] md:ml-[2.5rem]">Pilih jika Anda mengalami satu atau lebih gejala di bawah ini.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-[0.5rem] sm:gap-[1rem] ml-[0.25rem] sm:ml-[1.5rem] md:ml-[2.5rem]">
                {[
                  { id: "demam", label: "Demam ≥ 38°C dan riwayat leukosit rendah/neutropenia" },
                  { id: "sesakIstirahat", label: "Sesak saat beristirahat" },
                  { id: "tidakJalan", label: "Tidak mampu berjalan ±20 meter karena sesak" },
                  { id: "tidakMinum", label: "Tidak bisa minum selama >12 jam" },
                  { id: "tidakBAK", label: "Tidak buang air kecil selama >12 jam" },
                  { id: "muntahTerus", label: "Muntah terus menerus hingga tidak bisa makan/minum" },
                  { id: "muntahDarah", label: "Muntah berdarah" },
                  { id: "babHitam", label: "Buang air besar / feses berwarna hitam" },
                  { id: "mimisan", label: "Mimisan yang tidak berhenti" },
                  { id: "penurunanKesadaran", label: "Penurunan kesadaran, mengigau, atau sangat sulit dibangunkan" }
                ].map(item => (
                  <label key={item.id} className="flex items-start gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-red-600 focus:ring-red-500"
                      checked={!!redFlags[item.id]}
                      onChange={(e) => setRedFlags({...redFlags, [item.id]: e.target.checked})}
                    />
                    <span className="text-[0.875rem] sm:text-[1rem] text-gray-700 group-hover:text-gray-900">{item.label}</span>
                  </label>
                ))}
             </div>
          </section>

          {/* TAHAP 2 - SYMPTOM SCORING */}
          <section>
            <h2 className="text-[1.125rem] sm:text-[1.25rem] font-bold text-primary-800 mb-[1rem] sm:mb-[1.5rem] flex items-center gap-[0.5rem]">
               <span className="w-[1.75rem] h-[1.75rem] sm:w-[2rem] sm:h-[2rem] rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-[0.875rem]">2</span>
               Tahap 2: Penilaian Gejala (Symptom Scoring)
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[2rem] sm:gap-x-[3rem] gap-y-[1.5rem] sm:gap-y-[2.5rem] pl-[0.25rem] sm:pl-[1.5rem] md:pl-[2.5rem]">
                
               {/* Mual Muntah */}
               <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Mual / Muntah</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                   value={mualMuntah} 
                   onChange={(e) => setMualMuntah(Number(e.target.value))}
                 >
                   <option value={0}>Tidak ada (Skor 0)</option>
                   <option value={1}>Mual ringan (Skor 1)</option>
                   <option value={2}>Mual berat (Skor 2)</option>
                   <option value={3}>Muntah 1-3x sehari (Skor 3)</option>
                   <option value={5}>Muntah 4-6x sehari (Skor 5)</option>
                   <option value={7}>Muntah &gt;6x sehari (Skor 7)</option>
                 </select>
               </div>

               {/* Diare */}
               <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Diare</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                   value={diare} 
                   onChange={(e) => setDiare(Number(e.target.value))}
                 >
                   <option value={0}>Tidak ada diare (Skor 0)</option>
                   <option value={2}>1-3x lebih banyak dari biasanya (Skor 2)</option>
                   <option value={4}>4-6x lebih banyak dari biasanya (Skor 4)</option>
                   <option value={7}>Lebih dari 6x sehari (Skor 7)</option>
                 </select>
               </div>

               {/* Nyeri */}
               <div className="space-y-[0.75rem] sm:space-y-[1rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Nyeri Badan</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem] mb-1"
                   value={nyeriSkala} 
                   onChange={(e) => setNyeriSkala(Number(e.target.value))}
                 >
                   <option value={0}>Skala 0 / Tidak ada nyeri (Skor 0)</option>
                   <option value={1}>Skala 1-3 / Nyeri ringan (Skor 1)</option>
                   <option value={3}>Skala 4-6 / Nyeri sedang (Skor 3)</option>
                   <option value={6}>Skala 7-10 / Nyeri hebat (Skor 6)</option>
                 </select>
                 <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={nyeriTidur}
                      onChange={(e) => setNyeriTidur(e.target.checked)}
                    />
                    <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700">Nyeri mengganggu tidur Anda (+2)</span>
                 </label>
                 <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={nyeriAktivitas}
                      onChange={(e) => setNyeriAktivitas(e.target.checked)}
                    />
                    <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700">Nyeri mengganggu aktivitas harian (+2)</span>
                 </label>
               </div>

               {/* Mukositis / Sariawan */}
               <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Sariawan / Luka Mulut</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                   value={mukositis} 
                   onChange={(e) => setMukositis(Number(e.target.value))}
                 >
                   <option value={0}>Tidak ada (Skor 0)</option>
                   <option value={1}>Kemerahan ringan di mulut (Skor 1)</option>
                   <option value={3}>Luka sariawan ringan (Skor 3)</option>
                   <option value={5}>Luka menyulitkan makan (Skor 5)</option>
                   <option value={7}>Tidak bisa makan/minum karena luka (Skor 7)</option>
                 </select>
               </div>

                {/* Dehidrasi */}
                <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900 mb-1">Tanda-tanda Dehidrasi</label>
                 <div className="space-y-[0.5rem]">
                  <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                      <input type="checkbox" className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={!!dehidrasi["haus"]} onChange={(e) => setDehidrasi({...dehidrasi, "haus": e.target.checked})} />
                      <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700 group-hover:text-gray-900">Terus menerus merasa haus (+1)</span>
                  </label>
                  <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                      <input type="checkbox" className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={!!dehidrasi["mulutKering"]} onChange={(e) => setDehidrasi({...dehidrasi, "mulutKering": e.target.checked})} />
                      <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700 group-hover:text-gray-900">Mulut dan bibir terasa sangat kering (+1)</span>
                  </label>
                  <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                      <input type="checkbox" className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={!!dehidrasi["bakBerkurang"]} onChange={(e) => setDehidrasi({...dehidrasi, "bakBerkurang": e.target.checked})} />
                      <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700 group-hover:text-gray-900">Buang air kecil berkurang drastis (+3)</span>
                  </label>
                  <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                      <input type="checkbox" className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={!!dehidrasi["pusingBerdri"]} onChange={(e) => setDehidrasi({...dehidrasi, "pusingBerdri": e.target.checked})} />
                      <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700 group-hover:text-gray-900">Pusing saat berubah posisi berdiri (+3)</span>
                  </label>
                 </div>
               </div>

                {/* Sesak Napas */}
                <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Sesak Napas</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                   value={sesak} 
                   onChange={(e) => setSesak(Number(e.target.value))}
                 >
                   <option value={0}>Tidak ada sesak (Skor 0)</option>
                   <option value={2}>Sesak saat aktivitas berat (Skor 2)</option>
                   <option value={5}>Sesak saat aktivitas ringan (Skor 5)</option>
                   <option value={999}>Sesak saat beristirahat (RED FLAG)</option>
                 </select>
               </div>

               {/* Pucat / Anemia */}
               <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900 mb-1">Pucat / Indikasi Anemia</label>
                 <div className="space-y-[0.5rem]">
                  <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                      <input type="checkbox" className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={!!pucat["pucat"]} onChange={(e) => setPucat({...pucat, "pucat": e.target.checked})} />
                      <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700 group-hover:text-gray-900">Kulit terlihat lebih pucat (+1)</span>
                  </label>
                  <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                      <input type="checkbox" className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={!!pucat["lelah"]} onChange={(e) => setPucat({...pucat, "lelah": e.target.checked})} />
                      <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700 group-hover:text-gray-900">Badan sangat mudah lelah (+2)</span>
                  </label>
                  <label className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] cursor-pointer group">
                      <input type="checkbox" className="w-[1rem] h-[1rem] sm:w-[1.25rem] sm:h-[1.25rem] rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={!!pucat["berdebar"]} onChange={(e) => setPucat({...pucat, "berdebar": e.target.checked})} />
                      <span className="text-[0.75rem] sm:text-[0.875rem] text-gray-700 group-hover:text-gray-900">Jantung berdebar saat aktivitas ringan (+4)</span>
                  </label>
                 </div>
               </div>

               {/* Leukopenia */}
               <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Leukopenia (Sel Darah Putih Rendah)</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                   value={leukopenia} 
                   onChange={(e) => setLeukopenia(Number(e.target.value))}
                 >
                   <option value={0}>Kadar normal atau Tidak Tahu (Skor 0)</option>
                   <option value={3}>Leukosit rendah namun tanpa gejala (Skor 3)</option>
                   <option value={4}>Leukosit rendah dan sedang sariawan (Skor 4)</option>
                   <option value={4}>Leukosit rendah dan sedang diare (Skor 4)</option>
                   <option value={999}>Leukosit rendah disertai DEMAM (RED FLAG)</option>
                 </select>
               </div>

             </div>
          </section>

          {/* TAHAP 3 - MODIFIER */}
          <section>
            <h2 className="text-[1.125rem] sm:text-[1.25rem] font-bold text-primary-800 mb-[1rem] sm:mb-[1.5rem] flex items-center gap-[0.5rem]">
               <span className="w-[1.75rem] h-[1.75rem] sm:w-[2rem] sm:h-[2rem] rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-[0.875rem]">3</span>
               Tahap 3: Kondisi Pasien (Modifiers)
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[2rem] sm:gap-x-[3rem] gap-y-[1.5rem] sm:gap-y-[2.5rem] pl-[0.25rem] sm:pl-[1.5rem] md:pl-[2.5rem]">
                {/* Usia */}
                <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Usia Anda saat ini</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                   value={usia} 
                   onChange={(e) => setUsia(Number(e.target.value))}
                 >
                   <option value={0}>Dibawah 65 Tahun (Skor 0)</option>
                   <option value={2}>65 Tahun ke atas (Skor 2)</option>
                 </select>
               </div>

               {/* Hari Kemo */}
               <div className="space-y-[0.5rem] sm:space-y-[0.75rem]">
                 <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Jarak Hari dari Sesi Kemo Terakhir</label>
                 <select 
                   className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                   value={hariKemo} 
                   onChange={(e) => setHariKemo(Number(e.target.value))}
                 >
                   <option value={0}>1 - 3 hari (Skor 0)</option>
                   <option value={1}>4 - 7 hari (Skor 1)</option>
                   <option value={2}>8 - 14 hari (Skor 2)</option>
                   <option value={1}>Lebih dari 14 hari (Skor 1)</option>
                 </select>
               </div>

                 {/* ECOG */}
                 <div className="space-y-[0.5rem] sm:space-y-[0.75rem] md:col-span-2">
                  <label className="block text-[0.875rem] sm:text-[1rem] font-semibold text-gray-900">Kondisi Fisik Umum (ECOG)</label>
                  <select 
                    className="w-full md:w-1/2 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-[0.5rem] sm:py-[0.75rem] text-[0.875rem] sm:text-[1rem]"
                    value={ecog} 
                    onChange={(e) => setEcog(Number(e.target.value))}
                  >
                    <option value={0}>Aktivitas normal seperti biasa (Skor 0)</option>
                    <option value={2}>Lebih banyak menghabiskan waktu duduk / berbaring (Skor 2)</option>
                    <option value={5}>Membutuhkan bantuan untuk aktivitas sehari-hari (Skor 5)</option>
                  </select>
                </div>
             </div>
          </section>

          {/* TAHAP 4 - INTERPRETASI (Automated Result) */}
          <section className="pt-[1.5rem] mt-[2rem] border-t border-gray-200">
            <h2 className="text-[1.25rem] sm:text-[1.5rem] font-bold text-gray-900 mb-[1.5rem] text-center">
               Hasil Simpulan Kondisi Anda
             </h2>
             
             <div className="flex flex-col items-center">
               <div className={`p-[1rem] sm:p-[2rem] rounded-2xl border-2 transition-colors ${result.color} text-center shadow-sm w-full max-w-3xl`}>
                  {!result.isEmergency ? (
                     <div className="mb-[1rem]">
                       <span className="text-[0.75rem] sm:text-[0.875rem] font-medium opacity-80 uppercase tracking-widest">Skor Risiko Anda</span>
                       <div className="text-[3rem] sm:text-[4rem] font-display font-bold my-[0.5rem]">{result.score}</div>
                     </div>
                  ) : (
                     <div className="mb-[1rem]">
                        <div className="mb-[0.5rem] text-red-600 font-bold tracking-widest uppercase items-center gap-[0.5rem] flex justify-center text-[0.875rem] sm:text-[1.125rem]">
                           ⚠️ Tanda Bahaya Terdeteksi
                        </div>
                        <div className="text-[1.5rem] sm:text-[2rem] font-display font-bold my-[0.25rem] text-red-900">Skor: {result.score}</div>
                     </div>
                  )}
                  <h3 className="text-[1.125rem] sm:text-[1.5rem] font-bold mb-[0.75rem] uppercase">{result.risk}</h3>
                  <p className="text-[0.875rem] sm:text-[1rem] font-medium opacity-90 leading-relaxed bg-white/40 p-[0.75rem] sm:p-[1rem] rounded-lg">
                    {result.action}
                  </p>
               </div>

               <button
                 type="button"
                 onClick={downloadPDF}
                 className="mt-[1.5rem] bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow px-[2rem] py-[0.8rem] font-semibold transition-colors duration-200 cursor-pointer text-base text-center"
               >
                 Unduh Laporan Hasil (PDF)
               </button>
             </div>
          </section>

        </form>
      </div>
    </div>
  );
}