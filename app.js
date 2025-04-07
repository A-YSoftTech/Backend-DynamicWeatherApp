const express = require('express')
const path = require('path')
const axios = require('axios')
const Papa = require('papaparse')
const fs = require('fs').promises; 

require('dotenv').config()
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

let cityList = [];
async function loadCityList() {
    try {
        const data = await fs.readFile(path.join(__dirname, '/public/images/cityName.csv'), 'utf8');
        const parsedData = Papa.parse(data, {
            header: false,
            skipEmptyLines: true
        });

        cityList = parsedData.data.map(row => row[0].trim());
        // console.log("CSV Loaded. Sample Cities:", cityList.slice(0, 10));
    } catch (err) {
        console.error("Error loading CSV:", err);
    }
}
loadCityList();



app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname, 'views', 'index.html'))
});
app.get("/weather", async(req, res)=>{
    const city = req.query.city;
    const apikey = process.env.API_KEY;
    const apiurl = process.env.API_URL;
    try{
        const response = await axios.get(apiurl + city + `&appid=${apikey}`);
        const data = response.data;
        if(data.cod == "404"){
            res.status(404).json({message: 'City not found'})
        }else{
            res.json(data);
        }
    }catch(error){
        res.status(500).json({message : error.message})
    }

});
app.get("/map", (req, res)=>{
    res.json({apiKey: process.env.MAP_API, mapid: process.env.MAP_ID});
})
app.get("/cities", (req, res)=>{
    res.json(cityList);
})

app.listen(8000, ()=>{
    console.log('Your port is now online')
})