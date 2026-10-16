/** Helper kecil untuk POST JSON ke API internal. */
export async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!res.ok) {
    throw new Error(data?.error || 'Gagal memproses permintaan.');
  }
  if (!data) {
    throw new Error('Server tidak mengirim data. Coba lagi, ya.');
  }
  return data;
}
