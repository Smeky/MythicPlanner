local json = require "json"

i = {
    [2] = {
        [1] = {
            ["y"] = -371.99827054888;
            ["x"] = 238.99949948117;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 1;
            ["type"] = "mapLink";
            ["direction"] = -1;
        };
        [2] = {
            ["y"] = -325.99821539596;
            ["x"] = 438.99950417504;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 1;
            ["type"] = "mapLink";
            ["direction"] = -1;
        };
        [4] = {
            ["y"] = -165.998228807;
            ["x"] = 301.99956662021;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 1;
            ["type"] = "mapLink";
            ["direction"] = -1;
        };
        [3] = {
            ["y"] = -325.99821539596;
            ["x"] = 763.9993723277;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 1;
            ["type"] = "mapLink";
            ["direction"] = -1;
        };
    };
    [3] = {
        [1] = {
            ["y"] = -331.99823886529;
            ["x"] = 142.99959280156;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 1;
            ["type"] = "mapLink";
            ["direction"] = 1;
        };
        [2] = {
            ["y"] = -74.998246995732;
            ["x"] = 634.99954083376;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 1;
            ["type"] = "mapLink";
            ["direction"] = 1;
        };
        [3] = {
            ["y"] = -479.99823718891;
            ["x"] = 265.99968709797;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 4;
            ["type"] = "mapLink";
            ["direction"] = -1;
        };
    };
    [123] = {
        [7] = {
            ["y"] = -171.156124714;
            ["x"] = 507.71746400247;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 3;
            ["type"] = "mapLink";
            ["direction"] = -1;
        };
        [1] = {
            ["y"] = -353.99828789942;
            ["x"] = 431.99974958785;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 2;
            ["type"] = "mapLink";
            ["direction"] = 1;
        };
        [2] = {
            ["y"] = -323.99827432074;
            ["x"] = 658.99968496338;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 2;
            ["type"] = "mapLink";
            ["direction"] = 1;
        };
        [4] = {
            ["y"] = -351.99821832962;
            ["x"] = 286.99996290728;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 2;
            ["type"] = "mapLink";
            ["direction"] = 1;
        };
        [8] = {
            ["y"] = -488.39259517722;
            ["x"] = 433.61217881089;
            ["template"] = "DeathReleasePinTemplate";
            ["graveyardDescription"] = "";
            ["type"] = "graveyard";
        };
        [9] = {
            ["y"] = -244.84595605421;
            ["x"] = 562.54542832837;
            ["template"] = "MapLinkPinTemplate";
            ["type"] = "wmMaggotNote";
        };
        [5] = {
            ["y"] = -268.70710399228;
            ["x"] = 333.16700017336;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 2;
            ["type"] = "mapLink";
            ["direction"] = 1;
        };
        [3] = {
            ["y"] = -423.99831958301;
            ["x"] = 287.99980457313;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 2;
            ["type"] = "mapLink";
            ["direction"] = 1;
        };
        [6] = {
            ["y"] = -234.95708134019;
            ["x"] = 331.91687615145;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 3;
            ["type"] = "mapLink";
            ["direction"] = -1;
        };
    };
    [4] = {
        [1] = {
            ["y"] = -295.99827406928;
            ["x"] = 283.99958366528;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 3;
            ["type"] = "mapLink";
            ["direction"] = 1;
        };
        [2] = {
            ["y"] = -180.99828639068;
            ["x"] = 567.99959204719;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 5;
            ["type"] = "mapLink";
            ["direction"] = -1;
        };
        [3] = {
            ["y"] = -338.999309754;
            ["x"] = 442.00078849681;
            ["template"] = "MapLinkPinTemplate";
            ["text"] = "Note on G52:\nG52 will not be present while the Worldquest to defeat Matron Christiane is active.";
            ["type"] = "generalNote";
        };
    };
    [5] = {
        [1] = {
            ["y"] = -452.99824146368;
            ["x"] = 395.9996705018;
            ["template"] = "MapLinkPinTemplate";
            ["target"] = 4;
            ["type"] = "mapLink";
            ["direction"] = 1;
        };
    };
};

print(json.encode(i))