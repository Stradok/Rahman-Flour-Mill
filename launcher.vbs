' Flour Mill Management System Launcher
' This script starts the Node.js server and opens Microsoft Edge in app mode

Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objShell = CreateObject("WScript.Shell")

' Get the installation directory
appDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
nodeExe = appDir & "\node_runtime\node.exe"
packageJson = appDir & "\package.json"
port = 3000
localhost = "http://localhost:" & port

' Verify Node.js exists
If Not objFSO.FileExists(nodeExe) Then
  MsgBox "Error: Node.js runtime not found at " & nodeExe, vbCritical, "Flour Mill - Startup Error"
  WScript.Quit 1
End If

' Verify package.json exists
If Not objFSO.FileExists(packageJson) Then
  MsgBox "Error: Application files not found at " & appDir, vbCritical, "Flour Mill - Startup Error"
  WScript.Quit 1
End If

' Kill any existing Node processes to avoid port conflicts
objShell.Run "taskkill.exe /IM node.exe /F", 0, True

' Wait a moment for cleanup
WScript.Sleep 500

' Start Node.js server silently in the app directory
' The server runs the Next.js app built with: npm run build
Set objProcess = objShell.Exec("cmd.exe /c cd /d """ & appDir & """ && """ & nodeExe & """ server.js")

' Wait for server to start (give it 3 seconds)
WScript.Sleep 3000

' Check if Node process is still running
Set objWMI = GetObject("winmgmts:")
Set colProcesses = objWMI.ExecQuery("SELECT * FROM Win32_Process WHERE Name = 'node.exe'")

If colProcesses.Count = 0 Then
  MsgBox "Error: Failed to start application server. Please check installation.", vbCritical, "Flour Mill - Startup Error"
  WScript.Quit 1
End If

' Find Microsoft Edge
edgePaths = Array( _
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe", _
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", _
  "C:\Users\" & objShell.ExpandEnvironmentStrings("%USERNAME%") & "\AppData\Local\Microsoft\Edge\Application\msedge.exe" _
)

edgeFound = False
For Each edgePath In edgePaths
  If objFSO.FileExists(edgePath) Then
    edgeFound = True
    Exit For
  End If
Next

' Fallback to system PATH if not found
If Not edgeFound Then
  edgePath = "msedge.exe"
End If

' Open Edge in app mode (no address bar, tabs, etc.)
objShell.Run """" & edgePath & """ --app=" & localhost & " --no-first-run --no-default-browser-check", 1, False

WScript.Sleep 500

' Keep VBScript running to maintain server process
' This prevents the server from shutting down when the script exits
Dim keepAlive
keepAlive = True

While keepAlive
  ' Check if Edge window still exists
  Set allProcesses = objWMI.ExecQuery("SELECT * FROM Win32_Process WHERE Name = 'msedge.exe'")

  If allProcesses.Count = 0 Then
    ' User closed Edge, shutdown Node server
    objShell.Run "taskkill.exe /IM node.exe /F", 0, True
    keepAlive = False
  End If

  WScript.Sleep 1000
End While

' Cleanup on exit
objShell.Run "taskkill.exe /IM node.exe /F", 0, True
WScript.Quit 0
