// Script to show all redirect URIs needed for Auth0 + Google setup

console.log('🔧 CycleConnect Redirect URI Configuration');
console.log('=' .repeat(50));

console.log('\n📱 FOR AUTH0 APPLICATION SETTINGS:');
console.log('Go to: https://dev-lwik063shdh4q48o.us.auth0.com/dashboard');
console.log('Navigate: Applications → Applications → CycleConnect → Settings');
console.log('Add to "Allowed Callback URLs":');
console.log('   exp://localhost:8081/--/auth');
console.log('   exp://192.168.1.100:8081/--/auth');  // Replace with your actual IP
console.log('   cycleconnect://auth');

console.log('\n🌐 FOR GOOGLE CLOUD CONSOLE:');
console.log('Go to: https://console.cloud.google.com/');
console.log('Navigate: APIs & Services → Credentials → Your OAuth Client');
console.log('Add to "Authorized redirect URIs":');
console.log('   https://dev-lwik063shdh4q48o.us.auth0.com/login/callback');

console.log('\n🔍 TROUBLESHOOTING:');
console.log('1. Make sure Google Client ID/Secret are set in Auth0');
console.log('2. Make sure Google connection is enabled in Auth0');
console.log('3. Check console logs for actual redirect URI being used');

console.log('\n✅ After configuration:');
console.log('1. Save all changes');
console.log('2. Wait 1-2 minutes for propagation');
console.log('3. Test Google login again'); 