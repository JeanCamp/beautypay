@echo off
echo Abrindo porta 3000 no firewall do Windows...
echo.

netsh advfirewall firewall add rule name="BeautyPay Node.js" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="BeautyPay Node.js" dir=out action=allow protocol=TCP localport=3000

echo.
echo Porta 3000 aberta com sucesso!
echo.
pause
