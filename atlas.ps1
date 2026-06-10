#!/usr/bin/env pwsh
#requires -Version 5.1

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet("status", "sense", "plan", "verify", "remember", "handoff", "evaluate")]
    [string]$Action = "status",
    [string]$Mode = "jarvis",
    [string]$Config = "C:\Programming\portfolio\workflow.config.json",
    [ValidateSet("text", "json")]
    [string]$Format = "text",
    [string]$Out,
    [string]$Intent = "",
    [string]$SessionPath = "",
    [string]$Scope = "agents",
    [switch]$Apply
)

$script = Join-Path $PSScriptRoot "tools\atlas\atlas.ps1"
& $script -Action $Action -Mode $Mode -Config $Config -Format $Format -Out $Out -Intent $Intent -SessionPath $SessionPath -Scope $Scope -Apply:$Apply
exit $LASTEXITCODE
