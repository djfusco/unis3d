var Controller = function (unityInstance) {
    var self = this;
    
    var all = {
        folder: "common/all", variants: [
            "Black",
            "Fire",
            "Glow",
            "Green",
            "Hot Pink",
            "Lava",
            "Sapphire",
            "Silver",
            "White",
            "Yellow"
        ]
    };

    var upper1 = {folder: "type1/upper", variants: ["Army_Camo", "Black_Snakeskin", "Black_Silver_Marble_Splash", "Blue_Flame", "Galaxy", "Green_Flame", "Light_Wood_Grain", "Oil_Slick", "Vintage_World_Map"]};
    var upper2 = {folder: "type2/upper", variants: ["Army_Camo", "Black_Snakeskin", "Black_Silver_Marble_Splash", "Blue_Flame", "Galaxy", "Green_Flame", "Light_Wood_Grain", "Oil_Slick", "Vintage_World_Map"]};
    var outsole1 = {folder: "type1/texture", variants: ["Army_Camo", "Black_Snakeskin","Black_Silver_Marble_Splash", "Blue_Flame", "Galaxy", "Green_Flame", "Light_Wood_Grain", "Oil_Slick", "Vintage_World_Map"]};
    var outsole2 = {folder: "type2/texture", variants: ["Army_Camo", "Black_Snakeskin", "Black_Silver_Marble_Splash", "Blue_Flame", "Galaxy", "Green_Flame", "Light_Wood_Grain", "Oil_Slick", "Vintage_World_Map"]};
    var buttons = {folder: "common/all", variants: ["Black", "Silver"]};
    var rubber = {folder: "common/all", variants: ["Black", "Clear", "White"]};

    self.data = {
        type1: [
            {
                name: "Midsole",
                def: {folder: 'type1/texture', color: "Army_Camo"},
                unityId: "midsole",
                colors: [all, outsole1]
            },
            {
                name: "Cushion Unit",
                def: {folder: 'common/all', color: "Silver"},
                unityId: "cushion",
                colors: [all]
            },
            {name: "Upper", def: {folder: 'type1/upper', color: "Army_Camo"}, unityId: "upper", colors: [all,upper1]},
            {name: "Logo 1st tone", def: {folder: 'common/all', color: "Silver"}, unityId: "logo1", colors: [all]},
            {name: "Logo 2nd tone", def: {folder: 'common/all', color: "Silver"}, unityId: "logo2", colors: [all]},
            {name: "Buttons", def: {folder: 'common/all', color: "Silver"}, unityId: "buttons", colors: [buttons]},
            {name: "Rubber Outsole", def: {folder: 'common/all', color: "Clear"}, unityId: "outsole", colors: [rubber]}
        ],
        type2: [
            {
                name: "Midsole",
                def: {folder: 'type2/texture', color: "Army_Camo"},
                unityId: "midsole",
                colors: [all, outsole2]
            },
            {
                name: "Cushion Unit",
                def: {folder: 'common/all', color: "Silver"},
                unityId: "cushion",
                colors: [all]
            },
            {name: "Upper", def: {folder: 'type2/upper', color: "Army_Camo"}, unityId: "upper", colors: [all,upper2]},
            {name: "Logo 1st tone", def: {folder: 'common/all', color: "Silver"}, unityId: "logo1", colors: [all]},
            {name: "Logo 2nd tone", def: {folder: 'common/all', color: "Silver"}, unityId: "logo2", colors: [all]},
            {name: "Rubber Outsole", def: {folder: 'common/all', color: "Clear"}, unityId: "outsole", colors: [rubber]}
        ]
    };

    self.currentShoe = 'type1';
    self.currentElement = null;
    self.currentColor = null;

    var mainHolder = $('#leftMenu .mainSelector ul');
    var subHolder = $('#leftMenu .subSelector ul');
    var mainSelectors = $('#leftMenu .mainSelector ul li');
    var subSelectors = $('#leftMenu .subSelector li');
    var radio = $("input[type=radio]");
    var subElementsData = [];
    var defaults = {};
    //Callback from Unity;
    self.UnityReady = function () {
        $("#leftMenu").show();
        switchUnityType();

        radio.on('click', function (event) {
            selectType(event);
        });

        mainHolder.on('click', 'li', function (event) {
            selectGroup(event);
        });
        subHolder.on('click', 'li', function (event) {
            selectColor(event);
        });
        setDefault();
    };

    function setDefault() {
        if (defaults[self.currentShoe]) {
            return;
        }
        defaults[self.currentShoe]=true;
        _.each(self.data[self.currentShoe], function (el) {
            sendToUnity(self.currentShoe, el.unityId, el.def.folder, el.def.color);
        });
    }

    //Build MainMenu
    function buildMainElements() {
        mainHolder.empty();
        subHolder.empty();
        _.each(self.data[self.currentShoe], function (value) {
            var tpl = '<li id="' + value.unityId + '">' + value.name + '</li>';
            mainHolder.append($(tpl));
        });
    }

    //Build Submenu
    function buildSubElements(event) {
        $(".mainSelector li").removeClass('selected');
        $(event.target).addClass('selected');
        subHolder.empty();
        subElementsData.length = 0;
        var index = 0;
        var groupData = _.findWhere(self.data[self.currentShoe], {unityId: self.currentElement});
        _.each(_.flatten(groupData.colors), function (struct) {
            _.each(struct.variants, function (value) {
                var data = {
                    element: self.currentElement,
                    folder: struct.folder,
                    value: value
                };
                subElementsData[index] = data;

               // var tpl = '<li id="' + index + '">' + value.replace(/_/g, " ") + '</li>';
                var tpl = '<li id="' + index + '"><img src="icons/' + value + '.jpg"/></li>';
                subHolder.append($(tpl));
                index++;
            });
        });
    }

    //Sub Element click Handler
    function selectColor(event) {
        var data = subElementsData[event.target.id];
        self.currentColor = event.target.textContent;
        sendToUnity(self.currentShoe, data.element, data.folder, data.value);
    }

    //Main Element click Handler
    function selectType(event) {
        self.currentShoe = $(event.target).val();
        switchUnityType();
    }

    function switchUnityType() {
        unityInstance.SendMessage('GameController', 'ChangeType', self.currentShoe);
        buildMainElements();
        setDefault();
    }

    //Main Element click Handler
    function selectGroup(event) {
        self.currentElement = event.target.id;
        buildSubElements(event);
    }

    //JS Endpoint to Unity
    function sendToUnity(shoe, element, folder, color) {
        var texture = element + "::textures/" + folder + "/" + color + ".jpg";
        unityInstance.SendMessage('GameController', 'ChangeColors', texture);
        //New Added
        $('#' + element).val(color);
    }
};
