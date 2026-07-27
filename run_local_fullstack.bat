@echo off
REM ============================================================
REM  Rice Growth Classifier - Portable Local Full-Stack Launcher
REM ============================================================
REM Folder ini MANDIRI - tidak butuh apa pun dari luar folder ini.
REM Cukup copy SELURUH folder "portable_app" ini ke laptop lain,
REM lalu double-click file ini (atau jalankan lewat
REM "npm run dev:full" dari dalam folder frontend\).
REM
REM Model AI (233 MB) TIDAK ikut di folder ini - otomatis diunduh
REM dari Hugging Face Hub saat backend pertama kali dijalankan
REM (butuh koneksi internet sekali saja, selanjutnya tersimpan
REM di cache lokal komputer).
REM
REM Syarat di laptop tujuan (wajib diinstall manual sekali, tidak
REM bisa dibawa lewat file ini):
REM   - Python 3.10+   https://www.python.org/downloads/
REM   - Node.js 18+    https://nodejs.org/
REM
REM Setup environment (venv Python + npm install) dijalankan
REM OTOMATIS oleh script ini saat pertama kali dipakai di laptop
REM baru (butuh beberapa menit karena instalasi TensorFlow).
REM Percobaan berikutnya akan langsung cepat karena sudah tersedia.
REM ============================================================

set ROOT=%~dp0
set BACKEND_DIR=%ROOT%backend
set FRONTEND_DIR=%ROOT%frontend

echo ============================================================
echo   Rice Growth Classifier - Local Full-Stack Launcher
echo ============================================================
echo Folder ini: %ROOT%
echo.

REM --- Cek prasyarat ------------------------------------------------
where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python tidak ditemukan di komputer ini.
    echo Install dulu dari https://www.python.org/downloads/
    echo ^(saat install, centang "Add python.exe to PATH"^), lalu jalankan file ini lagi.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js / npm tidak ditemukan di komputer ini.
    echo Install dulu dari https://nodejs.org/ ^(pilih versi LTS^), lalu jalankan file ini lagi.
    pause
    exit /b 1
)

REM --- Setup backend (sekali saja, otomatis kalau belum ada) --------
if not exist "%BACKEND_DIR%\.venv\Scripts\python.exe" (
    echo [SETUP] Environment backend belum ada di komputer ini.
    echo [SETUP] Membuat virtual environment Python + install dependency...
    echo [SETUP] Proses ini hanya sekali dan makan waktu 5-15 menit ^(TensorFlow cukup besar^).
    echo.
    python -m venv "%BACKEND_DIR%\.venv"
    if errorlevel 1 (
        echo [ERROR] Gagal membuat virtual environment. Cek instalasi Python Anda.
        pause
        exit /b 1
    )
    "%BACKEND_DIR%\.venv\Scripts\python.exe" -m pip install --upgrade pip
    "%BACKEND_DIR%\.venv\Scripts\python.exe" -m pip install -r "%BACKEND_DIR%\requirements.txt"
    if errorlevel 1 (
        echo [ERROR] Gagal install dependency backend. Lihat pesan error di atas.
        pause
        exit /b 1
    )
    echo [SETUP] Backend selesai disiapkan.
    echo.
) else (
    echo [OK] Environment backend sudah tersedia, lanjut.
)

REM --- Setup frontend (sekali saja, otomatis kalau belum ada) -------
if not exist "%FRONTEND_DIR%\node_modules" (
    echo [SETUP] Package frontend belum ter-install, menjalankan npm install...
    pushd "%FRONTEND_DIR%"
    call npm install
    if errorlevel 1 (
        echo [ERROR] Gagal npm install. Lihat pesan error di atas.
        popd
        pause
        exit /b 1
    )
    popd
    echo [SETUP] Frontend selesai disiapkan.
    echo.
) else (
    echo [OK] Package frontend sudah tersedia, lanjut.
)

REM --- Jalankan kedua server -----------------------------------------
echo.
echo [1/2] Membuka backend (FastAPI) di jendela baru...
echo        ^(unduhan model dari Hugging Face Hub terjadi di sini kalau ini
echo        pertama kali dijalankan di komputer ini - butuh internet^)
start "Rice Growth Backend (port 8000)" cmd /k "cd /d "%BACKEND_DIR%" && set MODEL_HF_REPO_ID=eranusadata/rice-growth-hybrid-fusion-model&& ".venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/2] Membuka frontend (Vite) di jendela baru...
start "Rice Growth Frontend (port 5173)" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

echo.
echo ============================================================
echo Kedua server sedang berjalan di jendela terpisah:
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:8000/docs
echo ============================================================
echo Jendela ini boleh ditutup kapan saja - kedua server tetap jalan
echo di jendela masing-masing. Untuk MENGHENTIKAN server, tutup
echo langsung jendela "Rice Growth Backend" dan "Rice Growth Frontend".
pause
