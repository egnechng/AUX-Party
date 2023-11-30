import React, { Component } from 'react';
import {
    Grid,
    Typography,
    Card,
} from "@mui/material";

import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';

export default class MusicPlayer extends Component {
    constructor(props) {
        super(props);
    }

    // methods to send requests from frontend to backend
    skipSong() {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      };
      fetch("/spotify/skip", requestOptions);
    }

    pauseSong() {
      const requestOptions = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      };
      fetch("/spotify/pause", requestOptions);
    }
    
    playSong() {
      const requestOptions = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      };
      fetch("/spotify/play", requestOptions);
    }

    render() {
        const songProgress = (this.props.time / this.props.duration) * 100;
    
        return (
          <Card>
            <Grid container rowSpacing={1} alignItems="center">
                <Grid item xs={12}>
                <img src={this.props.image_url} height="100%" width="100%" />
              </Grid>
              <Grid item align="center" xs={12}>
                <Typography component="h5" variant="h5">
                  {this.props.title}
                </Typography>
                <Typography color="textSecondary" variant="subtitle1">
                  {this.props.artist}
                </Typography>
                <div>
                  <IconButton onClick={() => { 
                    this.props.is_playing ? this.pauseSong() : this.playSong();
                    }}
                >
                    {this.props.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                  <IconButton onClick={() => this.skipSong()}>
                     <SkipNextIcon />
                  </IconButton>
                </div>
              </Grid>
              <Grid item align="center" xs={12}>
              <Typography component="subtitle1" variant="subtitle1">
              Votes Needed to Skip: {this.props.votes} / {" "} {this.props.votes_required}
              </Typography>
               
              </Grid>
             
            </Grid>
            <LinearProgress variant="determinate" value={songProgress} />
          </Card>
        );
      }
    }