// src/i18n/id.ts
import type { en } from "./en.ts";

export const id: Record<keyof typeof en, string> = {
  "app.name": "FOODOO",
  "nav.currentStep": "Langkah hari ini yang sedang berjalan",
  "today.menus.title": "Menu hari ini",
  "today.menus.available": "Masih ada",
  "today.menus.left": "Sisa {qty}",
  "today.share.action": "Bagikan daftar",
  "today.share.copied": "Daftar masak disalin",
  "today.share.failed": "Daftar tidak bisa dibagikan. Coba lagi.",
  "week.leftoverCost": "Uang hilang karena sisa",
  "week.missedEarnings": "Untung yang lolos karena habis",
  "week.moneyNote":
    "Dihitung dengan harga jual dan modal saat ini. Sisa dihitung sebesar modal dikurangi nilai sisa; untung yang lolos adalah harga jual dikurangi modal.",
  "plan.cost": "Modal masak {amount}",
  "plan.revenue": "Jika habis terjual {amount}",
  "close.progress": "{ready} dari {total} menu siap",
  "service.progress": "{soldOut} dari {total} menu habis",
  "settings.jump": "Bagian pengaturan",
  "app.skip": "Langsung ke isi",
  "app.loading": "Memuat…",
  "app.offlineReady": "Siap dipakai tanpa internet.",
  "app.valueLine":
    "Perencanaan porsi harian yang ikut menghitung pembeli yang tidak kebagian saat menu habis.",

  "nav.main": "Navigasi utama",
  "nav.today": "Hari ini",
  "nav.plan": "Rencana",
  "nav.service": "Penjualan",
  "nav.close": "Tutup",
  "nav.settings": "Pengaturan",
  "nav.tutorial": "Tutorial",

  "header.demo": "Data demo",
  "header.demoSwitch": "Ganti demo",
  "header.demoTime": "Jam demo",
  "header.offline": "Offline. Tersimpan di perangkat ini.",

  "common.save": "Simpan",
  "common.cancel": "Batal",
  "common.back": "Kembali",
  "common.next": "Lanjut",
  "common.edit": "Ubah",
  "common.archive": "Arsipkan",
  "common.restore": "Pulihkan",
  "common.closeDialog": "Tutup dialog",
  "common.yes": "Ya",
  "common.no": "Belum",
  "common.saveFailed": "Gagal menyimpan. Silakan coba lagi.",

  "lang.label": "Bahasa",
  "lang.en": "English",
  "lang.id": "Bahasa Indonesia",

  "start.title": "Mulai pakai FOODOO",
  "start.lead": "Semua tersimpan di perangkat ini. Tanpa akun.",
  "welcome.start": "Mulai pengaturan",
  "welcome.continue": "Lanjutkan pengaturan",
  "demo.pick.title": "Pilih warung demo",
  "demo.pick.intro":
    "Pilih warung untuk langsung membuka demo dan tutorialnya. Setiap warung memakai data latihan.",
  "demo.pick.hours": "Buka {open}–{close}",
  "demo.pick.history": "Riwayat {days} hari",
  "demo.s1.desc":
    "Warung pagi dengan dua jam ramai. Nasi Uduk hampir selalu habis, jadi terlihat cara FOODOO menghitung pembeli yang terlewat.",
  "demo.s2.desc":
    "Warung makan siang kantor dengan satu jam ramai. Ramai di hari kerja dan sepi di akhir pekan, jadi tiap hari punya saran sendiri.",
  "demo.s3.desc":
    "Angkringan yang buka sampai lewat tengah malam. Penjualan setelah 00:00 tetap dihitung untuk malam warung itu buka.",
  "demo.s4.desc":
    "Warung yang baru buka empat hari. Riwayat belum cukup, jadi saran dimulai dari porsi biasa lalu disesuaikan.",
  "tour.s1.exercise": "Telusuri menu yang habis",
  "tour.s2.exercise": "Bandingkan permintaan antarhari",
  "tour.s3.exercise": "Ikuti penjualan lewat tengah malam",
  "tour.s4.exercise": "Susun rencana minggu pertama",
  "tour.s1.closeTask":
    "Hitung sisa tiap menu yang masih tersedia. Tutup hari lalu simpan agar sisa porsi bisa dibandingkan dengan perkiraan penjualan yang terlewat.",
  "tour.s2.closeTask":
    "Isi sisa makan siang. Jika hari libur atau kejadian khusus memengaruhi penjualan, tandai hari ini sebagai hari tidak biasa sebelum menutup dan menyimpan.",
  "tour.s3.closeTask":
    "Hitung sisa setelah penjualan lewat tengah malam. Tutup hari lalu simpan. Hasilnya masuk ke tanggal saat warung mulai buka.",
  "tour.s4.closeTask":
    "Hitung sisa tiap menu, termasuk {menu}. Tutup hari lalu simpan agar rencana berikutnya memiliki satu hari tambahan sebagai acuan.",
  "demo.launch.practice": "Warung untuk latihan",
  "tour.s1.task":
    "Bandingkan {menu} dengan {menu2}. Cari menu yang sering habis sebelum warung tutup.",
  "tour.s2.task":
    "Baca alasan saran untuk {menu}. Bandingkan saran hari ini dengan porsi biasanya sebelum jam makan siang.",
  "tour.s3.task":
    "Periksa tanggal buka dan rencana untuk {menu}. Satu giliran jualan berlangsung dari pukul {open} hingga {close} keesokan harinya.",
  "tour.s4.task":
    "Lihat porsi biasa untuk {menu}. Coba tombol + atau − untuk menentukan jumlah awal sambil mengumpulkan riwayat penjualan.",
  "demo.launch.stall": "Pilih warung Anda",
  "demo.launch.moment": "Latihan mandiri per tahap",
  "demo.launch.note":
    "Setiap tahap menggunakan waktu simulasi yang tertera di sebelah label Data demo.",
  "demo.launch.realClock": "Gunakan waktu perangkat",
  "demo.moment.plan.title": "Rencana pagi",
  "demo.moment.plan.desc": "Periksa saran porsi lalu simpan rencana masak.",
  "demo.moment.service.title": "Jam jualan",
  "demo.moment.service.desc": "Pilih menu untuk mencatat waktu habisnya.",
  "demo.moment.close.title": "Waktu tutup",
  "demo.moment.close.desc": "Masukkan jumlah porsi tersisa lalu tutup hari.",
  "demo.moment.summary.title": "Ringkasan minggu",
  "demo.moment.summary.desc":
    "Pilih tanggal untuk melihat penjualan dan sisa porsi.",
  "demo.refreshed": "Tanggal demo disesuaikan ke hari ini",
  "welcome.demo": "Coba warung demo",
  "welcome.demoNote":
    "Pilih salah satu dari empat warung demo berdata buatan untuk melihat-lihat dulu.",
  "welcome.demoBlocked":
    "Anda sudah mulai mengatur warung sendiri. Hapus datanya di Pengaturan untuk mencoba demo.",

  "setup.step": "Langkah {step} dari {total}",
  "setup.menus.title": "Menu Anda",
  "setup.menus.intro":
    "Tambahkan setiap masakan yang Anda masak pagi hari. Bisa diubah nanti di Pengaturan.",
  "setup.menus.needOne": "Tambahkan minimal satu menu untuk lanjut.",
  "setup.hours.title": "Jam buka",
  "setup.hours.intro": "Jam berapa buka dan tutup, dan jam mana yang ramai?",
  "setup.done": "Pengaturan selesai. Anda siap merencanakan.",
  "setup.hours.finish": "Selesai",

  "menu.list.empty": "Belum ada menu. Tambahkan menu pertama Anda.",
  "menu.list.add": "Tambah menu",
  "menu.list.archived": "Menu diarsipkan ({count})",
  "menu.list.summary": "{price} · modal {cost} · biasanya {qty} porsi",
  "menu.list.editLabel": "Ubah {name}",
  "menu.list.archiveLabel": "Arsipkan {name}",
  "menu.list.restoreLabel": "Pulihkan {name}",
  "menu.editor.addTitle": "Tambah menu",
  "menu.editor.editTitle": "Ubah menu",
  "menu.field.name": "Nama menu",
  "menu.field.price": "Harga jual (Rp)",
  "menu.field.cost": "Modal per porsi (Rp)",
  "menu.field.salvage": "Nilai porsi sisa (Rp)",
  "menu.field.salvageHint":
    "Nilai porsi yang tidak terjual bagi Anda, misalnya untuk makan pegawai. Biasanya 0.",
  "menu.field.usualQty": "Porsi biasa per hari",
  "menu.error.nameLength": "Isi nama 1 sampai 40 karakter",
  "menu.error.priceInvalid": "Isi harga dalam rupiah bulat, lebih dari 0",
  "menu.error.costInvalid": "Isi modal dalam rupiah bulat, 0 atau lebih",
  "menu.error.costNotBelowPrice": "Modal harus lebih rendah dari harga",
  "menu.error.salvageInvalid": "Isi nilai dalam rupiah bulat, 0 atau lebih",
  "menu.error.salvageNotBelowPrice":
    "Nilai porsi sisa harus lebih rendah dari harga",
  "menu.error.usualInvalid": "Isi angka bulat dari 1 sampai 999",
  "menu.saved": "Menu tersimpan",
  "menu.archivedToast": "Menu diarsipkan",
  "menu.restoredToast": "Menu dipulihkan",

  "hours.open": "Jam buka",
  "hours.close": "Jam tutup",
  "hours.error.timeInvalid": "Isi jam dengan format JJ:MM",
  "hours.error.closeSameAsOpen": "Jam tutup harus berbeda dari jam buka",
  "hours.overnight":
    "Anda tutup lewat tengah malam. Penjualan setelah tengah malam dihitung untuk hari Anda buka.",
  "hours.busyTitle": "Jam ramai",
  "hours.busyHint":
    "Ketuk satu jam untuk mengubahnya: sepi, biasa, ramai. Jam ramai berarti lebih banyak pembeli datang.",
  "hours.busyEmpty": "Isi jam buka yang benar untuk melihat jam ramai.",
  "hours.level.1": "Sepi",
  "hours.level.2": "Biasa",
  "hours.level.4": "Ramai",
  "hours.saved": "Jam buka tersimpan",

  "today.title": "Hari ini",
  "today.loopTitle": "Siklus hari ini",
  "today.phase.plan": "Rencana",
  "today.phase.service": "Jualan",
  "today.phase.close": "Tutup",
  "today.status.done": "Selesai",
  "today.status.current": "Sekarang",
  "today.status.next": "Berikutnya",
  "today.action.plan": "Rencanakan porsi hari ini",
  "today.action.service": "Buka layar jualan",
  "today.action.close": "Tutup hari ini",
  "today.action.done": "Sampai jumpa besok",
  "today.doneNote":
    "Hari ini sudah ditutup. Kembali besok pagi untuk merencanakan.",
  "today.counts.title": "Ringkasan hari ini",
  "today.counts.portions": "Porsi direncanakan",
  "today.counts.soldOut": "Menu habis",
  "today.counts.closed": "Hari ditutup",
  "today.empty.setupTitle": "Selesaikan pengaturan",
  "today.empty.setupBody":
    "Tambahkan menu dan jam buka untuk mendapatkan saran harian.",
  "today.empty.setupAction": "Lanjutkan pengaturan",
  "today.empty.menusTitle": "Tidak ada menu aktif",
  "today.empty.menusBody":
    "Semua menu diarsipkan. Tambahkan atau pulihkan menu di Pengaturan.",
  "today.empty.menusAction": "Buka Pengaturan",
  "today.incompleteTitle": "Hari yang belum ditutup",
  "today.incompleteBody":
    "Hari-hari ini belum ditutup, jadi belum dipakai untuk saran. Tutup agar ikut dihitung:",
  "today.incompleteAction": "Tutup {date}",
  "week.title": "7 hari terakhir",
  "week.empty":
    "Belum ada hari yang ditutup dalam 7 hari terakhir. Tutup satu hari untuk melihat angkanya.",
  "week.leftover": "Porsi sisa",
  "week.sellOuts": "Kejadian habis",
  "week.lostSales": "Penjualan hilang (porsi)",
  "week.accepted": "Rencana diterima tanpa diubah",
  "week.percent": "{value}%",
  "nav.history": "Riwayat",
  "today.historyLink": "Lihat riwayat",
  "history.title": "Riwayat",
  "history.menus.title": "Per menu, 7 hari terakhir",
  "history.col.menu": "Menu",
  "history.col.date": "Tanggal",
  "history.col.cooked": "Dimasak",
  "history.col.sold": "Terjual",
  "history.col.leftover": "Sisa",
  "history.col.demand": "Permintaan",
  "history.chart.title": "Dimasak vs permintaan",
  "history.chart.menu": "Menu",
  "history.chart.caption":
    "Porsi dimasak dan permintaan per hari untuk {menu}, 7 hari terakhir",
  "history.chart.cooked": "Dimasak",
  "history.chart.demand": "Permintaan",
  "history.chart.estimate": "Permintaan (estimasi, hari habis)",
  "history.days.title": "Hari-hari sebelumnya",
  "history.days.empty": "Belum ada hari yang tercatat.",
  "history.days.meta": "{portions} porsi · {soldOut} habis",
  "history.days.more": "Tampilkan lebih banyak hari",
  "history.status.open": "Belum ditutup",
  "history.status.closed": "Ditutup",
  "history.status.unusual": "Hari tidak biasa",
  "estimate.tag": "perkiraan",
  "history.menus.note":
    "Total hari yang ditutup dan bukan hari tidak biasa. Permintaan pada hari habis adalah perkiraan.",
  "day.title": "Detail hari",
  "day.noSuggestion": "Tidak ada saran tersimpan",
  "day.back": "Kembali ke riwayat",
  "day.empty": "Tidak ada yang tercatat pada hari ini.",
  "day.closeAction": "Tutup hari ini",
  "day.suggested": "Saran {qty}",
  "day.soldOutAt": "Habis {time}",
  "day.notSoldOut": "Tidak habis",
  "transfer.export.title": "Ekspor data",
  "transfer.format": "Format file",
  "transfer.format.json": "JSON",
  "transfer.format.csv": "CSV",
  "transfer.format.xlsx": "XLSX",
  "transfer.hint.json":
    "Cadangan lengkap warung, menu, semua hari, dan penjualan kasir. Pakai untuk pindah ke HP baru.",
  "transfer.hint.csv":
    "Catatan harian per menu, satu baris per menu per hari. Bisa dibuka di aplikasi spreadsheet apa pun.",
  "transfer.hint.xlsx":
    "Cadangan lengkap untuk Excel atau Google Sheets, dalam lima sheet: Stall, Menus, Days, MenuDays, Sales.",
  "transfer.export.action": "Ekspor file",
  "transfer.exported": "File tersimpan",
  "transfer.exportFailed": "Gagal mengekspor. Coba lagi.",
  "transfer.import.title": "Impor file",
  "transfer.import.hint":
    "JSON atau XLSX memulihkan cadangan lengkap dan mengganti data di perangkat ini. CSV menambah atau memperbarui catatan harian untuk menu yang sudah ada.",
  "transfer.import.action": "Pilih file untuk diimpor",
  "transfer.import.file": "File untuk diimpor",
  "transfer.imported": "Data berhasil diimpor",
  "transfer.issues.title":
    "Tidak ada yang diimpor. Perbaiki masalah berikut di file, lalu coba lagi:",
  "transfer.issue.unreadable": "File tidak bisa dibaca ({where}).",
  "transfer.issue.wrongFormat": "Ini bukan file FOODOO.",
  "transfer.issue.unknownVersion":
    "File ini berasal dari versi FOODOO yang lebih baru atau tidak dikenal.",
  "transfer.issue.missingSheet": "Sheet {where} tidak ada.",
  "transfer.issue.missingColumn": "Kolom {where} tidak ada.",
  "transfer.issue.badValue": "Nilai di {where} tidak valid.",
  "transfer.issue.unknownMenu": "Menu di {where} tidak ada di perangkat ini.",
  "transfer.issue.duplicate": "{where} muncul dua kali.",
  "transfer.issue.noStall": "Atur warung dulu, lalu impor file CSV.",
  "transfer.issue.empty": "File tidak berisi data ({where}).",
  "transfer.confirm.title": "Impor file ini?",
  "transfer.confirm.replace":
    "Ini mengganti semua data di perangkat ini dengan isi file: {menus} menu dan {days} hari.",
  "transfer.confirm.merge":
    "Ini menambah atau memperbarui catatan {days} hari untuk menu Anda. Data lain tetap.",
  "transfer.confirm.action": "Impor",
  "transfer.manage.title": "Kelola data",

  "plan.title": "Rencana",
  "plan.intro":
    "Saran porsi untuk hari ini. Ubah angka mana saja, lalu simpan.",
  "plan.suggested": "Saran {qty}",
  "plan.edited": "Diubah",
  "plan.portionsLabel": "Porsi {name}",
  "plan.decrease": "Kurangi satu {name}",
  "plan.increase": "Tambah satu {name}",
  "plan.total": "Total {qty} porsi",
  "plan.acceptAll": "Terima semua",
  "plan.save": "Simpan rencana",
  "plan.saved": "Rencana tersimpan",
  "plan.savedNote":
    "Rencana tersimpan. Anda masih bisa mengubahnya sampai ada menu yang habis.",
  "plan.locked":
    "Rencana dikunci karena ada menu yang habis hari ini. Batalkan tanda habis untuk mengubahnya.",
  "plan.closedNote": "Hari ini sudah ditutup. Ini rencananya.",
  "plan.cooked": "Dimasak {qty}",

  "service.title": "Jualan",
  "service.intro": "Ketuk menu saat menu itu habis.",
  "service.cooked": "Dimasak {qty}",
  "service.tapHint": "Ketuk saat habis",
  "service.soldOutAt": "Habis {time}",
  "service.holdHint":
    "Tahan kotak menu atau tekan Ubah jam untuk mengganti jamnya.",
  "service.earlyTitle": "{name} sudah habis?",
  "service.earlyBody":
    "Sekarang pukul {time} dan Anda buka pukul {open}. Habis secepat ini membuat FOODOO memperkirakan permintaan sangat tinggi. Tandai hanya jika benar-benar habis.",
  "service.earlyConfirm": "Ya, sudah habis",
  "service.editTime": "Ubah jam",
  "service.editTimeLabel": "Ubah jam habis {name}",
  "service.soldOutToast": "{name} habis pukul {time}",
  "service.undo": "Batalkan",
  "service.undone": "Tanda habis dibatalkan",
  "service.timeSaved": "Jam habis tersimpan",
  "service.cleared": "Ditandai belum habis",
  "service.notPlannedTitle": "Buat rencana dulu",
  "service.notPlannedBody":
    "Layar jualan dimulai setelah porsi hari ini disimpan.",
  "service.planAction": "Rencanakan porsi hari ini",
  "service.closedNote":
    "Hari ini sudah ditutup. Tanda habis tidak bisa diubah lagi.",

  "soldOut.sheetTitle": "Jam habis: {name}",
  "soldOut.timeLabel": "Jam menu habis",
  "soldOut.clear": "Belum habis",
  "soldOut.error.timeInvalid": "Masukkan jam dengan format JJ:MM",
  "soldOut.error.outsideHours": "Masukkan jam antara {open} dan {close}",

  "close.title": "Tutup",
  "close.intro": "Hitung sisa setiap menu.",
  "close.leftoverPlaceholder": "?",
  "close.leftoverMissing": "Isi sisa porsi, atau 0 jika tidak ada sisa",
  "close.leftoverMissingSummary":
    "Isi sisa porsi untuk {count} menu sebelum menutup hari.",
  "close.pastIntro": "Anda menutup hari yang sudah lewat: {date}.",
  "close.pastSheetTitle": "Tutup {date}?",
  "close.pastClosed": "{date} ditutup",
  "close.soldOutChip": "Habis {time}",
  "close.leftoverLabel": "Sisa porsi {name}",
  "close.cookedOf": "Dimasak {qty}",
  "close.missedQuestion": "Kira-kira jam berapa {name} habis?",
  "close.missedHint":
    "Tidak ada sisa, tetapi tanda habis tidak diketuk. Jika tidak yakin, biarkan jam tutup.",
  "close.unusual": "Hari tidak biasa",
  "close.unusualHint":
    "Hujan, hari libur, atau ada acara. Hari ini tetap disimpan tetapi tidak dipakai untuk saran.",
  "close.closeDay": "Tutup hari",
  "close.sheetTitle": "Tutup hari ini?",
  "close.todayHeading": "Berapa yang ingin membeli tiap menu hari ini",
  "close.tomorrowNone":
    "Tidak ada menu aktif. Tambah atau pulihkan menu di Pengaturan.",
  "close.tomorrowHeading": "Saran untuk besok, {date}",
  "close.wanted": "Peminat",
  "close.suggestedPortions": "porsi disarankan",
  "close.confirm": "Simpan semua",
  "close.closed": "Hari ditutup",
  "close.closedTitle": "Hari ini sudah ditutup",
  "close.unusualNote":
    "Ditandai sebagai hari tidak biasa: tetap disimpan, tetapi tidak dipakai untuk saran.",
  "close.tomorrowNote":
    "Besok pagi layar Rencana dimulai dari angka-angka ini.",
  "close.notPlannedTitle": "Belum ada yang bisa ditutup",
  "close.notPlannedBody": "Rencanakan porsi hari ini dulu.",

  "estimate.value": "≈ {qty} (perkiraan)",
  "estimate.none": "Tidak tercatat",

  "settings.title": "Pengaturan",
  "settings.stall.title": "Warung",
  "settings.stall.name": "Nama warung (opsional)",
  "settings.stall.nameError": "Paling banyak 40 karakter",
  "settings.stall.nameSaved": "Nama warung tersimpan",
  "settings.menus.title": "Menu",
  "settings.hours.title": "Jam buka dan jam ramai",
  "settings.hours.save": "Simpan jam",
  "settings.language.title": "Bahasa",
  "settings.data.title": "Data",
  "settings.data.onDevice":
    "Semua data hanya disimpan di perangkat ini. Tidak ada yang keluar kecuali Anda bagikan atau ekspor.",
  "settings.data.loadDemo": "Muat warung demo",
  "settings.data.resetDemo": "Atur ulang data demo",
  "settings.data.switchDemo": "Pilih warung demo lain",
  "settings.data.loadDemoBlocked":
    "Hapus data Anda sendiri dulu untuk memuat warung demo.",
  "settings.data.demoLoaded": "Warung demo dimuat",
  "settings.data.removeDemo": "Hapus warung demo",
  "settings.data.deleteAll": "Hapus semua data",
  "settings.delete.title": "Hapus semua data?",
  "settings.delete.body":
    "Ini menghapus semua menu, rencana, dan catatan dari perangkat ini. Tidak bisa dibatalkan.",
  "settings.delete.confirm": "Hapus semuanya",
  "settings.removeDemo.title": "Hapus warung demo?",
  "settings.removeDemo.body":
    "Ini menghapus semua data demo. Setelah itu Anda bisa mengatur warung sendiri.",
  "settings.removeDemo.confirm": "Hapus demo",
  "settings.about.title": "Tentang",
  "settings.about.version": "Versi {version}",
  "settings.about.body":
    "FOODOO menyarankan porsi dengan aturan tetap yang bisa dijelaskan. Tidak memakai model AI. Lisensi pustaka dan huruf tercantum di README proyek.",
  "settings.about.link": "Buka README proyek",

  "register.title": "Kasir",
  "register.intro": "Ketuk menu untuk menambah satu porsi ke keranjang.",
  "register.left": "Sisa {qty}",
  "register.over": "Lebih {qty} dari rencana",
  "register.stockLabel": "Stok {name}: sisa {left} dari {total}",
  "register.soldOutButton": "Habis",
  "register.soldOutLabel": "Tandai {name} habis",
  "register.cartButton": "Keranjang: {count} item, {total}",
  "register.cartTitle": "Keranjang",
  "register.emptyCart": "Keranjang kosong.",
  "register.clear": "Kosongkan keranjang",
  "register.total": "Total",
  "register.method": "Pembayaran (hanya label)",
  "register.cash": "Tunai",
  "register.qris": "QRIS",
  "register.methodNote":
    "FOODOO hanya mencatat caranya. Aplikasi ini tidak memproses pembayaran.",
  "register.tendered": "Uang diterima",
  "register.exact": "Uang pas",
  "register.change": "Kembalian: {amount}",
  "register.short": "Kurang {amount}",
  "register.save": "Simpan penjualan",
  "register.saved": "Penjualan tersimpan: {total}",
  "register.autoSoldOut": "{name} habis pukul {time}",
  "register.saveFailed": "Penjualan tidak tersimpan. Tidak ada yang dicatat.",
  "register.todayTitle": "Penjualan hari ini",
  "register.revenue": "Pendapatan",
  "register.count": "Transaksi",
  "register.noSales": "Belum ada penjualan hari ini.",
  "register.line": "{qty} × {name}",
  "register.methodCash": "Tunai",
  "register.methodQris": "QRIS",
  "register.void": "Batalkan penjualan terakhir",
  "register.voidTitle": "Batalkan penjualan terakhir?",
  "register.voidBody":
    "Penjualan pukul {time} ({total}) dihapus. Tanda habis dari kasir ikut dihapus jika stok kembali.",
  "register.voidConfirm": "Batalkan penjualan",
  "register.voided": "Penjualan dibatalkan",
  "register.voidedReopened": "Penjualan dibatalkan. {name} tersedia lagi.",
  "register.dayChanged": "Hari berganti. Keranjang dikosongkan.",

  "settings.mode.title": "Mode penjualan",
  "settings.mode.simple": "Sederhana",
  "settings.mode.simpleHint":
    "Ketuk Habis saat menu habis. Penjualan tidak dicatat.",
  "settings.mode.pos": "Kasir",
  "settings.mode.posHint":
    "Catat tiap penjualan. Sisa porsi dan jam habis terisi sendiri.",
  "settings.mode.keep":
    "Boleh berganti kapan saja. Penjualan yang sudah dicatat tidak hilang saat berganti.",
  "settings.mode.saved": "Mode tersimpan",

  "close.posNote":
    "Kasir mencatat sisa {remaining}. Anda mengisi {entered} (selisih {gap}).",
  "close.posOver": "Kasir mencatat {qty} porsi melebihi rencana.",
  "close.unknownTime": "Tidak ingat",
  "close.unknownTimeNote": "Dihitung habis pada jam tutup.",
  "close.knownTime": "Isi jam",
  "close.someLeft": "Masih ada sisa",
  "close.cancelledNote": "Tanda habis dihapus. Isi sisa porsinya.",
  "close.didSellOut": "Memang habis",
  "close.revenue": "Pendapatan: {amount}",
  "close.correct": "Koreksi hari ini",
  "close.correctNote": "Hari ini bisa dikoreksi sampai {date}.",
  "close.corrected": "Hari dikoreksi",

  "reason.history.soldOutWeekday":
    "Habis pada {soldOut} dari {observations} hari {weekdayPlural} terakhir → {delta}",
  "reason.history.soldOutRecent":
    "Habis pada {soldOut} dari {observations} hari terakhir → {delta}",
  "reason.history.leftover":
    "Ada sisa pada {leftover} dari {observations} hari terakhir → {delta}",
  "reason.history.base": "Berdasarkan {observations} hari terakhir",
  "reason.coldStart":
    "Riwayat belum cukup. Mulai dari porsi biasa Anda, {usualQty}",
  "reason.coldStartUp":
    "Riwayat belum cukup. Mulai dari porsi biasa Anda, {usualQty}, terakhir kali habis → {delta}",
  "reason.coldStartDown":
    "Riwayat belum cukup. Mulai dari porsi biasa Anda, {usualQty}, terakhir kali ada sisa → {delta}",

  "weekday.plural.0": "Minggu",
  "weekday.plural.1": "Senin",
  "weekday.plural.2": "Selasa",
  "weekday.plural.3": "Rabu",
  "weekday.plural.4": "Kamis",
  "weekday.plural.5": "Jumat",
  "weekday.plural.6": "Sabtu",
  "how.title": "Cara FOODOO menghitung",
  "how.intro":
    "FOODOO memakai beberapa aturan tetap. Halaman ini menunjukkannya pada sebuah contoh, dihitung dengan kode yang sama yang dipakai aplikasi untuk warung Anda.",
  "how.exampleNote":
    "Warung contoh. Angka-angka ini hanya contoh, bukan data Anda.",
  "how.demandTitle": "3. Berapa orang yang ingin membeli menu yang habis",
  "how.demandSetup":
    "Contoh: Nasi Uduk. {cooked} porsi dimasak, dan porsi terakhir terjual pukul {time}.",
  "how.barBefore": "(sebelum {time})",
  "how.barsCaption":
    "Jam ramai warung contoh. Batang yang terisi adalah jam sebelum {time}.",
  "how.demandShare":
    "Dari jam ramai, sekitar {percent}% pembeli pada hari biasa sudah datang sebelum pukul {time}.",
  "how.demandResult":
    "Jadi {cooked} porsi hanya cukup untuk sekitar {percent}% pembeli hari itu. Sepanjang hari, kira-kira sebanyak ini orang yang ingin membeli:",
  "how.ruleCounted":
    "Jika menu tidak habis, tidak ada tebakan: peminat = dimasak − sisa.",
  "how.ruleLate":
    "Jika habis pada atau sangat dekat dengan jam tutup, peminat = dimasak.",
  "how.ruleCap":
    "Perkiraan tidak pernah lebih dari 3 kali jumlah yang dimasak ({cap} di sini).",
  "how.ruleBusy":
    "Jam ramai dihitung 4 kali, jam biasa 2 kali, dan jam sepi 1 kali. Anda mengaturnya di Pengaturan.",
  "how.suggestTitle": "4. Cara porsi besok disarankan",
  "how.suggestMoney":
    "Setiap porsi tambahan yang terjual memberi untung {gain}. Setiap porsi yang tersisa merugikan {loss}, yaitu biaya memasaknya.",
  "how.suggestCover":
    "Di sini sisa merugikan lebih banyak daripada untung sebuah penjualan, jadi FOODOO tidak memasak untuk hari paling ramai. FOODOO memilih jumlah yang cukup pada sekitar {cover} dari setiap 100 hari sebelumnya.",
  "how.suggestHistory":
    "Pada {count} hari {weekdays} terakhir, peminatnya: {values}.",
  "how.ruleEligible":
    "Hanya hari biasa yang sudah ditutup yang dihitung. Hari tidak biasa dan hari yang belum ditutup tidak dipakai.",
  "how.ruleWeekday":
    "FOODOO melihat hari yang sama lebih dulu (paling banyak 8 terakhir). Jika kurang dari 5, dipakai 14 hari terakhir.",
  "how.ruleColdStart":
    "Jika riwayat kurang dari 5 hari, FOODOO mulai dari porsi biasa Anda: 10% lebih banyak setelah habis, 10% lebih sedikit jika lebih dari seperlima tersisa.",
  "how.ruleYouDecide":
    "Saran hanyalah titik awal. Anda bisa mengubah setiap angka sebelum memasak.",
  "how.notTitle": "Yang tidak dilakukan FOODOO",
  "how.notAi":
    "Tidak memakai model AI. Setiap angka berasal dari aturan tetap di halaman ini.",
  "how.notCloud":
    "Tidak mengirim apa pun sendiri. Data Anda tetap di perangkat ini kecuali Anda bagikan atau ekspor.",
  "how.back": "Kembali ke aplikasi",
  "how.nav.label": "Langkah di halaman ini",
  "how.nav.inputs": "Yang Anda isi",
  "how.nav.sources": "Asal angka",
  "how.nav.demand": "Peminat tersembunyi",
  "how.nav.suggest": "Porsi yang disarankan",
  "how.nav.result": "Yang Anda lihat",
  "how.nav.accuracy": "Ketepatan",
  "how.inputsTitle": "1. Yang Anda sampaikan ke FOODOO",
  "how.inputsLead":
    "FOODOO tidak punya database makanan dan tidak punya angka gizi. FOODOO berangkat dari apa yang Anda isi tentang warung Anda sendiri.",
  "how.input.menusTitle": "Menu",
  "how.input.menusBody":
    "Nama, harga jual, biaya masak, dan porsi biasa. Diisi sekali, bisa diubah kapan saja.",
  "how.input.hoursTitle": "Jam ramai",
  "how.input.hoursBody":
    "Tandai setiap jam buka sebagai sepi, biasa, atau ramai.",
  "how.input.nightTitle": "Setiap hari",
  "how.input.nightBody":
    "Ketuk Habis saat berjualan, atau catat penjualan di mode Kasir. Malam hari, isi sisa porsi.",
  "how.input.unusualTitle": "Hari tidak biasa",
  "how.input.unusualBody":
    "Tandai hari hujan atau hari libur sebagai tidak biasa agar tidak memengaruhi saran berikutnya.",
  "how.sourcesTitle": "2. Dari mana setiap angka berasal",
  "how.sourcesLead":
    "Tidak ada yang datang dari luar ponsel Anda. Setiap angka diketik oleh Anda atau dihitung dengan aturan tetap.",
  "how.sources.col.number": "Angka",
  "how.sources.col.from": "Berasal dari",
  "how.sources.col.kind": "Jenis",
  "how.kind.entered": "Anda isi",
  "how.kind.calculated": "Dihitung",
  "how.source.cooked": "Porsi dimasak",
  "how.source.cookedFrom": "Rencana pagi: disarankan dulu, lalu Anda ubah.",
  "how.source.soldOut": "Jam habis",
  "how.source.soldOutFrom":
    "Ketukan Anda di Jualan, atau penjualan terakhir di mode Kasir.",
  "how.source.leftover": "Sisa porsi",
  "how.source.leftoverFrom": "Anda, saat menutup hari.",
  "how.source.demand": "Orang yang ingin membeli menu",
  "how.source.demandFrom":
    "Dimasak dikurangi sisa. Jika menu habis, perkiraan dari jam ramai.",
  "how.source.suggestion": "Porsi yang disarankan",
  "how.source.suggestionFrom":
    "Peminat hari-hari lalu, dengan harga dan biaya Anda.",
  "how.source.money": "Angka uang",
  "how.source.moneyFrom": "Harga dan biaya Anda seperti hari ini.",
  "how.demandTry": "Geser jam habis dan lihat perkiraannya berubah.",
  "how.demandSlider": "Habis pukul",
  "how.ruleNow.scaled":
    "Aturan yang dipakai: jam ramai menaikkan {cooked} porsi terjual menjadi satu hari penuh.",
  "how.ruleNow.late":
    "Aturan yang dipakai: habis saat jam tutup, jadi peminat = dimasak ({cooked}).",
  "how.ruleNow.capped":
    "Aturan yang dipakai: batas atas. Hampir belum ada pembeli yang datang, jadi perkiraan berhenti di {cap}.",
  "how.suggestTry": "Ubah biaya memasak satu porsi dan lihat saran bergeser.",
  "how.costSlider": "Biaya masak satu porsi",
  "how.suggestPrice": "Harga jual pada contoh: {price}.",
  "how.resultTitle": "5. Yang Anda lihat di aplikasi",
  "how.resultBody":
    "Di layar Rencana, setiap kartu menu menampilkan porsi yang disarankan dengan alasan satu baris, seperti pada langkah 4.",
  "how.resultMore":
    "Alasan itu menyebut berapa hari lalu yang dipakai, berapa di antaranya habis atau bersisa, dan bagaimana angkanya dibanding terakhir kali.",
  "how.resultLoop":
    "Setelah Anda memasak dan menutup hari, angka sebenarnya kembali ke langkah 3 dan saran besok dihitung ulang.",
  "how.accuracyTitle": "6. Seberapa tepat ini?",
  "how.accuracyLead":
    "FOODOO tidak menyebut persentase ketepatan. FOODOO belum diuji pada warung sungguhan. Aturannya hanya dicoba pada warung simulasi, dan hasilnya menggambarkan simulasi, bukan warung Anda.",
  "how.affectTitle": "Yang membuatnya kurang tepat",
  "how.affect1": "Riwayat kurang dari 5 hari: saran hanyalah titik awal.",
  "how.affect2":
    "Jam habis yang terlewat atau ditebak: peminat menjadi perkiraan.",
  "how.affect3": "Hari tidak biasa yang tidak ditandai.",
  "how.affect4": "Jam ramai yang tidak cocok dengan hari nyata Anda.",
  "how.affect5":
    "Harga atau biaya yang berubah: angka uang memakai nilai hari ini, juga untuk hari lalu.",
  "how.improveTitle": "Yang bisa Anda lakukan",
  "how.improve1": "Isi sisa porsi setiap malam.",
  "how.improve2": "Konfirmasi jam habis jika Anda bisa.",
  "how.improve3": "Tandai hari tidak biasa.",
  "how.improve4": "Atur jam ramai di Pengaturan.",
  "check.title": "Saran dibandingkan dengan kenyataan",
  "check.lead":
    "Untuk setiap hari biasa yang sudah ditutup dan sarannya dibuat dari riwayat, FOODOO membandingkan saran dengan jumlah orang yang ingin membeli menu itu. Hanya 28 hari terakhir yang dipakai.",
  "check.empty":
    "Belum cukup hari: {count} dari {min} hari diperiksa. Pemeriksaan muncul setelah {min} hari dengan saran dari riwayat sudah ditutup.",
  "check.days": "Hari diperiksa",
  "check.error": "Rata-rata selisih",
  "check.errorValue": "{value} porsi",
  "check.covered": "Saran sudah cukup",
  "check.coveredValue": "{value}% hari",
  "check.target":
    "Sasaran: {value}% hari. Harga dan biaya Anda menentukan sasaran ini, karena FOODOO tidak berusaha mencukupi setiap hari.",
  "check.overUnder":
    "Di atas jumlah peminat pada {over} hari, di bawahnya pada {under} hari.",
  "check.estimateNote":
    "Pada hari menu habis, jumlah peminat itu sendiri adalah perkiraan.",
  "check.scopeNote":
    "Ini memeriksa catatan Anda sendiri. Ini bukan janji untuk besok.",
  "close.howLink": "Bagaimana ini dihitung?",
  "settings.about.how": "Cara FOODOO menghitung",
  "settings.data.storageKept":
    "Terlindungi: browser tidak akan menghapus data ini untuk mengosongkan ruang.",
  "settings.data.storageAtRisk":
    "Belum terlindungi: browser bisa menghapus data ini jika ruang penyimpanan ponsel hampir penuh.",
  "settings.data.storageUnknown":
    "Browser ini tidak memberi tahu apakah data dilindungi.",
  "settings.data.keep": "Simpan data saya",
  "settings.data.keepGranted": "Browser akan menyimpan data Anda",
  "settings.data.keepRefused":
    "Browser menolak untuk saat ini. Menambahkan FOODOO ke layar utama biasanya membantu.",
  "landing.pillOffline": "Jalan tanpa internet",
  "landing.pillNoAccount": "Tanpa akun",
  "landing.pillLocal": "Data tetap di HP Anda",
  "landing.problemTitle": "Setiap pagi selalu menebak",
  "landing.problemWasteTitle": "Kebanyakan",
  "landing.problemWasteBody":
    "Porsi yang tidak laku terbuang, begitu juga uang untuk memasaknya.",
  "landing.problemEarlyTitle": "Kekurangan",
  "landing.problemEarlyBody":
    "Menu habis sebelum siang dan pembeli yang datang belakangan pulang.",
  "landing.problemHiddenTitle": "Habis menyembunyikan permintaan",
  "landing.problemHiddenBody":
    "Penjualan berhenti saat panci kosong, jadi catatan Anda tidak pernah menunjukkan berapa orang yang sebenarnya ingin membeli.",
  "landing.loopTitle": "Rutinitas harian hanya beberapa menit",
  "landing.loopPlanTitle": "Rencana pagi",
  "landing.loopPlanBody":
    "Lihat saran porsi tiap masakan, lalu ubah angka mana pun sesuka Anda.",
  "landing.loopServiceTitle": "Tandai jam habis",
  "landing.loopServiceBody": "Ketuk saat menu habis. FOODOO mencatat jamnya.",
  "landing.loopCloseTitle": "Tutup hari",
  "landing.loopCloseBody":
    "Isi sisa masakan. FOODOO memperkirakan berapa orang yang ingin tiap menu.",
  "landing.loopNextTitle": "Besok lebih tepat",
  "landing.loopNextBody":
    "Saran besok belajar dari hari ini, termasuk pembeli yang tidak kebagian.",
  "landing.exampleBadge": "Contoh",
  "landing.whyTitle": "Kenapa FOODOO berbeda",
  "landing.whyHiddenTitle": "Menghitung pembeli yang terlewat",
  "landing.whyHiddenBody":
    "Memakai jam habis dan jam ramai Anda untuk memperkirakan permintaan yang tersembunyi saat menu habis.",
  "landing.whyRulesTitle": "Aturan yang bisa dicek",
  "landing.whyRulesBody":
    "Tanpa model AI. Setiap angka berasal dari aturan tetap yang bisa Anda baca di aplikasi.",
  "landing.whyOfflineTitle": "Dibuat untuk warung",
  "landing.whyOfflineBody":
    "Bisa dipasang seperti aplikasi dan jalan tanpa sinyal, di HP biasa.",
  "landing.whyPrivateTitle": "Privasi sejak awal",
  "landing.whyPrivateBody":
    "Tanpa login, tanpa server, tanpa data pelanggan. Ekspor atau hapus semua kapan saja.",
  "landing.closingTitle": "Siap mencoba?",
  "landing.closingBody": "Atur menu Anda sendiri di ponsel ini. Tanpa akun.",
  "landing.installHint":
    "Tips: pakai “Tambahkan ke layar utama” di browser untuk membuka FOODOO seperti aplikasi.",
  "settings.about.landing": "Tentang FOODOO",
  "landing.headline": "Masak pas.",
  "landing.headlineAccent": "Tidak kebanyakan, tidak kehabisan.",
  "landing.exampleTitle": "Yang akan Anda lihat",
  "landing.exampleCooked": "Dimasak",
  "landing.exampleSoldOut": "Habis jam",
  "landing.pageTitle": "Rencana porsi harian",
  "landing.eyebrow": "Untuk warung dan usaha makanan kecil",
  "landing.nav.label": "Bagian halaman",
  "landing.nav.menu": "Menu",
  "landing.nav.problem": "Masalah",
  "landing.nav.loop": "Cara kerja",
  "landing.nav.ecosystem": "Ekosistem",
  "landing.nav.trust": "Kepercayaan",
  "landing.eco.title": "Satu putaran, lima bagian yang saling terhubung",
  "landing.eco.lead":
    "FOODOO untuk pemilik warung dan usaha makanan kecil yang menentukan porsi dengan perasaan. Tidak ada bagian yang berdiri sendiri: apa yang Anda catat di satu bagian menjadi masukan bagian berikutnya.",
  "landing.eco.passes": "Diteruskan:",
  "landing.eco.setupTitle": "Pengaturan",
  "landing.eco.setupBody": "Menu, harga, biaya, dan jam ramai, diisi sekali.",
  "landing.eco.setupOut":
    "angka yang menjadi dasar setiap saran dan perkiraan.",
  "landing.eco.planTitle": "Rencana",
  "landing.eco.planBody": "Menyarankan porsi tiap menu, lengkap dengan alasan.",
  "landing.eco.planOut": "porsi yang Anda masak, setelah Anda ubah.",
  "landing.eco.serviceTitle": "Jualan dan Kasir",
  "landing.eco.serviceBody":
    "Satu ketukan saat menu habis, atau catat penjualan di mode Kasir.",
  "landing.eco.serviceOut": "jam ketika pembeli tidak bisa lagi dilayani.",
  "landing.eco.closeTitle": "Tutup",
  "landing.eco.closeBody": "Sisa porsi, dan jam habis jika terlewat.",
  "landing.eco.closeOut":
    "berapa orang yang ingin membeli tiap menu, terhitung atau diperkirakan.",
  "landing.eco.historyTitle": "Riwayat",
  "landing.eco.historyBody":
    "Hari-hari lalu, ringkasan mingguan, dan pemeriksaan saran terhadap kenyataan.",
  "landing.eco.historyOut":
    "hari biasa yang sudah ditutup dan membentuk rencana besok.",
  "landing.eco.loop":
    "Lalu putaran dimulai lagi dengan rencana pagi yang lebih terinformasi.",
  "landing.trust.title": "Yang diklaim FOODOO, dan yang tidak",
  "landing.trust.lead":
    "Pemilik warung butuh angka yang bisa diperiksa. Inilah batasnya.",
  "landing.trust.estimateTitle": "Perkiraan diberi label",
  "landing.trust.estimateBody":
    "Saat menu habis, jumlah orang yang ingin membelinya adalah tebakan dari jam ramai Anda. Selalu ada kata perkiraan.",
  "landing.trust.simulatedTitle": "Hanya diuji pada warung simulasi",
  "landing.trust.simulatedBody":
    "Backtest dan warung demo memakai data buatan. FOODOO belum diuji pada pemilik warung sungguhan, jadi tidak menyebut persentase ketepatan.",
  "landing.trust.yoursTitle": "Saran adalah titik awal",
  "landing.trust.yoursBody":
    "Anda mengubah setiap angka sebelum memasak. FOODOO tidak menjanjikan untung lebih besar atau sisa lebih sedikit untuk warung Anda.",
  "landing.trust.rulesTitle": "Tanpa model tersembunyi",
  "landing.trust.rulesBody":
    "Tanpa model AI dan tanpa server. Aturan tetapnya dijelaskan langkah demi langkah di halaman di bawah ini.",
  "landing.nav.team": "Tim",
  "landing.nav.openApp": "Buka aplikasi",
  "landing.cta.launch": "Jalankan Aplikasi Demo",
  "landing.cta.continue": "Lanjut ke aplikasi",
  "landing.cta.setup": "Atur warung saya sendiri",
  "landing.cta.note":
    "Pilih warung untuk memulai tutorialnya. Data latihan tersimpan di perangkat ini.",
  "landing.try.eyebrow": "Coba sekarang",
  "landing.try.title": "Jelajahi demo interaktif",
  "landing.try.lead":
    "Coba alur kerja empat warung, dari merencanakan porsi hingga mencatat sisa saat tutup.",
  "landing.try.openTitle": "Empat warung untuk dipilih",
  "landing.try.openBody":
    "Pilih warung pagi, warung makan siang, angkringan malam, atau warung yang baru buka.",
  "landing.try.tourTitle": "Panduan sesuai jenis warung",
  "landing.try.tourBody":
    "Ikuti kegiatan warung dalam tujuh langkah, atau coba latihan khusus untuk warung pilihan Anda.",
  "landing.try.freeTitle": "Coba sendiri",
  "landing.try.freeBody":
    "Ubah angka, tandai menu habis, tutup hari, atau pindah ke warung demo lain.",
  "landing.problemLead":
    "Masak kebanyakan, uang terbuang. Masak kekurangan, pembeli pergi, dan catatan tidak pernah menunjukkan berapa orang.",
  "landing.loopLead":
    "Empat momen singkat sehari, masing-masing hanya beberapa ketukan.",
  "landing.seeEyebrow": "Dari panci ke rencana",
  "landing.seeLead":
    "Satu menu yang habis, diikuti dari jam jualan sampai pagi berikutnya. Angkanya contoh, dihitung dengan aturan aplikasi ini sendiri.",
  "landing.preview.service": "Satu ketukan saat panci kosong.",
  "landing.preview.close":
    "Malam hari FOODOO memperkirakan berapa orang yang menginginkannya.",
  "landing.preview.next":
    "Saran berikutnya belajar dari perkiraan ini, bukan hanya {cooked} porsi yang terjual.",
  "landing.whyEyebrow": "Yang membedakan",
  "landing.explorer.title": "Habis jam berapa?",
  "landing.explorer.cooked": "{cooked} porsi dimasak",
  "landing.explorer.legendSold": "Pembeli sebelum habis",
  "landing.explorer.legendMissed": "Pembeli sesudahnya: tidak tercatat",
  "landing.explorer.arrived": "Pembeli yang sudah datang",
  "landing.explorer.hint":
    "Geser penggesernya. Aturannya sama dengan aplikasi, pada warung contoh.",
  "landing.teamTitle": "Tim di balik FOODOO",
  "landing.teamBody":
    "Calon Mantu Idaman, membangun untuk STACK 2026 oleh GDGoC ITB, Kasus 2: Stronger Communities and Everyday Services.",
  "landing.team.domain": "Perkiraan permintaan, saran porsi, dan backtest",
  "landing.team.data": "Data di perangkat, ekspor dan impor",
  "landing.team.screens": "Layar dan komponen",
  "landing.team.platform":
    "Aplikasi offline, bahasa, aksesibilitas, pengujian, dan deployment",
  "landing.footerNote": "Data yang Anda isi tetap di perangkat Anda.",
  "landing.footerLinks": "Tentang FOODOO lebih lanjut",
  "today.hint.plan": "Periksa tiap angka saran, ubah sesuka Anda, lalu simpan.",
  "today.hint.service": "Saat menu habis, ketuk agar jamnya tercatat.",
  "today.hint.close":
    "Hitung sisanya supaya saran berikutnya belajar dari hari ini.",
  "tour.label": "Tutorial",
  "tour.back": "Kembali",
  "tour.close": "Tutup tutorial",
  "tour.skipAll": "Lewati tutorial",
  "tour.tryIt": "Tekan bagian yang disorot untuk lanjut.",
  "tour.card.title": "Telusuri satu hari penuh",
  "tour.card.body":
    "Tujuh langkah singkat satu hari penuh: rencana, jual, tutup, dan tinjau.",
  "tour.caseLabel": "Yang terjadi di warung ini",
  "tour.progress": "Langkah {step} dari {total}",
  "tour.next": "Lanjut",
  "tour.finish": "Selesai",
  "tour.goThere": "Antar saya ke sana",
  "tour.replay": "Ulangi tutorial",
  "tour.start": "Mulai tutorial",
  "tour.notNow": "Nanti saja",
  "tour.register": "Coba register",
  "tour.sim": "Coba simulasi",
  "tour.intro.title": "Satu hari dalam 7 langkah",
  "tour.intro.body":
    "Rencana, jualan, tutup, lalu lihat hasilnya. Demo diulang dari pagi, dan datanya buatan. Tiap langkah juga menjelaskan apa yang terjadi di warung ini.",
  "tour.suggestion.title": "Saran beserta alasannya",
  "tour.suggestion.body":
    "Tiap kartu menunjukkan jumlah porsi yang dimasak dan alasannya. Ubah angka dengan + dan −.",
  "tour.accept.title": "Simpan rencana",
  "tour.accept.body": "Tekan Terima semua untuk menyimpan porsi hari ini.",
  "tour.toService.title": "Buka penjualan",
  "tour.toService.body": "Tekan Penjualan di menu.",
  "tour.soldOut.title": "Ada menu habis",
  "tour.soldOut.body":
    "Ketuk menu untuk mencatat jam habisnya. Bisa dibatalkan dalam 10 detik.",
  "tour.toClose.title": "Tutup hari",
  "tour.toClose.body": "Tekan Tutup di menu.",
  "tour.close.title": "Hitung sisanya",
  "tour.close.body": "Isi sisa tiap menu, tekan Tutup hari, lalu Simpan semua.",
  "tour.toHistory.title": "Lihat hasilnya",
  "tour.toHistory.body":
    "Tekan Riwayat untuk melihat sisa, menu habis, dan perkiraan penjualan hilang.",
  "tour.outro.title": "Itulah putaran harian",
  "tour.outro.body":
    "Saran besok sudah belajar dari hari ini. Dua hal ini juga bisa dicoba.",
  "sim.title": "Simulasi per jam",
  "sim.cardBody":
    "Lihat pelanggan simulasi datang jam demi jam dan analisisnya berubah.",
  "sim.open": "Buka simulasi",
  "sim.note":
    "Pilih Jam berikutnya untuk melihat perubahan penjualan, atau Putar untuk menjalankan simulasi otomatis. Pilih Selesaikan hari untuk memperbarui saran porsi besok. Data simulasi terpisah dari catatan warung.",
  "sim.emptyTitle": "Simulasi butuh warung demo",
  "sim.emptyBody": "Muat warung demo dengan minimal satu menu aktif.",
  "sim.day": "Hari {day}: {date}",
  "sim.hours": "{done} dari {total} jam disimulasikan",
  "sim.dayDone": "Hari ditutup. Saran berikutnya memakai hari ini.",
  "sim.play": "Putar",
  "sim.pause": "Jeda",
  "sim.nextHour": "Jam berikutnya",
  "sim.nextDay": "Hari berikutnya",
  "sim.finishDay": "Selesaikan hari",
  "sim.restart": "Ulang dari awal",
  "sim.hourTitle": "Aktivitas {from} sampai {to}",
  "sim.customers": "Pelanggan",
  "sim.sold": "Terjual",
  "sim.missed": "Tidak kebagian",
  "sim.turnedAway": "Habis",
  "sim.transactions": "Transaksi jam ini",
  "sim.byHour": "Hari ini per jam",
  "sim.col.hour": "Jam",
  "sim.col.sales": "Penjualan",
  "sim.col.estimate": "Permintaan (perkiraan)",
  "sim.col.truth": "Permintaan simulasi",
  "sim.stock": "Stok",
  "sim.truthNote":
    "Permintaan simulasi hanya diketahui di dalam simulasi. Warung nyata hanya melihat perkiraan.",
  "sim.analysis": "Analisis",
  "sim.pattern": "Pelanggan per jam, rata-rata per hari simulasi",
  "sim.peak": "Jam tersibuk mulai pukul {from}.",
  "sim.barValue": "{sold} terjual, {missed} tidak kebagian",
  "sim.patternEmpty": "Jalankan minimal satu jam untuk melihat polanya.",
  "sim.menus": "Menu menurut untung per hari",
  "sim.next": "Masak berikutnya: {qty} porsi",
  "sim.menuStats":
    "Untung per hari {profit}. Habis {soldOut} dari {days} hari. Rata-rata sisa {leftover}. Rata-rata permintaan {demand} (perkiraan).",
  "sim.menusNote":
    "Berdasarkan 14 hari normal terakhir yang ditutup untuk tiap menu. Hanya menu yang sudah ada di warung yang dibandingkan.",
  "sim.signal.loss": "Merugi",
  "sim.signal.sellsOut": "Sering habis",
  "sim.signal.leftOver": "Sering bersisa",
  "sim.signal.steady": "Stabil",
  "case.title": "Panduan kasus",
  "case.eyebrow": "Kasus terpandu",
  "case.intro":
    "Tiap warung demo dibuat untuk memperlihatkan satu situasi. Ikuti empat momen dalam harinya. Setiap momen menjelaskan apa yang dicoba dan apa yang dilakukan FOODOO, dengan angka dari riwayat warung ini sendiri.",
  "case.try": "Coba ini",
  "case.happens": "Yang terjadi",
  "case.open.plan": "Buka rencana pagi",
  "case.open.service": "Buka penjualan",
  "case.open.close": "Buka jam tutup",
  "case.open.summary": "Buka ringkasan mingguan",
  "case.resetNote":
    "Membuka sebuah momen mengatur demo ke jam itu dan memuatnya ulang, jadi perubahan yang Anda buat pada hari demo kembali seperti semula. Riwayatnya tetap sama.",
  "case.another":
    "Untuk mengikuti kasus lain, tekan lencana Data demo di bagian atas lalu pilih warung.",
  "case.stop": "Hentikan panduan",
  "case.back": "Kembali ke panduan kasus",
  "case.note.label": "Catatan panduan kasus",
  "case.card.title": "Ikuti sebuah kasus",
  "case.card.body":
    "Tiap warung demo punya satu cerita. Ikuti momen demi momen, dengan penjelasan apa yang terjadi dan kenapa.",
  "case.card.open": "Buka panduan kasus",
  "case.emptyTitle": "Panduan kasus butuh warung demo",
  "case.emptyBody":
    "Panduan mengikuti cerita sebuah warung demo. Warung Anda sendiri tidak pernah diubah. Buka warung demo dulu.",
  "case.unavailableTitle": "Tidak ada menu untuk diikuti",
  "case.unavailableBody":
    "Semua menu warung demo ini diarsipkan. Pulihkan satu di Pengaturan, atau muat demo lagi.",
  "demo.launch.learnTitle": "Pelajari cara kerjanya dengan warung ini",
  "demo.launch.tourName": "Tutorial 7 langkah",
  "demo.launch.tourBody":
    "Tekan bagian yang disorot selama satu hari penuh. Tiap langkah juga menjelaskan apa yang terjadi di warung ini dan kenapa.",
  "demo.launch.resume": "Lanjutkan demo yang sudah ada",
  "demo.launch.resumeNote":
    "Membuka Hari ini tanpa memuat ulang. Atau pilih warung di bawah untuk mulai dari awal.",
  "demo.launch.guideBody":
    "Panduan langkah demi langkah menjelaskan apa yang terjadi di warung ini pada tiap momen hari, memakai angka dari riwayatnya sendiri.",
  "case.start": "Mulai kasus terpandu",
  "case.s1.title": "Menu yang habis menyembunyikan permintaan",
  "case.s1.situation":
    "{menu} biasanya dimasak {usual} porsi, tetapi terus saja habis. Hari yang habis hanya mencatat apa yang terjual, bukan apa yang diinginkan pembeli, jadi warung seperti ini diam-diam kehilangan penjualan. {menu2} kebalikannya, porsinya bersisa. Warung ini memperlihatkan FOODOO mengoreksi keduanya.",
  "case.s1.plan.try":
    "Buka rencana pagi. Bandingkan kartu {menu} dengan kartu {menu2}.",
  "case.s1.plan.happens":
    "{menu}: “{why}”. FOODOO menyarankan {qty} porsi, bukan {usual} yang biasa. {menu2}: “{why2}”. Sarannya {qty2}, bukan {usual2}. Angkanya berasal dari hari-hari yang dicatat pemilik, dengan hari yang habis dikoreksi ke atas.",
  "case.s1.service.try":
    "Buka layar Penjualan. Menu yang paling sering habis sudah habis. Ketuk menu lain untuk menandainya habis juga.",
  "case.s1.service.happens":
    "Satu ketukan menyimpan satu hal: menit menu itu habis. FOODOO menggabungkan menit itu dengan jam ramai warung. Kalau baru separuh pembeli hari itu yang datang saat menu habis, permintaan sebenarnya sekitar dua kali porsi yang dimasak. Batalkan tersedia selama 10 detik.",
  "case.s1.close.try":
    "Buka jam tutup. Isi sisa menu yang tidak habis, lalu tekan Tutup hari.",
  "case.s1.close.happens":
    "Kalau ada sisa, permintaan adalah porsi yang dimasak dikurangi sisa, jadi pasti. Untuk menu yang habis, FOODOO memperkirakan permintaan dari jam habisnya, paling banyak tiga kali porsi yang dimasak, dan menandainya sebagai perkiraan. Angka ini menjadi dasar saran besok.",
  "case.s1.summary.try":
    "Buka ringkasan mingguan. Lihat sisa, menu yang habis, dan perkiraan penjualan yang hilang.",
  "case.s1.summary.happens":
    "Menu yang habis, seperti {menu}, menampilkan perkiraan penjualan yang hilang di sini. Menu yang bersisa, seperti {menu2}, menampilkan uang yang hilang karena makanan terbuang. Angka besok menimbang untung yang hilang karena kehabisan terhadap biaya sisa, jadi tiap menu punya angkanya sendiri.",
  "case.s2.title": "Satu hari tidak sama dengan hari lain",
  "case.s2.situation":
    "Warung makan siang kantor dengan satu jam ramai tajam di tengah hari. Ramai di hari kerja dan sepi di akhir pekan, jadi satu rata-rata akan salah di sebagian besar hari. FOODOO membandingkan tiap hari dengan hari yang sama.",
  "case.s2.plan.try": "Buka rencana pagi dan baca alasan pada kartu {menu}.",
  "case.s2.plan.happens":
    "{menu}: “{why}”. FOODOO melihat hari yang sama pada beberapa minggu terakhir, jadi hari {hiDay} mendapat {hiQty} porsi dan hari {loDay} hanya {loQty}. {menu2} ceritanya lain: “{why2}”. Sarannya {qty2}, bukan {usual2} yang biasa.",
  "case.s2.service.try":
    "Buka layar Penjualan dan ketuk menu yang belum habis untuk menandainya habis.",
  "case.s2.service.happens":
    "Warung buka {open} sampai {close}, dengan jam ramai sekitar tengah hari. Menu yang habis sebelum jam ramai memuncak menyembunyikan jauh lebih banyak permintaan daripada yang habis menjelang tutup, karena sebagian besar pembeli belum datang. FOODOO menimbang jam habis dengan jam ramai.",
  "case.s2.close.try":
    "Buka jam tutup. Isi sisanya. Kalau ada kejadian tidak biasa hari ini, seperti hujan atau hari libur, nyalakan Hari tidak biasa.",
  "case.s2.close.happens":
    "Hari yang ditandai tidak biasa tetap ada di riwayat tetapi diabaikan saat membuat saran. Perbedaan biasa antara hari kerja dan akhir pekan bukan pengecualian, karena membandingkan hari yang sama sudah menanganinya.",
  "case.s2.summary.try":
    "Buka ringkasan mingguan, lalu buka satu hari lalu dari daftar.",
  "case.s2.summary.happens":
    "Tiap hari menampilkan yang dimasak, yang disarankan, dan permintaannya. Bandingkan hari kerja dengan hari akhir pekan. Jumlahnya berbeda karena permintaannya berbeda, bukan karena pemilik berubah pikiran.",
  "case.s3.title": "Warung yang tutup lewat tengah malam",
  "case.s3.situation":
    "Warung malam yang buka {open} sampai {close}. Harinya melewati tengah malam, jadi penjualan pukul 01:00 masuk ke malam saat warung buka, bukan ke tanggal berikutnya. Tanpa aturan itu, satu malam akan terpecah jadi dua hari.",
  "case.s3.plan.try":
    "Buka rencana. Tanggalnya adalah malam saat warung buka, walau jam sudah lewat tengah malam.",
  "case.s3.plan.happens":
    "{menu}: “{why}”. FOODOO menyarankan {qty}, bukan {usual} yang biasa. Pembandingnya hari yang sama pada malam warung buka, jadi malam Jumat yang berakhir Sabtu pukul 01:00 tetap dihitung Jumat. {menu2}: {qty2}, bukan {usual2}.",
  "case.s3.service.try": "Buka layar Penjualan dan tandai satu menu habis.",
  "case.s3.service.happens":
    "Jamnya disimpan menurut jam warung sendiri, di mana lewat tengah malam dihitung lebih akhir dari 23:00. Menu yang habis pukul 00:30 dengan benar dibaca habis terlambat, menjelang tutup, bukan di awal hari.",
  "case.s3.close.try":
    "Buka jam tutup. Isi sisanya dan tutup hari, walau sudah lewat tengah malam.",
  "case.s3.close.happens":
    "Hari yang ditutup disimpan atas nama malam saat warung buka. Permintaan dihitung dengan cara yang sama seperti warung siang, memakai jam ramai antara {open} dan {close}.",
  "case.s3.summary.try": "Buka ringkasan mingguan dan lihat hari-hari terbaru.",
  "case.s3.summary.happens":
    "Tiap malam muncul sekali, atas nama hari mulainya. Malam {hiDay} paling ramai di sini, dengan {hiQty} porsi {menu}, dan malam {loDay} paling sepi, dengan {loQty}.",
  "case.s4.title": "Warung baru dengan riwayat sedikit",
  "case.s4.situation":
    "Warung ini baru buka {days} hari lalu. Riwayatnya belum cukup untuk dipelajari, jadi FOODOO mulai dari porsi biasa dan menyesuaikan sedikit setelah tiap hari.",
  "case.s4.plan.try":
    "Buka rencana pagi. Baca alasan pada kartu {menu} dan {menu2}.",
  "case.s4.plan.happens":
    "{menu}: “{why}”, jadi {qty}, bukan {usual}. {menu2}: “{why2}”, jadi {qty2}, bukan {usual2}. Dengan hari yang sedikit, FOODOO bergeser sekitar sepersepuluh saja, karena beberapa hari bisa menyesatkan. Saran berdasarkan pola yang sebenarnya butuh paling sedikit 5 hari yang sebanding.",
  "case.s4.service.try": "Buka layar Penjualan dan tandai satu menu habis.",
  "case.s4.service.happens":
    "Jam habis disimpan sejak hari pertama. Saat hari ditutup, jam itu diubah menjadi perkiraan permintaan, dan perkiraan itulah dasar saran berikutnya.",
  "case.s4.close.try": "Buka jam tutup. Isi sisanya dan tutup hari.",
  "case.s4.close.happens":
    "Tiap hari yang ditutup menambah satu data. {menu3} masih menghasilkan {salvage3} untuk setiap porsi yang tidak terjual, jadi sisanya kecil ruginya. Setelah riwayatnya cukup, FOODOO condong memasak lebih banyak karena rasio kritisnya {ratio3}%.",
  "case.s4.summary.try":
    "Buka ringkasan mingguan. Hanya ada beberapa hari untuk ditampilkan.",
  "case.s4.summary.happens":
    "Dengan {days} hari, grafiknya pendek, dan itu jujur. FOODOO menandai perkiraan dan tidak berpura-pura tahu lebih banyak dari hari yang tercatat. Terus catat dan sarannya berubah dari titik awal menjadi pola.",
};
