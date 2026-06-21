@echo off
REM ============================================================
REM  Maven Wrapper - StudyHub Backend
REM  Dùng Maven có sẵn trong IntelliJ IDEA để tránh lỗi
REM  encoding trên đường dẫn tiếng Việt (Windows).
REM ============================================================

SET INTELLIJ_MAVEN="C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd"

IF EXIST %INTELLIJ_MAVEN% (
    %INTELLIJ_MAVEN% %*
    EXIT /B %ERRORLEVEL%
)

REM Fallback: thử mvn trên PATH hệ thống
WHERE mvn >nul 2>nul
IF %ERRORLEVEL% EQU 0 (
    mvn %*
    EXIT /B %ERRORLEVEL%
)

echo.
echo [ERROR] Khong tim thay Maven!
echo Vui long cai dat IntelliJ IDEA hoac them mvn vao PATH he thong.
echo.
EXIT /B 1
