# Git 자동 동기화 스크립트 (Auto-Sync)
param(
    [switch]$Loop,
    [int]$IntervalSeconds = 180
)

$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if ($gitCmd) {
    $gitExe = $gitCmd.Source
} elseif (Test-Path "C:\Users\cmc\AppData\Local\GitHubDesktop\app-3.6.5\resources\app\git\cmd\git.exe") {
    $gitExe = "C:\Users\cmc\AppData\Local\GitHubDesktop\app-3.6.5\resources\app\git\cmd\git.exe"
} else {
    $gitExe = "git"
}

function Sync-Git {
    $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$now] GitHub 동기화 시작..." -ForegroundColor Cyan
    
    # 1. 원격 변경사항 가져오기 (fetch)
    try {
        & $gitExe fetch origin 2>$null
        $localCommit = (& $gitExe rev-parse HEAD 2>$null)
        $remoteCommit = (& $gitExe rev-parse origin/main 2>$null)
        
        if ($localCommit -and $remoteCommit -and ($localCommit.Trim() -ne $remoteCommit.Trim())) {
            Write-Host "[$now] 원격 최신 변경사항을 다운로드(pull)합니다..." -ForegroundColor Yellow
            & $gitExe pull --rebase origin main
        }
    } catch {
        Write-Host "[$now] 원격 저장소 확인 대기 중..." -ForegroundColor Gray
    }
    
    # 2. 로컬 변경사항 확인 및 푸시 (commit & push)
    $status = & $gitExe status --porcelain
    if ($status) {
        Write-Host "[$now] 로컬 변경사항 발견! GitHub로 자동 업로드(push)합니다..." -ForegroundColor Magenta
        & $gitExe add -A
        $commitMsg = "auto: 건강보험 스마트 리모델링 업데이트 ($(Get-Date -Format 'yyyy-MM-dd HH:mm'))"
        & $gitExe commit -m $commitMsg
        
        try {
            & $gitExe push -u origin main
            Write-Host "[$now] GitHub 업로드 완료!" -ForegroundColor Green
        } catch {
            Write-Host "[$now] 푸시 실패: 원격 저장소(GitHub) 설정을 확인해 주세요." -ForegroundColor Red
        }
    } else {
        Write-Host "[$now] 로컬 변경사항 없음 (작업 트리 깨끗함)" -ForegroundColor Gray
    }
}

if ($Loop) {
    Write-Host "=== Git 백그라운드 자동 동기화 시작 ($IntervalSeconds 초 주기) ===" -ForegroundColor Green
    Write-Host "종료하려면 Ctrl + C 를 누르세요." -ForegroundColor Gray
    while ($true) {
        Sync-Git
        Start-Sleep -Seconds $IntervalSeconds
    }
} else {
    Sync-Git
}
