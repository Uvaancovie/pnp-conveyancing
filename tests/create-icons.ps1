Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap(1024, 1024)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)

$bmp.Save("D:\pnp-conveyancing\assets\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("D:\pnp-conveyancing\assets\adaptive-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("D:\pnp-conveyancing\assets\splash.png", [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()

Write-Host "Created placeholder icons successfully"

