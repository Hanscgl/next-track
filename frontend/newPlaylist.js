const newButton = document.getElementById("new-button")
newButton.addEventListener('click', hentPlaylists) 

    async function hentPlaylists() {
        console.log("hello");
        const response = await fetch('/api/genres/') ;  
        const genres = await response.json() ;
        console.log(genres);
        
        const newPlaylist = document.getElementById("new-playlist");
            newPlaylist.innerHTML = "Select Genre <br>";
            
            for (const genre of genres){
                const genreButton = document.createElement("button");
                genreButton.textContent = genre.name;
                newPlaylist.appendChild(genreButton);
 
            }

            // HTML DOM - Der oprettes en ny 'div'-kasse under genre-knapperne
            const nyDiv = document.createElement("div");
            newPlaylist.appendChild(nyDiv);
            
            // HTML DOM - Vi indsætter en select menu i den nye 'div'
            nyDiv.innerHTML =            
                                    '<br>' +                                   // <br> = linebreak
                                    '<label for="year-select">Årti:</label>' +   //label for drop-down menuen
                                    '<select id="year-select" name="year">' +           
                                    '<option value="">-- Vælg et årti! --</option>' +
                                    '</select>';
            
            // Et datasæt / tabel over årtier og deres min og max værdier
            const timePeriod = [    { periode : "50's", min : 1950, max : 1959}, 
                                    { periode : "60's", min : 1960, max : 1969}, 
                                    { periode : "70's", min : 1970, max : 1979}, 
                                    { periode : "80's", min : 1980, max : 1989}, 
                                    { periode : "90's", min : 1990, max : 1999}, 
                                    { periode : "00's", min : 2000, max : 2009}, 
                                    { periode : "10's", min : 2010, max : 2014}
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
                option.value = [periode.min, periode.max];
                option.textContent = periode.periode;
                yearSelect.appendChild(option);
            };

            /* 
            Ideen her: at bygge en knap der kan rapportere ved tryk, hvilken option der er valgt i 'select-menuen'
                1. lav knappen
                2. lyt efter et klik
                3. ved 'click' kør en function
                4. HTML DOM - placere det som barnet til forældren (appendChild)
            */

            const sendKnap = document.createElement("button");
            sendKnap.addEventListener('click', consoleLog)
            nyDiv.appendChild(sendKnap);

            /*
            Funktionens opgave (consoleLog)
                1. der oprettes en variabel, den valgte option i 'select-menu' har en value, som hentes
                    Værdien findes frem og placeres i variablen
                2. værdien bliver vist i browserens konsol
            */

            function consoleLog(){
                const valgteAar = document.getElementById("year-select").value;
                console.log(valgteAar)
            };

    }; // alt køres inde i den asynkrone func der er opstillet i toppen