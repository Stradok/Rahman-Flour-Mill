; Inno Setup Script for Flour Mill Management System
; Generated: July 2024
; This script creates a Windows installer that bundles Node.js + Next.js app

#define MyAppName "Al Rehman Flour Mills"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "Al Rehman Flour Mills"
#define MyAppURL "https://github.com/Stradok/Rahman-Flour-Mill"
#define MyAppExeName "FlourMill.exe"
#define SourceDir "C:\path\to\flour-mill"

[Setup]
AppId={{3D2C65F5-E5E9-4E4B-8F5F-5C5E5C5C5C5C}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\FlourMill
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
LicenseFile=LICENSE
OutputDir=Output
OutputBaseFilename=FlourMill-Setup-v{#MyAppVersion}
SetupIconFile=public\icon.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\FlourMill.exe
PrivilegesRequired=lowest
ChangesAssociations=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunch"; Description: "Create Start Menu shortcut"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
; Node.js Runtime (pre-downloaded and placed in .node-runtime folder)
Source: ".node-runtime\*"; DestDir: "{app}\node_runtime"; Flags: ignoreversion recursesubdirs createallsubdirs

; Next.js Build Output
Source: ".next\*"; DestDir: "{app}\.next"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "public\*"; DestDir: "{app}\public"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "package-lock.json"; DestDir: "{app}"; Flags: ignoreversion

; Runtime dependencies — next start cannot run without these
Source: "node_modules\*"; DestDir: "{app}\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "server.js"; DestDir: "{app}"; Flags: ignoreversion
; Holds AUTH_SECRET — create .env on the build laptop before compiling
Source: ".env"; DestDir: "{app}"; Flags: ignoreversion

; Launcher Script
Source: "launcher.vbs"; DestDir: "{app}"; Flags: ignoreversion

; License
Source: "LICENSE"; DestDir: "{app}"; Flags: ignoreversion

; README
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\launcher.vbs"; IconFileName: "{app}\public\icon.ico"; Comment: "Flour Mill Management System"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\launcher.vbs"; IconFileName: "{app}\public\icon.ico"; Tasks: desktopicon
Name: "{userstartmenu}\Programs\{#MyAppName}"; Filename: "{app}\launcher.vbs"; Tasks: quicklaunch

[Run]
Filename: "{app}\launcher.vbs"; Description: "Launch {#MyAppName}"; Flags: nowait postinstall skipifsilent

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
end;

procedure InitializeUninstall();
begin
  // Kill any running node processes
  Exec('taskkill.exe', '/IM node.exe /F', '', SW_HIDE, ewWaitUntilTerminated);
end;
