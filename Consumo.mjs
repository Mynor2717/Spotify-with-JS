/* Las terminales de la api par la funcion de los estados */

/*
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const client_id = '';
const client_secret = '';
const refresh_token = '';
*/

/*const ApiController = (function() {
    const clientId = '';
    const clientSecret = '';

    const getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
               'Content-Type' : 'application/x-www-form-urlencoded',
               'Authorization' : 'Basic' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });
        const data = await result.json();
        return data.access_token;
    }

   const _getGenres = async (token) => {
    const result = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      method: 'GET',
      headers: {'Authorization' : 'Bearer' + token}
    });
    const data = await result.json();
     
   }

})();

*/
const client_id = '';
const client_secret = '';
const refresh_token = '';

let access_token;

function getAccessToken() {
  return fetch(`https://accounts.spotify.com/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${client_id}:${client_secret}`)
    },
    body: 'grant_type=refresh_token&refresh_token=' + refresh_token
  })
  .then(response => response.json())
  .then(data => {
    access_token = data.access_token;
    setTimeout(getAccessToken, (data.expires_in - 60) * 1000); // Refresh token 60 seconds before it expires
    return access_token;
  })
  .catch(error => {
    console.error(error);
    document.querySelector('.hey').innerHTML = 'Error fetching song information';
  });
}

function getSongInfo() {
  return fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  })
  .then(response => {
    if (response.status === 204) {
      // If there is no currently playing track, get the most recently played track instead
      return fetch('https://api.spotify.com/v1/me/player/recently-played', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data && data.items.length > 0) {
          const lastPlayed = data.items[0].track;
          return {
            songName: lastPlayed.name,
            songArtist: lastPlayed.artists[0].name,
            songImageUrl: lastPlayed.album.images[0].url,
            songUrl: lastPlayed.external_urls.spotify
          };
        } else {
          // If there are no recently played tracks either, show an error message
          throw new Error('No recently played tracks found');
        }
      });
    } else {
      return response.json()
      .then(data => {
        return {
          songName: data.item.name,
          songArtist: data.item.artists[0].name,
          songImageUrl: data.item.album.images[0].url,
          songUrl: data.item.external_urls.spotify
        };
      });
    }
  })
  .catch(error => {
    console.error(error);
    document.querySelector('.hey').innerHTML = 'Offline';
  });
}

function updateSongInfo() {
  getAccessToken()
  .then(() => {
    return getSongInfo();
  })
  .then(songInfo => {
    const songHtml = `
      <a class="hello" href="${songInfo.songUrl}" target="_blank" style="display: flex; align-items: center;">
        <img class="FOTO" src="${songInfo.songImageUrl}" alt="${songInfo.songName} album cover" width="220px" height="310px" style="margin-right: 5px;">
        <div class="Letra" style="display: flex; flex-direction: column; justify-content: center; line-height: 1.2;">
          <span class="Info" style="font-weight: bold;">${songInfo.songName}</span>
          <span class="Titu" style="font-size: 30px;" >${songInfo.songArtist}</span>
          
        </div>
        <img src="/soundbar.gif" class="Flu">
      </a>`;
    document.querySelector('.hey').innerHTML = songHtml;
    setTimeout(updateSongInfo, 10000); // Update every 10 seconds
  });
}

updateSongInfo();
