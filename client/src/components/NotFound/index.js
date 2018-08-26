import React, { Component } from "react";

class NotFound extends Component {

  render() {
    return(
      <div style={{ textAlign: 'center' }}>
        <img src="/bedroombands-landing.png"
              alt="Bedroom Bands Landing"
              id='landing-img'
              />
        <h1 className="profile-title">Not Found</h1>
        <div className="landing-text">
          <p>Well, I'm not sure what's happened here - probably best to get back.</p>
        </div>
        <a href="/tracks" class="blue lighten-2 waves-effect waves-light btn-large">GO BACK <i class="fas fa-undo-alt btn-far" /></a>
      </div>
    );
  }
}

export default NotFound;
