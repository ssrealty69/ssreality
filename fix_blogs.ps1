$src = 'c:\Users\Pawan\Documents\SS\ss-realty\src\lib\blogs.ts'
$lines = [System.IO.File]::ReadAllLines($src)
$clean = $lines[0..387]
[System.IO.File]::WriteAllLines($src, $clean)
Write-Host "Done - file now has $($clean.Length) lines"
