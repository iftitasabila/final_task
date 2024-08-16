function HitungBarang(kualitas, quantity) {
    let hargaPerunit;
    let potongan = 0;
    let totalHarga;

    // Menentukan harga per unit berdasarkan kualitas barang
    if (kualitas == 'A') {
        hargaPerunit = 4550;
        if (quantity > 13 ) {
            potongan = 231 *quantity;
        }
    }else if (kualitas == 'B') {
        hargaPerunit = 5330;
        if (quantity > 7) {
            potongan = 0.23 *hargaPerunit *quantity;
        }
    }else if (kualitas == 'C') {
        hargaPerunit = 8653;
    }else {
        console.log("kualitas barang tidak valid!");
        return;
    }

    // Hitung harga total sebelum potongan 
    totalHarga = hargaPerunit *quantity;

    // Hitung total yang harus dibayar setelah ada potongan
    let totalBayar = totalHarga - potongan;

    // Output hasil perhitungan
    console.log(` Total harga barang: ${totalHarga}`);
    console.log(` Potongan: ${potongan}`);
    console.log(` Total yang harus dibayar: ${totalBayar}`);
}

HitungBarang('A', 14);