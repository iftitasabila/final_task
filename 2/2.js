function bubbleSort(arr) {
    let n = arr.length;

    // looping pertama untuk mengulangi proses sorting sebanyak n-1 kali
    for (let i = 0; i < n - 1; i++) {
        // looping kedua untuk membandingkan elemen yang bersebelahan
        for (let j = 0; j < n - i -1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Jika elemen kiri lebih besar daripada kanan, maka tukar posisi
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}

let arr = [20, 12, 35, 11, 17, 9, 58, 23, 69, 21];
console.log("Array sebelum diurutkan", arr)

arr = bubbleSort(arr); // Panggil fungsi bubblesort untuk mengurutkan array
console.log("Array setelah diurutkan", arr)