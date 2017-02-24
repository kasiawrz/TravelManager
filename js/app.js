
//add Google Maps (function based on Google documentation)
function initMap() {

    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 50.05, lng: 14.25},
        zoom: 4
    });

    var input = document.getElementById('pac-input');

    input.value = "";
    input.setAttribute('placeholder', 'where do you want to go next?')


    var types = document.getElementById('type-selector');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

    var autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['geocode']
        // types: ['cities']
    });


    autocomplete.bindTo('bounds', map);

    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });

    autocomplete.addListener('place_changed', function() {

        marker.setVisible(false);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }

        console.log(place.place_id, '    placeID?');

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(7);
        }
        marker.setIcon(/** @type {google.maps.Icon} */({
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        }));

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        //returns placeId to get country ISO code later
        placeId = place.place_id;
        return placeId;

        // var address = '';
        // if (place.address_components) {
        //     address = [
        //         (place.address_components[0] && place.address_components[0].short_name || ''),
        //         (place.address_components[1] && place.address_components[1].short_name || ''),
        //         (place.address_components[2] && place.address_components[2].short_name || '')
        //     ].join(' ');
        // }

    });

    // setupClickListener('changetype-all', []);
    // setupClickListener('changetype-establishment', ['establishment']);
    // setupClickListener('changetype-geocode', ['geocode']);
}

//     autocomplete.addListener('place_changed', function () {
//         //  infowindow.close();
//         var place = autocomplete.getPlace();
//
//         if (!place.place_id) {
//             return;
//         }
//     });
//         // geocoder.geocode({'placeId': place.place_id}, function (results, status) {
//         //
//         //     if (status !== 'OK') {
//         //         window.alert('Geocoder failed due to: ' + status);
//         //         return;
//         //     }
//         //     map.setZoom(8);
//         //     map.setCenter(results[0].geometry.location);
//         //     // Set the position of the marker using the place ID and location.
//         //     marker.setPlace({
//         //         placeId: place.place_id,
//         //         location: results[0].geometry.location
//         //     });
//         //
//         //     marker.setVisible(true);
//         //
//         //     return place;
//         // });
//
//         //returns placeId to get country ISO code later
//         placeId = place.place_id;
//         return placeId;
//     };




document.addEventListener("DOMContentLoaded", function() {


    //config for firebase
    var config = {

        apiKey: "AIzaSyBhAUkdhyD5wg48fIlcFB0Fpdyouh27UZI",
        databaseURL: "https://travel-manager-158921.firebaseio.com/",
    };

    var app = firebase.initializeApp(config);

    //set a cookie that allows to identify a user
    if (document.cookie.indexOf('myID') < 0 ) {
        console.log('no cookie yet');

        var createUser = app.database().ref('trips/'),
            user = ({
                'name' : 'you r a new user',
            });

        createUser.push(user);
        var userId = createUser.push(user).key;
        document.cookie = 'myID = ' + userId + '; expires = Thu, 4 Aug 2050 12:00:00 UTC';

    } else {
        console.log('Ive been here, I already have a cookie');
        var userId = '',
            startHere = document.cookie.indexOf('myID')+5;

        for ( var i = startHere; i < (startHere+20); i++) {
            userId += document.cookie[i]
        }
        console.log(userId);

    }

    //get info about planned trips
    var myTrips = app.database().ref('trips/'+userId);

    myTrips.once("value", function(res) {

        for ( myKey in res.val()){

            var destVal = res.val()[myKey].destination,
                imgAtrr = res.val()[myKey].picUrl,
                toSeeVal = res.val()[myKey].toSee;

            //    thisId = res.val()[myKey].key;   WHAT IS THIS???!!!!

            //var trips is an item key from firebase
            createAtriclesWithTrips(destVal, imgAtrr, toSeeVal, myKey);
        }

    }, function (err) {

        console.log("Error: " + err.code);

    });

    //set fn
    function createAtriclesWithTrips(destVal, imgAtrr, toSeeVal, tripID){

        //createNewTrip(); instead:
        //clone trip divs template
        var singleTrip = document.querySelector('.trip'),
            cloned = singleTrip.cloneNode(true);

        cloned.setAttribute('id', tripID);

        document.querySelector('.boxes').appendChild(cloned);
        //insert data
        cloned.querySelector('h2').innerText = destVal;
        cloned.querySelector('img').setAttribute('src', imgAtrr);

        if (Array.isArray(toSeeVal)) {

            for (var i = 0; i < toSeeVal.length; i++) {
                cloned.querySelector('.info').innerHTML += toSeeVal[i] + '<br>';
            }
        }
        else {
            cloned.querySelector('.info').innerText = toSeeVal;
        }

        TripBoxListener();
    }

    //
    var welcomeBox = document.querySelector('.welcomeBox'),
        formClass = document.querySelector('.form'),
        cover = document.querySelector('.cover');


    //scroll to plenned trips
    welcomeBox.addEventListener("click", seeTrips);

    function seeTrips(){
        document.querySelector('.boxes').style.display = 'flex';
        window.scrollTo(0, window.innerHeight);
    }

    function TripBoxListener() {
        //centre one trip window
        var tripBox = document.querySelectorAll('.trip'); //table

        for (var i = 0; i < tripBox.length; i++) {

            tripBox[i].addEventListener('click', centreTrip);
            // tripBox[i].addEventListener("mouseEnter", changeCursos());
        }
    }

    function centreTrip(e){

        //clicked div gets a new class to centre it
        (this).className += ' centre';

        //sector with background gets visible
        cover.style.display = 'flex';


        //add icons and eventsListeners on the div's top
        var doneIcon = (this).querySelector('.done'),
            exitIcon = (this).querySelector('.exit');

        // exitIcon.addEventListener('click', function(){
        //     (this).parentNode.style.border = '2px solid yellowgreen';
        //     console.log((this).parentNode);
        // });

        // eListener to del the trip
        var delBtn = this.querySelector('.deleteBtn'),
            editBtn = this.querySelector('.editBtn'),
            editH2 = this.querySelector('h2'),
            editInfo = this.querySelector('.info');

        delBtn.addEventListener('click', function(){
            var parent = delBtn.parentNode,
                myId = parent.getAttribute('id');

            console.log(myId, ' my Id');

            parent.parentNode.removeChild(parent);

            app.database().ref('trips/'+userId+'/'+myId).remove();

            cover.style.display = 'none';
        });

        editBtn.addEventListener('click', function(){
            var parent = this.parentNode;

            console.log('before IF');

            if (editH2.getAttribute('contenteditable') === 'true') {

                console.log('was truly editable');

                //send updates to server
            /*    app.database().ref('trips/'+userId+'/'+myId).update(updatedObj);

                    updatedObj = {
                        'destination' : editH2.innerText,
                        // 'picUrl': tripImg.value,
                        'toSee': editInfo.innerText
                    };
                */
                editH2.setAttribute('contenteditable', 'false');
                editInfo.setAttribute('contenteditable', 'false');

                this.innerText = 'edit';

                parent.addEventListener('click', closeWindow);

            } else {

                console.log('wasn;t editable');

                editH2.setAttribute('contenteditable', 'true');
                editInfo.setAttribute('contenteditable', 'true');

                //create new input to be able to change pic url
                // var input = document.createElement('input');
                // input.setAttribute('placeholder', 'do you want to change your photo? pase new link here');
                // parent.insertBefore(input, parent.querySelector('.info'));

                this.innerText = 'commit';

                parent.removeEventListener('click', closeWindow);

            }

        });



        function changePlans(){


            this.removeEventListener('click', changePlans);


            e
            console.log(editH2, editInfo);

            (this).parentNode.removeEventListener('click', closeWindow);
           // (this).parentNode.style.cursor = 'not-allowed';  KURSOR USTAW
            console.log('THIS  ', this);
            this.innerText = 'commit';


           /* var allBoxElem = this.parentNode.children;

            while (allBoxElem =)
            for (var i = 0; i < (allBoxElem.length-2); i++) {
                allBoxElem[i].setAttribute('contenteditable', 'true');
                console.log(allBoxElem[i]);
            }*/
        }

        function commitChanges() {

            this.removeEventListener('click', commitChanges);

            editH2.setAttribute('contenteditable', 'false');
            editInfo.setAttribute('contenteditable', 'false');
            this.innerText = 'edit';

            this.addEventListener('click', changePlans);
            this.parentNode.addEventListener('click', closeWindow);

        }

        (this).addEventListener('click', closeWindow, true);
        // editBtn.removeEventListener('click', closeWindow); nie działa :(

        (this).removeEventListener('click', centreTrip);
    }

    function closeWindow(){

      //  var parent = (this).parentNode.parentNode;

        this.className = 'trip';  //removing class 'centre' -> closing the window
        this.addEventListener('click', centreTrip);
        cover.style.display = 'none';

    }


    //getting input value as 'destination' in the form
    var mapInput = document.querySelector('#pac-input');

    mapInput.addEventListener("focusout", startForm);

    function startForm(){

       // console.log(placeId, '  place ID??');


        formClass.style.display = 'flex';

        destination.value = mapInput.value;
        window.scrollTo(0, document.body.offsetHeight /*+ 0.5 * window.innerHeight*/ /*- window.innerHeight*/);
        console.log(form.offsetTop);
        console.log(document.body.offsetHeight, '  document.body.offsetHeight');

    }

    //FORM SETTINGS
    var form = document.querySelector('form'),
        btn = form.lastElementChild,
        destination = form.querySelector('input[name="destination"]'),
        toDo = form.querySelector('input[name="toDo"]'),
        //section with created plans
        boxes = document.querySelector('.boxes');

    toDo.addEventListener('focusout', checkToDoVal);

    function checkToDoVal() {

        if (this.value.length > 4) {
            console.log(this.value.length, '   dl');
            cloneInput();
            this.removeEventListener('focusout', checkToDoVal);
        }
    }

    function cloneInput(){
        console.log('im leaving');
        newToDo = toDo.cloneNode(true); // nie THIS :(
        newToDo.value = "";
        newToDo.setAttribute('placeholder', 'what else?');
        newToDo.setAttribute('class', 'toDel');
        newToDo.addEventListener('focusout', checkToDoVal);
        form.insertBefore(newToDo, document.querySelector('form').lastElementChild);
    };

    btn.addEventListener('click', submit);

    function submit(e) {

        //block page reloading
        e.preventDefault();

        var tripImg = form.querySelector('input[name="tripImg"]'),
            toDoAll = document.querySelectorAll('input[name="toDo"]');

        //putting all to Do inputs into one array
        var toDoArr = [];

            for (var i = 0; i < toDoAll.length; i++) {

                //checking if any 'to Do' imput is empty
                if (toDoAll[i].value !== "") {
                    toDoArr.push(toDoAll[i].value);
                } else {
                    console.log(this, '  i was empty');
                }
            }


       // sendData();
        var trips = app.database().ref('trips/'+userId),
            obj = {
                'destination' : destination.value,
                'picUrl': tripImg.value,
                'toSee': toDoArr
            };


        var res = trips.push(obj);

        var newId = res.key;


        //display section with planned trips
        boxes.style.display = 'flex';

        createAtriclesWithTrips(obj.destination, obj.picUrl, obj.toSee, newId);

        //delete additional toDo inputs
        var toDel = document.querySelectorAll('.toDel');

        for (var i = 0; i < toDel.length; i ++) {
            form.removeChild(toDel[i]);
        }

        destination.value = "";
        tripImg.value = "";
        toDo.value = "";

        //bring back the event listener
        toDo.addEventListener('focusout', checkToDoVal);

        //hiding the form section
        formClass.style.display = 'none';

        window.scrollTo(0, document.body.offsetHeight - window.innerHeight);

        //add country to your list to display it on the map
        //getting ISO country code from Google place API
        //



        // var APIurl = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=' + placeId + '&key=AIzaSyBhAUkdhyD5wg48fIlcFB0Fpdyouh27UZI';
        //
        // fetch(APIurl)
        //     .then(response => response.json())
        //     .then(getCountryCode)
        //     .catch(error => console.error(error.message));
        //
        // function getCountryCode(e) {
        //     console.log(e);
        // }


        //countriesList +=;
    }

    function createNewTrip () {

        //clone trip divs template
        var singleTrip = document.querySelector('.trip'),
            cloned = singleTrip.cloneNode(true);

        document.querySelector('.boxes').appendChild(cloned);

        return cloned;
    }


});


