<#
Author : M.Mirjani
version 1.0.0
Note : Please read and review the source code completely before running it.
#>
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm run build با خطا مواجه شد" -ForegroundColor Red
    exit 1
}


# Change this part of the code according to your module information. ===============
$YourModuleName = "ProposalSharePoint"
$yourBuildFolderName  = "dist"
$YourLocalBuildLocation = ".\$yourBuildFolderName"
$YourSharePointFolder = "\\192.168.100.27\C$\Program Files\Common Files\microsoft shared\Web Server Extensions\16\TEMPLATE\LAYOUTS\$YourModuleName"
# Change this part of the code according to your module information. ===============



# Do not change this part of the code. ====================
$ServerIP = "192.168.100.27"
$Username = "epm\epmserver20"
$Password = "Test@EPM#Gav2022"
$SecurePassword = ConvertTo-SecureString $Password -AsPlainText -Force
$Credential = New-Object System.Management.Automation.PSCredential ($Username, $SecurePassword)
$PersianCalendar = New-Object System.Globalization.PersianCalendar
$Now = Get-Date
$Year = $PersianCalendar.GetYear($Now)
$Month = $PersianCalendar.GetMonth($Now).ToString("00")
$Day = $PersianCalendar.GetDayOfMonth($Now).ToString("00")
$PersianDate = "$Year-$Month-$Day"
$InstallPath = "TempDrive:\Users\epmserver20\Desktop\Installs\$YourModuleName"
# Do not change this part of the code. ====================




$AllSucceeded = $true

try {
    # Test connection
    if (-not (Test-Connection -ComputerName $ServerIP -Count 1 -Quiet)) { 
        throw "Server $ServerIP is not reachable"
    }

    # Connect to server drive
    New-PSDrive -Name "TempDrive" -PSProvider FileSystem -Root "\\192.168.100.27\C$" -Credential $Credential -ErrorAction Stop 

    # Create folder if not exists
    if (-not (Test-Path $InstallPath)) { 
        New-Item -Path $InstallPath -ItemType Directory -Force | Out-Null 
    }

    # Create dated folder
    $TargetPath = "$InstallPath\$PersianDate" 
    if (-not (Test-Path $TargetPath)) { 
        New-Item -Path $TargetPath -ItemType Directory -Force | Out-Null 
    }

    # Move dist to temporary
    $TempDestinationPath = "$TargetPath\$yourBuildFolderName " 
    if (Test-Path $TempDestinationPath) { 
        Remove-Item -Path $TempDestinationPath -Recurse -Force 
    }
    Copy-Item -Path $YourLocalBuildLocation -Destination $TargetPath -Recurse -Force 

    # Connect to final destination
    New-PSDrive -Name "FinalDrive" -PSProvider FileSystem -Root $YourSharePointFolder -Credential $Credential -ErrorAction Stop 

    # Remove old dist if exists
    $FinalDistPath = "FinalDrive:\$yourBuildFolderName " 
    if (Test-Path $FinalDistPath) { 
        Remove-Item -Path $FinalDistPath -Recurse -Force 
    }

    # Copy new dist
    Copy-Item -Path $TempDestinationPath -Destination "FinalDrive:\" -Recurse -Force 

}
catch {
    $AllSucceeded = $false
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    if (Get-PSDrive -Name "TempDrive" -ErrorAction SilentlyContinue) { 
        Remove-PSDrive -Name "TempDrive" -Force 
    }
    if (Get-PSDrive -Name "FinalDrive" -ErrorAction SilentlyContinue) { 
        Remove-PSDrive -Name "FinalDrive" -Force 
    }

    if ($AllSucceeded) {
        Write-Host "✅ Operation completed successfully" -ForegroundColor Green
    }
}

