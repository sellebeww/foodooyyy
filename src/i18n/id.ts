// src/i18n/id.ts
import type { en } from "./en.ts";

export const id: Record<keyof typeof en, string> = {
  "app.name": "FOODOO",
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

  "header.demo": "Data demo",
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

  "welcome.start": "Mulai pengaturan",
  "welcome.continue": "Lanjutkan pengaturan",
  "demo.pick.title": "Pilih warung demo",
  "demo.pick.intro":
    "Keempat warung memakai data buatan. Riwayatnya selalu berakhir kemarin, kapan pun aplikasi dibuka.",
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
    "Cadangan lengkap warung, menu, dan semua hari. Pakai untuk pindah ke HP baru.",
  "transfer.hint.csv":
    "Catatan harian per menu, satu baris per menu per hari. Bisa dibuka di aplikasi spreadsheet apa pun.",
  "transfer.hint.xlsx":
    "Cadangan lengkap untuk Excel atau Google Sheets, dalam empat sheet: Stall, Menus, Days, MenuDays.",
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
    "Semua data hanya disimpan di perangkat ini. Tidak ada yang dikirim ke mana pun.",
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
    "FOODOO menyarankan porsi dengan aturan tetap yang bisa dijelaskan. Tidak memakai model AI. Lisensi pustaka dan huruf, serta bantuan AI yang dipakai untuk membangun aplikasi ini, tercantum di README proyek.",
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
  "how.demandTitle": "1. Berapa orang yang ingin membeli menu yang habis",
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
  "how.suggestTitle": "2. Cara porsi besok disarankan",
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
    "Tidak mengirim apa pun ke mana pun. Data Anda tetap di perangkat ini.",
  "how.back": "Kembali ke aplikasi",
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
  "landing.closingBody":
    "Lihat-lihat warung demo berdata buatan, atau atur menu Anda sendiri. Tanpa akun.",
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
  "landing.nav.demo": "Demo",
  "landing.nav.team": "Tim",
  "landing.nav.seeDemo": "Lihat demo",
  "landing.nav.openApp": "Buka aplikasi",
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
  "landing.demoTitle": "Jelajahi warung demo",
  "landing.demoOpen": "Buka demo",
  "landing.demoOpenLabel": "Buka demo: {name}",
  "landing.teamTitle": "Tim di balik FOODOO",
  "landing.teamBody":
    "Calon Mantu Idaman, membangun untuk STACK 2026 oleh GDGoC ITB, Kasus 2: Stronger Communities and Everyday Services.",
  "landing.team.domain": "Perkiraan permintaan, saran porsi, dan backtest",
  "landing.team.data": "Data di perangkat, ekspor dan impor",
  "landing.team.screens": "Layar dan komponen",
  "landing.team.platform":
    "Aplikasi offline, bahasa, aksesibilitas, pengujian, dan deployment",
  "landing.closingSetup": "Atur warung saya",
  "landing.closingDemo": "Pilih warung demo",
  "landing.footerNote":
    "Data demo adalah data buatan dan diberi label. Isian Anda tetap di perangkat Anda.",
  "landing.footerLinks": "Tentang FOODOO lebih lanjut",
  "today.hint.plan": "Periksa tiap angka saran, ubah sesuka Anda, lalu simpan.",
  "today.hint.service": "Saat menu habis, ketuk agar jamnya tercatat.",
  "today.hint.close":
    "Hitung sisanya supaya saran berikutnya belajar dari hari ini.",
};
