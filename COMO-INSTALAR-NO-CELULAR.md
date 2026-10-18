# Como instalar o BeautyPay no celular

## O que é PWA?
PWA (Progressive Web App) transforma o site em um aplicativo instalável no celular, funcionando como um app normal, sem precisar da App Store ou Play Store!

## Como instalar no Android (Chrome)

1. Abra o Chrome no celular
2. Acesse o site: `http://192.168.1.44:3000`
3. Toque no menu (três pontinhos no canto superior direito)
4. Selecione "Adicionar à tela inicial" ou "Instalar aplicativo"
5. Confirme tocando em "Adicionar" ou "Instalar"
6. Pronto! O ícone do BeautyPay aparecerá na tela inicial como um app normal

## Como instalar no iPhone (Safari)

1. Abra o Safari no iPhone
2. Acesse o site: `http://192.168.1.44:3000`
3. Toque no botão de compartilhar (quadrado com seta para cima)
4. Role para baixo e selecione "Adicionar à Tela de Início"
5. Toque em "Adicionar"
6. Pronto! O ícone do BeautyPay aparecerá na tela inicial como um app normal

## Requisitos

### Para funcionar no celular:
1. ✅ O computador e o celular devem estar na mesma rede Wi-Fi
2. ✅ O servidor deve estar rodando no computador (execute `iniciar.bat`)
3. ✅ Use o IP da rede local, não `localhost`

### IP para usar no celular:
- **IP atual do computador:** `192.168.1.44`
- **URL no celular:** `http://192.168.1.44:3000`

### Se o IP mudar:
1. Abra o Prompt de Comando no computador
2. Digite: `ipconfig`
3. Procure por "IPv4 Address" no adaptador "Ethernet"
4. Use esse novo IP no celular

## Funcionalidades do App
- ✅ Ícone na tela inicial como app nativo
- ✅ Tela cheia sem barra de endereço
- ✅ Funciona como aplicativo normal
- ✅ Funciona offline (após primeiro acesso)
- ✅ Dados salvos no celular (localStorage)
- ✅ Atualiza automaticamente quando há novas versões

## Importante
- O computador precisa estar ligado e com o servidor rodando para usar o app
- Para usar sem computador, seria necessário hospedar na nuvem (Vercel, Netlify, etc.)
- Os dados ficam salvos no celular, não são compartilhados entre dispositivos
