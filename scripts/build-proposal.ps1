$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$docsPath = Join-Path $projectRoot 'Docs'
$buildPath = Join-Path $docsPath '.build\proposal'
$jobName = '16_24127261_24127542_24127581_PROPOSAL'
$compiler = Get-Command xelatex -ErrorAction Stop
$jobOption = if ($compiler.Source -match '(?i)miktex') { "--job-name=$jobName" } else { "--jobname=$jobName" }
New-Item -ItemType Directory -Path $buildPath -Force | Out-Null
Push-Location -LiteralPath $docsPath
try {
    for ($pass = 1; $pass -le 3; $pass++) {
        $consoleLog = Join-Path $buildPath "console-pass-$pass.log"
        $ErrorActionPreference = 'Continue'
        & $compiler.Source '--interaction=nonstopmode' '--halt-on-error' '--file-line-error' '--no-shell-escape' "--output-directory=$buildPath" $jobOption 'thuyet_minh.tex' *> $consoleLog
        $compilerExitCode = $LASTEXITCODE
        $ErrorActionPreference = 'Stop'
        if ($compilerExitCode -ne 0) {
            Get-Content -LiteralPath $consoleLog -Tail 35
            throw "XeLaTeX failed on pass $pass. See $consoleLog"
        }
    }
    $builtPdf = Join-Path $buildPath "$jobName.pdf"
    $outputPdf = Join-Path $docsPath "$jobName.pdf"
    Copy-Item -LiteralPath $builtPdf -Destination $outputPdf -Force
    Write-Output "Built: $outputPdf"
} finally { Pop-Location }
