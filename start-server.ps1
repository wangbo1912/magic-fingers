$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  指尖魔法 - 赛博朋克版服务器" -ForegroundColor Magenta
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📂 目录: $PWD" -ForegroundColor Yellow
Write-Host "🌐 访问地址: http://localhost:$port" -ForegroundColor Green
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Gray
Write-Host ""

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $url = $request.Url.LocalPath
        if ($url -eq '/') {
            $url = '/index.html'
        }
        
        $filePath = Join-Path $PWD ($url.TrimStart('/'))
        
        if (Test-Path $filePath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($filePath)
            $contentType = switch ($extension) {
                '.html' { 'text/html; charset=utf-8' }
                '.css' { 'text/css; charset=utf-8' }
                '.js' { 'application/javascript; charset=utf-8' }
                '.json' { 'application/json; charset=utf-8' }
                default { 'text/plain; charset=utf-8' }
            }
            
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
            
            Write-Host "✅ 200 $url" -ForegroundColor Green
        } else {
            $response.StatusCode = 404
            $html = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>404 Not Found</title>
    <style>
        body { background: #0a0a0f; color: #00ffff; font-family: 'Segoe UI', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        h1 { font-size: 72px; margin: 0; text-shadow: 0 0 20px #00ffff; }
        p { font-size: 24px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>404</h1>
    <p>文件未找到: $url</p>
</body>
</html>
"@
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($html)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            
            Write-Host "❌ 404 $url" -ForegroundColor Red
        }
        
        $response.Close()
    }
} finally {
    $listener.Stop()
    Write-Host ""
    Write-Host "🛑 服务器已停止" -ForegroundColor Red
}
