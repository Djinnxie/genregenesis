$(function(){
    init();

    $("button").click(generate);
    $("#out>span").hover(function(){
        getExamples($(this).text(),$(this).attr("id"),Data.options.maxExamples);
    });
    $("#out>span").click(function(){
        getExamples($(this).text(),$(this).attr("id"),Data.options.maxExamples);
    });
})
let searchWiki = function(title){
    wikiURL = "https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=5&gsrsearch=";
    query = title+" genre";
    console.log(query);
    $.getJSON( wikiURL+query, function( data ) {
        console.log(data);
        // console.log(data.query.pages);
        if(typeof(data.query)=="undefined"){
            console.log("no results!");
            return;
        }
        let pages = data.query.pages;

        for(let key of Object.keys(pages)){
            if(pages[key].index==1){
                console.log(key);
                getWiki(pages[key].title);
            }
        }
        // console.log(pages);
        // console.log(obj);
    })
}
let getWiki = function(title,output=true){
    wikiURL = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=10&exlimit=1&explaintext=1&formatversion=2&format=json&origin=*&titles="
    $.getJSON( wikiURL+title, function( data ) {
        console.log(data);
        let title = data.query.pages[0].title;
        let result = data.query.pages[0].extract;
        console.log(result);
        if(output){
            $("#summary h2").text(title);
            $("#summary p").text(result.split("=")[0]);
        }
    })
}
let getExamples = function(txt,pos,quantity){
        // let txt = $(this).text();
        if(lastHover==txt) return;
        lastHover = txt;
        // let res = search.filter(Data.examples,txt);
        let res;
        if(pos=="prefix") {
            res = searchP.filter(Data.examples,txt);
        } else if(pos=="genre"){
            res = search.filter(Data.examples,txt);
        } else if(pos=="suffix"){
            res = search.filter(Data.examples,txt);
        }
        // let info = search.info(res, Data.examples, txt);
        console.log(res);
        let output = []
        $("#info").html("");
        for(let i=0;i<(res.length>=Data.options.maxExamples?Data.options.maxExamples:res.length);i++){
            let x = Data.examples[res[i]];
            $("#info").append($("<li></li>").text(x));
            output.push(x)
        }
        console.log(output.join("\n"));
        return output;
        return txt; 
        let pref = "";
        let prefend="";
        if(pos=="prefix") {

            pref="^"; 
        } else if(pos=="genre"){
            pref="="; 
        } else if(pos=="suffix"){
            pref=""; 
            prefend="$";
        }
        let query = pref+txt.trim().toLowerCase()+prefend;
        // let query = pref+"\""+txt.trim().toLowerCase()+"\""+prefend;
        console.log("query",query);
        // let res = fuse.search(query);
        console.log(res.slice(0,Data.options.maxExamples));
        // console.log(output);
        // return output;
        output = []
        for(let i=0;i<(res.length>=Data.options.maxExamples?Data.options.maxExamples:res.length);i++){
            output.push(Data.examples[res[i].item])
        }
        console.log(output.join("\n"));
        return output;
}
let lastHover = "";
let Data = {
    prefix:[],
    suffix:[],
    genre:[],
    examples:[],
    ready:-4,
    options:{
        alwaysCapitalize:false,
        maxExamples:10
    }
};
let getFileAsArray = function(filename,mode=0){
    $.ajax({
        url : filename+".txt",
        dataType: "text",
        success : function (data) {
            // console.log(data);
            if(mode==1){
                Data[filename] = JSON.parse(data);
            }else{
                Data[filename] = data.split("\n");
                // Data[filename] = data.split("\r\n");
            }
            Data.ready++;
            if(Data.ready==0){
                enableSearch();
                generate();
            }
        }
    });
}

let getRandom = function(arr){
    return arr[Math.floor(Math.random()*arr.length)];
}
let capitalize = function(str){
    str = str[0].toUpperCase()+str.substring(1);
    return str;
}

let init = function(){
    getFileAsArray("examples",1);
    getFileAsArray("genre");
    getFileAsArray("prefix");
    getFileAsArray("suffix");
}
let search;
let searchP;
let searchS;
let enableSearch = function(){
    search = new uFuzzy({interIns:0});
    searchP = new uFuzzy({interLft:1,interIns:0});
    searchS = new uFuzzy({interRgt:1,interIns:0});
    // fuse = new Fuse(Data.examples, sortOpt);
}
let generate = function(){
    console.log("generate");
    let prefix = getRandom(Data.prefix);
    let genre = getRandom(Data.genre);
    let suffix = getRandom(Data.suffix);
    // genre="hardcore";
    // suffix=".electronica"
    console.log("genereated:",prefix,genre,suffix)

    let prefixDiv = prefix.slice(-2).split("");
    console.log("pre:",prefixDiv)
    if(prefixDiv[0]=="."||prefixDiv[0]=="_"){
        prefix = prefix.substring(0,prefix.length-2);
    }else{
        prefix = prefix.substring(0,prefix.length-1);
        prefixDiv.shift()
    }
    console.log("pre:",prefixDiv)
    prefixDiv = getRandom(prefixDiv);
    prefixDiv = (prefixDiv=="_"?" ":"");
    if(prefixDiv==" "||Data.options.alwaysCapitalize) genre = capitalize(genre);

    let suffixDiv = suffix.slice(0,2).split("");
    console.log("suf:",suffixDiv)
    if(suffixDiv[1]=="."||suffixDiv[1]=="_"){
        suffix = suffix.substring(2);
    }else{
        suffix = suffix.substring(1);
        suffixDiv.pop()
    }
    console.log("suf:",suffixDiv)
    suffixDiv = getRandom(suffixDiv);
    suffixDiv = (suffixDiv=="_"?" ":"");
    if(suffixDiv==" "||Data.options.alwaysCapitalize) suffix = capitalize(suffix);
    if(suffixDiv==""){
        if(suffix.substring(0,1).toLowerCase()==genre.substr(-1).toLowerCase()){
            suffix=suffix.substring(1);
        }
    }
    if(genre.toLowerCase()=="lowercase"){
        genre=genre.toLowerCase()
        prefix=prefix.toLowerCase()
        suffix=suffix.toLowerCase()
    }
    $("#prefix").text(prefix+prefixDiv);
    $("#genre").text(genre);
    $("#suffix").text(suffixDiv+suffix);
    searchWiki(genre);
    let string = prefix+prefixDiv+genre+suffixDiv+suffix;
    // $("#out").text(string);
    console.log(string)
}