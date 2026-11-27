const newButton = document.getElementById("new-button");
newButton.addEventListener('click', visNyPlaylisteMenu);

let genreId;
let minV;
let maxV;

async function visNyPlaylisteMenu() {
    const response = await fetch('/api/genres/');
    const genres = await response.json();
    console.log(genres);

    const newPlaylistS = document.getElementById("new-playlist");
    newPlaylistS.innerHTML = "Select Genre <br>";

    for (const genre of genres) {
        // HTML DOM - Opretter en ny knap for hver runde i for .. of loop'et
        const genreButton = document.createElement("button");
        // Giver knappen dens genre.navn
        genreButton.textContent = genre.name;

        // Vi giver hver knap en css class, som bruges til at identificere genre_knapperne
        genreButton.classList.add("standardKnap");


        /* --- Hvad skal der ske når der trykkes på en af genre-knapperne? ---

        IDEEN: En knap skal kunne vælges og skifte farve! Hvis en anden knap vælges, 
                skal den første valgte knap skifte tilbage til 'ikke valgt farve'

            1. Den skal kunne give et visuelt feedback til brugeren, der fortæller at den er VALGT
                a. addEventListener bruges, der køres en funktion ved klik
                b. querySelectorAll finder alle genre-knapper (.standardKnap). 
                    for..of går dem igennem én ad gangen og fjerner 'valgtGenre' fra hver, så ingen er markeret.
            2. Vi henter genre.name og sætter den i variablen genreV, 
                som vi har til at stå i toppen af dokumentet
            3. console.log den valgte genre
            4. giv den valgte genre den nye CSS Class 'valgtGenre' og ændre farven til sort fra blå
        */ 

/* 1.a */       genreButton.addEventListener('click',
                function () {
/* 1.b */           for (const knap of document.querySelectorAll(".standardKnap")) {
                        knap.classList.remove("valgtGenre");
                    }

/* 2. */            genreId = genre.genre_id;
/* 3. */            console.log('Valgte genre:', genreId);

/* 4. */            genreButton.classList.add("valgtGenre");

            }); // <- klik-funktionen og addEventListener slutter her
        newPlaylistS.appendChild(genreButton);

    }; // <- for .. of loop - med gennemgang af genre slutter her


    //                  ------ SELECT-MENUEN ------

    // HTML DOM - Der oprettes en ny 'div'-kasse under genre-knapperne
    const nyDiv = document.createElement("div");
    newPlaylistS.appendChild(nyDiv);

    // HTML DOM - Vi indsætter en select menu i den nye 'div'
    nyDiv.innerHTML =
        '<br>' +                                   // <br> = linebreak
        '<label for="year-select">Årti:</label>' +   //label for drop-down menuen
        '<select id="year-select" name="year">' +
        '<option value="">-- Vælg et årti! --</option>' +
        '</select>';

    // Et datasæt / tabel over årtier og deres min og max værdier
    const timePeriod = [{ periode: "50's", min: 1950, max: 1959 },
                        { periode: "60's", min: 1960, max: 1969 },
                        { periode: "70's", min: 1970, max: 1979 },
                        { periode: "80's", min: 1980, max: 1989 },
                        { periode: "90's", min: 1990, max: 1999 },
                        { periode: "00's", min: 2000, max: 2009 },
                        { periode: "10's", min: 2010, max: 2014 }
                        ];

    // Vi gemmer en reference til select-menuen i en variabel gennem dens ID
    const yearSelect = document.getElementById("year-select");

    /* 
    Vi bygger på vores select-menu og tilføjer flere options, som indeholder både noget visuelt tekst
    og en skjult værdi. 
    Til sidst placeres det som barn til 'select-menu yearSelect' = (appendChild)
            option.value (altid en tekststreng) = læser fra vores timePeriod-array, som gennemgås af for .. of - loop'et
            option.textContent = Her indsættes teksten som vises til bruger i den option - det hentes fra timePeriod tabel
    */
    for (const periode of timePeriod) {
        const option = document.createElement("option");
        option.value = periode.periode;
        option.textContent = periode.periode;
        yearSelect.appendChild(option);
    }


    /* 
    IDEEN HER: at bygge en knap der kan rapportere ved tryk, hvilken option der er valgt i 'select-menuen'
            Knappen læser det valgte årti (f.eks. "80's") og slår min. og max. op i timePeriod-tabellen.
        1. lav knappen
        2. lyt efter et klik
        3. ved 'click' kør en function
        4. HTML DOM - placere det som barnet til forældren (appendChild)

        TODO: Knappen har intet visuelt tekst i browseren
    */
    const sendKnap = document.createElement("button");
    sendKnap.addEventListener('click', hentAarti);
    nyDiv.appendChild(sendKnap);


    /*
    ----- Funktionens opgave (hentAarti) -----
        1. der oprettes en variabel, den valgte option i 'select-menu' har en value, som hentes
            Værdien findes frem og placeres i variablen
        2. værdien bliver vist i browserens konsol

    IDEEN: Det der sker med den klassiske for loop - Vi skal hive minimum og maximum værdierne ud!
        1. Vi bruger 'i' som tæller og index-værdi til at slå op i vores tabel
        2. dette køres når brugeren har valgt et årti og trykker på 'sendKnap'
        3. Ud fra det valgte årti, så spørger vi om ved det givne index, som slås op i tabellen,
            er lig med det valgte årti i select-menuen
        4. ved første for loop, hentes minimum værdien
            ved det andet for loop, hentes maximum værdien
        5. værdierne gemmes i to variabler lavet i toppen af dokumentet

        TODO: De to ens løkker kan blive til en ...
    */
    async function hentAarti() {
        const valgteAar = document.getElementById("year-select").value;
        console.log(valgteAar);

        for (let i = 0; i < timePeriod.length; i++) {
            if (timePeriod[i]["periode"] == valgteAar) {
                minV = timePeriod[i]["min"];
            };
        };

        for (let i = 0; i < timePeriod.length; i++) {
            if (timePeriod[i]["periode"] == valgteAar) {
                maxV = timePeriod[i]["max"];
            };
        };

        console.log('minimum værdi:', minV);
        console.log('maximum værdi:', maxV);

        
        const tabelP = {genre : genreId, minAarstal : minV, maxAarstal : maxV};
        
            const response = await fetch(`/api/newPlaylist/${tabelP["genre"]}/${tabelP["minAarstal"]}/${tabelP["maxAarstal"]}`)
            // Den nye playliste 
            const playlistSvar = await response.json();
            console.log(playlistSvar)
        
            const newPlaylist = document.getElementById("playlist-view");
            const newPlaylistDiv = document.createElement("div");
            newPlaylist.innerHTML = "";
            newPlaylist.appendChild(newPlaylistDiv);
            
            for (const newP of playlistSvar){
                const p = document.createElement("p");
                p.textContent = newP.title + " ---- Artist: " + newP.stage_name;
                newPlaylistDiv.appendChild(p);
            }
        

    };



}; // NÆSTEN alt køres inde i den asynkrone func der er opstillet i toppen