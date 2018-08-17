const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
firestore.settings(settings);

const firebaseStore = new function () { // database
    // Initialize Cloud Firestore through Firebase
    const db = firebase.firestore();

    const createUser = (user) => {
        const data = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date().getTime(),
            signAt: new Date().getTime(),
        };

        db.collection("users").doc(user.uid).set(data)
            .then(function () {
                console.log("Document successfully written!");
            })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });

    };

    this.signInUser = (user) => {

        const userRef = db.collection("users").doc("user.uid");

        userRef.get().then(function(doc) {
            if (doc.exists) {
                const data = {
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    signAt: new Date().getTime(),
                };

                userRef.update(data)
                    .then(function () {
                        console.log("Document successfully updated!");
                    })
                    .catch(function (error) {
                        // The document probably doesn't exist.
                        console.error("Error updating document: ", error);
                    });
            } else {
                createUser(user);
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });

    };


};

const firebaseStorage = new function () {

};

/**
 * firebase 관련 API 기능을 담은 객체
 */
const firebaseApi = new function () {

    const provider = new firebase.auth.GoogleAuthProvider();

    let signInListener = null;

    function setSignInListener (callback) {
        signInListener = callback;
    }

    this.signIn = () => {
        firebase.auth().signInWithPopup(provider).then(function (result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // ...
            console.log('login');
            firebaseStore.signInUser(user);

            if (signInListener !== null)
                signInListener();

        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
            console.log(errorCode);
            console.log(errorMessage);
        });
    };

    this.signOut = () => {
        firebase.auth().signOut().then(function () {
            // Sign-out successful.
        }).catch(function (error) {
            // An error happened.
            console.log(error);
        });
    };


};