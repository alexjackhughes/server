import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import _ from "lodash";

import TrackList from "../TrackList";
import Track from "../Track";

class GenericTracks extends Component {
  constructor() {
    super();
    this.state = {
      tracks: []
    };
  }

  // need to add tracks
  componentDidMount() {
    if (this.props.match.params.type == "rating") {
      let rating = this.props.match.params.rating;
      this.setState({ title: "Rated " + rating + "*" });

      axios.get(`/api/tracks/rating/${rating}`).then(tracks => {
        this.setState({ tracks: tracks.data });
      });
    } else {
      let title = this.props.match.params.type.replace(/\b\w/g, l =>
        l.toUpperCase()
      );
      let type = this.props.match.params.type;
      this.setState({ title: title });

      axios.get(`/api/tracks/type/${type}`).then(tracks => {
        this.setState({ tracks: tracks.data });
      });
    }
  }

  render() {
    if (this.state && this.state.title && this.state.tracks.length !== 0) {
      return (
        <div className="row">
          <div className="centre col s8 offset-s2 track-mobile">
            <h1 className="page-title">{this.state.title} Tracks</h1>
            {this.state.title === "Solo" ? (
              <p>
                All these tracks are looking for collaborators - why not "read
                more" about a track and get involved?
              </p>
            ) : null}
            <p>
              Ready to collaborate? You can upload a track
              <Link to="/upload/track"> at any time</Link>!
            </p>
            <div className="row">
              <TrackList tracks={this.state.tracks} title={this.state.title} />
            </div>
          </div>
          <Link to="/upload/track">
            <i className="fas fa-plus-circle upload-track" />
          </Link>
        </div>
      );
    }
    return (
      <div>
        <div className="row">
          <div className="centre col s8 offset-s2 add-bottom-margin ">
            <h1 className="profile-title">Tracks</h1>
            <p>Looks like you don't have any tracks here yet :(</p>
            <div className="row">
              {/* <TrackList tracks={this.state.tracks} /> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default GenericTracks;
