const API_KEY = 'AIzaSyBB6LqekrczFQlYz86Q3omCQxjqwF4f13k';
const folderIds = {
  kelompok1: '1EP6Fm36k2h9L66tEEII20f1mGtuku05R',
  kelompok2: '1ERPVLQnLouhghFMtqKZvXaJOiywTRfK0',
  kelompok3: '1ETB2g-bdzdJZgmtlgnsFXW86DFWF-ZbQ',
  kelompok4: '1EYMxsvMECHEkI9ASrHw3K3H1MMNtpJeY'
};

let accessToken = '';

function handleCredentialResponse(response) {
  console.log("Login berhasil. JWT Token:", response.credential);

  document.querySelector(".g_id_signin").style.display = "none";
  document.getElementById("uploadArea").style.display = "block";

  gapi.load('client', () => {
    gapi.client.init({
      apiKey: API_KEY
    }).then(() => {
      google.accounts.id.disableAutoSelect();
      google.accounts.oauth2.initTokenClient({
        client_id: 'YOUR_CLIENT_ID',
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (tokenResponse) => {
          accessToken = tokenResponse.access_token;
          console.log('Access Token:', accessToken);
        }
      }).requestAccessToken();
    });
  });
}

function uploadToDrive() {
  const file = document.getElementById("fileInput").files[0];
  const group = document.getElementById("groupSelector").value;
  const folderId = folderIds[group];

  if (!file || !folderId) {
    alert("Pilih kelompok dan file terlebih dahulu.");
    return;
  }

  const metadata = {
    name: file.name,
    parents: [folderId]
  };

  const form = new FormData();
  const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  form.append("metadata", blob);
  form.append("file", file);

  fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: new Headers({ "Authorization": "Bearer " + accessToken }),
    body: form
  })
  .then(res => res.json())
  .then(val => {
    document.getElementById("status").textContent = "Upload berhasil!";
    console.log("Uploaded:", val);
  })
  .catch(err => {
    document.getElementById("status").textContent = "Upload gagal!";
    console.error("Upload error:", err);
  });
}
