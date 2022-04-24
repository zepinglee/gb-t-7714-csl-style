CSL = require("./citeproc_commonjs.js");
fs = require("fs");

CSL.Output.Formats.text["@display/left-margin"] = function (state, str) {
    return str + " ";
},


make_citeproc_sys = function (items) {
    bib = {};
    for (item of items) {
        bib[item.id] = item;
    }
    var citeproc_sys = {
        retrieveLocale: function (lang){
            return fs.readFileSync("locales-" + lang + ".xml", "utf8");
        },
        retrieveItem: function(id){
            return bib[id];
        }
    };
    return citeproc_sys;
}


generate_bibliography = function (style) {
    data_file = "gbt7714-" + style + "-data.json"
    items = JSON.parse(fs.readFileSync(data_file, "utf8"));

    var citeproc_sys = make_citeproc_sys(items);

    style_file = "china-national-standard-gb-t-7714-2015-" + style + ".csl"
    csl_style = fs.readFileSync(style_file, "utf8");

    citeproc = new CSL.Engine(citeproc_sys, csl_style);

    ids = [];
    for (item of items) {
        ids.push(item.id);
    }

    // result = citeproc.makeCitationCluster(items);
    // console.log(result);

    res = ""

    citation_file = "gbt7714-" + style + "-citation.json"
    cite_items_list = JSON.parse(fs.readFileSync(citation_file, "utf8"));

    var citation_count = 0;
    var citation_pre = [];
    var citation_post = [];

    for (cite_items of cite_items_list) {
        citation_count += 1;
        citaiton_id = "CITATION-" + citation_count;
        var citation = {
            "citationID": citaiton_id,
            "citationItems": cite_items,
            "properties": {
                "noteIndex": 0
            }
        };
        if (citation_file.includes("note")) {
            citation["properties"]["noteIndex"] = citation_count;
        }
        citation_res = citeproc.processCitationCluster(citation, citation_pre, citation_post)[1];
        // console.log(citation_res)
        citation_res = citation_res[citation_res.length - 1][1]
        res += citation_res + "\n"
        if (citation_file.includes("note")) {
            citation_pre.push([citaiton_id, citation_count])
        } else {
            citation_pre.push([citaiton_id, 0])
        }
    }


    // for (cite_items of cite_items_list) {
    //     citation = citeproc.makeCitationCluster(cite_items)
    //     res += citation + "\n"
    // }

    res += "\n\n"

    citeproc.updateItems([]);
    citeproc.updateUncitedItems(ids);

    citeproc.setOutputFormat("text");
    bib_items = citeproc.makeBibliography()[1];
    res += bib_items.join("\n")

    output_file = "gbt7714-" + style + ".txt"
    fs.writeFileSync(output_file, res);
}

for (style of ["numeric", "author-date", "note"]) {
    console.log(style)
    generate_bibliography(style);
}
