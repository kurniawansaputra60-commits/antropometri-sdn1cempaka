import React, { useState } from 'react';
import { 
  Apple, 
  Sparkles, 
  BookOpen, 
  Share2, 
  Printer, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  Utensils, 
  Sun, 
  Moon, 
  Heart,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Student } from '../types';

interface PojokGiziProps {
  students: Student[];
  selectedClass: string;
}

interface Article {
  id: string;
  category: 'stunting' | 'overweight' | 'optimal' | 'general';
  title: string;
  subtitle: string;
  recommendedFor: string;
  badgeColor: string;
  readingTime: string;
  keyPoints: string[];
  dietaryPlan: {
    meal: string;
    food: string;
    nutrients: string;
  }[];
  actionPlanTeacher: string;
  actionPlanParent: string;
}

export function PojokGizi({ students, selectedClass }: PojokGiziProps) {
  // Analyze class nutritional profile
  let totalInClass = students.length;
  let stuntedCount = 0;
  let thinCount = 0;
  let overweightCount = 0;
  let normalCount = 0;

  students.forEach(s => {
    if (s.measurements.length > 0) {
      const last = s.measurements[s.measurements.length - 1];
      if (last.stuntingStatus === 'Pendek' || last.stuntingStatus === 'Sangat Pendek') {
        stuntedCount++;
      } else if (last.stuntingStatus === 'Normal') {
        normalCount++;
      }

      if (last.nutritionStatus === 'Gizi Buruk' || last.nutritionStatus === 'Gizi Kurang') {
        thinCount++;
      } else if (last.nutritionStatus === 'Obesitas' || last.nutritionStatus === 'Berisiko Gizi Lebih') {
        overweightCount++;
      }
    }
  });

  const stuntingRate = totalInClass > 0 ? (stuntedCount / totalInClass) * 100 : 0;
  const overweightRate = totalInClass > 0 ? (overweightCount / totalInClass) * 100 : 0;
  const thinRate = totalInClass > 0 ? (thinCount / totalInClass) * 100 : 0;

  // Determine automatic focus priority
  let primaryFocus: 'stunting' | 'overweight' | 'thin' | 'optimal' = 'optimal';
  if (stuntingRate >= 20 || stuntedCount >= 2) {
    primaryFocus = 'stunting';
  } else if (overweightRate >= 20) {
    primaryFocus = 'overweight';
  } else if (thinRate >= 20) {
    primaryFocus = 'thin';
  } else {
    primaryFocus = 'optimal';
  }

  const articles: Article[] = [
    {
      id: 'art-stunting-protein',
      category: 'stunting',
      title: 'Pemberian Protein Hewani & Kalsium untuk Pacu Kecepatan Tumbuh Tulang Anak',
      subtitle: 'Pedoman percepatan laju pertumbuhan linier (Catch-up Growth) pada anak usia sekolah dasar',
      recommendedFor: 'Kelas dengan indikasi tinggi badan kurang / Stunted',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      readingTime: '4 menit baca',
      keyPoints: [
        'Asam amino esensial lengkap dari protein hewani menstimulasi hormon pertumbuhan (IGF-1 / Insulin-like Growth Factor 1).',
        'Konsumsi minimal 2 butir telur ayam per hari atau ikan lokal (kembung/lele) terbukti klinis mempercepat pertambahan tinggi badan anak.',
        'Kalsium dan Vitamin D3 esensial dalam proses osifikasi lempeng epifisis tulang panjang.'
      ],
      dietaryPlan: [
        { meal: 'Sarapan (06.30)', food: 'Nasi + Telur dadar bayam + Susu murni 200ml', nutrients: 'Protein hewani 14g, Kalsium 300mg' },
        { meal: 'Snack Sekolah (09.30)', food: 'Pisang barangan + Kacang rebus / Edamame', nutrients: 'Kalium, Serat, Energi bertahap' },
        { meal: 'Makan Siang (12.30)', food: 'Nasi + Ikan kembung goreng + Sup wortel & tahu', nutrients: 'Omega-3 DHA, Protein 20g' },
        { meal: 'Makan Malam (18.30)', food: 'Nasi + Semur ayam kampung + Tempe bacem + Jeruk', nutrients: 'Zat besi, Vitamin C untuk penyerapan besi' }
      ],
      actionPlanTeacher: 'Pantau bekal sarapan siswa sebelum jam belajar dimulai. Berikan apresiasi siswa yang membawa bekal lauk hewani lengkap.',
      actionPlanParent: 'Prioritaskan alokasi belanja rumah tangga pada telur, ikan, dan susu murni dibandingkan camilan berpemanis buatan.'
    },
    {
      id: 'art-sleep-hgh',
      category: 'stunting',
      title: 'Pola Tidur Malam & Efek Lonjakan Human Growth Hormone (HGH)',
      subtitle: 'Korelasi kedalaman tidur gelombang lambat (Slow-Wave Sleep) dengan pertumbuhan tinggi badan',
      recommendedFor: 'Anak dalam fase percepatan pertumbuhan (Growth Spurt)',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      readingTime: '3 menit baca',
      keyPoints: [
        'Hampir 75% sekresi Human Growth Hormone (HGH) terjadi saat tidur nyenyak di fase gelombang lambat (antara pukul 21.30 s/d 01.00).',
        'Paparan layar gadget (blue light) sebelum tidur menekan hormon melatonin dan menunda sekresi hormon pertumbuhan.',
        'Durasi tidur ideal anak usia sekolah dasar adalah 9 hingga 10 jam per malam secara teratur.'
      ],
      dietaryPlan: [
        { meal: 'Minum Malam (20.30)', food: 'Segelas susu hangat tanpa gula tambahan', nutrients: 'Triptofan alami memicu tidur lelap' },
        { meal: 'Aturan Makan Malam', food: 'Selesai makan malam minimal 2 jam sebelum waktu tidur', nutrients: 'Mencegah GERD & gangguan tidur' }
      ],
      actionPlanTeacher: 'Edukasi siswa di kelas tentang pentingnya tidur maksimal pukul 21.00 dan hindari memberi PR berlebihan yang menyita waktu istirahat.',
      actionPlanParent: 'Batasi penggunaan smartphone anak setelah pukul 19.30 dan ciptakan suasana kamar tidur yang gelap serta tenang.'
    },
    {
      id: 'art-overweight-control',
      category: 'overweight',
      title: 'Kendalikan Minuman Manis & Ultra-Processed Food (UPF) di Lingkungan Sekolah',
      subtitle: 'Strategi pencegahan obesitas dini dan pemeliharaan komposisi massa otot anak',
      recommendedFor: 'Kelas dengan persentase gizi lebih & obesitas meningkat',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      readingTime: '4 menit baca',
      keyPoints: [
        'Konsumsi sirup, teh kemasan, dan boba manis menyumbang kalori kosong tanpa zat mikronutrien penting.',
        'Tingkatkan aktivitas fisik minimal 60 menit per hari melalui permainan aktif di luar ruangan (lompat tali, futsal, bersepeda).',
        'Ganti camilan gorengan tinggi lemak trans dengan potongan buah segar (pepaya, semangka, apel).'
      ],
      dietaryPlan: [
        { meal: 'Minuman Harian', food: 'Air putih dingin/suhu ruang minimal 1.5 - 2 Liter/hari', nutrients: 'Bebas kalori, memaksimalkan metabolisme' },
        { meal: 'Bekal Sehat', food: 'Roti gandum isi telur rebus + tomat + potongan buah melon', nutrients: 'Indeks glikemik rendah & rasa kenyang lama' }
      ],
      actionPlanTeacher: 'Dorong siswa aktif bergerak saat jam istirahat dan koordinasikan dengan kantin sekolah untuk membatasi jajanan tinggi natrium & sirup manis.',
      actionPlanParent: 'Hindari menyimpan stok minuman kemasan manis dan makanan ringan instan di dalam kulkas rumah.'
    },
    {
      id: 'art-optimal-nutrition',
      category: 'optimal',
      title: 'Pedoman "Isi Piringku" & Pemeliharaan Kebugaran Belajar Siswa Berprestasi',
      subtitle: 'Mempertahankan status gizi prima untuk ketahanan konsentrasi dan imunitas belajar di sekolah',
      recommendedFor: 'Kelas dengan mayoritas status pertumbuhan normal',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      readingTime: '3 menit baca',
      keyPoints: [
        'Komposisi piring makan ideal: 1/3 karbohidrat kompleks, 1/3 sayuran hijau, 1/6 lauk pauk protein, dan 1/6 buah-buahan segar.',
        'Sarapan bergizi seimbang meningkatkan daya konsentrasi, memori jangka pendek, dan kestabilan mood saat menerima pelajaran.',
        'Terapkan 5 Langkah Cuci Tangan Pakai Sabun (CTPS) sebelum makan untuk mencegah infeksi cacingan dan diare.'
      ],
      dietaryPlan: [
        { meal: 'Sarapan Utama', food: 'Nasi uduk rempah + Orek tempe + Telur dadar + Lalap timun', nutrients: 'Energi seimbang, vitamin B kompleks' },
        { meal: 'Makan Siang', food: 'Nasi merah/putih + Sayur bayam jagung + Pepes ikan nila + Pisang', nutrients: 'Antioksidan, folat, magnesium' }
      ],
      actionPlanTeacher: 'Lakukan kampanye gerakan "Rabu Sehat: Sarapan Bersama di Kelas" seminggu sekali untuk membiasakan konsumsi bekal bergizi seimbang.',
      actionPlanParent: 'Variasikan menu sayur dan lauk agar anak tidak jenuh dan memiliki ketertarikan mencoba aneka ragam sumber pangan lokal.'
    }
  ];

  const [selectedArticle, setSelectedArticle] = useState<Article>(
    articles.find(a => a.category === primaryFocus) || articles[0]
  );

  const getWhatsAppShareUrl = (article: Article) => {
    const text = `*EDUKASI KESEHATAN UKS SDN 1 CEMPAKA - POJOK GIZI*\n\n` +
      `📌 *${article.title}*\n` +
      `_${article.subtitle}_\n\n` +
      `💡 *Poin Utama:*\n` +
      article.keyPoints.map(p => `• ${p}`).join('\n') + `\n\n` +
      `👨‍👩‍👧 *Pesan untuk Orang Tua:*\n${article.actionPlanParent}\n\n` +
      `_Diterbitkan oleh Tim UKS & Puskesmas Cempaka untuk Orang Tua Siswa Kelas ${selectedClass === 'ALL' ? '1-6' : selectedClass}_`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      {/* Module Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full mb-2 border border-emerald-200">
            <Apple className="w-3.5 h-3.5" />
            Pojok Gizi Pintar UKS SDN 1 Cempaka
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            Artikel Edukasi Kesehatan Otomatis Berbasis Profil Gizi Kelas
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Menganalisis status rata-rata siswa di <strong>{selectedClass === 'ALL' ? 'Semua Kelas' : `Kelas ${selectedClass}`}</strong> dan merekomendasikan intervensi nutrisi yang paling dibutuhkan secara presisi.
          </p>
        </div>

        {/* Diagnosis Badge */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 shrink-0">
          <div className={`w-3 h-3 rounded-full ${
            primaryFocus === 'stunting' ? 'bg-rose-500 animate-ping' :
            primaryFocus === 'overweight' ? 'bg-amber-500' : 'bg-emerald-500'
          }`}></div>
          <div className="text-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Fokus Prioritas {selectedClass === 'ALL' ? 'Sekolah' : `Kelas ${selectedClass}`}:</span>
            <span className="font-bold text-slate-800">
              {primaryFocus === 'stunting' && `Intervensi Stunting (${stuntingRate.toFixed(1)}% terindikasi)`}
              {primaryFocus === 'overweight' && `Kontrol Gizi Lebih (${overweightRate.toFixed(1)}%)`}
              {primaryFocus === 'thin' && `Perbaikan Asupan Gizi Kurang`}
              {primaryFocus === 'optimal' && `Pertahankan Gizi Normal Optimal (${normalCount} siswa)`}
            </span>
          </div>
        </div>
      </div>

      {/* Article Selector & Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Article List (4 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wide px-1 flex items-center justify-between">
            <span>Daftar Artikel Relevan</span>
            <span className="text-[11px] text-emerald-600 font-normal">Auto-curated</span>
          </div>

          {articles.map(article => {
            const isSelected = selectedArticle.id === article.id;
            const isRecommended = article.category === primaryFocus;

            return (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${article.badgeColor}`}>
                    {article.category === 'stunting' ? 'Percepatan Tinggi Badan' :
                     article.category === 'overweight' ? 'Kontrol Berat Badan' : 'Gizi Seimbang'}
                  </span>
                  {isRecommended && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Sesuai Profil Kelas
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {article.title}
                </h4>

                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {article.subtitle}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>{article.readingTime}</span>
                  <span className="flex items-center text-emerald-600 font-semibold gap-0.5">
                    Buka Artikel <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Full Article Reader & Plan (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50/60 rounded-xl p-5 border border-slate-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${selectedArticle.badgeColor}`}>
                  Edukasi Resmi UKS
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {selectedArticle.readingTime}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {selectedArticle.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {selectedArticle.subtitle}
              </p>
            </div>

            {/* Share to WhatsApp Link Button */}
            <a
              href={getWhatsAppShareUrl(selectedArticle)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              title="Kirim ringkasan artikel ini ke grup WhatsApp Wali Murid"
            >
              <Share2 className="w-3.5 h-3.5" />
              Kirim ke WA Orang Tua
            </a>
          </div>

          {/* Key Medical Takeaways */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Poin Penting Klinis (Kemenkes &amp; WHO):
            </h4>
            <div className="space-y-1.5">
              {selectedArticle.keyPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Meal Plan Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-amber-600" />
              Rekomendasi Menu Makanan Harian Ramah Anak:
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-semibold text-slate-600 text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Waktu Makan</th>
                    <th className="py-2 px-3">Pilihan Menu Makanan</th>
                    <th className="py-2 px-3">Fungsi Nutrisi Utama</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {selectedArticle.dietaryPlan.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-800">{d.meal}</td>
                      <td className="py-2 px-3 text-slate-700">{d.food}</td>
                      <td className="py-2 px-3 text-emerald-700 font-medium">{d.nutrients}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Collaborative Action Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
              <strong className="text-blue-900 block font-bold flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-blue-600" />
                Peran Guru &amp; Sekolah di UKS:
              </strong>
              <p className="text-blue-950 leading-relaxed text-[11px]">
                {selectedArticle.actionPlanTeacher}
              </p>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <strong className="text-emerald-900 block font-bold flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-emerald-600" />
                Peran Orang Tua di Rumah:
              </strong>
              <p className="text-emerald-950 leading-relaxed text-[11px]">
                {selectedArticle.actionPlanParent}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
