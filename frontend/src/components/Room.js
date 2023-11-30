import React, { Component } from 'react';
import { 
    Grid, 
    Button, 
    Typography
} from "@mui/material"
import CreateRoomPage from './CreateRoomPage';
import MusicPlayer from './MusicPlayer';

export default class Room extends Component {
    constructor(props){
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,
            spotifyAuthenticaed: false,
            song: {},
        };
        this.roomCode = this.props.match.params.roomCode;
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
        this.updateShowSettings = this.updateShowSettings.bind(this);
        this.renderSettingsButton = this.renderSettingsButton.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.getRoomDetails = this.getRoomDetails.bind(this);
        this.authenticateSpotify = this.authenticateSpotify.bind(this);
        this.getCurrentSong = this.getCurrentSong.bind(this);
        this.getRoomDetails();
    }

    // use polling to request information every second, not the best way but should be fine for up to 50,000 users (spotify not have websockets)
    componentDidMount() {
      this.interval = setInterval(this.getCurrentSong, 1000); // 1000 ms = 1 sec
    }

    componentWillUnmount() {
      clearInterval(this.interval);
    }

    async getRoomDetails() {
        return fetch("/api/get-room" + "?code=" + this.roomCode)
          .then((response) => {
            if (!response.ok) {
              this.props.leaveRoomCallback();
              this.props.history.push("/");
            }
            return response.json();
          })
          .then((data) => {
            this.setState({
              votesToSkip: data.votes_to_skip,
              guestCanPause: data.guest_can_pause,
              isHost: data.is_host,
            });
            if (this.state.isHost){
              // Log into spotify if Host
              this.authenticateSpotify();
            }
            
          });
      }

    authenticateSpotify() {
      fetch("/spotify/is-authenticated") // from backend
        .then((response) => response.json())
        .then((data) => {
          this.setState({ spotifyAuthenticated: data.status });
          console.log(data.status);
          if (!data.status) { // if not authenticated, fetch url to log in
            fetch("/spotify/get-auth-url")
              .then((response) => response.json())
              .then((data) => {
                window.location.replace(data.url); // another way to do redirect to Spotify auth page, native JS
              });
          }
        });
    }

    getCurrentSong() {
      fetch("/spotify/current-song")
        .then((response) => {
          if (!response.ok) {
            return {
              "title": "No Song Playing",
              "artist": "",
              "duration": 0,
              "time": 0,
              "image_url": "https://cdn0.iconfinder.com/data/icons/audio-vol-1b/100/1-41-512.png",
              "is_playing": false,
              "votes": 0,
              "votes_required": 0,
              "id": ""
            };
          } else {
            return response.json();
          }
        })
        .then((data) => {
          this.setState({ song: data });
          console.log(data);
        });
    }  

    leaveButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        };
        fetch('/api/leave-room', requestOptions).then((_response) => {
            this.props.leaveRoomCallback();
            this.props.history.push('/');
        });
    }

    updateShowSettings(value){
        this.setState({
            showSettings: value,
        });
    }

    // only show settings button for host
    renderSettings() {
        return (
          <Grid container spacing={1}>
            <Grid item xs={12} align="center">
              <CreateRoomPage
                update={true}
                votesToSkip={this.state.votesToSkip}
                guestCanPause={this.state.guestCanPause}
                roomCode={this.roomCode}
                updateCallback={this.getRoomDetails}
              />
            </Grid>
            <Grid item xs={12} align="center">
              <Button
                variant="contained"
                color="secondary"
                onClick={() => this.updateShowSettings(false)}
              >
                Close
              </Button>
            </Grid>
          </Grid>
        );
      }

  renderSettingsButton() {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.updateShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  }

    render() {
      if (this.state.showSettings) {
        return this.renderSettings();
      }
      return (
        <Grid container spacing={2}>
          <Grid item xs={12} align="center">
            <Typography variant="h4" component="h4">
              Join Code: {this.roomCode}
            </Typography>
          </Grid>

          <Grid item xs = {3}></Grid>
          <Grid item xs={6} alignItems="center"> 
            <MusicPlayer {...this.state.song} />
          </Grid>
          <Grid item xs = {3}></Grid>
          
          {this.state.isHost ? this.renderSettingsButton() : null}
          <Grid item xs={12} align="center">

            <Button
              variant="contained"
              color="secondary"
              onClick={this.leaveButtonPressed}
            >
              Leave Room
            </Button>
          </Grid>
        </Grid>
      );
    }
}