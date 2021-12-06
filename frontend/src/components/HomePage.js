import React, {useState, useEffect} from 'react';
import {Grid, Button, ButtonGroup, Typography} from '@material-ui/core';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import RoomJoin from './RoomJoin';
import CreateRoom from './CreateRoom';
import Room from './Room';

function HomePage(props) {

    const [state, setState] = useState({code : null, fetched : false});

    useEffect(()=>{
        console.log("useEffect");
        fetch('/api/user-in-room')
        .then(response => response.json())
        .then(data => {
            setState({code : data.code, fetched : true})
        })
    },[])


    const clearRoomCode = () => {
        console.log("called")
        setState({
            code : null, 
            fetched : state.fetched
        })            
    }

    function renderHomePage () {
        
        return (<Grid container spacing = {3}>
            <Grid item xs = {12} align = "center">
                <Typography variant = "h3" component = "h3">
                    Grousic
                </Typography>
                <Grid item xs = {12} align = "center">
                    <ButtonGroup disableElevation variant = "contained">
                        <Button color = "primary" to = '/join' component = {Link}>Join a Room</Button>
                        <Button color = "secondary" to = '/create' component = {Link}>Create a Room</Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        </Grid>);
    }


    return (
        <div>
            <Router >
                <Switch >
                    <Route exact path = "/" render = {()=>{
                        if (!state.fetched)
                            return "Loading..."
                        else if (state.code)
                            return <Redirect to={'/room/' + state.code}/>
                        else 
                            return renderHomePage()
                    }}/>
                    <Route path = "/join" component = {RoomJoin}/>
                    <Route path = "/create" component = {CreateRoom}/>
                    <Route 
                        path = "/room/:roomCode" 
                        render = {(props) => { 
                            return <Room {...props} leaveRoomCallBack = {clearRoomCode}/>
                        }} 
                    /> 
                </Switch>
            </Router>
        </div>
    )
}

export default HomePage
