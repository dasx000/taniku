"""
Prototipe query fitur "Kendali OPT":
  input  : nama komoditas (bebas ketik, dicocokkan LIKE case-insensitive)
           nama OPT / hama-penyakit (umum ATAU latin, bebas ketik)
  output : daftar bahan aktif yang terdaftar untuk kombinasi itu
           + top 5 rekomendasi produk (diurutkan: registrasi masih berlaku dulu,
             lalu yang paling baru terbit -- INI PROXY, bukan data popularitas/penjualan asli)
"""
import sqlite3, sys, datetime

DB = "/home/claude/kementan/kendali_opt.sqlite"

def cari(komoditas_q, opt_q, top_n=5):
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # cari komoditas & opt yang cocok (LIKE, biar toleran ketikan sebagian)
    cur.execute("SELECT id, nama FROM komoditas WHERE nama LIKE ? COLLATE NOCASE", (f"%{komoditas_q}%",))
    kom_matches = cur.fetchall()
    cur.execute("""SELECT id, nama_umum, nama_latin FROM opt
                   WHERE nama_umum LIKE ? COLLATE NOCASE OR nama_latin LIKE ? COLLATE NOCASE""",
                (f"%{opt_q}%", f"%{opt_q}%"))
    opt_matches = cur.fetchall()

    if not kom_matches:
        print(f"Komoditas tidak ditemukan untuk: '{komoditas_q}'")
        return
    if not opt_matches:
        print(f"OPT tidak ditemukan untuk: '{opt_q}'")
        return

    kom_ids = [r["id"] for r in kom_matches]
    opt_ids = [r["id"] for r in opt_matches]

    print(f"Komoditas cocok: {[r['nama'] for r in kom_matches]}")
    print(f"OPT cocok      : {[(r['nama_umum'], r['nama_latin']) for r in opt_matches]}")
    print()

    qmarks_kom = ",".join("?" * len(kom_ids))
    qmarks_opt = ",".join("?" * len(opt_ids))

    cur.execute(f"""
        SELECT a.id, a.produk_id, a.dosis, a.satuan_dosis,
               p.nama AS produk_nama, p.perusahaan, p.jenis_pestisida,
               p.tgl_terbit, p.tgl_berakhir
        FROM aplikasi a
        JOIN produk p ON p.id = a.produk_id
        WHERE a.komoditas_id IN ({qmarks_kom}) AND a.opt_id IN ({qmarks_opt})
    """, kom_ids + opt_ids)
    rows = cur.fetchall()

    if not rows:
        print("Tidak ada data aplikasi terdaftar untuk kombinasi ini.")
        return

    produk_ids = sorted(set(r["produk_id"] for r in rows))

    # bahan aktif per produk yang match
    cur.execute(f"""
        SELECT pba.produk_id, ba.nama, pba.kadar, pba.satuan
        FROM produk_bahan_aktif pba
        JOIN bahan_aktif ba ON ba.id = pba.bahan_aktif_id
        WHERE pba.produk_id IN ({','.join('?'*len(produk_ids))})
    """, produk_ids)
    ba_by_produk = {}
    ba_set = {}
    for r in cur.fetchall():
        ba_by_produk.setdefault(r["produk_id"], []).append(f"{r['nama']} ({r['kadar']} {r['satuan']})".strip())
        ba_set[r["nama"]] = ba_set.get(r["nama"], 0) + 1

    print(f"=== Bahan aktif terdaftar untuk kombinasi ini ({len(ba_set)} bahan aktif unik, dari {len(produk_ids)} produk) ===")
    for nama, cnt in sorted(ba_set.items(), key=lambda x: -x[1]):
        print(f"  - {nama}  (dipakai di {cnt} produk)")
    print()

    # top N produk: aktif (belum lewat tgl_berakhir) dulu, lalu tgl_terbit terbaru
    today = datetime.date.today().isoformat()
    def sort_key(r):
        masih_berlaku = 1 if (r["tgl_berakhir"] and r["tgl_berakhir"] >= today) else 0
        return (-masih_berlaku, r["tgl_terbit"] and -datetime.date.fromisoformat(r["tgl_terbit"]).toordinal() or 0)

    uniq_rows = {}
    for r in rows:
        uniq_rows[r["produk_id"]] = r  # satu baris representatif per produk
    top = sorted(uniq_rows.values(), key=sort_key)[:top_n]

    print(f"=== Top {top_n} rekomendasi produk (proksi: registrasi masih berlaku + terbaru terbit -- BUKAN data penjualan/popularitas asli) ===")
    for r in top:
        bas = ", ".join(ba_by_produk.get(r["produk_id"], []))
        status = "berlaku" if (r["tgl_berakhir"] and r["tgl_berakhir"] >= today) else "kedaluwarsa"
        print(f"  - {r['produk_nama']} ({r['perusahaan']}) [{r['jenis_pestisida']}]")
        print(f"      bahan aktif: {bas}")
        print(f"      dosis: {r['dosis']} {r['satuan_dosis']} | registrasi {status} s.d. {r['tgl_berakhir']}")
    conn.close()


if __name__ == "__main__":
    tests = [
        ("Padi", "wereng coklat"),
        ("Padi Sawah", "wereng coklat"),
        ("Cabai", "kutu kebul"),
        ("Tebu", "gulma golongan rumput"),
        ("Jagung", "ulat grayak"),
    ]
    for kom, opt in tests:
        print("=" * 70)
        print(f"QUERY: komoditas='{kom}'  opt='{opt}'")
        print("=" * 70)
        cari(kom, opt)
        print()
