const CLIENT_ID = '625422208305-pou6inp02kuo8pvl7766h861pql5uhg5.apps.googleusercontent.com'; /* MASUKKAN_CLIENT_ID_KAMU*/
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly';

const folderMap = {
  kelompok1: '1EP6Fm36k2h9L66tEEII20f1mGtuku05R', /*FOLDER_ID_KELOMPOK1*/
  kelompok2: '1ERPVLQnLouhghFMtqKZvXaJOiywTRfK0', /*FOLDER_ID_KELOMPOK2*/
  kelompok3: '1ETB2g-bdzdJZgmtlgnsFXW86DFWF-ZbQ', /*FOLDER_ID_KELOMPOK3*/
  kelompok4: '1EYMxsvMECHEkI9ASrHw3K3H1MMNtpJeY'  /*FOLDER_ID_KELOMPOK4*/
};

function handleAuthClick() {
  gapi.load('client:auth2', () => {
    gapi.auth2.init({ client_id: CLIENT_ID }).then(() => {
      gapi.auth2.getAuthInstance().signIn().then(() => {
        gapi.client.load('drive', 'v3', () => {
          document.getElementById('uploadForm').style.display = 'block';
        });
      });
    });
  });
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

  const accessToken = gapi.auth.getToken().access_token;
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
  gapi.client.drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: 'files(id)',
    pageSize: 100
  }).then(response => {
    const count = response.result.files.length;
    if (count >= 6) {
      document.getElementById('status').innerText += `\n✅ ${group} SELESAI (${count} gambar).`;
    } else {
      document.getElementById('status').innerText += `\n📷 ${group} baru ${count} gambar.`;
    }
  }).catch(error => {
    console.error('Gagal mengecek jumlah file:', error);
  });
}
