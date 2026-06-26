@echo off
setlocal

set "MAVEN_HOME=%~dp0.tools\apache-maven-3.9.16"

if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
  echo Maven local nao encontrado em "%MAVEN_HOME%".
  echo Baixe ou extraia o Apache Maven local antes de executar este comando.
  exit /b 1
)

call "%MAVEN_HOME%\bin\mvn.cmd" %*
