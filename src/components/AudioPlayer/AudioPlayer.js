import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay,
  faPause,
  faStop,
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
  faBackward,
  faForward,
  faShuffle,
  faRepeat,
  faMusic,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useApp } from '../../context/AppContext';
import './AudioPlayer.css';

const AudioPlayer = () => {
  const { state } = useApp();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeating]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const loadTrack = (track, trackPlaylist = []) => {
    setCurrentTrack(track);
    setPlaylist(trackPlaylist);
    setPlaylistIndex(trackPlaylist.findIndex(t => t.url === track.url));
    setIsVisible(true);
    
    const audio = audioRef.current;
    if (audio) {
      audio.src = track.url;
      audio.load();
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handlePrevious = () => {
    if (playlist.length === 0) return;
    
    let newIndex;
    if (isShuffled) {
      newIndex = Math.floor(Math.random() * playlist.length);
    } else {
      newIndex = playlistIndex > 0 ? playlistIndex - 1 : playlist.length - 1;
    }
    
    setPlaylistIndex(newIndex);
    loadTrack(playlist[newIndex], playlist);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    
    let newIndex;
    if (isShuffled) {
      newIndex = Math.floor(Math.random() * playlist.length);
    } else {
      newIndex = playlistIndex < playlist.length - 1 ? playlistIndex + 1 : 0;
    }
    
    setPlaylistIndex(newIndex);
    loadTrack(playlist[newIndex], playlist);
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    setIsRepeating(!isRepeating);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return faVolumeXmark;
    if (volume < 0.5) return faVolumeLow;
    return faVolumeHigh;
  };

  const closePlayer = () => {
    handleStop();
    setIsVisible(false);
    setCurrentTrack(null);
    setPlaylist([]);
  };

  if (!isVisible || !currentTrack) {
    return (
      <audio
        ref={audioRef}
        preload="metadata"
        style={{ display: 'none' }}
      />
    );
  }

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
      />
      <div className="audio-player">
        <div className="player-content">
          {/* Track Info */}
          <div className="track-info">
            <div className="track-icon">
              <FontAwesomeIcon icon={faMusic} />
            </div>
            <div className="track-details">
              <div className="track-title">{currentTrack.title || 'Unknown Track'}</div>
              <div className="track-artist">{currentTrack.artist || 'Unknown Artist'}</div>
            </div>
          </div>

          {/* Main Controls */}
          <div className="player-controls">
            <div className="control-buttons">
              {playlist.length > 1 && (
                <button 
                  className="control-btn"
                  onClick={handlePrevious}
                  title="Previous Track"
                >
                  <FontAwesomeIcon icon={faBackward} />
                </button>
              )}
              
              <button 
                className="play-btn"
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
              </button>
              
              <button 
                className="control-btn"
                onClick={handleStop}
                title="Stop"
              >
                <FontAwesomeIcon icon={faStop} />
              </button>

              {playlist.length > 1 && (
                <button 
                  className="control-btn"
                  onClick={handleNext}
                  title="Next Track"
                >
                  <FontAwesomeIcon icon={faForward} />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="progress-section">
              <span className="time-display">{formatTime(currentTime)}</span>
              <div 
                className="progress-bar"
                onClick={handleSeek}
              >
                <div 
                  className="progress-fill"
                  style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                ></div>
              </div>
              <span className="time-display">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Additional Controls */}
          <div className="player-extras">
            {playlist.length > 1 && (
              <>
                <button 
                  className={`control-btn ${isShuffled ? 'active' : ''}`}
                  onClick={toggleShuffle}
                  title="Shuffle"
                >
                  <FontAwesomeIcon icon={faShuffle} />
                </button>
                
                <button 
                  className={`control-btn ${isRepeating ? 'active' : ''}`}
                  onClick={toggleRepeat}
                  title="Repeat"
                >
                  <FontAwesomeIcon icon={faRepeat} />
                </button>
              </>
            )}

            <div className="volume-controls">
              <button 
                className="control-btn volume-btn"
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                <FontAwesomeIcon icon={getVolumeIcon()} />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                title="Volume"
              />
            </div>

            <button 
              className="control-btn close-btn"
              onClick={closePlayer}
              title="Close Player"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Export a function to control the audio player from other components
export const useAudioPlayer = () => {
  const audioPlayerRef = useRef();
  
  const playTrack = (track, playlist = []) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.loadTrack(track, playlist);
    }
  };

  return { playTrack };
};

export default AudioPlayer;