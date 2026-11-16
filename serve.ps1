param(
    [int]$Port = 5500,
    [string]$Root = $PSScriptRoot
)

if (-not $Root) {
    $Root = (Get-Location).Path
}

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".vcf"  = "text/vcard; charset=utf-8"
    ".txt"  = "text/plain; charset=utf-8"
    ".mp4"  = "video/mp4"
}

$listener = $null
$maxAttempts = 10
for ($i = 0; $i -lt $maxAttempts; $i++) {
    $tryPort = $Port + $i
    try {
        $tempListener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $tryPort)
        $tempListener.Start()
        $listener = $tempListener
        $Port = $tryPort
        break
    } catch {
        if ($i -eq 0) {
            Write-Host "Notice: Port $Port is currently busy. Trying next port..." -ForegroundColor Yellow
        }
    }
}

if (-not $listener) {
    Write-Host "Failed to start listener on any port from $Port to $($Port + $maxAttempts - 1)." -ForegroundColor Red
    exit 1
}

$localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254*" } | Select-Object -First 1).IPAddress

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   EXECUTIVE PORTFOLIO - LOCAL WI-FI WEB SERVER" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Serving folder: $Root" -ForegroundColor Gray
Write-Host "Local machine : http://localhost:$Port" -ForegroundColor Green
Write-Host "Same Wi-Fi URL: http://$($localIp):$Port" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Share this link with anyone on the same Wi-Fi network:" -ForegroundColor White
Write-Host "   http://$($localIp):$Port" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host ""

$crlf = [string][char]13 + [string][char]10
$crlf2 = $crlf + $crlf

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
    } catch {
        Write-Host ("Accept error: " + $_.Exception.Message) -ForegroundColor Red
        Start-Sleep -Milliseconds 200
        continue
    }

    try {
        $stream = $client.GetStream()
        $stream.ReadTimeout = 5000
        $stream.WriteTimeout = 5000
        
        $buffer = New-Object byte[] 8192
        $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
        if ($bytesRead -gt 0) {
            $requestText = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $bytesRead)
            $firstLine = $requestText.Split([char]10)[0].Trim()
            $tokens = $firstLine -split ' '
            if ($tokens.Length -ge 2) {
                $rawPath = $tokens[1]
                $pathOnly = $rawPath.Split('?')[0].Split('#')[0]
                $decodedPath = [System.Uri]::UnescapeDataString($pathOnly).TrimStart('/')
                if ([string]::IsNullOrWhiteSpace($decodedPath)) {
                    $decodedPath = 'index.html'
                }

                $normalizedRelative = $decodedPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
                $fullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($Root, $normalizedRelative))

                if ($fullPath.StartsWith([System.IO.Path]::GetFullPath($Root), [System.StringComparison]::OrdinalIgnoreCase)) {
                    if ([System.IO.Directory]::Exists($fullPath)) {
                        $fullPath = [System.IO.Path]::Combine($fullPath, 'index.html')
                    }

                    if ([System.IO.File]::Exists($fullPath)) {
                        $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
                        $contentType = 'application/octet-stream'
                        if ($MimeTypes.ContainsKey($ext)) {
                            $contentType = $MimeTypes[$ext]
                        }

                        $fileLength = (New-Object System.IO.FileInfo($fullPath)).Length

                        # Check for Range header
                        $rangeHeader = $null
                        foreach ($line in ($requestText -split "`r?`n")) {
                            if ($line -match '^Range:\s*bytes=(\d*)-(\d*)') {
                                $rangeHeader = $line
                                break
                            }
                        }

                        if ($rangeHeader -and ($rangeHeader -match '^Range:\s*bytes=(\d*)-(\d*)')) {
                            $startStr = $matches[1]
                            $endStr = $matches[2]
                            $start = if ([string]::IsNullOrEmpty($startStr)) { 0 } else { [int64]$startStr }
                            $end = if ([string]::IsNullOrEmpty($endStr)) { $fileLength - 1 } else { [int64]$endStr }
                            if ($end -ge $fileLength) { $end = $fileLength - 1 }
                            $lengthToSend = $end - $start + 1

                            $header = 'HTTP/1.1 206 Partial Content' + $crlf +
                                      'Content-Type: ' + $contentType + $crlf +
                                      'Accept-Ranges: bytes' + $crlf +
                                      'Content-Range: bytes ' + $start + '-' + $end + '/' + $fileLength + $crlf +
                                      'Content-Length: ' + $lengthToSend + $crlf +
                                      'Access-Control-Allow-Origin: *' + $crlf +
                                      'Connection: close' + $crlf2

                            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                            $stream.Write($headerBytes, 0, $headerBytes.Length)

                            $fs = [System.IO.File]::OpenRead($fullPath)
                            $fs.Seek($start, [System.IO.SeekOrigin]::Begin) | Out-Null
                            $chunkBuf = New-Object byte[] 65536
                            $remaining = $lengthToSend
                            while ($remaining -gt 0) {
                                $toRead = [int][Math]::Min($chunkBuf.Length, $remaining)
                                $read = $fs.Read($chunkBuf, 0, $toRead)
                                if ($read -le 0) { break }
                                $stream.Write($chunkBuf, 0, $read)
                                $remaining -= $read
                            }
                            $fs.Close()
                            $stream.Flush()
                        } else {
                            $fileBytes = [System.IO.File]::ReadAllBytes($fullPath)
                            $header = 'HTTP/1.1 200 OK' + $crlf +
                                      'Content-Type: ' + $contentType + $crlf +
                                      'Accept-Ranges: bytes' + $crlf +
                                      'Content-Length: ' + $fileBytes.Length + $crlf +
                                      'Access-Control-Allow-Origin: *' + $crlf +
                                      'Cache-Control: no-cache' + $crlf +
                                      'Connection: close' + $crlf2
                            
                            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                            $stream.Write($headerBytes, 0, $headerBytes.Length)
                            $stream.Write($fileBytes, 0, $fileBytes.Length)
                            $stream.Flush()
                        }
                    } else {
                        $body = '<html><body><h1>404 Not Found</h1></body></html>'
                        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
                        $header = 'HTTP/1.1 404 Not Found' + $crlf +
                                  'Content-Type: text/html; charset=utf-8' + $crlf +
                                  'Content-Length: ' + $bodyBytes.Length + $crlf +
                                  'Connection: close' + $crlf2
                        $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                        $stream.Write($headerBytes, 0, $headerBytes.Length)
                        $stream.Write($bodyBytes, 0, $bodyBytes.Length)
                        $stream.Flush()
                    }
                }
            }
        }
    } catch {
        # Client disconnect or timeout, ignore and continue
    } finally {
        $client.Close()
    }
}
