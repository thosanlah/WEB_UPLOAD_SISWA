const CLIENT_ID = '625422208305-pou6inp02kuo8pvl7766h861pql5uhg5.apps.googleusercontent.com';

const folderMap = {
  kelompok1: '1EP6Fm36k2h9L66tEEII20f1mGtuku05R',
  kelompok2: '1ERPVLQnLouhghFMtqKZvXaJOiywTRfK0',
  kelompok3: '1ETB2g-bdzdJZgmtlgnsFXW86DFWF-ZbQ',
  kelompok4: '1EYMxsvMECHEkI9ASrHw3K3H1MMNtpJeY'
};

let accessToken = '';

function handleCredentialResponse(response) {
  console.log("Login berhasil. JWT Token:", response.credential);

  google.accounts.oauth2.tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly',
    callback: (tokenResponse) => {
      accessToken = tokenResponse.access_token;
      document.getElementById('uploadForm').style.display = 'block';
    }
  });

  google.accounts.oauth2.tokenClient.requestAccessToken();
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const group = document.getElementById('groupSelect').value;
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!group || !file) return;

  document.getElementById('status').innerText = '⏳ Mengupload...';

  const metadata = {
    name: file.name,
    parents: [folderMap[group]]
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  try {
    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
      method: 'POST',
      headers: new Headers({ Authorization: 'Bearer ' + accessToken }),
      body: form
    });

    if (uploadRes.ok) {
      document.getElementById('status').innerText = `✅ Gambar berhasil diupload ke ${group}. Mengecek jumlah gambar...`;
      checkFolderImageCount(folderMap[group], group);
    } else {
      document.getElementById('status').innerText = '❌ Gagal upload.';
    }
  } catch (error) {
    console.error(error);
    document.getElementById('status').innerText = '❌ Error saat mengupload.';
  }

  fileInput.value = '';
});

function checkFolderImageCount(folderId, group) {
  fetch(\`https://www.googleapis.com/drive/v3/files?q='\${folderId}'+in+parents+and+mimeType+contains+'image/'+and+trashed=false&fields=files(id)&pageSize=100\`, {
    headers: {
      Authorization: \`Bearer \${accessToken}\`
    }
  })
  .then(res => res.json())
  .then(data => {
    const count = data.files.length;
    if (count >= 6) {
      document.getElementById('status').innerText += `\n✅ \${group} SELESAI (\${count} gambar).`;
    } else {
      document.getElementById('status').innerText += `\n📷 \${group} baru \${count} gambar.`;
    }
  })
  .catch(err => console.error('Gagal hitung file:', err));
}
