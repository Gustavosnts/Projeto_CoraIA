const fs = require('fs');
const { webcrypto: w } = require('crypto');
const s = w.subtle;

const SENHA = '231451822991288131185231';
const MENSAGEM = `<p>Vocês conseguiram ultrapassar a primeira barreira, mas as respostas que procuram não estão neste computador. Os arquivos revelaram apenas o próximo caminho.</p><p>Saiam do sistema. Sigam as pistas. Encontrem o que foi deixado para trás. A partir de agora, a orientação será de vocês.</p><p class="alert">PROTOCOLO DE TREKKING INICIADO.</p><p>Boa sorte.</p><p class="sig">— CORA</p>`;

const b64 = a => Buffer.from(a).toString('base64');
async function chave(pw, salt) {
  const k = await s.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  return s.deriveKey({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, k,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
}
(async () => {
  const salt = w.getRandomValues(new Uint8Array(16)), iv = w.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await s.encrypt({ name: 'AES-GCM', iv }, await chave(SENHA.replace(/\D/g, ''), salt), new TextEncoder().encode(MENSAGEM)));
  const html = fs.readFileSync(__dirname + '/modelo.html', 'utf8')
    .replace('__SALT__', b64(salt)).replace('__IV__', b64(iv)).replace('__DATA__', b64(ct));
  fs.mkdirSync(__dirname + '/public', { recursive: true });
  fs.writeFileSync(__dirname + '/public/index.html', html);
  console.log('Pronto: public/index.html');
})();
