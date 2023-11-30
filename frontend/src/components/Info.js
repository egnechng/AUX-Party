import React, { useState, useEffect } from "react";
import {
    Grid,
    Button,
    Typography,
    IconButton
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link } from "react-router-dom";

const pages = {
    JOIN: "pages.join",
    CREATE: "pages.create",
};

// using functional components practice
export default function Info(props) {

    // state, function to update state
    const [page, setPage] = useState(pages.JOIN);

    function joinInfo() {
        return "Each room has a unique code that is able to be viewed by the host and members of the room.\
            Click 'Join a Room' on the home page and enter the room's code to listen to music with all your friends!";
    }

    function createInfo() {
        return "Click the 'Create a Room' button on the front page. There you will be able to \
            configure guests' control over playback state and the number of votes required to skip songs. \
            Once you have created a room, share the unique code on the top of the screen to invite your friends to a music party!";
    }

    useEffect(() => {
        console.log("ran");
        return () => console.log("cleanup");
    });

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Typography component="h4" variant="h4">
                { page === pages.JOIN ? "JOIN A ROOM" : "CREATE A ROOM" }
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
            <Typography variant="body1">
                    { page === pages.JOIN ? joinInfo() : createInfo() }
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <IconButton onClick={() => {
                    page === pages.CREATE ? setPage(pages.JOIN) : setPage(pages.CREATE);
                }}>
                    { page === pages.CREATE ? (<NavigateBeforeIcon/>) : (<NavigateNextIcon/>)}
                </IconButton>
            </Grid>
            <Grid item xs={12} align="center">
                <Button color="secondary" variant="contained" to="/" component={ Link }>
                    Back
                </Button>
            </Grid>
        </Grid>
    );
}