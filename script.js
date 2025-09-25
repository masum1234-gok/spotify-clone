console.log('running...');
let songs;
let folder = 'jolla'; // Default folder name, change as needed

function secondsToMinutes(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

let audio = new Audio();

async function getsongs(folder) {
    let a = await fetch(`http://127.0.0.1:3000/song/${folder}/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    let song = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            song.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    return song;
}

const playMusic = (track) => {
    audio.src = `http://127.0.0.1:3000/song/${folder}/` + encodeURIComponent(track);
    let plyingSong = document.getElementById('plyingSong');
    plyingSong.innerHTML = track.replace(/%20/g, ' ').replace(/\.mp3$/, '').slice(0, -10);
    audio.play();
}

function setupVolumeControl() {
    const volumeControl = document.getElementById('volume');
    const volumeLabel = document.getElementById('volume-label');
    
    // Set initial volume
    audio.volume = volumeControl.value;
    volumeLabel.textContent = `Volume: ${Math.round(audio.volume * 100)}%`;
    
    // Update volume in real-time
    volumeControl.addEventListener('input', function() {
        audio.volume = this.value;
        const volumePercent = Math.round(this.value * 100);
        volumeLabel.textContent = `Volume: ${volumePercent}%`;
        if (this.value == 0) {
            volumeLabel.textContent = 'Volume: Muted';
        }
    });
    
    // Sync volume when changed through other means
    audio.addEventListener('volumechange', function() {
        volumeControl.value = audio.volume;
        const volumePercent = Math.round(audio.volume * 100);
        volumeLabel.textContent = `Volume: ${volumePercent}%`;
        if (audio.volume == 0) {
            volumeLabel.textContent = 'Volume: Muted';
        }
    });
}

async function main() {
    // Get references to controls
    const play = document.getElementById('play');
    const plyingSong = document.getElementById('plyingSong');
    const plyingTime = document.getElementById('plyingTime');
    const previous = document.getElementById('previous');
    const next = document.getElementById('next');
    // If you have a rightline element, select it here
    // const rightline = document.getElementById('rightline');

    songs = await getsongs(folder);
    let songul = document.querySelector('.SongList').getElementsByTagName('ol')[0];

    for (const song of songs) {
        songul.innerHTML += `<li>
            <div class="song">
                <img src="photos/svg/music.svg" alt="">
                <div class="songaria">
                    <div class="songnam">${song.replaceAll('%20', ' ')}</div>
                    <div class="artis">masum</div>
                </div>
                <img id="playson" src="photos/svg/aflka.svg">
            </div>
        </li>`;
    }

    audio.src = `http://127.0.0.1:3000/song/${folder}/` + encodeURIComponent(songs[0]);

    audio.addEventListener('loadeddata', () => {
        let duration = audio.duration;
        let songTitle = decodeURI(decodeURI(audio.src).split(`/song/${folder}/`)[1]).replaceAll('.mp3', '').replace(/%20/g, ' ').slice(0, -10);
        plyingSong.innerHTML = songTitle;
    });

    Array.from(document.querySelector(".SongList").getElementsByTagName('li')).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector('.songnam').innerHTML);
            play.src = "photos/svg/pause.svg";
        });
    });

    play.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            play.src = "photos/svg/pause.svg";
        } else {
            audio.pause();
            play.src = "photos/svg/pmajplay.svg";
        }
    });

    audio.addEventListener('timeupdate', () => {
        let timeDisplay = `${secondsToMinutes(audio.currentTime)}/${secondsToMinutes(audio.duration)}`;
        plyingTime.innerHTML = timeDisplay;
        document.querySelector('.runtime').style.left = (audio.currentTime / audio.duration * 100) + '%';
    });

    document.querySelector('.sikbar').addEventListener('click', e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector('.runtime').style.left = percent + '%';
        audio.currentTime = (audio.duration * percent) / 100;
    });

    previous.addEventListener('click', () => {
        let currentIndex = songs.indexOf(decodeURIComponent(audio.src.split(`/song/${folder}/`)[1]));
        let prevIndex = currentIndex > 0 ? currentIndex - 1 : songs.length - 1;
        playMusic(songs[prevIndex]);
        play.src = "photos/svg/pause.svg";
    });

    next.addEventListener('click', () => {
        let currentIndex = songs.indexOf(decodeURIComponent(audio.src.split(`/song/${folder}/`)[1]));
        let nextIndex = (currentIndex + 1) % songs.length;
        playMusic(songs[nextIndex]);
        play.src = "photos/svg/pause.svg";
    });

    // Initialize volume control
    setupVolumeControl();

    // If you have a rightline element, uncomment and use this:
    rightline.addEventListener('click', () => {
        const bamElement = document.querySelector('.bam');
        const currentLeft = parseInt(getComputedStyle(bamElement).left);
        if (currentLeft === 0) {
            bamElement.style.left = "-100%";
        } else {
            bamElement.style.left = "0";
        }
    });

    
}

main();