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
                console.log(genreButton);
            }
            newPlaylist.innerHTML +=            
                                    '<br>' + '<br>' +                                   // <br> = linebreak
                                    '<label for="year-select">Vælg årstal:</label>' +   //label for drop-down menuen
                                    '<select id="year-select" name="year">' +           
                                    '<option value="">-- Vælg et år --</option>' +
                                    '</select>';

            const timePeriod = [    {"50's":[{'min': 1950},{'max':1959}]}, 
                                    {"60's":[{'min': 1960},{'max':1969}]}, 
                                    {"70's":[{'min': 1970},{'max':1979}]}, 
                                    {"80's":[{'min': 1980},{'max':1989}]}, 
                                    {"90's":[{'min': 1990},{'max':1999}]}, 
                                    {"00's":[{'min': 2000},{'max':2009}]}, 
                                    {"10's":[{'min': 2010},{'max':2014}]}
                                                                            ];
            const yearSelect = document.getElementById("year-select");
            const startYear = 1955;
            const endYear = 2014;

            


            for (let year = endYear; year >= startYear; year--) {
                const option = document.createElement("option");
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
                console.log(option);
            }
    };