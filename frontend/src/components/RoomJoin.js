import React, {useState} from 'react'
import {Typography, Button, TextField, Grid} from '@material-ui/core';
import {Link} from 'react-router-dom';

function RoomJoin(props) {

  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  const handleRoomCodeChange = (e) => {
    setRoomCode(e.target.value)
  } 

  const handleJoinButtonClicked = () => {
      const requestOptions = {
        method : "POST",
        headers : {"Content-Type" : "application/json"},
        body : JSON.stringify({
          code : roomCode
        })
      };
      fetch('api/join-room', requestOptions)
      .then((response) => {
        if (response.ok) 
          props.history.push('/room/' + roomCode)
        else 
          setError("ROOM NOT FOUND");
      }) 
      .catch((error) => {
        console.log(data)
      });
  }
  

  return (
        <div>
          <Grid container spacing = {1} > 
            <Grid item xs = {12} align = "center">
              <Typography component = "h4" variant = "h4">
                Join a Room
              </Typography>
              <Grid item xs = {12} align = "center">
                <TextField
                variant="outlined"
                style = {{margin : 5}}
                label = "code"
                placeholder = "Enter a Code..."
                value = {roomCode}
                error = {error}
                helperText = {error}
                onChange = {handleRoomCodeChange}
                >   
                </TextField>
              </Grid>              
              <Grid item xs = {12} align = "center">
                <Button style = {{margin : 5}} variant = "contained" color = "primary" onClick = {handleJoinButtonClicked}>Join</Button>
                <Button style = {{margin : 5}} variant = "contained" to = '/' component = {Link} color = "secondary">Back</Button>
              </Grid>
            </Grid> 
          </Grid>           
        </div>
    )
}

export default RoomJoin
 