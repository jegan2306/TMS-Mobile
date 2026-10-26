const qrcode = require('qrcode-terminal');
const os = require('os');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '10.131.139.46';
}

const localIp = getLocalIp();
const expoUrl = `exp://${localIp}:8081`;

console.log('\n======================================================');
console.log('📱 TMS MOBILE - REACT NATIVE EXPO GO QR CODE');
console.log('======================================================');
console.log(`Detected LAN IP : ${localIp}`);
console.log(`Expo URL        : ${expoUrl}\n`);

qrcode.generate(expoUrl, { small: true }, (qr) => {
  console.log(qr);
});

console.log('------------------------------------------------------');
console.log('📱 HOW TO OPEN ON MOBILE (EXPO GO):');
console.log('1. Connect Mobile & Laptop to SAME Wi-Fi or Hotspot.');
console.log('2. Open EXPO GO app on Android or iOS.');
console.log('3. Tap "Scan QR code" and scan the code above, OR');
console.log(`   tap "Enter URL manually" and enter: ${expoUrl}`);
console.log('======================================================\n');
