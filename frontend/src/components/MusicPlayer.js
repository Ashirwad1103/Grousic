import React from 'react'
import {Grid, Typography, Card, IconButton, LinearProgress} from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import SkipNextIcon from '@material-ui/icons/SkipNext';

// img_url
// title
// artists
// is_playing

function MusicPlayer(props) {
    console.log(props)

    function playSong() {
        const requestOptions = {
            method : "PUT", 
            headers : {"Content-Type" : "application/json"}
        }

        fetch('/spotify/play', requestOptions)
    }

    function pauseSong() {
        const requestOptions = {
            method : "PUT", 
            headers : {"Content-Type" : "application/json"}
        }

        fetch('/spotify/pause', requestOptions)
    }

    function skipSong() {
        const requestOptions = {
            method : "POST", 
            headers : {"Content-Type" : "application/json"}
        }

        fetch('/spotify/skip', requestOptions)
    }



    let value = (props.progress / props.duration) * 100;  
    return (
        <div style = {{color : "#000000d0"}}>
            <Card>
                <Grid container alignItems = "center">
                    <Grid item xs = {4} align = "center"> 
                        <img src = {props.image_url} height = "100%" width = "100%" />
                    </Grid>
                    <Grid item xs = {8} align = "center"  style = {{color : "#000000d0"}}>
                        <Typography variant = "h5" component = "h5" >{props.title}</Typography>
                        <Typography variant = "subtitle1" component = "h7">{props.artists}</Typography>
                        <div>
                            <IconButton onClick = {props.is_playing ? pauseSong : playSong} >{props.is_playing ? <PauseIcon/> : <PlayArrowIcon/>}</IconButton>
                            <IconButton onClick = {skipSong}>
                            <Typography component = "h10" variant= "subtitle1">{props.votes} / {props.total_votes}</Typography> 
                            <SkipNextIcon/>
                            </IconButton>
                        </div>
                            <LinearProgress variant = "determinate" value = {value}/>  
                    </Grid>
                </Grid>
            </Card>
        </div>
    )
}

export default MusicPlayer
