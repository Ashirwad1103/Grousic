import React from 'react'
import {useState} from 'react';
import { Grid, FormControlLabel, FormHelperText, Radio, RadioGroup, Button, Typography, TextField, FormControl} from '@material-ui/core';
import {Link} from 'react-router-dom';
import {Collapse} from '@material-ui/core';
import {Alert} from '@material-ui/lab';


function CreateRoom(props) {


    // setState variable are written in camel casing to make modifying methods name simple to write 
    // votes_to_skip and guest_can_pause are from props, 
    let [update, setUpdate] = useState(props.update);
    let [votesToSkip, setVotesToSkip] = useState(props.votes_to_skip);
    let [guestCanPause, setGuestCanPause] = useState(props.guest_can_pause);
    let [successMsg, setSuccessMsg] = useState("");
    let [errorMsg, setErrorMsg] = useState("");

    const handleGuestCanPause = (e) => {
        setGuestCanPause(e.target.value === "true" ? true : false);
    }
    
    const handleVotesToSkip = (e) => {
        setVotesToSkip(e.target.value);
    }


    const handleCreateRoomButtomClicked = () => {
        const requestOptions = {
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({
                votes_to_skip : votesToSkip, 
                guest_can_pause : guestCanPause,
            })
        };
        fetch("/api/create-room", requestOptions)
        .then((response) => response.json())
        .then((data) => props.history.push("/room/" + data.code));        
    }

    // const handleCreateRoomButtomClicked = () => {
    //     console.log(votesToSkip, guestCanPause)
    // }

    const handleUpdateRoomButtonClicked = () => {
        const requestOptions = {
            method : "PATCH",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({
                votes_to_skip : votesToSkip, 
                guest_can_pause : guestCanPause,
            })
        };
        fetch("/api/update-room", requestOptions)
        .then((response) => {
            if (response.ok)
                setSuccessMsg("Room settings updated successfully")
            else 
                setErrorMsg("Error occurred while updating room settings")                
            props.updateCallBack();
        })
    }

    function renderCreateButtons () {
        return(
            <Grid container spacing = {1}>
                <Grid item xs = {12} align = "center">
                    <Button 
                    color = "primary"
                    variant = "contained" 
                    onClick = {handleCreateRoomButtomClicked}
                    >
                    Create a room
                    </Button>
                </Grid>
                <Grid item xs = {12} align = "center">
                    <Button 
                    color = "secondary"
                    variant = "contained" 
                    to = '/'
                    component = {Link}
                    >
                    Back
                    </Button>
                </Grid>            
            </Grid>
        );
    }

    function renderUpdateButtons () {
        return (
            <Grid item xs = {12} align = "center">
                <Button 
                    variant = "contained" 
                    color = "primary" 
                    onClick = {handleUpdateRoomButtonClicked}
                    >
                    Update Room
                </Button>
            </Grid>
        );
    }

    return (
        <Grid container spacing = {1}>
            <Grid item xs = {12} align = "center">
                <Grid item xs = {12} align = "center">
                    <Collapse style = {{color : successMsg != "" ? "green" : "red"}} in = {successMsg != "" || errorMsg != ""}>
                        {successMsg ? 
                        (
                            <Alert severity = "success" onClose = {()=> setSuccessMsg("")}>
                                Room settings updated successfully
                            </Alert>
                        ):
                        (
                            <Alert severity = "error" onClose = {()=> setErrorMsg("")}>
                                Error occurred while updating room settings
                            </Alert>
                        )
                    }
                    </Collapse>
                </Grid>
                <Typography component = "h4" variant = "h4">
                {update ? "Update Room" : "Create A Room"} 
                </Typography>
            </Grid>
            <Grid item xs = {12} align = "center">
                <FormControl component = "fieldset">
                    <FormHelperText>
                        <div>Guest control of Playback</div>
                    </FormHelperText>
                    <RadioGroup
                        row 
                        defaultValue = {guestCanPause?"true":"false"}
                        onChange = {handleGuestCanPause}
                    >
                    <FormControlLabel 
                        value = "true"
                        control =  {<Radio color = "primary"  />}
                        label = "Play/Pause"
                        labelPlacement = "bottom"
                    />
                    <FormControlLabel 
                        value = "false"
                        control =  {<Radio color = "secondary"  />}
                        label = "No control"
                        labelPlacement = "bottom"
                    />
                    </RadioGroup>
                </FormControl>
            </Grid> 
            <Grid item xs = {12} align = "center">
                <FormControl>
                    <TextField
                        required = {true}
                        type = "number"
                        onChange = {handleVotesToSkip}
                        defaultValue = {votesToSkip}
                        inputProps =  {{
                            min: 1,
                            style : {textAlign : "center"},
                        }}
                    />
                    <FormHelperText>
                        <div align = "center">Votes required to skip a song</div>
                    </FormHelperText>
                </FormControl>
            </Grid>
            {update ? renderUpdateButtons() : renderCreateButtons()}
        </Grid> 
    )
}

// left hand side props names are use below ('the names with which the props are send')

CreateRoom.defaultProps = {
    // update = false,
    update : false, 
    votes_to_skip : 2, 
    guest_can_pause : false, 
    // updateCallBack: ()=>{}
};


export default CreateRoom
