const express = require("express");
const app = express();
app.use(express.json());
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const InitializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running.");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
InitializeDBAndServer();

app.get("/movies/", async (request, response) => {
  const moviesQuery = `
    select *
    from movie
    order by movie_id;
    `;
  const movieList = await db.all(moviesQuery);
  response.send(movieList);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
    movie(director_id,movie_name,lead_actor)
    VALUES(
        '${directorId}',
        '${movieName}',
        '${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    select *
    from movie
    where movie_id=${movieId};
    `;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updatedMovieQuery = `
    UPDATE
    movie
    SET
    director_id=${directorId},
    movie_name=${movieName},
    lead_actor=${leadActor},
    where movie_id=${movieId};`;
  await db.run(updatedMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Deleted ");
});

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    select *
    from director
    order by director_id;
    `;
  const directorList = await db.all(getDirectorQuery);
  response.send(directorList);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
    select *
    from movie
    where
    director_id=${directorId};`;
  const movieList = await db.all(getDirectorMovieQuery);
});
