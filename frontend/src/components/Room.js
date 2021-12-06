import { Button, Grid, Typography } from '@material-ui/core';
import React, {useState, useEffect} from 'react'
import { Redirect } from 'react-router-dom';
import CreateRoom from './CreateRoom';
import MusicPlayer from './MusicPlayer';

// ADDED showedOnce useState for making getRoomDetails once


function Room(props) {
    
    const [state, setState] = useState({
        votesToSkip : 1, 
        guestCanPause : false,
        isHost : false,  
    });

    const [showSettingsPage, setShowSettingsPage] = useState(false);
    const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false); 
    const [showedOnce, setShowedOnce] = useState(false); 
    // roomCode was used in 'room/<str:roomCode>' in urls 

    

    const roomCode = props.match.params.roomCode;  
    
    function getRoomDetails () {
        
        fetch('/api/get-room?code=' + roomCode)
        .then(response => {
            if (!response.ok) {
                
                props.leaveRoomCallBack();
                props.history.push('/')
            }   
            return response.json()
        })
        .then(data => {
            if (data.isHost) {
                console.log('about to call authspot')
                authenticateSpotify();
            }
            setState({
            ...state,    
            votesToSkip : data.votes_to_skip,
            guestCanPause : data.guest_can_pause,
            isHost : data.isHost,
            })
        })
    }


    let [song, setSong] = useState({});    
    // let [fetchedSong, setFetchedSong] = useState(false);

    function getCurrentSong() {
        fetch('/spotify/current-song')
        .then(response => {
            if (response.ok) {
                
                return response.json()
            } 
        })
        .then(data => {
            // console.log(data)
            setSong({...data})
            // setFetchedSong(true)
            // console.log(song)
        })
    }

    function authenticateSpotify() {
        
        fetch('/spotify/is-authenticated')
        .then(response=>response.json())
        .then(data=> {
            setSpotifyAuthenticated(data.status)
            if (!data.status) {
                fetch('/spotify/get-auth-url')
                .then(response => response.json())
                .then(data => window.location.replace(data.url))
                console.log('authenticating')
            }
            else
                console.log('already auth')
        })
    }

    useEffect(()=>{getRoomDetails()},[])
    useEffect(()=>{
        const interval = setInterval(()=>{
            getCurrentSong();
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleLeaveRoomButtonClicked = () => {

        const requestOptions = {
            method : "POST",
            headers : {"Content-Type" : "application/json"},
        };

        fetch('/api/leave-room', requestOptions)
        .then(response => {
            props.leaveRoomCallBack();
            props.history.push('/');
        });
    }

    // settings button will only be shown to host of rooms only 

    function renderSettingsButton () {
        return (
            <Grid item xs = {12} align = "center">
                <Button variant = "contained" color = "primary" onClick = {() => setShowSettingsPage(true)}>
                    Settings
                </Button>
            </Grid>
        )
    }

// code = {roomCode}, removed from <CreateRoom.... 

    function renderSettingsPage () {
        return (
            <Grid container spacing = {1}>
                <Grid item xs = {12} align = "center" >
                    <CreateRoom update = {true} 
                                votes_to_skip = {state.votesToSkip} 
                                guest_can_pause = {state.guestCanPause}
                                updateCallBack = {getRoomDetails}
                                />
                </Grid>
                <Grid item xs = {12} align = "center">
                    <Button 
                        variant = "contained" 
                        color = "secondary" 
                        onClick = {()=> setShowSettingsPage(false)}
                        >
                        Close
                    </Button>
                </Grid>
            </Grid>
        );
    }

// {!state.fetched ? "Loading....." : 
//                 }

    if (showSettingsPage)
        return renderSettingsPage()
    return (
        <div>                
            <div>
                <Grid container spacing = {1}>
                    <Grid item xs = {12} align = "center">
                        <Typography variant = "h3" component = "h3">
                            Grousic
                        </Typography>
                        <Typography variant = "subtitle1" component = "h5">
                            Party From Home... 
                        </Typography>
                    </Grid>
                    {<MusicPlayer {...song}/>}
                    {state.isHost ? renderSettingsButton() : null}
                    <Grid item xs = {12} align = "center"> 
                        <Button color = "secondary" variant = "contained" onClick = {handleLeaveRoomButtonClicked}>Leave Room</Button>
                    </Grid>
                </Grid>
                </div>
            </div>                
    )
}

export default Room
