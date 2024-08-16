function drawImage(size) {
    if (size % 2 === 0) {
        console.log("Ukuran harus ganjil.");
        return;
    }

    for (let i = 0; i < size; i++) {
        let row = ""; // Variabel untuk menyimpan string karakter pada baris tertentu
        for (let j = 0; j < size; j++) {
            if ((i + j) % 2 === 0) {
                row += "#"; // Jika genap, tambahkan karakter "#" ke baris
            } else {
                row += "*";  // Jika ganjil, tambahkan karakter "*" ke baris
            }
        }
        console.log(row.trim());
    }
}


drawImage(5); // Memanggil fungsi drawImage dengan ukuran 5
console.log("==============");
drawImage(7); // Memanggil fungsi drawImage dengan ukuran 7
