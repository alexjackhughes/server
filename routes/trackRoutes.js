const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const requireTrack = require("../middlewares/requireTrack");

const Track = mongoose.model("tracks");
const User = mongoose.model("users");

module.exports = app => {
  // GET: One Track by Id
  app.get("/api/tracks", (req, res) => {
    Track.find()
      .then(tracks => {
        res.send(tracks);
      })
      .catch(err => {
        res.status(500).send({ message: "Tracks not found!" });
      });
  });

  // GET: Tracks from array
  app.post("/api/tracks/array", async (req, res) => {

    let listOfIds = req.body.array;
    const tracks = await Track.find({_id:listOfIds});

    res.send(tracks);
  });

  // GET: One Track by Id
  app.get("/api/track/:trackId", (req, res) => {
    Track.findById(req.params.trackId)
      .then(track => {
        if (!track) return res.status(404).send({ message: "Track not found" });

        res.send(track);
      })
      .catch(() => {
        return res.status(404).send({ message: "Please try again" });
      });
  });

  // GET: Filter Tracks by Genre
  app.get("/api/tracks/:genre", (req, res) => {
    Track.find({ genres: req.params.genre })
      .then(track => {
        if (!track) return res.status(404).send({ message: "Track not found" });

        res.send(track);
      })
      .catch(() => {
        return res.status(404).send({ message: "Please try again" });
      });
  });

  // GET: Filter Tracks by Instrument
  app.get("/api/tracks/:instrument", (req, res) => {
    Track.find({ instruments: req.params.instrument })
      .then(track => {
        if (!track) return res.status(404).send({ message: "Track not found" });

        res.send(track);
      })
      .catch(() => {
        return res.status(404).send({ message: "Please try again" });
      });
  });

  // GET: Filter Tracks by rating
  app.get("/api/tracks/:rating", (req, res) => {
    Track.find({ ratings: req.params.rating })
      .then(track => {
        if (!track) return res.status(404).send({ message: "Track not found" });

        res.send(track);
      })
      .catch(() => {
        return res.status(404).send({ message: "Please try again" });
      });
  });

  // GET: my Tracks
  app.get("/api/my-tracks", requireLogin, (req, res) => {
    res.send(req.user.myTracks);
  });

  // GET: my liked Tracks
  app.get("/api/liked-tracks/", requireLogin, (req, res) => {
    res.send(req.user.likedTracks);
  });

  // CREATE: A Track
  app.post("/api/track", requireLogin, (req, res) => {
    // Check that body exists
    if (!req.body) {
      return res.status(404).send({
        message: "You need to provide values!"
      });
    }

    if (!req.body.artists.includes(req.user._id)) {
      req.body.artists.push(req.user._id);
    }

    // Create the track model
    const track = new Track({
      title: req.body.title,
      soundCloudUrl: req.body.soundCloudUrl,
      description: req.body.description,
      artists: req.body.artists, // Need to add originator
      ratings: [5],
      currentRating: 5,
      genres: req.body.genres,
      instruments: req.body.instruments
    });

    // Save track
    track.save().then(async data => {
      let newTrack = await Track.findOne({
        soundCloudUrl: req.body.soundCloudUrl
      });

      // Add Track ID to current author
      req.user.myTracks.push(newTrack._id);
      const user = await req.user.save();
      res.send(user);

      // Add track id to all other authors
      newTrack.artists.map(async artist => {
        if (artist == req.user._id) {
          return;
        }
        let newArtist = await User.findById(artist);

        newArtist.myTracks.push(newTrack._id);
        const newArtistTrack = await newArtist.save();
      });
    });
  });

  // UPDATE: Add one to my tracks
  app.put("/api/my-tracks/:trackId", requireLogin, async (req, res) => {
    req.user.myTracks.push(req.params.trackId);
    const user = await req.user.save();

    res.send(user);
  });

  // DELETE: Delete one from my tracks
  app.delete("/api/my-tracks/:trackId", requireLogin, async (req, res) => {
    let index = req.user.myTracks.indexOf(req.params.trackId);
    if (index > -1) {
      req.user.myTracks.splice(index, 1);
      const user = await req.user.save();

      res.send(user);
    }
  });

  // Rate a track has a number of conditions:
  // 1. make sure user hasn't rated before
  // 2. allow user to rate track
  // 3. calculate the new current rating for track
  app.put("/api/rate-track/:trackId/rating/:rating", requireLogin, async () => {

    const user = await req.user.save();
    res.send(user);
  });

  // UPDATE: Add one to my liked tracks
  app.put("/api/liked-tracks/:trackId", requireLogin, async (req, res) => {

    // if track is already in list, remove it
    if(req.user.likedTracks.includes(req.params.trackId)) {

      let index = req.user.likedTracks.indexOf(req.params.trackId);
      if (index > -1) {
        req.user.likedTracks.splice(index, 1);
      }

    // Otherwise, add it to list
    } else {
      req.user.likedTracks.push(req.params.trackId);
    }

    const user = await req.user.save();
    res.send(user);
  });

  // NOT NEEDED - DELETE: Delete one from my liked tracks
  app.delete("/api/liked-tracks/:trackId", requireLogin, async (req, res) => {
    let index = req.user.likedTracks.indexOf(req.params.trackId);
    if (index > -1) {
      req.user.likedTracks.splice(index, 1);
      const user = await req.user.save();

      res.send(user);
    }
  });

  // UPDATE: A Track
  app.put("/api/track/:trackId", requireLogin, requireTrack, (req, res) => {
    if (!req.body) {
      return res.status(404).send({
        message: "You need to provide values!"
      });
    }

    Track.findByIdAndUpdate(
      req.params.trackId,
      {
        title: req.body.title,
        soundCloudUrl: req.body.soundCloudUrl,
        blurb: req.body.blurb,
        artists: req.body.artists,
        ratings: req.body.ratings,
        currentRating: req.body.currentRating,
        genres: req.body.genres,
        instruments: req.body.instruments
      },
      { new: true }
    ).then(track => {
      res.send(track);
    });
  });

  // DELETE: A Track
  app.delete(
    "/api/track/:trackId",
    requireLogin,
    requireTrack,
    async (req, res) => {
      Track.findByIdAndRemove(req.params.trackId)
        .then(track => {
          res.send({ message: "The Track was deleted successfully" });
        })

        // Remove track id from current users' tracks
        .then(async () => {
          let index = req.user.myTracks.indexOf(req.params.trackId);
          if (index > -1) {
            req.user.myTracks.splice(index, 1);
            const user = await req.user.save();

            res.send(user);
          }
        });
    }
  );
};