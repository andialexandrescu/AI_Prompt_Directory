const { app, port } = require("./app"); // destructurare obiect din moment ce trimit prin module exports ambele obiecte si pentru a evita app.app.listen(app.port, (error) => ...

app.listen(port, (error) => {
    if(error) {
        console.error(error);
    }
    console.log(`Example app listening on port ${port}`);
});