#Requires -Version 5.1
param(
    [string] $Version = 'latest',
    [string] $EnvFile = '.env'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ImageName = 'as-ms-ar-abc-frontend'
$Tag       = "${ImageName}:${Version}"
$TarFile   = "${ImageName}-${Version}.tar"

if (Test-Path $EnvFile) {
    Write-Host "Loading variables from $EnvFile"
    Get-Content $EnvFile |
        Where-Object { $_ -notmatch '^\s*#' -and $_ -match '=' } |
        ForEach-Object {
            $parts = $_ -split '=', 2
            $key   = $parts[0].Trim()
            $val   = if ($parts.Count -gt 1) { $parts[1].Trim() } else { '' }
            if (-not [System.Environment]::GetEnvironmentVariable($key)) {
                [System.Environment]::SetEnvironmentVariable($key, $val, 'Process')
            }
        }
}

function Get-Env([string] $Key) {
    $val = [System.Environment]::GetEnvironmentVariable($Key, 'Process')
    if ($null -ne $val) { return $val }
    return ''
}

Write-Host ""
Write-Host "Building image: $Tag" -ForegroundColor Cyan

$buildArgs = @(
    'build'

    '--build-arg', "VITE_API_URL_REAL=$(Get-Env 'VITE_API_URL_REAL')"
    '--build-arg', "VITE_API_URL_MOCK=$(Get-Env 'VITE_API_URL_MOCK')"
    '--build-arg', "VITE_USE_MOCK=$(Get-Env 'VITE_USE_MOCK')"

    '--build-arg', "VITE_MS_CATALOGOS_REAL=$(Get-Env 'VITE_MS_CATALOGOS_REAL')"
    '--build-arg', "VITE_MS_CATALOGOS_MOCK=$(Get-Env 'VITE_MS_CATALOGOS_MOCK')"
    '--build-arg', "VITE_MS_CATALOGOS_USE_MOCK=$(Get-Env 'VITE_MS_CATALOGOS_USE_MOCK')"

    '--build-arg', "VITE_MS_MAPEOS_LINEA_REAL=$(Get-Env 'VITE_MS_MAPEOS_LINEA_REAL')"
    '--build-arg', "VITE_MS_MAPEOS_LINEA_MOCK=$(Get-Env 'VITE_MS_MAPEOS_LINEA_MOCK')"
    '--build-arg', "VITE_MS_MAPEOS_LINEA_USE_MOCK=$(Get-Env 'VITE_MS_MAPEOS_LINEA_USE_MOCK')"
    '--build-arg', "VITE_MS_MAPEOS_CAMPANA_REAL=$(Get-Env 'VITE_MS_MAPEOS_CAMPANA_REAL')"
    '--build-arg', "VITE_MS_MAPEOS_CAMPANA_MOCK=$(Get-Env 'VITE_MS_MAPEOS_CAMPANA_MOCK')"
    '--build-arg', "VITE_MS_MAPEOS_CAMPANA_USE_MOCK=$(Get-Env 'VITE_MS_MAPEOS_CAMPANA_USE_MOCK')"

    '--build-arg', "VITE_MS_TAREAS_LINEA_REAL=$(Get-Env 'VITE_MS_TAREAS_LINEA_REAL')"
    '--build-arg', "VITE_MS_TAREAS_LINEA_MOCK=$(Get-Env 'VITE_MS_TAREAS_LINEA_MOCK')"
    '--build-arg', "VITE_MS_TAREAS_LINEA_USE_MOCK=$(Get-Env 'VITE_MS_TAREAS_LINEA_USE_MOCK')"
    '--build-arg', "VITE_MS_TAREAS_CAMPANA_REAL=$(Get-Env 'VITE_MS_TAREAS_CAMPANA_REAL')"
    '--build-arg', "VITE_MS_TAREAS_CAMPANA_MOCK=$(Get-Env 'VITE_MS_TAREAS_CAMPANA_MOCK')"
    '--build-arg', "VITE_MS_TAREAS_CAMPANA_USE_MOCK=$(Get-Env 'VITE_MS_TAREAS_CAMPANA_USE_MOCK')"

    '--build-arg', "VITE_MS_COLUMNAS_LINEA_REAL=$(Get-Env 'VITE_MS_COLUMNAS_LINEA_REAL')"
    '--build-arg', "VITE_MS_COLUMNAS_LINEA_MOCK=$(Get-Env 'VITE_MS_COLUMNAS_LINEA_MOCK')"
    '--build-arg', "VITE_MS_COLUMNAS_LINEA_USE_MOCK=$(Get-Env 'VITE_MS_COLUMNAS_LINEA_USE_MOCK')"
    '--build-arg', "VITE_MS_COLUMNAS_CAMPANA_REAL=$(Get-Env 'VITE_MS_COLUMNAS_CAMPANA_REAL')"
    '--build-arg', "VITE_MS_COLUMNAS_CAMPANA_MOCK=$(Get-Env 'VITE_MS_COLUMNAS_CAMPANA_MOCK')"
    '--build-arg', "VITE_MS_COLUMNAS_CAMPANA_USE_MOCK=$(Get-Env 'VITE_MS_COLUMNAS_CAMPANA_USE_MOCK')"

    '--build-arg', "VITE_MS_BITACORA_REAL=$(Get-Env 'VITE_MS_BITACORA_REAL')"
    '--build-arg', "VITE_MS_BITACORA_MOCK=$(Get-Env 'VITE_MS_BITACORA_MOCK')"
    '--build-arg', "VITE_MS_BITACORA_USE_MOCK=$(Get-Env 'VITE_MS_BITACORA_USE_MOCK')"

    '--build-arg', "VITE_MS_HORARIOS_LINEA_REAL=$(Get-Env 'VITE_MS_HORARIOS_LINEA_REAL')"
    '--build-arg', "VITE_MS_HORARIOS_LINEA_MOCK=$(Get-Env 'VITE_MS_HORARIOS_LINEA_MOCK')"
    '--build-arg', "VITE_MS_HORARIOS_LINEA_USE_MOCK=$(Get-Env 'VITE_MS_HORARIOS_LINEA_USE_MOCK')"
    '--build-arg', "VITE_MS_HORARIOS_CAMPANA_REAL=$(Get-Env 'VITE_MS_HORARIOS_CAMPANA_REAL')"
    '--build-arg', "VITE_MS_HORARIOS_CAMPANA_MOCK=$(Get-Env 'VITE_MS_HORARIOS_CAMPANA_MOCK')"
    '--build-arg', "VITE_MS_HORARIOS_CAMPANA_USE_MOCK=$(Get-Env 'VITE_MS_HORARIOS_CAMPANA_USE_MOCK')"

    '--build-arg', "VITE_MS_MONITOR_LINEA_REAL=$(Get-Env 'VITE_MS_MONITOR_LINEA_REAL')"
    '--build-arg', "VITE_MS_MONITOR_LINEA_MOCK=$(Get-Env 'VITE_MS_MONITOR_LINEA_MOCK')"
    '--build-arg', "VITE_MS_MONITOR_LINEA_USE_MOCK=$(Get-Env 'VITE_MS_MONITOR_LINEA_USE_MOCK')"
    '--build-arg', "VITE_MS_MONITOR_CAMPANA_REAL=$(Get-Env 'VITE_MS_MONITOR_CAMPANA_REAL')"
    '--build-arg', "VITE_MS_MONITOR_CAMPANA_MOCK=$(Get-Env 'VITE_MS_MONITOR_CAMPANA_MOCK')"
    '--build-arg', "VITE_MS_MONITOR_CAMPANA_USE_MOCK=$(Get-Env 'VITE_MS_MONITOR_CAMPANA_USE_MOCK')"

    '--build-arg', "VITE_MS_REPORTES_LINEA_REAL=$(Get-Env 'VITE_MS_REPORTES_LINEA_REAL')"
    '--build-arg', "VITE_MS_REPORTES_LINEA_MOCK=$(Get-Env 'VITE_MS_REPORTES_LINEA_MOCK')"
    '--build-arg', "VITE_MS_REPORTES_LINEA_USE_MOCK=$(Get-Env 'VITE_MS_REPORTES_LINEA_USE_MOCK')"
    '--build-arg', "VITE_MS_REPORTES_CAMPANA_REAL=$(Get-Env 'VITE_MS_REPORTES_CAMPANA_REAL')"
    '--build-arg', "VITE_MS_REPORTES_CAMPANA_MOCK=$(Get-Env 'VITE_MS_REPORTES_CAMPANA_MOCK')"
    '--build-arg', "VITE_MS_REPORTES_CAMPANA_USE_MOCK=$(Get-Env 'VITE_MS_REPORTES_CAMPANA_USE_MOCK')"

    '--build-arg', "VITE_MS_REPORTES_ABC_LINEA_REAL=$(Get-Env 'VITE_MS_REPORTES_ABC_LINEA_REAL')"
    '--build-arg', "VITE_MS_REPORTES_ABC_LINEA_MOCK=$(Get-Env 'VITE_MS_REPORTES_ABC_LINEA_MOCK')"
    '--build-arg', "VITE_MS_REPORTES_ABC_LINEA_USE_MOCK=$(Get-Env 'VITE_MS_REPORTES_ABC_LINEA_USE_MOCK')"
    '--build-arg', "VITE_MS_REPORTES_ABC_CAMPANA_REAL=$(Get-Env 'VITE_MS_REPORTES_ABC_CAMPANA_REAL')"
    '--build-arg', "VITE_MS_REPORTES_ABC_CAMPANA_MOCK=$(Get-Env 'VITE_MS_REPORTES_ABC_CAMPANA_MOCK')"
    '--build-arg', "VITE_MS_REPORTES_ABC_CAMPANA_USE_MOCK=$(Get-Env 'VITE_MS_REPORTES_ABC_CAMPANA_USE_MOCK')"

    '--build-arg', "VITE_MS_REPORTES_RESPONSYS_LINEA_REAL=$(Get-Env 'VITE_MS_REPORTES_RESPONSYS_LINEA_REAL')"
    '--build-arg', "VITE_MS_REPORTES_RESPONSYS_LINEA_MOCK=$(Get-Env 'VITE_MS_REPORTES_RESPONSYS_LINEA_MOCK')"
    '--build-arg', "VITE_MS_REPORTES_RESPONSYS_LINEA_USE_MOCK=$(Get-Env 'VITE_MS_REPORTES_RESPONSYS_LINEA_USE_MOCK')"
    '--build-arg', "VITE_MS_REPORTES_RESPONSYS_CAMPANA_REAL=$(Get-Env 'VITE_MS_REPORTES_RESPONSYS_CAMPANA_REAL')"
    '--build-arg', "VITE_MS_REPORTES_RESPONSYS_CAMPANA_MOCK=$(Get-Env 'VITE_MS_REPORTES_RESPONSYS_CAMPANA_MOCK')"
    '--build-arg', "VITE_MS_REPORTES_RESPONSYS_CAMPANA_USE_MOCK=$(Get-Env 'VITE_MS_REPORTES_RESPONSYS_CAMPANA_USE_MOCK')"

    '--build-arg', "VITE_OKTA_ISSUER=$(Get-Env 'VITE_OKTA_ISSUER')"
    '--build-arg', "VITE_OKTA_CLIENT_ID=$(Get-Env 'VITE_OKTA_CLIENT_ID')"
    '--build-arg', "VITE_OKTA_REDIRECT_URI=$(Get-Env 'VITE_OKTA_REDIRECT_URI')"

    '-t', $Tag
    '.'
)

& docker @buildArgs
if ($LASTEXITCODE -ne 0) {
    Write-Error "docker build failed (exit $LASTEXITCODE)."
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Exporting image to: $TarFile" -ForegroundColor Cyan

docker save -o $TarFile $Tag
if ($LASTEXITCODE -ne 0) {
    Write-Error "docker save failed (exit $LASTEXITCODE)."
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "  Image : $Tag"
Write-Host "  File  : $(Join-Path (Get-Location) $TarFile)"